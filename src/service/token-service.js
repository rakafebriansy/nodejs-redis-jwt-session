import jwt from "jsonwebtoken"
import { logger } from "../application/logging.js";

const secret = 'secret';

const create = (user) => {
    const token = jwt.sign({
        username: user.username
    }, secret, {
        algorithm: 'HS256',
        expiresIn: '1d'
    });

    return token;
}

const verify = (token) => {
    try {
        const decoded = jwt.verify(token, secret, {
            algorithms: 'HS256'
        });

        return {
            username: decoded.username
        };
    } catch (e) {
        logger.error(e);
        return null;
    }
}

export default {
    create, verify
}