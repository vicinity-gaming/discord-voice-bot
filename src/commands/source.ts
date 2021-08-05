import * as Discord    from 'discord.js';
import CommandHelpData from '../types/CommandHelpData';

/**
 * Display information about the bot's source code location.
 *
 * @this CommandHandlerData
 *
 * @author Carlos Amores
 */
export async function run() : Promise<void>
{
    const reply : Discord.MessageEmbed = new Discord.MessageEmbed(
        {
            title       : 'Source Code',
            color       : [124, 139, 245],
            thumbnail   : {
                url : 'https://cdn.discordapp.com/avatars/' + this.client.user.id + '/' + this.client.user.avatar + '.png?size=1024'
            },
            description : 'View the bot\'s source code on GitHub: https://github.com/vicinity-gaming/discord-voice-bot/tree/master'
        }
    );
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
        commandName        : 'Source',
        commandDescription : 'Display information about the bot\'s source code',
        commandUsage       : '.source'
    };
}
