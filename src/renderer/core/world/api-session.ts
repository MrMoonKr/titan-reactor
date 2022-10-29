import { GameTimeApi } from "./game-time-api";
import { SettingsSessionStore } from "./settings-session-store";
import { borrow, mix } from "@utils/object-utils";
import { createMacrosComposer, MacrosComposer } from "./macros-composer";
import { WorldEvents } from "./world-events";
import { TypeEmitter, TypeEmitterProxy } from "@utils/type-emitter";
import { createPluginSession, PluginSession } from "./create-plugin-session";
import { useSettingsStore } from "@stores/settings-store";
import { OpenBW } from "@openbw/openbw";

import { WorldEventTrigger } from "@macros/world-event-trigger";
import { Janitor } from "three-janitor";

export class ApiSession {
    #macrosProxy?: TypeEmitterProxy<WorldEvents>;

    #plugins!: PluginSession;
    #macros!: MacrosComposer;

    #events!: WeakRef<TypeEmitter<WorldEvents>>;

    #janitor!: Janitor;

    async activate(
        events: TypeEmitter<WorldEvents>,
        settings: SettingsSessionStore,
        openBW: OpenBW,
        gameTimeApi: GameTimeApi
    ) {
        this.#janitor = new Janitor();

        this.#events = new WeakRef( events );
        this.#plugins = this.#janitor.mop(
            await createPluginSession( openBW, events )
        );

        this.#macros = this.#janitor.mop( createMacrosComposer( settings ) );
        const eventsProxy = this.#janitor.mop( new TypeEmitterProxy( events ) );

        this.#macros.macros.targets.setHandler( ":plugin", {
            action: ( action ) =>
                this.#plugins.store.operate( action, ( path ) => path.slice( 1 ) ),
            getValue: ( path ) => this.#plugins.store.getValue( path.slice( 1 ) ),
        } );

        this.#hookMacrosToWorldEvents();

        this.#janitor.add(
            useSettingsStore.subscribe( ( settings ) => {
                if (
                    settings.data.macros.revision !==
                    this.#macros.macros.revision
                ) {
                    this.#macros.macros.deserialize( settings.data.macros );

                    this.#hookMacrosToWorldEvents();
                }
            } )
        );

        // macros unsafe api additionally allows access to plugin configurations
        // which is not allowed WITHIN plugins since they are 3rd party, but ok in user macros and sandbox
        this.#macros.setContainer(
            mix( {
                api: borrow( gameTimeApi ),
                plugins: borrow( this.#plugins.store.vars ),
                settings: borrow( settings.vars ),
                events: eventsProxy,
            } )
        );

        this.#janitor.mop(
            this.native.injectApi(
                mix(
                    {
                        settings: settings.vars,
                        events: eventsProxy,
                    },
                    gameTimeApi
                )
            ),
            "native.injectApi"
        );

        this.native.sessionInit();
    }

    get native() {
        return this.#plugins.nativePlugins;
    }

    get ui() {
        return this.#plugins.uiPlugins;
    }

    dispose() {
        this.#janitor.dispose();
        if ( this.#macrosProxy ) {
            this.#macrosProxy.dispose();
        }
    }

    #hookMacrosToWorldEvents() {
        if ( this.#macrosProxy ) {
            this.#macrosProxy.dispose();
        }
        this.#macrosProxy = new TypeEmitterProxy( this.#events.deref()! );

        for ( const macro of this.#macros.macros.meta.hookMacros ) {
            // only support 1 argument for context so as to not create array objects constantly
            this.#macrosProxy.on(
                ( macro.trigger as WorldEventTrigger ).eventName as keyof WorldEvents,
                ( arg?: any ) => {
                    this.#macros.macros.execMacroById( macro.id, arg );
                }
            );
        }
    }
}
