import * as Discord from 'discord.js';
import AppConfig    from '../types/AppConfig';

/**
 * Discord warn event handler.
 * @param client
 * @param config
 * @param warning
 *
 * @author Carlos Amores
 * {@link https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-warn}
 */
export async function handleEvent(client : Discord.Client, config : AppConfig, warning : string) : Promise<void>
{
    console.warn(warning);
}
