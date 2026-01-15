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

// 🔔 CONTROLE DE ALERTA
let alertaMetaExibido = false;

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

// ================== MÁSCARA MOEDA BR ==================
function mascaraMoedaBR(input, limite = 100000) {
  input.addEventListener("input", function () {
    let valor = this.value.replace(/\D/g, "");
    if (!valor) {
      this.value = "";
      return;
    }
    let numero = Number(valor) / 100;
    if (numero > limite) numero = limite;
    this.value = numeroParaBR(numero);
  });
}

// ================== APLICAR MÁSCARA ==================
mascaraMoedaBR(document.getElementById("valor"), 100000);
if (valorMetaInput) mascaraMoedaBR(valorMetaInput, 100000);

// ================== LISTAR ==================
function listar(lista = gastos) {
  listaGastos.innerHTML = "";

  lista.forEach((g, index) => {
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

  atualizarResumo(lista);
  atualizarGrafico(lista);
}

// ================== RESUMO ==================
function atualizarResumo(lista = gastos) {
  const total = lista.reduce((a, g) => a + g.valor, 0);
  resumoDiv.innerHTML = `<b>Total:</b> R$ ${numeroParaBR(total)}`;
}

// ================== GRÁFICO ==================
let chart;
function atualizarGrafico(lista = gastos) {
  if (!ctx) return;

  const categorias = {};
  lista.forEach(g => {
    categorias[g.categoria] = (categorias[g.categoria] || 0) + g.valor;
  });

  const labels = Object.keys(categorias);
  const valores = Object.values(categorias);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: [
          "#22c55e",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#06b6d4"
        ],
        borderWidth: 2,
        borderColor: "#0f172a"
      }]
    },
    options: {
      responsive: true,
      cutout: "65%",
      plugins: {
        title: {
          display: true,
          text: "Distribuição de Gastos por Categoria",
          color: "#ffffff",
          font: {
            size: 18,
            weight: "bold"
          },
          padding: {
            bottom: 20
          }
        },
        legend: {
          position: "bottom",
          labels: {
            color: "#ffffff",
            font: {
              size: 14
            },
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const valor = context.raw;
              const total = valores.reduce((a, b) => a + b, 0);
              const pct = ((valor / total) * 100).toFixed(1);

              return `${context.label}: R$ ${numeroParaBR(valor)} (${pct}%)`;
            }
          },
          bodyFont: {
            size: 14
          }
        }
      }
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
    progress.style.background = "#4caf50";
    alertaMetaExibido = false;
    return;
  }

  const pctReal = (total / metaMensal) * 100;
  const pct = Math.min(pctReal, 100);

  progress.style.width = pct + "%";

  if (pctReal >= 100) {
    progress.style.background = "#e53935";
    percentualMeta.textContent = "Meta estourada!";

    if (!alertaMetaExibido) {
      alertaMetaExibido = true;
      Swal.fire({
        icon: "warning",
        title: "⚠️ Meta ultrapassada!",
        html: `
          <b>Meta:</b> R$ ${numeroParaBR(metaMensal)}<br>
          <b>Gasto atual:</b> R$ ${numeroParaBR(total)}
        `,
        confirmButtonText: "Entendi"
      });
    }
  } else {
    progress.style.background = "#4caf50";
    percentualMeta.textContent = `${pctReal.toFixed(1)}% da meta`;
    alertaMetaExibido = false;
  }
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
  atualizarMetaFinanceira();
  form.reset();
});

// ================== META ==================
formMeta.addEventListener("submit", e => {
  e.preventDefault();
  metaMensal = brParaNumero(valorMetaInput.value);
  alertaMetaExibido = false;
  salvarMeta();
  atualizarMetaFinanceira();
});

// ================== EDITAR ==================
function editarGasto(index) {
  const g = gastos[index];

  Swal.fire({
    title: "Editar gasto",
    html: `
      <input id="eDesc" value="${g.descricao}" class="swal2-input">
      <input id="eVal" value="${numeroParaBR(g.valor)}" class="swal2-input">
      <input id="eDat" type="date" value="${g.data}" class="swal2-input">
    `,
    didOpen: () => mascaraMoedaBR(document.getElementById("eVal")),
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
    atualizarMetaFinanceira();
  });
}

// ================== EXCLUIR ==================
function excluirGasto(index) {
  gastos.splice(index, 1);
  salvarGastos();
  listar();
  atualizarMetaFinanceira();
}

// ================== FILTRO ==================
btnFiltrar.addEventListener("click", () => {
  const mes = filtroMes.value;

  if (!mes) {
    listar();
    return;
  }

  const filtrados = gastos.filter(g => g.data.slice(0, 7) === mes);
  listar(filtrados);
  const btnLimparFiltro = document.getElementById("btnLimparFiltro");
});

// ================== INIT ==================
listar();
atualizarMetaFinanceira();

// ================== LIMPAR FILTRO ==================
btnLimparFiltro.addEventListener("click", () => {
  filtroMes.value = "";
  listar();              // volta todos os gastos
  atualizarMetaFinanceira();
});

