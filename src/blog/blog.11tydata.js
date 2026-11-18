export default {
  layout: "layouts/publicacao.njk",
  secao: "Blog",
  secaoUrl: "/blog/",
  eleventyComputed: {
    // O endereço mantém a data do nome do arquivo, porque há vários posts com o mesmo título
    permalink: (d) =>
      d.rascunho ? false : `/blog/${d.page.inputPath.split("/").pop().replace(/\.md$/, "")}/`,
  },
};
