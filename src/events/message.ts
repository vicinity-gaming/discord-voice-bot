import * as Discord       from 'discord.js';
import * as _             from 'lodash';
import AppConfig          from '../types/AppConfig';
import CommandFile        from '../types/CommandFile';
import CommandPermissions from '../types/CommandPermissions';

/**
 * Checks whether a user has permission to execute a given command.
 *
 * @param member
 * @param command
 * @param config
 *
 * @author Carlos Amores
 */
function hasCommandPermissions(member : Discord.GuildMember, command : string, config : AppConfig) : boolean
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

/**
 * Discord message event handler.
 * @param client
 * @param config
 * @param message
 * @param cmdObj
 *
 * @author Carlos Amores
 * {@link https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-message}
 */
export async function handleEvent(client : Discord.Client, config : AppConfig, cmdObj : { [key : string] : CommandFile }, message : Discord.Message) : Promise<void>
{
    if (message.author.bot || message.channel instanceof Discord.DMChannel || message.member === null || !_.keys(config.tracked_guilds).includes(message.guild.id))
    {
        // Ignore other bots and DMs.
        return;
    }

    let isCommand : boolean = false;
    let commandName : string;
    _.each(_.keys(cmdObj), function (k : string)
    {
        if (message.content.startsWith(config.prefix + k))
        {
            isCommand   = true;
            commandName = k;
            return false;
        }
    });

    if (isCommand && ['', message.channel.id].includes(config.tracked_guilds[message.guild.id].commands_channel) && hasCommandPermissions(message.guild.member(message.member), commandName, config))
    {
        let cmdArgs : Array<string> = message.content
            .substr(config.prefix.length + commandName.length)
            .trim()
            /** {@link https://regex101.com/r/gTpMk5/3} */
            .split(/\s+(?=(?:(?:\\[\\"]|[^\\"])*"(?:\\[\\"]|[^\\"])*")*(?:\\[\\"]|[^\\"])*$)/gm);
        cmdArgs                     = _.map(cmdArgs, function (arg : string) : string
        {
            /** {@link https://regex101.com/r/wFPxtv/2} */
            let argWithoutDelimiters : string = _.replace(arg, /((?<!\\)(?:\\{2})*)["]/gm, '$1');
            return _.replace(argWithoutDelimiters, /\\"/gm, '"');
        });

        if (commandName === 'help')
        {
            // Define a special case for the help command as it needs to reference all other commands.
            cmdObj['help'].run(client, message, cmdObj, ...cmdArgs).catch(console.error);
        }
        else
        {
            cmdObj[commandName].run(client, message, ...cmdArgs).catch(console.error);
        }
    }
    else
    {
        // Handle non-command-related events here. Maybe link censorship, notification alert, etc.
    }
}
