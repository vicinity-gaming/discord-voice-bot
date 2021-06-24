import * as Discord            from 'discord.js';
import * as _                  from 'lodash';
import AppConfig               from '../types/AppConfig';
import {TemporaryVoiceChannel} from '../models/TemporaryVoiceChannel';
import {VoiceLog}              from '../models/VoiceLog';

/**
 * Handles logic for when a user joins a tracked channel.
 * TODO: Event channels.
 *
 * @param user
 * @param channel
 * @param config
 *
 * @author Carlos Amores
 */
function userJoinedChannel(user : Discord.GuildMember, channel : Discord.VoiceChannel, config : AppConfig) : void
{
    // Special case to check whether the joined channel was one to create temporary channels.
    if (channel.id === config.tracked_guilds[user.guild.id].create_temporary_channel)
    {
        // Check that the user does not already own other channels.
        TemporaryVoiceChannel.findOne(
            {
                where : {
                    owner_id : user.id,
                    guild_id : user.guild.id,
                    alive    : true
                }
            }
        )
            .then(function (tvc : TemporaryVoiceChannel | null)
            {
                if (tvc !== null)
                {
                    user.send('You already own a channel and cannot create another one.').catch(console.error);
                    user.voice.kick().catch(console.error);
                }
                else
                {
                    let category : Discord.Snowflake;
                    _.each(config.tracked_guilds[user.guild.id].temporary_channels_cats, function (tcc : Discord.Snowflake)
                    {
                        let checkingCat : Discord.GuildChannel = user.guild.channels.cache.get(tcc);
                        if (checkingCat instanceof Discord.CategoryChannel && checkingCat.children.size < 50)
                        {
                            category = checkingCat.id;
                            return false;
                        }
                    });

                    // Check that there is an available category.
                    if (category !== undefined)
                    {
                        user.guild.channels.create(
                            user.displayName + '\'s Channel',
                            {
                                parent               : category,
                                type                 : 'voice',
                                permissionOverwrites : [
                                    {
                                        id    : user.guild.roles.everyone.id,
                                        allow : 'VIEW_CHANNEL',
                                        deny  : 'MANAGE_CHANNELS'
                                    }
                                ]
                            }
                        )
                            .then(function (vc : Discord.VoiceChannel)
                            {
                                let tvcRecord : TemporaryVoiceChannel = new TemporaryVoiceChannel(
                                    {
                                        owner_id     : user.id,
                                        guild_id     : user.guild.id,
                                        channel_id   : vc.id,
                                        channel_name : vc.name,
                                        alive        : true
                                    }
                                );
                                tvcRecord.save().catch(console.error);
                                user.voice.setChannel(vc).catch(console.error);
                            });
                    }
                    else
                    {
                        user.send('All categories are full, please contact an administrator!').catch(console.error);
                    }
                }
            });
    }
    else if (config.tracked_guilds[user.guild.id].untracked_voice_channels.includes(channel.id))
    {
        return;
    }

    // At this point the member has certainly joined a tracked channel so the time spent in voice should be recorded.
    const joinDate : Date = new Date();
    const vcl : VoiceLog  = new VoiceLog(
        {
            discord_id       : user.id,
            guild_id         : user.guild.id,
            channel_id       : channel.id,
            vc_action        : VoiceLog.ACTIONS.JOIN,
            xp_rate          : config.tracked_guilds[user.guild.id].event_channels_cats.includes(channel.parent.id) ? config.tracked_guilds[user.guild.id].xp_rates.event : config.tracked_guilds[user.guild.id].xp_rates.standard,
            action_timestamp : joinDate
        }
    );
    vcl.save().catch(console.error);
}

/**
 * Handles logic for when a user leaves a tracked channel.
 * TODO: Event channels.
 *
 * @param user
 * @param channel
 * @param config
 *
 * @author Carlos Amores
 */
function userLeftChannel(user : Discord.GuildMember, channel : Discord.VoiceChannel, config : AppConfig) : void
{
    // Check that the user left a channel in a category that we care about.
    if ((config.tracked_guilds[user.guild.id].temporary_channels_cats.includes(channel.parent.id) || config.tracked_guilds[user.guild.id].event_channels_cats.includes(channel.parent.id)) && channel.members.size === 0 && channel.id !== config.tracked_guilds[user.guild.id].create_temporary_channel && channel.id !== config.tracked_guilds[user.guild.id].create_event_channel)
    {
        TemporaryVoiceChannel.findOne(
            {
                where : {
                    guild_id   : user.guild.id,
                    channel_id : channel.id
                }
            }
        )
            .then(function (tvc : TemporaryVoiceChannel | null)
            {
                if (tvc !== null)
                {
                    tvc.alive = false;
                    tvc.save().catch(console.error);
                }
                else
                {
                    console.error('User left a channel (' + channel.id + ') from a tracked category which did not have a DB record?');
                }
                // Delete the empty channel anyway but WTF?
                channel.delete().catch(console.error);
            });
    }
    else if (config.tracked_guilds[user.guild.id].untracked_voice_channels.includes(channel.id))
    {
        return;
    }

    const leaveDate : Date = new Date();
    const vcl : VoiceLog   = new VoiceLog(
        {
            discord_id       : user.id,
            guild_id         : user.guild.id,
            channel_id       : channel.id,
            vc_action        : VoiceLog.ACTIONS.LEAVE,
            xp_rate          : config.tracked_guilds[user.guild.id].event_channels_cats.includes(channel.parent.id) ? config.tracked_guilds[user.guild.id].xp_rates.event : config.tracked_guilds[user.guild.id].xp_rates.standard,
            action_timestamp : leaveDate
        }
    );
    vcl.save().catch(console.error);
}

/**
 * Discord voiceStateUpdate event handler.
 * @param client
 * @param config
 * @param oVState
 * @param nVState
 *
 * @author Carlos Amores
 * {@link https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-voiceStateUpdate}
 */
export async function handleEvent(
    client : Discord.Client,
    config : AppConfig,
    oVState : Discord.VoiceState,
    nVState : Discord.VoiceState
) : Promise<void>
{
    if (oVState.member === null || nVState.member === null)
    {
        return;
    }

    if (oVState.channel === null && nVState.channel !== null && _.keys(config.tracked_guilds).includes(nVState.guild.id))
    {
        userJoinedChannel(nVState.member, nVState.channel, config);
    }
    else if (oVState.channel !== null && nVState.channel === null && _.keys(config.tracked_guilds).includes(oVState.guild.id))
    {
        userLeftChannel(oVState.member, oVState.channel, config);
    }
    else if (oVState.channel !== null && nVState.channel !== null && oVState.channel.id !== nVState.channel.id)
    {
        if (_.keys(config.tracked_guilds).includes(oVState.guild.id))
        {
            userLeftChannel(oVState.member, oVState.channel, config);
        }
        if (_.keys(config.tracked_guilds).includes(nVState.guild.id))
        {
            userJoinedChannel(nVState.member, nVState.channel, config);
        }
    }
}
