var twitter = require('twitter')
//environment variables 
var client = new twitter({
    consumer_key: 'eomXjAtG9ELOFM7KRXUl0ZabS',
    consumer_secret: 'mzy5CZy1HPFnuVsHWc6J1hbszQRooaWzSyrPqTMzqwecznLWhU',
    //bearer_token: 'AAAAAAAAAAAAAAAAAAAAACePUQEAAAAAdQv3bJbg9z1sXV345TBa0sU6QHo%3DPAQeYtvkSgjUlP1jLkqXqpS0yxB7wSrUsQzpMG8erxToObemvS',
    access_token_key: '1444840817797959680-9nFkwdTzyKRXsZNq9ksyNcgaTHNjkh',
    access_token_secret: 'tX1BmWK3B19S6QFp4Gi5HIQ3TNoummchvp5DBitezfnEn'
});


client.stream('statuses/filter', {track: 'twitter'},  function(stream) {
    stream.on('data', function(tweet) {
      console.log(tweet.text);
    });
  
    stream.on('error', function(error) {
      console.log(error);
    });
  });