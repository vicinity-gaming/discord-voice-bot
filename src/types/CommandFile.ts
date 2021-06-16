import * as Discord    from 'discord.js';
import CommandHelpData from './CommandHelpData';

/**
 * Interface CommandFile
 *
 * Represents an object resulting from the export of a file which defines a function to handle a specific command being
 * invoked with the same name as the file taking into account the path from the commands directory and replacing the
 * directory separator with the command prefix.
 *
 * @author Carlos Amores
 */
export default interface CommandFile
{
    /**
     * The function that handles the command logic within the command file and which is called by the message event
     * handler.
     * @param client
     * @param msg
     * @param args This parameter takes all the arguments used when calling the command in Discord. Thus, any definitions
     * of this function can define any number of named parameters which will be passed to it by the parser from left
     * to right as well as a single variable using spread syntax to receive all arguments.
     */
    run : (client : Discord.Client, msg : Discord.Message, ...args : Array<string> | any) => Promise<void>;
    /**
     * Returns relevant information about the command in a standardised format in the shape of a CommandHelpData object.
     */
    help : () => CommandHelpData;

    [key : string] : any;
}
