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

// ================== MÁSCARA ==================
function mascaraMoedaBR(input, limite = 100000) {
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "");
    if (!v) return (input.value = "");
    let n = Math.min(Number(v) / 100, limite);
    input.value = numeroParaBR(n);
  });
}

mascaraMoedaBR(document.getElementById("valor"));
mascaraMoedaBR(valorMetaInput);

// ================== LISTAGEM ==================
function listar(lista = gastos) {
  listaGastos.innerHTML = "";

  lista.forEach((g, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${g.descricao}</strong>
        <small>${g.categoria} • ${new Date(g.data).toLocaleDateString()}</small>
      </div>
      <span>R$ ${numeroParaBR(g.valor)}</span>
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
    return;
  }

  const pct = Math.min((total / metaMensal) * 100, 100);
  progress.style.width = pct + "%";
  percentualMeta.textContent = `${pct.toFixed(1)}% da meta`;
}

// ================== EVENTOS ==================
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

formMeta.addEventListener("submit", e => {
  e.preventDefault();
  metaMensal = brParaNumero(valorMetaInput.value);
  salvarMeta();
  atualizarMetaFinanceira();
});

btnFiltrar.onclick = () => {
  const mes = filtroMes.value;
  listar(mes ? gastos.filter(g => g.data.startsWith(mes)) : gastos);
};

btnLimparFiltro.onclick = () => {
  filtroMes.value = "";
  listar();
};

// ================== INIT ==================
listar();
atualizarMetaFinanceira();
