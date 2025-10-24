// Código JavaScript para a página de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const forgotBtn = document.getElementById('forgotBtn');
  
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
  
        const senhaDigitada = document.getElementById('senha').value;
        const senhaSalva = localStorage.getItem('senha');
  
        if (!senhaSalva) {
            alert("Nenhuma senha cadastrada. Redefina sua senha.");
            return;
        }
  
        if (senhaDigitada === senhaSalva) {
            window.location.href = "../pages/tela.html"; // redireciona após sucesso
        } else {
            alert("Senha incorreta.");
        }
      });
    }
  
    if (forgotBtn) {
      forgotBtn.addEventListener('click', function () {
        // Redireciona para a página de redefinição de senha
        window.location.href = "novasenha.html"; // Ajuste o caminho se necessário
      });
    }
  });