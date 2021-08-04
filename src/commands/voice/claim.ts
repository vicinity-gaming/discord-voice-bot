import * as Discord            from 'discord.js';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';

/**
 * Command which transfers ownership of the channel to the invoker if the owner is no longer in the
 * voice channel.
 *
 * @this CommandHandlerData
 *
 * @author Carlos Amores
 */
export async function run() : Promise<void>
{
    let vc : Discord.VoiceChannel | null = this.message.member.voice.channel;
    if (vc === null)
    {
        this.message.reply('You are not in a voice channel.').catch(console.error);
        return;
    }

    TemporaryVoiceChannel.findOne(
        {
            where : {
                channel_id : vc.id,
                guild_id   : this.message.guild.id,
                alive      : true
            }
        }
    )
        .then((tvc : TemporaryVoiceChannel | null) =>
        {
            if (tvc === null)
            {
                this.message.reply('You are not in a temporary voice channel.').catch(console.error);
                return;
            }
            else if (tvc.memberIsOwner(this.message.member))
            {
                this.message.reply('You already own the channel. What are you doing??').catch(console.error);
                return;
            }
            else if (Array.from(vc.members.keys()).includes(tvc.owner_id))
            {
                this.message.reply('You cannot claim a channel while the owner is still in the channel.').catch(console.error);
                return;
            }


            // Checks passed, give channel ownership to the invoker.
            tvc.owner_id = this.message.member.id;
            tvc.save()
                .then(() =>
                {
                    this.message.reply('You own the channel now. Use your newfound power wisely m\'lord.').catch(console.error);
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
