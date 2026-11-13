const express = require('express');
const path = require('path');
const { startSession, listSessions } = require('./whatsapp');

function launchSite() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  const pending = new Map(); // number -> { code, status }

  app.post('/api/pair', async (req, res) => {
    const number = (req.body.number || '').replace(/\D/g, '');
    if (number.length < 8) return res.status(400).json({ error: 'Nimewo envalid.' });
    pending.set(number, { code: null, status: 'pending' });

    startSession(
      number,
      code => pending.set(number, { code, status: 'code_ready' }),
      status => pending.set(number, { ...pending.get(number), status })
    );
    res.json({ ok: true });
  });

  app.get('/api/status/:number', (req, res) => {
    res.json(pending.get(req.params.number) || { status: 'unknown' });
  });

  app.get('/api/sessions-count', (req, res) => {
    res.json({ count: listSessions().length });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('🌐 Sit la ap kouri sou pò ' + port));
}

module.exports = { launchSite };
