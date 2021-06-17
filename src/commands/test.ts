import * as Discord    from 'discord.js';
import * as _          from 'lodash';
import CommandHelpData from '../types/CommandHelpData';

/**
 * Command to test the command argument parser.
 *
 * @param client
 * @param msg
 * @param args
 *
 * @author Carlos Amores
 */
export async function run(client : Discord.Client, msg : Discord.Message, ...args : Array<string>) : Promise<void>
{
    let argStore : Array<string> = [];
    _.each(args, function (v : string, k : number)
    {
        argStore.push(`Arg #${k}: ${v}`);
    });

    const reply : Discord.MessageEmbed = new Discord.MessageEmbed(
        {
            description : _.join(argStore, '\n'),
        },
    );
    msg.reply(reply).catch(console.error);
}

/**
 * Return relevant information about the current command.
 *
 * @author Carlos Amores
 */
export function help() : CommandHelpData
{
    return {
        commandName        : 'Test',
        commandDescription : 'Takes an arbitrary amount of arguments, parses them and displays them in order to test the argument parser',
        commandUsage       : '.test ARG1 ARG2 ...'
    }
}
