import * as Discord            from 'discord.js';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';

/**
 * Command to permit the owner of a temporary channel to
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
            else if (tvc.owner_id !== msg.member.id)
            {
                msg.reply('You do not own the voice channel.').catch(console.error);
                return;
            }

            // Check that there are mentions in the message.
            if (msg.mentions.members.size === 0)
            {
                msg.reply('You did not tag anyone to permit.').catch(console.error);
                return;
            }

            let permsObj : Array<Discord.OverwriteResolvable> = [];
            msg.mentions.members.each(function (m : Discord.GuildMember)
            {
                permsObj.push(
                    {
                        id    : m.id,
                        allow : [
                            'CONNECT'
                        ]
                    }
                );
            });

            vc.overwritePermissions(permsObj)
                .then(function ()
                {
                    msg.reply('The mentioned member(s) can now connect to your channel.').catch(console.error);
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
        commandName        : 'Voice Allow',
        commandDescription : 'Allows one or more members to join your channel',
        commandUsage       : '.voice.allow @MEMBER1 [@MEMBER2 @MEMBER3]'
    }
}
