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
            else if (!tvc.memberIsOwner(msg.member))
            {
                msg.reply('You do not own the voice channel.').catch(console.error);
                return;
            }

            // Check that there are mentions in the message.
            if (msg.mentions.members.size === 0)
            {
                msg.reply('You did not tag anyone to deny.').catch(console.error);
                return;
            }

            let perms : Array<Discord.OverwriteResolvable> = Array.from(vc.permissionOverwrites.values());
            msg.mentions.members.each(function (m : Discord.GuildMember)
            {
                perms.push(
                    {
                        id   : m.id,
                        deny : [
                            'CONNECT'
                        ]
                    }
                );
            });

            vc.overwritePermissions(perms)
                .then(function ()
                {
                    msg.reply('The mentioned member(s) can no longer connect to your channel.').catch(console.error);
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
        commandName        : 'Voice Deny',
        commandDescription : 'Denies one or more members entry to your channel',
        commandUsage       : '.voice.deny @MEMBER1 [@MEMBER2 @MEMBER3 ...]'
    }
}
