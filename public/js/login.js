// ====== ELEMENTOS ======
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const toggleToRegister = document.getElementById("toggleToRegister");
const toggleToLogin = document.getElementById("toggleToLogin");

// ====== TROCAR TELA ======
toggleToRegister.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  registerForm.style.display = "block";
});

toggleToLogin.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.style.display = "none";
  loginForm.style.display = "block";
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
      title: "Login realizado!",
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      window.location.href = "/onepag.html";
    });

  } else {
    Swal.fire({
      icon: "error",
      title: "Usuário não encontrado",
      text: "Verifique seu email e senha."
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
      text: "Use outro email."
    });
    return;
  }

  users.push({ email: newEmail, senha: newSenha });
  localStorage.setItem("users", JSON.stringify(users));

  Swal.fire({
    icon: "success",
    title: "Conta criada!",
    text: "Faça login para continuar."
  }).then(() => {
    registerForm.reset();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
  });
});
