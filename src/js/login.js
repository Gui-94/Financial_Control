// ====== ELEMENTOS ======
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const toggleForm = document.getElementById("toggleForm");

// ====== TROCAR ENTRE LOGIN E CADASTRO ======
toggleForm.addEventListener("click", () => {
  const loginVisible = loginForm.style.display !== "none";
  loginForm.style.display = loginVisible ? "none" : "block";
  registerForm.style.display = loginVisible ? "block" : "none";
  toggleForm.textContent = loginVisible
    ? "Já tem uma conta? Faça login"
    : "Criar uma conta";
});

// ====== LOGIN ======
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.email === email && u.senha === senha);

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    Swal.fire({
      icon: "success",
      title: "Login realizado com sucesso!",
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      window.location.href = `${window.location.origin}/onepag.html`;

    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Usuário não encontrado",
      text: "Verifique seu email e senha e tente novamente."
    });
  }
});

// ====== CRIAR CONTA ======
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newEmail = document.getElementById("newEmail").value.trim();
  const newSenha = document.getElementById("newSenha").value.trim();

  if (!newEmail || !newSenha) {
    Swal.fire({
      icon: "warning",
      title: "Preencha todos os campos!"
    });
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const emailExiste = users.some((u) => u.email === newEmail);
  if (emailExiste) {
    Swal.fire({
      icon: "error",
      title: "Email já cadastrado",
      text: "Tente fazer login ou use outro email."
    });
    return;
  }

  const novoUsuario = { email: newEmail, senha: newSenha };
  users.push(novoUsuario);
  localStorage.setItem("users", JSON.stringify(users));

  Swal.fire({
    icon: "success",
    title: "Conta criada com sucesso!",
    text: "Agora faça login para continuar."
  }).then(() => {
    registerForm.reset();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    toggleForm.textContent = "Criar uma conta";
  });
});
