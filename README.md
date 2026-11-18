# Academia Santarena de Direito

Site da Academia Santarena de Direito (ASD), Santarém, Pará.

Seções: início, A Academia (história, diretoria, hino, honorários), Cadeiras e patronos, Notícias, Artigos, Blog, Agenda, Galeria, Busca e Contato.

O site é gerado pelo [Eleventy](https://www.11ty.dev/) e tem um painel de edição ([Decap CMS](https://decapcms.org/)) em `/admin`, a **Área dos acadêmicos**. Cada publicação feita no painel vira um arquivo neste repositório. Depois disso, o site é reconstruído sozinho.

## Estrutura

```
src/
  _data/            Dados editáveis pelo painel (site, cadeiras, diretoria, galeria)
  _includes/        Modelos de página
  noticias/         Uma notícia por arquivo .md
  artigos/          Um artigo por arquivo .md
  blog/             Um post por arquivo .md
  agenda/           Um evento por arquivo .md
  admin/            Painel de edição (config.yml define os campos)
  css/ js/ img/     Estilos, scripts e imagens (img/uploads recebe as imagens do painel)
eleventy.config.js  Configuração do gerador
netlify.toml        Configuração de publicação no Netlify
```

## Publicar e editar pelo painel

1. Entre em `seusite/admin/` (ou clique em **Área dos acadêmicos** no rodapé).
2. Escolha Notícias, Artigos, Blog ou Agenda e clique em **+ Novo**.
3. Preencha título, data, texto e, se quiser, imagem de capa.
4. Para guardar sem publicar, ligue **Salvar como rascunho**.
5. Clique em **Publicar → Publicar agora**. O site atualiza em cerca de um minuto.

Em **Institucional** dá para editar contato, cadeiras, diretoria, hino, linha do tempo e galeria.

## Colocar o site no ar (Netlify, gratuito)

O repositório é privado, então o GitHub Pages gratuito não funciona. O Netlify publica repositórios privados de graça:

1. Crie uma conta em netlify.com entrando com a conta do GitHub.
2. Clique em **Add new site → Import from Git**, escolha este repositório e confirme. O `netlify.toml` já tem o comando de build.
3. Para o painel funcionar no ar, crie um OAuth App no GitHub (Settings → Developer settings → OAuth Apps), com a callback URL `https://api.netlify.com/auth/done`. Depois cadastre o Client ID e o Secret no Netlify, em **Site configuration → Access & security → OAuth → GitHub**.
4. Cada acadêmico que for publicar precisa de uma conta no GitHub com acesso de escrita a este repositório. Para isso, convide em **Settings → Collaborators**.

## Rodar no computador

Requer Node.js 22 ou mais novo.

```
npm install
npm start          # site em http://localhost:8080
npm run cms        # em outro terminal: painel local em http://localhost:8080/admin/
```

No modo local, o painel grava direto nos arquivos da pasta, sem login.
