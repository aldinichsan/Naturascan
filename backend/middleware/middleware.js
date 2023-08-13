require('dotenv').config()
const jsonwebtoken = require('jsonwebtoken')

module.exports = async (req,res,next) =>{
    const token = req.header('token')
    const decode = jsonwebtoken.verify(token, process.env.SECRET)
    if(!token ){
        return res.status(401).json ({
            status: false,
            message: "tidak ada token"
        })
    }
    next()
}