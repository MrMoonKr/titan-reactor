import { CMDS } from "@process-replay/commands/commands";
import CommandsStream from "@process-replay/commands/commands-stream";
import { Replay } from "@process-replay/parse-replay";
import processStore, { Process } from "@stores/process-store";
import { calculateImagesFromSpritesIscript } from "@utils/images-from-iscript";
import Chk from "bw-chk";

export const preloadMapUnitsAndSprites = async (map: Chk, replay?: Replay) => {

    const preloadCommandUnits = new Set<number>();

    if (replay) {
        const preloadCommands = new CommandsStream(replay.rawCmds, replay.stormPlayerToGamePlayer);
        const preloadCommandTypes = [CMDS.TRAIN.id, CMDS.UNIT_MORPH.id, CMDS.BUILDING_MORPH.id, CMDS.BUILD.id];

        for (const command of preloadCommands.generate()) {
            if (typeof command !== "number") {
                if (preloadCommandTypes.includes(command.id)) {
                    preloadCommandUnits.add(command.unitTypeId!);
                }
            }
        }
    }

    const unitSprites = new Set(map.units.map(u => u.sprite).filter(s => Number.isInteger(s)) as number[]);
    const allSprites = [...preloadCommandUnits, ...unitSprites, ...new Set(map.sprites.map(s => s.spriteId))];
    const allImages = calculateImagesFromSpritesIscript(assets.bwDat, allSprites);

    processStore().start(Process.AtlasPreload, allImages.length);

    await Promise.all(allImages.map((imageId) => assets.loadImageAtlasAsync(imageId, true).then(() => processStore().increment(Process.AtlasPreload))));
    processStore().complete(Process.AtlasPreload);


}