const { lista } = require("./patronos.json");

const salas = [
  ["lugares", "Os lugares da Justiça", "Do porto da comarca ao salão do Teatro Vitória, a cidade guardou vestígios dos lugares em que trabalhavam juízes, escrivães e advogados.", [14, 13, 10, 12, 27, 28]],
  ["palavra", "Discursos e tribunas", "O porto, a distribuição de terras e o lugar dos pequenos agricultores chegaram ao Parlamento pela voz de representantes ligados ao Baixo Amazonas. Uma filha também tomou a palavra para contar que espécie de advogado fora seu pai.", [5, 8, 11, 30, 26]],
  ["causos", "Causos do foro e lembranças de família", "As petições da Sombra da Lua, os livros de uma biblioteca particular e a defesa do boi Garantido sobreviveram nas lembranças de quem conheceu seus protagonistas.", [1, 31, 18, 21, 25, 24, 19]],
  ["ordem", "A advocacia e seus ofícios", "Uma sala cedida pelo fórum abrigou a primeira diretoria da Ordem. Atas, jornais e fichas de inscrição acompanham a formação da advocacia local e a disputa por assistência jurídica na comarca.", [7, 6, 15, 17, 20, 23, 4, 22]],
  ["autos", "Autos, mandatos e vida pública", "Processos, atos legislativos e publicações oficiais permitem seguir os caminhos que ligaram o foro de Santarém à política municipal, aos tribunais e ao debate jurídico brasileiro.", [2, 3, 9, 16, 29, 32, 33]]
];

module.exports = salas.map(([id, titulo, abertura, numeros]) => ({
  id, titulo, abertura, pessoas: numeros.map(numero => lista.find(p => p.numero === numero))
}));
