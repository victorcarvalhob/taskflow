// Header / Navegação Mobile
const btnNavToggle = document.getElementById("btnNavToggle");
const mainNav = document.getElementById("mainNav");
const profileBtn = document.getElementById("profileBtn");
const profileMenu = document.getElementById("profileMenu");
const searchInput = document.getElementById("searchInput");
const searchClear =  document.getElementById("searchClear");

if (btnNavToggle && mainNav) {
    btnNavToggle.addEventListener("click", () => {
        const open = mainNav.classList.toggle("open");
        btnNavToggle.setAttribute("aria-expanded", open ? "true" : "false");
        mainNav.setAttribute("aria-hidden", open ? "false" : "true");

        if (open) {
            const firstLink = mainNav.querySelector("a");
            if (firstLink) firstLink.focus();
        } else {
            btnNavToggle.focus();
        }
    });
}

if (profileBtn && profileMenu) {
    function abrirProfileMenu() {
        profileMenu.classList.add("open");
        profileMenu.setAttribute("aria-hidden", "false");
        profileBtn.setAttribute("aria-expanded", "true");
        const primeiro = profileMenu.querySelector("[role='menuitem']");
        if (primeiro) primeiro.focus();
    }
    function fecharProfileMenu() {
        profileMenu.classList.remove("open");
        profileMenu.setAttribute("aria-hidden", "true");
        profileBtn.setAttribute("aria-expanded", "false");
    }

    profileBtn.addEventListener("click", (e) => {
        const aberto = profileMenu.classList.contains("open");
        if (aberto) fecharProfileMenu();
        else abrirProfileMenu();
    });

    document.addEventListener("click", (e) => {
        if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
            fecharProfileMenu();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            fecharProfileMenu();
        }
    });
}

if (searchInput) {
    function atualizarClear() {
        if (searchInput.value && searchClear) searchClear.hidden = false;
        else if (searchClear) searchClear.hidden = true;
    }

    searchInput.addEventListener("input", () => {
        atualizarClear();


    });

    if (searchClear) {
        searchClear.addEventListener("click", () => {
            searchInput.value = "";
            atualizarClear();
            searchInput.focus();
            
        });
    }
}

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

        if (mainNav && mainNav.classList.contains("open")) {
            mainNav.classList.remove("open");
            if (btnNavToggle) btnNavToggle.setAttribute("aria-expanded", "false");
            mainNav.setAttribute("aria-hidden", "true");
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
        li.classList.add("task-card");

        li.innerHTML = `
        <div class="task-left">
        <label class="task-check">
        <input type="checkbox" ${tarefa.concluida ? "checked" : ""} 
        data-index="${index}" 
        class="checkTarefa">
        <span class="checkmark"></span>
        </label>

        <div class="task-info">
        <h4 class="${tarefa.concluida ? "done" : ""}">
        ${tarefa.titulo}
        </h4>

        <div class="task-meta">
        <span class="tag prioridade ${tarefa.prioridade}">
        ${tarefa.prioridade}
        </span>
        ${tarefa.data ? `<span class="tag data">📅 ${tarefa.data}</span>` : ""}
        ${tarefa.responsavel ? `<span class="tag user">👤 ${tarefa.responsavel}</span>` : ""}
        </div>
        </div>
        </div>

        <div class="task-actions">
        <button class="editar" data-index="${index}" title="Editar">✏️</button>
        <button class="excluir" data-index="${index}" title="Excluir">🗑️</button>
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

    // Gradientes
    const gradConcluidas = ctx.createLinearGradient(0, 0, 0, 300);
    gradConcluidas.addColorStop(0, "rgba(159, 232, 112, 1)");
    gradConcluidas.addColorStop(1, "rgba(159, 232, 112, 0.3)");

    const gradPendentes = ctx.createLinearGradient(0, 0, 0, 300);
    gradPendentes.addColorStop(0, "rgba(255, 209, 112, 0.9)");
    gradPendentes.addColorStop(1, "rgba(255, 209, 112, 0.3)");

    const gradEficiencia = ctx.createLinearGradient(0, 0, 0, 300);
    gradEficiencia.addColorStop(0, "rgba(110, 231, 255, 0.9)");
    gradEficiencia.addColorStop(1, "rgba(110, 231, 255, 0.3)");

    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes = tarefas.length - concluidas;
    const eficiencia = tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0;

    const data = {
        labels: ["Concluídas", "Pendentes", "Eficiência (%)"],
        datasets: [{
            label: "Produtividade",
            data: [concluidas, pendentes, eficiencia],
            backgroundColor: [
                gradConcluidas,
                gradPendentes,
                gradEficiencia
            ],
            borderWidth: 0,
            borderRadius: 12,
            tension: 0.4,
            fill: true
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "#CFEFD0",
                    font: { size: 13 }
                }
            },
            tooltip: {
                backgroundColor: "rgba(6, 47, 40, 0.95)",
                titleColor: "#9FE870",
                bodyColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                padding: 12,
                cornerRadius: 8
            },
            title: {
                display: true,
                text: "📊 Produtividade Geral",
                color: "#9FE870",
                padding: 20,
                font: { size: 18, family: "Space Grotesk", weight: "700" }
            }
        },
        animation: { duration: 1200, easing: "easeOutQuart" },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: "#9FE870", font: { size: 12 } },
                grid: { color: "rgba(255, 255, 255, 0.05)" }
            },
            x: {
                ticks: { color: "#9FE870", font: { size: 12 } },
                grid: { display: false }
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
        relatorio.innerHTML = `<p>Nenhum dado disponível ainda. Complete algumas tarefas!</p>`;
        return;
    }

    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes = total - concluidas;
    const eficiencia = Math.round((concluidas / total) * 100);

    const prioridadeOrdem = { alta: 1, media: 2, baixa: 3 };

    const tarefaPrioritaria = tarefas
    .filter(t => !t.concluida)
    .sort((a, b) => prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade])[0];

    relatorio.innerHTML = `
    <div class="relatorio-card success">
    <h4>✅ Concluídas</h4>
    <strong>${concluidas}</strong>
    </div>
    
    <div class="relatorio-card warning">
    <h4>⏳ Pendentes</h4>
    <strong>${pendentes}</strong>
    </div>
    
    <div class="relatorio-card info">
    <h4>⚡ Eficiência</h4>
    <strong>${eficiencia}<span>%</span></strong>
    </div>
    
    <div class="relatorio-card relatorio-highlight">
    <h4>💡 Insight Geral</h4>
    <p>
    ${
        eficiencia >= 70
        ? "Excelente produtividade! Continue nesse ritmo 💚"
        : "Produtividade moderada. Pequenos ajustes podem ajudar 🚀"
    }
    </p>
    </div>
    
    ${
        tarefaPrioritaria
        ? `
        <div class="relatorio-card relatorio-highlight">
        <h4>📌 Tarefa Prioritária</h4>
        <p><strong>${tarefaPrioritaria.titulo}</strong></p>
        <p>Prioridade: ${tarefaPrioritaria.prioridade}</p>
        <p>Responsável: ${tarefaPrioritaria.responsavel || "—"}</p>
        <p>Prazo: ${tarefaPrioritaria.data || "—"}</p>
        `
        : ""
    }
    `;
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
    let sectionAtual = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY + 160 >= sectionTop &&
            window.scrollY + 160 < sectionTop + sectionHeight) {
                sectionAtual = section.getAttribute("id");
            }
});

menuLinks.forEach(link => {
    link.classList.remove("active");

    if (link.getAttribute("href") === `#${sectionAtual}`) {
        link.classList.add("active");
    }
});
}

window.addEventListener("scroll", atualizarMenuAtivo);

menuLinks.forEach(link => {
    link.addEventListener("click", () => {
        menuLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");

        if (sidebar && sidebar.classList.contains("open")) {
            fecharSidebar();
        }

        if (mainNav && mainNav.classList.contains("open")) {
            mainNav.classList.remove("open");
            if (btnNavToggle) btnNavToggle.setAttribute("aria-expanded", "false");
            mainNav.setAttribute("aria-hidden", "true");
        }
    });
});

// 14. Inicialização
document.addEventListener("DOMContentLoaded", () => {
    renderTarefas();
    atualizarGrafico();
    gerarRelatorio();
});

