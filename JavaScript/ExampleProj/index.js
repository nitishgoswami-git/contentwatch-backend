require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 4000

app.get('/',(req,res)=>{
    res.send('Hello World')
})

app.get('/twitter',(req,res)=>{
    res.send('nitishGoswami')
})

app.get('/login',(req,res)=>{
    res.send('<h1>Login Page</h1>')
})

app.get('/yt',(req,res)=>{
    res.send('<h2>CoffeeCoder</h2>')
})

app.listen(port,()=>{
    console.log(`app listening on port ${port}`)
})