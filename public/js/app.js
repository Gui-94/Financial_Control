// ====== VERIFICA LOGIN ======
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuarioLogado) {
  window.location.href = "login.html";
}

// ====== ELEMENTOS ======
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

// ===== STORAGE COM BASE NO USUÁRIO ======
const chaveGastos = `gastos_${usuarioLogado.email}`;
const chaveMeta = `meta_${usuarioLogado.email}`;

let gastos = JSON.parse(localStorage.getItem(chaveGastos)) || [];
let metaMensal = parseFloat(localStorage.getItem(chaveMeta)) || 0;

// salvar gastos
function salvarGastos() {
  localStorage.setItem(chaveGastos, JSON.stringify(gastos));
}

// salvar meta
function salvarMeta() {
  localStorage.setItem(chaveMeta, metaMensal);
}

// ====== LISTAR GASTOS ======
function listar(filtro = null) {
  listaGastos.innerHTML = "";

  const itens = filtro || gastos;

  itens.forEach((g) => {
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
      datasets: [
        {
          data: dados,
          backgroundColor: ["#00e676", "#ff5252", "#2979ff", "#ffea00", "#9c27b0"],
        }
      ],
    },
    options: {
      plugins: {
        legend: { labels: { color: "#fff" } }
      }
    }
  });
}

// ====== PROGRESSO DA META ======
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

// ====== ADICIONAR GASTO ======
form.addEventListener("submit", (e) => {
  e.preventDefault();

  gastos.push({
    descricao: descricao.value,
    valor: parseFloat(valor.value),
    data: data.value,
    categoria: categoria.value || "Outros",
  });

  salvarGastos();
  listar();
  form.reset();
});

// ====== META ======
formMeta.addEventListener("submit", (e) => {
  e.preventDefault();

  metaMensal = parseFloat(valorMetaInput.value);
  salvarMeta();

  atualizarProgresso();
  formMeta.reset();

  Swal.fire("Meta salva!", "", "success");
});

// ====== FILTRAR ======
btnFiltrar.addEventListener("click", () => {
  const mes = filtroMes.value;
  if (!mes) return Swal.fire("Escolha um mês!");

  const filtrados = gastos.filter((g) => g.data.startsWith(mes));
  listar(filtrados);
});

// ====== INICIO ======
listar();
atualizarProgresso();
