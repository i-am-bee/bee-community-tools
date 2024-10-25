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
  Tool,
  ToolInput,
} from "bee-agent-framework/tools/base";
import { z } from "zod";

type ToolOptions = BaseToolOptions;
type ToolRunOptions = BaseToolRunOptions;

export class HelloWorldTool extends Tool<StringToolOutput, ToolOptions, ToolRunOptions> {
  name = "HelloWorld";
  description = "Says hello when asked for a special greeting.";

  inputSchema() {
    return z.object({
      identifier: z
        .string()
        .describe("The identifier (person, object, animal, etc.) used to when saying Hello"),
    });
  }

  static {
    this.register();
  }

  protected async _run(input: ToolInput<this>): Promise<StringToolOutput> {
    return new StringToolOutput(`Hello, ${input.identifier}`);
  }
}
