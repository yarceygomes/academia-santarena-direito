// Configuração do Eleventy: transforma os arquivos de src/ no site pronto em _site/.
import markdownIt from "markdown-it";
import { HtmlBasePlugin } from "@11ty/eleventy";

const meses = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// Itens publicados (sem rascunho), do mais novo para o mais antigo
const publicados = (api, pasta) =>
  api
    .getFilteredByGlob(`src/${pasta}/*.md`)
    .filter((item) => !item.data.rascunho)
    .sort((a, b) => b.date - a.date);

const semHtml = (html = "") => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const md = markdownIt({ html: true, linkify: true });

export default function (eleventyConfig) {
  eleventyConfig.addFilter("markdown", (texto = "") => md.render(texto));

  // Remove dos posts importados as imagens hospedadas nos servidores antigos do Facebook,
  // que já não existem e deixariam ícones de imagem quebrada.
  const imagemMorta = /<img[^>]+src="https?:\/\/[^"]*(fbcdn|akamaihd|fbsbx)[^"]*"[^>]*>/gi;
  eleventyConfig.addTransform("imagens-mortas", function (conteudo) {
    if (this.page.outputPath?.endsWith(".html") && this.page.url?.startsWith("/blog/")) {
      return conteudo.replace(imagemMorta, "");
    }
    return conteudo;
  });

  // Corrige os links quando o site é publicado numa subpasta (ex.: GitHub Pages)
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // O painel /admin é copiado como está, sem passar pelos modelos
  eleventyConfig.ignores.add("src/admin/**");
  eleventyConfig.addPassthroughCopy({
    "src/css": "css",
    "src/js": "js",
    "src/img": "img",
    "src/admin": "admin",
  });

  // Coleções editadas pelo painel /admin
  eleventyConfig.addCollection("noticias", (api) => publicados(api, "noticias"));
  eleventyConfig.addCollection("artigos", (api) => publicados(api, "artigos"));
  eleventyConfig.addCollection("blog", (api) => publicados(api, "blog"));
  eleventyConfig.addCollection("eventos", (api) =>
    api
      .getFilteredByGlob("src/agenda/*.md")
      .filter((item) => !item.data.rascunho)
      .sort((a, b) => a.date - b.date)
  );

  // Filtros usados nos modelos
  eleventyConfig.addFilter("dataBR", (data) => meses.format(new Date(data)));
  eleventyConfig.addFilter("dia", (data) => String(new Date(data).getUTCDate()).padStart(2, "0"));
  eleventyConfig.addFilter("mesCurto", (data) =>
    new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" })
      .format(new Date(data))
      .replace(".", "")
  );
  eleventyConfig.addFilter("dataISO", (data) => new Date(data).toISOString().slice(0, 10));
  eleventyConfig.addFilter("limite", (lista = [], n) => lista.slice(0, n));
  eleventyConfig.addFilter("futuros", (lista = []) => {
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);
    return lista.filter((e) => e.date >= hoje);
  });
  eleventyConfig.addFilter("passados", (lista = []) => {
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);
    return lista.filter((e) => e.date < hoje).reverse();
  });
  eleventyConfig.addFilter("resumo", (html, tamanho = 180) => {
    const texto = semHtml(html);
    return texto.length > tamanho ? texto.slice(0, tamanho).replace(/\s\S*$/, "") + "…" : texto;
  });
  eleventyConfig.addFilter("tempoLeitura", (html) =>
    Math.max(1, Math.round(semHtml(html).split(" ").length / 200))
  );
  eleventyConfig.addFilter("semHtml", semHtml);
  eleventyConfig.addFilter("categorias", (lista = []) => [
    ...new Set(lista.map((item) => item.data.categoria).filter(Boolean)),
  ]);
  eleventyConfig.addFilter("json", (valor) => JSON.stringify(valor));
  eleventyConfig.addFilter("iniciais", (nome = "") =>
    nome
      .replace(/^(Dr|Dra|Des|Prof|Profa)\.?\s+/i, "")
      .split(/\s+/)
      .filter((p) => p.length > 2)
      .map((p) => p[0])
      .filter((_, i, arr) => i === 0 || i === arr.length - 1)
      .join("")
      .toUpperCase()
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
