# 💰 Controle de Gastos

Sistema simples de **controle de gastos pessoais**, desenvolvido com **Node.js**, **SQLite** e **JavaScript puro**.  
O objetivo é registrar, listar e gerenciar despesas de forma prática e intuitiva.

---

## 🧩 Estrutura do Projeto


📁 backend
┣ 📁 models
┃ ┗ 📄 Gasto.js → Modelo de dados dos gastos
┣ 📁 routes
┃ ┣ 📄 server.js → Configuração do servidor e rotas da API
┃ ┗ 📄 database.sqlite → Banco de dados local (SQLite)
┗ 📄 package.json → Dependências e scripts do backend

📁 frontend
┣ 📁 css
┃ ┗ 📄 style.css → Estilos da interface
┣ 📁 js
┃ ┣ 📄 script.js → Lógica e interações da interface
┃ ┗ 📁 img → Imagens utilizadas no site
┗ 📄 index.html → Página principal (frontend)

📄 .gitignore → Arquivos ignorados pelo Git
📄 README.md → Documentação do projeto

yaml
Copiar código


---

## 🚀 Tecnologias Utilizadas

- 🟢 **Node.js** – Ambiente de execução JavaScript no backend  
- ⚙️ **Express.js** – Framework para criação do servidor e rotas  
- 🗄️ **SQLite** – Banco de dados leve e local  
- 🎨 **HTML5, CSS3, JavaScript** – Desenvolvimento do frontend  

---

## ⚙️ Como Executar o Projeto

1. **Clone o repositório**
   ```bash
   git clone https://github.com/SeuUsuario/NomeDoRepositorio.git

Acesse a pasta do backend:
cd backend

Instale as dependências:
npm install

Inicie o servidor:
node server.js

Abra o frontend

-Vá até a pasta frontend
-Abra o arquivo index.html no navegador
-(ou use a extensão Live Server no VSCode)

🧠 Funcionalidades

✅ Adicionar novos gastos
✅ Listar todos os gastos registrados
✅ Armazenar dados localmente com SQLite
✅ Interface simples e direta

👨‍💻 Autores

 Guilherme Tavares e Lucas Cabral

🚀 Sempre buscando aprender e evoluir