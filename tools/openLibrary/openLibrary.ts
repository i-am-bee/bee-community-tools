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

import {
  BaseToolOptions,
  BaseToolRunOptions,
  Tool,
  ToolInput,
  JSONToolOutput,
  ToolError,
} from "bee-agent-framework/tools/base";
import { z } from "zod";
import { createURLParams } from "bee-agent-framework/internals/fetcher";

type ToolOptions = BaseToolOptions;
type ToolRunOptions = BaseToolRunOptions;

export interface OpenLibraryAPIResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  num_found: number;
  q: string;
  offset: number;
  docs: {
    _version_: number;
    key: string;
    title: string;
    subtitle: string;
    alternative_title: string;
    alternative_subtitle: string;
    cover_i: number;
    ebook_access: string;
    ebook_count_i: number;
    edition_count: number;
    edition_key: string[];
    format: string[];
    publish_date: string[];
    lccn: string[];
    ia: string[];
    oclc: string[];
    public_scan_b: boolean;
    isbn: string[];
    contributor: string[];
    publish_place: string[];
    publisher: string[];
    seed: string[];
    first_sentence: string[];
    author_key: string[];
    author_name: string[];
    author_alternative_name: string[];
    subject: string[];
    person: string[];
    place: string[];
    time: string[];
    has_fulltext: boolean;
    title_suggest: string;
    title_sort: string;
    type: string;
    publish_year: number[];
    language: string[];
    last_modified_i: number;
    number_of_pages_median: number;
    place_facet: string[];
    publisher_facet: string[];
    author_facet: string[];
    first_publish_year: number;
    ratings_count_1: number;
    ratings_count_2: number;
    ratings_count_3: number;
    ratings_count_4: number;
    ratings_count_5: number;
    ratings_average: number;
    ratings_sortable: number;
    ratings_count: number;
    readinglog_count: number;
    want_to_read_count: number;
    currently_reading_count: number;
    already_read_count: number;
    subject_key: string[];
    person_key: string[];
    place_key: string[];
    subject_facet: string[];
    time_key: string[];
    lcc: string[];
    ddc: string[];
    lcc_sort: string;
    ddc_sort: string;
  }[];
}

interface OpenLibraryResponse {
  title: string;
  author_name: string[];
  contributor: string[];
  first_publish_year: number;
  publish_date: string[];
  language: string[];
  publish_place: string[];
  place: string[];
  publisher: string[];
  isbn: string[];
}

export interface OpenLibraryResponseList extends Array<OpenLibraryResponse> {}

export class OpenLibraryToolOutput extends JSONToolOutput<OpenLibraryResponseList> {}

export class OpenLibraryTool extends Tool<OpenLibraryToolOutput, ToolOptions, ToolRunOptions> {
  name = "OpenLibrary";
  description =
    "Provides access to a library of books with information about book titles, authors, contributors, publication dates, publisher and isbn.";

  inputSchema() {
    return z
      .object({
        title: z.string().describe("The title or name of the book."),
        author: z.string().describe("The author's name."),
        isbn: z.string().describe("The book's International Standard Book Number (ISBN)."),
        subject: z.string().describe("The subject or topic about which the book is written."),
        place: z.string().describe("The place about which the book is written."),
        person: z.string().describe("The person about which the book is written."),
        publisher: z.string().describe("The company or name of the book's publisher."),
      })
      .partial();
  }

  static {
    this.register();
  }

  protected async _run(input: ToolInput<this>, options?: ToolRunOptions) {
    const params = createURLParams(input);
    const url = `https://openlibrary.org/search.json?${decodeURIComponent(params.toString())}`;
    const response = await fetch(url, {
      signal: options?.signal,
    });
    if (!response.ok) {
      throw new ToolError("Request to Open Library API has failed!", [
        new Error(await response.text()),
      ]);
    }
    try {
      const responseJson: OpenLibraryAPIResponse = await response.json();
      const json: OpenLibraryResponseList = responseJson.docs.map((doc) => {
        return {
          title: doc.title || "Unknown",
          author_name: doc.author_name || [],
          contributor: doc.contributor || [],
          first_publish_year: doc.first_publish_year || 0,
          publish_date: doc.publish_date || [],
          language: doc.language || [],
          publish_place: doc.publish_place || [],
          place: doc.place || [],
          publisher: doc.publisher || [],
          isbn: doc.isbn || [],
        };
      });
      return new OpenLibraryToolOutput(json);
    } catch (e) {
      throw new ToolError("Request to Open Library has failed to parse!", [e]);
    }
  }
}
