/**
 * Módulo de acesso aos dados do Hub de Links.
 *
 * Hoje os dados vêm de um arquivo JSON estático (data/links.json), que já
 * está no mesmo formato que o backend em Google Apps Script (veja
 * apps-script/Code.gs) devolve. Quando a planilha real da SRE estiver
 * pronta e publicada, basta trocar a constante URL_DADOS abaixo pela URL
 * do "Web app" implantado no Apps Script — nenhum outro arquivo precisa
 * mudar.
 */
const Dados = (function () {
  'use strict';

  // Passo a passo para trocar pela planilha real está no README.md.
  // Exemplo depois de implantar o Apps Script:
 const URL_DADOS = 'https://script.google.com/macros/s/AKfycbyJiNGurE-HaxxQnAR09UzP9VlP9G5KIVsyQJra1YHnrQLRB8HUoN3zMHID_kmjggaz/exec';
  

  let cache = null;

  async function carregar() {
    if (cache) {
      return cache;
    }

    const resposta = await fetch(URL_DADOS, { cache: 'no-store' });
    if (!resposta.ok) {
      throw new Error('Não foi possível carregar os links (HTTP ' + resposta.status + ')');
    }

    cache = await resposta.json();
    return cache;
  }

  return { carregar: carregar };
})();
