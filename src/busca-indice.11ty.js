// Gera /busca.json, usado pela página de busca.
const semHtml = (html = "") => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const dataBR = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const data = {
  permalink: "/busca.json",
  eleventyExcludeFromCollections: true,
};

export async function render({ collections, cadeiras }) {
  const secoes = { noticias: "Notícias", artigos: "Artigos", blog: "Blog", eventos: "Agenda" };
  const itens = [];

  for (const [chave, nome] of Object.entries(secoes)) {
    for (const p of collections[chave] || []) {
      itens.push({
        titulo: p.data.title,
        url: p.url,
        secao: nome,
        data: dataBR.format(p.date),
        autor: p.data.autor || "",
        // Posts importados são muitos: guarda só o começo do texto para o índice não ficar pesado
        texto: semHtml(await p.templateContent).slice(0, p.data.importado ? 400 : 4000),
      });
    }
  }

  for (const c of cadeiras.cadeiras) {
    itens.push({
      titulo: `Cadeira nº ${c.numero}: ${c.patrono}`,
      url: `/cadeiras/#cadeira-${c.numero}`,
      secao: "Cadeiras",
      data: "",
      autor: c.ocupante,
      texto: `Patrono ${c.patrono}. Acadêmico ${c.ocupante}.`,
    });
  }

  return JSON.stringify(itens);
}
