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
     */
    run : () => Promise<void>;
    /**
     * Returns relevant information about the command in a standardised format in the shape of a CommandHelpData object.
     */
    help : () => CommandHelpData;
}
