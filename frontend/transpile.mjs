import fs from 'fs';
import path from 'path';
import * as babel from '@babel/core';

const srcDir = path.join(process.cwd(), '../Game/the-case-file/src');
const destDir = path.join(process.cwd(), 'src');

function transpileFile(filePath) {
  const relPath = path.relative(srcDir, filePath);
  let destPath = path.join(destDir, relPath);

  const ext = path.extname(filePath);

  if (ext === '.ts' || ext === '.tsx') {
    destPath = destPath.replace(/\.tsx?$/, ext === '.tsx' ? '.jsx' : '.js');
    console.log(`Transpiling ${relPath} -> ${path.relative(destDir, destPath)}`);

    let code = fs.readFileSync(filePath, 'utf8');

    const result = babel.transformSync(code, {
      filename: filePath,
      presets: [
        ['@babel/preset-typescript']
      ],
      plugins: [
        '@babel/plugin-syntax-jsx'
      ],
      retainLines: true,
      generatorOpts: {
        retainLines: true,
        compact: false,
      }
    });

    if (result && result.code) {
      fs.writeFileSync(destPath, result.code);
    }
  } else {
    console.log(`Copying ${relPath} -> ${path.relative(destDir, destPath)}`);
    fs.copyFileSync(filePath, destPath);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      const destPath = path.join(destDir, path.relative(srcDir, filePath));
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      walkDir(filePath);
    } else {
      transpileFile(filePath);
    }
  }
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
walkDir(srcDir);
console.log("Transpilation and copying completed!");
