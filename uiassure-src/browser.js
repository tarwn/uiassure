function Browser(driver, pages, testStatus){
	var self = this;

	self.currentPage = null;

	self.openPage = function(pageName){
		testStatus.runStep('openPage("' + pageName + '")', function(){
			if(pages[pageName] == null){
				testStatus.recordFail("Page '" + pageName + "' was not located in the registered list of pages");
				return;
			}

			if(pages[pageName].url == undefined){
				testStatus.recordFail("Page '" + pageName + "' does not have a URL defined");
				return;
			}

			return driver.get(pages[pageName].url)
				.then(function(){
					self.currentPage = pages[pageName];
				});
		});
	};


}

module.exports = Browser;
