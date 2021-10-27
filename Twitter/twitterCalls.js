var twitter = require('twitter');
var AWS = require('aws-sdk');
var express = require('express');
var Analyser = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var compromise = require('compromise');
// var request = require('request');
// var s3stream = require('stream');
//var s3 = require('s3.js');


//Instantiating Twitter API
var client = new twitter({
    consumer_key: 'eomXjAtG9ELOFM7KRXUl0ZabS',
    consumer_secret: 'mzy5CZy1HPFnuVsHWc6J1hbszQRooaWzSyrPqTMzqwecznLWhU',
    //bearer_token: 'AAAAAAAAAAAAAAAAAAAAACePUQEAAAAAdQv3bJbg9z1sXV345TBa0sU6QHo%3DPAQeYtvkSgjUlP1jLkqXqpS0yxB7wSrUsQzpMG8erxToObemvS',
    access_token_key: '1444840817797959680-9nFkwdTzyKRXsZNq9ksyNcgaTHNjkh',
    access_token_secret: 'tX1BmWK3B19S6QFp4Gi5HIQ3TNoummchvp5DBitezfnEn'
});




// Cloud Services Set-up
// Create unique bucket name
const bucketName = 'petercab432-assignment2';

// // Create a promise on S3 service object
function createBucket(){
const bucketPromise = new AWS.S3({apiVersion: '2006-03-01'}).createBucket({Bucket: bucketName}).promise();
bucketPromise.then(function(data) {
    console.log("Successfully created " + bucketName);
})
.catch(function(err) {
    console.error(err, err.stack);
    console.log('unable to create bucket')
});}

// client.get('trends/place',{id: '23424748',}, function(error,trend,response)
// {
//   console.log(trend[0])

// })

//Sentiment analysis

//Instantiating Analyser
var analyser = new Analyser("English", stemmer, "afinn");
// var sampleText = ["I", "hate", "this", "game!"];

//Analyse
// console.log(analyser.getSentiment(sampleText));


//Vars for S3 and Tweet stream (placeholders for now)
let responseJSON;

//Get tweets from Twitter stream then store in S3.
module.exports = {
getStream: function(){
var i = 0;
var s3Key = "twitter";
var cleanedTweet;
var cleanedTweetArray;
var tweetSentiment;
client.stream('statuses/filter',{track:'sports', language:'en'},function(stream) {
  stream.on('data', function(tweet) {
    // cleanedTweet = compromise(tweet.text).normalize().out('text');   
    cleanedTweet = compromise(tweet.text);
    cleanedTweet = cleanedTweet.not('#url').not('#HashTag').not('#AtMention').not("RT").not('#Time').not('#Date').not('#Expression').not('#PhoneNumber').not('#Money').normalize().text('reduced');
    cleanedTweetArray = cleanedTweet.split(" ");
    tweetSentiment = analyser.getSentiment(cleanedTweetArray);
    //UploadToS3(tweet.text, i);
    console.log("\n\n\n---------------------------\n" + "Original: \n" + tweet.text + "\n<--->\nCleaned: \n" + cleanedTweet + "\n*** " + tweetSentiment + " *** <-- Sentiment Value" + "\n---------------------------");
    i++;
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});},

}

//Function that handles the storing to S3
function UploadToS3(data, integer) { 
  //Store in S3
  responseJSON = data;
  //const body = JSON.stringify({ source: 'S3 Bucket', ...responseJSON});
  const objectParams = {Bucket: bucketName, Key: integer.toString(), Body: data};
  const uploadPromise = new AWS.S3({apiVersion: '2006-03-01'}).putObject(objectParams).promise();
  uploadPromise.then(function(data) {
      console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
  });
}








