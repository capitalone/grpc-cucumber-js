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
@fail
Feature: 
    As a greeter I want to say hello with the wrong name to see assertion output

    Scenario: I fail to say hello to Me in english
        Given I set request message to { "name": "Me", "language": "english" }
        When I request SayHello
        Then response status should be OK
        And response message path $.greeting should be Hello You

    Scenario: I fail to say hello to Me in english
        Given I set request message to { "name": "Me", "language": "english" }
        When I request SayHello
        Then response status should be OK
        And response message path $.greeting should not be Hello 
        
    Scenario: I fail to have a global variable set
        Given I have notAVariable stored in global scope