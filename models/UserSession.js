import User from './User.js';
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

    static async createUserSession(address){
        
        let user = await User.createUser();
        let userWallet = await UserWallet.createUserWallet(user.userId, address);

        return {
            ...user,
            wallets: [userWallet]
        }
    }
}

export default UserSession;