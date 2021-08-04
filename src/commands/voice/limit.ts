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

            if (this.arguments[0] === '' || Number.isNaN(Number(this.arguments[0])))
            {
                this.message.reply('You must specify a limit.').catch(console.error);
                return;
            }

            let iLimit : number = Number(this.arguments[0]);
            if (iLimit > 99 || iLimit < 0)
            {
                this.message.reply('The limit must be a number between zero and ninety-nine.').catch(console.error);
                return;
            }

            vc.edit(
                {
                    userLimit : iLimit
                }
            )
                .then(() =>
                {
                    this.message.reply('Channel limit changed.').catch(console.error);
                })
                .catch(console.error);
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
        commandName        : 'Voice Limit',
        commandDescription : 'Set a limit on the amount of users that can connect to your channel',
        commandUsage       : '.voice.limit 0-99'
    };
}
