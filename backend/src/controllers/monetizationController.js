const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.resolve(__dirname, '..', '..', '..', 'database', 'crochetflix.sqlite');

function db() { return new sqlite3.Database(DB_PATH); }

const CPX_SECRET = process.env.CPX_POSTBACK_SECRET || '';

function emailValido(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || ''); }

function sqliteFecha(mins) {
  const d = new Date(Date.now() + mins * 60000);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

// POST /api/monetizacion/email {email, origen}
exports.capturarEmail = (req, res) => {
  const { email, origen } = req.body || {};
  if (!emailValido(email)) return res.status(400).json({ error: 'Email invalido' });
  const d = db();
  d.run('INSERT INTO emails (email, origen) VALUES (?, ?)',
    [email.toLowerCase().trim(), origen || 'desbloqueo'], function (err) {
      d.close();
      if (err) return res.status(500).json({ error: 'Error guardando email' });
      res.json({ ok: true, id: this.lastID });
    });
};

// POST /api/monetizacion/desbloqueo {patron_id, email, minutos}
exports.crearDesbloqueo = (req, res) => {
  const { patron_id, email, minutos } = req.body || {};
  if (!patron_id || !emailValido(email)) return res.status(400).json({ error: 'Datos invalidos' });
  const mins = Math.min(Math.max(parseInt(minutos) || 120, 15), 1440);
  const expira = sqliteFecha(mins);
  const d = db();
  d.run('INSERT INTO desbloqueos (patron_id, email, fuente, expira_en) VALUES (?, ?, ?, ?)',
    [patron_id, email.toLowerCase().trim(), 'video', expira], function (err) {
      d.close();
      if (err) return res.status(500).json({ error: 'Error creando desbloqueo' });
      res.json({ ok: true, expira_en: expira, minutos: mins });
    });
};

// GET /api/monetizacion/desbloqueo/:patronId?email=
exports.verificarDesbloqueo = (req, res) => {
  const patronId = req.params.patronId;
  const email = req.query.email;
  if (!emailValido(email)) return res.status(400).json({ error: 'Email requerido' });
  const d = db();
  d.get(
    "SELECT expira_en FROM desbloqueos WHERE patron_id = ? AND email = ? AND expira_en > datetime('now') ORDER BY expira_en DESC LIMIT 1",
    [patronId, String(email).toLowerCase().trim()],
    (err, row) => {
      d.close();
      if (err) return res.status(500).json({ error: 'Error' });
      res.json({ desbloqueado: !!row, expira_en: row ? row.expira_en : null });
    });
};

// GET /api/monetizacion/postback/cpx (CPX llama aqui al completar encuesta)
exports.postbackCPX = (req, res) => {
  const q = req.query;
  const user = String(q.user_id || q.email || '');
  const patron = String(q.patron_id || '');
  const hash = String(q.hash || '');
  const esperado = crypto.createHash('sha256').update(user + CPX_SECRET).digest('hex');
  if (CPX_SECRET && hash !== esperado) return res.status(403).json({ error: 'Hash invalido' });
  if (!emailValido(user) || !patron) return res.status(400).json({ error: 'Params invalidos' });
  const expira = sqliteFecha(24 * 60);
  const d = db();
  d.run('INSERT INTO desbloqueos (patron_id, email, fuente, expira_en) VALUES (?, ?, ?, ?)',
    [patron, user.toLowerCase().trim(), 'encuesta', expira], (err) => {
      d.close();
      if (err) return res.status(500).json({ error: 'Error' });
      res.send('OK');
    });
};

// GET /api/monetizacion/click?patron_id=&tipo=
exports.registrarClick = (req, res) => {
  const d = db();
  d.run('INSERT INTO clicks_afiliados (patron_id, tipo) VALUES (?, ?)',
    [req.query.patron_id || null, req.query.tipo || 'amazon'], () => {
      d.close();
      res.json({ ok: true });
    });
};
