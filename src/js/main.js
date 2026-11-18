const normalizar = (texto = "") =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ===== Menu do celular =====
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("menu");

function setMenu(aberto) {
  nav.classList.toggle("is-open", aberto);
  toggle.setAttribute("aria-expanded", String(aberto));
  toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
}
toggle?.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// ===== Busca nas cadeiras =====
const buscaCadeiras = document.getElementById("busca-cadeiras");
if (buscaCadeiras) {
  const cadeiras = [...document.querySelectorAll("#lista-cadeiras .chair")];
  const vazio = document.getElementById("sem-resultados");
  cadeiras.forEach((c) => (c.dataset.busca = normalizar(c.textContent)));

  buscaCadeiras.addEventListener("input", () => {
    const termo = normalizar(buscaCadeiras.value.trim());
    let visiveis = 0;
    cadeiras.forEach((c) => {
      c.hidden = !c.dataset.busca.includes(termo);
      if (!c.hidden) visiveis++;
    });
    vazio.hidden = visiveis > 0;
  });
}

// ===== Filtro por categoria nas listas =====
document.querySelectorAll(".filters").forEach((grupo) => {
  const itens = [...document.querySelectorAll("#lista-publicacoes > [data-categoria]")];
  grupo.addEventListener("click", (ev) => {
    const botao = ev.target.closest(".filter");
    if (!botao) return;
    grupo.querySelectorAll(".filter").forEach((b) => b.classList.toggle("is-active", b === botao));
    const filtro = botao.dataset.filtro;
    itens.forEach((i) => (i.hidden = filtro && i.dataset.categoria !== filtro));
  });
});

// ===== Compartilhar =====
const aqui = encodeURIComponent(location.href);
document.querySelectorAll("[data-share]").forEach((el) => {
  const tipo = el.dataset.share;
  if (tipo === "whatsapp") el.href += aqui;
  if (tipo === "facebook" || tipo === "linkedin") el.href += aqui;
  if (tipo === "copiar") {
    el.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        el.textContent = "Link copiado!";
      } catch {
        el.textContent = location.href;
      }
    });
  }
});

// ===== Busca no site =====
const buscaSite = document.getElementById("busca-site");
if (buscaSite) {
  const resultados = document.getElementById("busca-resultados");
  const status = document.getElementById("busca-status");
  let indice = [];

  const escapar = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  function trecho(texto, termo) {
    const pos = normalizar(texto).indexOf(termo);
    if (pos < 0) return texto.slice(0, 160) + (texto.length > 160 ? "…" : "");
    const inicio = Math.max(0, pos - 60);
    return (inicio > 0 ? "…" : "") + texto.slice(inicio, pos + 120) + "…";
  }

  function buscar() {
    const termo = normalizar(buscaSite.value.trim());
    history.replaceState(null, "", termo ? `?q=${encodeURIComponent(buscaSite.value.trim())}` : location.pathname);
    if (termo.length < 2) {
      resultados.innerHTML = "";
      status.textContent = "Digite pelo menos duas letras.";
      return;
    }
    const achados = indice.filter((i) => normalizar(`${i.titulo} ${i.autor} ${i.texto}`).includes(termo));
    status.textContent = achados.length
      ? `${achados.length} resultado${achados.length > 1 ? "s" : ""}`
      : "Nenhum resultado encontrado.";
    resultados.innerHTML = achados
      .slice(0, 50)
      .map(
        (i) => `<li>
          <p class="eyebrow">${escapar(i.secao)}${i.data ? " · " + escapar(i.data) : ""}</p>
          <h3><a href="${base}${i.url.replace(/^\//, "")}">${escapar(i.titulo)}</a></h3>
          <p>${escapar(trecho(i.texto, termo))}</p>
        </li>`
      )
      .join("");
  }

  // Endereço do índice (já com o prefixo da subpasta, quando houver)
  const enderecoIndice = document.querySelector('link[rel="search-index"]').href;
  const base = new URL(".", enderecoIndice).pathname;

  fetch(enderecoIndice)
    .then((r) => r.json())
    .then((dados) => {
      indice = dados;
      const q = new URLSearchParams(location.search).get("q");
      if (q) buscaSite.value = q;
      buscar();
    })
    .catch(() => (status.textContent = "Não foi possível carregar a busca."));

  buscaSite.addEventListener("input", buscar);
}

// ===== Formulário de contato (abre o app de e-mail do visitante) =====
const form = document.getElementById("contact-form");
form?.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const d = new FormData(form);
  const assunto = `Contato pelo site: ${d.get("assunto")}`;
  const corpo = `Nome: ${d.get("nome")}\nE-mail: ${d.get("email")}\n\n${d.get("mensagem")}`;
  location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
});

// ===== Imagens quebradas nos textos importados =====
// Muitas fotos antigas do blog estavam no Facebook e não existem mais: remove o espaço vazio.
document.querySelectorAll(".post__body img").forEach((img) => {
  const remover = () => {
    const pai = img.parentElement;
    img.remove();
    if (pai && pai !== img.closest(".post__body") && !pai.textContent.trim() && !pai.querySelector("img")) pai.remove();
  };
  if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) remover();
  else img.addEventListener("error", remover);
});

// ===== Quebras de linha sobrando nos textos importados =====
const ehVazio = (n) => n && n.nodeType === 3 && !n.textContent.trim();
document.querySelectorAll(".post__body br").forEach((br) => {
  let prox = br.nextSibling;
  while (ehVazio(prox)) prox = prox.nextSibling;
  let ant = br.previousSibling;
  while (ehVazio(ant)) ant = ant.previousSibling;
  // remove <br> repetido, no início ou no fim de um bloco
  if (!prox || !ant || prox.nodeName === "BR" || /^(DIV|P|UL|OL|H\d|TABLE|BLOCKQUOTE)$/.test(prox.nodeName)) br.remove();
});
document.querySelectorAll(".post__body div, .post__body p").forEach((el) => {
  if (!el.textContent.trim() && !el.querySelector("img, iframe, video, table")) el.remove();
});

// ===== Ano no rodapé =====
const ano = document.getElementById("year");
if (ano) ano.textContent = new Date().getFullYear();
