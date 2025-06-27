import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const sourceDir = './uploads';
const targetDir = './dist/public/uploads';

// Create target directory if it doesn't exist
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

// Copy all files from uploads to dist/public/uploads
if (existsSync(sourceDir)) {
  const files = readdirSync(sourceDir);
  files.forEach(file => {
    const sourcePath = join(sourceDir, file);
    const targetPath = join(targetDir, file);
    copyFileSync(sourcePath, targetPath);
    console.log(`Copied: ${file}`);
  });
  console.log(`Copied ${files.length} upload files to build directory`);
} else {
  console.log('No uploads directory found');
}