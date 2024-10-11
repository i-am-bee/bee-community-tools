/**
 * Copyright 2024 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AirtableTool } from "@/tools/airtable.js";
import { beforeEach, expect } from "vitest";

const AIRTABLE_TOKEN: string = process.env.AIRTABLE_TOKEN as string;
const AIRTABLE_BASE: string = process.env.AIRTABLE_BASE as string;

describe("AirtableTool", () => {
  let instance: AirtableTool;

  beforeEach(() => {
    instance = new AirtableTool({ apiToken: AIRTABLE_TOKEN, baseId: AIRTABLE_BASE });
  });

  it("Runs", async () => {
    const response = await instance.run({ action: "GET_SCHEMA" });
    expect(response.isEmpty()).toBe(false);
  });
});
