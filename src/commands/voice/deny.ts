import * as Discord            from 'discord.js';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';

/**
 * Command which allows the owner of a temporary voice channel to deny connection to their channel to a certain member
 * or members.
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
                this.message.reply('You did not tag anyone to deny.').catch(console.error);
                return;
            }

            let perms : Array<Discord.OverwriteResolvable> = Array.from(vc.permissionOverwrites.values());
            this.message.mentions.members.each(function (m : Discord.GuildMember)
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
                .then(() =>
                {
                    this.message.reply('The mentioned member(s) can no longer connect to your channel.').catch(console.error);
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
