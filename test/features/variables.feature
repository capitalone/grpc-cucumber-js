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
@variables
Feature: 
    As a greeter I want to say hello with a names stored as variables

    Scenario: I successfully say hello to Foo in english
        Given I store the raw value Foo as scenarioName in scenario scope
        And I set request message to { "name": "`scenarioName`", "language": "english" }
        When I request SayHello
        Then response status should be OK
        And response message path $.greeting should be Hello Foo
        And I store the value of response message path $.greeting as scenarioGreeting in scenario scope
        And value of scenario variable scenarioGreeting should be Hello Foo
        And value of scenario variable scenarioGreeting should not be Hello Bar

    Scenario: I successfully say hello to Foo in english
        Given I store the raw value Foo as globalName in global scope
        And I set request message to
            | name | value |
            | name | `globalName` |
            | language | english |
        When I request SayHello
        Then response status should be OK
        And response message path $.greeting should be Hello Foo
        And I store the value of response message path $.greeting as globalGreeting in global scope

    Scenario: I successfully stored a prior hello in global scope
        Given I have globalGreeting stored in global scope
        Then value of global variable globalGreeting should be Hello Foo
        And value of global variable globalGreeting should not be Hello Bar