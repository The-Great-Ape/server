import User from './User.js';
import UserServer from './UserServer.js';
import UserWallet from './UserWallet.js';

class UserSession {

    static async register(address, serverId){
        let user = UserSession.getByAddress(address);

        if(serverId){
            userServer = await UserServer.createUserServer(user.userId, serverId);
        }
    }

    static async getByAddress(address){
        let userWallet = await UserWallet.getByAddress(address);
        let user;

        if(userWallet){
            user = await User.getById(userWallet.userId);
            return {
                ...user,
                wallets: [userWallet]
                //servers: [userServer]
            }
        }else{
            return UserSession.createUserSession(address);
        }
    }

    static async createUserSession(address){
        let user = await User.createUser();
        let userWallet = await UserWallet.createUserWallet(user.userId, address);

        return {
            ...user,
            wallets: [userWallet]
            // servers: [userServer]
        }
    }
}

export default UserSession;