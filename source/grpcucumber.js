/*
SPDX-Copyright: Copyright (c) Capital One Services, LLC 
SPDX-License-Identifier: Apache-2.0 
Copyright [2018] Capital One Services, LLC 

Licensed under the Apache License, Version 2.0 (the "License"); 
you may not use this file except in compliance with the License. 
You may obtain a copy of the License at 

  http://www.apache.org/licenses/LICENSE-2.0 

Unless required by applicable law or agreed to in writing, software 
distributed under the License is distributed on an "AS IS" BASIS, 
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
implied. See the License for the specific language governing 
permissions and limitations under the License.
*/
/* eslint no-invalid-this: "off", no-trailing-spaces: "off" */
'use strict';

let grpcucumber = (function() {
    // Types
    const Variables = require('./variables').Variables;
    // modules
    const _fs = require('fs');
    const _grpcLibrary = require('@grpc/grpc-js');
    const _grpcProtoLoader = require('@grpc/proto-loader');
    const _interpolate = require('interpolate');
    const _jsonPath = require('JSONPath');
    const _mergeOptions = require('merge-options');
    const _path = require('path');
    const _prettyJson = require('prettyjson');

    const _globalVariables = new Variables();

    const evaluatePath = function(path, content) {
        const evalResult = _jsonPath({resultType: 'all'}, path, content);
        return (evalResult.length > 0) ? evalResult[0].value : null;
    };

    class grpcucumber {
        constructor(options) {
            this.options = _mergeOptions(
                {
                    protoPath: '',
                    protoLoaderOptions: {},
                    serviceName: '',
                    grpcHost: '',
                    grpcCredentials: _grpcLibrary.credentials.createInsecure(),
                    fixturesDirectory: '',
                    variableDelimiter: '``',
                    grpcOptions: {},
                },
                options
            );

            // defaults
            this.client = this.createClient(
                this.options.protoPath,
                this.options.protoLoaderOptions,
                this.options.serviceName,
                this.options.grpcHost,
                this.options.grpcCredentials,
                this.options.grpcOptions
            );

            this.responseStatus = _grpcLibrary.status[_grpcLibrary.status.OK];
            this.responseMessage = {};
            this.requestMessage = {};
            this.responseError = {};
            this.requestMetadata = {};
            this.scenarioVariables = new Variables();
        }

        /**
         * Creates a grpc client
         */
        createClient(protoPath, protoLoaderOptions, serviceName, grpcHost, grpcCredentials, grpcOptions) {
            let packageDefinition = _grpcProtoLoader.loadSync(protoPath, protoLoaderOptions);
            let grpcPackage = _grpcLibrary.loadPackageDefinition(packageDefinition);

            let parts = serviceName.split('.');
            let Creator;
            try {
                Creator = parts.reduce((o, i)=>o[i], grpcPackage);
            } catch (e) {
                throw new Error('Unable to find gRPC client constructor in package, check service name (ensure it matches correctly). Error info: ' + e);
            }

            return new Creator(grpcHost, grpcCredentials, grpcOptions);
        }
        
        /**
         * Stores a value in the scenario scoped variables
         */
        storeValueInScenarioScope(variableName, value) {
            this.scenarioVariables.set(variableName, value);
        }
        
        /**
         * Stores a value in the global scoped variables
         */
        storeValueInGlobalScope(variableName, value) {
            _globalVariables.set(variableName, value);
        }

        /**
         * Stores a value in the global scoped variables
         */
        setGlobalVariable(variableName, value) {
            _globalVariables.set(variableName, value);
        }

        /**
         * Retrieves a value in the global scoped variables
         */
        getGlobalVariable(variableName) {
            return _globalVariables.get(variableName);
        }

        /**
         * Stores the value of a response message path in a scenario scoped variable
         */
        storeValueOfResponseMessagePathInScenarioScope(path, variableName) {
            path = this.replaceVariables(path); // only replace path. replacing variable name wouldn't make sense
            const value = this.getResponseMessagePathValue(path);
            this.scenarioVariables.set(variableName, value);
        }
        
        /**
         * Stores the value of a response message path in a global scoped variable
         */
        storeValueOfResponseMessagePathInGlobalScope(path, variableName) {
            path = this.replaceVariables(path); // only replace path. replacing variable name wouldn't make sense
            const value = this.getResponseMessagePathValue(path);
            _globalVariables.set(variableName, value);
        }
        
        /**
         * Replaces variable identifiers in the resource string
         * with their value in all scopes if it exists
         */
        replaceVariables(resource) {
            resource = _interpolate(resource, _globalVariables.getAll(), {delimiter: this.options.variableDelimiter});
            resource = _interpolate(resource, this.scenarioVariables.getAll(), {delimiter: this.options.variableDelimiter});
            return resource;
        }
        
        /**
         * Calls a gRPC function
         */
        request(rpcName, callback) { // callback(error, message)
            if (typeof this.client[rpcName] === 'function') {
                this.client[rpcName](
                    this.requestMessage, 
                    this.requestMetadata, 
                    function(error, responseMessage) {
                        if (error) {
                            this.responseStatus = _grpcLibrary.status[error.code];
                            this.responseError = error;
                            callback(error);
                        } else {
                            this.responseMessage = responseMessage;
                            callback(null, responseMessage);
                        }
                    }.bind(this)
                );
            } else {
                callback(rpcName + ' is not a valid resource.');
            }
        }
        
        /**
         * Sets the request message from a JSON string
         */
        setRequestMessageFromString(content) {
            content = this.replaceVariables(content);
            this.requestMessage = JSON.parse(content);
        }

        /**
         * Sets the request message from a hash value table
         */
        setRequestMessageFromTable(valuesTable) {
            let body = {};

            valuesTable.hashes().forEach(function(v) {
                const name = this.replaceVariables(v.name);
                const value = this.replaceVariables(v.value);
                body[name] = value;
            }.bind(this));

            this.requestMessage = body;
        }

        /**
         * Sets the request message to a file's contents
         */
        setRequestMessageFromFile(file, callback) {
            file = this.replaceVariables(file);
            _fs.readFile(
                _path.join(this.options.fixturesDirectory, file), 
                'utf8', 
                function(err, data) {
                    if (err) {
                        callback(err);
                    } else {
                        this.setRequestMessageFromString(data);
                        callback();
                    }
                }.bind(this)
            );
        }
        
        /**
         * Sets the metadata from a JSON string
         */
        setRequestMetadataFromString(content) {
            content = this.replaceVariables(content);
            let jsonMetadata = JSON.parse(content);
            let metadata = new _grpcLibrary.Metadata();
            
            Object.keys(jsonMetadata).forEach(function(key) {
                metadata.add(key, jsonMetadata[key]);
            });

            this.requestMetadata = metadata;
        }

        /**
         * Sets the request metadata from a hash value table
         */
        setRequestMetadataFromTable(valuesTable) {
            let metadata = new _grpcLibrary.Metadata();
            
            valuesTable.hashes().forEach(function(v) {
                const name = this.replaceVariables(v.name);
                const value = this.replaceVariables(v.value);
                metadata.add(name, value);
            }.bind(this));

            this.requestMetadata = metadata;
        }

        /**
         * Sets the request metadata to a file's contents
         */
        setRequestMetadataFromFile(file, callback) {
            file = this.replaceVariables(file);
            _fs.readFile(
                _path.join(this.options.fixturesDirectory, file), 
                'utf8', 
                function(err, data) {
                    if (err) {
                        callback(err);
                    } else {
                        this.setRequestMetadataFromString(data);
                        callback();
                    }
                }.bind(this)
            );
        }
        
        /**
         * Gets the response message
         */
        getResponseMessage() {
            return this.responseMessage;
        }

        /**
         * Handles a callback with an assertion
         */
        callbackWithAssertion(callback, assertion) {
            if (assertion.expected === assertion.actual) {
                callback();
            } else {
                callback(
                    _prettyJson.render(
                        {assertion: assertion}, 
                        {noColor: true}
                    )
                );
            }
        }
        
        /**
         * Gets information about an assertion
         */
        getAssertionResult(expected, actual, expectedExpression, actualValue) {
            return {
                expected,
                actual,
                expectedExpression,
                actualValue,
            };
        }

        /** 
         * Asserts that a global variable exists 
         */ 
        assertGlobalVariableValueExists(name) { 
            return this.getAssertionResult(true, (_globalVariables.get(name) != undefined), 'defined', 'undefined');
        }
        
        /**
         * Asserts that a value matches the expression
         */
        assertMatch(actualValue, expectedExpression) {
            let regExpObject = new RegExp(expectedExpression);
            let match = regExpObject.test(actualValue);
            return this.getAssertionResult(true, match, expectedExpression, actualValue);
        }
        
        /**
         * Asserts that a value does not match the expression
         */
        assertNotMatch(actualValue, expectedExpression) {
            let regExpObject = new RegExp(expectedExpression);
            let match = regExpObject.test(actualValue);
            return this.getAssertionResult(false, match, expectedExpression, actualValue);
        }
        
        /** 
         * Asserts that the reponse status matches
         */ 
        assertResponseStatusMatch(value) {
            let expected = true;
            let actual = (_grpcLibrary.status[value] == _grpcLibrary.status[this.responseStatus]);
            let expectedValue = value;
            let actualValue = this.responseStatus;
            return this.getAssertionResult(expected, actual, expectedValue, actualValue);
        }

        /**
         * Gets a response message path's value
         */
        getResponseMessagePathValue(path) {
            return evaluatePath(path, this.getResponseMessage());
        }
        
        /**
         * Asserts that a path in the response message matches
         */
        assertPathInResponseMessageMatchesExpression(path, regexp) {
            path = this.replaceVariables(path);
            regexp = this.replaceVariables(regexp);
            let evalValue = this.getResponseMessagePathValue(path);
            
            return this.assertMatch(evalValue, regexp);
        }
        
        /**
         * Asserts that a path in the response message does not match
         */
        assertPathInResponseMessageDoesNotMatchExpression(path, regexp) {
            path = this.replaceVariables(path);
            regexp = this.replaceVariables(regexp);
            let evalValue = this.getResponseMessagePathValue(path);
            
            return this.assertNotMatch(evalValue, regexp);
        }
        
        /**
         * Asserts that a path in the response message is an array
         */
        assertPathIsArray(path) {
            path = this.replaceVariables(path);
            const value = evaluatePath(path, this.getResponseMessage());
            const success = Array.isArray(value);
            return this.getAssertionResult(true, success, 'array', typeof value);
        }
        
        /**
         * Asserts that a path in the response message is an array with specified length
         */
        assertPathIsArrayWithLength(path, length) {
            path = this.replaceVariables(path);
            length = this.replaceVariables(length);
            let success = false;
            let actual = '?';
            const value = evaluatePath(path, this.getResponseMessage());
            if (Array.isArray(value)) {
                success = value.length.toString() === length;
                actual = value.length;
            }
        
            return this.getAssertionResult(true, success, length, actual);
        }

        /**
         * Asserts that a scenario variable matches a value
         */
        assertScenarioVariableValueEqual(variableName, value) {
            let expectedValue = this.replaceVariables(value);
            let actualValue = String(this.scenarioVariables.get(variableName));
            return this.getAssertionResult(
                true,
                (expectedValue === actualValue),
                expectedValue,
                actualValue
            );
        }

        /**
         * Asserts that a scenario variable does not match a value
         */
        assertScenarioVariableValueNotEqual(variableName, value) {
            let expectedValue = this.replaceVariables(value);
            let actualValue = String(this.scenarioVariables.get(variableName));
            return this.getAssertionResult(
                false,
                (expectedValue === actualValue),
                expectedValue,
                actualValue
            );
        }

        /**
         * Asserts that a global variable matches a value
         */
        assertGlobalVariableValueEqual(variableName, value) {
            let expectedValue = this.replaceVariables(value);
            let actualValue = String(_globalVariables.get(variableName));
            return this.getAssertionResult(
                true,
                (expectedValue === actualValue),
                expectedValue,
                actualValue
            );
        }

        /**
         * Asserts that a global variable does not match a value
         */
        assertGlobalVariableValueNotEqual(variableName, value) {
            let expectedValue = this.replaceVariables(value);
            let actualValue = String(_globalVariables.get(variableName));
            return this.getAssertionResult(
                false,
                (expectedValue === actualValue),
                expectedValue,
                actualValue
            );
        }
    }

    return grpcucumber;
})();

exports.grpcucumber = grpcucumber;
