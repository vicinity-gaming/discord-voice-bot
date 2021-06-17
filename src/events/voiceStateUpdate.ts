import * as Discord from 'discord.js';
import * as _       from 'lodash';
import AppConfig    from '../types/AppConfig';

/**
 * Handles logic for when an user joins a tracked channel.
 *
 * @param user
 * @param channel
 * @param config
 *
 * @author Carlos Amores
 */
function userJoinedChannel(user : Discord.GuildMember, channel : Discord.VoiceChannel, config : AppConfig) : void
{

}

/**
 * Handles logic for when an user leaves a tracked channel.
 *
 * @param user
 * @param channel
 * @param config
 *
 * @author Carlos Amores
 */
function userLeftChannel(user : Discord.GuildMember, channel : Discord.VoiceChannel, config : AppConfig) : void
{

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

    if (oVState.channel === null && nVState.channel !== null && _.keys(config.tracked_guilds).includes(nVState.guild.id) && !config.tracked_guilds[nVState.guild.id].untracked_voice_channels.includes(nVState.channel.id))
    {
        userJoinedChannel(nVState.member, nVState.channel, config);
    }
    else if (oVState.channel !== null && nVState.channel === null && _.keys(config.tracked_guilds).includes(oVState.guild.id) && !config.tracked_guilds[oVState.guild.id].untracked_voice_channels.includes(oVState.channel.id))
    {
        userLeftChannel(oVState.member, oVState.channel, config);
    }
}
