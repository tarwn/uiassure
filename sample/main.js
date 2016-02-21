var TestRunner = require("../uiassure-src/uiassure").TestRunner;
var By = require("../uiassure-src/uiassure").By;

var loginPage = {
	url: "http://lessthandot.com/login.php",
	matcher: {
		type: 'title',
		match: 'Less Than Dot - Launchpad - Less Than Dot - Login'
	},
	username: {
		type: 'text',
		selector: '#txtLogin'
	},
	password: {
		type: 'password',
		selector: '#txtPassword'
	},
	loginButton: {
		type: 'button',
		selector: 'input[name=btnSubmit]'
	}
};

var homePage = {
	url: "http://lessthandot.com",
	matcher: {
		type: 'url'
	},
};

var anyPage = {
	isLoggedIn: {
		type: 'isVisible',
		selector: By.xpath('//*[@id="snav"]/a[contains(text(),"logout")]')
	},
	isLoggedOut: {
		type: 'isVisible',
		selector: By.xpath('//*[@id="snav"]/a[.="Login"]')
	},
	loginWelcomeText: {
		type: 'label',
		selector: '#snav'
	},
	loginErrorMessage: {
		type: 'label',
		selector: 'form div.error'
	},
	loginLink: {
		type: 'link',
		selector: By.xpath('//*[@id="snav"]/a[.="Login"]')
	}
};

var testRunner = new TestRunner();

testRunner.addPage("login", [loginPage, anyPage]);
testRunner.addPage("home", [homePage, anyPage]);

testRunner.addTest("logging in without credentials results in an error message", function(browser, user, pages){
	browser.openPage("home");
	user.verifyPageTitleIs("Less Than Dot - Launchpad - Less Than Dot");
	user.verify("isLoggedOut");
	user.clickOn("loginLink");
	user.waitForPageToLoad("login", 3000);
	user.verifyElementIsVisible("loginButton");
	user.clickOn("loginButton");
	user.waitFor("loginErrorMessage", 3000);
	user.verifyElementIsVisible("loginErrorMessage");
	user.type("username","tarwn");
	user.type("password","blah");
});

testRunner.run().then(function(results){
	console.log(results);
});

