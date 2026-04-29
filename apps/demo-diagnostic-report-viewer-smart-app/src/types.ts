/**
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

export interface Coding {
  system?: string;
  code?: string;
  display?: string;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Reference {
  reference?: string;
}

export interface Attachment {
  contentType?: string;
  language?: string;
  title?: string;
  url?: string;
}

export interface DiagnosticReport {
  resourceType: "DiagnosticReport";
  id?: string;
  status?: string;
  category?: Array<{ coding?: Coding[] }>;
  code?: CodeableConcept;
  subject?: Reference;
  effectiveDateTime?: string;
  issued?: string;
  result?: Reference[];
  presentedForm?: Attachment[];
  conclusion?: string;
}
