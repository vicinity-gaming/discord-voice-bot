import * as Discord                                        from 'discord.js';
import * as fs                                             from 'fs';
import * as _                                              from 'lodash';
import readdirRecursive                                    from 'fs-readdir-recursive';
import express, {Express, NextFunction, Request, Response} from 'express';
import {header, validationResult}                          from 'express-validator';
import {Sequelize}                                         from 'sequelize-typescript';
import AppConfig                                           from './types/AppConfig';
import CommandFile                                         from './types/CommandFile';
import EventFile                                           from './types/EventFile';
import EndpointFile                                        from './types/EndpointFile';


// Wrap the entrypoint in a function that is automatically called so that we may exit early in case of an error.
function main() : void
{
    const apiKey : string = process.env.API_KEY;
    const client          = new Discord.Client();
    const api : Express   = express();

    let config : AppConfig = new AppConfig();
    _.extend(config, require('../config.json'));

    if (process.env.RUN_WITHOUT_MYSQL !== 'true')
    {
        try
        {
            new Sequelize(
                {
                    host     : process.env.DISCORD_MYSQL_HOST,
                    database : process.env.DISCORD_MYSQL_DB,
                    dialect  : 'mysql',
                    username : process.env.DISCORD_MYSQL_USER,
                    password : process.env.DISCORD_MYSQL_PASS,
                    port     : Number(process.env.DISCORD_MYSQL_PORT),
                    pool     : {
                        max  : 5,
                        min  : 0,
                        idle : 10000
                    },
                    models   : [__dirname + '/models/*.ts'],
                    logging  : false
                }
            );
        }
        catch (e)
        {
            console.error(e);
            return;
        }
    }

    let commands : { [key : string] : CommandFile } = {};
    _.each(readdirRecursive('./commands/'), function (file : string) : void
    {
        if (!file.endsWith('.js'))
        {
            return;
        }

        let commandName : string = file.substr(0, file.length - 3).replace('/', config.prefix);
        commands[commandName]    = require('./commands/' + file);
    });

    _.each(fs.readdirSync('./events/'), function (file : string) : void
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

    client.login(process.env.DISCORD_CLIENT_TOKEN)
        .then(function ()
        {
            _.each(readdirRecursive('./endpoints/'), function (file : string) : void
            {
                let splitFile : Array<string> = file.split('/');
                let httpMethod : string       = splitFile.shift();
                if (!['get', 'post', 'patch', 'put', 'delete'].includes(httpMethod) || !file.endsWith('.js'))
                {
                    return;
                }

                let endpointPath : string       = '/' + splitFile.join('/');
                endpointPath                    = endpointPath.substr(0, endpointPath.length - 3);
                let endpointFile : EndpointFile = require('./endpoints/' + file);

                api[httpMethod](
                    endpointPath,
                    header('dvb_key').equals(apiKey),
                    function (rq : Request, rs : Response, n : NextFunction)
                    {
                        try
                        {
                            validationResult(rq).throw();
                            n();
                        }
                        catch (e)
                        {
                            rs.sendStatus(403);
                        }
                    },
                    endpointFile.run.bind(null, client, config, apiKey)
                );
            });

            api.listen(8080);
        })
        .catch(console.error);
}

main();
