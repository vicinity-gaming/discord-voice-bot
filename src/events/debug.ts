import * as Discord from 'discord.js';
import AppConfig    from '../types/AppConfig';

/**
 * Discord debug event handler.
 * @param client
 * @param config
 * @param info
 *
 * @author Carlos Amores
 * {@link https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-debug}
 */
export async function handleEvent(client : Discord.Client, config : AppConfig, info : string) : Promise<void>
{
    if (config.debug_mode)
    {
        console.info(info);
    }
}
