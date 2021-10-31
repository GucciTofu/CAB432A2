const express = require('express');
const twitter = require('./twitterCalls.js')
const fs = require('fs');
const encoder = express.urlencoded();
const hostname = '127.0.0.1';
const port = 3000;
const app = express();
const {close} = require('./twitterCalls.js')


app.use(express.static(__dirname))
app.get('/',function(req,res)
{
    res.sendFile(__dirname+'/index.html');
})
app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
    fs.writeFileSync('test.json','[[0,0]]');
});

app.get('/data', function(req,res)
{
    res.sendFile(__dirname+'/test.json')
    //setInterval(sendJSON(),10000)
});

app.post('/search',encoder,function(req,res)
{
    //console.log(req)
    //twitter.writeJson();
    //console.log(twitter.getStream.close)
    console.log("close variable"+twitter.close);
    var query = req.body.query
    twitter.getStream(query);
})

app.post('/close',encoder,function(req,res)
{
    //console.log("close variable"+twitter.close);

    twitter.closeStream();
    fs.writeFileSync('test.json','[[0,0]]');
    res.redirect('/')

})