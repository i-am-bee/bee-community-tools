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

import { describe, test, expect } from "vitest";

import { ImageDescriptionTool } from "@/tools/imageDescription.ts";

import { setupServer } from "msw/node";

import { http, HttpResponse } from "msw";

const exampleDescription = "This is the image description text.";
const vllm_api_endpoint: string = process.env.IMAGE_DESC_VLLM_API as string;

const handlers = [
  http.post(vllm_api_endpoint + "/v1/chat/completions", (_data: any) => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: exampleDescription,
          },
        },
      ],
    });
  }),
];

const server = setupServer(...handlers);

describe("ImageDescriptionTool", () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  test("make a request to the vllm backend to describe an image", async () => {
    const imageDescriptionTool = new ImageDescriptionTool();
    const imageDescResp = await imageDescriptionTool.run({
      imageUrl: "http://image.com/image.jpg",
    });
    expect(imageDescResp.result).toContain(exampleDescription);
  });
});
