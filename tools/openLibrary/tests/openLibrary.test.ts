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
// eslint-disable-next-line no-restricted-imports
import { OpenLibraryTool } from "../openLibrary.js";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { ToolError } from "bee-agent-framework/tools/base";

const exampleResponse = {
  numFound: 1,
  start: 0,
  numFoundExact: true,
  docs: [
    {
      title: "Bee Framework",
      first_publish_year: 2024,
      publish_date: [2024],
      author_name: [],
      contributor: [],
      isbn: [],
      language: [],
      place: [],
      publish_place: [],
      publisher: [],
    },
  ],
  num_found: 1,
  q: "",
  offset: null,
};

const server = setupServer(
  http.get("https://openlibrary.org/search.json", async ({ request }) => {
    const url = new URL(request.url);
    const title = url.searchParams.get("title");
    if (title === "Bee Framework") {
      return HttpResponse.json(exampleResponse);
    } else if (title === "Invalid") {
      return HttpResponse.text("invalid json");
    } else if (title === "Error") {
      return new HttpResponse(null, { status: 404 });
    }
  }),
);

describe("OpenLibraryTool Unit Test", () => {
  const openLibraryTool = new OpenLibraryTool();

  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  test("Book successfully found by title", async () => {
    const openLibraryResponse = await openLibraryTool.run({
      title: "Bee Framework",
    });
    expect(openLibraryResponse.result).toEqual(exampleResponse.docs);
  });

  test("Invalid json response", async () => {
    try {
      await openLibraryTool.run({
        title: "Invalid",
      });
    } catch (e) {
      expect(e).toBeInstanceOf(ToolError);
      expect(e.message).toEqual("Request to Open Library has failed to parse!");
      expect(e.errors.length).toEqual(1);
    }
  });

  test("Book not found by title", async () => {
    try {
      await openLibraryTool.run({
        title: "Error",
      });
    } catch (e) {
      expect(e).toBeInstanceOf(ToolError);
      expect(e.message).toEqual("Request to Open Library API has failed!");
      expect(e.errors.length).toEqual(1);
    }
  });
});
