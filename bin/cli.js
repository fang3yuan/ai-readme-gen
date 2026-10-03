#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

import { getApiKey, saveApiKey } from '../src/config.js';
import {
  getRepoMetadata,
  fetchFullProjectTree,
  fetchFileRawText
} from '../src/githubService.js';
import { ULTRA_README_SYSTEM_PROMPT } from '../src/prompts.js';

const program = new Command();

program
  .name('readme-gen')
  .description('Interactive CLI to generate professional GitHub README.md using Gemini 3.8 Flash')
  .version('1.0.0');

// أمر إعداد الـ API Key مرة واحدة
program
  .command('config')
  .description('Set and save your Gemini API Key locally')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your Gemini API Key:',
        mask: '*',
        validate: (input) =>
          input.trim() !== '' || 'API Key cannot be empty.'
      }
    ]);

    saveApiKey(answers.apiKey.trim());

    console.log(
      chalk.bold.green(
        '\n✅ Gemini API Key successfully saved to your system config!\n'
      )
    );
  });

// الأمر الرئيسي للتوليد التفاعلي
program
  .command('generate', { isDefault: true })
  .description('Generate README.md for a GitHub repository')
  .action(async () => {
    console.log(
      chalk.bold.cyan(
        `\n🚀 AI README Architect CLI - Powered by Gemini 3.8 Flash & GitHub Trees API 🚀\n`
      )
    );

    let apiKey = getApiKey();

    if (!apiKey) {
      console.log(
        chalk.yellow(
          '⚠️ No Gemini API Key found in system configuration.'
        )
      );

      const keyPrompt = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message:
            'Please enter your Gemini API Key now (it will be saved for future runs):',
          mask: '*',
          validate: (input) =>
            input.trim() !== '' || 'API Key is required.'
        }
      ]);

      apiKey = keyPrompt.apiKey.trim();
      saveApiKey(apiKey);

      console.log(chalk.green(' Saved API Key!\n'));
    }

    // الأسئلة التفاعلية
    const userInputs = await inquirer.prompt([
      {
        type: 'input',
        name: 'repoUrl',
        message:
          'Enter GitHub Repository URL (e.g., https://github.com/owner/repo):',
        validate: (input) =>
          input.startsWith('https://github.com/') ||
          'Must be a valid GitHub URL.'
      },
      {
        type: 'input',
        name: 'extraNotes',
        message:
          'Any extra details/notes about the project to tell the AI? (Optional):'
      }
    ]);

    const spinner = ora(
      'Accessing GitHub API & parsing repository metadata...'
    ).start();

    try {
      const metadata = await getRepoMetadata(userInputs.repoUrl);

      spinner.text =
        `Fetching complete file tree via GitHub Trees API for ` +
        `[${metadata.owner}/${metadata.repo}]...`;

      const files = await fetchFullProjectTree(
        metadata.owner,
        metadata.repo,
        metadata.defaultBranch
      );

      spinner.succeed(
        `Retrieved tree with ${files.length} total files!`
      );

      const inspectSpinner = ora(
        'Inspecting core configuration and entry source files via Raw links...'
      ).start();

      const priorityFiles = [
        'package.json',
        'requirements.txt',
        'Dockerfile',
        'docker-compose.yml',
        'go.mod',
        'Cargo.toml',
        'index.js',
        'main.py',
        'app.py',
        'src/index.js',
        'src/main.ts',
        'src/App.tsx'
      ];

      const inspectedContents = {};

      for (const file of files) {
        if (priorityFiles.includes(file.path)) {
          const content = await fetchFileRawText(file.rawUrl);

          if (content) {
            inspectedContents[file.path] = content;
          }
        }
      }

      inspectSpinner.succeed(
        'Core files downloaded and parsed.'
      );

      // تجهيز الحمولة للـ Prompt
      const promptPayload = `
[Target Repo URL]: ${userInputs.repoUrl}
[Owner]: ${metadata.owner}
[Repo Name]: ${metadata.repo}
[Branch]: ${metadata.defaultBranch}
[GitHub Description]: ${metadata.description}
[GitHub Topics]: ${metadata.topics.join(', ')}
[User Custom Notes]: ${userInputs.extraNotes || 'None'}

[All Project Files Manifest with Raw URLs]:
${files
  .map(
    (f) => `- \`${f.path}\` -> Raw Link: ${f.rawUrl}`
  )
  .join('\n')}

[Inspected Priority Configuration & Entry Code]:
${JSON.stringify(inspectedContents, null, 2)}
      `;

      const aiSpinner = ora(
        'Generating professional English README via Gemini 3.8 Flash...'
      ).start();

      const ai = new GoogleGenAI({
        apiKey
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptPayload,
        config: {
          systemInstruction: ULTRA_README_SYSTEM_PROMPT,
          temperature: 0.15
        }
      });

      aiSpinner.succeed(
        'README generation complete!'
      );

      const outputFile = path.join(
        process.cwd(),
        'README.md'
      );

      fs.writeFileSync(
        outputFile,
        response.text,
        'utf8'
      );

      console.log(
        chalk.bold.green(
          `\n✨ Output file saved successfully to: ${outputFile}\n`
        )
      );
    } catch (error) {
      spinner.fail('Error executing task.');

      console.error(
        chalk.red(
          `\n❌ Error: ${error.message}\n`
        )
      );
    }
  });

program.parse(process.argv);
