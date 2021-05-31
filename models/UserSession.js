import Server from './Server.js';
import User from './User.js';
import UserServer from './UserServer.js';
import UserWallet from './UserWallet.js';

class UserSession {

    static async register(address, serverId) {
        let user = UserSession.getByAddress(address);

        if (serverId) {
            await UserServer.createUserServer(user.userId, serverId);
        }
    }

    static async getByAddress(address) {
        let userWallet = await UserWallet.getByAddress(address);
        

        if (userWallet) {
	        let userId = userWallet.userId;
			let user, userServers;
            user = await User.getById(userId);
            userServers = await UserServer.getUserServers(userId);
            let servers = await Server.getServers();
            

            return {
                ...user,
                wallets: [userWallet],
                userServers: [userServers],
                servers
            };
        } else {

            return UserSession.createUserSession(address);
        }
    }

    static async createUserSession(address) {
        let user = await User.createUser();
        let userWallet = await UserWallet.createUserWallet(user.userId, address);
        let servers = await Server.getServers();

        return {
            ...user,
            wallets: [userWallet],
            userServers: [],
            servers
        };
    }
}

export default UserSession;
