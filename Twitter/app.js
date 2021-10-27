const express = require('express');
const twitter = require('./twitterCalls.js')
const fs = require('fs');
const encoder = express.urlencoded();
const hostname = '127.0.0.1';
const port = 3000;
const app = express();


app.get('/',function(req,res)
{
    res.sendFile(__dirname+'/index.html');
})
app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
    fs.writeFileSync('test.json','[[0,0]]');
});

function sendJSON()
{
    res.sendFile(__dirname+'/test.json')
}
app.get('/data', function(req,res)
{
    res.sendFile(__dirname+'/test.json')
    //setInterval(sendJSON(),10000)
});

app.post('/search',encoder,function(req,res)
{
    //console.log(req)
    //twitter.writeJson();
    var query = req.body.query
    twitter.getStream(query);
})