// ====== ELEMENTOS ======
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const toggleToRegister = document.getElementById("toggleFormLogin");
const toggleToLogin = document.getElementById("toggleFormRegister");

// ====== TROCAR TELA ======
toggleToRegister.addEventListener("click", () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
});

toggleToLogin.addEventListener("click", () => {
  registerForm.style.display = "none";
  loginForm.style.display = "block";
});

// ====== FUNÇÕES DE VALIDAÇÃO ======
function validarEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

function validarSenha(senha) {
  // mínimo 8 chars, 1 maiúscula, 1 minúscula e 1 número
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(senha);
}

// ====== LOGIN ======
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!validarEmail(email)) {
    return Swal.fire("Email inválido", "Digite um email válido.", "error");
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.email === email && u.senha === senha);

  if (user) {
   localStorage.setItem("usuarioLogado", JSON.stringify(user));


    Swal.fire({
      icon: "success",
      title: "Login realizado!",
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      window.location.href = "./onepag.html";
    });

  } else {
    Swal.fire("Erro", "Email ou senha inválidos.", "error");
  }
});

// ====== CADASTRO ======
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newEmail = document.getElementById("newEmail").value.trim();
  const newSenha = document.getElementById("newSenha").value.trim();

  if (!validarEmail(newEmail)) {
    return Swal.fire("Email inválido", "Digite um email válido.", "warning");
  }

  if (!validarSenha(newSenha)) {
    return Swal.fire(
      "Senha fraca",
      "Sua senha deve ter pelo menos 8 caracteres, 1 letra maiúscula, 1 minúscula e 1 número.",
      "warning"
    );
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const emailExiste = users.some((u) => u.email === newEmail);

  if (emailExiste) {
    return Swal.fire("Erro", "Email já cadastrado!", "error");
  }

  users.push({ email: newEmail, senha: newSenha });
  localStorage.setItem("users", JSON.stringify(users));

  Swal.fire("Conta criada!", "Agora faça login.", "success").then(() => {
    registerForm.reset();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
  });
});
