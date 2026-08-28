'use strict';

// Ao publicar uma atualização de verdade (não só os dados dos links),
// aumente esse número — é o que faz o service worker antigo ser substituído.
const CACHE_NAME = 'hub-links-sre-v1';

const ARQUIVOS_ESSENCIAIS = [
  './',
  './index.html',
  './css/style.css',
  './js/dados.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', function (evento) {
  evento.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(ARQUIVOS_ESSENCIAIS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function (evento) {
  evento.waitUntil(
    caches
      .keys()
      .then(function (nomes) {
        return Promise.all(
          nomes
            .filter(function (nome) {
              return nome !== CACHE_NAME;
            })
            .map(function (nome) {
              return caches.delete(nome);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function (evento) {
  const requisicao = evento.request;

  if (requisicao.method !== 'GET') {
    return;
  }

  // dados do hub (JSON de links, ou futuramente o endpoint do Apps Script):
  // sempre busca na rede, nunca serve uma versão antiga do cache
  if (requisicao.url.indexOf('/data/links.json') !== -1) {
    evento.respondWith(fetch(requisicao));
    return;
  }

  // app shell (HTML/CSS/JS/ícones): responde do cache na hora, e atualiza
  // o cache em segundo plano para a próxima visita
  evento.respondWith(
    caches.match(requisicao).then(function (respostaEmCache) {
      const buscaNaRede = fetch(requisicao)
        .then(function (respostaDaRede) {
          const mesmaOrigem = requisicao.url.indexOf(self.location.origin) === 0;
          if (respostaDaRede && respostaDaRede.ok && mesmaOrigem) {
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(requisicao, respostaDaRede.clone());
            });
          }
          return respostaDaRede;
        })
        .catch(function () {
          return respostaEmCache;
        });

      return respostaEmCache || buscaNaRede;
    })
  );
});
