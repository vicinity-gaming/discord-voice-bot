import * as Discord from 'discord.js';
import CommandFile  from './CommandFile';
import AppConfig    from './AppConfig';

/**
 * Interface CommandHandlerData
 *
 * A replacement for the previous method of passing data to the command handlers through positional arguments. This
 * object contains all data previously passed to all command handlers and some new data which allows for more flexible
 * handler structure.
 *
 * @author Carlos Amores
 */
export default interface CommandHandlerData
{
    /**
     * The bot client handling the command.
     */
    client : Discord.Client;
    /**
     * The message which triggered the command.
     */
    message : Discord.Message;
    /**
     * An object with all of the commands loaded by the bot.
     */
    commands : { [key : string] : CommandFile };
    /**
     * The bot configuration file data.
     */
    config : AppConfig;
    /**
     * The arguments parsed by the message event handler.
     */
    arguments : Array<string>;
}
