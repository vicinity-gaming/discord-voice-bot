import * as Discord from 'discord.js';

/**
 * Interface CommandPermissions
 *
 * This interface represents the structure of bot command permissions within the configuration file. Given that it is
 * a recursive structure, it must be defined separately.
 *
 * @author Carlos Amores
 */
export default interface CommandPermissions
{
    [key : string] : Array<Discord.Snowflake> | CommandPermissions
}
