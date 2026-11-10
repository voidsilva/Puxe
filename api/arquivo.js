// Repassa o arquivo guardado na Apify quando o link direto exige a chave.
// Só aceita endereços do armazenamento da Apify, para não virar um proxy aberto.
const { Readable } = require('stream');

module.exports = async (req, res) => {
  const origem = req.headers.origin || '';
  if (origem === 'https://voidsilva.github.io' || /^https:\/\/[\w-]+\.vercel\.app$/.test(origem)) {
    res.setHeader('Access-Control-Allow-Origin', origem);
  }
  const u = String(req.query.u || '');
  if (!/^https:\/\/api\.apify\.com\/v2\/key-value-stores\/[\w~-]+\/records\/[\w.~-]+$/.test(u)) {
    return res.status(400).end('Endereço não permitido.');
  }
  const r = await fetch(`${u}?token=${process.env.APIFY_TOKEN}`);
  if (!r.ok || !r.body) return res.status(r.status || 502).end();
  res.setHeader('Content-Type', r.headers.get('content-type') || 'application/octet-stream');
  const tamanho = r.headers.get('content-length');
  if (tamanho) res.setHeader('Content-Length', tamanho);
  Readable.fromWeb(r.body).pipe(res);
};
