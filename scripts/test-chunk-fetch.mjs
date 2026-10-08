async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await tabsRes.json();
  const ghubaTab = tabs.find(t => t.url && t.url.includes('/site/ghuba'));

  const ws = new WebSocket(ghubaTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

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

  function send(method, params = {}) {
    const id = idCounter++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const res = await send('Runtime.evaluate', {
    expression: `(async () => {
      try {
        const resp = await fetch('/_next/static/chunks/webpack.js');
        return JSON.stringify({ ok: resp.ok, status: resp.status, textSnippet: (await resp.text()).slice(0, 100) });
      } catch (err) {
        return JSON.stringify({ error: err.message, stack: err.stack });
      }
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('FETCH CHUNK RESULT:', res.result.value);
  ws.close();
}

main().catch(console.error);
