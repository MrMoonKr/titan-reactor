import {
  Mesh,
  SphereBufferGeometry,
  MeshStandardMaterial,
  Group,
  AxesHelper,
  Vector3,
  DefaultLoadingManager,
  Quaternion,
  Euler,
  Matrix4,
  Color,
  PositionalAudio,
  AudioLoader,
} from "three";
import { disposeMesh } from "../utils/meshes/dispose";
import { IScriptRunner } from "./IScriptRunner";
import { path } from "ramda";
import { iscriptHeaders as headers } from "../../common/bwdat/iscriptHeaders";

const red = new Color(0x990000);
const green = new Color(0x009900);
const white = new Color(0x999999);

export class ReplayUnits {
  constructor(
    bwDat,
    renderUnit,
    getTerrainY,
    audioListener,
    audioPool = {},
    fileAccess,
    loadingManager = DefaultLoadingManager
  ) {
    this.units = new Group();
    this.deadUnits = [];
    this.getTerrainY = getTerrainY;
    this.shear = new Vector3(0, 0, 0);
    this.bwDat = bwDat;
    this.audioListener = audioListener;
    this.loadingManager = loadingManager;
    // more of a cache for the moment
    this.audioPool = audioPool;
    this.renderUnit = renderUnit;
    this.renderUnit.loadAssets();
  }

  spawnIfNotExists(frameData) {
    const exists = this.units.children.find(
      (child) => child.userData.repId === frameData.repId
    );
    return exists || this.spawn(frameData);
  }

  spawn(frameData) {
    const unit = this.renderUnit.load(frameData.typeId);
    // unit.matrixAutoUpdate = false;
    // unit.add(new AxesHelper(2));

    unit.userData.current = frameData;
    unit.userData.repId = frameData.repId;
    unit.userData.typeId = frameData.typeId;
    unit.name = this.bwDat.units[unit.userData.typeId].name;

    const runner = (unit.userData.runner = new IScriptRunner(
      this.bwDat,
      path(
        ["flingy", "sprite", "image", "iscript"],
        this.bwDat.units[unit.userData.typeId]
      ),
      {
        typeId: unit.userData.typeId,
        repId: unit.userData.repId,
        lifted: unit.userData.current.lifted,
      },
      {
        image: path(
          ["flingy", "sprite", "image"],
          this.bwDat.units[unit.userData.typeId]
        ),
      }
    ));

    const unitSound = new PositionalAudio(this.audioListener);
    unit.add(unitSound);

    const playSound = (soundId) => {
      if (unitSound.isPlaying) {
        return;
      }
      if (this.audioPool[soundId]) {
        unitSound.setBuffer(this.audioPool[soundId]);
        unitSound.play();
        return;
      }

      console.log("playsnd", soundId);
      const audioLoader = new AudioLoader(this.loadingManager);
      audioLoader.load(
        `./sound/${this.bwDat.sounds[soundId].file}`,
        (buffer) => {
          this.audioPool[soundId] = buffer;
          unitSound.setBuffer(buffer);
          unitSound.setRefDistance(10);
          unitSound.setRolloffFactor(2.2);
          unitSound.setDistanceModel("exponential");
          unitSound.setVolume(1);
          unitSound.play();
        }
      );
    };
    runner.on("playsnd", playSound);
    runner.on("playsndbtwn", playSound);
    runner.on("playsndrand", playSound);

    this.units.add(unit);
    return unit;
  }

  update(unit, frameData) {
    const previous = (unit.userData.previous = unit.userData.current);
    const current = (unit.userData.current = frameData);
    const unitType = this.bwDat.units[unit.userData.typeId];

    const x = current.x / 32 - 64;
    const z = current.y / 32 - 64;

    const y = unitType.flyer() ? 6 : this.getTerrainY(x, z);
    const position = new Vector3(x, y, z);
    const rotationY = -current.angle + Math.PI / 2;

    unit.position.copy(position);
    unit.rotation.y = rotationY;

    // unit.visible = window.showAlive ? true : current.alive;
    unit.visible = unit.visible && !current.loaded();

    // const rotation = new Quaternion();
    // rotation.setFromEuler(new Euler(0, rotationY, 0));

    // const rotScaleTranslation = new Matrix4();
    // rotScaleTranslation.compose(position, rotation, new Vector3(1, 1, 1));
    // unit.matrix
    //   .makeShear(this.shear.x, 0, this.shear.z)
    //   .multiply(rotScaleTranslation);
    // unit.matrix.copy(rotScaleTranslation);
    // unit.updateMatrix();

    unit.userData.movement = new Vector3();
    unit.userData.nextPosition = new Vector3();
    unit.userData.nextPosition.copy(unit.position);

    const runner = unit.userData.runner;
    const isNow = (prop) => current[prop]() && !previous[prop]();
    const was = (prop) => !current[prop]() && previous[prop]();
    const run = (section) => runner.toAnimationBlock(section);
    const target = this.units.children.find(
      ({ userData }) =>
        userData.repId === (current.targetRepId || current.orderTargetRepId)
    );
    const targetIsAir = () => {
      if (target) {
        return target.userData.current.flying();
      }
    };

    if (!runner.state.noBrkCode) {
      //@todo
      //if cooldown timer && repeatAttk run(repeatAttk)

      if (isNow("attacking") && unit.material) {
        unit.material.color = red;
        unit.material.needsUpdate = true;
      } else if (was("attacking") && unit.material) {
        unit.material.color = white;
        unit.material.needsUpdate = true;
      }

      if (
        current.groundWeaponCooldown &&
        !previous.groundWeaponCooldown &&
        !targetIsAir()
      ) {
        run(headers.gndAttkInit);
      } else if (
        current.airWeaponCooldown &&
        !previous.airWeaponCooldown &&
        targetIsAir()
      ) {
        run(headers.airAttkInit);
      }

      if (
        !current.groundWeaponCooldown &&
        previous.groundWeaponCooldown &&
        !targetIsAir()
      ) {
        if (runner.state.repeatAttackAfterCooldown) {
          run(headers.gndAttkRpt);
        } else {
          run(headers.gndAttkToIdle);
        }
      } else if (
        !current.airWeaponCooldown &&
        previous.airdWeaponCooldown &&
        targetIsAir()
      ) {
        if (runner.state.repeatAttackAfterCooldown) {
          run(headers.airAttkRpt);
        } else {
          run(headers.airAttkToIdle);
        }
      }

      // if (isNow("moving")) {
      //   run(headers.walking);
      // } else if (was("moving")) {
      //   run(headers.walkingToIdle);
      // }

      if (isNow("lifted")) {
        run(headers.liftOff);
      } else if (was("lifted")) {
        run(headers.landing);
      }

      if (isNow("burrowed")) {
        run(headers.burrow);
      } else if (was("burrowed")) {
        run(headers.unBurrow);
      }

      if (isNow("completed") && unitType.building()) {
        run(headers.built);
      }

      //@todo verify validity for zerg & protoss
      if (
        current.remainingBuildTime &&
        unitType.building() &&
        (unitType.zerg() || unitType.terran()) &&
        current.remainingBuildTime / unitType.buildTime < 0.4 &&
        runner.commands.header !== headers.almostBuilt &&
        !runner.hasRunAnimationBlockAtLeastOnce[headers.almostBuilt]
      ) {
        run(headers.almostBuilt);
      }
    }
    /*
    iscriptHeaders.castSpell
    iscriptHeaders.specialState1
    iscriptHeaders.specialState2
    iscriptHeaders.working 
    iscriptHeaders.workingToIdle
    iscriptHeaders.warpIn

    iscriptHeaders.almostBuilt T P?Z?

    iscriptHeaders.enable
    iscriptHeaders.disable

    iscriptHeaders.unused1;
    iscriptHeaders.unused2;
    iscriptHeaders.unused3
    iscriptHeaders.starEditInit

    iscriptHeaders.init X
    iscriptHeaders.death; X
    iscriptHeaders.gndAttkInit; X
    iscriptHeaders.airAttkInit; X
    iscriptHeaders.gndAttkRpt; X
    iscriptHeaders.airAttkRpt; X
    iscriptHeaders.gndAttkToIdle; X
    iscriptHeaders.airAttkToIdle; X
    iscriptHeaders.walking; X
    iscriptHeaders.walkingToIdle; X
    iscriptHeaders.built X
    iscriptHeaders.landing X
    iscriptHeaders.liftOff X
    iscriptHeaders.burrow X
    iscriptHeaders.unBurrow X

    */

    // if (diff("idle")) {
    //   unit.userData.runner.toAnimationBlock(iscriptHeaders.init);
    // }

    runner.update();
    this.renderUnit.update(unit);
  }

  updateDeadUnits() {
    this.deadUnits.forEach((unit) => this.update(unit, unit.userData.current));
  }

  killUnit(unit) {
    unit.userData.current.alive = false;
    //@todo send kill signal to runners without interrupting them
    // unit.userData.runner.toAnimationBlock(headers.death);
    this.deadUnits.push(unit);
  }

  clear() {
    this.units = new Group();
    this.deadUnits = [];
  }

  cameraUpdate({ position }, { target }) {
    const delta = new Vector3();
    this.shear = delta.subVectors(position, target);
  }

  getUnits() {
    return this.units.children;
  }

  killUnits(repIds) {
    if (!repIds || !repIds.length) {
      return;
    }
    this.units.children
      .filter(({ userData }) => repIds.includes(userData.repId))
      .forEach((unit) => this.killUnit(unit));
  }

  dispose() {
    disposeMesh(this.units);
    this.clear();
  }
}

// //#region lepring movement and adjusting position according to terrain
// units.getUnits().forEach((model) => {
//     if (model.userData.nextPosition) {
//       model.position.lerpVectors(
//         model.userData.startPosition,
//         model.userData.nextPosition,
//         (worldFrame % physicsFrameSkip) / physicsFrameSkip
//       );
//     }
//   }

// displacement = {
//   image: floor.material.displacementMap.image
//     .getContext("2d")
//     .getImageData(0, 0, disp.width, disp.height),
//   width: disp.width,
//   scale: floor.material.displacementScale,
// };

// if (worldFloor && worldFrame % 50 === 0) {
//   const testPoint = new Vector3();
//   const raycaster = new THREE.Raycaster(
//     testPoint.addVectors(model.position, new Vector3(0, 20, 0)),
//     new Vector3(0, -1, 0)
//   );
//   const result = raycaster.intersectObject(worldFloor, false);
//   if (result && result.length) {
//     const point = result[0].point;
//     model.position.copy(point.add);
//   }
// }
