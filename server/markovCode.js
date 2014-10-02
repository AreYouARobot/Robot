'use strict';

exports = module.exports;
// MARKOV
// expected input:
// [[sentence], [sentence], [sentence]] => sentence: [word1, word2, word3, word4]
// each word is structured as:
// word1: {count: x, word2: count}

var markovChain = {};
var backwardChain = {};

// var sentenceArray = testSentence.replace(/\./g, ' EOSMARKER BOSMARKER').split(' ');

// for each sentence, take current indexed word 
exports.addSnippets = function (sentence) {
	sentence = sentence.toLowerCase().replace(/\n/g, ' ').replace(/\./g, ' EOSMARKER BOSMARKER').split(' ');
  for (var i = 0; i < sentence.length - 2; i++) {
    //glom together 2-4 words
    if (!markovChain[sentence[i] + ' ' + sentence[i + 1]]) {
      markovChain[sentence[i] + ' ' + sentence[i + 1]] = {};
      markovChain[sentence[i] + ' ' + sentence[i + 1]].totNumOfWords = 0;
    }
    markovChain[sentence[i] + ' ' + sentence[i + 1]].totNumOfWords++;
    if (!markovChain[sentence[i] + ' ' + sentence[i + 1]][sentence[i + 2]]) {
      markovChain[sentence[i] + ' ' + sentence[i + 1]][sentence[i + 2]] = 0;
    }
    markovChain[sentence[i] + ' ' + sentence[i + 1]][sentence[i + 2]]++;
  }
};

// for each sentence, take current indexed word 
exports.addBackSnippets = function (sentence) {
	sentence = sentence.toLowerCase().replace(/\n/g, ' ').replace(/\./g, ' EOSMARKER BOSMARKER').split(' ');
  for (var i = sentence.length - 1; i > 1; i--) {
  //glom together 2-4 words
    if (!backwardChain[sentence[i - 1] + ' ' + sentence[i]]) {
      backwardChain[sentence[i - 1] + ' ' + sentence[i]] = {};
      backwardChain[sentence[i - 1] + ' ' + sentence[i]].totNumOfWords = 0;
    }
    backwardChain[sentence[i - 1] + ' ' + sentence[i]].totNumOfWords++;
    if (!backwardChain[sentence[i - 1] + ' ' + sentence[i]][sentence[i - 2]]) {
      backwardChain[sentence[i - 1] + ' ' + sentence[i]][sentence[i - 2]] = 0;
    }
    backwardChain[sentence[i - 1] + ' ' + sentence[i]][sentence[i - 2]]++;
  }
};

exports.upvote = function (sentence) {
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

exports.makeBackSentence = function (startingWord) {
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

exports.makeSentence = function (startingWord) {
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