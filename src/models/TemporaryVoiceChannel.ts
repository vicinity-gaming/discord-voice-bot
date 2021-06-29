import {AllowNull, AutoIncrement, Column, DataType, Model, PrimaryKey, Table} from 'sequelize-typescript';
import * as Discord                                                           from 'discord.js';

@Table(
    {
        tableName  : 'temporary_voice_channels',
        charset    : 'utf8mb4',
        collate    : 'utf8mb4_unicode_ci',
        timestamps : false
    }
)
/**
 * Class TemporaryVoiceChannel
 *
 * Represents a record of a temporary voice channel in the discord server.
 *
 * @author Carlos Amores
 */
export class TemporaryVoiceChannel extends Model
{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.BIGINT.UNSIGNED)
    /**
     * Row UID.
     */
    public id : bigint;
    @AllowNull(false)
    @Column
    /**
     * The Discord ID of the person who owns the temporary channel.
     */
    public owner_id : Discord.Snowflake;
    @AllowNull(false)
    @Column
    /**
     * The ID of the guild where the channel was created.
     */
    public guild_id : Discord.Snowflake;
    @AllowNull(false)
    @Column
    /**
     * The ID of the channel represented by the model.
     */
    public channel_id : Discord.Snowflake;
    @AllowNull(false)
    @Column
    /**
     * The name of the channel in the server.
     */
    public channel_name : string;
    @AllowNull(false)
    @Column
    /**
     * Whether the channel still exists on the server, or it has already been automatically removed.
     */
    public alive : boolean;

    /**
     * Checks whether the provided GuildMember is the current owner of the channel.
     *
     * @author Carlos Amores
     */
    public memberIsOwner(member : Discord.GuildMember) : boolean
    {
        return member.id === this.owner_id;
    }
}
