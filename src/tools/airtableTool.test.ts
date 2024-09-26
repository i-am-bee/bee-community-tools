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

import { describe, test } from "vitest";
import { AirtableTool, AirtableToolOptions } from "@/tools/airtable.js";

import { setupServer } from "msw/node";

import { http, HttpResponse } from "msw";

import exampleData from "./airtableDataExample.json";

const testToolOpts: AirtableToolOptions = { apiToken: "test_api_token", baseId: "test_base_id" };

const handlers = [
  http.get(`https://api.airtable.com/v0/meta/bases/${testToolOpts.baseId}/tables`, () => {
    return HttpResponse.json(exampleData.schema);
  }),

  http.get(
    `https://api.airtable.com/v0/${testToolOpts.baseId}/${exampleData.schema.tables[0].id}`,
    () => {
      return HttpResponse.json(exampleData.tableget);
    },
  ),
];

const server = setupServer(...handlers);

describe("airtable tool", () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  test("the tool builds a description and schema based on the airtable schema", async () => {
    const airtableTool = new AirtableTool(testToolOpts);

    const toolSchema = await airtableTool.run({ action: "GET_SCHEMA" });
    // The tool description should contain the description of one of our tables.
    expect(toolSchema.result[0].description).toContain(exampleData.schema.tables[0].description);
  });

  test("the tool makes the correct airtable query when instructed", async () => {
    const airtableTool = new AirtableTool(testToolOpts);

    const airtable_response = await airtableTool.run({
      action: "QUERY_TABLE",
      table: exampleData.schema.tables[0].id,
      filterFormula: "",
    });

    expect(airtable_response.result[0].fields["ModelURL"]).equals(
      exampleData.tableget.records[0].fields.ModelURL,
    );
  });
});
