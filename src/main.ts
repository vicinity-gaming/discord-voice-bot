import * as Discord from 'discord.js';
import * as fs      from 'fs';
import * as _       from 'lodash';
import {Sequelize}  from 'sequelize-typescript';
import AppConfig    from './types/AppConfig';
import CommandFile  from './types/CommandFile';
import EventFile    from './types/EventFile';

const frr    = require('fs-readdir-recursive');
const client = new Discord.Client();

let config : AppConfig = new AppConfig();
_.extend(config, require('../config.json'));

let commands : { [key : string] : CommandFile } = {};
_.each(frr('./commands/'), function (file : string) : void
{
    if (!file.endsWith('.js'))
    {
        return;
    }

    let commandName : string = file.substr(0, file.length - 3).replace('/', config.prefix);
    commands[commandName]    = require('./commands/' + file);
});

_.each(fs.readdirSync('./events/'), function (file : string)
{
    if (!file.endsWith('.js'))
    {
        return;
    }

    let evtName : string    = file.split('.')[0];
    let evtFile : EventFile = require('./events/' + file);
    if (evtName === 'message')
    {
        client.on(evtName, evtFile.handleEvent.bind(null, client, config, commands));
    }
    else
    {
        client.on(evtName, evtFile.handleEvent.bind(null, client, config));
    }
    delete require.cache[require.resolve('./events/' + file)];
});

client.login(process.env.DISCORD_CLIENT_TOKEN).catch(console.error);
