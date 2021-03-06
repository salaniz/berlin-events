'use strict';

angular.module('berlinerSchulenApp')
	.factory('schoolFactory', ['$http', '$rootScope',
		function ($http, $rootScope) {

			var allSchools = {content: null};
			var schools = {content: null};
			var filter = {};
			var filterCallbacks = [];
			var schoolCallback = [];
			var runFilterCallback = [];
			var selectChoices = {};
			var firstRun = true;

			schools.initFilter = function () {
				return {
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
					 * secEdu: false,
           */
				};
			};

			schools.addFilterCallback = function (field, callback) {
				filterCallbacks.push({field: field, cb: callback});
			};

			schools.addSchoolCallback = function (id, callback) {
				schoolCallback.push({id: id, cb: callback});
			};

			schools.addRunFilterCallback = function (cb) {
				runFilterCallback.push(cb);
			};


			schools.setFirstRun = function(val) {
				firstRun = val;
			};

			schools.isFirstRun = function() {
				return firstRun;
			};

			/**
			 * set new filter properties but do not apply filter
			 * @param Obj filterProp new filter properties
			 * @return Obj this
			 */
			schools.setFilter = function (filterProp) {

				for (var field in filterProp) {
					switch (field) {
						case 'main':
							if( schools.isFirstRun() ) {
								filter.main = '';
								schools.setFirstRun( false );
							} else {
								filter.main = filterProp.main.toLowerCase();
							}
							break;

            /*
						 * case 'street':
						 * 	filter.street = filterProp.street;
						 * 	break;
             */

						case 'districts':
							filter.districts = filterProp.districts;
							break;

						case 'startDate':
							filter.startDate = filterProp.startDate;
							break;

						case 'endDate':
							filter.endDate = filterProp.endDate;
							break;
            /*
						 * case 'supporter':
						 * 	filter.supporter = filterProp.supporter;
						 * 	break;

						 * case 'allDayCare':
						 * 	filter.allDayCare = filterProp.allDayCare;
						 * 	break;

						 * case 'secEdu':
						 * 	filter.secEdu = filterProp.secEdu;
						 * 	break;

						 * case 'dual':
						 * 	filter.dual = filterProp.dual;
						 * 	break;

						 * case 'languages':
						 * 	filter.languages = filterProp.languages;
						 * 	break;

						 * case 'accessibilities':
						 * 	filter.accessibilities = filterProp.accessibilities;
						 * 	break;

						 * case 'courses':
						 * 	filter.courses = filterProp.courses;
						 * 	break;

						 * case 'schooltypes':
						 * 	filter.schooltypes = filterProp.schooltypes;
						 * 	break;
             */
					}

				}

				return schools;
			};

			schools.getFilter = function () {
				// Create a copy of filter otherwise the filter object in this
				// factory and the searchFilter object in the FilterCtrl are
				// linked and this is not wanted because the first search
				// run should search for "tech" but the word should not be
				// displayed in the frontend
				return angular.copy(filter);
			};

			/**
			 * start filtering and broadcast new school set
			 * @return Obj this
			 */
			schools.applyFilter = function () {
				if (allSchools.content !== null) {
					var filteredJson = allSchools.content
							// Filter Name
							.filter(function (row) {
								if (row.name !== undefined)
								{
									var name = row.name.toLowerCase();
                  //console.log
									if(name.indexOf(filter.main) > -1) {
										return true;
									}
								}
								if (row.location !== undefined)
								{
									var location = row.location.toLowerCase();
									if(location.indexOf(filter.main) > -1) {
										return true;
									}
								}
								if (row.host !== undefined)
								{
									var host = row.host.toLowerCase();
									if(host.indexOf(filter.main) > -1) {
										return true;
									}
								}
								return false;
							})
              /*
							 * // Filter Straße
							 * .filter(function (row) {
							 * 	return false;
							 * })
							 * // Filter Veranstalter
							 * .filter(function (row) {
							 * 	return false;
							 * })
               */
							// Filter Bezirk (Region)
							.filter(function (row) {
								if (filter.districts.length > 0) {
									for (var dist in filter.districts) {
										var distName = filter.districts[dist].name;
										if (distName !== '' && row.county.indexOf(distName) > -1) {
											return true;
										}
									}
									return false;
								} else {
									return true;
								}
							})
              // Filter Beginndatum
							.filter(function (row) {
								if (filter.startDate != undefined) {
									//console.log(filter.startDate)
                  var split = row.to.split(".");
                  var eventDate = new Date(split[2],split[1]-1,split[0]);
                  //console.log(split)
                  //console.log(eventDate);
                  if (filter.startDate>eventDate){
                    return false;
                  }
									return true;
								} else {
									return true;
								}
							})
              // Filter Enddatum
							.filter(function (row) {
								if (filter.endDate != undefined) {
									//console.log(filter.endDate)
									//console.log('Filter End')
                  var split = row.from.split(".");
                  var eventDate = new Date(split[2],split[1]-1,split[0]);
                  //console.log(split)
                  //console.log(eventDate);
                  if (filter.endDate<eventDate){
                    return false;
                  }
									return true;
								} else {
									return true;
								}
							})
              /*
							 * // Filter Schulträger (öffentlich|privat)
							 * .filter(function (row) {
							 * 	if (filter.supporter.length > 0) {
							 * 		for (var sup in filter.supporter) {
							 * 			var supName = filter.supporter[sup].name;
							 * 			if (supName !== '' && row.Schultraeger.toLowerCase().indexOf(supName.toLowerCase()) > -1) {
							 * 				return true;
							 * 			}
							 * 		}
							 * 		return false;
							 * 	} else {
							 * 		return true;
							 * 	}
							 * })
							 * // Filter Ganztagsbetrieb
							 * .filter(function (row) {
							 * 	if (filter.allDayCare === true) {
							 * 		if (row.Ganztagsbetrieb !== undefined ||
							 * 			(row.spez_Angebote !== undefined && row.spez_Angebote.toLowerCase().indexOf('ganztagsschule') > -1)) {
							 * 			return true;
							 * 		} else {
							 * 			return false;
							 * 		}
							 * 	} else {
							 * 		return true;
							 * 	}
							 * })
							 * // Filter zweiter Bildungsweg
							 * .filter(function (row) {
							 * 	if (filter.secEdu === true) {
							 * 		if (row.ZweiterBildungsweg !== undefined) {
							 * 			return true;
							 * 		} else {
							 * 			return false;
							 * 		}
							 * 	} else {
							 * 		return true;
							 * 	}
							 * })
							 * // Filter Duales Lernen
							 * .filter(function (row) {
							 * 	if (filter.dual === true) {
							 * 		if (row.DualesLernen !== undefined) {
							 * 			return true;
							 * 		} else {
							 * 			return false;
							 * 		}
							 * 	} else {
							 * 		return true;
							 * 	}
							 * })
							 * // Filter Fremdsprachen
							 * .filter(function (row) {
							 * 	if (filter.languages.length > 0) {
							 * 		for (var sup in filter.languages) {
							 * 			var supName = filter.languages[sup].name.toLowerCase();
							 * 			if (supName !== '' &&
							 * 				row.Fremdsprachen !== undefined) {
							 * 				for (var i = row.Fremdsprachen.length - 1; i >= 0; i--) {
							 * 					if (row.Fremdsprachen[i].toLowerCase().indexOf(supName) > -1) {
							 * 						return true;
							 * 					}
							 * 				}
							 * 			}
							 * 		}
							 * 		return false;
							 * 	} else {
							 * 		return true;
							 * 	}
							 * })
							 * // Filter Barrierefreiheit
							 * .filter(function (row) {
							 * 	if (filter.accessibilities.length > 0) {
							 * 		for (var acc in filter.accessibilities) {
							 * 			var accName = filter.accessibilities[acc].name.toLowerCase();
							 * 			if (accName !== '' &&
							 * 				row.Bauten !== undefined) {
							 * 				for (var i = row.Bauten.length - 1; i >= 0; i--) {
							 * 					if (row.Bauten[i].toLowerCase().indexOf(accName) > -1) {
							 * 						return true;
							 * 					}
							 * 				}
							 * 			}
							 * 		}
							 * 		return false;
							 * 	} else {
							 * 		return true;
							 * 	}
							 * })
							 * // Filter Leistungskurse
							 * .filter(function (row) {
							 * 	if (filter.courses.length > 0) {
							 * 		for (var course in filter.courses) {
							 * 			var courseName = filter.courses[course].name.toLowerCase();
							 * 			if (courseName !== '' &&
							 * 				row.Leistungskurse !== undefined) {
							 * 				for (var i = row.Leistungskurse.length - 1; i >= 0; i--) {
							 * 					if (row.Leistungskurse[i].toLowerCase().indexOf(courseName) > -1) {
							 * 						return true;
							 * 					}
							 * 				}
							 * 			}
							 * 		}
							 * 		return false;
							 * 	} else {
							 * 		return true;
							 * 	}
							 * })
							 * // Filter Schulart
							 * .filter(function (row) {
							 * 	if (filter.schooltypes.length > 0) {
							 * 		for (var type in filter.schooltypes) {
							 * 			var typeName = filter.schooltypes[type].name;
							 * 			if (typeName !== '' && row.Schulart.indexOf(typeName) > -1) {
							 * 				return true;
							 * 			}
							 * 		}
							 * 		return false;
							 * 	} else {
							 * 		return true;
							 * 	}
							 * })
               */
						;

					schools.content = filteredJson;
					schools.publishData();
				} else {
					return null;
				}

				if( schools.isFirstRun() ) {
					schools.setFirstRun(false);
				}
				return schools;
			};

			schools.publishData = function () {
				$rootScope.$broadcast('updateSchools', schools.content);
			};

			schools.getJson = function () {

				$http.get('data/events.json').success(function (data) {
					allSchools.content = data;
					schools.content = data;

					schools.applyFilter();

					if (filterCallbacks.length > 0) {
						schools.populateFilterChoices();
					}

					if (schoolCallback.length > 0) {
						schools.populateSchoolDetails();
					}

					if (runFilterCallback.length > 0) {
						runFilterCallback.call(this);
					}

				});
			};

			schools.populateFilterChoices = function () {

				var tmp = [];
				for (var i = filterCallbacks.length - 1; i >= 0; i--) {
					tmp.push([]);
				}

				for (i = allSchools.content.length - 1; i >= 0; i--) {
					for (var j = filterCallbacks.length - 1; j >= 0; j--) {

						var value = '';
						var field = filterCallbacks[j].field;
						var school = allSchools.content[i];


						switch (field) {
							case 'county':
								if (school.county !== undefined) {
									value = school.county;
								}
								break;
              /*
							 * case 'Schultraeger':
							 * 	if (school.Schultraeger !== undefined) {
							 * 		value = school.Schultraeger;
							 * 	}
							 * 	break;

							 * case 'Bauten':
							 * 	if (school.Bauten !== undefined) {
							 * 		value = school.Bauten;
							 * 	}
							 * 	break;

							 * case 'Leistungskurse':
							 * 	if (school.Leistungskurse !== undefined) {
							 * 		value = school.Leistungskurse;
							 * 	}
							 * 	break;

							 * case 'Schulart':
							 * 	if (school.Schulart !== undefined) {
							 * 		value = school.Schulart;
							 * 	}
							 * 	break;
               */

							default:
								value = '';
								break;
						}

						if (value.constructor !== Array && !tmp[j].contains(value)) {
							tmp[j].push(value);
						} else if (value.constructor === Array) {
							for (var g = value.length - 1; g >= 0; g--) {
								if (!tmp[j].contains(value[g])) {
									tmp[j].push(value[g]);
								}
							}
						}
					}
				}

				for (i = filterCallbacks.length - 1; i >= 0; i--) {
					schools.saveChoices(filterCallbacks[i].field, tmp[i]);
					filterCallbacks[i].cb.call(this, tmp[i]);
				}
			};

			schools.saveChoices = function (field, set) {
				switch (field) {
					case 'county':
						selectChoices.county = set;
						break;

          /*
					 * case 'Schultraeger':
					 * 	selectChoices.Schultraeger = set;
					 * 	break;

					 * case 'Bauten':
					 * 	selectChoices.Bauten = set;
					 * 	break;

					 * case 'Leistungskurse':
					 * 	selectChoices.Leistungskurse = set;
					 * 	break;

					 * case 'Schulart':
					 * 	selectChoices.Schulart = set;
					 * 	break;
           */

					default:
						break;
				}
			};

			schools.getChoiceByName = function (field) {
				switch (field) {
					case 'county':
						return selectChoices.county;

          /*
					 * case 'Schultraeger':
					 * 	return selectChoices.Schultraeger;

					 * case 'Bauten':
					 * 	return selectChoices.Bauten;

					 * case 'Leistungskurse':
					 * 	return selectChoices.Leistungskurse;

					 * case 'Schulart':
					 * 	return selectChoices.Schulart;
           */

					default:
						return [];
				}
			};

			schools.populateSchoolDetails = function () {
				if (allSchools.content !== null) {
					for (var i = schoolCallback.length - 1; i >= 0; i--) {
						var id = schoolCallback[i].id;
						var school = schools.getSchoolByID(id);
						schoolCallback[i].cb.call(this, school);
					}
				}
			};

			schools.getSchoolByID = function (id) {
				for (var i = allSchools.content.length - 1; i >= 0; i--) {
					if (allSchools.content[i].id === id) {
						return allSchools.content[i];
					}
				}

				return {};
			};

			schools.hasData = function () {
				return (allSchools.content !== null);
			};

			filter = schools.initFilter();
			schools.getJson();

			return schools;
		}]);

Array.prototype.contains = function (obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
};
