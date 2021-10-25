var twitter = require('twitter');
var AWS = require('aws-sdk');
// var express = require('express');
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

// Create a promise on S3 service object
const bucketPromise = new AWS.S3({apiVersion: '2006-03-01'}).createBucket({Bucket: bucketName}).promise();
bucketPromise.then(function(data) {
    console.log("Successfully created " + bucketName);
})
.catch(function(err) {
    console.error(err, err.stack);
});



//Instantiate AWS S3 Server

var s3Key = "twitter";
let responseJSON;
var i = 0;

client.stream('statuses/filter',{track:'sports'},function(stream) {
  stream.on('data', function(tweet) {
    UploadToS3(tweet.text, i);
    console.log(tweet.text);
    i++;
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});
function UploadToS3(data, integer) { 
  //Store in S3
  responseJSON = data;
  //const body = JSON.stringify({ source: 'S3 Bucket', ...responseJSON});
  const objectParams = {Bucket: bucketName, Key: integer.toString(), Body: data};
  const uploadPromise = new AWS.S3({apiVersion: '2006-03-01'}).putObject(objectParams).promise();
  uploadPromise.then(function(data) {
      //console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
  });
  //console.log("Stored in S3 from Twitter Stream");
}





