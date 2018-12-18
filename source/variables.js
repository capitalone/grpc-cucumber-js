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
'use strict';

let Variables = (function() {
    class Variables {
        constructor() {
            this._variables = {};
        }

        /**
         * Set a variable
         */
        set(name, value) {
            this._variables[name] = value;
        }

        /**
         * Get a variable
         */
        get(name) {
            return this._variables[name];
        }

        /**
         * Remove a variable
         */
        remove(name) {
            delete this._variables[name];
        }

        /**
         * Clear all variables
         */
        clear() {
            this._variables = {};
        }

        /**
         * Gets all variables
         */
        getAll() {
            return this._variables;
        }
    }

    return Variables;
})();

exports.Variables = Variables;
