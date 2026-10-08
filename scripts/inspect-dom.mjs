import fs from 'fs';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9223/json/list');
  const tabs = await tabsRes.json();
  const ghubaTab = tabs.find(t => t.url && t.url.includes('/site/ghuba'));

  if (!ghubaTab) {
    console.error('No Ghuba tab found');
    process.exit(1);
  }

  const ws = new WebSocket(ghubaTab.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    const curId = id++;
    return new Promise((resolve, reject) => {
      pending.set(curId, { resolve, reject });
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  // Enable log & runtime
  await send('Log.enable');
  await send('Runtime.enable');
  await send('Console.enable');

  const logs = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      logs.push({ type: msg.params.type, args: msg.params.args.map(a => a.value || a.description) });
    } else if (msg.method === 'Runtime.exceptionThrown') {
      logs.push({ type: 'exception', details: msg.params.exceptionDetails });
    }
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  console.log('Navigating to http://127.0.0.1:3000/site/ghuba...');
  await send('Page.navigate', { url: 'http://127.0.0.1:3000/site/ghuba' });

  // Wait 4 seconds for load & render
  await new Promise(r => setTimeout(r, 4000));

  console.log('Collected Logs:', JSON.stringify(logs, null, 2));

  // Check DOM
  const domInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasErrorPortal: !!document.querySelector('nextjs-portal'),
        htmlLength: document.documentElement.outerHTML.length,
        bodyHtmlSnippet: document.body ? document.body.innerHTML.slice(0, 500) : ''
      };
    })()`,
    returnByValue: true
  });
  console.log('DOM Info:', domInfo.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/phone_cdp_shot.png', Buffer.from(shot.data, 'base64'));
  console.log('Captured screenshot to scripts/phone_cdp_shot.png');

  ws.close();
}

main().catch(console.error);
