'use strict';

angular.module('n4j.pages.controllers')
  
  .controller('SetupCtrl', function (_, $q, $scope, $state, $n4Auth, $n4Skills, $n4User, growl) {

    var list = null;
    var _original = null; // original list of skills or locations
    var _locations = null; // original list of locations
    var _deletedItems = []; // stores removed skills or locations

    var state = ($state.is('app.setup.skills') && 'skills') ||
                ($state.is('app.setup.locations') && 'locations');

    // ## Helper Functions
    var extractStringsToCompare = function (arr) {
      return _.map(arr, function (item) {
        if (state === 'skills') {
          return item.name;
        } else if (state === 'locations') {
          return item.city;
        }
      });
    };

    if (state === 'skills') {
      list = $n4Skills.list();
    } else if (state === 'locations') {
      // list = $n4Locations.list();
    }

    $scope.itemToAdd = '';

    // set initial selectedItems state
    if (state === 'skills') {
      $n4User.getSkills().then(function (skills) {
        _original = _.clone(skills);
        $scope.selectedItems = skills;
      });
    } else if (state === 'locations') {
      $n4User.getLocations().then(function (locations) {
        _original = _.clone(locations);
        $scope.selectedItems = locations;
      });
    }

    $scope.getSuggestion = function (str) {
      return list.then(function (items) {
        var _tmp = extractStringsToCompare($scope.selectedItems);
        var results = _.filter(items, function (item) {

          // if we are doing locations
          if (state === 'locations') {
            // @TODO implement this
            return true;
          }

          // if we are doing skills
          if (state === 'skills') {
            // The first check makes sure that it hasn't already been added.
            // The second check makes sure the typed in string is present in the returned item
            return !_.contains(_tmp, item.name) && item.name.toLowerCase().indexOf(str) !== -1;
          }
        });

        return results;
      });
    };

    $scope.select = function (item) {
      $scope.selectedItems.push(item);
      $scope.itemToAdd = '';
    };

    $scope.onEnter = function (e) {
      if (e.keyCode === 13) {
        if($scope.itemToAdd) {
          
          $scope.selectedItems.push({
            name: $scope.itemToAdd
          });

          $scope.itemToAdd = '';
        }
      }
    };

    $scope.remove = function (index) {
      _deletedItems.push($scope.selectedItems.splice(index, 1)[0]);
    };

    $scope.save = function () {
      
      var promises = [];

      // check if anything changed
      if (_.isEqual(_original, $scope.selectedItems)) {
        growl.addInfoMessage('Nothing Changed');
      } else {

        var _tmp = null;

        // extract the name/city...
        // this simplifies the next part where we filter $scope.selectedItems
        _tmp = extractStringsToCompare(_original);

        // get the new selected items and save them
        var _newItems = _.filter($scope.selectedItems, function (item) {
          var strToCompare = (state === 'skills' && item.name) ||
                             (state === 'locations' && item.city);

          // if the item is not in the _original return true
          return !_.contains(_tmp, strToCompare);
        });

        if (_newItems.length) {

          var toCreate = {};
          toCreate[state] = _newItems;

          // _.clone data to make sure it doesn't change unexpectedly 
          // before we have the chance to save it
          promises.push($n4User.save(toCreate));
        }

        // get the removed items and delete them
        // 
        // @NOTE 
        // the user save endpoint does not handle unlinking of relationships
        // so we need to remove those ourselves

        // reset data...
        var toDelete = {};

        // extract the name/city...
        // this simplifies the next part where we filter _deletedItems
        _tmp = extractStringsToCompare($scope.selectedItems);

        // check to make sure something that was deleted wasn't added back into
        // the selectedItems array... if it was then filter it out
        _deletedItems = _.filter(_deletedItems, function (item) {
          var strToCompare = (state === 'skills' && item.name) ||
                             (state === 'locations' && item.city);

          return !_.contains(_tmp, strToCompare);
        });

        toDelete[state] = _deletedItems;
        if (_deletedItems.length) {
          promises.push($n4User.removeRelationships(toDelete));
        }

        $q.all(promises).then(function () {
          growl.addSuccessMessage('Profile Successfully Updated');
          $state.go('app.profile');
        });
      }
    };
  });