// var wiki = require('node-wikipedia');

// var apple = wiki.page('Apple', {wikitext:true}, function(response){
//   console.log(response);
// });
'use strict';

var http = require('http');

var toBeParsed = ['Robot'];
var alreadyParsed = [];

var parseWikiText = function (text, cb) {
  var parsedText = [];
  var finalText = '';
  var apple = JSON.parse(text.toString());
  var appleText = apple.query.pages[Object.keys(apple.query.pages)[0]].extract;
  if (appleText !== undefined) {
    appleText.replace(/<p>(.*?)<\/p>/g, function () {
      parsedText.push(arguments[1]);
    });
    for (var i = 0; i < parsedText.length; i++) {
      parsedText[i] = parsedText[i].replace(/<.*?\>/g, '');
    }
    finalText = parsedText.join('');
    console.log('Text parsed');
  }
  cb(finalText);
};

var getWikiPage = function (title, cb) {
  title = title.replace(/ /g, '%20');
  var httpOptions = {
    host: 'en.wikipedia.org',
    path: '/w/api.php?format=json&action=query&titles=' + title + '&prop=extracts'
  };

  var buffer = '';

  http.get(httpOptions, function (resp) {
    resp.on('data', function (chunk) {
      buffer += chunk;
    });
    resp.on('end', function () {
      console.log('Page ' + title + ' fetched');
      parseWikiText(buffer, cb);
    });
  });
};

var getLinks = function (title, cb) {
  title = title.replace(/ /g, '%20');
  var httpOptions = {
    host: 'en.wikipedia.org',
    path: '/w/api.php?format=json&action=parse&page=' + title + '&prop=links'
  };

  var buffer = '';

  http.get(httpOptions, function (resp) {
    resp.on('data', function (chunk) {
      buffer += chunk;
    });
    resp.on('end', function () {
      console.log('Links from ' + title + ' fetched');
      var links = JSON.parse(buffer.toString());
      var realLinks = [];
      if(links.parse !== undefined){
        links.parse.links.forEach(function (data, index) {
          if (data.ns === 0 && data['*'].indexOf('disambiguation') === -1) {
            if (alreadyParsed.indexOf(data['*']) === -1) {
              realLinks.push(data['*']);
            }
          }
        });
        var totalLinks = realLinks.length;
        var linkFreq = Math.floor(totalLinks / 5);
        if(linkFreq > 0 && toBeParsed.length < 100){
          for(var i = 0; i < realLinks.length; i += linkFreq) {
            toBeParsed.push(realLinks[i]);
          }
        }
      }
      cb(title);
      // parseWikiText(buffer, cb);
    });
  });
};

exports.wiki = function (title, cb) {
  // getWikiPage(title, cb);
  // getLinks(title, console.log);
  getLinks(title, function () {
    getWikiPage(title, cb);
  });
};

exports.getNext = function () {
  var nextItem = toBeParsed.shift();
  alreadyParsed.push(nextItem);
  return nextItem;
};

exports.remainingArticles = function () {
  return toBeParsed.length;
}

exports.parsedArticles = function () {
  return alreadyParsed.length;
}