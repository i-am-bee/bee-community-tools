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
import { ImageDescriptionTool } from "../../imageDescription.js";

import { beforeEach, expect } from "vitest";

describe("ImageDescriptionTool e2e Test", () => {
  let instance: ImageDescriptionTool;

  beforeEach(() => {
    instance = new ImageDescriptionTool();
  });

  it("Runs", async () => {
    const response = await instance.run(
      {
        imageUrl: "https://en.wikipedia.org/static/images/icons/wikipedia.png",
        prompt: "Describe the image",
      },
      {
        signal: AbortSignal.timeout(60 * 1000),
      },
    );

    expect(response.isEmpty()).toBe(false);
    expect(response).toMatchObject({
      result: expect.stringContaining("Description"),
    });
  });

  it("Throws", async () => {
    await expect(
      instance.run({
        imageUrl: "https://en.wikipedia.org/static/images/icons/wikipedia.err",
        prompt: "Describe the image",
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `ToolError: Request to Vllm API has failed! Bad Request
    Error: {"object":"error","message":"404, message='Not Found', url=URL('https://en.wikipedia.org/static/images/icons/wikipedia.err')","type":"BadRequestError","param":null,"code":400}`,
    );
  });
});
