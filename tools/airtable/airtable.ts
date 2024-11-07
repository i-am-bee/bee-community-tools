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
  JSONToolOutput,
  ToolInput,
  Tool,
  ToolError,
} from "bee-agent-framework/tools/base";
import { z } from "zod";
import Airtable, { FieldSet, Records, SelectOptions } from "airtable";

type ToolRunOptions = BaseToolRunOptions;

export interface SummarisedAirtableFieldSchema {
  name: string;
  type?: string;
}

export interface SummarisedAirtableTableSchema {
  name: string;
  id: string;
  description?: string;
  fields: SummarisedAirtableFieldSchema[];
}

export interface AirtableToolOptions extends BaseToolOptions {
  apiToken: string;
  baseId: string;
}

/**
 * Airtable tool for the bee-agent-framework.
 *
 * This tool allows the agent to retrieve information from the tables within an airtbale base.
 * The agent core model will need to be able to construct Airtable Filter formulas in order to
 * filter the data in the requested table.
 * See: (https://support.airtable.com/docs/airtable-web-api-using-filterbyformula-or-sort-parameters)
 *
 * The data is retuned in JSON form to the agent as it would be from the API.
 */
export class AirtableTool extends Tool<JSONToolOutput<any>, AirtableToolOptions, ToolRunOptions> {
  public readonly airtable: Airtable;
  public readonly base: Airtable.Base;
  airtableApi = "https://api.airtable.com";

  name = "Airtable";
  description =
    "Can Query records from airtable tables in an airtable base. Use the action GET_SCHEMA to learn about the structure of the airtable base and QUERY_TABLE to request data from a table within the base.";

  inputSchema() {
    return z.object({
      action: z
        .enum(["GET_SCHEMA", "QUERY_TABLE"])
        .describe(
          "The action for the tool to take. GET_SCHEMA requests the airtable base table schema. QUERY_TABLE requests data from a selected table.",
        ),
      table: z
        .string()
        .optional()
        .describe("The table ID to query when using the QUERY_TABLE action."),
      fields: z
        .array(z.string())
        .optional()
        .describe("The fields to return from the table query when using the QUERY_TABLE action."),
      filterFormula: z
        .string()
        .optional()
        .describe(
          "The airtable filter formula to refine the query when using the QUERY_TABLE action.",
        ),
    });
  }

  static {
    this.register();
  }

  public constructor(public readonly options: AirtableToolOptions) {
    super(options);
    this.airtable = new Airtable({ endpointUrl: this.airtableApi, apiKey: options.apiToken }); // pragma: allowlist secret
    this.base = this.airtable.base(options.baseId);
  }

  protected async _run(input: ToolInput<this>, _options?: BaseToolRunOptions) {
    if (input.action === "GET_SCHEMA") {
      const response = await this.getBaseTableSchema(_options?.signal);
      return new JSONToolOutput(response);
    } else if (input.action === "QUERY_TABLE" && input.table != undefined) {
      const response = await this.getTableContents(input.table, input.fields, input.filterFormula);
      return new JSONToolOutput(response);
    } else {
      throw new ToolError("Invalid Action.");
    }
  }

  /**
   * Requests the Airtable Base Schema.
   *
   * The airtable module does not have this functionality, the tool requests directly
   * from the HTTP API.
   * @returns - SummarisedAirtableTableSchema
   */
  private async getBaseTableSchema(signal?: AbortSignal): Promise<SummarisedAirtableTableSchema[]> {
    const atResponse = await fetch(
      `${this.airtableApi}/v0/meta/bases/${this.options.baseId}/tables`,
      {
        headers: {
          Authorization: `Bearer ${this.options.apiToken}`,
        },
        signal: signal,
      },
    );

    if (atResponse.ok) {
      const schemadata = await atResponse.json();
      const tableSchema: SummarisedAirtableTableSchema[] = schemadata.tables.map(
        (table: { name: any; id: any; description: any; fields: any[] }) => ({
          name: table.name,
          id: table.id,
          description: table.description,
          fields: table.fields.map((field: SummarisedAirtableFieldSchema) => ({
            name: field.name,
            type: field.type,
          })),
        }),
      );

      return tableSchema;
    } else {
      throw new ToolError(`Error occured getting airtable base schema: ${atResponse.text()}`);
    }
  }

  /**
   * Function to request rows from an airtable table using a filter generated by the agent.
   *
   * Currently this returns ALL rows that the filterFormula matches because it is assumed
   * that the agent will need all data available and there is no easy way to allow the agent
   * to iterate through pages.
   *
   * @param tableId - The ID or name of the table
   * @param fields - An array of the fields to return
   * @param filterFormula  - The filterformula to use
   * @returns
   */
  private getTableContents(
    tableId: string,
    fields?: string[],
    filterFormula?: string,
  ): Promise<Records<FieldSet>> {
    const selectOpts: SelectOptions<FieldSet> = {};
    if (fields != undefined) {
      selectOpts.fields = fields;
    }
    if (filterFormula != undefined) {
      selectOpts.filterByFormula = filterFormula;
    }

    return this.base(tableId)
      .select(selectOpts)
      .all()
      .then((records: Records<FieldSet>) => records.map((rec) => rec._rawJson));
  }

  createSnapshot() {
    return {
      ...super.createSnapshot(),
      airtableApi: this.airtableApi,
      base: this.base,
    };
  }

  loadSnapshot({ airtableApi, base, ...snapshot }: ReturnType<typeof this.createSnapshot>) {
    super.loadSnapshot(snapshot);
    Object.assign(this, {
      airtableApi,
      base,
    });
  }
}
