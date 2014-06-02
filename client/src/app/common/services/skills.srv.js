'use strict';

//s
angular.module('n4j.common.utils')
  .factory('SkillsFactory', function($http){
    var SkillsFactory = function(data){
      angular.extend(this, data);
    };

    //retrieve all skills
    SkillsFactory.get = function(){
      return $http.get('localhost:3000/skills')
        .then(function(response){
          return new SkillsFactory(response.data);
        });
    };

    return SkillsFactory;
  });
