var promise = require('selenium-webdriver').promise;
var ExitTestEarlyError = require('./exitTestEarlyError');

function TestStatus(test){
	var self = this;

	self.name = test.name;
	self.status = "initial";

	self.startTime = null;
	self.endTime = null;
	self.elapsedInSeconds = null;

	self.steps = [];
	self.finalScreenshot = null;

	self.recordStart = function(){
		self.startTime = new Date();
		self.status = "running";
	};

	function endTest(status, message){
		self.endTime = new Date();
		self.elapsedInSeconds = (self.endTime - self.startTime)/1000.0;
		self.status = status;
		self.message = message;
	}

	self.recordPass = function(message){
		endTest("pass", message);
	};

	self.recordError = function(message){
		endTest("error", message);
	};

	self.recordFail = function(message){
		endTest("fail", message);
	};

	self.isNotComplete = function(){
		return self.status == "running" || self.status == "initial";
	};

	self.getLastStep = function(){
		if(self.steps.length > 0){
			return self.steps[self.steps.length - 1];
		}
		else{
			return null;
		}
	};

	var latestPromise = promise.fulfilled();
	self.runStep = function(stepName, stepFunction){
		var step = { name: stepName };

		latestPromise = latestPromise.then(function(){
			if(self.isNotComplete()){
				self.steps.push(step);
			}
			else{
				throw new ExitTestEarlyError();
			}
		})
		.then(function(){
			console.log('[STEP] Start: ' + step.name);
			step.startTime = new Date();
		})
		.then(stepFunction)
		.then(function(){
			step.endTime = new Date();
			step.elapsed = (step.endTime - step.startTime) / 1000.0;
			console.log('[STEP] Done:  ' + step.name + ' ' + step.elapsed + 's');
		});
	};
}

module.exports = TestStatus;