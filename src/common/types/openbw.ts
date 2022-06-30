import { SoundStruct } from "./structs";

export interface OpenBWWasm {
    _reset: () => void;
    _load_replay: (buffer: number, length: number) => void;
    _next_frame: () => number;
    _counts: (index: number) => number;
    _get_buffer: (index: number) => number;
    _replay_get_value: (index: number) => number;
    _replay_set_value: (index: number, value: number) => void;
    _get_fow_ptr: (visiblity: number, instant: boolean) => number;
    get_util_funcs: () => ({
        get_sounds: () => SoundStruct[],
        dump_unit: (unitAddr: number) => {
            id: number;
            resourceAmount?: number;
            remainingTrainTime?: number;
            upgrade?: {
                id: number;
                level: number;
                time: number;
            };
            research?: {
                id: number;
                time: number;
            };
            loaded?: number[];
            buildQueue?: number[];
        },
    });
    callMain: () => void;
    HEAP8: Int8Array;
    HEAPU8: Uint8Array;
    HEAP16: Int16Array;
    HEAPU16: Uint16Array;
    HEAP32: Int32Array;
    HEAPU32: Uint32Array;
    getExceptionMessage: (e: unknown) => string;
    allocate: (buffer: ArrayBuffer, flags: number) => number;
    _free: (buffer: number) => void;
    ALLOC_NORMAL: number;
}

export interface OpenBWAPI {
    wasm?: OpenBWWasm;
    callbacks: {
        beforeFrame: () => void;
        afterFrame: () => void;
    };
    call?: {
        getFowSize?: () => number;
        getFowPtr?: (visibility: number, instant: boolean) => number;
        getTilesPtr?: () => number;
        getTilesSize?: () => number;
        getSoundObjects?: () => SoundStruct[];
        getSpritesOnTileLineSize?: () => number;
        getSpritesOnTileLineAddress?: () => number;
        getUnitsAddr?: () => number;
        getBulletsAddress?: () => number,
        getBulletsDeletedCount?: () => number,
        getBulletsDeletedAddress?: () => number,
        getLinkedSpritesAddress?: () => number,
        getLinkedSpritesCount?: () => number,
        setGameSpeed?: (speed: number) => void;
        getGameSpeed?: () => number;
        setCurrentFrame?: (frame: number) => void;
        getCurrentFrame?: () => number;
        isPaused?: () => boolean;
        setPaused?: (paused: boolean) => void;

        nextFrame?: () => number;
        tryCatch?: (callback: () => void) => void;
        loadReplay: (buffer: Buffer) => void;
        main?: () => void;
    }
    loaded: Promise<boolean>;
};