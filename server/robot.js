'use strict';

// Primary server file
var express = require('express');
var bodyParser = require('body-parser');
// var http = require('http');
var markov = require('./markovCode');
var fs = require('fs');
var cors = require('cors');

// Require bluebird so that as soon as req comes in, promisify it.
var app = express();
var port = process.env.PORT || 7085;


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser());

app.use(express.static(__dirname)); // __dirname = server right now. dirname + ../ = AreYouARobot, so dirname + '../client'

app.options('*', cors());

var chooseRandomTopic = function (sentence) {
  var words = sentence.split(' ');
  var topicIndex = words.length - 2;
  var topic =  words[topicIndex].toLowerCase() + ' ' + words[topicIndex + 1];
  return topic;
};

app.post('/api/ask', function (req, res) {
  console.log(req.body);
  var question = req.body.question;
  var topic = chooseRandomTopic(question);
  var response = markov.makeBackSentence(topic) + ' ' + markov.makeSentence(topic).slice(topic.length);
  res.status(200).send(response);
  res.end();
});

app.post('/api/upvote', function (req, res) {
  //will increase percentages on sets of words in this sentence
  console.log(req.body);
});

app.post('/api/downvote', function (req, res) {
  //will decrease percentages on sets of words in this sentence
  console.log(req.body);
});

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
  });
}, 1000);

