import jwt from "jsonwebtoken"
import { logger } from "../application/logging.js";
import { redis } from "../application/redis.js";

const secret = 'secret';

const create = async (user) => {
    const token = jwt.sign({
        username: user.username
    }, secret, {
        algorithm: 'HS256',
        expiresIn: '1d'
    });

    // Redis cache + jwt
    await redis.setex(token, 86400, user.username);

    return token;
}

const verify = async (token) => {
    // Redis cache + jwt
    const value = await redis.get(token);
    if (value == null) {
        return null;
    } else {
        return {
            username: value
        };
    }

    // // JWT
    // try {
    //     const decoded = jwt.verify(token, secret, {
    //         algorithms: 'HS256'
    //     });

    //     return {
    //         username: decoded.username
    //     };
    // } catch (e) {
    //     logger.error(e);
    //     return null;
    // }
}

export default {
    create, verify
}