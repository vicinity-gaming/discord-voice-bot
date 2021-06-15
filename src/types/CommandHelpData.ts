/**
 * Interface CommandHelpData
 * Represents an object with relevant information about a command such that it can be displayed when the help command is
 * triggered.
 *
 * @author Carlos Amores
 */
export default interface CommandHelpData
{
    commandName: string;
    commandDescription: string;
    commandUsage: string;
}
