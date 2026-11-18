export default {
  layout: "layouts/publicacao.njk",
  secao: "Artigos",
  secaoUrl: "/artigos/",
  eleventyComputed: {
    permalink: (d) => (d.rascunho ? false : `/artigos/${d.page.fileSlug}/`),
  },
};
