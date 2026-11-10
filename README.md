# PUXA

Baixe vídeo e áudio do YouTube, TikTok, Instagram e de mais 20 plataformas, corte o trecho que quiser e edite tudo no navegador. É um arquivo HTML só: nada para instalar e nenhum arquivo passa por servidor nosso.

**Acesse:** https://voidsilva.github.io/Puxe/

![PUXA no computador](docs/desktop.jpg)

<p align="center"><img src="docs/celular.jpg" width="300" alt="Editor de áudio do PUXA no celular"></p>

## O que dá pra fazer

**Baixar**

- Vídeo com som, só o áudio (MP3, WAV, OGG, OPUS ou o original) ou vídeo mudo
- Qualidade de 144p até 8K (quando a fonte tem), kbps do áudio e codec do YouTube
- Cortar o trecho já no download
- Vários links de uma vez, com fila e barra de progresso
- Galeria para posts com várias fotos e vídeos (carrossel do Instagram, fotos do TikTok)
- Capas do YouTube em HD
- Histórico salvo no próprio navegador

**Editor de áudio**

- Forma de onda com zoom (roda do mouse no PC, pinça no celular)
- Cortar, apagar, silenciar, copiar e colar, fade in e out, normalizar, ±3 dB, inverter, mono e aparar silêncio
- Desfazer e refazer
- Efeitos com prévia ao vivo: slowed + reverb, sped up, nightcore, grave pesado, 8D e rádio antigo
- Exporta em MP3 (até 320 kbps) ou WAV, com atalho para toque de celular de 30 s
- Grava pelo microfone

**Editor de vídeo**

- Linha do tempo com miniaturas para marcar início e fim
- Vertical 9:16 para Reels e TikTok (cortando as laterais ou com fundo desfocado) e quadrado 1:1
- Velocidade, resolução e FPS ajustáveis, exportando em MP4 ou WebM
- Cria GIF, extrai o áudio e salva frame em PNG

**yt-dlp**

- Monta o comando pronto para playlists, canais inteiros, legendas, SponsorBlock e cookies do navegador

## Como funciona

O navegador não deixa um site baixar direto do YouTube ou do Instagram. Por isso o PUXA conversa com uma instância do [cobalt](https://github.com/imputnet/cobalt), um projeto de código aberto que busca o arquivo e devolve para cá. As instâncias públicas exigem autenticação, então o jeito é rodar a sua (leva dois minutos).

Todo o resto roda no seu aparelho, sem instância nenhuma: editor de áudio, editor de vídeo, GIF, conversão para MP3 e o gerador do yt-dlp.

## Subindo sua instância do cobalt

Com o [Docker](https://www.docker.com/products/docker-desktop/) instalado:

```bash
docker run -d --name cobalt --restart unless-stopped \
  -p 9000:9000 \
  -e API_URL=http://localhost:9000/ \
  ghcr.io/imputnet/cobalt:latest
```

Depois abra o PUXA, vá em **Config**, deixe `http://localhost:9000` na lista e clique em **Testar instâncias**.

Alguns detalhes que fazem diferença:

- **Site publicado (HTTPS):** o navegador só aceita `http://localhost` ou instâncias com `https://`. Se ele perguntar sobre acesso à rede local, permita.
- **No celular:** exponha a instância com HTTPS (Cloudflare Tunnel, por exemplo) e use esse endereço no `API_URL` e na Config.
- **YouTube:** às vezes ele pede login para a instância. Nesse caso, configure cookies seguindo a [documentação do cobalt](https://github.com/imputnet/cobalt/blob/main/docs/run-an-instance.md).
- **Sem instância:** quando um download falha, o PUXA oferece abrir o link no cobalt.tools ou gerar o comando do yt-dlp.

## Usando sem internet

Baixe o `index.html` e abra no navegador. Funciona melhor no Chrome, Edge e Firefox. No Safari (iPhone incluso) também roda, mas a exportação de vídeo depende do suporte do aparelho ao MediaRecorder. A única coisa que precisa de internet é a primeira exportação em MP3, que carrega o codificador.

## Atalhos

| Onde            | Tecla                                 | O que faz                                 |
| --------------- | ------------------------------------- | ----------------------------------------- |
| Qualquer aba    | `Ctrl` + `V`                          | Cola o link e já começa a baixar          |
| Editor de áudio | `Espaço`                              | Toca e pausa                              |
|                 | `Del`                                 | Apaga a seleção                           |
|                 | `Ctrl` + `Z` / `Ctrl` + `Shift` + `Z` | Desfaz e refaz                            |
|                 | `Ctrl` + `A`                          | Seleciona tudo                            |
|                 | `L`                                   | Liga e desliga o loop                     |
|                 | `Esc`                                 | Limpa a seleção                           |
| Editor de vídeo | `Espaço`                              | Toca e pausa                              |
|                 | `I` / `O`                             | Marca o início e o fim                    |
|                 | `←` `→`                               | Volta e avança um quadro (`Shift`: 1 s)   |

## Por dentro

- Um arquivo só (`index.html`) com HTML, CSS e JavaScript puro. Sem framework e sem etapa de build.
- Sem fontes externas e sem animação rodando em segundo plano, para ficar leve no celular.
- Os efeitos usam a mesma cadeia da Web Audio API na prévia e na exportação (`OfflineAudioContext`).
- WAV e GIF são codificados no próprio código. O MP3 usa o [lamejs](https://github.com/zhuker/lamejs), carregado só quando alguém exporta em MP3.
- O vídeo é exportado com Canvas e `MediaRecorder`, em tempo real.
- Configurações e histórico ficam no `localStorage` do navegador.

## Aviso

Baixe só conteúdo que você tem direito de usar. O PUXA não hospeda nem guarda nenhum arquivo.
