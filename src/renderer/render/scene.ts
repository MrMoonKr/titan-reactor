import path from "path";
import {
  CubeTextureLoader,
  DirectionalLight,
  Group,
  HemisphereLight,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Scene as ThreeScene,
  Texture,
} from "three";

import { TerrainInfo, TerrainQuartile } from "common/types";
import Janitor from "@utils/janitor";


function sunlight(mapWidth: number, mapHeight: number) {
  const light = new DirectionalLight(0xffffff, 2);
  light.position.set(-32, 13, -26);
  light.target = new Object3D();
  light.castShadow = true;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 200;
  light.shadow.bias = 0.0001;

  const sizeW = mapWidth * 0.75;
  const sizeh = mapHeight * 0.75;

  light.shadow.camera.left = -sizeW;
  light.shadow.camera.right = sizeW;
  light.shadow.camera.top = sizeh;
  light.shadow.camera.bottom = -sizeh;
  light.shadow.mapSize.width = 512 * 4;
  light.shadow.mapSize.height = 512 * 4;
  light.name = "sunlight";
  return light;
}

export class Scene extends ThreeScene {
  #mapWidth: number;
  #mapHeight: number;
  #janitor: Janitor;
  #skybox: Texture;
  #borderTiles: Group;

  constructor({
    mapWidth,
    mapHeight,
    terrain,
  }: Pick<TerrainInfo, "mapWidth" | "mapHeight" | "terrain" | "tileset">) {
    super();
    this.#mapHeight = mapHeight;
    this.#mapWidth = mapWidth;

    this.#janitor = new Janitor();
    this.addLights();
    this.addTerrain(terrain);
    this.#skybox = this.skybox("sparse");

    this.#borderTiles = new Group();
    this.add(this.#borderTiles);

    const tx = terrain.userData.tilesX;
    const ty = terrain.userData.tilesY;
    const qw = terrain.userData.quartileWidth;
    const qh = terrain.userData.quartileHeight;

    const createMesh = (q: TerrainQuartile, edgeMaterial: Material) => {
      const mesh = new Mesh();
      mesh.geometry = q.geometry;
      mesh.material = edgeMaterial;
      mesh.position.copy(q.position);
      return mesh;
    }

    for (let i = 0; i < terrain.children.length; i++) {
      const q = terrain.children[i];
      const qx = q.userData.qx;
      const qy = q.userData.qy;

      const edgeMaterial = new MeshBasicMaterial({
        map: q.material.map
      });
      edgeMaterial.transparent = true;
      edgeMaterial.opacity = 0.5;

      if (qx === 0 && qy === 0) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y + qh);
        mesh.position.setX(mesh.position.x - qw);
        mesh.scale.setY(-1);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }

      if (qx === tx - 1 && qy === 0) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y + qh);
        mesh.position.setX(mesh.position.x + qw);
        mesh.scale.setY(-1);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }

      if (qx === tx - 1 && qy === ty - 1) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y - qh);
        mesh.position.setX(mesh.position.x + qw);
        mesh.scale.setY(-1);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }

      if (qx === 0 && qy === ty - 1) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y - qh);
        mesh.position.setX(mesh.position.x - qw);
        mesh.scale.setY(-1);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }

      if (qy === 0) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y + qh);
        mesh.scale.setY(-1);
        this.#borderTiles.add(mesh);
      }
      if (qx === 0) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setX(mesh.position.x - qw);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }
      if (qy === ty - 1) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y - qh);
        mesh.scale.setY(-1);
        this.#borderTiles.add(mesh);
      }
      if (qx === tx - 1) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setX(mesh.position.x + qw);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }

    }

    this.#borderTiles.rotation.x = -Math.PI / 2;
    this.#borderTiles.matrixAutoUpdate = false;
    this.#borderTiles.updateMatrix();
  }

  setBorderTileOpacity(opacity: number) {
    this.#borderTiles.children.forEach((mesh) => {
      ((mesh as Mesh).material as MeshBasicMaterial).opacity = opacity;
    });
  }

  private addLights() {
    const hemilight = new HemisphereLight(0xffffff, 0xffffff, 1);
    hemilight.name = "hemilight";

    const lights = [
      hemilight
      , sunlight(this.#mapWidth, this.#mapHeight)
    ]
    lights.forEach(light => {
      this.add(light)
    });

    this.userData.hemilight = hemilight;
    this.userData.sunlight = sunlight;
  }

  skybox(key: string) {
    const loader = new CubeTextureLoader();
    const rootPath = path.join(__static, "skybox", key);
    loader.setPath(rootPath);

    const textureCube = loader.load([
      'right.png',
      'left.png',
      'top.png',
      'bot.png',
      'front.png',
      'back.png',
    ]);

    return textureCube;
  }

  disableSkybox() {
    this.background = null;
  }

  enableSkybox() {
    this.background = this.#skybox;
  }

  enableTiles() {
    // this.#tiles.visible = true;
  }

  disableTiles() {
    // this.#tiles.visible = false;
  }

  addTerrain(
    terrain: Object3D
  ) {
    this.userData.terrain = terrain;
    this.add(terrain);
    this.#janitor.object3d(terrain);
  }

  get terrain() {
    return this.userData.terrain;
  }

  dispose() {
    this.#skybox.dispose();
    this.#janitor.mopUp();
  }
}
export default Scene;
