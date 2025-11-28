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
const btnLimparFiltro = document.getElementById("btnLimparFiltro");

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

  itens.forEach((g, index) => {
    const valor = parseFloat(g.valor) || 0;

    const li = document.createElement("li");
    li.classList.add("item-gasto");

    const corValor = valor > 300 ? "valor-vermelho" : "valor-verde";

    li.innerHTML = `
      <div class="info">
        <strong>${g.descricao}</strong>
        <span class="categoria">${g.categoria || ""} • ${formatDate(g.data)}</span>
      </div>

      <div class="valor-acoes">
        <span class="valor ${corValor}">R$ ${valor.toFixed(2)}</span>

        <div class="acoes">
          <button class="btn-editar" onclick="editarGasto(${index})" title="Editar">✏️</button>
          <button class="btn-excluir" onclick="excluirGasto(${index})" title="Excluir">🗑️</button>
        </div>
      </div>
    `;

    listaGastos.appendChild(li);
  });

  atualizarResumo();
  atualizarMetaFinanceira();  // <<< atualização incluída
}

// formatar data
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString();
}

// ====== RESUMO ======
function atualizarResumo() {
  const total = gastos.reduce((acc, g) => acc + parseFloat(g.valor || 0), 0);

  const porCategoria = {};
  gastos.forEach(g => {
    const cat = g.categoria || "Outros";
    porCategoria[cat] = (porCategoria[cat] || 0) + parseFloat(g.valor || 0);
  });

  let html = `<p>Total gasto: <b class="valor-vermelho">R$ ${total.toFixed(2)}</b></p>`;
  html += `<div style="margin-top:8px"><strong>Por categoria:</strong>`;
  for (const [cat, v] of Object.entries(porCategoria)) {
    html += `<p style="margin:3px 0">${cat}: R$ ${v.toFixed(2)}</p>`;
  }
  html += `</div>`;

  resumoDiv.innerHTML = html;

  atualizarGrafico();
}

// ====== GRÁFICO ======
let chart;
function atualizarGrafico() {
  if (!ctx) return;

  const categorias = {};
  gastos.forEach(g => {
    const cat = g.categoria || "Outros";
    categorias[cat] = (categorias[cat] || 0) + parseFloat(g.valor || 0);
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
          backgroundColor: ["#00e676", "#ff5252", "#2979ff", "#ffea00", "#9c27b0", "#00bcd4", "#ff9800"],
        }
      ],
    },
    options: {
      plugins: {
        legend: { labels: { color: "#fff" } }
      },
      maintainAspectRatio: false
    }
  });
}

// ======================================================================
//                🔥 NOVA FUNÇÃO — ULTRAPASSAGEM DE META 🔥
// ======================================================================
function atualizarMetaFinanceira() {
  const total = gastos.reduce((acc, g) => acc + parseFloat(g.valor || 0), 0);

  if (!metaMensal || metaMensal <= 0) {
    metaValor.textContent = "0.00";
    gastoAtual.textContent = total.toFixed(2);
    percentualMeta.innerHTML = "Defina uma meta para começar.";
    progress.style.width = "0%";
    progress.style.background = "#00e676";
    return;
  }

  const dif = total - metaMensal;           // diferença do gasto atual para meta
  const pct = (total / metaMensal) * 100;   // percentual

  // Atualiza valores básicos
  metaValor.textContent = metaMensal.toFixed(2);
  gastoAtual.textContent = total.toFixed(2);

  // ----- ULTRAPASSOU (dif > 0) -----
  if (dif > 0) {
    percentualMeta.innerHTML =
      `<span style="color:#ff2b2b;font-weight:bold">⚠ Você ultrapassou a meta!</span><br>` +
      `Excedido: <b style="color:#ff2b2b">R$ ${dif.toFixed(2)}</b>`;

    progress.style.width = "100%";
    progress.style.background = "#ff2b2b";

  // ----- META EXATA -----
  } else if (dif === 0) {
    percentualMeta.innerHTML =
      `<span style="color:#1e90ff;font-weight:bold">🎯 Meta atingida exatamente!</span>`;
    
    progress.style.width = "100%";
    progress.style.background = "#1e90ff";

  // ----- ABAIXO DA META -----
  } else {
    const falta = Math.abs(dif).toFixed(2);
    percentualMeta.innerHTML =
      `Você usou <b>${pct.toFixed(1)}%</b> da meta.<br>` +
      `Ainda pode gastar <b style="color:#00e676">R$ ${falta}</b>.`;

    const largura = Math.min(pct, 100);
    progress.style.width = largura + "%";

    progress.style.background =
      pct < 70 ? "#00e676" :
      pct < 100 ? "#ffa726" :
      "#ff2b2b";
  }
}

// ======================================================================


// ====== ADICIONAR GASTO ======
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const descricaoEl = document.getElementById("descricao");
  const valorEl = document.getElementById("valor");
  const dataEl = document.getElementById("data");
  const categoriaEl = document.getElementById("categoria");

  if (!descricaoEl.value || !valorEl.value || !dataEl.value) {
    return Swal.fire("Preencha descrição, valor e data", "", "warning");
  }

  gastos.push({
    descricao: descricaoEl.value,
    valor: parseFloat(valorEl.value),
    data: dataEl.value,
    categoria: categoriaEl.value || "Outros",
  });

  salvarGastos();
  listar();
  form.reset();

  Swal.fire({ icon: "success", title: "Gasto adicionado!", showConfirmButton: false, timer: 1000 });
});

// ====== META ======
formMeta.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!valorMetaInput.value) return Swal.fire("Digite um valor para a meta", "", "warning");

  metaMensal = parseFloat(valorMetaInput.value);
  salvarMeta();

  atualizarMetaFinanceira();
  formMeta.reset();

  Swal.fire("Meta salva!", "", "success");
});

// ====== FILTRAR ======
btnFiltrar.addEventListener("click", () => {
  const mes = filtroMes.value;
  if (!mes) return Swal.fire("Escolha um mês!");

  const filtrados = gastos.filter((g) => String(g.data || "").startsWith(mes));
  listar(filtrados);
});

if (btnLimparFiltro) {
  btnLimparFiltro.addEventListener("click", () => {
    filtroMes.value = "";
    listar();
  });
}

// ====== EDITAR GASTO ======
function editarGasto(index) {
  const g = gastos[index];

  Swal.fire({
    title: "Editar Gasto",
    html: `
      <input id="edit-desc" class="swal2-input" placeholder="Descrição" value="${escapeHtml(g.descricao)}">
      <input id="edit-valor" class="swal2-input" type="number" step="0.01" placeholder="Valor" value="${g.valor}">
      <input id="edit-data" class="swal2-input" type="date" value="${g.data}">
      <input id="edit-cat" class="swal2-input" placeholder="Categoria" value="${escapeHtml(g.categoria)}">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Salvar",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const novaDesc = document.getElementById("edit-desc").value;
      const novoValor = parseFloat(document.getElementById("edit-valor").value);
      const novaData = document.getElementById("edit-data").value;
      const novaCat = document.getElementById("edit-cat").value;

      if (!novaDesc || isNaN(novoValor) || !novaData) {
        Swal.showValidationMessage("Preencha descrição, valor e data corretamente");
        return false;
      }

      return { novaDesc, novoValor, novaData, novaCat };
    }
  }).then((res) => {
    if (!res.isConfirmed || !res.value) return;

    const { novaDesc, novoValor, novaData, novaCat } = res.value;

    gastos[index] = {
      descricao: novaDesc,
      valor: novoValor,
      data: novaData,
      categoria: novaCat || "Outros",
    };

    salvarGastos();
    listar();

    Swal.fire("Pronto!", "Gasto atualizado com sucesso!", "success");
  });
}

// ====== EXCLUIR GASTO ======
function excluirGasto(index) {
  Swal.fire({
    title: "Tem certeza?",
    text: "Essa ação não poderá ser desfeita!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, excluir",
    cancelButtonText: "Cancelar"
  }).then((res) => {
    if (!res.isConfirmed) return;

    gastos.splice(index, 1);

    salvarGastos();
    listar();

    Swal.fire("Excluído!", "O gasto foi removido.", "success");
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ====== INICIO ======
listar();
atualizarMetaFinanceira();
