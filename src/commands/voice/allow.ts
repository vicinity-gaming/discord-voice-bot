import * as Discord            from 'discord.js';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';

/**
 * Command which lets a temporary channel owner allow members into their channel if it is locked.
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

            // Check that there are mentions in the message.
            if (this.message.mentions.members.size === 0)
            {
                this.message.reply('You did not tag anyone to permit.').catch(console.error);
                return;
            }

            // Stack the new permissions on top of the old ones.
            let perms : Array<Discord.OverwriteResolvable> = Array.from(vc.permissionOverwrites.values());
            this.message.mentions.members.each(function (m : Discord.GuildMember)
            {
                perms.push(
                    {
                        id    : m.id,
                        allow : [
                            'CONNECT'
                        ]
                    }
                );
            });
            vc.overwritePermissions(perms)
                .then(() =>
                {
                    this.message.reply('The mentioned member(s) can now connect to your channel.').catch(console.error);
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
        commandUsage       : '.voice.allow @MEMBER1 [@MEMBER2 @MEMBER3 ...]'
    }
}
