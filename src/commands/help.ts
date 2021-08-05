import * as Discord              from 'discord.js';
import * as _                    from 'lodash';
import CommandHelpData           from '../types/CommandHelpData';
import CommandFile               from '../types/CommandFile';
import {checkCommandPermissions} from '../utils/utils';

/**
 * Command to test the command argument parser.
 *
 * @this CommandHandlerData
 *
 * @author Carlos Amores
 */
export async function run() : Promise<void>
{
    let reply : Discord.MessageEmbed = new Discord.MessageEmbed(
        {
            title     : 'Commands Help',
            color     : [124, 139, 245],
            thumbnail : {
                url : 'https://cdn.discordapp.com/avatars/' + this.message.member.id + '/' + this.message.member.user.avatar + '.png?size=1024'
            }
        }
    );
    let i                            = 0;
    _.each(this.commands, (cmdFile : CommandFile, k : string) =>
    {
        if ((this.arguments[0] === '' || this.arguments.includes(k)) && checkCommandPermissions(this.message.member, k, this.config))
        {
            if (i === 24)
            {
                /*
                 * Check to send the message when the maximum amount of fields per embed is reached.
                 * When this happens, the fields in the embed are reset, and the fields per embed counter is reset as
                 * well.
                 */
                this.message.reply(reply).catch(console.error);
                reply.fields = [];
                i            = 0;
            }
            let cmdHelpData : CommandHelpData = cmdFile.help();
            reply.addField(
                cmdHelpData.commandName,
                '**Description:** ' + cmdHelpData.commandDescription + '\n**Usage:** `' + cmdHelpData.commandUsage + '`'
            );
            ++i;
        }
    });
    this.message.reply(reply).catch(console.error);
}

/**
 * Return relevant information about the current command.
 *
 * @author Carlos Amores
 */
export function help() : CommandHelpData
{
    return {
        commandName        : 'Help',
        commandDescription : 'Displays information about all commands or specific commands',
        commandUsage       : '.help [COMMAND1 COMMAND2 ...]'
    }
}
