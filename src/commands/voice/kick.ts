import * as Discord            from 'discord.js';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';

/**
 * Limit the amount of people who can connect to the voice channel of the member running the command.
 *
 * @param client
 * @param msg
 *
 * @author Carlos Amores
 * @author Jacob Marsengill
 */
export async function run(client : Discord.Client, msg : Discord.Message) : Promise<void>
{
    let vc : Discord.VoiceChannel | null = msg.member.voice.channel;
    if (vc === null)
    {
        msg.reply('You are not in a voice channel.').catch(console.error);
        return;
    }

    TemporaryVoiceChannel.findOne(
        {
            where : {
                channel_id : vc.id,
                guild_id   : msg.guild.id,
                alive      : true
            }
        }
    )
        .then(function (tvc : TemporaryVoiceChannel | null)
        {
            if (tvc === null)
            {
                msg.reply('You are not in a temporary voice channel.').catch(console.error);
                return;
            }
            else if (tvc.owner_id !== msg.member.id)
            {
                msg.reply('You do not own the voice channel.').catch(console.error);
                return;
            }

            // Check that there are mentions in the message.
            if (msg.mentions.members.size === 0)
            {
                msg.reply('You did not mention anyone to kick.').catch(console.error);
                return;
            }

            msg.mentions.members.each(function (m : Discord.GuildMember)
            {
                if (m.voice.channel?.id === vc.id)
                {
                    m.voice.kick().catch(console.error);
                }
            });

            msg.reply('The mentioned member(s) have been kicked from the channel.').catch(console.error);
        });
}

/**
 * Return relevant information about the current command.
 *
 * @author Carlos Amores
 * @author Jacob Marsengill
 */
export function help() : CommandHelpData
{
    return {
        commandName        : 'Voice Kick',
        commandDescription : 'Kicks one or more members from your channel',
        commandUsage       : '.voice.kick @MEMBER1 [@MEMBER2 @MEMBER3]'
    }
}
