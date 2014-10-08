'use strict';
var fs = require('fs');
exports = module.exports;
// MARKOV
// expected input:
// [[sentence], [sentence], [sentence]] => sentence: [word1, word2, word3, word4]
// each word is structured as:
// word1: {count: x, word2: count}

var markovChain = {length: 0};
var backwardChain = {length: 0};

// var sentenceArray = testSentence.replace(/\./g, ' EOSMARKER BOSMARKER').split(' ');

// for each sentence, take current indexed word 
exports.addSnippets = function (sentence) {
	sentence = sentence.toLowerCase().replace(/\n/g, ' ').replace(/\./g, ' EOSMARKER BOSMARKER').split(' ');
  sentence.unshift('BOSMARKER');
  sentence.push('EOSMARKER');
  for (var i = 0; i < sentence.length - 2; i++) {
    //glom together 2-4 words
    if (!markovChain[sentence[i] + ' ' + sentence[i + 1]]) {
      markovChain[sentence[i] + ' ' + sentence[i + 1]] = {};
      markovChain[sentence[i] + ' ' + sentence[i + 1]].totNumOfWords = 0;
      markovChain.length++;
    }
    markovChain[sentence[i] + ' ' + sentence[i + 1]].totNumOfWords++;
    if (!markovChain[sentence[i] + ' ' + sentence[i + 1]][sentence[i + 2]]) {
      markovChain[sentence[i] + ' ' + sentence[i + 1]][sentence[i + 2]] = 0;
    }
    markovChain[sentence[i] + ' ' + sentence[i + 1]][sentence[i + 2]]++;
  }
  console.log('Forward chain done');
};

// for each sentence, take current indexed word 
exports.addBackSnippets = function (sentence) {
	sentence = sentence.toLowerCase().replace(/\n/g, ' ').replace(/\./g, ' EOSMARKER BOSMARKER').split(' ');
  for (var i = sentence.length - 1; i > 1; i--) {
  //glom together 2-4 words
    if (!backwardChain[sentence[i - 1] + ' ' + sentence[i]]) {
      backwardChain[sentence[i - 1] + ' ' + sentence[i]] = {};
      backwardChain[sentence[i - 1] + ' ' + sentence[i]].totNumOfWords = 0;
      backwardChain.length++;
    }
    backwardChain[sentence[i - 1] + ' ' + sentence[i]].totNumOfWords++;
    if (!backwardChain[sentence[i - 1] + ' ' + sentence[i]][sentence[i - 2]]) {
      backwardChain[sentence[i - 1] + ' ' + sentence[i]][sentence[i - 2]] = 0;
    }
    backwardChain[sentence[i - 1] + ' ' + sentence[i]][sentence[i - 2]]++;
  }
  console.log('Backward chain done');
};

exports.upvote = function (sentence) {
  sentence = sentence.trim();
  exports.addBackSnippets(sentence);
  exports.addSnippets(sentence);
  console.log('Sentence Upvoted!');
};

exports.downvote = function (sentence) {
  sentence = sentence.toLowerCase().replace(/\n/g, ' ').replace(/\./g, ' EOSMARKER BOSMARKER').split(' ');
  sentence.unshift('BOSMARKER');
  sentence.push('EOSMARKER');
  var tuple;
  for (var i = 0; i < sentence.length - 2; i++) {
    tuple = markovChain[sentence[i] + ' ' + sentence[i + 1]];
    if (tuple !== undefined) {
      //reduce totNumOfWords
      if (tuple.totNumOfWords > 1 && tuple[sentence[i + 2]]) {
        tuple.totNumOfWords--;
        //reduce number of the individual word
        tuple[sentence[i + 2]]--;
      }
    }
  }
  for (i = sentence.length - 1; i > 1; i--) {
    tuple = backwardChain[sentence[i - 1] + ' ' + sentence[i]];
    if (tuple !== undefined) {
      //reduce totNumOfWords
      if (tuple.totNumOfWords > 1 && tuple[sentence[i - 2]]) {
        tuple.totNumOfWords--;
        //reduce number of the individual word
        tuple[sentence[i - 2]]--;
      }
    }
  }
  console.log('Sentence Downvoted!');
};

var makeBackSentence = function (startingWord) {
  //add the last word unless it's EOSMARKER
  var sentence = '';
  if (startingWord !== 'EOSMARKER') {
    sentence += startingWord;
  }
  //set current word
  var currentWord = startingWord;
  if (backwardChain[currentWord] === undefined || currentWord.indexOf(' ') === -1) {
    return 'I don\'t know what that is.';
  }
  var seed = 0;
  var cumulativeCount = 0;
  //while we haven't selected the EOSMARKER
  while (!(~currentWord.indexOf('BOSMARKER'))) {
    seed = Math.random() * backwardChain[currentWord].totNumOfWords;
    cumulativeCount = 0;
    for (var key in backwardChain[currentWord]) {
      if (key !== 'totNumOfWords') {
        if (cumulativeCount < seed && seed <= cumulativeCount + backwardChain[currentWord][key]) {
          if (key !== 'BOSMARKER') {
            sentence = key + ' ' + sentence;
          }
          currentWord = key + ' ' + currentWord.slice(0, currentWord.indexOf(' '));
          break;
        } else {
          cumulativeCount += backwardChain[currentWord][key];
        }
      }
    }
  }
  return sentence;
};

var makeSentence = function (startingWord) {
  //add the first word unless it's BOSMARKER
  var sentence = '';
  if (startingWord !== 'BOSMARKER') {
    sentence += startingWord;
  }
  //set current word
  var currentWord = startingWord;
  //if current pair not in markov, return placeholder
  if (markovChain[currentWord] === undefined || currentWord.indexOf(' ') === -1) {
    return currentWord;
  }
  var seed = 0;
  var cumulativeCount = 0;
  //while we haven't selected the EOSMARKER
  while (!(~currentWord.indexOf('EOSMARKER'))) {
    seed = Math.random() * markovChain[currentWord].totNumOfWords;
    cumulativeCount = 0;
    //keys are 1 word
    for (var key in markovChain[currentWord]) {
      if (key !== 'totNumOfWords') {
        if (cumulativeCount < seed && seed <= cumulativeCount + markovChain[currentWord][key]) {
          if (key !== 'EOSMARKER') {
            sentence += ' ' + key;
          }
          currentWord = currentWord.slice(currentWord.lastIndexOf(' ') + 1) + ' ' + key;
          break;
        } else {
          cumulativeCount += markovChain[currentWord][key];
        }
      }
    }
  }
  return sentence;
};

exports.getLength = function () {
  return markovChain.length > backwardChain.length ? markovChain.length : backwardChain.length;
};

exports.getSentence = function (topic) {
  var sentence = makeBackSentence(topic) + ' ' + makeSentence(topic).slice(topic.length);
  var sentenceArr = sentence.split(' ');
  var numSentences = 1;
  while (sentenceArr.length > 15 && numSentences < 20) {
    exports.downvote(sentence);
    sentence = makeBackSentence(topic) + ' ' + makeSentence(topic).slice(topic.length);
    sentenceArr = sentence.split(' ');
    numSentences++;
  }
  return sentence;
};

exports.saveFile = function (filename, cb) {
  //json stringify and save to file
  var chainString = JSON.stringify({markovChain: markovChain, backwardChain: backwardChain});
  fs.writeFile(filename, chainString, cb);
  console.log('Markov data saved!');
};

exports.readFile = function (filename, cb) {
  //read from file and json parse
  fs.readFile(filename, function (err, data) {
    var markovData = JSON.parse(data);
    markovChain = markovData.markovChain;
    backwardChain = markovData.backwardChain;
    console.log('Markov data read!');
    console.log(markovChain.length)
    cb();
  });
};

exports.getProbability = function (phrase) {
  return JSON.stringify(markovChain[phrase]);
};