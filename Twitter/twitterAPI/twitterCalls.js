var twitter = require('twitter')
//environment variables 
var client = new twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_KEY,
    bearer_token: provess.env.TWITTER_BEARER_TOKEN
});


//twitter stream code, track = what to stream based on keyword
var stream = client.stream('status/filer',{track:'basketball'});
stream.on('data', function(event)
{
    console.log(event && event.text)
});

stream.on('error', function(error)
{
    throw error;
})