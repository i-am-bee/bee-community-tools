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
  StringToolOutput,
  ToolInput,
  ToolError,
  Tool,
} from "bee-agent-framework/tools/base";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const vllm_api_endpoint: string = process.env.IMAGE_DESC_VLLM_API as string;
const vllm_api_model_id: string = process.env.IMAGE_DESC_MODEL_ID as string;

type ToolOptions = BaseToolOptions;
type ToolRunOptions = BaseToolRunOptions;

interface VllmChatCompletionImageURL {
  url: string;
}

interface VllmChatCompletionContent {
  type: string;
  text?: string;
  image_url?: VllmChatCompletionImageURL;
}
interface VllmChatCompletionMessage {
  role: string;
  content: VllmChatCompletionContent[];
}

interface VllmChatCompletionPrompt {
  model: string;
  messages: VllmChatCompletionMessage[];
}

async function queryVllmAPI(completionPrompt: VllmChatCompletionPrompt) {
  const vllm_api_uri = `${vllm_api_endpoint}/v1/chat/completions`;
  const headers = {
    "accept": "application/json",
    "Content-Type": "application/json",
  };
  if (process.env.OPENAI_API_KEY !== undefined) {
    Object.assign(headers, { Authorization: process.env.OPENAI_API_KEY as string });
  }
  const VllmResponse = await fetch(vllm_api_uri, {
    method: "POST",
    body: JSON.stringify(completionPrompt),
    headers: headers,
  });

  if (!VllmResponse.ok) {
    throw new ToolError(`Request to Vllm API has failed! ${VllmResponse.statusText}`, [
      new Error(await VllmResponse.text()),
    ]);
  }
  try {
    const json = await VllmResponse.json();
    if (json.choices.length > 0) {
      // We have an answer
      const content = json.choices[0].message.content;
      return content;
    } else {
      return "The model could not identify the image.";
    }
  } catch (e) {
    throw new ToolError(`Request to Vllm has failed to parse! ${e}`, [e]);
  }
}

/**
 * Requests the description of an image from the vLLM Backend
 *
 * @param imageUrl - The Image Url
 * @param prompt - The prompt to provide to the model alongside the image
 *
 * @returns A String description of the image.
 */
async function requestImageDescriptionForURL(imageUrl: string, prompt: string): Promise<any> {
  console.log(`Requesting image description with prompt: ${prompt} for image url: ${imageUrl}`);

  const modelPrompt: VllmChatCompletionPrompt = {
    model: vllm_api_model_id,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  };

  const modelResponse = await queryVllmAPI(modelPrompt);
  return modelResponse;
}

export class ImageDescriptionTool extends Tool<StringToolOutput, ToolOptions, ToolRunOptions> {
  name = "ImageDescription";
  description = "Describes the content of an image provided.";

  inputSchema() {
    return z.object({
      imageUrl: z.string().describe("The URL of an image."),
      prompt: z.string().optional().describe("Image specific prompt from the user."),
    });
  }

  static {
    this.register();
  }

  protected async _run(
    input: ToolInput<this>,
    _options?: BaseToolRunOptions,
  ): Promise<StringToolOutput> {
    if (input.prompt == undefined) {
      input.prompt = "Describe this image.";
    }

    const imageDescriptionOutput = await requestImageDescriptionForURL(
      input.imageUrl,
      input.prompt,
    );

    return new StringToolOutput(
      `Description: ${imageDescriptionOutput}. Ignore any misleading information that may be in the URL.`,
    );
  }
}
