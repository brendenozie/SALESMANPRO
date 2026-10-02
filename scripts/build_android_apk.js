const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Deploy latest Kotlin files first
console.log('--- Step 1: Deploying Kotlin scripts to Android Studio project ---');
require('./deploy_android_files.js');

// 2. Configure Environment for Gradle with Android Studio JBR
const jbrPath = 'C:\\Program Files\\Android\\Android Studio\\jbr';
const androidProjectDir = 'C:\\Users\\Brenden\\AndroidStudioProjects\\Salesmanpro';

const env = {
  ...process.env,
  JAVA_HOME: jbrPath,
  PATH: `${jbrPath}\\bin;${process.env.PATH}`,
};

console.log('--- Step 2: Building Android Debug APK using Gradle ---');
const gradlewCmd = path.join(androidProjectDir, 'gradlew.bat');
const buildResult = spawnSync(gradlewCmd, ['assembleDebug', '--no-daemon', '--console=plain'], {
  cwd: androidProjectDir,
  env,
  stdio: 'inherit',
  shell: true,
});

if (buildResult.status !== 0) {
  console.error(`Gradle build failed with exit code ${buildResult.status}`);
  process.exit(buildResult.status || 1);
}

// 3. Copy newly generated APK to public/download-mobile/
console.log('--- Step 3: Copying APK to public/download-mobile/ ---');
const builtApk = path.join(androidProjectDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (!fs.existsSync(builtApk)) {
  console.error(`Built APK not found at ${builtApk}`);
  process.exit(1);
}

const targetDir = path.join(__dirname, '..', 'public', 'download-mobile');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const targetDebug = path.join(targetDir, 'app-debug.apk');
const targetRelease = path.join(targetDir, 'app-release.apk');

fs.copyFileSync(builtApk, targetDebug);
fs.copyFileSync(builtApk, targetRelease);

const stat = fs.statSync(targetRelease);
console.log(`Successfully updated public/download-mobile APKs!`);
console.log(`- ${targetDebug} (${stat.size} bytes)`);
console.log(`- ${targetRelease} (${stat.size} bytes)`);
