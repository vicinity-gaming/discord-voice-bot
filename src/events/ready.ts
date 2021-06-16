import * as Discord from 'discord.js';
import AppConfig    from '../types/AppConfig';

/**
 * Discord ready event handler.
 * @param client
 * @param config
 *
 * @author Carlos Amores
 * {@link https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-ready}
 */
export async function handleEvent(client : Discord.Client, config : AppConfig) : Promise<void>
{
    await client.user?.setPresence(
        {
            status   : 'online',
            activity : {
                name : 'Whack-a-Mole with voice channels',
                type : 'PLAYING',
            },
        },
    );
}