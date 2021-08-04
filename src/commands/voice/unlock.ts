import * as Discord            from 'discord.js';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';

/**
 * Command to lock the channel the person is currently in assuming it's a temporary channel and they own it.
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

            vc.updateOverwrite(
                this.message.member.guild.roles.everyone,
                {
                    CONNECT : null
                }
            )
                .then(() =>
                {
                    this.message.reply('Voice channel unlocked! :unlock:').catch(console.error);
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
        commandName        : 'Voice Unlock',
        commandDescription : 'Unlocks the channel and allows everyone to join',
        commandUsage       : '.voice.unlock'
    };
}