var twitter = require('twitter');
var AWS = require('aws-sdk');
var express = require('express');
var Analyser = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
const fs = require('fs');
var compromise = require('compromise');
const redis = require('redis');
const e = require('express');
const { promisify } = require('util');


//Instantiating Twitter API
var client = new twitter({
    consumer_key: 'eomXjAtG9ELOFM7KRXUl0ZabS',
    consumer_secret: 'mzy5CZy1HPFnuVsHWc6J1hbszQRooaWzSyrPqTMzqwecznLWhU',
    //bearer_token: 'AAAAAAAAAAAAAAAAAAAAACePUQEAAAAAdQv3bJbg9z1sXV345TBa0sU6QHo%3DPAQeYtvkSgjUlP1jLkqXqpS0yxB7wSrUsQzpMG8erxToObemvS',
    access_token_key: '1444840817797959680-9nFkwdTzyKRXsZNq9ksyNcgaTHNjkh',
    access_token_secret: 'tX1BmWK3B19S6QFp4Gi5HIQ3TNoummchvp5DBitezfnEn'
});



//Create Redis Client - This section will change for Cloud Services
const redisClient = redis.createClient();
redisClient.on('error', (err) => {
    console.log("Error " + err);
});

//Promisify redis client get method
const redisGetAsync = promisify(redisClient.get).bind(redisClient);

//redisGetAsync.then(console.log).catch(console.log);


// Cloud Services Set-up
const bucketName = 'petercab432-assignment2';
const awsService = new AWS.S3({apiVersion: '2006-03-01'})
// Create unique bucket name



// // Create a promise on S3 service object
const bucketPromise = awsService.createBucket({Bucket: bucketName}).promise();
bucketPromise.then(function(data) {
    console.log("Successfully created " + bucketName);
})
.catch(function(err) {
    console.error(err, err.stack);
    console.log('unable to create bucket')
});




//Sentiment analysis

//Instantiating Analyser
var analyser = new Analyser("English", stemmer, "afinn");


//Vars for S3 and Tweet stream (placeholders for now)
let responseJSON;
var x = 1;
var sentimentAvg =0;
var close = 0;
var timer = null;
var tweetSentiment;
//Get tweets from Twitter stream then store in S3.

module.exports = {
getStream: function(query){
var i = 1;
var cleanedTweet;
var cleanedTweetArray;
close = 0;

timer = setInterval(writeJson,1000)

  PersistanceRetrieval(query);
},

closeStream: function()
{
  clearInterval(timer)
  close = 1;
  x =1;
},

}
var sentimentArray = [];
function getAverage(number)
{
  if(number <0)
  {
    number = -1
    sentimentArray.push(number);
  }
  else if (number > 0)
  {
    number = 1
    sentimentArray.push(number);
  }
  else if (number == 0)
  {
    number = 0;
    sentimentArray.push(number);
  }
  console.log(number)
  
  var sum = 0;
  for(var i = 0; i < sentimentArray.length; i++)
  {
    sum += sentimentArray[i]
  }
  sentimentAvg = sum/sentimentArray.length

  if(sentimentAvg <0)
  {
    sentimentAvg = -1
    //sentimentArray.push(number);
  }
  else if (number > 0)
  {
    sentimentAvg = 1
    //sentimentArray.push(number);
  }
  else if (number == 0)
  {
    sentimentAvg = 0;
    //sentimentArray.push(number);
  }

}

function writeJson()
{
  fs.writeFileSync('test.json','[['+x+','+JSON.stringify(sentimentAvg)+']]');
  x++
  console.log(sentimentAvg);
}
//Function that handles the storing to S3
function UploadToS3(data, keyName) { 
  //Store in S3
  const objectParams = {Bucket: bucketName, Key: keyName.toString(), Body: data};
  const uploadPromise = awsService.putObject(objectParams).promise();
  uploadPromise.then(function(data) {
      console.log("Successfully uploaded data to S3 from Twitter API: " + bucketName + "/" + keyName);
  });
}

function UploadToRedis(data, keyName) {
  redisClient.setex(keyName, 3600, data);
}


// Redis -> S3 -> API
function PersistanceRetrieval(keyName) {
      var cleanedTweet;
      var cleanedTweetArray;
      var nameCount = 0;
      var params = { Bucket: bucketName, Key: keyName + "0"};
      var redisCheck = 0;
      var s3Check = 0;
      console.log('function is running??');
      
      console.log('does redis run ??');
      (async () => {
        for (var redisCount = 0; redisCheck == 0; redisCount++) 
        {
          console.log("Made it inside For loop");
          // Checks Redis Cache for a first "hit"
          const redisResult = await redisGetAsync(keyName + redisCount.toString());
          //return redisClient.get(keyName + redisCount.toString(), (err, redisResult) => 
          //{
            //console.log(redisResult)
            console.log("Made it past the GET");
            if (redisResult) 
            {
              //console.log('iterate');
                // Serve results from Redis
                //Sentiment analysis
                cleanedTweetArray = redisResult.split(" ");
                tweetSentiment = analyser.getSentiment(cleanedTweetArray);
                getAverage(tweetSentiment);
                console.log("\n\n\n---------------------------\n" + "From Redis: \n" + redisResult + "\n*** " + tweetSentiment + " *** <-- Sentiment Value" + "\n---------------------------");

            } 
            else 
            {
              redisCheck = 1;
            }
            //console.log(err);
          //})
        }

        if (redisCheck == 1) 
      { //Serve from S3, if it's in S3 store it in Cache too
        console.log('s3')

        for (var s3Count = 0; s3Check == 0; s3Count++) 
        { 
          console.log("Inside S3 For Loop");
          params.Key = keyName + s3Count;
          const s3Result = await awsService.getObject(params).promise()

          try {
            if (s3Result) 
            {
              // Retrieve from S3
              resultJSON = s3Result.Body.toString('utf-8');

              //Sentiment analysis
              cleanedTweetArray = resultJSON.split(" ");
              tweetSentiment = analyser.getSentiment(cleanedTweetArray);
              getAverage(tweetSentiment);
              console.log("\n\n\n---------------------------\n" + "From S3: \n" + resultJSON + "\n*** " + tweetSentiment + " *** <-- Sentiment Value" + "\n---------------------------");

            
              //Store in cache while we're here
              UploadToRedis(resultJSON, keyName + s3Count);
              console.log("Stored in Redis from S3 call \n");

              //Serve results from S3
              console.log("Successfully retrieved from S3:");

            } 

          } catch(err) {

            //else 
            //{
              s3Check = 1;
            //}
          }

          //})
        }
      }
      //It's not in Cache and S3, time to retrieve from Twitter
      console.log('twitter!!')
      // Retrieving from Twitter
      client.stream('statuses/filter',{track:keyName, language:'en'},function(stream) {
        stream.on('data', function(tweet) {

          //Cleaning up Tweet
          cleanedTweet = compromise(tweet.text);
          cleanedTweet = cleanedTweet.not('#url').not('#HashTag').not('#AtMention').not("RT").not('#Time').not('#Date').not('#Expression').not('#PhoneNumber').not('#Money').normalize().text('reduced');
          //Sentiment analysis
          cleanedTweetArray = cleanedTweet.split(" ");
          tweetSentiment = analyser.getSentiment(cleanedTweetArray);
          getAverage(tweetSentiment);
          //Store in Perstistence storage
          UploadToRedis(cleanedTweet, keyName + nameCount);
          UploadToS3(cleanedTweet, keyName + nameCount);

          //Naming convention interation
          nameCount++;
        });
        stream.on('error', function(error) {
          console.log(error);
        });
      });           
      })();
          
      
}








