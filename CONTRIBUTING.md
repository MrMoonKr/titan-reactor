# Contributors Crash Course

Looking to make a contribution? This is the guide for you! 🥳

Titan Reactor mostly leverages Typescript, WebGL via three.js, and several ancillary packages to make the magic happen.

## Primary Tech
- node ^14.
- yarn ^1.0
- three@latest
- electron-webpack@latest
- electron^15.0.0
- preact@latest
- zustand
- openbw

## Build
We use `yarn ^1.0` workspaces allowing us to keep seperate packages for interrelated functionality:
- titan-reactor - The main game package
- bw-chk-modified - A fork of bw-chk that provides additional data
- casc-lib - A fork of casclib that allows simultaneous CASC archive access with BW
- downgrade-replay - A node package to downgrade replays and chk files from SCR to BW
- pkware-wasm - A node package that implements StormLib compression/decompression

For our build we use `electron-webpack` which includes hot reload for both renderer and main process

You will also need openbw-bridge.exe which is included in static directory for you and can also be built (see https://github.com/imbateam-gg/ChkForge).

## package/titan-reactor
**src/build** - Additional hooks into electron-webpack build process

**src/main** - The electron main process

- Creates browser window and manages settings

**src/common** - Shared code amongst main process and renderer (browser window)
- *bwdat* - The "database" of bw data including unit stats, image dimensions etc, includes DAT parsers
- *image* 
  - image format parsers and image generation
  - it contains the base GRP atlas classes that coincide with an ImageDAT entry
  - it contains the base TitanImage types that render themselves and set image frames
- *iscript* - iscript parser and intepreter
- *phrases* - language translations for the UI
- *types* - the main repository of TypeScript types
- *utils* - random stuff

**src/renderer** - Everything that lives in chrome and manages the game rendering
- The main classes are TitanReactor, TitanReactorGame, and TitanReactorMap
- TitanReactor manages initial Asset loading and initializiation of either game or map
- The games and maps manage their own game loop and provide a method to dispose the instance.
- Everything is rendered within React/Preact, using dom canvases for the rendering of the game and minimap via three.js and canvas draw operations respectively.
- The game state is dumped to a file via openbw-bridge. Our GameStateReader takes that data and converts it into FrameBW instances.
- When the time comes our ThreeBuilder transforms the FrameBW information into ThreeJS scene objects and we render the scene.
- Input handling is a mix of react component event handlers and native event handlers on our canvases.
- For state management we use `zustand` as our data store provides react hooks as well as external access to state.
