#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const ENTRY_FILE = path.resolve(__dirname, 'claim_audit_entry.jsx');
const REACT_NATIVE_STUB = './scripts/stubs/react-native.js';
const ASYNC_STORAGE_STUB = './scripts/stubs/async-storage.js';
const NPX_BIN = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const IS_WINDOWS = process.platform === 'win32';

const quoteShellArg = (value) => {
  const text = String(value ?? '');
  if (text.length === 0) return '""';
  if (!/[\s"^&|<>]/.test(text)) return text;
  return `"${text.replace(/"/g, '\\"')}"`;
};

const run = (command, args, label) => {
  const spawnArgs = {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  };
  const result = IS_WINDOWS
    ? spawnSync([command, ...args].map(quoteShellArg).join(' '), { ...spawnArgs, shell: true })
    : spawnSync(command, args, spawnArgs);
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
};

const main = () => {
  if (!fs.existsSync(ENTRY_FILE)) {
    throw new Error(`Missing entry file: ${ENTRY_FILE}`);
  }
  if (!fs.existsSync(path.resolve(ROOT, REACT_NATIVE_STUB))) {
    throw new Error(`Missing react-native stub: ${REACT_NATIVE_STUB}`);
  }
  if (!fs.existsSync(path.resolve(ROOT, ASYNC_STORAGE_STUB))) {
    throw new Error(`Missing async-storage stub: ${ASYNC_STORAGE_STUB}`);
  }
  const bundlePath = path.join(os.tmpdir(), `cdss-claim-audit-${Date.now()}.cjs`);
  const args = process.argv.slice(2);

  try {
    run(
      NPX_BIN,
      [
        '--yes',
        'esbuild',
        ENTRY_FILE,
        '--bundle',
        '--platform=node',
        '--format=cjs',
        '--target=node18',
        `--outfile=${bundlePath}`,
        `--alias:react-native=${REACT_NATIVE_STUB}`,
        `--alias:@react-native-async-storage/async-storage=${ASYNC_STORAGE_STUB}`,
        `--alias:expo-constants=./scripts/stubs/expo-constants.js`,
      ],
      'Build claim audit bundle'
    );

    run(process.execPath, [bundlePath, ...args], 'Run claim audit bundle');
  } finally {
    if (fs.existsSync(bundlePath)) {
      try {
        fs.unlinkSync(bundlePath);
      } catch {
        // ignore temp cleanup errors
      }
    }
  }
};

try {
  main();
} catch (error) {
  console.error('[qa:claim-audit] FAILED');
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}
