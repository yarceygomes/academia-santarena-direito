// Menu do celular
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('menu');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

// Cadeiras: monta a lista a partir de js/cadeiras.js
const lista = document.getElementById('lista-cadeiras');
const busca = document.getElementById('busca');
const semResultados = document.getElementById('sem-resultados');

const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

CADEIRAS.forEach((c) => {
  const item = document.createElement('li');
  item.className = 'chair';
  item.dataset.busca = normalizar(`${c.n} ${c.patrono} ${c.ocupante}`);

  const numero = document.createElement('span');
  numero.className = 'chair__n';
  numero.textContent = String(c.n).padStart(2, '0');

  const corpo = document.createElement('div');
  const rotulo = document.createElement('span');
  rotulo.className = 'chair__label';
  rotulo.textContent = 'Patrono';
  const patrono = document.createElement('h3');
  patrono.className = 'chair__patron';
  patrono.textContent = c.patrono;
  const ocupante = document.createElement('p');
  ocupante.className = 'chair__member';
  ocupante.textContent = c.ocupante;

  corpo.append(rotulo, patrono, ocupante);
  item.append(numero, corpo);
  lista.append(item);
});

busca.addEventListener('input', () => {
  const termo = normalizar(busca.value.trim());
  let visiveis = 0;
  lista.querySelectorAll('.chair').forEach((item) => {
    const mostra = item.dataset.busca.includes(termo);
    item.hidden = !mostra;
    if (mostra) visiveis++;
  });
  semResultados.hidden = visiveis > 0;
});

// Formulário: abre o app de e-mail do visitante com a mensagem preenchida
const form = document.getElementById('contact-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = `Contato pelo site: ${data.get('assunto')}`;
  const body =
    `Nome: ${data.get('nome')}\n` +
    `E-mail: ${data.get('email')}\n\n` +
    `${data.get('mensagem')}`;
  window.location.href =
    `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// Ano atual no rodapé
document.getElementById('year').textContent = new Date().getFullYear();
