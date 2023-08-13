const mongoose  = require ('mongoose')

const userSchema = new mongoose.Schema({
    username:{
        type : String
    },
    password:{
        type : String
    },
    email:{
        type : String
    },
})

const User = mongoose.model('User', userSchema)

const imageSchema = new mongoose.Schema({
    image:{
        type: String,
        required: true
    }
})

const Image = mongoose.model('Image', imageSchema)
module.exports = {User,Image}
