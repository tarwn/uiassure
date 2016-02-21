var until = require('selenium-webdriver').until;
var promise = require('selenium-webdriver').promise;

function User(driver, browser, pages, testStatus){
	
	this.verifyPageTitleIs = function(expectedTitle){
		testStatus.runStep('verifyPageTitleIs("' + expectedTitle + '")', function(){
			return driver.getTitle().then(function(actualTitle) {
				if(actualTitle != expectedTitle){
					testStatus.recordFail("Page title '" + actualTitle + "' does not match expected value of '" + expectedTitle + "'");
					return;
				}
			});
		});
	};

	this.verify = function(booleanSelectorName){
		testStatus.runStep('verify("' + booleanSelectorName + '")', function(){
			if(browser.currentPage[booleanSelectorName] == undefined){
				testStatus.recordFail("Could not find an element named '" + booleanSelectorName + "' on page '" + browser.currentPage.name + "'");
				return;
			}

			if(browser.currentPage[booleanSelectorName].type != 'isVisible'){
				testStatus.recordFail("Element '" + booleanSelectorName + "' on page '" + browser.currentPage.name + "' is not listed as an 'isVisible' type");
				return;
			}

			return browser.currentPage[booleanSelectorName].isElementPresent(driver).thenCatch(function(e){
				testStatus.recordFail('WebDriver error while verify("' + booleanSelectorName + '"): ' + e.message);
				return;
			});
		});
	};
	
	this.verifyElementIsVisible = function(selectorName){
		testStatus.runStep('verifyElementIsVisible("' + selectorName + '")', function(){
			if(browser.currentPage[selectorName] == undefined){
				testStatus.recordFail("Could not find an element named '" + selectorName + "' on page '" + browser.currentPage.name + "'");
				return;
			}

			return browser.currentPage[selectorName].isElementPresent(driver).thenCatch(function(e){
				testStatus.recordFail('WebDriver error while verifyElementIsVisible("' + selectorName + '"): ' + e.message);
				return;
			});
		});
	};

	this.waitFor = function(selectorName, maximumWaitTime){
		testStatus.runStep('waitFor("' + selectorName + '",' + maximumWaitTime + ')', function(){
			if(browser.currentPage[selectorName] == undefined){
				testStatus.recordFail("Could not find an element named '" + selectorName + "' defined on page '" + browser.currentPage.name + "'");
				return;
			}

			return driver.wait(function(){ console.log('t'); return browser.currentPage[selectorName].isElementPresent(driver); }, maximumWaitTime, "Could not find '" + selectorName + "'");
		});
	};

	this.waitForPageToLoad = function(pageName, maximumWaitTime){
		testStatus.runStep('waitForPageToLoad("' + pageName + '",' + maximumWaitTime + ')', function(){
			if(pages[pageName] == null){
				testStatus.recordFail("Page '" + pageName + "' was not located in the registered list of pages");
				return;
			}

			if(pages[pageName].matcher == undefined){
				testStatus.recordFail("Page '" + pageName + "' does not have a 'matcher' defined");
				return;
			}

			var matcher = pages[pageName].matcher;

			return promise.fulfilled().then(function(){
				if(matcher.type == 'url'){
					return driver.wait(driver.getCurrentUrl() == pages[page.name].url, maximumWaitTime, "URL is not '" + pages[page.name].url + "'");
				}
				else if(matcher.type == 'title'){
					return driver.wait(until.titleIs(matcher.match), maximumWaitTime, "Title is not '" + matcher.match + "'");
				}
				else if(matcher.type == 'element'){
					return driver.wait(until.elementLocated(matcher.match), maximumWaitTime, "Could not find '" + matcher.match + "'");
				}
				else{
					testStatus.recordFail("Page '" + pageName + "' has an unrecognized 'matcher' of type '" + matcher.type + "'");
					return;
				}
			})
			.then(function(){
				browser.currentPage = pages[pageName];
			});
		});
	};

	this.clickOn = function(elementSelector){
		testStatus.runStep('clickOn("' + elementSelector + '")', function(){
			if(browser.currentPage[elementSelector] == undefined){
				testStatus.recordFail("Could not find an element for '" + elementSelector + "' on page '" + browser.currentPage.name + "'");
				return;
			}

			return browser.currentPage[elementSelector].findElement(driver).click().thenCatch(function(e){
				testStatus.recordFail('WebDriver error while clickOn("' + elementSelector + '"): ' + e.message);
				return;
			});
		});
	};

	this.type = function(elementSelector, text){
		testStatus.runStep('type("' + elementSelector + '","' + text + '")', function(){
			if(browser.currentPage[elementSelector] == undefined){
				testStatus.recordFail("Could not find an element for '" + elementSelector + "' on page '" + browser.currentPage.name + "'");
				return;
			}

			return browser.currentPage[elementSelector].findElement(driver).sendKeys(text).thenCatch(function(e){
				testStatus.recordFail('WebDriver error while type("' + elementSelector + '","' + text + '"): ' + e.message);
				return;
			});
		});
	};

}

module.exports = User;