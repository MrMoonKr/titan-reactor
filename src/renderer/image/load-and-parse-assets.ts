import { promises as fsPromises } from "fs";
import path from "path";
import fileExists from "common/utils/file-exists";
import { loadDATFiles } from "common/bwdat/load-dat-files";
import { AssetTextureResolution, AnimAtlas, GltfAtlas, Settings, UnitTileScale } from "common/types";
import electronFileLoader from "common/utils/electron-file-loader";

import {
    openCascStorage,
    readCascFile,
} from "common/utils/casclib";

import { loadAnimAtlas, loadGlbAtlas, parseAnim } from ".";

import gameStore from "@stores/game-store";
import processStore, { Process } from "@stores/process-store";
import loadSelectionCircles from "./load-selection-circles";
import generateIcons from "./generate-icons/generate-icons";
import * as log from "../ipc/log"
import { loadEnvironmentMap } from "./environment/env-map";
import { calculateImagesFromUnitsIscript } from "../utils/images-from-iscript";
import range from "common/utils/range";
import { imageTypes, unitTypes } from "common/enums";
import { CubeTexture, CubeTextureLoader } from "three";
import settingsStore from "@stores/settings-store";

const genFileName = (i: number, prefix = "") => `${prefix}anim/main_${`00${i}`.slice(-3)}.anim`;


export default async (settings: Settings) => {

    processStore().start(Process.AtlasPreload, 999);

    electronFileLoader((file: string) => {
        if (file.includes(".glb") || file.includes(".hdr") || file.includes(".png") || file.includes(".exr")) {
            return fsPromises.readFile(file);
        } else {
            return readCascFile(file);
        }
    });

    await openCascStorage(settings.directories.starcraft);

    log.verbose("@load-assets/dat");
    const bwDat = await loadDATFiles(readCascFile);

    log.verbose("@load-assets/images");
    const sdAnimBuf = await readCascFile("SD/mainSD.anim");
    const sdAnim = parseAnim(sdAnimBuf);

    const selectionCirclesHD = await loadSelectionCircles(UnitTileScale.HD);

    const envEXRAssetFilename = path.join(
        settings.directories.assets,
        "envmap.exr"
    )
    const envMapFilename = settings.assets.enable3dAssets && await fileExists(envEXRAssetFilename) ? envEXRAssetFilename : `${__static}/envmap.hdr`;
    const envMap = await loadEnvironmentMap(envMapFilename);

    const {
        resourceIcons,
        cmdIcons,
        raceInsetIcons,
        workerIcons,
        arrowIcons,
        hoverIcons,
        dragIcons,
        wireframeIcons,
    } = await generateIcons(readCascFile);

    const refId = (id: number) => {
        if (sdAnim?.[id]?.refId !== undefined) {
            return sdAnim[id].refId!;
        }
        return id;
    };

    const loadingHD2 = new Set();
    const loadingHD = new Set();

    const loadImageAtlas = (atlases: (AnimAtlas | GltfAtlas)[]) => async (imageId: number, res: UnitTileScale) => {
        const refImageId = refId(imageId);
        const glbFileName = path.join(
            settings.directories.assets,
            `00${refImageId}`.slice(-3) + ".glb"
        )
        const glbFileExists = settings.assets.enable3dAssets ? await fileExists(glbFileName) : false;

        if (res === UnitTileScale.HD || glbFileExists) {
            if (loadingHD.has(refImageId)) {
                return;
            } else {
                loadingHD.add(refImageId);
                loadingHD.add(imageId);
            }
        } else if (res === UnitTileScale.HD2) {
            if (loadingHD2.has(refImageId)) {
                return;
            } else {
                loadingHD2.add(refImageId);
                loadingHD2.add(imageId);
            }
            // hd2 loading pass will have loaded the model
        }
        let atlas: AnimAtlas | GltfAtlas;


        const loadAnimBuffer = () => readCascFile(genFileName(refImageId, res === UnitTileScale.HD2 ? "HD2/" : ""));
        const scale = res === UnitTileScale.HD2 ? UnitTileScale.HD2 : UnitTileScale.HD;

        const imageDat = bwDat.images[imageId];
        if (glbFileExists) {
            log.verbose(`loading glb  ${glbFileName}`);
            atlas = await loadGlbAtlas(
                glbFileName,
                loadAnimBuffer,
                imageDat,
                UnitTileScale.HD,
                bwDat.grps[imageDat.grp],
                envMap
            );
        } else {
            atlas = await loadAnimAtlas(
                loadAnimBuffer,
                imageDat,
                scale,
                bwDat.grps[imageDat.grp],
            )

            // add mipmaps to HD
            if (atlases[imageId]?.unitTileScale === UnitTileScale.HD2 && atlas.unitTileScale === UnitTileScale.HD) {
                const hd2 = atlases[imageId];
                atlas.diffuse.mipmaps.push(hd2.diffuse.mipmaps[0]);

                if (hd2.teammask) {
                    atlas.teammask?.mipmaps.push(hd2.teammask.mipmaps[0]);
                }
            }
        };
        atlases[imageId] = atlas;
        atlases[refImageId] = atlas;
    }

    const grps: AnimAtlas[] = [];
    log.info(`@load-assets/atlas: ${settings.assets.images}`);

    const loadImageAtlasGrp = loadImageAtlas(grps);

    if (settings.assets.preload) {
        const omit = [unitTypes.khaydarinCrystalFormation, unitTypes.protossTemple, unitTypes.xelNagaTemple];
        const preloadImageIds = calculateImagesFromUnitsIscript(bwDat, [...range(0, 172).filter(id => !omit.includes(id)), ...[unitTypes.vespeneGeyser, unitTypes.mineral1, unitTypes.mineral2, unitTypes.mineral3, unitTypes.darkSwarm], ...range(220, 228)])

        processStore().start(Process.AtlasPreload, preloadImageIds.length);
        for (const id of preloadImageIds) {
            processStore().increment(Process.AtlasPreload);
            await loadImageAtlasGrp(id, UnitTileScale.HD2);
        }
    }

    await loadImageAtlasGrp(imageTypes.warpInFlash, settings.assets.images === AssetTextureResolution.SD ? UnitTileScale.SD : UnitTileScale.HD);

    const loader = new CubeTextureLoader();
    const rootPath = path.join(__static, "skybox", "sparse");
    loader.setPath(rootPath);

    const skyBox = await new Promise(res => loader.load([
        "right.png",
        "left.png",
        "top.png",
        "bot.png",
        "front.png",
        "back.png",
    ], res)) as CubeTexture;

    gameStore().setAssets({
        bwDat,
        grps,
        selectionCirclesHD,
        gameIcons: resourceIcons,
        cmdIcons,
        raceInsetIcons,
        workerIcons,
        arrowIcons,
        hoverIcons,
        dragIcons,
        wireframeIcons,
        envMap,
        loadImageAtlas: loadImageAtlasGrp,
        skyBox,
        refId
    });
    processStore().complete(Process.AtlasPreload);
};

export const loadImageAtlasDirect = async (imageId: number, image3d: boolean) => {
    const assets = gameStore().assets!;
    const settings = settingsStore().data!;

    const refImageId = assets.refId(imageId);
    const glbFileName = path.join(
        settings.directories.assets,
        `00${refImageId}`.slice(-3) + ".glb"
    )
    const glbFileExists = image3d ? await fileExists(glbFileName) : false;

    const loadAnimBuffer = () => readCascFile(genFileName(refImageId, ""));

    const imageDat = assets.bwDat.images[imageId];
    if (glbFileExists) {
        log.verbose(`loading glb  ${glbFileName}`);
        return await loadGlbAtlas(
            glbFileName,
            loadAnimBuffer,
            imageDat,
            UnitTileScale.HD,
            assets.bwDat.grps[imageDat.grp],
            assets.envMap
        );
    } else {
        return await loadAnimAtlas(
            loadAnimBuffer,
            imageDat,
            UnitTileScale.HD,
            assets.bwDat.grps[imageDat.grp],
        )
    }
}