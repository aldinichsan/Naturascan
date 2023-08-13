require('dotenv').config()
const express = require ('express')
const bodyParser = require('body-parser')
const app = express()
const RouteUser = require('./routes/user')
const mongoose = require ('mongoose')
const path = require("path")
const src = path.join(__dirname, "views")
const ngrok = require("@ngrok/ngrok");

mongoose.connect(process.env.MONGO_URL,{
    useUnifiedTopology: true,
})
.then(res =>{
    console.log('database connected')
})
.catch(e =>{
    console.log(e)
})
app.use(express.static(src))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use('/', RouteUser)

// ngrok.listen(app).then(() => {
//     console.log("established tunnel at: " + app.tunnel.url());
//   });

app.listen(process.env.PORT,(req,res) => {
    console.log(`server run in port ${process.env.PORT}`)
})