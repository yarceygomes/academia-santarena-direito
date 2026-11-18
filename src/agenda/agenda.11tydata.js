export default {
  layout: "layouts/publicacao.njk",
  secao: "Agenda",
  secaoUrl: "/agenda/",
  eleventyComputed: {
    permalink: (d) => (d.rascunho ? false : `/agenda/${d.page.fileSlug}/`),
  },
};
