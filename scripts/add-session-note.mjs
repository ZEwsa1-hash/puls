import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';

const NOTES_PATH = join(process.cwd(), 'docs', 'codex-session-notes.md');
const SESSION_LOG_HEADING = '## Session Log';

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;

    const [rawKey, inlineValue] = arg.slice(2).split('=', 2);
    const nextValue = argv[index + 1];
    const value = inlineValue ?? (!nextValue?.startsWith('--') ? nextValue : 'true');

    args[rawKey] = value;
    if (value === nextValue) index += 1;
  }

  return args;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizePath(filePath) {
  return filePath.replaceAll('\\', '/').trim();
}

function getChangedFiles() {
  try {
    const output = execFileSync('git', ['status', '--short'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    return output
      .split(/\r?\n/)
      .map((line) => line.slice(3).trim())
      .filter(Boolean)
      .map((filePath) => {
        const renamedPath = filePath.split(' -> ').at(-1);
        return normalizePath(renamedPath || filePath);
      })
      .filter((filePath) => filePath !== 'docs/codex-session-notes.md')
      .sort();
  } catch {
    return [];
  }
}

async function promptForMissingFields(args, defaults) {
  if (!process.stdin.isTTY) {
    return args;
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const fields = [
      ['goal', 'Goal'],
      ['changed', 'Changed files'],
      ['decision', 'Key decision'],
      ['verification', 'Verification'],
      ['next', 'Next step'],
    ];

    for (const [key, label] of fields) {
      if (args[key]) continue;

      const defaultValue = defaults[key] || 'TBD';
      const answer = await rl.question(`${label} [${defaultValue}]: `);
      args[key] = answer.trim() || defaultValue;
    }
  } finally {
    rl.close();
  }

  return args;
}

function formatChangedFiles(changed) {
  const files = Array.isArray(changed)
    ? changed
    : String(changed || '')
        .split(',')
        .map((filePath) => filePath.trim())
        .filter(Boolean);

  if (files.length === 0) return '`TBD`';
  return files.map((filePath) => `\`${normalizePath(filePath)}\``).join(', ');
}

function buildEntry(args) {
  const date = args.date || formatDate(new Date());

  return [
    `### ${date}`,
    '',
    `- Goal: ${args.goal || 'TBD'}.`,
    `- Changed: ${formatChangedFiles(args.changed)}.`,
    `- Decision: ${args.decision || 'TBD'}.`,
    `- Verification: ${args.verification || 'TBD'}.`,
    `- Follow-up: ${args.next || 'TBD'}.`,
    '',
    '',
  ].join('\n');
}

function insertEntry(notes, entry) {
  const headingIndex = notes.indexOf(SESSION_LOG_HEADING);
  if (headingIndex === -1) {
    throw new Error(`Could not find "${SESSION_LOG_HEADING}" in ${NOTES_PATH}`);
  }

  const insertIndex = notes.indexOf('\n', headingIndex);
  if (insertIndex === -1) {
    return `${notes}\n\n${entry}`;
  }

  const before = notes.slice(0, insertIndex + 1);
  const after = notes.slice(insertIndex + 1).replace(/^\r?\n/, '');
  return `${before}\n${entry}${after}`;
}

async function main() {
  if (!existsSync(NOTES_PATH)) {
    throw new Error(`Session notes file does not exist: ${NOTES_PATH}`);
  }

  const args = parseArgs(process.argv.slice(2));
  const changedFiles = getChangedFiles();
  const defaults = {
    changed: changedFiles.join(', ') || 'TBD',
    decision: 'TBD',
    next: 'TBD',
    verification: 'TBD',
  };

  const completedArgs = await promptForMissingFields(args, defaults);
  if (!completedArgs.changed) completedArgs.changed = changedFiles;

  const notes = readFileSync(NOTES_PATH, 'utf8');
  const entry = buildEntry(completedArgs);
  const nextNotes = insertEntry(notes, entry);

  if (args['dry-run']) {
    process.stdout.write(entry);
    return;
  }

  writeFileSync(NOTES_PATH, nextNotes, 'utf8');
  process.stdout.write(`Added session note to ${NOTES_PATH}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
