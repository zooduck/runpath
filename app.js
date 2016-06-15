'use strict';
// \/\/\/\/
// App
// \/\/\/\/
angular.module('RunPath', [
	'RunPath.controllers',
	'RunPath.services',
	'RunPath.directives'
]);
// \/\/\/\/\/\/\/
// Controllers
// \/\/\/\/\/\/\/
angular.module('RunPath.controllers', []).controller('mainCtrl', function ( $scope, photosApiService ) {
	
	$scope.photos = [];	
	$scope.pagination = [];
	$scope.currentPage = 1;
	$scope.scrollStop = true;
	$scope.config = {};	
	
	photosApiService.getPhotos().then( function ( result ) {
		// ---------------------------------------------------------------------------------------
		// allow max_photos to be set via query_string in url or in DOM using max-photos directive	
		// ---------------------------------------------------------------------------------------	
		var maxPhotos = location.search.split('&')[0].split('=')[1] || $scope.config.maxPhotos || 10;
		$scope.photos = result.data.slice( 0, maxPhotos );
		$scope.filteredPhotos = $scope.photos;
		$scope.pagination = [{ description: '1 - ' + $scope.photos.length, pages: $scope.photos }];		
	});

	$scope.photosFilter = function () {
		var pattern = new RegExp( $scope.titleFilter, 'i' );		
		$scope.filteredPhotos = $scope.photos.filter( function ( photo ) {		
			return ( (!$scope.titleFilter || pattern.test( photo.title )) && isPageValid( photo ) );
		});
		window.scrollTo( 0, 0 );	
	}

	var isPageValid = function ( photo ) {
		var currentPagination = $scope.pagination[ $scope.currentPage - 1];		
		return $scope.pagination.length === 1 || photo.id >= currentPagination.minPage && photo.id <= currentPagination.maxPage;
	}

	$scope.limitTo = function () {	
		
		$scope.pagination = [];
		$scope.currentPage = 1;

		if( !$scope.resultsLimit || $scope.resultsLimit >= $scope.photos.length ){			
			$scope.pagination = [{ description: '1 - ' + $scope.photos.length, pages: $scope.photos }];			
		}else{
			var pageSize = isNaN( $scope.resultsLimit ) ? 1 : parseInt( $scope.resultsLimit );			
			var count = Math.ceil( $scope.photos.length / pageSize );
			var startIndex = 0;
			for( var i = 0; i < count; i++ ){
				var slice = $scope.photos.slice( startIndex, pageSize * ( i + 1 ) );				
				if( !$scope.pagination[i] ){ $scope.pagination[i] = []; }
				$scope.pagination[i] = { description: ( startIndex + 1 ) +  '-' + ( startIndex  + slice.length ), minPage: startIndex + 1, maxPage: startIndex + pageSize, pages: slice };				
				startIndex += pageSize;
			}			
		}
		$scope.photosFilter();	
	}

	$scope.setCurrentPage = function ( pageNumber ) {
		$scope.currentPage = pageNumber;
		$scope.photosFilter();
		window.scrollTo( 0, 0 );
	}
});
// \/\/\/\/\/
// Services
// \/\/\/\/\/
angular.module('RunPath.services', []).factory('photosApiService', function ( $http ) {
	var photosApi = {
		getPhotos: function () {
			return $http({
				method: 'GET',
				url: 'http://jsonplaceholder.typicode.com/photos'
			})
		}
	}
	return photosApi;
});
angular.module('RunPath.services').factory('helpersService', function () {
	var helpers = {
		addClass: function ( el, className ) {			
			var classExists = el.className.search( className );			
			if( classExists === -1 ){				
				el.className += ' ' + className;
			}			
		},
		removeClass: function ( el, className ) {
			el.className = el.className.replace(' ' + className, '');
		}
	}
	return helpers;
});
// \/\/\/\/\/\/
// Directives
// \/\/\/\/\/\/
angular.module('RunPath.directives', []).directive('scrollStopper', function ( helpersService ) {
	// ---------------------------------------------------------------------------------------
	// NOTE: Obviously should have just used a scope variable with ng-class for this
	// but for some reason couldn't get scope vars to be respectd by ng-show, ng-class etc..
	// ---------------------------------------------------------------------------------------
	return{
		link: function ( scope, el, attrs ){
			var title_header      = document.getElementById('title_header');			 
			document.addEventListener('scroll', function ( e ) {						
				if( document.body.scrollTop || document.documentElement.scrollTop > 10 ){
					helpersService.addClass( title_header, 'malenky' );		
				}else {					
					helpersService.removeClass( title_header, 'malenky' );						
				}
			});
		}
	}
});
angular.module('RunPath.directives').directive('maxPhotos', function () {
	return{
		link: function ( scope, el, attrs ){			
			scope.config.maxPhotos = scope.$eval(attrs.maxPhotos);			
		}
	}
});
