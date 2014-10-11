'use strict';

angular.module('testPage', [
])
.controller('HomeController', function ($scope, robot) {
  $scope.total = 0;
  $scope.upvotes = 0;
  $scope.downvotes = 0;
  $scope.getSentence = function (sentence) {
    robot.getContext(sentence)
    .success(function (context) {
      $scope.context = context;
    });
    robot.getSentence(sentence)
    .success(function (sentence) {
      $scope.sentence = sentence;
      $scope.total++;
    });
  };
  $scope.upvoteSentence = function () {
    robot.upvoteSentence($scope.upvoteQuestion, $scope.sentence);
    $scope.getSentence($scope.sentence);
    $scope.upvotes++;
  };

  $scope.downvoteSentence = function () {
    robot.downvoteSentence($scope.downvoteQuestion, $scope.sentence);
    $scope.getSentence($scope.sentence);
    $scope.downvotes++;
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
  var getContext = function (context) {
    return $http({
      method: 'POST',
      url: '/api/getContext',
      data: {phrase: context}
    });
  };
  return {
    getSentence: getSentence,
    upvoteSentence: upvoteSentence,
    downvoteSentence: downvoteSentence,
    getContext: getContext
  };
});
