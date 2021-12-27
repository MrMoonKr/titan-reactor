import { Settings, AssetTextureResolution } from "./types";

export const SETTINGS_VERSION = 1;

export const defaultSettings: Settings = {
  version: SETTINGS_VERSION,
  language: "en-US",
  directories: {
    starcraft: "",
    maps: "",
    replays: "",
    models: "",
    temp: "",
  },
  playerColors: {
    ignoreReplayColors: true,
    randomizeOrder: false
  },
  assets: {
    images: AssetTextureResolution.HD2,
    terrain: AssetTextureResolution.SD,
  },
  audio: {
    global: 1,
    music: 0.1,
    sound: 1
  },
  graphics: {
    antialias: true,
    pixelRatio: 1,
    fullscreen: true,
  },
  // alwaysHideReplayControls: false,
  // language: "en-US",
  // starcraftPath: "",
  // mapsPath: "",
  // replaysPath: "",
  // tempPath: "",
  // communityModelsPath: "",
  // observerLink: "",
  // musicVolume: 0.1,
  // musicAllTypes: false,
  // soundVolume: 1,
  // antialias: 4,
  // anisotropy: 1,
  // pixelRatio: 1,
  // gamma: 1.2,
  // keyPanSpeed: 0.5,
  // twitch: "",
  // fullscreen: true,
  // enablePlayerScores: true,
  // esportsHud: true,
  // embedProduction: true,
  // cameraShake: 1,
  // useCustomColors: false,
  // randomizeColorOrder: false,
  // classicClock: false,
  // hudFontSize: "sm",
  // minimapRatio: 25,
  // replayAndUnitDetailSize: "24vw",
  // fpsLimit: 200,
  // autoToggleProductionView: true,
  // showDisabledDoodads: false,
  // showCritters: true,
  // mouseRotateSpeed: 0.1,
  // mouseDollySpeed: 0.1,
  // mapBackgroundColor: "#000000",
};