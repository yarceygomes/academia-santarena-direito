export default {
  layout: "layouts/publicacao.njk",
  secao: "Notícias",
  secaoUrl: "/noticias/",
  eleventyComputed: {
    permalink: (d) => (d.rascunho ? false : `/noticias/${d.page.fileSlug}/`),
  },
};
