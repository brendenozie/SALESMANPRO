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

  // Inspect the spinner and main container
  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const main = document.querySelector('main');
      const spinner = document.querySelector('.animate-spin, [class*="spin"], [class*="loader"]');
      return JSON.stringify({
        mainTag: main ? main.outerHTML.slice(0, 500) : null,
        mainChildren: main ? Array.from(main.children).map(c => ({
          tag: c.tagName,
          id: c.id,
          class: c.className,
          rect: c.getBoundingClientRect(),
          innerSnippet: c.innerHTML.slice(0, 200)
        })) : [],
        spinnerOuter: spinner ? spinner.outerHTML : null,
        spinnerParent: spinner && spinner.parentElement ? spinner.parentElement.outerHTML.slice(0, 300) : null
      });
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(JSON.parse(res.result.value), null, 2));
  ws.close();
}

main().catch(console.error);
