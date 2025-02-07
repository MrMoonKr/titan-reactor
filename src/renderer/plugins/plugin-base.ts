import { GameTimeApi } from "@core/world/game-time-api";
import { log } from "@ipc/log";
import { savePluginsConfig } from "@ipc/plugins";
import { normalizePluginConfiguration } from "@utils/function-utils";
import {
    FieldDefinition,
    Injectables,
    NativePlugin,
    PluginConfig,
    PluginPackage,
} from "common/types";

const structuredClone =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    globalThis.structuredClone ??
    ( ( x: any ) => JSON.parse( JSON.stringify( x ) ) as unknown );

export interface PluginBase extends NativePlugin, GameTimeApi, Injectables {}

export class PluginBase {
    readonly id: string;
    readonly name: string;
    isSceneController = false;
    #config: PluginConfig | undefined = {};

    /**
     * @internal
     * Same as config but simplified to [key] = value
     */
    #normalizedConfig: Record<string, unknown> | undefined;

    constructor( pluginPackage: PluginPackage ) {
        this.id = pluginPackage.id;
        this.name = pluginPackage.name;
        this.rawConfig = structuredClone( pluginPackage.config );
    }

    sendUIMessage: ( message: any ) => void = () => {};

    /**
     *
     * Useful for plugins that want to update their own config.
     *
     * @param key The configuration key.
     * @param value  The configuration value.
     * @returns
     */
    saveConfigProperty( key: string, value: unknown, persist = true ): void {
        if ( !this.#config ) {
            return;
        }

        if ( !( key in this.#config ) ) {
            log.warn(
                `Plugin ${this.id} tried to set config key ${key} but it was not found`
            );
            return undefined;
        }

        this.#config[key].value = value;
        if ( persist ) {
            savePluginsConfig( this.id, this.#config );
        }
    }

    /*
     * Generates the normalized config object.
     * Same as config but simplified to [key] = value
     */
    refreshConfig() {
        this.#normalizedConfig = this.#config
            ? normalizePluginConfiguration( this.#config )
            : undefined;
    }

    get configExists() {
        return this.#config !== undefined;
    }

    /**
     * Read from the normalized configuration.
     */
    get config(): object | undefined {
        return this.#normalizedConfig;
    }

    /**
     * Set the config from unnormalized data (ie leva config schema).
     */
    set rawConfig( value: PluginConfig | undefined ) {
        this.#config = value;
        this.refreshConfig();
    }

    get rawConfig() {
        return this.#config;
    }

    /**
     * @param key The configuration key.
     * @returns the leva configuration for a particular field
     */
    getFieldDefinition( key: string ) {
        if ( !this.#config ) {
            return undefined;
        }
        return this.#config[key] as FieldDefinition;
    }
}
