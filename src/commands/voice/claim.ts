import * as Discord            from 'discord.js';
import * as _                  from 'lodash';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';
import {GuildChannel}          from "discord.js";

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

    // Check that the member does not already own other channels.
    TemporaryVoiceChannel.findOne(
        {
            where : {
                owner_id : this.message.member.id,
                guild_id : this.message.guild.id,
                alive    : true
            }
        }
    )
        .then((ntvc : TemporaryVoiceChannel | null) =>
        {
            if (ntvc !== null)
            {
                this.message.reply('You already own a voice channel.').catch(console.error);
            }
            else
            {
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
                        else if (vc.members.has(tvc.owner_id))
                        {
                            this.message.reply('You cannot claim a channel while the owner is still in the channel.').catch(console.error);
                            return;
                        }

                        if (this.config.tracked_guilds[this.message.guild.id].event_channels_cats.includes(vc.parent.id))
                        {
                            /*
                             * When attempting to claim an event voice channel all of the previous conditions must be true on top of
                             * the member attempting to claim the voice channel having permission to connect to the join to create
                             * event voice channel.
                             */
                            let joinToCreateEventId : Discord.Snowflake    = this.config.tracked_guilds[this.message.guild.id].create_event_channel;
                            let joinToCreateEventVc : Discord.GuildChannel = this.message.guild.channels.cache.get(joinToCreateEventId);

                            if (joinToCreateEventVc instanceof Discord.VoiceChannel && joinToCreateEventVc.permissionsFor(this.message.member).has('CONNECT'))
                            {
                                TemporaryVoiceChannel.findAll(
                                    {
                                        where : {
                                            owner_id : tvc.owner_id,
                                            guild_id : this.message.guild.id,
                                            alive    : true
                                        }
                                    }
                                )
                                    .then((tvcs : Array<TemporaryVoiceChannel>) =>
                                    {
                                        // Check that the owner is not in any of the channels they own.
                                        let ownerInCh : boolean               = false;
                                        let tvcIds : Array<Discord.Snowflake> = tvcs.map(t => t.channel_id);
                                        this.message.guild.channels.cache.each((c : GuildChannel) =>
                                        {
                                            if (tvcIds.includes(c.id) && !ownerInCh && c.members.has(tvc.owner_id))
                                            {
                                                ownerInCh = true;
                                            }
                                        });

                                        if (!ownerInCh)
                                        {
                                            _.each(tvcs, (c : TemporaryVoiceChannel) =>
                                            {
                                                c.owner_id = this.message.member.id;
                                                c.save().catch(console.error);
                                            });
                                            this.message.reply('You own the channel and any sub-channels now. Your power is unrivaled m\'lord.').catch(console.error);
                                        }
                                        else
                                        {
                                            this.message.reply('You cannot claim a channel while the owner is still in one of their channels.').catch(console.error);
                                        }

                                    });
                            }
                            else
                            {
                                this.message.reply('You do not have permission to do that.').catch(console.error);
                            }
                        }
                        else if (this.config.tracked_guilds[this.message.guild.id].temporary_channels_cats.includes(vc.parent.id))
                        {
                            // Checks passed, give channel ownership to the invoker.
                            tvc.owner_id = this.message.member.id;
                            tvc.save()
                                .then(() =>
                                {
                                    this.message.reply('You own the channel now. Use your newfound power wisely m\'lord.').catch(console.error);
                                })
                                .catch(console.error);
                        }
                    });
            }
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
