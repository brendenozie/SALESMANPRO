async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9223/json/list');
  const tabs = await tabsRes.json();
  const ghubaTab = tabs.find(t => t.url && t.url.includes('/site/ghuba'));
  if (!ghubaTab) {
    console.log('No ghuba tab');
    return;
  }
  const ws = new WebSocket(ghubaTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `JSON.stringify({
        ready: document.readyState,
        hasSpinner: !!document.querySelector('.animate-spin'),
        title: document.title,
        mainHeight: document.querySelector('main')?.scrollHeight,
        header: !!document.querySelector('#section-header'),
        footer: !!document.querySelector('#section-footer'),
        sections: Array.from(document.querySelectorAll('[data-editor-section]')).map(s => s.id)
      })`
    }
  }));

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id === 1) {
      console.log('STATUS:', msg.result.result.value);
      ws.close();
      process.exit(0);
    }
  };
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
