'use strict';

angular.module('berlinerSchulenApp')
	.controller('MapCtrl', ['$scope', '$rootScope', '$timeout', 'schoolFactory', '$window', function ($scope, $rootScope, $timeout, schoolFactory, $window) {
		/* This is our Map setup.
		 *
		 * It uses the OSM tiles and is set to zoom 14.
		 * The map is centered to Berlin and zooming with the mouse
		 * is disabled. It is disabled because it made navigation on the
		 * page difficult.
		 */
		angular.extend($scope, {
			defaults: {
				// tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
				maxZoom: 17,
				scrollWheelZoom: false,
				zoomControl: true,
				zoomControlPosition: 'topright'
			},
			layers: {
				baselayers: {
					mapbox: {
						name: 'Mapbox',
						url: 'http://api.tiles.mapbox.com/v4/obstschale.kp8hf045/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoib2JzdHNjaGFsZSIsImEiOiJvSFdVbmRRIn0.2aQ9TaMbMbyrAuFQh_icXg',
						type: 'xyz'
					},
					osm: {
						name: 'OpenStreetMap',
						url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
						type: 'xyz',
						layerOptions: {
							attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
						}
					}
				},
				overlays: {
					schools: {
						name: 'Feste',
						type: 'markercluster',
						visible: true
					}
				}
			},
			events: {
				map: {
					enable: [],
					logic: 'emit'
				},
				marker: {
					enable: [],
					logic: 'emit'
				}
			},
			berlin: {
				lat: 52.5153601,
				lng: 13.3833154,
				zoom: 11
			},
			data: {},
			icons: {
				blue_icon: {
					iconUrl: 'assets/img/circle_blue_borderless.svg',
					iconSize: [15, 15],
					iconAnchor: [7, 7],
					popupAnchor: [0, -5]
				},
				orange_icon: {
					iconUrl: 'assets/img/circle_orange_borderless.svg',
					iconSize: [15, 15],
					iconAnchor: [7, 7],
					popupAnchor: [0, -5]
				},
				bluegrey_icon: {
					iconUrl: 'assets/img/circle_bluegrey_borderless.svg',
					iconSize: [15, 15],
					iconAnchor: [7, 7],
					popupAnchor: [0, -5]
				},
				cyan_icon: {
					iconUrl: 'assets/img/circle_cyan_borderless.svg',
					iconSize: [15, 15],
					iconAnchor: [7, 7],
					popupAnchor: [0, -5]
				},
				green_icon: {
					iconUrl: 'assets/img/circle_green_borderless.svg',
					iconSize: [15, 15],
					iconAnchor: [7, 7],
					popupAnchor: [0, -5]
				},
				red_icon: {
					iconUrl: 'assets/img/circle_red_borderless.svg',
					iconSize: [15, 15],
					iconAnchor: [7, 7],
					popupAnchor: [0, -5]
				}
			}
		});

		/* This $on method is called if the factory has a new dataset
		 * available and broadcasts it to all controllers which subscribed
		 * to this name `updateSchools`.
		 * -> This is kind of an Event-Driven-Design
		 */
		var updateSchools = $scope.$on('updateSchools', function (event, schools) {
			/* Simple function to check if a value is a float */
			function isFloat(n) {
				return n === +n && n !== (n | 0);
			}
			$scope.data.markers = {};

			for (var i = 0; i < schools.length; i++) {

				/* ---Validation---
				 * We have to check if lat and long are set. If no
				 * lat and long numbers are given the whole update method
				 * would break and no marker after this corrupt one will
				 * be set
				 */
				var lat = null;
				var lon = null;
				if (schools[i] !== undefined) {
					lat = parseFloat(schools[i].lat);
					lon = parseFloat(schools[i].lon);
				}

				if (isFloat(lat) &&
					isFloat(lon)) {

					// Create Marker Tooltip
					var tooltip = '<strong>' + schools[i].name + '</strong><br>';
					tooltip += '<em>Ort:</em> ';
					if(schools[i].location != "") {
						tooltip += schools[i].location + ', ';
					}
					if(schools[i].zip != ""){
						tooltip += schools[i].zip + ', ';
					}
					tooltip += schools[i].county + '<br>';
					tooltip += '<em>Datum:</em> ' + schools[i].from + ' bis ' + schools[i].to + '<br>';
					tooltip += '<em>Zeit:</em> ' + schools[i].time + '<br>';
					tooltip += '<em>Eintritt:</em> ' + schools[i].fee + '<br><br>';

					tooltip += '<em>Veranstalter:</em> ' + schools[i].host + '<br>';
					if(schools[i].tel != ""){
						tooltip += '<em>Tel:</em> ' + schools[i].tel + '<br>';
					}
					if(schools[i].mail != ""){
						tooltip += '<em>Mail:</em> <a href="mailto:' + schools[i].mail + '">' + schools[i].mail + '</a><br>';
					}
					if(schools[i].website != ""){
						tooltip += '<em>Website:</em> <a href="http://' + schools[i].website + '" target="_blank">' + schools[i].website + '</a><br>';
					}

					if(schools[i].comments != "") {
						tooltip += '<br><em>Bemerkungen:</em> ' + schools[i].comments;
					}

					// Using an array here b/c with push() it is easy to
					// add new markers (object) to the array.
					var marker = {
						lat: lat,
						lng: lon,
						compileMessage: false,
						message: tooltip,
						id: schools[i].id,
						layer: 'schools'
					};

					//choose the icon depending on fee
					switch (schools[i].fee) {
						case 'K.A.':
							marker.icon = $scope.icons.orange_icon;
							break;
						case 'Eintritt frei':
							marker.icon = $scope.icons.green_icon;
							break;
						default:
							marker.icon = $scope.icons.red_icon;
							break;
					}

					$scope.data.markers[schools[i].id] = marker;
				}
			}
		});
		$scope.$on('destroy', updateSchools);

		/* This sets the height of the map according to the height of the
		 * window when the page is loaded. If the window is resized the
		 * height of the map stays as is.
		 */
		var w = angular.element($window);
		var cachedHeight = -1;

		$scope.getMinMapHeight = function () {
			if (cachedHeight === -1) {
				cachedHeight = w.height() * 1.0;
			}
			return cachedHeight;
		};

		/*
		 * This centers the map to the provided coordinates and
		 * shows a pop over
		 */
		var mapCenterRequest = $scope.$on('mapCenterRequest', function (sender, lat, lon, id) {
			sender.currentScope.berlin.lat = lat;
			sender.currentScope.berlin.lng = lon;

			for(var i in sender.currentScope.data.markers) {
				var marker = sender.currentScope.data.markers[i];
				if(marker.id === id) {
					marker.focus = true;
					break;
				}
			}
		});
		$scope.$on('destroy', mapCenterRequest);

	}]);
