# Vicinity Gaming's Discord Voice Bot

This bot's purpose is to handle most voice channel related operations such as voice activity tracking and temporary
channel management as of right now.

The idea is to make the bot as generic as possible. However, at the end of the day it is a custom solution for a gaming
community, so the setup is not going to be completely generic, and it will have certain quirks. In this case, the bot
works with MySQL and an Invision Community (IPS) setup.

## Environment variables

The bot is intended to work in a Docker container. As such, sensitive information like bot token, database credentials,
etc. is passed as environment variables when running the container. The necessary environment variables are the
following:

`DISCORD_CLIENT_TOKEN`  
The client token the bot is going to use to operate.

`DISCORD_MYSQL_HOST`  
The address of the MySQL server the bot is going to use.

`DISCORD_MYSQL_DB`  
The database the bot is going to connect to. It should follow the schema represented by
the [database models](/src/models).

`DISCORD_MYSQL_USER`  
The name of the user the bot is going to use when connecting to the database.

`DISCORD_MYSQL_PASS`  
The password for the user the bot is going to use when connecting to the database.

`DISCORD_MYSQL_PORT`  
The port number of the MySQL server the bot is going to connect to.

Other OPTIONAL environment variables:

`DEBUG_MODE`  
Determines whether the bot will log debug info to the console (as the debug event triggers). The debug mode can only be
activated by setting this environment variable to `true`; anything else will not enable debug mode.

## Config file

The configuration file contains all the relevant information to allow the bot to work properly and its schema is defined
in the [AppConfig interface](/src/types/AppConfig.ts). Here is a brief example of what it could look like:

```json
{
  "prefix": ".",
  "tracked_guilds": {
    "guild_id": {
      "untracked_voice_channels": [
        "create_temporary_channel_id",
        "create_event_channel_id"
      ],
      "create_temporary_channel": "",
      "temporary_channels_cats": [],
      "create_event_channel": "",
      "event_channels_cats": [],
      "commands_channel": "",
      "command_permissions": {
        "test": [],
        "voice": {
          "join": []
        }
      },
      "command_permissions_override": []
    }
  }
}
```

### Config file breakdown

`prefix`  
Sets the command prefix the bot will listen to. This is also used as the command category separator. For example, if the
command prefix is `!`, the voice join command would look like: `!voice!join @MEMBER`.

`tracked_guilds`  
This object contains relevant information about each tracked guild.

- `untracked_voice_channels` An array of voice channels in the guild which do not count towards voice activity. Some
  candidate channels are the channels used to create other voice channels which are actually tracked.
- `create_temporary_channel` The ID of the voice channel a user must join to create a temporary voice channel.
- `temporary_channels_cats` An array of category IDs under which temporary voice channels can be created. The bot will
  attempt to fill the categories from first to last. Multiple categories are necessary to avoid issues when there are
  more than 50 temporary voice channels.
- `create_event_channel` The ID of the voice channel a user must join to create an event channel.
- `event_channels_cats` Same as `temporary_channels_cats` but for temporary event channels.
- `commands_channel` The ID of a dedicated text channel where the bot commands will be used. If left empty, the bot will
  listen for commands in any channel.
- `command_permissions` This object contains information about what roles may use certain commands. The object structure
  is as shown in the example above. The key can be either a command or group of commands. In the case of the former, the
  value must be an array of role IDs which can use the command. In the case of the latter, the key can be a command
  within the group (in which case the value is an array of role IDs which can use the command) or another group within
  the first group in a recursive structure. If a command or group of commands has no specific permissions, we assume
  that everyone may use the command.
- `command_permissions_override` An array of role IDs which override all command permissions. Members with at least one
  of the roles in the array may use all the commands regardless of specified command permissions.
