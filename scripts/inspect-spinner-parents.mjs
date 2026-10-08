import fs from 'fs';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await tabsRes.json();
  const ghubaTab = tabs.find(t => t.url && t.url.includes('/site/ghuba'));
  const ws = new WebSocket(ghubaTab.webSocketDebuggerUrl);

  let idCounter = 1;
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
  await new Promise((r) => { ws.onopen = r; });

  function send(method, params = {}) {
    const id = idCounter++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const spinner = document.querySelector('.animate-spin, [class*="spin"]');
      if (!spinner) return 'No spinner';
      const path = [];
      let curr = spinner;
      while (curr && curr !== document.body) {
        path.push({
          tag: curr.tagName,
          id: curr.id,
          class: curr.className,
          dataset: { ...curr.dataset }
        });
        curr = curr.parentElement;
      }
      return JSON.stringify(path);
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(JSON.parse(res.result.value), null, 2));
  ws.close();
}

main().catch(console.error);
