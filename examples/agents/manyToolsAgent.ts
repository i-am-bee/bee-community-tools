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

import "dotenv/config.js";
import { BAMChatLLM } from "bee-agent-framework/adapters/bam/chat";
import { BeeAgent } from "bee-agent-framework/agents/bee/agent";
import { createConsoleReader } from "../helpers/io.js";
import { FrameworkError } from "bee-agent-framework/errors";
import { TokenMemory } from "bee-agent-framework/memory/tokenMemory";
import { Logger } from "bee-agent-framework/logger/logger";
import { OllamaChatLLM } from "bee-agent-framework/adapters/ollama/chat";
import { OpenAIChatLLM } from "bee-agent-framework/adapters/openai/chat";
import { PromptTemplate } from "bee-agent-framework/template";
import { WatsonXChatLLM } from "bee-agent-framework/adapters/watsonx/chat";
import { z } from "zod";
import {
  BeeSystemPrompt,
  BeeToolErrorPrompt,
  BeeToolInputErrorPrompt,
  BeeToolNoResultsPrompt,
} from "bee-agent-framework/agents/bee/prompts";

// core tools
import { DuckDuckGoSearchTool } from "bee-agent-framework/tools/search/duckDuckGoSearch";
import { WikipediaTool } from "bee-agent-framework/tools/search/wikipedia";
// import { OpenMeteoTool } from "bee-agent-framework/tools/weather/openMeteo";
// import { ArXivTool } from "bee-agent-framework/tools/arxiv";

// contrib tools
// import { HelloWorldTool } from "@/tools/helloWorld.js";
import { OpenLibraryTool } from "bee-community-tools/tools/openLibrary";
import { ImageDescriptionTool } from "bee-community-tools/tools/imageDescription";

Logger.root.level = "silent"; // disable internal logs
const logger = new Logger({ name: "app", level: "trace" });

async function runBeeAgent() {
  // use BAM if GENAI_API_KEY env var is defined
  // else use Watsonx if WATSONX_API_KEY and WATSONX_PROJECT_ID env vars are defined
  // else use OpenAI if OPENAI_API_KEY env var is defined
  // else use Ollama
  const llm =
    process.env.GENAI_API_KEY !== undefined
      ? BAMChatLLM.fromPreset("meta-llama/llama-3-1-70b-instruct")
      : process.env.WATSONX_API_KEY !== undefined && process.env.WATSONX_PROJECT_ID !== undefined
        ? WatsonXChatLLM.fromPreset("meta-llama/llama-3-1-70b-instruct", {
            apiKey: process.env.WATSONX_API_KEY, //pragma: allowlist secret
            projectId: process.env.WATSONX_PROJECT_ID,
            parameters: {
              decoding_method: "greedy",
              min_new_tokens: 5,
              max_new_tokens: 50,
            },
          })
        : process.env.OPENAI_API_KEY !== undefined
          ? new OpenAIChatLLM()
          : new OllamaChatLLM({ modelId: "llama3.1" });

  const agent = new BeeAgent({
    llm,
    memory: new TokenMemory({ llm }),
    tools: [
      new DuckDuckGoSearchTool(),
      new WikipediaTool(),
      // new OpenMeteoTool(),
      // new ArXivTool(),
      // new HelloWorldTool(),
      new OpenLibraryTool(),
      new ImageDescriptionTool(),
    ],
    templates: {
      user: new PromptTemplate({
        schema: z
          .object({
            input: z.string(),
          })
          .passthrough(),
        template: `User: {{input}}`,
      }),
      system: BeeSystemPrompt.fork((old) => ({
        ...old,
        defaults: {
          instructions: "You are a helpful assistant that uses tools to answer questions.",
        },
      })),
      toolError: BeeToolErrorPrompt,
      toolInputError: BeeToolInputErrorPrompt,
      toolNoResultError: BeeToolNoResultsPrompt.fork((old) => ({
        ...old,
        template: `${old.template}\nPlease reformat your input.`,
      })),
      toolNotFoundError: new PromptTemplate({
        schema: z
          .object({
            tools: z.array(z.object({ name: z.string() }).passthrough()),
          })
          .passthrough(),
        template: `Tool does not exist!
  {{#tools.length}}
  Use one of the following tools: {{#trim}}{{#tools}}{{name}},{{/tools}}{{/trim}}
  {{/tools.length}}`,
      }),
    },
  });

  const reader = createConsoleReader();

  try {
    for await (const { prompt } of reader) {
      const response = await agent
        .run(
          { prompt },
          {
            execution: {
              maxRetriesPerStep: 3,
              totalMaxRetries: 10,
              maxIterations: 20,
            },
            signal: AbortSignal.timeout(2 * 60 * 1000),
          },
        )
        .observe((emitter) => {
          emitter.on("start", () => {
            reader.write(`Agent 🤖 : `, "Starting new iteration");
          });
          emitter.on("error", ({ error }) => {
            reader.write(`Agent 🤖 : `, FrameworkError.ensure(error).dump());
          });
          emitter.on("retry", () => {
            reader.write(`Agent 🤖 : `, "retrying the action...");
          });
          emitter.on("update", async ({ update }) => {
            // log 'data' to see the whole state
            // to log only valid runs (no errors), check if meta.success === true
            reader.write(`Agent (${update.key}) 🤖 : `, update.value);
          });
        });

      reader.write(`Agent 🤖 : `, response.result.text);
    }
  } catch (error) {
    logger.error(FrameworkError.ensure(error).dump());
  } finally {
    process.exit(0);
  }
}

void runBeeAgent();
