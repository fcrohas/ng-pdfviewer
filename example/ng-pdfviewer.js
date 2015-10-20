/**
 * @preserve AngularJS PDF viewer directive using pdf.js.
 *
 * https://github.com/akrennmair/ng-pdfviewer 
 *
 * MIT license
 */

angular.module('ngPDFViewer', []).
directive('pdfviewer', [ function() {
	var canvas = null;
	var instance_id = null;

	return {
		restrict: "E",
		template: '<canvas id="{{id}}" class="cursor-move" ng-mouseleave="canMove=false" ng-mousedown="canMove=true" ng-mouseup="canMove=false" ng-init="canMove=false" ng-mousemove="mouseDrag($event,canMove)"></canvas>',
		scope: {
			onPageLoad: '&',
			loadProgress: '&',
			src: '=',
			stream: '=',
			id: '=',
			scale: '@'
		},
		controller: [ '$scope', function($scope) {
			$scope.pageNum = 1;
			$scope.pdfDoc = null;
			var zoomChanged = false;
			var mousePos = {x:-1, y:-1, deltaX :0, deltaY:0};

			$scope.mouseDrag = function(event, canMove) {
				if (canMove) {
						event.preventDefault();
						var deltaX = (event.offsetX + mousePos.deltaX) - mousePos.x;
						var deltaY = (event.offsetY + mousePos.deltaY) - mousePos.y;
						if ($scope.canvasElement[0].scrollLeft - deltaX > 0) {
							$scope.canvasElement[0].scrollLeft -= deltaX;
							mousePos.x = event.offsetX;
							mousePos.deltaX = deltaX;
						}
						if ($scope.canvasElement[0].scrollTop - deltaY > 0) {
							$scope.canvasElement[0].scrollTop -= deltaY;
							mousePos.y = event.offsetY;
							mousePos.deltaY = deltaY;
						}
				} else {
						mousePos.x = event.offsetX;
						mousePos.y = event.offsetY;
				}
			};

			$scope.documentProgress = function(progressData) {
				if ($scope.loadProgress) {
					$scope.loadProgress({state: "loading", loaded: progressData.loaded, total: progressData.total});
				}
			};

			$scope.loadPDF = function(path) {
				PDFJS.getDocument(path, null, null, $scope.documentProgress).then(function(_pdfDoc) {
					$scope.pdfDoc = _pdfDoc;
					$scope.renderPage($scope.pageNum, false, function(success) {
						if ($scope.loadProgress) {
							$scope.loadProgress({state: "finished", loaded: 0, total: 0});
						}
					});
				}, function(message, exception) {
					console.log("PDF load error: " + message);
					if ($scope.loadProgress) {
						$scope.loadProgress({state: "error", loaded: 0, total: 0});
					}
				});
			};

			$scope.loadStream = function(data) {
				PDFJS.getDocument({data:data}, null, null, $scope.documentProgress).then(function(_pdfDoc) {
					$scope.pdfDoc = _pdfDoc;
					$scope.renderPage($scope.pageNum, false,function(success) {
						if ($scope.loadProgress) {
							$scope.loadProgress({state: "finished", loaded: 0, total: 0});
						}
					});
				}, function(message, exception) {
					console.log("PDF load error: " + message);
					if ($scope.loadProgress) {
						$scope.loadProgress({state: "error", loaded: 0, total: 0});
					}
				});
			};

			$scope.renderPage = function(num, isZoom, callback) {
				$scope.pdfDoc.getPage(num).then(function(page) {
					if (!isZoom)
						$scope.scale = $scope.viewSize().width / page.pageInfo.view[2];
					var viewport = page.getViewport($scope.scale);
					var ctx = $scope.canvas.getContext('2d');
					$scope.canvas.height = viewport.height;
					$scope.canvas.width = viewport.width;

					page.render({ canvasContext: ctx, viewport: viewport }).promise.then(
						function() { 
							if (callback) {
								callback(true);
							}
							$scope.$apply(function() {
								$scope.onPageLoad({ page: $scope.pageNum, total: $scope.pdfDoc.numPages });
							});
						}, 
						function() {
							if (callback) {
								callback(false);
							}
							console.log('page.render failed');
						}
					);
				});
			};

			$scope.$on('pdfviewer.nextPage', function(evt, id) {
				if (id !== $scope.instance_id) {
					return;
				}

				if ($scope.pageNum < $scope.pdfDoc.numPages) {
					$scope.pageNum++;
					$scope.renderPage($scope.pageNum, false);
				}
			});

			$scope.$on('pdfviewer.prevPage', function(evt, id) {
				if (id !== $scope.instance_id) {
					return;
				}

				if ($scope.pageNum > 1) {
					$scope.pageNum--;
					$scope.renderPage($scope.pageNum, false);
				}
			});

			$scope.$on('pdfviewer.gotoPage', function(evt, id, page) {
				if (id !== $scope.instance_id) {
					return;
				}

				if (page >= 1 && page <= $scope.pdfDoc.numPages) {
					$scope.pageNum = page;
					$scope.renderPage($scope.pageNum, false);
				}
			});
			$scope.$on('pdfviewer.zoomIn', function(evt, id, page) {
				if (id !== $scope.instance_id) {
					return;
				}
				if (parseFloat($scope.scale) + 0.2 < 5.0) {
					$scope.scale = parseFloat($scope.scale) + 0.2; 
					zoomChanged = true;
					$scope.renderPage($scope.pageNum, true);
				}
			});
			$scope.$on('pdfviewer.zoomOut', function(evt, id, page) {
				if (id !== $scope.instance_id) {
					return;
				}
				if (parseFloat($scope.scale) - 0.2 > 0.0) {
					$scope.scale = parseFloat($scope.scale) - 0.2;
					zoomChanged = true; 
					$scope.renderPage($scope.pageNum, true);					
				}
			});
			$scope.$on('pdfviewer.refresh', function(evt, id, page) {
				if (id !== $scope.instance_id) {
					return;
				}
				$scope.renderPage($scope.pageNum, zoomChanged);					
			});
		} ],
		link: function(scope, iElement, iAttr) {
			scope.canvas = iElement.find('canvas')[0];
			scope.canvasElement = angular.element(iElement.find('canvas')[0].parentElement.parentElement);
			scope.viewSize = function() {
				return {width : scope.canvasElement[0].clientWidth, height : scope.canvasElement[0].clientHeight};
			}
			scope.instance_id = iAttr.id;
			PDFJS.disableWorker = true;
			scope.$watch('src', function(v) {
				if (v !== undefined && v !== null && v !== '') {
					scope.pageNum = 1;
					scope.loadPDF(v);
				}
			});
			scope.$watch('stream', function(v) {
				if (v !== undefined && v !== null && v !== '') {
					scope.pageNum = 1;
					scope.loadStream(v);
				}
			});
		}
	};
}]).
service("PDFViewerService", [ '$rootScope', function($rootScope) {

	var svc = { };
	svc.nextPage = function() {
		$rootScope.$broadcast('pdfviewer.nextPage');
	};

	svc.prevPage = function() {
		$rootScope.$broadcast('pdfviewer.prevPage');
	};

	svc.zoomIn = function() {
		$rootScope.$broadcast('pdfviewer.zoomIn');
	};

	svc.zoomOut = function() {
		$rootScope.$broadcast('pdfviewer.zoomOut');
	};

	svc.refresh = function() {
		$rootScope.$broadcast('pdfviewer.refresh');
	};

	svc.Instance = function(id) {
		var instance_id = id;
		return {
			prevPage: function() {
				$rootScope.$broadcast('pdfviewer.prevPage', instance_id);
			},
			nextPage: function() {
				$rootScope.$broadcast('pdfviewer.nextPage', instance_id);
			},
			zoomIn: function() {
				$rootScope.$broadcast('pdfviewer.zoomIn', instance_id);
			},
			zoomOut: function() {
				$rootScope.$broadcast('pdfviewer.zoomOut', instance_id);
			},
			gotoPage: function(page) {
				$rootScope.$broadcast('pdfviewer.gotoPage', instance_id, page);
			},
			refresh: function(page) {
				$rootScope.$broadcast('pdfviewer.refresh', instance_id);
			}			

		};
	};

	return svc;
}]);
