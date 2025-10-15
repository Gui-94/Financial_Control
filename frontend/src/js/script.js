const form = document.getElementById('formGasto');
const listaGastos = document.getElementById('listaGastos');
const resumoDiv = document.getElementById('resumo');
const ctx = document.getElementById('graficoGastos').getContext('2d');
let chart;

const cores = {};
function corAleatoria(categoria) {
  if(cores[categoria]) return cores[categoria];
  const r = Math.floor(Math.random()*200 + 30);
  const g = Math.floor(Math.random()*200 + 30);
  const b = Math.floor(Math.random()*200 + 30);
  cores[categoria] = `rgba(${r},${g},${b},0.7)`;
  return cores[categoria];
}

let gastos = []; // Mantém todos os gastos no front

// Listar gastos na tela
function listarGastos() {
  listaGastos.innerHTML = '';
  gastos.forEach(g => {
    const li = document.createElement('li');
    li.innerHTML = `💸 <b>${g.descricao}</b> - R$ ${g.valor.toFixed(2)} (${g.categoria || 'Sem categoria'}) - <i>${g.data}</i>`;
    listaGastos.appendChild(li);
  });
  atualizarResumo();
}

const filtroMes = document.getElementById('filtroMes');
const btnFiltrar = document.getElementById('btnFiltrar');

// Filtrar por mês escolhido
btnFiltrar.addEventListener('click', () => {
  const valorSelecionado = filtroMes.value; // Ex: "2025-09"
  if (!valorSelecionado) {
    Swal.fire({
      icon: 'info',
      title: 'Selecione um mês!',
      confirmButtonColor: '#3498db'
    });
    return;
  }

  const [ano, mes] = valorSelecionado.split('-').map(Number);

  const gastosFiltrados = gastos.filter(g => {
    const data = new Date(g.data);
    return data.getMonth() + 1 === mes && data.getFullYear() === ano;
  });

  if (gastosFiltrados.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Nenhum gasto encontrado nesse mês!',
      confirmButtonColor: '#2ecc71'
    });
    return;
  }

  listarGastosFiltrados(gastosFiltrados);
  atualizarResumoFiltrado(gastosFiltrados);
});

// Função auxiliar: listar gastos filtrados
function listarGastosFiltrados(lista) {
  listaGastos.innerHTML = '';
  lista.forEach(g => {
    const li = document.createElement('li');
    li.innerHTML = `💸 <b>${g.descricao}</b> - R$ ${g.valor.toFixed(2)} (${g.categoria || 'Sem categoria'}) - <i>${g.data}</i>`;
    listaGastos.appendChild(li);
  });
}

// Atualizar resumo e gráfico com base na lista filtrada
function atualizarResumoFiltrado(lista) {
  const total = lista.reduce((acc, g) => acc + g.valor, 0);

  const porCategoria = {};
  lista.forEach(g => {
    if (!porCategoria[g.categoria]) porCategoria[g.categoria] = 0;
    porCategoria[g.categoria] += g.valor;
  });

  resumoDiv.innerHTML = `
    <p>Total do mês: <b>R$ ${total.toFixed(2)}</b></p>
    ${Object.entries(porCategoria)
      .map(([cat, val]) => `<p>💡 ${cat}: R$ ${val.toFixed(2)}</p>`)
      .join('')}
  `;

  // Atualiza o gráfico
  const labels = Object.keys(porCategoria);
  const dataValues = Object.values(porCategoria);
  const backgroundColors = labels.map(corAleatoria);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      animation: { animateRotate: true, animateScale: true }
    }
  });
}


// Adicionar gasto
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const novoGasto = {
    descricao: document.getElementById('descricao').value,
    valor: parseFloat(document.getElementById('valor').value),
    data: document.getElementById('data').value,
    categoria: document.getElementById('categoria').value
  };

  gastos.push(novoGasto);
  form.reset();
  listarGastos();
});

// Atualiza resumo e gráfico
function atualizarResumo() {
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  // Filtrar gastos do mês atual
  const gastosDoMes = gastos.filter(g => {
    const d = new Date(g.data);
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  });

  // Soma total
  const total = gastosDoMes.reduce((acc, g) => acc + g.valor, 0);

  // Agrupa por categoria
  const porCategoria = {};
  gastosDoMes.forEach(g => {
    if(!porCategoria[g.categoria]) porCategoria[g.categoria] = 0;
    porCategoria[g.categoria] += g.valor;
  });

  // Atualiza HTML
  resumoDiv.innerHTML = `
    <p>Total: <b>R$ ${total.toFixed(2)}</b></p>
    ${Object.entries(porCategoria).map(([cat, val]) => `<p>💡 ${cat}: R$ ${val.toFixed(2)}</p>`).join('')}
  `;

  // Atualiza gráfico
  const labels = Object.keys(porCategoria);
  const dataValues = Object.values(porCategoria);
  const backgroundColors = labels.map(corAleatoria);

  if(chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      animation: { animateRotate: true, animateScale: true }
    }
  });
}

// Inicializa
listarGastos();
