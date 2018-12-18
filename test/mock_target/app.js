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
/* eslint no-console: "off" */
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const interpolate = require('interpolate');

const languages = {
    'english': 'Hello {name}',
    'french': 'Bonjour {name}',
    'german': 'Guten tag {name}',
    'hindi': 'Namaste {name}',
    'italian': 'Ciao {name}',
    'japanese': 'Ohayo {name}',
    'mandarin': 'Ni Hau {name}',
    'spanish': 'Hola {name}',
    'swahili': 'Jambo {name}',
};

const PROTO_PATH = __dirname + '/helloworld.proto';

const helloProto = protoLoader.loadSync(PROTO_PATH, {})['helloworld.Greeter'];

const transform = function(message, instruction) {
    if (typeof instruction === 'string' && instruction.toLowerCase() == 'uppercase') {
        return message.toUpperCase();
    }

    if (typeof instruction === 'string' && instruction.toLowerCase() == 'lowercase') {
        return message.toLowerCase();
    }

    return message;
};

const greet = function(name, language, transformTo) {
    let greeting = languages[language];
    if (greeting === undefined) {
        greeting = 'O hai der {name}!';
    }
    let message = interpolate(greeting, {name: name});
    return transform(message, transformTo);
};

const sayHello = (call, callback) => {
    console.info('[sayHello REQUEST]:' + JSON.stringify(call.request) + ' | ' + JSON.stringify(call.metadata.get('transform')));
    let d = new Date();
    let seconds = Math.round(d.getTime() / 1000);
    let transformMeta = call.metadata.get('transform');
    let transformTo = transformMeta[0] || 'nothing';
    let reply = {greeting: greet(call.request.name, call.request.language, transformTo), timestamp: {seconds: seconds}};
    console.info('[sayHello REPLY](transform: ' + transformTo + '):' + JSON.stringify(reply));
    callback(null, reply);
};

const sayHelloInMultipleLanguages = (call, callback) => {
    console.info('[sayHelloMultipleLanguages REQUEST]: ' + JSON.stringify(call.request) + ' | ' + JSON.stringify(call.metadata.get('transform')));
    let d = new Date();
    let seconds = Math.round(d.getTime() / 1000);
    let reply = {greetings: [], timestamp: {seconds: seconds}};
    let transformMeta = call.metadata.get('transform');
    let transformTo = transformMeta[0] || 'nothing';
    call.request.languages.forEach(function(language) {
        let greeting = greet(call.request.name, language, transformTo);
        reply.greetings.push(greeting);
    });
    console.info('[sayHelloMultipleLanguages REPLY]:' + JSON.stringify(reply));
    callback(null, reply);
};

const saySomethingElse = (call, callback) => {
    console.info('[saySomethingElse REQUEST]:' + JSON.stringify(call.request) + ' | ' + JSON.stringify(call.metadata.get('transform')));
    let transformMeta = call.metadata.get('transform');
    let transformTo = transformMeta[0] || 'nothing';
    let reply = {somethingElse: 'something else'};
    console.info('[saySomethingElse REPLY](transform: ' + transformTo + '):' + JSON.stringify(reply));
    callback(null, reply);
};

const errorOut = (call, callback) => {
    console.info('[errorOut REQUEST]');
    return callback({
        message: 'invalid',
        code: grpc.status.INVALID_ARGUMENT,
    });
};

const server = new grpc.Server();

let credentials = grpc.ServerCredentials.createInsecure();
let methods = {
    sayHello: sayHello,
    sayHelloInMultipleLanguages: sayHelloInMultipleLanguages,
    saySomethingElse: saySomethingElse,
    errorOut: errorOut,
};

let port = process.env.SERVER_PORT || 8443;
server.addService(helloProto, methods);
let returnValue = server.bind(`0.0.0.0:${port}`, credentials);
if (returnValue == 0) {
    console.error('Failed to start GRPC server at port', port);
    process.exit(1);
}

server.start();
console.info('GRPC server started at port', port);
