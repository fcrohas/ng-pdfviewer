var app = angular.module('testApp', [ 'ngPDFViewer' ]);

app.controller('TestController', [ '$scope', 'PDFViewerService', '$http', function($scope, pdf, $http) {
	$scope.pdfURL = "test.pdf";
	$scope.pdfStream = new Uint8Array();
	$scope.pdf = pdf;
	$scope.status = {
		state : 'finished',
		percent : 0
	};

	$scope.pageLoaded = function(curPage, totalPages) {
		$scope.currentPage = curPage;
		$scope.totalPages = totalPages;
	};

	$scope.getProgressStyle = function() {
		return { 'width':$scope.status.percent+'%'};
	};

	$scope.loadProgress = function(loaded, total, state) {
		$scope.$apply( function() {
			$scope.status.percent = Math.round(loaded * 100 / total);
			$scope.status.state = state;
		});		
	};

	$scope.loadStream = function() {
		$http.get("test.pdf", {params : {}, responseType: "arraybuffer"}).then(function(response) {
			$scope.pdfStream = new  Uint8Array(response.data);
 		});
 	};

}]).directive('resize', [ '$window',function factory($window) {
	return {
            restrict: 'A',
            link: function link(scope, element, attrs) {
            	var panel = element[0];
            	var browser = angular.element($window);
            	scope.panelSize = function() {
				return {width : panel.clientWidth, height : panel.clientHeight };
            	};

            	scope.windowSize = function() {
            		return {width : browser.width(), height : browser.height() };
            	};

            	scope.$watch(scope.windowSize, function(size) {
	                scope.getSize = function () {
	                	var result = {'overflow-x': 'hidden'};
	                	if (attrs.resizeX) { 
	                		result.width = size.width * scope.resizeX+'px';
	                		if (attrs.mode=="fit")
	                			result['max-width'] = size.width  * scope.resizeX + 'px';
	                	}
	                	if (attrs.resizeY) {
	                		result.height = size.height * scope.resizeY+'px';
	                		if (attrs.mode=="fit")
	               				result['max-height'] = size.height  * scope.resizeY + 'px';
	                	}
	                  return result;
	                };            
            	}, true);

            	// scope.$watch(scope.panelSize, function(size) {
            	// }, true);

            	if (attrs.mode == 'fit') {
            		// console.log(attrs.resizeY);
            		if ((attrs.resizeY) && (attrs.resizeY.indexOf('%')!=-1)) {
            			scope.resizeY = parseFloat(attrs.resizeY) / 100.0;
            		} else {
            			scope.resizeY = attrs.resizeY;
            		}
            		if ((attrs.resizeX) && (attrs.resizeX.indexOf('%')!=-1)) {
            			scope.resizeX = parseFloat(attrs.resizeX) / 100.0;
            		} else {
            			scope.resizeX = attrs.resizeX;
            		}
            	}
            }
        };
}]);
