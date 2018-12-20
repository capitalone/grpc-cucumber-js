# grpc testing framework for cucumber.js

Inspired by handy libraries for testing REST APIs like [apickli](https://github.com/apickli/apickli) or [relish](https://github.com/carbonrobot/relish), this package gives a basic start for cucumber testing against a [gRPC](https://grpc.io/) service.

## Basic Start

Install with your usual tool via `yarn add grpc-cucumber-js` or `npm install grpc-cucumber-js`.
Then you need to initialize the library to your gprc API in a Before cucumber event.  A good example of a basic set up can be found in [test/features/support/init.js](test/features/support/init.js).

## Built-in Gherkin Expressions
The following gherkin expressions are available within the framework [source/grpcucumber-steps.js](source/grpcucumber-steps.js):

```
GIVEN:
	I set request message to (.*)
	I set request message to
	    | name | value |
	    | | |
	I set request metadata to (.*)
	I set request metadata to
	    | name | value |
	    | | |
	I pipe contents of file (.*) to request message
	I store the raw value (.*) as (.*) in scenario scope
	I store the raw value (.*) as (.*) in global scope

WHEN:
	I request (.*)

THEN:
	I store the value of response message path (.*) as (.*) in global scope
	response message path (.*) should be (((?!of type).*))
	response message path (.*) should not be (((?!of type).+))
	response message path (.*) should be of type array
	response message path (.*) should be of type array with length (.*)
	value of scenario variable (.*) should be (.*)
	value of scenario variable (.*) should not be (.*)
	value of global variable (.*) should be (.*)
	value of global variable (.*) should not be (.*)
```

## Variable Interpolation

Variables are available to inject stored values into messages or steps.

By default, backticks are use to indicate a variable in a feature file, but can be changed during initialization (first char is open, second is close):

```
Before(function() {
    this.grpcucumber = new grpcucumber.grpcucumber(
		'localhost:8080', 
		PROTO_PATH, 
		'Greeter', 
		credentials, 
		{ variableDelimiter: '{}' }
	);
});
```


## Quick commands

| Function                   | Command          |
| :------------------------- | :--------------- |
| Clean up dist folder       | `yarn run clean` |
| Run mock server            | `yarn run mock`  |
| Run tests (run mock first) | `yarn run test`  |
| Run lint                   | `yarn run lint`  |

# Contributing to grpc-cucumber-js

We welcome Your interest in Capital One’s Open Source Projects (the “Project”). Any Contributor to the Project must accept and sign an Agreement indicating agreement to the license terms below. Except for the license granted in this Agreement to Capital One and to recipients of software distributed by Capital One, You reserve all right, title, and interest in and to Your Contributions; this Agreement does not impact Your rights to use Your own Contributions for any other purpose.

[Sign the Individual Agreement](https://docs.google.com/forms/d/19LpBBjykHPox18vrZvBbZUcK6gQTj7qv1O5hCduAZFU/viewform)

[Sign the Corporate Agreement](https://docs.google.com/forms/d/e/1FAIpQLSeAbobIPLCVZD_ccgtMWBDAcN68oqbAJBQyDTSAQ1AkYuCp_g/viewform?usp=send_form)

## Code of Conduct

This project adheres to the [Open Code of Conduct](https://developer.capitalone.com/single/code-of-conduct/). By participating, you are expected to honor this code.
