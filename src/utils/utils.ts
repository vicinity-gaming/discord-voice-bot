import * as Discord       from 'discord.js';
import AppConfig          from '../types/AppConfig';
import * as _             from "lodash";
import CommandPermissions from "../types/CommandPermissions";

/**
 * Checks whether a user has permission to execute a given command.
 *
 * @param member
 * @param command
 * @param config
 *
 * @author Carlos Amores
 */
export function checkCommandPermissions(member : Discord.GuildMember, command : string, config : AppConfig) : boolean
{
    if (_.some(Array.from(member.roles.cache.keys()), role => config.tracked_guilds[member.guild.id].command_permissions_override.includes(role)))
    {
        return true;
    }

    // Unwrap the command groups if any.
    let unwrappedCmd : Array<string>                          = command.split(config.prefix);
    let level : Array<Discord.Snowflake> | CommandPermissions = config.tracked_guilds[member.guild.id].command_permissions;
    let hasPermissions : boolean                              = false;
    _.each(unwrappedCmd, function (cmd : string)
    {
        if (cmd in level)
        {
            if (_.isArray(level[cmd]))
            {
                /*
                 * When we reach the point at which there is an array of roles which can use the command, check if the
                 * member is in any of those roles much like when checking for override.
                 */
                hasPermissions = _.some(Array.from(member.roles.cache.keys()), role => level[cmd].includes(role));
                return false;
            }
            else
            {
                level = level[cmd];
            }
        }
        else
        {
            hasPermissions = true;
            return false;
        }
    });

    return hasPermissions;
}
