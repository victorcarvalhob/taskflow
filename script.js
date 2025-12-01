// Elementos Principais
const novaTarefaBtn = document.getElementById("novaTarefaBtn");
const novaTarefaBtnSidebar = document.getElementById("novaTarefaBtnSidebar");
const modalTarefa = document.getElementById("modalTarefa");
const cancelarBtn = document.getElementById("cancelarBtn");
const formTarefa = document.getElementById("formTarefa");
const listaTarefas = document.getElementById("listaTarefas");

const concluidasEl = document.getElementById("concluidas");
const pendentesEl = document.getElementById("pendentes");
const eficienciaEl = document.getElementById("eficiencia");

const btnMenu = document.getElementById("btnMenu");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const btnCloseSidebar =  document.getElementById("btnCloseSidebar");
const toggleTipoGraficoBtn = document.getElementById("toggleTipoGrafico");
const toggleTipoGraficoSidebarBtn = document.getElementById("toggleTipoGraficoSidebar");

let graficoProdutividade;
let tipoGrafico = "bar";

// Sistema de Toast Notifications
function mostrarToast(mensagem) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast =  document.createElement("div");

    toast.classList.add("toast");
    toast.textContent = mensagem;

    container.appendChild(toast);

    // Entrada
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    // Saída Automática
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Estado
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let filtroAtual = "todas";
let editandoIndex = null;

// Sidebar - Funções
function abrirSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("visible");
    btnMenu.classList.add("open");
    document.body.classList.add("sidebar-open");
    btnMenu.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");

    const first = sidebar.querySelector(".sidebar-link, .btn-ghost");
    if (first) first.focus();
}

function fecharSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("visible");
    btnMenu.classList.remove("open");
    document.body.classList.remove("sidebar-open");
    btnMenu.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");

    btnMenu.focus();
}

btnMenu.addEventListener("click", () => {
    const aberto = sidebar.classList.contains("open");
    if (aberto) fecharSidebar();
    else abrirSidebar();
});

btnCloseSidebar.addEventListener("click", () => fecharSidebar());

sidebarOverlay.addEventListener("click", fecharSidebar);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (!modalTarefa.classList.contains("oculto")) {
            modalTarefa.classList.add("oculto");
            formTarefa.reset();
            editandoIndex = null;
            return;
        }

        if (sidebar.classList.contains("open")) {
            fecharSidebar();
        }
    }
});

// 1. Modal - Abrir/Fechar
function abrirModalNovaTarefa() {
    editandoIndex =  null;
    formTarefa.reset();
    modalTarefa.classList.remove("oculto");

    if (sidebar.classList.contains("open")) fecharSidebar();
}

novaTarefaBtn.addEventListener("click", abrirModalNovaTarefa);
if (novaTarefaBtnSidebar) novaTarefaBtnSidebar.addEventListener("click", abrirModalNovaTarefa);

cancelarBtn.addEventListener("click", () => {
    modalTarefa.classList.add("oculto");
    formTarefa.reset();
    editandoIndex = null;
});

modalTarefa.addEventListener("click", (e) => {
    if (e.target === modalTarefa) {
        modalTarefa.classList.add("oculto");
        formTarefa.reset();
        editandoIndex = null;
    }
});

// 2. Filtros & Renderização
function obterTarefasFiltradas() {
    switch (filtroAtual) {
        case "pendentes":
            return tarefas.filter(t => !t.concluida);
        case "concluidas":
            return tarefas.filter(t => t.concluida);
        case "alta":
        case "media":
        case "baixa":
            return tarefas.filter(t => t.prioridade === filtroAtual);
        default:
            return tarefas;
    }
}

function renderTarefas() {
    listaTarefas.innerHTML = "";

    const filtradas = obterTarefasFiltradas();

    if (filtradas.length === 0) {
        listaTarefas.innerHTML = "<p>Nenhuma tarefa encontrada neste filtro.</p>";
        return;
    }

    filtradas.forEach((tarefa) => {
        const index =  tarefas.indexOf(tarefa);

        const li = document.createElement("li");
        li.innerHTML = `
        <div>
        <input type="checkbox" ${tarefa.concluida ? "checked" : ""} data-index="${index}" class="checkTarefa" aria-label="Marcar tarefa">
        <span style="${tarefa.concluida ? "text-decoration: line-through; color: #9FE870;" : ""}">
        ${tarefa.titulo} - <small>${tarefa.prioridade}</small>
        </span>
        </div>
        <div>
        <button class="editar" data-index="${index}" aria-label="Editar tarefa">✏️</button>
        <button class="excluir" data-index="${index}" aria-label"Excluir tarefa">🗑️</button>
        </div>
        `;
        listaTarefas.appendChild(li);
    });

    atualizarDashboard();
    gerarRelatorio();
}

// 3. Criar ou editar tarefa
formTarefa.addEventListener("submit", (e) => {
    e.preventDefault();

    const dados = {
        titulo: document.getElementById("titulo").value.trim(),
        prioridade: document.getElementById("prioridade").value,
        responsavel: document.getElementById("responsavel").value.trim(),
        data: document.getElementById("data").value,
        concluida: false,
    };

    if (!dados.titulo) {
        mostrarToast("Informe um título para a tarefa.")
        return;
    }

    if (editandoIndex !== null) {
        tarefas[editandoIndex] = {...tarefas[editandoIndex], ...dados };
        editandoIndex = null
        mostrarToast("Tarefa atualizada! ✏️");
    } else {
        tarefas.push(dados);
        mostrarToast("Tarefa adicionada com sucesso! 🎉")
    }

    salvarLocalStorage();
    renderTarefas();
    formTarefa.reset();
    modalTarefa.classList.add("oculto");
});

// 4. Checkbox - Concluir/Pendente
listaTarefas.addEventListener("change", (e) => {
    if (e.target.classList.contains("checkTarefa")) {
        const index = Number(e.target.dataset.index);
        if (Number.isNaN(index)) return;

        tarefas[index].concluida = e.target.checked;

        salvarLocalStorage();
        renderTarefas();

        mostrarToast(e.target.checked ? "Tarefa concluída! ✅" : "Tarefa marcada como pendente. ⏳");
    }
});

// 5. Excluir tarefa
listaTarefas.addEventListener("click", (e) => {
    if (e.target.classList.contains("excluir")) {
        const index = Number(e.target.dataset.index);
        if (Number.isNaN(index)) return;
        tarefas.splice(index, 1);
        salvarLocalStorage();
        renderTarefas();
        mostrarToast("Tarefa excluída! 🗑️");
    }
});

// 6. Editar tarefa
listaTarefas.addEventListener("click", (e) => {
    if (e.target.classList.contains("editar")) {
        const index = Number(e.target.dataset.index);
        if (Number.isNaN(index)) return;
        const t = tarefas[index];
        editandoIndex = index;

        document.getElementById("titulo").value = t.titulo;
        document.getElementById("prioridade").value = t.prioridade;
        document.getElementById("responsavel").value = t.responsavel;
        document.getElementById("data").value = t.data;

        modalTarefa.classList.remove("oculto");
    }
});

// 7. Filtros (Botões)
const botoesFiltro = document.querySelectorAll(".filtro");
botoesFiltro.forEach(btn => {
    btn.addEventListener("click", () => {
        botoesFiltro.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");

        filtroAtual = btn.dataset.filtro;
        renderTarefas();
    });
});

// 8. Dashboard
function atualizarDashboard() {
    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes = tarefas.length - concluidas;
    const eficiencia = tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0;

    concluidasEl.textContent = concluidas;
    pendentesEl.textContent = pendentes;
    eficienciaEl.textContent = `${eficiencia}%`;

    atualizarGrafico();
}

// 9. Gráfico
function atualizarGrafico() {
    const canvas = document.getElementById("graficoProdutividade");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes = tarefas.length - concluidas;
    const eficiencia = tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0;

    const data = {
        labels: ["Concluídas", "Pendentes", "Eficiência (%)"],
        datasets: [{
            label: "Produtividade",
            data: [concluidas, pendentes, eficiencia],
            backgroundColor: [
                "rgba(159, 232, 112, 0.8)",
                "rgba(123, 123, 123, 0.6)",
                "rgba(255, 255, 255, 0.3)"
            ],
            borderColor: [ "#9FE870", "#7B7B7B", "#FFFFFF" ],
            borderWidth: 2,
            borderRadius: 8,
            tension: 0.3
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Produtividade Geral",
                color: "#9FE870",
                padding: 14,
                font: { size: 18, family: "Space Grotesk", weight: "700" }
            },
            legend: {
                labels: { color: "#FFF" }
            }
        },
        animation: { duration: 900, easing: "easeOutQuart" },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: "#9FE870"},
                grid: { color: "rgba(255, 255, 255, 0.05)" }
            },
            x: {
                ticks: { color: "#9FE870" },
                grid: { color: "rgba(255, 255, 255, 0.05)" }
            }
        }
    };

    if (graficoProdutividade) {
        graficoProdutividade.config.type = tipoGrafico;
        graficoProdutividade.data = data;
        graficoProdutividade.options = options;
        graficoProdutividade.update();
        return;
    }

    graficoProdutividade = new Chart(ctx, {
        type: tipoGrafico,
        data,
        options
    });
}

if (toggleTipoGraficoBtn) {
    toggleTipoGraficoBtn.addEventListener("click", () => {
        tipoGrafico = tipoGrafico === "bar" ? "line" : "bar";
        atualizarGrafico();
        mostrarToast(`Gráfico alterado para: ${tipoGrafico === "bar" ? "Barras 📊" : "Linhas 📈"}`);
    });
}

if (toggleTipoGraficoSidebarBtn) {
    toggleTipoGraficoSidebarBtn.addEventListener("click", () => {
        tipoGrafico = tipoGrafico === "bar" ? "line" : "bar";
        atualizarGrafico();
        mostrarToast(`Gráfico alterado para: ${tipoGrafico === "bar" ? "Barras 📊" : "Linhas 📈"}`);
        fecharSidebar();
    });
}

// 10. LocalStorage
function salvarLocalStorage() {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// 11. Relatório
function gerarRelatorio() {
    const relatorio = document.getElementById("relatorioConteudo");

    if (tarefas.length === 0) {
        relatorio.innerHTML = `<p>Nenhum dado disponível ainda. Adicione algumas tarefas!<p>`;
        return;
    }

    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes = total - concluidas;
    const eficiencia = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    const prioridadeOrdem = { alta: 1, media: 2, baixa: 3};

    const tarefaPrioritaria = tarefas
    .filter(t => !t.concluida)
    .sort((a, b) => prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade])[0];

    let blocoPrioritaria = "";

    if (tarefaPrioritaria) {
        blocoPrioritaria = `<h3 style="color:#9FE870; margin-top:20px;">📌 Tarefa Prioritária</h3>
        <p><strong>${tarefaPrioritaria.titulo}</strong></p>
        <p>Prioridade: ${tarefaPrioritaria.prioridade}</p>
        <p>Responsável: ${tarefaPrioritaria.responsavel || "—"}</p>
        <p>Prazo: ${tarefaPrioritaria.data || "—"}</p>`;
    }

    relatorio.innerHTML = `<h3 style="color:#9FE870;">📊 Resumo Geral</h3>
    <p>Total de tarefas: <strong>${total}</strong></p>
    <p>Concluídas: <strong>${concluidas}</strong></p>
    <p>Pendentes: <strong>${pendentes}</strong></p>
    <p>Eficiência: <strong>${eficiencia}%</strong></p>
    
    <h3 style="color:#9FE870; margin-top:20px;">💡 Insights</h3>
    <p>${eficiencia >= 70 ? "Sua produtividade está muito boa! 💚" : "Continue! Você pode melhorar. 🚀"}</p>
    
    ${blocoPrioritaria}`;
}

// 12. Automação 
function adicionarLog(texto) {
    const log = document.getElementById("logAutomacao");
    if (!log) return;
    const p = document.createElement("p");
    p.textContent = texto;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

const executarBtn = document.getElementById("executarAutomacao");
if (executarBtn) {
    executarBtn.addEventListener("click", () => {
        const log = document.getElementById("logAutomacao");
        if (!log) return;
        log.innerHTML = "";
        log.classList.remove("oculto");

        adicionarLog("▶ Iniciando automação...");

        const pendentes = tarefas.filter(t => !t.concluida).length;

        setTimeout(() => adicionarLog("📌 Verificando tarefas pendentes..."), 800);
        setTimeout(() => {
            adicionarLog(`Encontradas ${pendentes} tarefas pendentes.`);
        }, 1500);

        setTimeout(() => adicionarLog("🔄 Calculando eficiência..."), 2200);

        setTimeout(() => {
            const concluidas = tarefas.filter(t => t.concluida).length;
            adicionarLog(`Eficiência atual: ${(concluidas / tarefas.length * 100 || 0).toFixed(0)}%`);
        }, 2900);

        setTimeout(() => adicionarLog("⚙️ Aplicando regras de produtividade..."), 3500);

        setTimeout(() => {
            if (pendentes === 0) {
                adicionarLog("✨ Sem pendências! Produtividade máxima!");
            } else if (pendentes <= 3) {
                adicionarLog("👍 Boa! Poucas tarefas para finalizar.");
            } else {
                adicionarLog("⚠️ Muitas tarefas pendentes! Recomenda-se revisão.");
            }
        }, 4200);

        setTimeout(() => adicionarLog("📤 Enviando relatório simulado..."), 4800);

        setTimeout(() => {
            adicionarLog("✅ Automação concluída com sucesso!");
        }, 5600);
    });
}

// 13. Navegação + Active automático no menu
const sections = document.querySelectorAll("section");
const menuLinks = document.querySelectorAll(".nav a, .sidebar-link");

function atualizarMenuAtivo() {
    let indexAtivo = sections.length;

    while (--indexAtivo && window.scrollY + 140 < sections[indexAtivo].offsetTop) {}

    menuLinks.forEach(link => link.classList.remove("active"));
    if (menuLinks[indexAtivo]) menuLinks[indexAtivo].classList.add("active");
}

window.addEventListener("scroll", atualizarMenuAtivo);

menuLinks.forEach(link => {
    link.addEventListener("click", (ev) => {
        if (sidebar.classList.contains("open")) fecharSidebar();

        menuLinks.forEach(l => l.classList.remove("active"));
        ev.currentTarget.classList.add("active");
    });
});

// 14. Inicialização
document.addEventListener("DOMContentLoaded", () => {
    renderTarefas();
    atualizarGrafico();
    gerarRelatorio();
});

