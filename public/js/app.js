// ================== LOGIN ==================
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado) window.location.href = "login.html";

// ================== ELEMENTOS ==================
const form = document.getElementById("formGasto");
const listaGastos = document.getElementById("listaGastos");
const resumoDiv = document.getElementById("resumo");
const ctx = document.getElementById("graficoGastos")?.getContext("2d");

const filtroMes = document.getElementById("filtroMes");
const btnFiltrar = document.getElementById("btnFiltrar");

const formMeta = document.getElementById("formMeta");
const valorMetaInput = document.getElementById("valorMeta");
const metaValor = document.getElementById("metaValor");
const gastoAtual = document.getElementById("gastoAtual");
const progress = document.querySelector(".progress");
const percentualMeta = document.getElementById("percentualMeta");

// ================== STORAGE ==================
const chaveGastos = `gastos_${usuarioLogado.email}`;
const chaveMeta = `meta_${usuarioLogado.email}`;

let gastos = JSON.parse(localStorage.getItem(chaveGastos)) || [];
let metaMensal = Number(localStorage.getItem(chaveMeta)) || 0;

// ================== UTIL ==================
function salvarGastos() {
  localStorage.setItem(chaveGastos, JSON.stringify(gastos));
}

function salvarMeta() {
  localStorage.setItem(chaveMeta, metaMensal);
}

// ================== CONVERSÕES ==================
function brParaNumero(valor) {
  if (!valor) return 0;
  return Number(valor.replace(/\./g, "").replace(",", ".")) || 0;
}

function numeroParaBR(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ================== MÁSCARA MOEDA BR (SIMPLES E FUNCIONAL) ==================
function aplicarMascaraBR(input) {
  input.addEventListener("input", function () {
    let valor = this.value.replace(/\D/g, "");
    if (!valor) {
      this.value = "";
      return;
    }

    let numero = Number(valor) / 100;
    this.value = numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  });
}

// ================== APLICAR MÁSCARA ==================
aplicarMascaraBR(document.getElementById("valor"));
aplicarMascaraBR(valorMetaInput);

// ================== LISTAR ==================
function listar(filtro = null) {
  listaGastos.innerHTML = "";
  const itens = filtro || gastos;

  itens.forEach((g, index) => {
    const li = document.createElement("li");
    li.className = "item-gasto";

    li.innerHTML = `
      <div>
        <strong>${g.descricao}</strong>
        <small>${g.categoria} • ${new Date(g.data).toLocaleDateString()}</small>
      </div>
      <div>
        <span>R$ ${numeroParaBR(g.valor)}</span>
        <button onclick="editarGasto(${index})">✏️</button>
        <button onclick="excluirGasto(${index})">🗑️</button>
      </div>
    `;
    listaGastos.appendChild(li);
  });

  atualizarResumo();
  atualizarMetaFinanceira();
}

// ================== RESUMO ==================
function atualizarResumo() {
  const total = gastos.reduce((a, g) => a + g.valor, 0);
  resumoDiv.innerHTML = `<b>Total:</b> R$ ${numeroParaBR(total)}`;
  atualizarGrafico();
}

// ================== GRÁFICO ==================
let chart;
function atualizarGrafico() {
  if (!ctx) return;

  const categorias = {};
  gastos.forEach(g => {
    categorias[g.categoria] = (categorias[g.categoria] || 0) + g.valor;
  });

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(categorias),
      datasets: [{ data: Object.values(categorias) }]
    }
  });
}

// ================== META ==================
function atualizarMetaFinanceira() {
  const total = gastos.reduce((a, g) => a + g.valor, 0);

  metaValor.textContent = numeroParaBR(metaMensal);
  gastoAtual.textContent = numeroParaBR(total);

  if (!metaMensal) {
    percentualMeta.textContent = "Defina uma meta.";
    progress.style.width = "0%";
    return;
  }

  const pct = Math.min((total / metaMensal) * 100, 100);
  progress.style.width = pct + "%";
  percentualMeta.textContent = `${pct.toFixed(1)}% da meta`;
}

// ================== ADD GASTO ==================
form.addEventListener("submit", e => {
  e.preventDefault();

  const descricao = document.getElementById("descricao").value;
  const valor = brParaNumero(document.getElementById("valor").value);
  const data = document.getElementById("data").value;
  const categoria = document.getElementById("categoria").value || "Outros";

  if (!descricao || !valor || !data) {
    Swal.fire("Preencha todos os campos");
    return;
  }

  gastos.push({ descricao, valor, data, categoria });
  salvarGastos();
  listar();
  form.reset();
});

// ================== META ==================
formMeta.addEventListener("submit", e => {
  e.preventDefault();
  metaMensal = brParaNumero(valorMetaInput.value);
  salvarMeta();
  atualizarMetaFinanceira();
});

// ================== EDITAR ==================
function editarGasto(index) {
  const g = gastos[index];

  Swal.fire({
    title: "Editar",
    html: `
      <input id="eDesc" value="${g.descricao}" class="swal2-input">
      <input id="eVal" value="${numeroParaBR(g.valor)}" class="swal2-input">
      <input id="eDat" type="date" value="${g.data}" class="swal2-input">
    `,
    didOpen: () => aplicarMascaraBR(document.getElementById("eVal")),
    preConfirm: () => ({
      descricao: document.getElementById("eDesc").value,
      valor: brParaNumero(document.getElementById("eVal").value),
      data: document.getElementById("eDat").value
    })
  }).then(r => {
    if (!r.isConfirmed) return;
    gastos[index] = { ...gastos[index], ...r.value };
    salvarGastos();
    listar();
  });
}

// ================== EXCLUIR ==================
function excluirGasto(index) {
  gastos.splice(index, 1);
  salvarGastos();
  listar();
}

// ================== FILTRO ==================
btnFiltrar.addEventListener("click", () => {
  const mes = filtroMes.value;
  listar(gastos.filter(g => g.data.startsWith(mes)));
});

// ================== INIT ==================
listar();
atualizarMetaFinanceira();
