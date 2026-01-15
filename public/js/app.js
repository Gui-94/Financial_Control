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
const btnLimparFiltro = document.getElementById("btnLimparFiltro");

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

let alertaMetaExibido = false;

// ================== UTIL ==================
const salvarGastos = () =>
  localStorage.setItem(chaveGastos, JSON.stringify(gastos));

const salvarMeta = () =>
  localStorage.setItem(chaveMeta, metaMensal);

// ================== CONVERSÕES ==================
const brParaNumero = v =>
  Number(v.replace(/\./g, "").replace(",", ".")) || 0;

const numeroParaBR = v =>
  Number(v).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

// ================== MÁSCARA (SEM LIMITE) ==================
function mascaraMoedaBR(input) {
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "");
    if (!v) return (input.value = "");
    input.value = numeroParaBR(Number(v) / 100);
  });
}

mascaraMoedaBR(document.getElementById("valor"));
mascaraMoedaBR(valorMetaInput);

// ================== LISTAGEM ==================
function listar(lista = gastos) {
  listaGastos.innerHTML = "";

  lista.forEach((g, i) => {
    const li = document.createElement("li");
    li.className = "item-gasto";

    li.innerHTML = `
      <div>
        <strong>${g.descricao}</strong>
        <small>${g.categoria} • ${new Date(g.data).toLocaleDateString()}</small>
      </div>
      <div>
        <span>R$ ${numeroParaBR(g.valor)}</span>
        <div class="acoes">
          <button onclick="editarGasto(${i})">✏️</button>
          <button onclick="excluirGasto(${i})">🗑️</button>
        </div>
      </div>
    `;

    listaGastos.appendChild(li);
  });

  atualizarResumo(lista);
  atualizarGrafico(lista);
}

// ================== RESUMO ==================
function atualizarResumo(lista) {
  const total = lista.reduce((a, g) => a + g.valor, 0);
  resumoDiv.innerHTML = `<b>Total:</b> R$ ${numeroParaBR(total)}`;
}

// ================== GRÁFICO ==================
let chart;

function atualizarGrafico(lista) {
  if (!ctx) return;

  const categorias = {};
  lista.forEach(g => {
    categorias[g.categoria] = (categorias[g.categoria] || 0) + g.valor;
  });

  const labels = Object.keys(categorias);
  const valores = Object.values(categorias);

  if (chart) chart.destroy();

  const isMobile = window.innerWidth <= 768;

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: [
          "#22c55e", "#3b82f6", "#f59e0b",
          "#ef4444", "#8b5cf6", "#06b6d4"
        ],
        borderWidth: 2,
        borderColor: "#0b122b"
      }]
    },
    options: {
      responsive: true,
      cutout: isMobile ? "70%" : "65%",
      plugins: {
        legend: {
          display: !isMobile,
          position: "bottom",
          labels: { color: "#fff" }
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const total = valores.reduce((a, b) => a + b, 0);
              const pct = ((ctx.raw / total) * 100).toFixed(1);
              return `${ctx.label}: R$ ${numeroParaBR(ctx.raw)} (${pct}%)`;
            }
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
    progress.style.background = "#00e676";
    alertaMetaExibido = false;
    return;
  }

  const pctReal = (total / metaMensal) * 100;
  const pct = Math.min(pctReal, 100);

  progress.style.width = pct + "%";

  if (pctReal >= 100) {
    progress.style.background = "#ef4444";
    percentualMeta.textContent = `Meta ultrapassada (${pctReal.toFixed(1)}%)`;

    if (!alertaMetaExibido) {
      alertaMetaExibido = true;
      Swal.fire({
        icon: "warning",
        title: "⚠️ Meta ultrapassada!",
        html: `
          <b>Meta:</b> R$ ${numeroParaBR(metaMensal)}<br>
          <b>Gasto:</b> R$ ${numeroParaBR(total)}
        `
      });
    }
  } else {
    progress.style.background = "#00e676";
    percentualMeta.textContent = `${pctReal.toFixed(1)}% da meta`;
    alertaMetaExibido = false;
  }
}

// ================== ADD GASTO ==================
form.addEventListener("submit", e => {
  e.preventDefault();

  gastos.push({
    descricao: descricao.value,
    valor: brParaNumero(valor.value),
    data: data.value,
    categoria: categoria.value || "Outros"
  });

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
      <input id="eDesc" class="swal2-input" value="${g.descricao}">
      <input id="eVal" class="swal2-input" value="${numeroParaBR(g.valor)}">
      <input id="eDat" type="date" class="swal2-input" value="${g.data}">
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
  Swal.fire({
    title: "Excluir gasto?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Excluir",
    cancelButtonText: "Cancelar"
  }).then(r => {
    if (!r.isConfirmed) return;
    gastos.splice(index, 1);
    salvarGastos();
    listar();
    atualizarMetaFinanceira();
  });
}

// ================== FILTRO ==================
btnFiltrar.onclick = () => {
  const mes = filtroMes.value;
  listar(mes ? gastos.filter(g => g.data.startsWith(mes)) : gastos);
};

btnLimparFiltro.onclick = () => {
  filtroMes.value = "";
  listar();
  atualizarMetaFinanceira();
};

// ================== INIT ==================
listar();
atualizarMetaFinanceira();

// ================== SAIR ==================
const btnSair = document.querySelector(".btn-sair");

if (btnSair) {
  btnSair.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
  });
}
