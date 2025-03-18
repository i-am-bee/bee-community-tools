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

// eslint-disable-next-line no-restricted-imports
import { ImageDescriptionTool } from "../imageDescription.js";

import { afterAll, afterEach, beforeAll, expect, describe, test, vi } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const exampleDescription = "This is the image description text.";

const handlers = [
  http.post(`https://api.openai.com/v1/chat/completions`, () => {
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

describe("ImageDescriptionTool Unit Test", () => {
  beforeAll(() => {
    vi.stubEnv("IMAGE_DESC_VLLM_API", "https://api.openai.com");
    vi.stubEnv("IMAGE_DESC_MODEL_ID", "llava-hf/llama3-llava-next-8b-hf");
    vi.stubEnv("OPENAI_API_KEY", "abc123");
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    vi.unstubAllEnvs();
  });

  test("make a request to the vllm backend to describe an image", async () => {
    const imageDescriptionTool = new ImageDescriptionTool();
    const imageDescResp = await imageDescriptionTool.run({
      imageUrl: "http://image.com/image.jpg",
    });
    expect(imageDescResp.result).toContain(exampleDescription);
  });
});
