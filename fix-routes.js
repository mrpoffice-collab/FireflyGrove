const fs = require('fs');
const path = require('path');

// Find all route.ts files with old params pattern
const apiDir = path.join(__dirname, 'app', 'api');

function findRouteFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findRouteFiles(fullPath, files);
    } else if (item === 'route.ts') {
      files.push(fullPath);
    }
  }
  return files;
}

const routeFiles = findRouteFiles(apiDir);

let fixedCount = 0;
let skippedCount = 0;

for (const file of routeFiles) {
  let content = fs.readFileSync(file, 'utf8');

  // Check if file has old pattern
  if (!content.includes('{ params: { ')) {
    skippedCount++;
    continue;
  }

  // Already fixed?
  if (content.includes('{ params: Promise<{')) {
    skippedCount++;
    continue;
  }

  // Find all param names used (id, branchId, entryId, slug, etc)
  const paramMatches = content.matchAll(/\{ params \}: \{ params: \{ (\w+): string \} \}/g);
  const paramNames = [...new Set([...paramMatches].map(m => m[1]))];

  if (paramNames.length === 0) {
    skippedCount++;
    continue;
  }

  let modified = content;

  for (const paramName of paramNames) {
    // Pattern 1: Direct destructure with const extraction later
    // { params }: { params: { branchId: string } } ... const branchId = params.branchId
    const oldPattern1 = new RegExp(
      `\\{ params \\}: \\{ params: \\{ ${paramName}: string \\} \\}`,
      'g'
    );
    const newPattern1 = `{ params }: { params: Promise<{ ${paramName}: string }> }`;

    if (modified.match(oldPattern1)) {
      modified = modified.replace(oldPattern1, newPattern1);

      // Now we need to add await params extraction
      // Look for patterns like:
      // const branchId = params.branchId
      // or just: params.branchId used directly

      // Check if there's already a destructuring like const { branchId } = params
      const hasDestructure = modified.includes(`const { ${paramName} } = params`);
      const hasAssignment = modified.includes(`const ${paramName} = params.${paramName}`);

      if (!hasDestructure && !hasAssignment) {
        // Need to add extraction after the try { line
        // Find pattern: ) {\n  try {\n
        const tryPattern = /\) \{\n(\s+)try \{/g;
        let match;
        let insertPositions = [];

        while ((match = tryPattern.exec(modified)) !== null) {
          insertPositions.push({
            index: match.index + match[0].length,
            indent: match[1]
          });
        }

        // Insert from end to beginning to preserve indices
        for (let i = insertPositions.length - 1; i >= 0; i--) {
          const pos = insertPositions[i];
          // Only insert if this section uses params
          const nextTryIndex = modified.indexOf('try {', pos.index);
          const funcEnd = modified.indexOf('\n}', pos.index);
          const section = modified.substring(pos.index, funcEnd > -1 ? funcEnd : modified.length);

          if (section.includes(`params.${paramName}`) || section.includes(`params }`)) {
            const insertion = `\n${pos.indent}  const { ${paramName} } = await params`;
            modified = modified.slice(0, pos.index) + insertion + modified.slice(pos.index);
          }
        }
      } else if (hasAssignment) {
        // Replace const branchId = params.branchId with await version
        const assignPattern = new RegExp(`const ${paramName} = params\\.${paramName}`, 'g');
        modified = modified.replace(assignPattern, `const { ${paramName} } = await params`);
      } else if (hasDestructure) {
        // Replace const { branchId } = params with await version
        const destructPattern = new RegExp(`const \\{ ${paramName} \\} = params([^\\n]*)`, 'g');
        modified = modified.replace(destructPattern, `const { ${paramName} } = await params$1`);
      }

      // Replace any remaining params.branchId with just branchId
      // But be careful not to replace if it's in a string or already extracted
      const directUsePattern = new RegExp(`params\\.${paramName}`, 'g');
      modified = modified.replace(directUsePattern, paramName);
    }
  }

  if (modified !== content) {
    fs.writeFileSync(file, modified, 'utf8');
    console.log(`Fixed: ${path.relative(__dirname, file)}`);
    fixedCount++;
  } else {
    skippedCount++;
  }
}

console.log(`\nDone! Fixed ${fixedCount} files, skipped ${skippedCount} files.`);
