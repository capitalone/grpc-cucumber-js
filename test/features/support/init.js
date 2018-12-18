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
/* eslint new-cap: "off", no-invalid-this: "off" */

'use strict';

const grpcucumber = require('../../../source/grpcucumber.js');
const {Before} = require('cucumber');

const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../mock_target', 'helloworld.proto');

let defaultHost = 'localhost:8443';
let envHost = process.env.GRPC_HOST;
let host = envHost ? envHost : defaultHost;

Before(function() {
    this.grpcucumber = new grpcucumber.grpcucumber({
        protoPath: PROTO_PATH,
        serviceName: 'helloworld.Greeter',
        grpcHost: host,
        fixturesDirectory: path.join(__dirname, '../', 'fixtures'),
    });
});
