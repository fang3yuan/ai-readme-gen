# ai-readme-gen

An interactive CLI tool that inspects GitHub repository trees and generates production-grade, structured, and comprehensive `README.md` files using Google Gemini and the GitHub REST API.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)
[![Dependencies](https://img.shields.io/badge/dependencies-Google%20GenAI%20%7C%20Commander%20%7C%20Inquirer-informational.svg)](https://github.com/fang3yuan/ai-readme-gen/blob/main/package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

---

## Overview

`ai-readme-gen` (published internally as `ai-readme-architect`) automates documentation generation for software repositories. By querying the GitHub Trees API recursively, it captures repository hierarchies, detects priority configuration files (such as `package.json`, `Dockerfile`, `go.mod`, or `requirements.txt`), extracts their source code, and feeds structured context into Google's Gemini models via `@google/genai`. The result is an accurate, ready-to-publish project overview tailored to the target codebase.

### Key Capabilities

- **Automated Repository Traversal**: Uses the GitHub Git Trees API to map entire project trees without requiring a local `git clone`.
- **Context-Aware Dependency Ingestion**: Automatically detects project manifest files and extracts entry-point configurations for LLM ingestion.
- **Interactive & Headless Modes**: Provides interactive terminal prompts via `inquirer` as well as non-interactive CLI flags via `commander`.
- **Gemini Engine Integration**: Powered by `@google/genai` to analyze deep code structures and output standard-compliant Markdown.
- **Terminal UI**: Clean terminal feedback using `ora` spinners and `chalk` color formatting.

---

## Architecture

The following diagram illustrates the flow of data from repository input to the final generated Markdown document:

```mermaid
flowchart LR
    A[User CLI Input] --> B[bin/cli.js]
    B --> C[src/config.js]
    B --> D[src/githubService.js]
    D -->|GitHub REST API| E[(Remote Repository)]
    E -->|Tree Structure & Manifests| D
    D --> F[src/prompts.js]
    F -->|Engineered Context Payload| G[@google/genai API]
    G -->|Markdown Stream/Response| B
    B --> H[Output README.md]
```

---

## Repository Structure

<details>
<summary>Click to view repository tree</summary>

```text
ai-readme-gen/
├── bin/
│   └── cli.js               # CLI entry point and argument parsing
├── src/
│   ├── config.js            # Environment handling and application configuration
│   ├── githubService.js     # GitHub API client (tree fetch, file content ingestion)
│   └── prompts.js           # Prompt templates and context formatting for Gemini
├── package.json             # Project manifest, dependencies, and executable metadata
└── README.md                # Project documentation
```

</details>

### Source File References

- [`bin/cli.js`](https://raw.githubusercontent.com/fang3yuan/ai-readme-gen/main/bin/cli.js) — The executable binary entry point orchestrating terminal interactions and file writes.
- [`src/config.js`](https://raw.githubusercontent.com/fang3yuan/ai-readme-gen/main/src/config.js) — Loads runtime configurations and manages environment secrets.
- [`src/githubService.js`](https://raw.githubusercontent.com/fang3yuan/ai-readme-gen/main/src/githubService.js) — Interface for querying GitHub Tree and Blob endpoints.
- [`src/prompts.js`](https://raw.githubusercontent.com/fang3yuan/ai-readme-gen/main/src/prompts.js) — System prompts and structured context templates fed into `@google/genai`.
- [`package.json`](https://raw.githubusercontent.com/fang3yuan/ai-readme-gen/main/package.json) — NPM package specification defining binary targets and module dependencies.

---

## Prerequisites & Environment Variables

### System Requirements
- **Node.js**: `>= 18.0.0` (Native ES Module support required)
- **npm** or **pnpm** / **yarn**

### Environment Configuration

The application requires a Gemini API key. A GitHub Personal Access Token (PAT) is strongly recommended to avoid rate limits when fetching repository trees.

Create a `.env` file in the root directory:

```bash
touch .env
```

Define the following environment variables:

| Variable | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | API key for Google Gemini model access | **Yes** | *None* |
| `GITHUB_TOKEN` | GitHub Personal Access Token (for authenticated rate limits) | No | *Anonymous access* |

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fang3yuan/ai-readme-gen.git
   cd ai-readme-gen
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env # or create .env directly
   # Ensure GEMINI_API_KEY is configured inside .env
   ```

4. **Link the CLI globally (Optional):**
   ```bash
   npm link
   ```
   This exposes the `readme-gen` command globally in your terminal.

---

## Usage

### Interactive Mode

Run the tool without arguments to initiate the guided terminal interface:

```bash
npm start
```
*Or, if linked globally:*
```bash
readme-gen
```

You will be prompted to provide:
1. Target GitHub Repository URL or shorthand (`owner/repo`).
2. Target branch (defaults to `main`).
3. Additional custom instructions or architectural context (optional).
4. Output file path (defaults to `./README.md`).

### Command-Line Arguments

You can bypass interactive prompts by passing CLI flags:

```bash
readme-gen --repo <owner/repo> --output ./GENERATED_README.md
```

### Options Reference

| Flag | Shorthand | Description | Default |
| :--- | :--- | :--- | :--- |
| `--repo <string>` | `-r` | Target repository in `owner/repo` format or full HTTPS URL | *Interactive prompt* |
| `--branch <string>` | `-b` | Branch to inspect | `main` |
| `--output <path>` | `-o` | Output destination file path | `./README.md` |
| `--help` | `-h` | Display available CLI flags and help message | — |
| `--version` | `-v` | Display package version | — |

---

## Development

To run or debug changes locally without linking:

```bash
node ./bin/cli.js
```

Ensure all imports conform to standard Node.js ES Module specifications (`import ... from '...'` with file extensions included).

---

## Contributing

1. Fork the repository.
2. Create a dedicated feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit changes with clear, structured commit messages:
   ```bash
   git commit -m "feat: add support for gitlab repositories"
   ```
4. Push to your branch and open a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).