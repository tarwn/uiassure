function ExitTestEarlyError() {
    this.name = "ExitTestEarlyError";
    this.message = "Exiting test early, typically due to an error or failure during a test step"
}
ExitTestEarlyError.prototype = new Error();

module.exports = ExitTestEarlyError;