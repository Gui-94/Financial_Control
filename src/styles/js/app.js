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
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];

// ====== FUNÇÕES ======
function salvarGastos() {
  localStorage.setItem('gastos', JSON.stringify(gastos));
}

function atualizarResumo(lista = gastos) {
  const porCategoria = {};
  lista.forEach(g => {
    const cat = g.categoria || 'Sem categoria';
    if (!porCategoria[cat]) porCategoria[cat] = 0;
    porCategoria[cat] += g.valor;
  });

  const total = lista.reduce((acc, g) => acc + g.valor, 0);

  resumoDiv.innerHTML = `
    <p>Total: <b>R$ ${total.toFixed(2)}</b></p>
    ${Object.entries(porCategoria).map(([cat, val]) => `<p>💡 ${cat}: R$ ${val.toFixed(2)}</p>`).join('')}
  `;

  const labels = Object.keys(porCategoria);
  const dataValues = Object.values(porCategoria);
  const backgroundColors = labels.map(corAleatoria);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data: dataValues, backgroundColor: backgroundColors, borderColor: '#fff', borderWidth: 2 }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
}

function listarGastos(lista = gastos) {
  listaGastos.innerHTML = '';

  lista.forEach(g => {
    const li = document.createElement('li');

    li.innerHTML = `
      💸 <b>${g.descricao}</b> - R$ ${g.valor.toFixed(2)} (${g.categoria || 'Sem categoria'}) - <i>${g.data}</i>
      <div class="menu-wrapper">
        <button class="menu-btn">⋮</button>
        <div class="menu-opcoes">
          <button class="btn-editar">✏️</button>
          <button class="btn-excluir">🗑️</button>
        </div>
      </div>
    `;

    const menuWrapper = li.querySelector('.menu-wrapper');
    const menuBtn = li.querySelector('.menu-btn');

    // Toggle menu
    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      menuWrapper.classList.toggle('active');
    });

    // Editar
    li.querySelector('.btn-editar').onclick = () => editarGasto(g);

    // Excluir
    li.querySelector('.btn-excluir').onclick = () => excluirGasto(g);

    listaGastos.appendChild(li);
  });

  atualizarResumo(lista);
}

// Fecha menus clicando fora
document.addEventListener('click', () => {
  document.querySelectorAll('.menu-wrapper').forEach(menu => menu.classList.remove('active'));
});

// ====== CRUD ======
async function editarGasto(g) {
  const { value: formValues } = await Swal.fire({
    title: '✏️ Editar Gasto',
    html: `
      <input id="swal-descricao" class="swal2-input" placeholder="Descrição" value="${g.descricao}">
      <input id="swal-valor" class="swal2-input" type="number" step="0.01" placeholder="Valor" value="${g.valor}">
      <input id="swal-categoria" class="swal2-input" placeholder="Categoria" value="${g.categoria || ''}">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Salvar 💾',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#27ae60',
    cancelButtonColor: '#c0392b',
    background: '#FFDAB3',
    customClass: { popup: 'rounded-alert' },
    preConfirm: () => ({
      descricao: document.getElementById('swal-descricao').value,
      valor: parseFloat(document.getElementById('swal-valor').value),
      categoria: document.getElementById('swal-categoria').value
    })
  });

  if (formValues) {
    if (!formValues.descricao || isNaN(formValues.valor)) {
      Swal.fire({ icon: 'error', title: 'Preencha todos os campos!', background: '#FFDAB3', customClass: { popup: 'rounded-alert' } });
      return;
    }

    g.descricao = formValues.descricao;
    g.valor = formValues.valor;
    g.categoria = formValues.categoria;
    salvarGastos();
    listarGastos();
    Swal.fire({ icon: 'success', title: 'Gasto atualizado!', timer: 1500, showConfirmButton: false, background: '#FFDAB3', customClass: { popup: 'rounded-alert' } });
  }
}

async function excluirGasto(g) {
  const resultado = await Swal.fire({
    title: `Excluir "${g.descricao}"?`,
    text: "Essa ação não poderá ser desfeita!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#7f8c8d",
    confirmButtonText: "Sim, excluir 🗑️",
    cancelButtonText: "Cancelar",
    background: '#FF8A80',
    customClass: { popup: 'rounded-alert' }
  });

  if (resultado.isConfirmed) {
    gastos = gastos.filter(item => item !== g);
    salvarGastos();
    listarGastos();
    Swal.fire({ icon: "success", title: "Gasto excluído!", showConfirmButton: false, timer: 1500, background: '#FF8A80', customClass: { popup: 'rounded-alert' } });
  }
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
  const mesSelecionado = filtroMes.value;
  if (!mesSelecionado) return Swal.fire({ icon: 'info', title: 'Selecione um mês!', confirmButtonColor: '#3498db' });

  const gastosFiltrados = gastos.filter(g => g.data.startsWith(mesSelecionado));
  if (gastosFiltrados.length === 0) return Swal.fire({ icon: 'info', title: 'Nenhum gasto encontrado!', confirmButtonColor: '#2ecc71' });

  listarGastos(gastosFiltrados);
});

// ====== INICIALIZAÇÃO ======
listarGastos();
