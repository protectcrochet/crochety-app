const fs = require('fs');
const path = require('path');

module.exports = function (req, res) {
  const h = String(req.params.hash).toLowerCase();
  if (!/^[a-f0-9]{16,64}$/.test(h)) {
    return res.status(400).json({ error: 'Hash invalido' });
  }
  const dir = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(__dirname, '..', '..', '..', 'uploads', 'patrones');

  fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
    if (err) return res.status(500).json({ error: 'No se pudo leer uploads' });

    const match = entries.find(e =>
      e.isFile() &&
      e.name.toLowerCase().endsWith('.pdf') &&
      e.name.toLowerCase().startsWith(h)
    );

    if (!match) return res.status(404).json({ error: 'Archivo no encontrado' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');

    const stream = fs.createReadStream(path.join(dir, match.name));
    stream.on('error', () => {
      if (!res.headersSent) res.status(500).json({ error: 'Error leyendo el archivo' });
    });
    stream.pipe(res);
  });
};
