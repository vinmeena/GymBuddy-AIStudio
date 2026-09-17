import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const workspaceRoot = process.cwd();
const unitySourceDir = path.join(workspaceRoot, 'unity', 'Assets');
const distDir = path.join(workspaceRoot, 'dist');
const webBuildTarget = path.join(unitySourceDir, 'KineticGym', 'WebBuild');
const packageOutputDir = path.join(workspaceRoot, 'temp_unitypackage');
const outputPackagePath = path.join(workspaceRoot, 'KineticGym_v1.0.unitypackage');

console.log('🚀 Starting Unity Package Build Sequence...');

// Step 1: Ensure dist exists by running npm run build
if (!fs.existsSync(distDir)) {
  console.log('📦 Running web build (npm run build)...');
  execSync('npm run build', { stdio: 'inherit', cwd: workspaceRoot });
}

// Copy dist files to WebBuild folder
fs.mkdirSync(webBuildTarget, { recursive: true });
fs.cpSync(distDir, webBuildTarget, { recursive: true });
console.log('✅ Web build assets copied to Assets/KineticGym/WebBuild/');

// Clean temporary package directory
if (fs.existsSync(packageOutputDir)) {
  fs.rmSync(packageOutputDir, { recursive: true, force: true });
}
fs.mkdirSync(packageOutputDir, { recursive: true });

function generateGuid(filePath) {
  return crypto.createHash('md5').update(filePath).digest('hex');
}

function getMetaContent(guid, isFolder, ext) {
  if (isFolder) {
    return `fileFormatVersion: 2
guid: ${guid}
FolderImporter:
  externalObjects: {}
  userData: 
  assetBundleName: 
  assetBundleVariant: 
`;
  }

  if (ext === '.cs') {
    return `fileFormatVersion: 2
guid: ${guid}
MonoImporter:
  externalObjects: {}
  serializedVersion: 2
  defaultReferences: []
  executionOrder: 0
  icon: {instanceID: 0}
  userData: 
  assetBundleName: 
  assetBundleVariant: 
`;
  }

  if (ext === '.md' || ext === '.txt' || ext === '.json') {
    return `fileFormatVersion: 2
guid: ${guid}
TextScriptImporter:
  externalObjects: {}
  userData: 
  assetBundleName: 
  assetBundleVariant: 
`;
  }

  return `fileFormatVersion: 2
guid: ${guid}
DefaultImporter:
  externalObjects: {}
  userData: 
  assetBundleName: 
  assetBundleVariant: 
`;
}

function processDirectory(currentDir) {
  const items = fs.readdirSync(currentDir);

  for (const item of items) {
    if (item.endsWith('.meta')) continue;

    const fullPath = path.join(currentDir, item);
    const relativeUnityPath = path.relative(path.join(workspaceRoot, 'unity'), fullPath).replace(/\\/g, '/');
    const isDirectory = fs.statSync(fullPath).isDirectory();
    const guid = generateGuid(relativeUnityPath);
    const ext = path.extname(item).toLowerCase();

    const guidFolder = path.join(packageOutputDir, guid);
    fs.mkdirSync(guidFolder, { recursive: true });

    // 1. pathname file
    fs.writeFileSync(path.join(guidFolder, 'pathname'), relativeUnityPath, 'utf8');

    // 2. asset.meta file
    const metaYaml = getMetaContent(guid, isDirectory, ext);
    fs.writeFileSync(path.join(guidFolder, 'asset.meta'), metaYaml, 'utf8');

    // 3. asset file (if not a folder)
    if (!isDirectory) {
      fs.copyFileSync(fullPath, path.join(guidFolder, 'asset'));
    }

    // Also write a local .meta file next to the source file for Unity Editor cleanliness
    fs.writeFileSync(`${fullPath}.meta`, metaYaml, 'utf8');

    if (isDirectory) {
      processDirectory(fullPath);
    }
  }
}

// Step 2: Process all files inside Assets/
processDirectory(unitySourceDir);
console.log('✅ Generated Unity asset GUID structure and metadata.');

// Step 3: Compress temp_unitypackage directory into tar.gz (.unitypackage)
console.log('📦 Compressing into .unitypackage archive...');
try {
  execSync(`tar -czf "${outputPackagePath}" -C "${packageOutputDir}" .`, { stdio: 'inherit' });
  const publicTarget = path.join(workspaceRoot, 'public', 'KineticGym_v1.0.unitypackage');
  fs.mkdirSync(path.join(workspaceRoot, 'public'), { recursive: true });
  fs.copyFileSync(outputPackagePath, publicTarget);
  console.log(`🎉 SUCCESS! Unity Package created at: ${outputPackagePath} and copied to public/`);
} catch (err) {
  console.error('❌ Failed to create tar.gz:', err);
  process.exit(1);
}

// Clean up temp directory
fs.rmSync(packageOutputDir, { recursive: true, force: true });
console.log('🧹 Cleaned up temporary build directories.');
