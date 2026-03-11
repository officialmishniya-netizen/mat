const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const srcPath = path.join(__dirname, 'src');
const files = getAllFiles(srcPath);

files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json')) {
    const content = fs.readFileSync(file, 'utf8');
    // Write as UTF-8 without BOM
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Re-encoded: ${file}`);
  }
});
