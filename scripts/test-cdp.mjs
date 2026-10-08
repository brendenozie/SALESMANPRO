import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9222;
const USER_DATA = 'C:\\Users\\Brenden\\AppData\\Local\\Temp\\chrome-cdp-test-' + Date.now();

console.log('Spawning Chrome...');
const chrome = spawn(CHROME_PATH, [
  `--remote-debugging-port=${CDP_PORT}`,
  '--headless=new',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${USER_DATA}`,
  'about:blank'
], { stdio: 'ignore' });

async function waitForCdp() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        const data = await res.json();
        return data.webSocketDebuggerUrl;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Chrome CDP did not become ready');
}

try {
  const wsUrl = await waitForCdp();
  console.log('Connected to CDP at:', wsUrl);
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  console.log('WebSocket handshake successful!');
  ws.close();
} finally {
  chrome.kill();
  console.log('Chrome process cleaned up.');
}
