import * as Discord    from 'discord.js';
import CommandHelpData from '../types/CommandHelpData';

/**
 * Display information about the bot's source code location.
 *
 * @param client
 * @param msg
 *
 * @author Carlos Amores
 */
export async function run(client : Discord.Client, msg : Discord.Message) : Promise<void>
{
    const reply : Discord.MessageEmbed = new Discord.MessageEmbed(
        {
            title       : 'Commands Help',
            hexColor    : '#7c8bf5',
            thumbnail   : {
                url : 'https://cdn.discordapp.com/avatars/' + client.user.id + '/' + client.user.avatar + '.png?size=1024'
            },
            description : 'View the bot\'s source code on GitHub: https://github.com/vicinity-gaming/discord-voice-bot/tree/master'
        }
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
        commandName        : 'Source',
        commandDescription : 'Display information about the bot\'s source code',
        commandUsage       : '.source'
    };
}
