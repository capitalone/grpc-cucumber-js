# SPDX-Copyright: Copyright (c) Capital One Services, LLC 
# SPDX-License-Identifier: Apache-2.0 
# Copyright [2018] Capital One Services, LLC 

# Licensed under the Apache License, Version 2.0 (the "License"); 
# you may not use this file except in compliance with the License. 
# You may obtain a copy of the License at 

#   http://www.apache.org/licenses/LICENSE-2.0 

# Unless required by applicable law or agreed to in writing, software 
# distributed under the License is distributed on an "AS IS" BASIS, 
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
# implied. See the License for the specific language governing 
# permissions and limitations under the License.
@core
@greet
Feature: 
    As a greeter I want to say hello with a name

    Scenario: I successfully say hello to Me in english with JSON string
        Given I set request message to { "name": "Me", "language": "english" }
        When I request SayHello
        Then response status should be OK
        And response message path $.greeting should be Hello Me
        And response message path $.greeting should not be Hello You

    Scenario: I successfully say hello to Me in english with table
        Given I set request message to 
            | name     | value   |
            | name     | Me      |
            | language | english |
        When I request SayHello
        Then response status should be OK
        And response message path $.greeting should be Hello Me

    Scenario: I successfully say hello to Me in english and german
        Given I set request message to { "name": "Me", "languages": ["english", "german"] }
        When I request SayHelloInMultipleLanguages
        Then response status should be OK
        And response message path $.greetings should be of type array
        And response message path $.greetings should be of type array with length 2

    Scenario: I successfully say hello to Me in english using a file
        Given I pipe contents of file hellome.json to request message
        When I request SayHello
        Then response status should be OK
        And response message path $.greeting should be Hello Me