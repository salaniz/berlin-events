'use strict';

/**
 * @ngdoc function
 * @name schooldataApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the schooldataApp
 */
angular.module('berlinerSchulenApp')
	.controller('ListCtrl', ['$scope', '$rootScope',
		function ($scope, $rootScope) {

		$scope.schools = [];
		$scope.pageSize = 10;
		$scope.currentPage = 0;

		/* Simple function to check if a value is a float */
		function isFloat(n) {
			return n === +n && n !== (n | 0);
		}

		/*
		 * This issues a mapCenterRequest for the selected school.
		 */
		$scope.centerMap = function (school) {
			var lat = parseFloat(school.lat);
			var lon = parseFloat(school.lon);
			var bsn = school.bsn;
			if (isFloat(lat) && isFloat(lon)) {
				$rootScope.$broadcast('mapCenterRequest', lat, lon, bsn);
			}
		};

		$scope.numberOfPages = function () {
			return Math.ceil($scope.schools.length / $scope.pageSize);
		};

		var updateSchools = $scope.$on('updateSchools', function (event, schools) {
			$scope.currentPage = 0;
			$scope.schools = [];
			var schoolList = [];

			var icons = {
				//blue: {
				//	src: 'assets/img/circle_blue_borderless.svg'
				//},
				red: {
					src: 'assets/img/circle_red_borderless.svg'
				},
				//bluegrey: {
				//	src: 'assets/img/circle_bluegrey_borderless.svg'
				//},
				//cyan: {
				//	src: 'assets/img/circle_cyan_borderless.svg'
				//},
				green: {
					src: 'assets/img/circle_green_borderless.svg'
				},
				orange: {
					src: 'assets/img/circle_orange_borderless.svg'
				}
			};

			if (schools.length > 0) {

				for (var i = schools.length - 1; i >= 0; i--) {
					var school = {
						'name': schools[i].name,
						'district': schools[i].county,
						'street': schools[i].location,
						'zip': schools[i].zip,
						'date': schools[i].from + ' bis ' + schools[i].to,
						'url': schools[i].website,
						'lat': schools[i].lat,
						'lon': schools[i].lon,
					};

					//choose the icon depending on fee
					switch (schools[i].fee) {
						case 'K.A.':
							school.icon = icons.orange;
							break;
						case 'Eintritt frei':
							school.icon = icons.green;
							break;
						default:
							school.icon = icons.orange;
							break;
					}
					schoolList.push(school);
				}

				populateList(schoolList);
			}
		});
		$scope.$on('destroy', updateSchools);

		var populateList = function(list) {
				$scope.schools = list;
		};

	}]);

//We already have a limitTo filter built-in to angular,
//let's make a startFrom filter
angular.module('berlinerSchulenApp')
	.filter('startFrom', function() {
		return function(input, start) {
			if ( typeof input !== 'undefined' &&
				 typeof start !== 'undefined' ) {
				start = +start; //parse to int
				return input.slice(start);
			} else {
				return null;
			}
		};
	});

