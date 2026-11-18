# Academia Santarena de Direito

Site institucional da Academia Santarena de Direito. É um site estático (HTML, CSS e JavaScript puros), sem etapa de build.

## Estrutura

```
index.html          Página única: banner, apresentação, a Academia, cadeiras, diretoria e contato
css/style.css       Estilos; as cores (verde e dourado) e fontes ficam no topo, em :root
js/cadeiras.js      Relação das 33 cadeiras: número, patrono e ocupante
js/main.js          Menu do celular, lista e busca das cadeiras, formulário de contato
img/banner-posse.jpg  Foto oficial usada no banner
```

## Como editar

- Para corrigir uma cadeira, edite `js/cadeiras.js`. A lista do site é montada a partir dele.
- Os trechos que precisam de dados reais estão marcados com `<!-- EDITAR -->` no `index.html`: texto institucional, diretoria, contato e brasão.
- O formulário de contato abre o app de e-mail do visitante. Troque o endereço no atributo `data-email` do `<form>`.
- Para ver o site, abra o `index.html` no navegador.

## Publicar no GitHub Pages

O GitHub Pages gratuito exige repositório público. Em repositório privado, ele só funciona nos planos pagos.
Em **Settings → Pages**, escolha **Deploy from a branch**, a branch `main` e a pasta `/ (root)`.
