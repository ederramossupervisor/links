# Hub de Links — SRE Afonso Cláudio

PWA de página única com um botão para cada setor da SRE Afonso Cláudio. Cada botão abre um modal com os links daquele setor. Identidade visual baseada nas cores da bandeira do Espírito Santo (azul, branco e rosa) e no lema "Trabalha e Confia".

## Funcionalidades

- Busca em tempo real (por setor ou por nome de link, sem diferenciar acentos)
- Quando a busca aponta para um sub-setor específico (ex.: "Escolas Municipais"), o modal já abre direto na aba certa
- **Acesso rápido**: até 5 botões de link fixos acima da grade, comuns a todos os setores (ex.: Agenda, Portal do Servidor, Edocs)
- Aviso amigável quando o link clicado ainda é fictício
- Instalável como app (PWA) no celular ou computador, com ícone e tela cheia
- Funciona offline para a navegação básica (o conteúdo dos links sempre busca a versão mais recente)

## Estrutura do projeto

```
hub-links-sre/
├── index.html            página principal
├── manifest.json         configuração do PWA (nome, cores, ícones)
├── service-worker.js     cache para funcionar offline/instalado
├── css/
│   └── style.css         cores, tipografia, layout
├── js/
│   ├── dados.js          carrega os links (hoje: data/links.json)
│   └── app.js            renderiza os cartões, a busca e o modal
├── data/
│   └── links.json        links de exemplo — editar aqui por enquanto
├── icons/                ícones do PWA (192px, 512px, favicon e um .svg editável)
└── apps-script/
    └── Code.gs           backend opcional em Google Apps Script, para
                           quando os links vierem de uma planilha real
```

## Setores já configurados

Supervisão Escolar (com Escolas Estaduais e Escolas Municipais), Programas e Projetos, Gestão Escolar, Prestação de Contas, Protocolo, Transporte Escolar, Busca Ativa Escolar, Nutrição e Merenda Escolar, Apoie, Neapie, RH, Escolas Extintas e TI — todos já no `data/links.json`, cada um com 2 a 3 links de exemplo.

## Como testar localmente

Como o app usa `fetch` e service worker, abrir o `index.html` direto no navegador (com `file://`) não funciona bem. Rode um servidor simples dentro da pasta do projeto:

```
cd hub-links-sre
python3 -m http.server 8000
```

E abra `http://localhost:8000` no navegador.

## Como editar os links agora (fase de levantamento)

Enquanto o levantamento com a SRE não fica pronto, edite direto o arquivo `data/links.json`. Cada setor segue este formato:

```json
{
  "id": "rh",
  "nome": "RH (Recursos Humanos)",
  "icone": "bi-person-badge-fill",
  "links": [
    { "nome": "Nome do sistema ou página", "url": "https://endereco-real.com" }
  ]
}
```

O setor "Supervisão Escolar" é o único com sub-setores (por isso usa `"subsetores"` em vez de `"links"` direto — veja o exemplo já no arquivo). Os ícones são classes do [Bootstrap Icons](https://icons.getbootstrap.com/) (ex.: `bi-bus-front-fill`).

Os botões de **Acesso rápido** (comuns a todos os setores) ficam à parte, no array `"linksComuns"` no topo do arquivo — cada um com seu próprio ícone:

```json
{ "nome": "Portal do Servidor", "url": "https://endereco-real.com", "icone": "bi-person-workspace" }
```

Na planilha, a mesma ideia vale usando `SetorId = "comuns"` nessas linhas (veja o cabeçalho de `apps-script/Code.gs`).

Links com `"url": "#"` são os fictícios de exemplo: ao clicar, aparece um aviso em vez de abrir algo. Basta trocar o `"#"` pela URL real que o aviso some sozinho.

## Como conectar a planilha real (quando o levantamento estiver pronto)

1. Crie uma planilha no Google Sheets com uma aba chamada **Links** e as colunas descritas no topo de `apps-script/Code.gs`.
2. Copie o conteúdo de `apps-script/Code.gs` para o editor de Apps Script dessa planilha (Extensões > Apps Script).
3. Implante como "App da Web" — o passo a passo completo está nos comentários do próprio arquivo.
4. Em `js/dados.js`, troque a constante `URL_DADOS` pela URL do App da Web gerada. Nenhum outro arquivo do projeto precisa mudar, porque o JSON devolvido pelo Apps Script segue o mesmo formato do `links.json`.

## Como publicar

O mais simples é o GitHub Pages: suba esta pasta para um repositório e ative o Pages nas configurações (branch principal, pasta raiz).

## Personalização

- Cores, fontes e espaçamentos: variáveis no topo de `css/style.css` (bloco `:root`).
- Ícone do app: `icons/icone.svg` é a versão vetorial editável. Depois de editar, gere de novo os `.png` (192px, 512px e o favicon de 32px) — qualquer editor de imagem ou site de conversão SVG→PNG resolve.
