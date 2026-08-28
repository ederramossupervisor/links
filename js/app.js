/**
 * Hub de Links — SRE Afonso Cláudio
 * Renderização dos cartões de setor, busca e modal com os links.
 */
const App = (function () {
  'use strict';

  let setores = [];
  let modalSetor = null;
  const subsetorAtivoPorSetor = {};

  const el = {};

  function init(dadosCarregados) {
    setores = dadosCarregados.setores || [];

    el.grade = document.getElementById('grade-setores');
    el.busca = document.getElementById('busca-input');
    el.modalTitulo = document.getElementById('modalSetorTitulo');
    el.modalCorpo = document.getElementById('modalSetorCorpo');

    modalSetor = new bootstrap.Modal(document.getElementById('modalSetor'));

    renderizarLinksComuns(dadosCarregados.linksComuns || []);
    renderizarGrade(setores);
    el.busca.addEventListener('input', aoDigitarBusca);
  }

  // remove acentos para a busca não depender de o usuário digitá-los
  function normalizar(texto) {
    return (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function contarLinks(setor) {
    if (setor.subsetores) {
      return setor.subsetores.reduce(function (soma, sub) {
        return soma + sub.links.length;
      }, 0);
    }
    return (setor.links || []).length;
  }

  function renderizarLinksComuns(links) {
    const container = document.getElementById('links-comuns');
    if (!container) return;

    container.innerHTML = links
      .map(function (link) {
        const pendente = !link.url || link.url === '#';
        const classes = 'link-comum link-item' + (pendente ? ' pendente' : '');
        return (
          '<a href="' + link.url + '" class="' + classes + '" target="_blank" rel="noopener" data-url="' + link.url + '">' +
          '<i class="bi ' + (link.icone || 'bi-link-45deg') + '"></i>' +
          '<span>' + link.nome + '</span>' +
          '</a>'
        );
      })
      .join('');

    ativarCliquesDeLinks(container);
  }

  function renderizarGrade(lista) {
    el.grade.innerHTML = '';

    if (lista.length === 0) {
      el.grade.innerHTML =
        '<p class="sem-resultados">Nenhum setor encontrado para essa busca.</p>';
      return;
    }

    lista.forEach(function (setor) {
      const total = contarLinks(setor);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'setor-card';
      card.setAttribute('aria-haspopup', 'dialog');
      card.innerHTML =
        '<span class="setor-card__icone"><i class="bi ' + setor.icone + '"></i></span>' +
        '<span class="setor-card__nome">' + setor.nome + '</span>' +
        '<span class="setor-card__contagem">' + total + ' link' + (total === 1 ? '' : 's') + '</span>';
      card.addEventListener('click', function () {
        abrirSetor(setor);
      });
      el.grade.appendChild(card);
    });
  }

  function abrirSetor(setor) {
    el.modalTitulo.innerHTML =
      '<span class="setor-card__icone"><i class="bi ' + setor.icone + '"></i></span>' +
      '<span>' + setor.nome + '</span>';

    if (setor.subsetores) {
      // se o usuário chegou aqui buscando algo, abre direto na aba certa
      const termo = normalizar(el.busca.value.trim());
      if (termo) {
        const correspondente = setor.subsetores.find(function (sub) {
          return (
            normalizar(sub.nome).includes(termo) ||
            sub.links.some(function (link) { return normalizar(link.nome).includes(termo); })
          );
        });
        if (correspondente) {
          subsetorAtivoPorSetor[setor.id] = correspondente.id;
        }
      }
      renderizarComSubsetores(setor);
    } else {
      el.modalCorpo.innerHTML = montarListaLinks(setor.links);
      ativarCliquesDeLinks(el.modalCorpo);
    }

    modalSetor.show();
  }

  function renderizarComSubsetores(setor) {
    const ativoId = subsetorAtivoPorSetor[setor.id] || setor.subsetores[0].id;
    const subsetorAtivo = setor.subsetores.find(function (sub) {
      return sub.id === ativoId;
    }) || setor.subsetores[0];

    const abas = setor.subsetores
      .map(function (sub) {
        const classeAtiva = sub.id === subsetorAtivo.id ? ' ativa' : '';
        return (
          '<button type="button" class="subsetor-aba' + classeAtiva + '" data-subsetor="' + sub.id + '">' +
          sub.nome +
          '</button>'
        );
      })
      .join('');

    el.modalCorpo.innerHTML =
      '<div class="subsetor-abas">' + abas + '</div>' + montarListaLinks(subsetorAtivo.links);

    ativarCliquesDeLinks(el.modalCorpo);

    el.modalCorpo.querySelectorAll('.subsetor-aba').forEach(function (botao) {
      botao.addEventListener('click', function () {
        subsetorAtivoPorSetor[setor.id] = botao.dataset.subsetor;
        renderizarComSubsetores(setor);
      });
    });
  }

  function montarListaLinks(links) {
    if (!links || links.length === 0) {
      return '<p class="sem-resultados">Ainda não há links cadastrados aqui.</p>';
    }
    return (
      '<div class="lista-links">' +
      links
        .map(function (link) {
          return (
            '<a href="' + link.url + '" class="link-item" target="_blank" rel="noopener" data-url="' + link.url + '">' +
            '<i class="bi bi-link-45deg link-item__icone"></i>' +
            '<span>' + link.nome + '</span>' +
            '<i class="bi bi-box-arrow-up-right"></i>' +
            '</a>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function ativarCliquesDeLinks(container) {
    container.querySelectorAll('.link-item').forEach(function (item) {
      item.addEventListener('click', function (evento) {
        const url = item.dataset.url;
        if (!url || url === '#') {
          evento.preventDefault();
          mostrarAvisoExemplo();
        }
      });
    });
  }

  function mostrarAvisoExemplo() {
    const toastEl = document.getElementById('toastExemplo');
    if (!toastEl) return;
    bootstrap.Toast.getOrCreateInstance(toastEl).show();
  }

  function aoDigitarBusca() {
    const termo = normalizar(el.busca.value.trim());

    if (!termo) {
      renderizarGrade(setores);
      return;
    }

    const filtrados = setores.filter(function (setor) {
      if (normalizar(setor.nome).includes(termo)) return true;

      if (setor.subsetores) {
        return setor.subsetores.some(function (sub) {
          return (
            normalizar(sub.nome).includes(termo) ||
            sub.links.some(function (link) { return normalizar(link.nome).includes(termo); })
          );
        });
      }

      return (setor.links || []).some(function (link) {
        return normalizar(link.nome).includes(termo);
      });
    });

    renderizarGrade(filtrados);
  }

  return { init: init };
})();
