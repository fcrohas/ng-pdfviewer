# ng-pdfviewer

AngularJS PDF viewer directive for pdfjs using stream or url.

An online demonstration is available here http://fcrohas.github.io/ng-pdfviewer/

Sample html using url :
``` html
<button ng-click="prevPage()">&lt;</button>
<button ng-click="nextPage()">&gt;</button>
<br>
<span>{{currentPage}}/{{totalPages}}</span>
<br>
<pdfviewer src="test.pdf" scale="1.0" on-page-load='pageLoaded(page,total)' id="viewer"></pdfviewer>
```

Sample html using pdf stream :
``` html
<button ng-click="prevPage()">&lt;</button>
<button ng-click="nextPage()">&gt;</button>
<br>
<span>{{currentPage}}/{{totalPages}}</span>
<br>
<pdfviewer stream="pdfStream" scale="1.0" on-page-load='pageLoaded(page,total)' id="viewer"></pdfviewer>
```

and in your AngularJS code:

``` js

var app = angular.module('testApp', [ 'ngPDFViewer' ]);

app.controller('TestCtrl', [ '$scope', 'PDFViewerService', function($scope, pdf) {
	$scope.viewer = pdf.Instance("viewer");
	$scope.pdfStream = new Uint8Array();
	$http.get("test.pdf",
	 				{params : {}, responseType: "arraybuffer"}).then(function(response) {
						$scope.pdfStream = new Uint8Array(response.data);
	 });

	$scope.nextPage = function() {
		$scope.viewer.nextPage();
	};

	$scope.prevPage = function() {
		$scope.viewer.prevPage();
	};

	$scope.pageLoaded = function(curPage, totalPages) {
		$scope.currentPage = curPage;
		$scope.totalPages = totalPages;
	};
}]);
```

## Requirements

* AngularJS (http://angularjs.org/)
* PDF.js (http://mozilla.github.io/pdf.js/)

## Usage

Include `ng-pdfviewer.js` as JavaScript file, along with `pdf.js` and `pdf.compat.js`.

Declare `ngPDFViewer` as dependency to your module.

You can now use the `pdfviewer` tag in your HTML source.

## License

MIT. See LICENSE.md for further details.

## Author

Rework by me Fabrice Crohas <fcrohas@gmail.com>

Original author Andreas Krennmair <ak@synflood.at>

