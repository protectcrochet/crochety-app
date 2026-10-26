const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.resolve(__dirname, '..', '..', '..', 'database', 'crochetflix.sqlite');

function db() { return new sqlite3.Database(DB_PATH); }
function emailValido(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || ''); }
function hoy() { return new Date().toISOString().substring(0, 10); }
function ayer() { return new Date(Date.now() - 86400000).toISOString().substring(0, 10); }

// GET /api/monetizacion/puntos?email=  (check-in diario + estado)
exports.estado = (req, res) => {
  const email = String(req.query.email || '').toLowerCase().trim();
  if (!emailValido(email)) return res.status(400).json({ error: 'Email invalido' });
  const d = db();
  d.get('SELECT * FROM puntos WHERE email = ?', [email], (err, row) => {
    if (err) { d.close(); return res.status(500).json({ error: 'Error' }); }
    if (!row) {
      // Usuario nuevo: crear con bienvenida
      d.run('INSERT INTO puntos (email, puntos, racha, ultima_visita) VALUES (?, 20, 1, ?)', [email, hoy()], () => {
        d.run("INSERT INTO puntos_log (email, cantidad, motivo) VALUES (?, 20, 'bienvenida')", [email]);
        d.close();
        res.json({ puntos: 20, racha: 1, checkin_hoy: true, bonus: 'bienvenida' });
      });
      return;
    }
    if (row.ultima_visita === hoy()) {
      d.close();
      return res.json({ puntos: row.puntos, racha: row.racha, checkin_hoy: false });
    }
    // Check-in: racha continua si vino ayer
    const nuevaRacha = row.ultima_visita === ayer() ? row.racha + 1 : 1;
    let bonus = 10;
    let motivo = 'checkin';
    if (nuevaRacha % 7 === 0) { bonus = 60; motivo = 'checkin_semanal'; }
    const total = row.puntos + bonus;
    d.run('UPDATE puntos SET puntos = ?, racha = ?, ultima_visita = ? WHERE email = ?', [total, nuevaRacha, hoy(), email], () => {
      d.run('INSERT INTO puntos_log (email, cantidad, motivo) VALUES (?, ?, ?)', [email, bonus, motivo]);
      d.close();
      res.json({ puntos: total, racha: nuevaRacha, checkin_hoy: true, bonus });
    });
  });
};

// POST /api/monetizacion/puntos/ganar {email, cantidad, motivo}
exports.ganar = (req, res) => {
  const { email, cantidad, motivo } = req.body || {};
  const cant = Math.min(Math.max(parseInt(cantidad) || 0, 0), 500);
  if (!emailValido(email) || cant <= 0) return res.status(400).json({ error: 'Datos invalidos' });
  const em = String(email).toLowerCase().trim();
  const d = db();
  d.get('SELECT puntos FROM puntos WHERE email = ?', [em], (err, row) => {
    if (err) { d.close(); return res.status(500).json({ error: 'Error' }); }
    if (!row) {
      d.run('INSERT INTO puntos (email, puntos, racha, ultima_visita) VALUES (?, ?, 1, ?)', [em, cant, hoy()], () => {
        d.run('INSERT INTO puntos_log (email, cantidad, motivo) VALUES (?, ?, ?)', [em, cant, motivo || 'ganar']);
        d.close();
        res.json({ ok: true, puntos: cant });
      });
      return;
    }
    const total = row.puntos + cant;
    d.run('UPDATE puntos SET puntos = ? WHERE email = ?', [total, em], () => {
      d.run('INSERT INTO puntos_log (email, cantidad, motivo) VALUES (?, ?, ?)', [em, cant, motivo || 'ganar']);
      d.close();
      res.json({ ok: true, puntos: total });
    });
  });
};
