import * as Discord    from 'discord.js';
import CommandHelpData from '../../types/CommandHelpData';

/**
 * Command to connect the person executing the command to the voice channel of the person who got tagged in the message
 * should the person executing the command have permission to join the voice channel of the tagged person.
 *
 * @param client
 * @param msg
 *
 * @author Carlos Amores
 */
export async function run(client : Discord.Client, msg : Discord.Message) : Promise<void>
{
    let targetChannel : Discord.VoiceChannel | null = msg.guild.member(msg.mentions.users.first()).voice.channel;
    if (targetChannel === null)
    {
        msg.reply('The tagged member is not in a voice channel.').catch(console.error);
        return;
    }

    let userPerms : Readonly<Discord.Permissions> = targetChannel.permissionsFor(msg.member);
    if (userPerms.has(Discord.Permissions.FLAGS.CONNECT) && (targetChannel.userLimit === 0 || targetChannel.members.size < targetChannel.userLimit))
    {
        msg.member.voice.setChannel(targetChannel).catch(console.error);
    }
    else
    {
        msg.reply('You do not have permission to join the channel or the channel is full.').catch(console.error);
    }
}

/**
 * Return relevant information about the current command.
 *
 * @author Carlos Amores
 */
export function help() : CommandHelpData
{
    return {
        commandName        : 'Voice Join',
        commandDescription : 'Join the tagged person\'s channel',
        commandUsage       : '.voice.join @MEMBER'
    }
}
