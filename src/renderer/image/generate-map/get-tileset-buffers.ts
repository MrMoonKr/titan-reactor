import { readCascFile } from "common/utils/casclib";
import { TilesetBuffers } from "common/types";

export const getTilesetBuffers = async (
  tileset: number,
  tilesBuffer: Buffer
): Promise<TilesetBuffers> => {
  const tilesets = [
    "badlands",
    "platform",
    "install",
    "ashworld",
    "jungle",
    "desert",
    "ice",
    "twilight",
  ];

  let mapTiles;
  //hitchhiker has odd length buffer
  if (tilesBuffer.buffer.byteLength % 2 === 1) {
    const tiles = Buffer.alloc(tilesBuffer.byteLength + 1);
    tilesBuffer.copy(tiles);
    mapTiles = new Uint16Array(
      tiles.buffer,
      tiles.byteOffset,
      tiles.byteLength / Uint16Array.BYTES_PER_ELEMENT
    );
  } else {

    mapTiles = new Uint16Array(
      tilesBuffer.buffer,
      tilesBuffer.byteOffset,
      tilesBuffer.byteLength / Uint16Array.BYTES_PER_ELEMENT
    );

  }

  const tilesetName = tilesets[tileset];
  const tilegroupBuf = await readCascFile(`TileSet/${tilesetName}.cv5`);
  const tilegroupU16 = new Uint16Array(tilegroupBuf.buffer);

  const megatiles = new Uint32Array(
    (await readCascFile(`TileSet/${tilesetName}.vx4ex`)).buffer
  );
  const minitilesFlags = new Uint16Array(
    (await readCascFile(`TileSet/${tilesetName}.vf4`)).buffer
  );
  const minitiles = new Uint8Array(
    (await readCascFile(`TileSet/${tilesetName}.vr4`)).buffer
  );
  const palette = new Uint8Array(
    (await readCascFile(`TileSet/${tilesetName}.wpe`)).buffer
  ).slice(0, 1024);

  let hdTiles, creepGrpHD;

  const creepGrpSD = await readCascFile(`TileSet/${tilesetName}.grp`);

  hdTiles = await readCascFile(`TileSet/${tilesetName}.dds.vr4`);
  creepGrpHD =
    await readCascFile(`TileSet/${tilesetName}.dds.grp`);

  const waterNormal1 = await readCascFile(`effect/water_normal_1.dds.grp`);
  const waterNormal2 = await readCascFile(`effect/water_normal_2.dds.grp`);
  const noise = await readCascFile(`effect/noise.DDS`);

  const waterMask = await readCascFile(`TileSet/${tilesetName}_mask.dds.grp`);
  const tileMask = await readCascFile(`TileSet/${tilesetName}.tmsk`);

  return {
    mapTiles,
    megatiles,
    minitilesFlags,
    minitiles,
    palette,
    tileset,
    hdTiles,
    tilegroupU16,
    tilegroupBuf,
    creepGrpSD,
    creepGrpHD,
    waterMask,
    waterNormal1,
    waterNormal2,
    noise,
    tileMask
  };
};
