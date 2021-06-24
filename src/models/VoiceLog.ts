import {AllowNull, AutoIncrement, Column, DataType, Model, PrimaryKey, Table} from 'sequelize-typescript';
import * as Discord                                                           from 'discord.js';

@Table(
    {
        tableName  : 'voice_logs',
        charset    : 'utf8mb4',
        collate    : 'utf8mb4_unicode_ci',
        timestamps : false
    }
)
/**
 * Class VoiceLog
 *
 * Represents the moment in time a member joins or leaves a certain channel allowing for tracking of voice
 * activity and subsequent XP issue.
 *
 * @author Carlos Amores
 */
export class VoiceLog extends Model
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
     * The Discord ID of the member who owns the voice log.
     */
    public discord_id : Discord.Snowflake;
    @AllowNull(false)
    @Column
    /**
     * The ID of the guild for which the activity is being recorded.
     */
    public guild_id : Discord.Snowflake;
    @AllowNull(false)
    @Column
    /**
     * The ID of the channel that was joined or left.
     */
    public channel_id : Discord.Snowflake;
    @AllowNull(false)
    @Column(DataType.SMALLINT.UNSIGNED)
    /**
     * The action which occurred in the specified time.
     */
    public vc_action : VoiceLog.ACTIONS;
    @AllowNull(false)
    @Column(DataType.FLOAT)
    /**
     * The amount of XP to issue per second.
     */
    public xp_rate : number;
    @AllowNull(false)
    @Column
    /**
     * The moment when action took place.
     */
    public action_timestamp : Date;
}

export namespace VoiceLog
{
    /**
     * Possible assignable values to VoiceLog::vc_action.
     */
    export enum ACTIONS
    {
        JOIN  = 1 << 0,
        LEAVE = 1 << 1
    }
}