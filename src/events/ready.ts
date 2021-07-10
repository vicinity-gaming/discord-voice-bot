import * as Discord from 'discord.js';

/**
 * Discord ready event handler.
 * @param client
 *
 * @author Carlos Amores
 * {@link https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-ready}
 */
export async function handleEvent(client : Discord.Client) : Promise<void>
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
