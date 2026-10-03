import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'ai-readme-architect');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function getApiKey() {
  if (!fs.existsSync(CONFIG_FILE)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return data.GEMINI_API_KEY || null;
  } catch (e) {
    return null;
  }
}

export function saveApiKey(apiKey) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const data = { GEMINI_API_KEY: apiKey };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');
}
