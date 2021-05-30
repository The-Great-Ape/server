import DiscordHandler from './discord';
import './config';

const main = async () => {
    await DiscordHandler.initHandler();
};

main();
