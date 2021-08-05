import * as Discord            from 'discord.js';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';

/**
 * Limit the amount of people who can connect to the voice channel of the member running the command.
 *
 * @this CommandHandlerData
 *
 * @author Carlos Amores
 * @author Jacob Marsengill
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
            else if (!tvc.memberIsOwner(this.message.member))
            {
                this.message.reply('You do not own the voice channel.').catch(console.error);
                return;
            }

            // Check that there are mentions in the message.
            if (this.message.mentions.members.size === 0)
            {
                this.message.reply('You did not mention anyone to kick.').catch(console.error);
                return;
            }

            let kickedAnyone : boolean = false;
            this.message.mentions.members.each((m : Discord.GuildMember) =>
            {
                if (m.voice.channel?.id === vc.id)
                {
                    m.voice.kick().catch(console.error);
                    kickedAnyone = true;
                }
            });

            if (kickedAnyone)
            {
                this.message.reply('The mentioned member(s) have been kicked from the channel.').catch(console.error);
            }
            else
            {
                this.message.reply('The mentioned member(s) could not be kicked.').catch(console.error);
            }
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
        commandUsage       : '.voice.kick @MEMBER1 [@MEMBER2 @MEMBER3 ...]'
    }
}
