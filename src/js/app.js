// ====== VERIFICA LOGIN ======
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

console.log("✅ app.js carregado");

// ====== ELEMENTOS ======
const form = document.getElementById('formGasto');
const listaGastos = document.getElementById('listaGastos');
const resumoDiv = document.getElementById('resumo');
const ctx = document.getElementById('graficoGastos')?.getContext('2d');
const filtroMes = document.getElementById('filtroMes');
const btnFiltrar = document.getElementById('btnFiltrar');
const btnLogout = document.getElementById('logoutBtn');

// ====== META FINANCEIRA ELEMENTOS ======
const formMeta = document.getElementById('formMeta');
const valorMetaInput = document.getElementById('valorMeta');
const metaValor = document.getElementById('metaValor');
const gastoAtual = document.getElementById('gastoAtual');
const progress = document.querySelector('.progress');
const percentualMeta = document.getElementById('percentualMeta');

console.log("📋 Form encontrado:", form);
console.log("📊 Canvas encontrado:", ctx);
console.log("🔍 Botão filtro encontrado:", btnFiltrar);

let chart;
const cores = {};

// ====== FUNÇÃO: COR ALEATÓRIA ======
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

console.log("📦 Gastos carregados:", gastos);

function salvarGastos() {
  localStorage.setItem(chaveGastos, JSON.stringify(gastos));
}

// ====== RESUMO ======
function atualizarResumo(lista = gastos) {
  const porCategoria = {};
  lista.forEach(g => {
    const valor = parseFloat(g.valor) || 0;
    const cat = g.categoria || 'Sem categoria';
    porCategoria[cat] = (porCategoria[cat] || 0) + valor;
  });

  const total = lista.reduce((acc, g) => acc + (parseFloat(g.valor) || 0), 0);
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
    const valor = parseFloat(g.valor) || 0;
    const li = document.createElement('li');

    li.innerHTML = `
      <span>💸 <b>${g.descricao || 'Sem descrição'}</b> - R$ ${valor.toFixed(2)} (${g.categoria || 'Sem categoria'}) - <i>${g.data || ''}</i></span>
      <div class="acoes">
        <button class="btn-editar">🖋️</button>
        <button class="btn-excluir">🚮</button>
      </div>
    `;

    li.querySelector('.btn-editar').onclick = () => editarGasto(g);
    li.querySelector('.btn-excluir').onclick = () => excluirGasto(g);

    listaGastos.appendChild(li);
  });

  atualizarResumo(lista);
  atualizarProgressoMeta(lista);
}


// ====== EDITAR GASTO ======
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


// ====== EXCLUIR GASTO ======
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


// ====== META FINANCEIRA ======
const chaveMeta = `meta_${usuarioLogado?.email || 'semEmail'}`;
let metaMensal = parseFloat(localStorage.getItem(chaveMeta)) || 0;

if (metaMensal > 0) {
  metaValor.textContent = metaMensal.toFixed(2);
}

function atualizarProgressoMeta(lista = gastos) {
  if (!metaMensal || metaMensal <= 0) return;

  const totalGasto = lista.reduce((acc, g) => acc + (parseFloat(g.valor) || 0), 0);
  const porcentagem = Math.min((totalGasto / metaMensal) * 100, 100);

  gastoAtual.textContent = totalGasto.toFixed(2);
  percentualMeta.textContent = `${porcentagem.toFixed(1)}% da meta gasta`;
  progress.style.width = `${porcentagem}%`;

  if (porcentagem >= 100) {
    progress.style.background = "linear-gradient(90deg, #ff1744, #ff5252)";
    percentualMeta.style.color = "#ff5252";
  } else if (porcentagem >= 70) {
    progress.style.background = "linear-gradient(90deg, #ff9100, #ffab40)";
    percentualMeta.style.color = "#ffab40";
  } else {
    progress.style.background = "linear-gradient(90deg, #00c853, #b2ff59)";
    percentualMeta.style.color = "#b2ff59";
  }
}

formMeta?.addEventListener('submit', e => {
  e.preventDefault();

  const valor = parseFloat(valorMetaInput.value);
  if (valor <= 0) {
    Swal.fire("Informe um valor válido!", "", "warning");
    return;
  }

  metaMensal = valor;
  localStorage.setItem(chaveMeta, valor);

  metaValor.textContent = valor.toFixed(2);
  atualizarProgressoMeta();

  Swal.fire("Meta salva com sucesso!", "", "success");
  formMeta.reset();
});

// ====== EVENTOS ======
form?.addEventListener('submit', e => {
  e.preventDefault();
  const novo = {
    descricao: document.getElementById('descricao').value,
    valor: parseFloat(document.getElementById('valor').value) || 0,
    data: document.getElementById('data').value,
    categoria: document.getElementById('categoria').value,
  };
  gastos.push(novo);
  salvarGastos();
  form.reset();
  listarGastos();
});

btnFiltrar?.addEventListener('click', () => {
  const mes = filtroMes.value;
  if (!mes) return Swal.fire('Selecione um mês!');
  const filtrados = gastos.filter(g => g.data && g.data.startsWith(mes));
  listarGastos(filtrados);
});

// ====== LOGOUT ======
btnLogout?.addEventListener('click', () => {
  localStorage.removeItem('usuarioLogado');
  window.location.href = '/index.html';
});

// ====== INICIALIZAÇÃO ======
listarGastos();

console.log("🚀 Script finalizado e funcional!");
