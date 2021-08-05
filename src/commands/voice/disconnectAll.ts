import * as Discord    from 'discord.js';
import CommandHelpData from '../../types/CommandHelpData';

/**
 * Command which finds all members connected to voice channels and disconnects them from their channel. Useful to
 * perform maintenance on the voice bot.
 *
 * @this CommandHandlerData
 *
 * @author Carlos Amores
 */
export async function run() : Promise<void>
{
    this.message.guild.channels.cache.each(function (channel : Discord.GuildChannel)
    {
        if (!(channel instanceof Discord.VoiceChannel))
        {
            return;
        }

        channel.members.each((member : Discord.GuildMember) =>
        {
            member.voice.kick();
        });
    });
}

/**
 * Return relevant information about the current command.
 *
 * @author Carlos Amores
 */
export function help() : CommandHelpData
{
    return {
        commandName        : 'Voice Disconnect All',
        commandDescription : 'Disconnects all members from their voice channel',
        commandUsage       : '.voice.disconnectAll'
    };
}
