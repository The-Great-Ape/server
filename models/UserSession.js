import Server from './Server.js';
import User from './User.js';
import UserServer from './UserServer.js';
import UserWallet from './UserWallet.js';

class UserSession {

    static async registerFromDiscord(userId, publicKey) {
        let user = await User.getById(userId);
        let userWallet = false;

        if (user) {
            userWallet = await UserWallet.createUserWallet(userId, publicKey);
            user.hasWallet = true;
            await user.save();
        }

        if (userWallet) {
            let user = await UserSession.getByAddress(publicKey);
            return user;
        }else{
            throw new Error('Invalid user')
        }
    }

    static async registerFromClient(address) {
        let user = await User.createUser();
        let userWallet = await UserWallet.createUserWallet(user.userId, address);
        let userServers = [];
        
        return UserSession.createUserSession(user, [userWallet], userServers);
    }

    static async getByAddress(address) {
        let userWallet = await UserWallet.getByAddress(address);


        if (userWallet) {
            let userId = userWallet.userId;
            let user = await User.getById(userId);
            let userWallets = await UserWallet.getByUser(userId);
            let userServers = await UserServer.getByUser(userId);

            return UserSession.createUserSession(user, userWallets, userServers);
        } else {
            return UserSession.registerFromClient(address);
        }
    }

    static async createUserSession(user, userWallets, userServers) {
        let servers = await Server.getServers();

        return {
            ...user,
            wallets: userWallets,
            userServers: userServers,
            servers
        };
    }
}

export default UserSession;
