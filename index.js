const app = require('express')()
const config = require('config')
const port = process.env.PORT || config.get("port")

const server = app.listen(port,(req,res)  =>{
    res.write(`Server listening for requests on ${port}`);
    console.log(`Server listening for requests on ${port}`)
})

module.exports = server

