function handleRegister(e) {
    e.preventDefault();

    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value; // Telefon verisini al
    const pass = document.getElementById('password').value;
    const passConf = document.getElementById('passwordConfirm').value;

    // 1. E-posta Format Kontrolü
    if (!email.includes('@') || !email.includes('.')) {
        showToast("Lütfen geçerli bir e-posta adresi giriniz!", "error");
        return;
    }

    // 2. Telefon Numarası Kontrolü (Basit Uzunluk Kontrolü)
    if (phone.length < 10) {
        showToast("Lütfen geçerli bir telefon numarası giriniz (Başında 0 ile).", "error");
        return;
    }

    // 3. Şifre Kontrolü
    if (pass !== passConf) {
        showToast("Şifreler birbiriyle uyuşmuyor!", "error");
        return;
    }

    // 4. Başarılı Kayıt
    showToast(`Kayıt Başarılı! Hoş geldin ${fullname}.`, "success");

    // Yönlendirme Efekti
    const btn = document.querySelector('.btn-login');
    btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Yönlendiriliyor...';
    btn.disabled = true;
    btn.style.opacity = "0.8";

    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000);
}

// Toast Fonksiyonu (Aynı kalabilir)
function showToast(message, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill';
    let color = type === 'success' ? '#27AE60' : '#EC1C24';

    toast.style.borderLeftColor = color;
    toast.innerHTML = `<i class="${icon}" style="color:${color}; font-size:18px;"></i> ${message}`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}