module.exports = {
    jwt: {
        secret: process.env.AUTH_SECRE || "defualt",
        expiresIn: "1d"
    }
};