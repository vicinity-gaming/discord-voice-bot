import * as Discord              from 'discord.js';
import * as _                    from 'lodash';
import AppConfig                 from '../types/AppConfig';
import CommandFile               from '../types/CommandFile';
import {checkCommandPermissions} from '../utils/utils';
import CommandHandlerData        from '../types/CommandHandlerData';

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

    if (isCommand && ['', message.channel.id].includes(config.tracked_guilds[message.guild.id].commands_channel) && checkCommandPermissions(message.guild.member(message.member), commandName, config))
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

        let commandHandlerData : CommandHandlerData = {
            client    : client,
            message   : message,
            commands  : cmdObj,
            config    : config,
            arguments : cmdArgs
        };

        cmdObj[commandName].run.call(commandHandlerData);
    }
    else
    {
        // Handle non-command-related events here. Maybe link censorship, notification alert, etc.
    }
}
