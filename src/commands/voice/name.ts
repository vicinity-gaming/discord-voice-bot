import * as Discord            from 'discord.js';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';

/**
 * Renames the voice channel the member is in to what the member specifies given that the member is in a voice channel
 * that can be renamed and that they own the channel.
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
            else if (!tvc.memberIsOwner(this.message.member))
            {
                this.message.reply('You do not own the voice channel.').catch(console.error);
                return;
            }

            tvc.channel_name = this.arguments[0];
            tvc.save().catch(console.error);
            vc.setName(this.arguments[0])
                .then(() =>
                {
                    this.message.reply('Name changed successfully.').catch(console.error);
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
        commandName        : 'Voice Name',
        commandDescription : 'Rename your current voice channel if you are the owner',
        commandUsage       : '.voice.name "NEW NAME"'
    }
}
