# Contributing

Bee Agent Framework is an open-source project committed to bringing LLM agents to people of all backgrounds. This page describes how you can join the Bee community in this goal.

## Before you start

If you are new to Bee contributing, we recommend you do the following before diving into the code:

- Read [Bee Overview](https://github.com/i-am-bee/bee-agent-framework/blob/main/docs/overview.md) to understand core concepts.
- Read [Code of Conduct](./CODE_OF_CONDUCT.md).

## Choose an issue to work on

Bee uses the following labels to help non-maintainers find issues best suited to their interests and experience level:

- [good first issue](https://github.com/i-am-bee/bee-community-tools/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) - these issues are typically the simplest available to work on, ideal for newcomers. They should already be fully scoped, with a straightforward approach outlined in the descriptions.
- [help wanted](https://github.com/i-am-bee/bee-community-tools/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22) - these issues are generally more complex than good first issues. They typically cover work that core maintainers don't currently have the capacity to implement and may require more investigation/discussion. These are great options for experienced contributors looking for something more challenging.

## Set up a development environment

To start contributing tooling to the Bee Agent framework, follow these steps to set up your development environment:

1. **Install a Node Version Manager (NVM or n):** We use `.nvmrc` to specify the required Node.js version. Install [nvm](https://github.com/nvm-sh/nvm) or or [n](https://github.com/tj/n) by following their official installation instructions.

1. **Install the Correct Node.js Version:** Use `nvm` to install and use the Node.js version specified in the `.nvmrc` file:

   ```bash
   nvm install && nvm use || n auto
   ```

1. **Install IBM Detect Secrets:** We use [IBM Detect Secrets](https://github.com/IBM/detect-secrets) to help ensure that secrets are not leaked into the code base. This tool is run as part a pre-commit hook so will be required before you can make commits.

1. **Install [Yarn](https://yarnpkg.com/) via Corepack:** This project uses Yarn as the package manager. Ensure you have Corepack enabled and install Yarn:

   ```bash
   corepack enable
   ```

1. **Install Dependencies:** Install all project dependencies by running:

   ```bash
   yarn install
   ```

1. **Setup environmental variables:** See the [.env.template](.env.template) file for an example and fill out the appropriate values

   ```bash
   cp .env.template .env
   ```

1. **Follow Conventional Commit Messages:** We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) to structure our commit messages. This helps maintain a clean and manageable commit history. Please use the following format:

   ```
   <type>(<scope>): <subject>
   Type: feat, fix, chore, docs, style, refactor, perf, test, etc.
   Scope: The area of the codebase your changes affect (optional).
   Subject: A short description of the changes (required).
   ```

   _Example:_

   ```
   feat(watsonx): add llm streaming support

   Ref: #15
   ```

1. **Run Linters/Formatters:** Ensure your changes meet code quality standards. Run the following commands:

   ```shell
   yarn lint # or yarn lint:fix
   yarn format # or yarn lint:format
   ```

1. **Run Tests:** Ensure your changes pass all tests (unit, integration, E2E). Run the following commands:

   ```shell
   yarn test:unit
   yarn test:e2e
   ```

By following the above steps, you'll be all set to contribute to our project! If you encounter any issues during the setup process, please feel free to open an issue.

## Style and lint

Bee uses the following tools to meet code quality standards and ensure a unified code style across the codebase.

- [ESLint](https://eslint.org/) - Linting Utility
- [Prettier](https://prettier.io/) - Code Formatter
- [commitlint](https://commitlint.js.org/) - Lint commit messages according to [Conventional Commits](https://www.conventionalcommits.org/).

## Issues and pull requests

We use GitHub pull requests to accept contributions.

While not required, opening a new issue about the bug you're fixing or the feature you're working on before you open a pull request is important in starting a discussion with the community about your work. The issue gives us a place to talk about the idea and how we can work together to implement it in the code. It also lets the community know what you're working on, and if you need help, you can reference the issue when discussing it with other community and team members.

If you've written some code but need help finishing it, want to get initial feedback on it before finishing it, or want to share it and discuss it prior to completing the implementation, you can open a Draft pull request and prepend the title with the [WIP] tag (for Work In Progress). This will indicate to reviewers that the code in the PR isn't in its final state and will change. It also means we will only merge the commit once it is finished. You or a reviewer can remove the [WIP] tag when the code is ready to be thoroughly reviewed for merging.

## Contributor Licensing Agreement

Before you can submit any code, all contributors must sign a contributor license agreement (CLA). By signing a CLA, you're attesting that you are the author of the contribution, and that you're freely contributing it under the terms of the Apache-2.0 license.
