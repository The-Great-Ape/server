import User from './User.js';
import UserServer from './UserServer.js';
import UserWallet from './UserWallet.js';

class UserSession {

    static async getByAddress(address){
        let userWallet = await UserWallet.getByAddress(address);
        let user;

        if(userWallet){
            user = await User.getById(userWallet.userId);
            return {
                ...user,
                wallets: [userWallet]
            }
        }else{
            return UserSession.createUserSession(address);
        }
    }

    static async createUserSession(address, serverId){
        let user = await User.createUser();
        let userWallet = await UserWallet.createUserWallet(user.userId, address);
        let userServer;

        if(serverId){
            userServer = await UserServer.createrUserServer(user.userId, serverId);
        }
        
        return {
            ...user,
            wallets: [userWallet],
            servers: [userServer]
        }
    }
}

export default UserSession;