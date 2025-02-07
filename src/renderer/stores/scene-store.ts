import { log } from "@ipc/log";
import { withErrorMessage } from "common/utils/with-error-message";
import create from "zustand";
import { SceneState } from "../scenes/scene";

export type SceneLoader = ( prevData?: any ) => Promise<SceneState> | SceneState;

export interface SceneStore {
    state: SceneState | null;
    execSceneLoader: (
        loader: SceneLoader,
        errorHandler?: SceneLoader,
        dontClearError?: boolean
    ) => Promise<void>;
    error: Error | null;
    setError: ( error: Error ) => void;
    clearError: () => void;
    reset(): void;
}

let _loading = false;

export const useSceneStore = create<SceneStore>( ( set, get ) => ( {
    state: null,
    error: null,
    execSceneLoader: async (
        loader: SceneLoader,
        errorHandler?: SceneLoader,
        clearError = true
    ) => {
        if ( _loading ) {
            log.warn( "Scene is already loading" );
        }
        _loading = true;

        if ( clearError ) {
            get().clearError();
        }

        const oldState = get().state;
        let prevData: any = undefined;
        if ( oldState ) {
            try {
                prevData = oldState.dispose();
            } catch ( e ) {
                log.error( withErrorMessage( e, "Error disposing old scene" ) );
            }
        }

        try {
            const state = await loader( prevData );
            oldState?.beforeNext && oldState.beforeNext();
            if ( window.gc ) {
                window.gc();
            }
            state.start( oldState?.id );
            set( { state } );
        } catch ( err: any ) {
            if ( err instanceof Error ) {
                log.error( err.stack );
                get().setError( err );
            } else {
                log.error( err );
            }
            if ( errorHandler ) {
                get().reset();
                setTimeout( () => {
                    void get().execSceneLoader( errorHandler, undefined, false );
                }, 0 );
            }
        }
        _loading = false;
    },
    reset() {
        set( { state: null } );
    },
    setError: ( error: Error ) => {
        log.error( error.message );
        set( { error } );
    },
    clearError: () => {
        set( { error: null } );
    },
} ) );

export default () => useSceneStore.getState();
