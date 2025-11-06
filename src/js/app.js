// ====== VERIFICA LOGIN ======
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));


// ====== ELEMENTOS ======
const form = document.getElementById('formGasto');
const listaGastos = document.getElementById('listaGastos');
const resumoDiv = document.getElementById('resumo');
const ctx = document.getElementById('graficoGastos').getContext('2d');
const filtroMes = document.getElementById('filtroMes');
const btnFiltrar = document.getElementById('btnFiltrar');
const btnLogout = document.getElementById('logoutBtn');

let chart;
const cores = {};

// ====== FUNÇÕES ======
function corAleatoria(categoria) {
  if (cores[categoria]) return cores[categoria];
  const r = Math.floor(Math.random() * 200 + 30);
  const g = Math.floor(Math.random() * 200 + 30);
  const b = Math.floor(Math.random() * 200 + 30);
  cores[categoria] = `rgba(${r},${g},${b},0.7)`;
  return cores[categoria];
}

// ====== DADOS ======
const chaveGastos = `gastos_${usuarioLogado?.email || 'semEmail'}`;
let gastos = JSON.parse(localStorage.getItem(chaveGastos)) || [];

function salvarGastos() {
  localStorage.setItem(chaveGastos, JSON.stringify(gastos));
}


// ====== RESUMO ======
function atualizarResumo(lista = gastos) {
  const porCategoria = {};
  lista.forEach(g => {
    const cat = g.categoria || 'Sem categoria';
    porCategoria[cat] = (porCategoria[cat] || 0) + g.valor;
  });

  const total = lista.reduce((acc, g) => acc + g.valor, 0);
  resumoDiv.innerHTML = `
    <p>Total: <b>R$ ${total.toFixed(2)}</b></p>
    ${Object.entries(porCategoria)
      .map(([cat, val]) => `<p>💡 ${cat}: R$ ${val.toFixed(2)}</p>`)
      .join('')}
  `;

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
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            font: { size: 16, family: 'Arial, sans-serif' },
          },
        },
      },
    },
  });
}

// ====== LISTAR ======
function listarGastos(lista = gastos) {
  listaGastos.innerHTML = '';

  lista.forEach(g => {
    const li = document.createElement('li');
    li.innerHTML = `
      💸 <b>${g.descricao}</b> - R$ ${g.valor.toFixed(2)} (${g.categoria || 'Sem categoria'}) - <i>${g.data}</i>
      <div class="menu-wrapper">
        <button class="menu-btn">⋮</button>
        <div class="menu-opcoes">
          <button class="btn-editar">🖋️</button>
          <button class="btn-excluir">🚮</button>
        </div>
      </div>
    `;

    const menuWrapper = li.querySelector('.menu-wrapper');
    const menuBtn = li.querySelector('.menu-btn');

    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      menuWrapper.classList.toggle('active');
    });

    li.querySelector('.btn-editar').onclick = () => editarGasto(g);
    li.querySelector('.btn-excluir').onclick = () => excluirGasto(g);

    listaGastos.appendChild(li);
  });

  atualizarResumo(lista);
}

// ====== CRUD ======
async function editarGasto(g) {
  const { value: dados } = await Swal.fire({
    title: 'Editar Gasto',
    html: `
      <input id="desc" class="swal2-input" value="${g.descricao}">
      <input id="valor" type="number" step="0.01" class="swal2-input" value="${g.valor}">
      <input id="cat" class="swal2-input" value="${g.categoria || ''}">
    `,
    showCancelButton: true,
    confirmButtonText: 'Salvar',
    preConfirm: () => ({
      descricao: document.getElementById('desc').value,
      valor: parseFloat(document.getElementById('valor').value),
      categoria: document.getElementById('cat').value,
    }),
  });

  if (dados) {
    Object.assign(g, dados);
    salvarGastos();
    listarGastos();
    Swal.fire('Atualizado!', '', 'success');
  }
}

async function excluirGasto(g) {
  const confirm = await Swal.fire({
    title: `Excluir "${g.descricao}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim',
  });

  if (confirm.isConfirmed) {
    gastos = gastos.filter(item => item !== g);
    salvarGastos();
    listarGastos();
  }
}

// ====== EVENTOS ======
form.addEventListener('submit', e => {
  e.preventDefault();
  const novo = {
    descricao: document.getElementById('descricao').value,
    valor: parseFloat(document.getElementById('valor').value),
    data: document.getElementById('data').value,
    categoria: document.getElementById('categoria').value,
  };
  gastos.push(novo);
  salvarGastos();
  form.reset();
  listarGastos();
});

btnFiltrar.addEventListener('click', () => {
  const mes = filtroMes.value;
  if (!mes) return Swal.fire('Selecione um mês!');
  const filtrados = gastos.filter(g => g.data.startsWith(mes));
  listarGastos(filtrados);
});

// ====== LOGOUT ======
btnLogout?.addEventListener('click', () => {
  localStorage.removeItem('usuarioLogado');
  window.location.href = '/index.html';
});

// ====== INICIALIZAÇÃO ======
listarGastos();
