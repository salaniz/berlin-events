'use strict';

angular.module('berlinerSchulenApp')
	.controller('FilterCtrl', ['$scope', '$timeout', '$mdSidenav', 'schoolFactory', '$filter','LxDialogService', 
		function ($scope, $timeout, $mdSidenav, schoolFactory, $filter, LxDialogService) {

			var orderBy = $filter('orderBy');
			// Initialize Filter in Front-End
			$scope.searchFilter = {
				main: '',
				// street: '',
				districts: [],
				startDate: (new Date()).setHours(0,0,0,0),
				endDate: undefined,
        /*
				 * schooltypes: [],
				 * supporter: [],
				 * languages: [],
				 * accessibilities: [],
				 * courses: [],
				 * allDayCare: false,
				 * dual: false,
				 * secEdu: false
         */
			};

			$scope.loading = false;

			$scope.filter = function () {
				$scope.loading = true;
				$timeout(function () {
					schoolFactory
						.setFilter($scope.searchFilter)
						.applyFilter();
					$scope.loading = false;
				}, 600);
			};

			$scope.openCal = function(dialogID) {
			  LxDialogService.open(dialogID);
      };


			$scope.closeCal = function(dialogID) {
			  LxDialogService.close(dialogID);
      };


			$scope.resetFilter = function() {

				$scope.cbDistricts.selectedDistricts = [];
				$scope.cbDate.selectedStartDate = (new Date()).setHours(0,0,0,0);
				$scope.cbDate.selectedStartDate = undefined;
				$scope.cbDate.startDateString = moment($scope.cbDate.selectedStartDate).format('DD.MM.YYYY');
				$scope.cbDate.endDateString = '';
        /*
				 * $scope.cbSchooltypes.selectedTypes = [];
				 * $scope.cbSchoolSupporter.selectedSupporter = [];
				 * $scope.cbLanguages.selectedLang = [];
				 * $scope.cbAccessibility.selectedAccessibilities = [];
				 * $scope.cbCourses.selectedCourses = [];
         */

				$scope.searchFilter = {
					main: '',
					// street: '',
					districts: [],
					startDate: (new Date()).setHours(0,0,0,0),
					endDate: undefined,
          /*
					 * schooltypes: [],
					 * supporter: [],
					 * languages: [],
					 * accessibilities: [],
					 * courses: [],
					 * allDayCare: false,
					 * dual: false,
					 * secEdu: false
           */
				};
				$scope.filter();
			};

			$scope.cbDistricts = {
				districts: [],

				selectedDistricts: [],

				loading: false,

				exec: function (values) {
					$scope.searchFilter.districts = values.newValue;
					$scope.filter();
					//console.log($scope.cbDate.selectedStartDate);

          
				},

				populate: function (set) {
					var list = [];
					for (var s in set) {
						list.push({name: set[s]});
					}
					$scope.cbDistricts.districts = orderBy(list, 'name', false);
					$scope.cbDistricts.loading = false;
				},

				addCallback: function () {
					$scope.cbDistricts.loading = true;

					schoolFactory.addFilterCallback('county', this.populate);
				}
			};

			$scope.cbDate = {
				selectedStartDate: (new Date()).setHours(0,0,0,0),
				selectedEndDate: undefined,
				startDateString: '',
				endDateString: '',

				loading: false,

				execStart: function (value) {
					//console.log('In execStart')
          //console.log(value)
          value.setHours(0,0,0,0);
          $scope.cbDate.startDateString = moment(value).format('DD.MM.YYYY');
          //console.log($scope.cbDate.startDateString)
					$scope.searchFilter.startDate = value;
					// //console.log($scope.cbDate.selectedStartDate)
          /*
           */
					$scope.filter();
          $scope.closeCal('startCal');
				},
				
        execEnd: function (value) {
					//console.log('In execEnd')
          //console.log(value)
          value.setHours(23,59,59,999);
          $scope.cbDate.endDateString = moment(value).format('DD.MM.YYYY');
          //console.log($scope.cbDate.endDateString)
					$scope.searchFilter.endDate = value;
					// //console.log($scope.cbDate.selectedStartDate)
          /*
					 * $scope.searchFilter.startDate = values.newValue;
           */
					$scope.filter();
          $scope.closeCal('endCal');
				},

				populate: function () {
					$scope.cbDate.loading = false;
				},

				addCallback: function () {
					$scope.cbDate.loading = true;

					schoolFactory.addFilterCallback('from', this.populate);
				}
			};


			this.setSearchFilter = function( filter ) {
				$scope.searchFilter = filter;

				$scope.cbDistricts.selectedDistricts = filter.districts;
				$scope.cbDate.selectedStartDate = (new Date()).setHours(0,0,0,0);
				$scope.cbDate.selectedEndDate = undefined;
        $scope.cbDate.startDateString = moment($scope.cbDate.selectedStartDate).format('DD.MM.YYYY');			
        // $scope.cbDate.selectedStartDate = filter.startDate;
			};


			this.runFilter = function () {
				// First catchfilter from factory and set it to
				// old value
				this.setSearchFilter(schoolFactory.getFilter());

				if (schoolFactory.hasData()) {
					// Get Select Box Choices
					var set = schoolFactory.getChoiceByName('county');
					$scope.cbDistricts.populate(set);

					$scope.cbDate.populate();
          /*
					 * set = schoolFactory.getChoiceByName('Schultraeger');
					 * $scope.cbSchoolSupporter.populate(set);

					 * set = schoolFactory.getChoiceByName('Bauten');
					 * $scope.cbAccessibility.populate(set);

					 * set = schoolFactory.getChoiceByName('Leistungskurse');
					 * $scope.cbCourses.populate(set);

					 * set = schoolFactory.getChoiceByName('Schulart');
					 * $scope.cbSchooltypes.populate(set);
           */
					//If school data is already loaded just apply filter
					$scope.filter();
				} else {
					$scope.cbDistricts.addCallback();
					$scope.cbDate.addCallback();
          /*
					 * $scope.cbSchoolSupporter.addCallback();
					 * $scope.cbAccessibility.addCallback();
					 * $scope.cbCourses.addCallback();
					 * $scope.cbSchooltypes.addCallback();
           */
					// else set the filter and wait. The schoolFactory will load
					// the data and then apply the filter

					schoolFactory.setFilter($scope.searchFilter);
				}
			};

			// Run or set filter depending if data is available
			this.runFilter();

		}]);
