import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFile = path.resolve(__dirname, '../node_modules/@capacitor/android/capacitor/build.gradle');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes('singleVariant("release")')) {
    console.log('Fixing capacitor-android publishing config...');
    content = content.replace(
      /publishing\s*\{\s*singleVariant\("release"\)\s*\}/g,
      'publishing {\n        multipleVariants {\n            allVariants()\n        }\n    }'
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully fixed capacitor-android build.gradle!');
  } else {
    console.log('capacitor-android build.gradle already fixed or singleVariant configuration not found.');
  }
} else {
  console.log('capacitor-android build.gradle not found at ' + targetFile);
}
