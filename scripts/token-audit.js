#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = "/Users/vimala/Documents/Youclean Website";
const tokensPath = path.join(root, 'tokens.css');

function readTokens() {
  const text = fs.readFileSync(tokensPath, 'utf8');
  const aliasBlock = text.split('@layer alias')[1] || '';
  const lines = aliasBlock.split('\n');
  const map = new Map();
  for (const line of lines) {
    const m = line.match(/(--[\w-]+):\s*([^;]+);/);
    if (!m) continue;
    const name = m[1];
    const value = m[2].trim();
    if (!map.has(value)) map.set(value, name);
  }
  return map;
}

const valueToToken = readTokens();

const patterns = {
  hex: /#[0-9a-fA-F]{3,8}\b/g,
  rgb: /rgba?\([^\)]+\)/g,
  px: /\b\d+(?:\.\d+)?px\b/g,
  rem: /\b\d+(?:\.\d+)?rem\b/g,
  duration: /\b\d+(?:\.\d+)?(?:ms|s)\b/g,
};

const errorTypes = ['hex', 'rgb', 'px', 'rem'];
const warningTypes = ['duration'];

function isSkippableLine(line) {
  const t = line.trim();
  if (!t) return true;
  if (t.startsWith('@media')) return true;
  if (t.startsWith('@layer')) return true;
  if (t.startsWith('/*') || t.startsWith('*') || t.startsWith('*/')) return true;
  return false;
}

function hasVarToken(line) {
  return line.includes('var(--');
}

function suggestToken(raw) {
  return valueToToken.get(raw) || 'no direct token found';
}

function scanFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  const findings = [];

  lines.forEach((line, idx) => {
    if (isSkippableLine(line)) return;

    for (const [type, regex] of Object.entries(patterns)) {
      const matches = line.match(regex);
      if (!matches) continue;

      for (const raw of matches) {
        if (hasVarToken(line)) {
          // Allow var-based lines unless raw value is also present
          // If raw appears together with var, still flag the raw.
        }

        const level = errorTypes.includes(type) ? 'error' : 'warning';
        const suggestion = suggestToken(raw);
        findings.push({
          file,
          line: idx + 1,
          raw,
          level,
          suggestion,
          text: line.trim(),
        });
      }
    }
  });

  return findings;
}

function getCssFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'specs' || entry.name === 'node_modules') continue;
      files.push(...getCssFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.css') && entry.name !== 'tokens.css') {
      files.push(fullPath);
    }
  }
  return files;
}

const cssFiles = getCssFiles(root);
let allFindings = [];
cssFiles.forEach((file) => {
  allFindings = allFindings.concat(scanFile(file));
});

if (allFindings.length === 0) {
  console.log('Token audit: no violations found.');
  process.exit(0);
}

const errors = allFindings.filter(f => f.level === 'error');
const warnings = allFindings.filter(f => f.level === 'warning');

function printFindings(list, label) {
  if (list.length === 0) return;
  console.log(`\n${label}:`);
  list.forEach((f) => {
    console.log(`${f.file}:${f.line} | ${f.raw} | ${f.text}`);
    console.log(`  -> suggest: ${f.suggestion}`);
  });
}

printFindings(errors, 'Errors');
printFindings(warnings, 'Warnings');

process.exit(errors.length > 0 ? 1 : 0);
