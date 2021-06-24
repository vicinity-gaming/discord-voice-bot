import * as Discord            from 'discord.js';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';

/**
 * Command which transfers ownership of the channel to the invoker if the owner is no longer in the
 * voice channel.
 *
 * @param client
 * @param msg
 *
 * @author Carlos Amores
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
            else if (tvc.owner_id === msg.member.id)
            {
                msg.reply('You already own the channel. What are you doing??').catch(console.error);
                return;
            }
            else if (Array.from(vc.members.keys()).includes(tvc.owner_id))
            {
                msg.reply('You cannot claim a channel while the owner is still in the channel.').catch(console.error);
                return;
            }


            // Checks passed, give channel ownership to the invoker.
            tvc.owner_id = msg.member.id;
            tvc.save()
                .then(function ()
                {
                    msg.reply('You own the channel now. Use your newfound power wisely m\'lord.').catch(console.error);
                })
                .catch(console.error);
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
        commandName        : 'Voice Claim',
        commandDescription : 'Gives ownership of the channel to the member invoking the command if the owner is no longer in the channel',
        commandUsage       : '.voice.claim'
    }
}
