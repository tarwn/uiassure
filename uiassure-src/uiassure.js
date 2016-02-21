var phantomjs = require('selenium-webdriver/phantomjs');
var promise = require('selenium-webdriver').promise;
var By = require('selenium-webdriver').By;

var ExitTestEarlyError = require('./exitTestEarlyError');
var Browser = require('./browser');
var User = require('./user');
var PageObject = require('./pageObject');
var TestStatus = require('./testStatus');

function TestRunner(){
	var self = this;
	
	self.pages = {};
	var tests = [];

	self.addPage = function(pageName, rawPageDefinitions){
		var rawPageDefinition = rawPageDefinitions;
		if(Array.isArray(rawPageDefinition)){
			rawPageDefinition = merge(rawPageDefinitions.reverse());
		}

		var page = new PageObject(rawPageDefinition);
		page.name = pageName;
		self.pages[pageName] = page;
		return page;
	};

	self.addTest = function(testName, test){
		tests.push({
			name: testName,
			run: function(browserUtil, userUtil, pages){
				return promise.fulfilled().then(function(){ test(browserUtil, userUtil, pages); });
			}
		});
	};

	self.run = function(){
		var runningTests = tests.map(function(test){
			return runTest(test);
		});
		
		return promise.all(runningTests).then(function(results){
			var testStats = results.reduce(function(prevValue, curValue){
				prevValue.total++;
				if(curValue.status == 'fail'){
					prevValue.failures++;
				}
				else if(curValue.status == 'error'){
					prevValue.errors++;
				}
				return prevValue;
			}, { failures: 0, errors: 0, total: 0 });

			var fs = require('fs');
			var stream = fs.createWriteStream("results/results.xml");
			stream.once('open', function(fd) {
				stream.write('<testsuites>\n');
				stream.write('\t<testsuite tests="' + testStats.total + '" errors="' + testStats.errors + '" failures="' + testStats.failures + '">\n');
				results.forEach(function(result){
					if(result.status == 'pass'){
						stream.write('\t\t<testcase classname="ui" name="' + result.name + '" time="' + result.elapsedInSeconds + '" />\n');
					}
					else if(result.status === 'fail' || result.status === 'error'){
						stream.write('\t\t<testcase classname="ui" name="' + result.name + '"  time="' + result.elapsedInSeconds + '">\n');
						stream.write('\t\t\t<failure type="failed">Step [' + result.getLastStep().name + ']: ' + result.message + '</failure>\n');
						stream.write('\t\t</testcase>\n');
					}
					else{
						stream.write('\t\t<testcase classname="ui" name="' + result.name + '"  time="' + result.elapsedInSeconds + '">\n');
						stream.write('\t\t\t<failure type="incomplete">test did not reach pass/fail, still marked as running</failure>\n');
						stream.write('\t\t</testcase>\n');
					}
					
				});
				stream.write('\t</testsuite>\n');
				stream.write('</testsuites>\n');
				stream.end();
			});

			return results;
		});
	};

	function runTest(test){
		var testStatus = new TestStatus(test);
		testStatus.recordStart();

		//TODO later - proxy to track wire errors and times
		var driver = new phantomjs.Driver();
		var browserUtil = new Browser(driver, self.pages, testStatus);
		var userUtil = new User(driver, browserUtil, self.pages, testStatus);

		return test.run(browserUtil, userUtil, self.pages)
			.then(function(){
				testStatus.recordPass();
			})
			.thenCatch(function(e){
				if(e instanceof ExitTestEarlyError){
					// no work - probably a fail - keep the current status and message
				}
				else{
					// record an error status
					testStatus.recordError(e.message);
				}
			})
			.then(function(){
				return driver.takeScreenshot().then(function(image, err) {
					require('fs').writeFile('results/' + test.name + '.png', image, 'base64');
					testStatus.finalScreenshot = 'results/' + test.name + ".png";
					driver.quit();
				});
			})
			.then(function(){
				return testStatus;
			});
	}
}

// modified from: http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
function merge(arr) {
    var obj = {},
        i = 0,
        il = arr.length,
        key;
    for (; i < il; i++) {
        for (key in arr[i]) {
            if (arr[i].hasOwnProperty(key)) {
                obj[key] = arr[i][key];
            }
        }
    }
    return obj;
};


exports.TestRunner = TestRunner;
exports.By = require('selenium-webdriver').By;
