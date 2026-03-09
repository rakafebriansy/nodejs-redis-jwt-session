const hello = async (req, res, next) => {
    try {
        const user = req.user;
        res.status(200).send(`Hello ${user.username}`);
    } catch (e) {
        next(e);
    }
}

export default { hello }