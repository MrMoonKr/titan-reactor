import { UnitTileScale } from "../../../renderer/core";
import { CompressedTexture } from "three";

import { ImageDAT } from "../../bwdat/core/images-dat";
import { AnimDds, AnimSprite, GrpFrameType, GRPInterface } from "../../types";
import { parseAnim, createDDSTexture } from "../formats";

const getBufDds = (buf: Buffer, { ddsOffset, size }: AnimDds) =>
  buf.slice(ddsOffset, ddsOffset + size);

// Load anim files as textures and frames
export class Anim implements GRPInterface {
  unitTileScale: UnitTileScale = UnitTileScale.HD;
  textureWidth = 0;
  textureHeight = 0;
  spriteWidth = 0;
  spriteHeight = 0;
  imageIndex = -1;
  frames: GrpFrameType[] = [];
  diffuse?: CompressedTexture;
  teamcolor?: CompressedTexture;

  async load({
    readAnim,
    imageDef,
    scale
  }: {
    readAnim: () => Promise<Buffer>;
    imageDef: ImageDAT;
    scale: Exclude<UnitTileScale, "SD">;
  }) {
    this.imageIndex = imageDef.index;

    const buf = await readAnim();
    const [sprite] = parseAnim(buf) as AnimSprite[];

    if (!sprite.maps) {
      throw new Error("No sprite maps");
    }

    if (sprite.maps.diffuse) {
      const ddsBuf = getBufDds(buf, sprite.maps.diffuse);
      this.diffuse = await createDDSTexture(ddsBuf);
    }

    if (sprite.maps.teamcolor) {
      const ddsBuf = getBufDds(buf, sprite.maps.teamcolor);
      this.teamcolor = await createDDSTexture(ddsBuf);
    }

    this.frames = sprite.frames;
    this.textureWidth = sprite.maps.diffuse.width;
    this.textureHeight = sprite.maps.diffuse.height;
    this.spriteWidth = sprite.w;
    this.spriteHeight = sprite.h;
    this.unitTileScale = scale;

    // if (anim.sprite.maps.bright) {
    //   const ddsBuf = getBuf(anim.sprite.maps.bright);
    //   this.brightness = this._loadDDS(ddsBuf);
    // }

    // if (anim.sprite.maps.normal) {
    //   const ddsBuf = getBuf(anim.sprite.maps.normal);
    //   this.normal = this._loadDDS(ddsBuf);
    // }

    // if (anim.sprite.maps.specular) {
    //   const ddsBuf = getBuf(anim.sprite.maps.specular);
    //   this.specular = this._loadDDS(ddsBuf);
    // }

    // if (anim.sprite.maps.ao_depth) {
    //   const ddsBuf = getBuf(anim.sprite.maps.ao_depth);
    //   this.ao_depth = this._loadDDS(ddsBuf);
    // }
    return this;
  }

  dispose() {
    this.diffuse && this.diffuse.dispose();
    this.teamcolor && this.teamcolor.dispose();
  }
}
export default Anim;
