export enum Commands {
    keepAlive = 0x05,
    saveGame = 0x06,
    loadGame = 0x07,
    restartGame = 0x08,
    select = 0x09,
    selectAdd = 0x0a,
    selectRemove = 0x0b,
    build = 0x0c,
    vision = 0x0d,
    alliance = 0x0e,
    gameSpeed = 0x0f,
    pause = 0x10,
    resume = 0x11,
    cheat = 0x12,
    hotkey = 0x13,
    rightClick = 0x14,
    targetedOrder = 0x15,
    cancelBuild = 0x18,
    cancelMorph = 0x19,
    stop = 0x1a,
    carrierStop = 0x1b,
    reaverStop = 0x1c,
    orderNothing = 0x1d,
    returnCargo = 0x1e,
    train = 0x1f,
    cancelTrain = 0x20,
    cloak = 0x21,
    decloak = 0x22,
    unitMorph = 0x23,
    unsiege = 0x25,
    siege = 0x26,
    trainFighter = 0x27, // Build interceptor / scarab
    unloadAll = 0x28,
    unload = 0x29,
    mergeArchon = 0x2a,
    holdPosition = 0x2b,
    burrow = 0x2c,
    unburrow = 0x2d,
    cancelNuke = 0x2e,
    liftOff = 0x2f,
    tech = 0x30,
    cancelTech = 0x31,
    upgrade = 0x32,
    cancelUpgrade = 0x33,
    cancelAddon = 0x34,
    buildingMorph = 0x35,
    stim = 0x36,
    sync = 0x37,
    voiceEnable = 0x38,
    voiceDisable = 0x39,
    voiceSquelch = 0x3a,
    voiceUnsquelch = 0x3b,
    lobbyStartGame = 0x3c,
    lobbyDownloadPercentage = 0x3d,
    lobbyChangeGameSlot = 0x3e,
    lobbyNewNetPlayer = 0x3f,
    lobbyJoinedGame = 0x40,
    lobbyChangeRace = 0x41,
    lobbyTeamGameTeam = 0x42,
    lobbyUMSTeam = 0x43,
    lobbyMeleeTeam = 0x44,
    lobbySwapPlayers = 0x45,
    lobbySavedData = 0x48,
    briefingStart = 0x54,
    latency = 0x55,
    replaySpeed = 0x56,
    leaveGame = 0x57,
    miniMapPing = 0x58,
    mergeDarkArchon = 0x5a,
    makeGamePublic = 0x5b,
    chat = 0x5c,
    rightClickRemastered = 0x60,
    targetedOrderRemastered = 0x61,
    unloadRemastered = 0x62,
    selectRemastered = 0x63,
    selectAddRemastered = 0x64,
    selectRemoveRemastered = 0x65,
}
