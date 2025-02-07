import { CMDS } from "./commands";
import range from "common/utils/range";
import cstring from "../util/cstring";

const bufToCommand = ( id: number, data: Buffer ) => {
    switch ( id ) {
        case CMDS.RIGHT_CLICK.id: {
            return {
                x: data.readUInt16LE( 0 ),
                y: data.readUInt16LE( 2 ),
                unitTag: data.readUInt16LE( 4 ),
                unit: data.readUInt16LE( 6 ),
                queued: data.readUInt8( 8 ),
            };
        }
        case CMDS.SELECT.id:
        case CMDS.SELECTION_ADD.id:
        case CMDS.SELECTION_REMOVE.id: {
            const count = data.readUInt8( 0 );
            const unitTags = range( 0, count ).map( ( i ) => data.readUInt16LE( 1 + i * 2 ) );
            return {
                unitTags,
            };
        }
        case CMDS.HOTKEY.id:
            return {
                hotkeyType: data.readUInt8( 0 ),
                group: data.readUInt8( 1 ),
            };
        case CMDS.TRAIN.id:
        case CMDS.UNIT_MORPH.id:
        case CMDS.BUILDING_MORPH.id:
            return {
                unitTypeId: data.readUInt16LE( 0 ),
            };
        case CMDS.TARGETED_ORDER.id: {
            return {
                x: data.readUInt16LE( 0 ),
                y: data.readUInt16LE( 2 ),
                unitTag: data.readUInt16LE( 4 ),
                unitTypeId: data.readUInt16LE( 6 ),
                order: data.readUInt8( 8 ),
                queued: data.readUInt8( 9 ),
            };
        }
        case CMDS.BUILD.id:
            return {
                order: data.readUInt8( 0 ),
                x: data.readUInt16LE( 1 ),
                y: data.readUInt16LE( 3 ),
                unitTypeId: data.readUInt16LE( 5 ),
            };
        case CMDS.STOP.id:
        case CMDS.BURROW.id:
        case CMDS.UNBURROW.id:
        case CMDS.RETURN_CARGO.id:
        case CMDS.HOLD_POSITION.id:
        case CMDS.UNLOAD_ALL.id:
        case CMDS.UNSIEGE.id:
        case CMDS.SIEGE.id:
        case CMDS.CLOAK.id:
        case CMDS.DECLOAK.id:
        case CMDS.CARRIER_STOP.id:
            return {
                queued: data.readUInt8( 0 ),
            };

        case CMDS.LIFTOFF.id:
        case CMDS.MINIMAP_PING.id:
            return {
                x: data.readUInt16LE( 0 ),
                y: data.readUInt16LE( 2 ),
            };
        case CMDS.CHAT.id:
            return {
                senderSlot: data.readUInt8( 0 ),
                //FIXME: figure out length
                message: cstring( data.slice( 1, 80 ) ),
            };

        case CMDS.CANCEL_TRAIN.id:
        case CMDS.UNLOAD.id: {
            const unitTag = data.readUInt16LE( 0 );
            return {
                unitTag,
            };
        }
        case CMDS.UPGRADE.id:
        case CMDS.TECH.id:
        case CMDS.LEAVE_GAME.id:
            return {
                value: data.readUInt8( 0 ),
            };

        case CMDS.ALLIANCE.id: {
            let value = data.readUInt32LE( 0 );
            const slotIds = [];
            let alliedVictory = false;

            // There are 2 bits for each slot, 0x00: not allied, 0x1: allied, 0x02: allied victory
            for ( let i = 0; i < 11; i++ ) {
                const c = value & 0x3;
                if ( c ) {
                    slotIds.push( i );
                    if ( c == 2 ) {
                        alliedVictory = true;
                    }
                }
                value >>= 2;
            }

            return {
                slotIds,
                alliedVictory,
            };
        }

        case CMDS.VISION.id: {
            let value = data.readUint16LE( 0 );
            const slotIds = [];
            for ( let i = 0; i < 11; i++ ) {
                if ( value & 0x1 ) {
                    slotIds.push( i );
                }
                value >>= 1;
            }
            return {
                slotIds,
            };
        }

        default:
            return {};
    }
};

export default bufToCommand;
