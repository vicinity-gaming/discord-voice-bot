import * as Discord        from 'discord.js';
import AppConfig           from './AppConfig';
import {Request, Response} from 'express';

/**
 *  Interface EndpointFile
 *
 *  Represents an object resulting from the export of a file which defines a callback function to handle an HTTP
 *  request being sent to an endpoint determined by the name and location of the file within the endpoints directory.
 *
 *  @author Carlos Amores
 */
export default interface EndpointFile
{
    /**
     * The function which handles the logic for the endpoint when it receives a request.
     *
     * @param client The bot client which can be used to perform operations on the different guilds the bot is in when
     * a request is received.
     * @param config
     * @param request
     * @param response
     * @param apiKey
     */
    run : (client : Discord.Client, config : AppConfig, request : Request, response : Response, apiKey : string) => void;
}
