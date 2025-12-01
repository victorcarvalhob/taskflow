# ⚡ TaskFlow — Painel de Produtividade

O **TaskFlow** é um painel moderno de produtividade desenvolvido com **HTML, CSS e JavaScript**, focado em oferecer uma experiência interativa e intuitiva.  
Ele reúne recursos de **gestão de tarefas**, **gráficos dinâmicos**, **sidebar deslizante**, **relatórios automáticos** e até uma **automação estilo Power Automate**.

---

## 🚀 Funcionalidades

### ✅ **Gerenciamento de Tarefas**
- Criar tarefas com:
  - Título  
  - Prioridade (Alta, Média, Baixa)  
  - Responsável  
  - Data  
- Editar e excluir tarefas  
- Marcar como concluída ou pendente  
- Filtros inteligentes:
  - Todas  
  - Pendentes  
  - Concluídas  
  - Por prioridade  

---

### 📊 **Dashboard Interativo**
- Contadores automáticos:
  - Tarefas concluídas  
  - Pendentes  
  - Eficiência geral  
- Gráfico dinâmico com **Chart.js**  
- Botão para alternar o tipo de gráfico:  
  - **Barras (📊)**  
  - **Linhas (📈)**  

---

### 📁 **Sidebar Deslizante (Mobile Friendly)**
- Abertura suave com animações CSS  
- Botão hambúrguer com animação X  
- Links de navegação  
- Botões integrados:
  - Criar nova tarefa  
  - Alterar tipo de gráfico  
- Overlay com desfoque  
- Totalmente acessível:
  - `aria-label`
  - `aria-expanded`
  - `aria-hidden`
  - Foco controlado via teclado  

---

### 📝 **Relatórios Automáticos**
Geração automática de relatório com:
- Total de tarefas  
- Concluídas  
- Pendentes  
- Eficiência (%)  
- Próxima tarefa prioritária  

Com insights motivacionais dependendo da sua eficiência.

---

### ⚙️ **Automação Estilo Power Automate**
Simula a execução de um fluxo automatizado:
- Logs com delay (como um workflow real)
- Etapas:
  1. Início  
  2. Verificação de pendências  
  3. Cálculo de eficiência  
  4. Aplicação de regras  
  5. Envio de relatório  
- Finalização com feedback visual

---

### 🔔 **Toast Notifications**
Alertas elegantes para:
- Conclusão de tarefas  
- Erros  
- Exclusões  
- Alteração do gráfico  
- Atualizações  

Com animação suave de entrada e saída.

---

## 🧩 Tecnologias Utilizadas

| Tecnologia | Descrição |
|-----------|-----------|
| **HTML5** | Estrutura semântica do projeto |
| **CSS3**  | Estilização moderna, animações, responsividade |
| **JavaScript (ES6)** | Lógica principal, manipulação da DOM |
| **Chart.js** | Gráficos dinâmicos e animados |
| **LocalStorage** | Persistência de dados |
| **Google Fonts** | Urbanist, Jakarta Sans, Space Grotesk |

---

## 📂 Estrutura do Projeto

```
taskflow/
│── images
│── index.html
│── style.css
│── script.js
└── README.md
```

---

## 🖼️ Screenshots

![Dashboard](/images/dashboard-screenshot.png)

![Sidebar](/images/sidebar-screenshot.png)

![Modal](/images/modal-screenshot.png)

![Gerenciador de Tarefas](/images/gerenciador-de-tarefas-screenshot.png)

![Relatório + Automação](/images/relatorio-e-automacao-screenshot.png)

---

## ⚙️ Como Executar o Projeto

1. Baixe ou clone este repositório:

```bash
git clone https://github.com/victorcarvalhob/taskflow
```
2. Abra o arquivo index.html no navegador.

➡️ Não é necessário servidor local.
Tudo funciona com HTML + JS puro.

---

## 📄 Licença

Este projeto está sob a licença MIT — fique à vontade para usar e modificar.

--- 

## 👨‍💻 Autor 

Desenvolvido por **Victor Carvalho**
[🔗 GitHub](https://github.com/victorcarvalhob)

