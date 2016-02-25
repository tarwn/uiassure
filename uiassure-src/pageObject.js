var By = require('selenium-webdriver').By;

function PageObject(config){
	var self = this;

	function generateAccessor(propertyDefinition){
		var bySelector = propertyDefinition.selector;
		if(typeof propertyDefinition.selector == "string"){
			bySelector = By.css(propertyDefinition.selector);
		}

		switch(propertyDefinition.type){
			case 'text':
			case 'password':
			case 'link':
			case 'button':
				return {
					type: propertyDefinition.type,
					findElement: function(driver){ return driver.findElement(bySelector); },
					isElementPresent: function(driver){ return driver.isElementPresent(bySelector); }
				};
				break;
			case 'isVisible':
				return {
					type: propertyDefinition.type,
					isElementPresent: function(driver){ return driver.isElementPresent(bySelector); }
				};
			case 'label':
				return {
					type: propertyDefinition.type,
					isElementPresent: function(driver){ return driver.isElementPresent(bySelector); }
				};
			default:
				return function(){};
		}
	}

	Object.keys(config).forEach(function(key){
	
		if(key == "url"){
			self.url = config.url;
		}
		else if(key == "pageIdentifier"){
			self.pageIdentifier = config.pageIdentifier;
		}
		else{
			self[key] = generateAccessor(config[key]);
		}

	});
}

module.exports = PageObject;
