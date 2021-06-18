import * as Discord            from 'discord.js';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';

/**
 * Limit the amount of people who can connect to the voice channel of the member running the command.
 *
 * @param client
 * @param msg
 * @param limit
 *
 * @author Carlos Amores
 * @author Jacob Marsengill
 */
export async function run(client : Discord.Client, msg : Discord.Message, limit : string) : Promise<void>
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

            if (limit === '' || Number.isNaN(Number(limit)))
            {
                msg.reply('You must specify a limit.').catch(console.error);
                return;
            }

            let iLimit : number = Number(limit);
            if (iLimit > 99 || iLimit < 0)
            {
                msg.reply('The limit must be a number between zero and ninety-nine.').catch(console.error);
                return;
            }

            vc.edit(
                {
                    userLimit : iLimit
                }
            )
                .then(function ()
                {
                    msg.reply('Channel limit changed.').catch(console.error);
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
