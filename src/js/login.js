document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const toggleForm = document.getElementById('toggleForm');
  const forgotBtn = document.getElementById('forgotBtn');

  // Alterna entre login e cadastro
  toggleForm.addEventListener('click', () => {
    const isLoginVisible = loginForm.style.display !== 'none';
    loginForm.style.display = isLoginVisible ? 'none' : 'block';
    registerForm.style.display = isLoginVisible ? 'block' : 'none';
    toggleForm.textContent = isLoginVisible ? 'Já tenho uma conta' : 'Criar uma conta';
  });

  // Função para exibir SweetAlert
  const showAlert = (icon, title, text, color = '#3085d6') => {
    Swal.fire({ icon, title, text, confirmButtonColor: color });
  };

  // Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!usuario || usuario.email !== email) {
      return showAlert('error', 'Usuário não encontrado 😕', 'Verifique o e-mail e tente novamente.', '#ff4d4d');
    }

    if (usuario.senha !== senha) {
      return showAlert('warning', 'Senha incorreta ⚠️', 'Tente novamente!', '#f39c12');
    }

    Swal.fire({
      icon: 'success',
      title: 'Login realizado 🎉',
      text: 'Bem-vindo de volta!',
      confirmButtonColor: '#2ecc71',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      localStorage.setItem('logado', 'true');
      window.location.href = 'pages/onepag.html';
    });
  });

  // Cadastro
 // Cadastro (versão corrigida)
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newEmail = document.getElementById('newEmail').value.trim();
  const newSenha = document.getElementById('newSenha').value;

  // Pega lista de usuários existente ou cria uma vazia
  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  // Verifica se já existe um usuário com o mesmo e-mail
  if (usuarios.some(u => u.email === newEmail)) {
    return showAlert('warning', 'Email já cadastrado ⚠️', 'Tente outro email.', '#f39c12');
  }

  // Adiciona novo usuário
  usuarios.push({ email: newEmail, senha: newSenha });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  showAlert('success', 'Conta criada 🙌', 'Agora faça login para continuar.', '#2ecc71');

  // Volta pro login
  registerForm.style.display = 'none';
  loginForm.style.display = 'block';
  toggleForm.textContent = 'Criar uma conta';
});


  // Redefinição de senha
  if (forgotBtn) {
    forgotBtn.addEventListener('click', () => window.location.href = 'novasenha.html');
  }
});
