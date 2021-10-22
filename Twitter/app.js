const express = require('express');
const hostname = '127.0.0.1';
const port = 3000;
const app = express();


app.get('/',function(req,res)
{
    res.sendFile(__dirname+'/index.html');
})
app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
   
});