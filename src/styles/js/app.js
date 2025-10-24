// ====== ELEMENTOS ======
const form = document.getElementById('formGasto');
const listaGastos = document.getElementById('listaGastos');
const resumoDiv = document.getElementById('resumo');
const ctx = document.getElementById('graficoGastos').getContext('2d');
const filtroMes = document.getElementById('filtroMes');
const btnFiltrar = document.getElementById('btnFiltrar');

let chart;
const cores = {};
function corAleatoria(categoria) {
  if (cores[categoria]) return cores[categoria];
  const r = Math.floor(Math.random() * 200 + 30);
  const g = Math.floor(Math.random() * 200 + 30);
  const b = Math.floor(Math.random() * 200 + 30);
  cores[categoria] = `rgba(${r},${g},${b},0.7)`;
  return cores[categoria];
}

// ====== DADOS ======
// Carrega do localStorage ou inicia vazio
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];

// ====== FUNÇÕES ======
function salvarGastos() {
  localStorage.setItem('gastos', JSON.stringify(gastos));
}

function listarGastos(lista = gastos) {
  listaGastos.innerHTML = '';

  lista.forEach(g => {
    const li = document.createElement('li');

    li.innerHTML = `
      💸 <b>${g.descricao}</b> - R$ ${g.valor.toFixed(2)} (${g.categoria || 'Sem categoria'}) - <i>${g.data}</i>
      <div class="botoes-gasto">
        <button class="btn-editar">✏️</button>
        <button class="btn-excluir">🗑️</button>
      </div>
    `;

    // Eventos Editar / Excluir
    li.querySelector('.btn-editar').onclick = () => {
      const novaDescricao = prompt('Nova descrição:', g.descricao);
      const novoValor = parseFloat(prompt('Novo valor:', g.valor));
      const novaCategoria = prompt('Nova categoria:', g.categoria);

      if (novaDescricao && !isNaN(novoValor)) {
        g.descricao = novaDescricao;
        g.valor = novoValor;
        g.categoria = novaCategoria;
        salvarGastos();
        listarGastos();
      }
    };

    li.querySelector('.btn-excluir').onclick = () => {
      if (confirm(`Deseja excluir ${g.descricao}?`)) {
        gastos = gastos.filter(item => item !== g);
        salvarGastos();
        listarGastos();
      }
    };

    listaGastos.appendChild(li);
  });

  atualizarResumo(lista);
}

// Atualiza resumo e gráfico
function atualizarResumo(lista = gastos) {
  // Agrupa por categoria
  const porCategoria = {};
  lista.forEach(g => {
    const cat = g.categoria || 'Sem categoria';
    if (!porCategoria[cat]) porCategoria[cat] = 0;
    porCategoria[cat] += g.valor;
  });

  // Total
  const total = lista.reduce((acc, g) => acc + g.valor, 0);

  resumoDiv.innerHTML = `
    <p>Total: <b>R$ ${total.toFixed(2)}</b></p>
    ${Object.entries(porCategoria).map(([cat, val]) => `<p>💡 ${cat}: R$ ${val.toFixed(2)}</p>`).join('')}
  `;

  // Atualiza gráfico
  const labels = Object.keys(porCategoria);
  const dataValues = Object.values(porCategoria);
  const backgroundColors = labels.map(corAleatoria);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data: dataValues, backgroundColor: backgroundColors, borderColor: '#fff', borderWidth: 2 }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } }, animation: { animateRotate: true, animateScale: true } }
  });
}

// ====== EVENTOS ======

// Adicionar gasto
form.addEventListener('submit', e => {
  e.preventDefault();
  const novoGasto = {
    descricao: document.getElementById('descricao').value,
    valor: parseFloat(document.getElementById('valor').value),
    data: document.getElementById('data').value,
    categoria: document.getElementById('categoria').value
  };

  gastos.push(novoGasto);
  salvarGastos();
  form.reset();
  listarGastos();
});

// Filtrar por mês
btnFiltrar.addEventListener('click', () => {
  const mesSelecionado = filtroMes.value; // ex: "2025-10"
  if (!mesSelecionado) {
    Swal.fire({ icon: 'info', title: 'Selecione um mês!', confirmButtonColor: '#3498db' });
    return;
  }

  // Filtro direto pela string da data
  const gastosFiltrados = gastos.filter(g => g.data.startsWith(mesSelecionado));

  if (gastosFiltrados.length === 0) {
    Swal.fire({ icon: 'info', title: 'Nenhum gasto encontrado nesse mês!', confirmButtonColor: '#2ecc71' });
    return;
  }

  listarGastos(gastosFiltrados);
});

// ====== INICIALIZAÇÃO ======
listarGastos();
