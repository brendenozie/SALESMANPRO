const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const layoutsDir = path.resolve('components', 'site', 'layouts');
const allTsxFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.tsx')) allTsxFiles.push(full);
  }
}
walk(layoutsDir);

console.log(`Analyzing AST across ${allTsxFiles.length} TSX layout files...`);

const syntaxErrors = [];

for (const file of allTsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true, // setParentNodes
    ts.ScriptKind.TSX
  );

  const diags = sourceFile.parseDiagnostics || [];
  if (diags.length > 0) {
    for (const d of diags) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(d.start);
      syntaxErrors.push({
        file: path.relative(process.cwd(), file),
        line: line + 1,
        col: character + 1,
        message: ts.flattenDiagnosticMessageText(d.messageText, '\n')
      });
    }
  }
}

if (syntaxErrors.length === 0) {
  console.log('✅ All TSX layout files have valid AST syntax!');
} else {
  console.log(`❌ Found ${syntaxErrors.length} syntax/JSX tag errors:`);
  console.table(syntaxErrors);
}
