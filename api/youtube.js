// Download do YouTube pela API paga (Apify, ator johnvc/youtube-download-api).
// O YouTube bloqueia servidores de nuvem, então o PUXA usa um serviço pago só para ele.
// A chave fica na variável APIFY_TOKEN da Vercel e nunca vai para o navegador.
//
// GET /api/youtube?url=<link>&formato=video|audio&qualidade=720
const ORIGENS = ['https://voidsilva.github.io'];
const ATOR = 'johnvc~youtube-download-api';

function liberarCors(req, res) {
  const origem = req.headers.origin || '';
  if (ORIGENS.includes(origem) || /^https:\/\/[\w-]+\.vercel\.app$/.test(origem)) {
    res.setHeader('Access-Control-Allow-Origin', origem);
    res.setHeader('Vary', 'Origin');
  }
}

module.exports = async (req, res) => {
  liberarCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = process.env.APIFY_TOKEN;
  if (!token) return res.status(500).json({ erro: 'Falta configurar a APIFY_TOKEN na Vercel.' });

  const { url = '', formato = 'video', qualidade = '720' } = req.query;
  if (!/^https?:\/\/([\w-]+\.)?(youtube\.com|youtu\.be)\//i.test(url)) {
    return res.status(400).json({ erro: 'Link do YouTube inválido.' });
  }

  // Até 720p por padrão: o arquivo fica bem menor e chega bem mais rápido.
  // Limite de 1080p e 60 minutos para a conta não estourar.
  const altura = Math.min(1080, parseInt(qualidade, 10) || 720);
  const entrada = {
    videoUrls: [url],
    format: formato === 'audio' ? 'audio' : 'video',
    quality: `${altura}p`,
    videoCodec: 'h264',
    audioFormat: 'mp3',
    maxMinutes: 60,
  };

  try {
    // memory=4096: mais CPU e rede para o robô da Apify, o que encurta o download.
    const resposta = await fetch(
      `https://api.apify.com/v2/acts/${ATOR}/run-sync-get-dataset-items?token=${token}&timeout=280&memory=4096`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entrada) }
    );
    if (!resposta.ok) {
      return res.status(502).json({ erro: `A API de download respondeu ${resposta.status}.` });
    }
    const itens = await resposta.json();
    const arquivo = itens.find(i => i.resultType === 'file');
    if (!arquivo) {
      const motivo = itens[0]?.error || itens[0]?.message || 'A API não devolveu o arquivo.';
      return res.status(502).json({ erro: String(motivo) });
    }
    const proxy = `/api/arquivo?u=${encodeURIComponent(arquivo.fileUrl)}`;
    res.json({ url: arquivo.fileUrl, proxy, nome: arquivo.fileKey, tamanho: arquivo.fileSizeBytes });
  } catch (e) {
    res.status(502).json({ erro: 'Não deu para falar com a API de download.' });
  }
};
