import jwt from "jsonwebtoken"
import { logger } from "../application/logging.js";

const secret = 'secret';

const create = (user) => {
    return jwt.sign({
        username: user.username
    }, secret, {
        algorithm: 'HS256',
        expiresIn: '1d'
    });
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