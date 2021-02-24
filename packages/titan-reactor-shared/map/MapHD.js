import {
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  Vector3,
  PlaneBufferGeometry,
  Mesh,
  CanvasTexture,
  CompressedTexture,
  LinearFilter,
  ClampToEdgeWrapping,
  sRGBEncoding,
} from "three";

import { DDSLoader } from "titan-reactor-shared/image/DDSLoader";
// import { DDSLoader } from "./TileDDSLoader";

const ddsLoader = new DDSLoader();

const loadHdTile = (buf) => {
  const hdTexture = new CompressedTexture();
  const texDatas = ddsLoader.parse(buf, false);

  hdTexture.mipmaps = texDatas.mipmaps;
  hdTexture.image.width = texDatas.width;
  hdTexture.image.height = texDatas.height;

  hdTexture.format = texDatas.format;
  hdTexture.minFilter = LinearFilter;
  hdTexture.magFilter = LinearFilter;
  hdTexture.wrapT = ClampToEdgeWrapping;
  hdTexture.wrapS = ClampToEdgeWrapping;
  hdTexture.needsUpdate = true;

  return hdTexture;
};

const creepOffset = [
  [0.5, 0.25],
  [0.5, 0.25],
  [0.5, 0.25],
  [0.5, 0.25],
  [0.25, 0.5],
  [0.5, 0.5],
  [0.5, 1 - 0.171875],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 1 - 0.25],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [1 - 0.171875, 0.5],
  [0.5, 0.5],
  [0.5, 1 - 0.25],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 1 - 0.25],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [0.5, 0.5],
];

export default class MapHD {
  static renderTilesToQuartiles(
    renderer,
    mapWidth,
    mapHeight,
    { hdTiles, mapTilesData }
  ) {
    const mapQuartiles = [];

    const quartileStrideW = mapWidth / 16;
    const quartileStrideH = mapHeight / 16;
    const quartileWidth = Math.floor(mapWidth / quartileStrideW);
    const quartileHeight = Math.floor(mapHeight / quartileStrideH);
    const ortho = new OrthographicCamera(
      -quartileWidth / 2,
      quartileWidth / 2,
      -quartileHeight / 2,
      quartileHeight / 2
    );
    ortho.position.y = quartileWidth;
    ortho.lookAt(new Vector3());
    const startTime = Date.now();

    const hdCache = new Map();
    renderer.setSize(quartileWidth * 128, quartileHeight * 128);

    const quartileScene = new Scene();
    const plane = new PlaneBufferGeometry();
    const mat = new MeshBasicMaterial({});
    const mesh = new Mesh(plane, mat);

    for (let qx = 0; qx < quartileStrideW; qx++) {
      mapQuartiles[qx] = [];
      for (let qy = 0; qy < quartileStrideH; qy++) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = quartileWidth * 128;
        canvas.height = quartileHeight * 128;

        for (let x = 0; x < quartileWidth; x++) {
          for (let y = 0; y < quartileHeight; y++) {
            const my = y + qy * quartileHeight;
            const mx = x + qx * quartileWidth;
            const tile = mapTilesData[my * mapWidth + mx];
            if (hdTiles[tile]) {
              const texture = hdCache.get(tile) || loadHdTile(hdTiles[tile]);
              if (!hdCache.has(tile)) {
                hdCache.set(tile, texture);
              }
              mat.map = texture;
              mat.needsUpdate = true;
              mesh.position.x = x - quartileWidth / 2 + 0.5;
              mesh.position.z = y - quartileHeight / 2 + 0.5;
              mesh.rotation.x = Math.PI / 2;
              quartileScene.add(mesh);
              renderer.render(quartileScene, ortho);
              quartileScene.remove(mesh);
            }
          }
        }
        ctx.drawImage(renderer.domElement, 0, 0);
        mapQuartiles[qx][qy] = new CanvasTexture(canvas);
        mapQuartiles[qx][qy].encoding = sRGBEncoding;
        mapQuartiles[qx][qy].anisotropy = 16;
        mapQuartiles[qx][qy].flipY = false;
      }
    }
    console.log("maphd elapsed", Date.now() - startTime);

    mat.dispose();
    hdCache.forEach((t) => t.dispose());

    return {
      mapQuartiles,
      quartileHeight,
      quartileStrideH,
      quartileStrideW,
      quartileWidth,
    };
  }

  static renderCreepTexture(renderer, creepGrp) {
    const size = Math.ceil(Math.sqrt(creepGrp.length));
    const width = size;
    const height = size;
    const ortho = new OrthographicCamera(
      -width / 2,
      width / 2,
      -height / 2,
      height / 2
    );
    ortho.position.y = width;
    ortho.lookAt(new Vector3());

    renderer.setSize(width * 128, height * 128);

    const scene = new Scene();
    const plane = new PlaneBufferGeometry();
    const mat = new MeshBasicMaterial({});
    const mesh = new Mesh(plane, mat);
    mesh.rotation.x = Math.PI / 2;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width * 128;
    canvas.height = height * 128;

    for (let i = 0; i < creepGrp.length; i++) {
      const x = i % width;
      const y = Math.floor(i / width);
      const grp = creepGrp[i];
      const texture = loadHdTile(grp.dds);

      mat.map = texture;
      mat.needsUpdate = true;
      mesh.scale.set(grp.w / 128, grp.h / 128, 1);
      mesh.position.x = x - width / 2 + grp.w / 256;
      mesh.position.z = y - height / 2 + grp.h / 256;
      scene.add(mesh);
      renderer.render(scene, ortho);
      scene.remove(mesh);
    }

    ctx.drawImage(renderer.domElement, 0, 0);
    const texture = new CanvasTexture(canvas);
    texture.encoding = sRGBEncoding;
    texture.anisotropy = 1;
    texture.flipY = true;

    mat.dispose();

    return { texture, width, height };
  }
}
