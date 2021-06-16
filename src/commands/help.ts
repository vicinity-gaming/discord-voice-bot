import * as Discord    from 'discord.js';
import * as _          from 'lodash';
import CommandHelpData from '../types/CommandHelpData';
import CommandFile     from "../types/CommandFile";

/**
 * Command to test the command argument parser.
 *
 * @param client
 * @param msg
 * @param cmdObj
 * @param commands
 *
 * @author Carlos Amores
 */
export async function run(client : Discord.Client, msg : Discord.Message, cmdObj : { [key : string] : CommandFile }, ...commands : Array<string>) : Promise<void>
{
    let reply : Discord.MessageEmbed = new Discord.MessageEmbed(
        {
            title    : 'Commands help',
            hexColor : '#7c8bf5'
        }
    );
    let i                            = 0;
    _.each(cmdObj, function (cmdFile : CommandFile, k : string)
    {
        if (commands[0] === '' || commands.includes(k))
        {
            if (i === 24)
            {
                /*
                 * Check to send the message when the maximum amount of fields per embed is reached.
                 * When this happens, the fields in the embed are reset, and the fields per embed counter is reset as
                 * well.
                 */
                msg.channel.send(reply).catch(console.error);
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
    msg.channel.send(reply).catch(console.error);
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
        commandDescription : 'Displays information about all commands or specific commands.',
        commandUsage       : '.help [COMMAND1 COMMAND2 ...]'
    }
}
