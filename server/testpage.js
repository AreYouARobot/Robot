'use strict';

angular.module('testPage', [
])
.controller('HomeController', function ($scope, robot) {
  $scope.getSentence = function (sentence) {
    robot.getSentence(sentence)
    .success(function (sentence) {
      $scope.sentence = sentence;
    });
  };
  $scope.upvoteQuestion = 'What are some sentences?';
  $scope.downvoteQuestion = 'What are some sentences?';
  $scope.sentences = ['sentence will go here', 'sentence will go here too'];
  $scope.notSentences= ['apple, orange, banana, kumquat', 'words hard are monkey'];
  $scope.my = {favorite: 'none', worst: 'none'};
  $scope.upvoteSentence = function () {
    console.log($scope.upvoteQuestion, $scope.my.favorite);
    robot.upvoteSentence($scope.upvoteQuestion, $scope.my.favorite);
  };

    $scope.downvoteSentence = function () {
    console.log($scope.downvoteQuestion, $scope.my.worst);
    robot.downvoteSentence($scope.downvoteQuestion, $scope.my.worst);
  };

})

.factory('robot', function ($http) {
  var getSentence = function (question) {
    return $http({
      method: 'POST',
      url: '/api/ask',
      data: {question: question}
    }).success(function (sentence) {
      return sentence;
    });
  };

  var upvoteSentence = function (question, bestAnswer) {
    return $http({
      method: 'POST',
      url: '/api/upvote',
      data: {question: question, best: bestAnswer}
    });
  };
  var downvoteSentence = function (question, worstAnswer) {
    return $http({
      method: 'POST',
      url: '/api/downvote',
      data: {question: question, worst: worstAnswer}
    });
  };
  return {
    getSentence: getSentence,
    upvoteSentence: upvoteSentence,
    downvoteSentence: downvoteSentence
  };
});
