// Importa os posts do blog do Dr. José Ronaldo Dias Campos para a seção Blog do site.
//
// Uso:
//   node scripts/importar-blog.mjs            importa os posts que ainda não existem
//   node scripts/importar-blog.mjs --contar   só conta posts e imagens, sem gravar nada
//   node scripts/importar-blog.mjs --limite=50  importa só os 50 mais recentes
//
// Os textos são copiados na íntegra. As imagens são baixadas para src/img/blog/.
// Pode ser rodado de novo a qualquer momento: posts já importados são mantidos.

import { mkdir, writeFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const BLOG = "https://joseronaldodiascampos.blogspot.com";
const AUTOR = "José Ronaldo Dias Campos";
const PASTA_POSTS = "src/blog";
const PASTA_IMG = "src/img/blog";
const POR_PAGINA = 150;

const args = process.argv.slice(2);
const SO_CONTAR = args.includes("--contar");
const LIMITE = Number((args.find((a) => a.startsWith("--limite=")) || "").split("=")[1]) || Infinity;

const existe = (f) => access(f).then(() => true, () => false);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function buscarJson(url, tentativas = 4) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      if (i >= tentativas) throw e;
      await espera(1500 * i);
    }
  }
}

// 1. Lê todos os posts pelo feed público do Blogger
async function lerPosts() {
  const posts = [];
  for (let inicio = 1; posts.length < LIMITE; inicio += POR_PAGINA) {
    const url = `${BLOG}/feeds/posts/default?alt=json&max-results=${POR_PAGINA}&start-index=${inicio}`;
    const dados = await buscarJson(url);
    const entradas = dados.feed.entry || [];
    if (!entradas.length) break;
    for (const e of entradas) {
      posts.push({
        titulo: (e.title?.$t || "").trim() || "Sem título",
        data: e.published.$t,
        atualizado: e.updated?.$t,
        link: (e.link || []).find((l) => l.rel === "alternate")?.href || BLOG,
        marcadores: (e.category || []).map((c) => c.term),
        html: e.content?.$t || e.summary?.$t || "",
      });
    }
    process.stdout.write(`\rLidos ${posts.length} posts...`);
  }
  console.log();
  return posts.slice(0, LIMITE);
}

// 2. Nome do arquivo a partir do endereço original do post
function slugDe(post) {
  const base = post.link.split("/").pop().replace(/\.html$/, "");
  return base || post.titulo.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Imagens do Blogger: pede a versão de até 800 px no lado maior (cabe na coluna de texto)
function urlImagemGrande(url) {
  if (url.startsWith("//")) url = "https:" + url;
  return url
    .replace(/\/s\d+(-[a-z0-9-]+)?\//i, "/s800/")
    .replace(/=s\d+(-[a-z0-9-]+)?$/i, "=s800")
    .replace(/=w\d+-h\d+(-[a-z0-9-]+)?$/i, "=s800");
}

const ehImagemDoBlogger = (url) => /(blogger\.googleusercontent\.com|bp\.blogspot\.com|\.googleusercontent\.com)/i.test(url);

async function baixarImagem(url, ano) {
  const grande = urlImagemGrande(url);
  const hash = createHash("sha1").update(grande).digest("hex").slice(0, 16);
  const pasta = path.join(PASTA_IMG, ano);
  for (const ext of [".jpg", ".png", ".gif", ".webp"]) {
    if (await existe(path.join(pasta, hash + ext))) return `/img/blog/${ano}/${hash}${ext}`;
  }
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await fetch(grande);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const tipo = r.headers.get("content-type") || "";
      const ext = tipo.includes("png") ? ".png" : tipo.includes("gif") ? ".gif" : tipo.includes("webp") ? ".webp" : ".jpg";
      await mkdir(pasta, { recursive: true });
      await writeFile(path.join(pasta, hash + ext), Buffer.from(await r.arrayBuffer()));
      return `/img/blog/${ano}/${hash}${ext}`;
    } catch {
      await espera(1000 * i);
    }
  }
  return null; // mantém o endereço original se não conseguir baixar
}

// 3. Limpa o HTML do Blogger mantendo o texto e as imagens
async function prepararHtml(html, ano, stats) {
  let saida = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s(style|class|id|data-[\w-]+|border|imageanchor)="[^"]*"/gi, "")
    .replace(/<\/?(span|font|o:p)[^>]*>/gi, "")
    .replace(/&nbsp;/g, " ");

  // Imagens
  const srcs = [...new Set([...saida.matchAll(/<img[^>]+src="([^"]+)"/gi)].map((m) => m[1]))];
  for (const src of srcs) {
    stats.imagens++;
    if (SO_CONTAR || !ehImagemDoBlogger(src)) continue;
    const local = await baixarImagem(src, ano);
    if (local) saida = saida.split(src).join(local);
  }
  // Remove o link "ver imagem grande" que envolve as fotos do Blogger
  saida = saida.replace(/<a[^>]+href="[^"]+"[^>]*>\s*(<img[^>]+>)\s*<\/a>/gi, "$1");
  // Tira width/height das imagens para o CSS controlar o tamanho
  saida = saida.replace(/<img([^>]*?)\s(width|height)="[^"]*"/gi, "<img$1").replace(/<img([^>]*?)\s(width|height)="[^"]*"/gi, "<img$1");
  saida = saida.replace(/<img(?![^>]*loading=)/gi, '<img loading="lazy"');

  // Evita que linhas com recuo virem bloco de código no Markdown
  return saida
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const yaml = (t) => JSON.stringify(t); // string JSON também é YAML válido

async function main() {
  const posts = await lerPosts();
  const stats = { novos: 0, existentes: 0, imagens: 0 };
  const usados = new Set();

  for (const [i, post] of posts.entries()) {
    const dia = post.data.slice(0, 10);
    const ano = dia.slice(0, 4);
    let slug = slugDe(post);
    let nome = `${dia}-${slug}`;
    for (let n = 2; usados.has(nome); n++) nome = `${dia}-${slug}-${n}`;
    usados.add(nome);
    const arquivo = path.join(PASTA_POSTS, `${nome}.md`);

    if (await existe(arquivo)) {
      stats.existentes++;
      continue;
    }

    const corpo = await prepararHtml(post.html, ano, stats);
    if (SO_CONTAR) {
      stats.novos++;
      continue;
    }
    const capa = corpo.match(/<img[^>]+src="([^"]+)"/i)?.[1];

    const frente = [
      "---",
      `title: ${yaml(post.titulo)}`,
      `date: ${post.data}`,
      `autor: ${yaml(AUTOR)}`,
      `categoria: ${yaml(post.marcadores[0] || "Revista virtual")}`,
      capa ? `imagem: ${yaml(capa)}` : null,
      `original: ${yaml(post.link)}`,
      `importado: true`,
      `templateEngineOverride: md`,
      "---",
    ].filter(Boolean);

    await mkdir(PASTA_POSTS, { recursive: true });
    await writeFile(arquivo, frente.join("\n") + "\n\n" + corpo + "\n", "utf8");
    stats.novos++;
    process.stdout.write(`\rGravados ${stats.novos} de ${posts.length - stats.existentes}...`);
  }

  console.log(
    `\n${SO_CONTAR ? "[contagem] " : ""}Posts novos: ${stats.novos} · já existentes: ${stats.existentes} · imagens encontradas: ${stats.imagens}`
  );
}

main().catch((e) => {
  console.error("\nFalha na importação:", e.message);
  process.exit(1);
});
