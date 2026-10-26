const fs = require('fs');
const path = require('path');

module.exports = function (req, res) {
  const id = String(req.params.id || '');
  const uuid = id.replace(/^patron-/, '');
  const base = path.resolve(__dirname, '..', '..', '..', 'backend', 'uploads', 'patrones');

  const candidates = [id, uuid, 'patron-' + uuid.slice(0, 8)];

  for (const c of candidates) {
    if (!/^[a-zA-Z0-9-]+$/.test(c)) continue;
    const p = path.join(base, c, 'pagina_1.jpg');
    if (fs.existsSync(p)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(p);
    }
  }
  res.status(404).json({ error: 'Sin portada' });
};
