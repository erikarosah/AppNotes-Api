const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");
const { compare } = require("bcryptjs");
const { sign } = require("jsonwebtoken");

class SessionController{
    async create(req, res){
        const { email, password } = req.body  

        const user = await knex("users").where({email}).first()

        if(!user){
            throw new AppError("E-mail e/ou senha inválidos", 401)
        }

        const checkPassword = await compare(password, user.password)

        if(!checkPassword){
            throw new AppError("E-mail e/ou senha inválidos", 401)
        }

        const { secret, expiresIn } = authConfig.jwt;
        const token = sign({}, secret, {
            subject: String(user.id),
            expiresIn
        })

        return res.status(200).json({user, token})
    }
};

module.exports = SessionController;