// ====== Verifica Login ======
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

// ELEMENTOS
const form = document.getElementById("formGasto");
const listaGastos = document.getElementById("listaGastos");
const resumoDiv = document.getElementById("resumo");
const ctx = document.getElementById("graficoGastos")?.getContext("2d");
const filtroMes = document.getElementById("filtroMes");
const btnFiltrar = document.getElementById("btnFiltrar");

// META
const formMeta = document.getElementById("formMeta");
const valorMetaInput = document.getElementById("valorMeta");
const metaValor = document.getElementById("metaValor");
const gastoAtual = document.getElementById("gastoAtual");
const progress = document.querySelector(".progress");
const percentualMeta = document.getElementById("percentualMeta");

// STORAGE
const chaveGastos = `gastos_${usuarioLogado?.email || "semEmail"}`;
let gastos = JSON.parse(localStorage.getItem(chaveGastos)) || [];

function salvar() {
  localStorage.setItem(chaveGastos, JSON.stringify(gastos));
}

// ====== LISTAR ======
function listar() {
  listaGastos.innerHTML = "";

  gastos.forEach((g) => {
    const valor = parseFloat(g.valor) || 0;

    const li = document.createElement("li");
    const corValor = valor > 300 ? "valor-vermelho" : "valor-verde";

    li.innerHTML = `
      <span><b>${g.descricao}</b><br><i>${g.categoria}</i></span>
      <span class="valor ${corValor}">R$ ${valor.toFixed(2)}</span>
    `;

    listaGastos.appendChild(li);
  });

  atualizarResumo();
  atualizarProgresso();
}

// ====== RESUMO ======
function atualizarResumo() {
  const total = gastos.reduce((acc, g) => acc + parseFloat(g.valor), 0);

  resumoDiv.innerHTML = `
    <p>Total gasto: <b class="valor-vermelho">R$ ${total.toFixed(2)}</b></p>
  `;

  atualizarGrafico();
}

// ====== GRÁFICO ======
let chart;

function atualizarGrafico() {
  const categorias = {};
  gastos.forEach(g => {
    categorias[g.categoria] = (categorias[g.categoria] || 0) + parseFloat(g.valor);
  });

  const labels = Object.keys(categorias);
  const dados = Object.values(categorias);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ data: dados, backgroundColor: ["#00e676", "#ff5252", "#2979ff", "#ffea00"] }],
    },
    options: { plugins: { legend: { labels: { color: "#fff" } } } }
  });
}

// ====== PROGRESSO ======
let metaMensal = parseFloat(localStorage.getItem("meta")) || 0;

function atualizarProgresso() {
  if (!metaMensal) return;

  const total = gastos.reduce((acc, g) => acc + parseFloat(g.valor), 0);
  const pct = Math.min((total / metaMensal) * 100, 100);

  metaValor.textContent = metaMensal.toFixed(2);
  gastoAtual.textContent = total.toFixed(2);
  percentualMeta.textContent = `${pct.toFixed(1)}% da meta gasta`;

  progress.style.width = pct + "%";
  progress.style.background = pct > 70 ? "#ff5252" : "#00e676";
}

// ADD GASTO
form.addEventListener("submit", (e) => {
  e.preventDefault();

  gastos.push({
    descricao: descricao.value,
    valor: parseFloat(valor.value),
    data: data.value,
    categoria: categoria.value || "Outros",
  });

  salvar();
  listar();
  form.reset();
});

// META
formMeta.addEventListener("submit", (e) => {
  e.preventDefault();

  metaMensal = parseFloat(valorMetaInput.value);
  localStorage.setItem("meta", metaMensal);

  atualizarProgresso();
  formMeta.reset();

  Swal.fire("Meta salva!", "", "success");
});

// FILTRAR
btnFiltrar.addEventListener("click", () => {
  const mes = filtroMes.value;
  if (!mes) return Swal.fire("Escolha um mês!");

  listar(
    gastos.filter((g) => g.data.startsWith(mes))
  );
});

// INICIALIZA
listar();
