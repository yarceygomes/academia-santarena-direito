export default {
  layout: "layouts/publicacao.njk",
  secao: "Blog",
  secaoUrl: "/blog/",
  eleventyComputed: {
    permalink: (d) => (d.rascunho ? false : `/blog/${d.page.fileSlug}/`),
  },
};
