<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/docs/assets/Bee_logo_white.svg">
    <source media="(prefers-color-scheme: light)" srcset="/docs/assets/Bee_logo_black.svg">
    <img alt="Bee Framework logo" height="90">
  </picture>
</p>

<h1 align="center">Bee Community Tools</h1>

<p align="center">
  <a aria-label="Join the community on GitHub" href="https://github.com/i-am-bee/bee-community-tools/discussions">
    <img alt="" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&labelColor=000000&label=Bee">
  </a>
  <h4 align="center">Agentic tools that support the Bee Agent Framework</h4>
</p>

The tools in this repository are additional to those provided within the core bee-agent-framework. They provide access to various functions that enable agents to connect to a variety of different capabilities. More information about developing tools for Bee can be found in the [tools documentation](https://github.com/i-am-bee/bee-agent-framework/blob/main/docs/tools.md).

### 🛠️ Tools

| Name              | Description                                             |
| ----------------- | ------------------------------------------------------- |
| Hello World       | Trivial example tool                                    |
| Image Description | Use an LLM to get a text description for an image       |
| Open Library      | Connect to the Open Library for information about books |
| Airtable          | Query the tables within an airtable base                |

➕ [Request](https://github.com/i-am-bee/bee-community-tools/discussions)

## Getting started with Bee Community Tools

### Installation

```shell
yarn install
```

### Run an example agent with tools

We provide example agents for tool usage in `examples/agents/` that you can use to test tools.

```shell
yarn start
```

The `allToolsAgent` example agent is configured to use a BAM, Watsonx, OpenAI hosted LLM, or a local Ollama LLM.
If you are using a hosted LLM make sure to create .env (from .env.template) and fill in the necessary API_KEY.

> [!NOTE]
> The Hello World example tool is not enabled by default.

> [!TIP]
> Tools can be enabled/disabled in `examples/agents/allToolsAgent.ts`

## Contribution guidelines

Bee Community Tools is an open-source project and we ❤️ contributions.

If you'd like to contribute to an existing tool or create a new one, please take a look at our [contribution guidelines](./CONTRIBUTING.md).

### 🐛 Bugs

We are using [GitHub Issues](https://github.com/i-am-bee/bee-community-tools/issues) to manage our public bugs. We keep a close eye on this, so before filing a new issue, please check to make sure it hasn't already been logged.

### 🗒 Code of conduct

This project and everyone participating in it are governed by the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please read the [full text](./CODE_OF_CONDUCT.md) so that you can read which actions may or may not be tolerated.

## 🗒 Legal notice

All content in these repositories including code has been provided by IBM under the associated open source software license and IBM is under no obligation to provide enhancements, updates, or support. IBM developers produced this code as an open source project (not as an IBM product), and IBM makes no assertions as to the level of quality nor security, and will not be maintaining this code going forward.

## Contributors

Special thanks to our contributors for helping us improve Bee Community Tools.

<a href="https://github.com/i-am-bee/bee-community-tools/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=i-am-bee/bee-community-tools" />
</a>
