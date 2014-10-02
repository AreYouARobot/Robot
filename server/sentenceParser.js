'use strict';

var pos = require('pos');
var exports = module.exports;

exports.parseSentence = function(sentence) {
	var words = new pos.Lexer().lex(sentence);
  var taggedWords = new pos.Tagger().tag(words);
  // returns tuples of individual words and parts of speech
  return taggedWords;
};

exports.identifyContext = function(taggedWords) {

  // define noun types
  var nouns = {
    'NN': true,
    'NNP': true,
    'NNPS': true,
    'NNS': true
  };

  // loop through taggedWords, looking for noun-type
  for (var i = taggedWords.length - 1; i >= 0; i--) {
    if (nouns[taggedWords[i][1]]) {
      if (taggedWords[i - 1]) {
        return taggedWords[i - 1][0] + ' ' + taggedWords[i][0];
      } else {
        return 'the ' + taggedWords[i][0]; 
      }
    }
  }
  // default value
  return 'it is';
};

// for testing
// curl -H "Content-Type: application/json" -d '{"phrase":"your test text here"}' http://localhost:7085/api/getContext