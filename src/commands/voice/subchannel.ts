import * as Discord            from 'discord.js';
import * as _                  from 'lodash';
import CommandHelpData         from '../../types/CommandHelpData';
import {TemporaryVoiceChannel} from '../../models/TemporaryVoiceChannel';

/**
 * Create a temporary event channel which is considered a sub-channel of a temporary event channel which has been
 * created through the standard join to create voice channel. This command is necessary as elevated permissions are
 * required to create an event channel through standard means to ensure abuse does not take place.
 *
 * @this CommandHandlerData
 *
 * @author Carlos Amores
 */
export async function run() : Promise<void>
{
    // Check that the member is in a voice channel of any kind.
    let vc : Discord.VoiceChannel = this.message.member.voice.channel;
    if (vc === null)
    {
        this.message.reply('You are not in a voice channel.').catch(console.error);
        return;
    }

    // Check that the voice channel in question is considered an event voice channel based in its category.
    if (!this.config.tracked_guilds[this.message.guild.id].event_channels_cats.includes(vc.parent.id))
    {
        this.message.reply('You are not in an event voice channel.').catch(console.error);
        return;
    }

    // Check that the member does not already own a voice channel.
    TemporaryVoiceChannel.findOne(
        {
            where : {
                owner_id : this.message.member.id,
                guild_id : this.message.guild.id,
                alive    : true
            }
        }
    )
        .then((tvc : TemporaryVoiceChannel | null) =>
        {
            if (tvc !== null)
            {
                this.message.reply('You already own a voice channel.').catch(console.error);
                return;
            }

            /*
             * Create a new voice channel for the lad. Start by trying to create the channel in the same category as
             * the parent channel.
             */
            let category : Discord.Snowflake       = vc.parent.id;
            let checkingCat : Discord.GuildChannel = this.message.member.guild.channels.cache.get(category);
            if (checkingCat instanceof Discord.CategoryChannel && checkingCat.children.size === 50)
            {
                _.each(
                    this.config[this.message.guild.id].event_channels_cats,
                    (tcc : Discord.Snowflake) =>
                    {
                        checkingCat = this.message.guild.channels.cache.get(tcc);
                        if (checkingCat instanceof Discord.CategoryChannel && checkingCat.children.size < 50)
                        {
                            category = checkingCat.id;
                            return false;
                        }
                    }
                );
            }

            this.message.guild.channels.create(
                this.arguments[0] === '' ? vc.name.trim() + ' Subchannel' : this.arguments[0],
                {
                    parent               : category,
                    type                 : 'voice',
                    permissionOverwrites : [
                        {
                            id    : this.message.guild.roles.everyone.id,
                            allow : 'VIEW_CHANNEL',
                            deny  : 'MANAGE_CHANNELS'
                        }
                    ]
                }
            )
                .then((vc : Discord.VoiceChannel) =>
                {
                    let tvcRecord : TemporaryVoiceChannel = new TemporaryVoiceChannel(
                        {
                            owner_id     : this.message.member.id,
                            guild_id     : this.message.guild.id,
                            channel_id   : vc.id,
                            channel_name : vc.name,
                            alive        : true
                        }
                    );
                    tvcRecord.save().catch(console.error);
                    this.message.member.voice.setChannel(vc).catch(console.error);
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
        commandName        : 'Voice Sub-channel',
        commandDescription : 'Create a sub-channel from a temporary event voice channel',
        commandUsage       : '.voice.subchannel [NAME]'
    };
}