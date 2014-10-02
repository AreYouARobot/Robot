'use strict';

// Primary server file
var express = require('express');
var bodyParser = require('body-parser');
// var http = require('http');
var markov = require('./markovCode');
var fs = require('fs');
// var cors = require('cors');

// Require bluebird so that as soon as req comes in, promisify it.
var app = express();
var port = process.env.PORT || 7085;

// app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser());

app.use(express.static(__dirname)); // __dirname = server 
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

app.options('*', function(req, res){
  res.status(200).set(defaultCorsHeaders).send();
  res.end();
});

var chooseRandomTopic = function (sentence) {
  var words = sentence.split(' ');
  var topicIndex = words.length - 2;
  if(topicIndex >= 1){
    var topic =  words[topicIndex].toLowerCase() + ' ' + words[topicIndex + 1].toLowerCase();
    return topic;
  } else {
    return sentence;
  }
};

app.post('/api/ask', function (req, res) {
  var question = req.body.question;
  var topic = chooseRandomTopic(question);
  var response = markov.makeBackSentence(topic) + ' ' + markov.makeSentence(topic).slice(topic.length);
  res.status(200).set(defaultCorsHeaders).send(response);
  res.end();
});

app.post('/api/upvote', function (req, res) {
  //will increase percentages on sets of words in this sentence
  markov.upvote(req.body.best);
});

app.post('/api/downvote', function (req, res) {
  //will decrease percentages on sets of words in this sentence
  markov.downvote(req.body.worst);
});

// *************************** //
var sentenceParser = require('./sentenceParser.js');
app.post('/api/getContext', function(req, res) {
  var taggedWords = sentenceParser.parseSentence(req.body.phrase);
  var context = sentenceParser.identifyContext(taggedWords);
  console.log(context);
  res.status(200).send(context);
});
// *************************** //

var pathName = __dirname;


app.listen(port);
console.log('Server running on port %d', port);

exports = module.exports = app;

exports.readFileData = function (fileName, chats) {
  fs.readFile(fileName, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      //split by sentence into arrays
      var phrases = data.toString();
      //for each paragraph
      chats.push(phrases);
    }
  });
};

exports.array = [];
// exports.readFileData(__dirname + '/austen-emma.txt', exports.array);
// exports.readFileData(__dirname + '/melville-moby_dick.txt', exports.array);
// exports.readFileData(__dirname + '/austen-persuasion.txt', exports.array);
// exports.readFileData(__dirname + '/whitman-leaves.txt', exports.array);
// exports.readFileData(__dirname + '/whitman-leaves.txt', exports.array);
exports.readFileData(pathName + '/bible-kjv.txt', exports.array);

setTimeout(function () {
  exports.array.forEach(function (value) {
    markov.addSnippets(value);
    markov.addBackSnippets(value);
    console.log('Server Ready');
  });
}, 1000);

