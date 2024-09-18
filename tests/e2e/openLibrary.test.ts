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

import { OpenLibraryTool } from "@/tools/openLibrary.js";

import { beforeEach, expect } from "vitest";

describe("Open Library", () => {
  let instance: OpenLibraryTool;

  beforeEach(() => {
    instance = new OpenLibraryTool();
  });

  it("Runs", async () => {
    const response = await instance.run(
      {
        author: "Alan Turing",
      },
      {
        signal: AbortSignal.timeout(60 * 1000),
      },
    );

    expect(response.isEmpty()).toBe(false);
    expect(response.result.length).toBeGreaterThanOrEqual(20);
    response.result.forEach((book) => {
      expect(book).toMatchObject({
        title: expect.any(String),
        author_name: expect.any(Array),
        contributor: expect.any(Array),
        first_publish_year: expect.any(Number),
        publish_date: expect.any(Array),
        language: expect.any(Array),
        publish_place: expect.any(Array),
        place: expect.any(Array),
        publisher: expect.any(Array),
        isbn: expect.any(Array),
      });
    });
  });
});
