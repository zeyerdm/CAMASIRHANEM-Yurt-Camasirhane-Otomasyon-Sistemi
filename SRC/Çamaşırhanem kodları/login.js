function handleLogin(e) {
    e.preventDefault();

    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    // --- SİMÜLASYON MANTIĞI ---
    
    // 1. Yönetici Girişi
    if (u === "admin" && p === "1234") {
        showToast("Yönetici girişi başarılı! Yönlendiriliyorsunuz...", "success");
        setTimeout(() => {
            window.location.href = "admin.html"; // Yönetici Paneline Git
        }, 1500);
    } 
    // 2. Öğrenci Girişi
    else if (u === "ogrenci" && p === "1234") {
        showToast("Giriş başarılı! Hoş geldin Zeynep.", "success");
        setTimeout(() => {
            window.location.href = "çamaşırhane.html"; // Öğrenci Paneline Git
        }, 1500);
    } 
    // 3. Hatalı Giriş
    else {
        showToast("Kullanıcı adı veya şifre hatalı!", "error");
        
        // Hata efekti (Inputları salla)
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.style.borderColor = "#EC1C24";
            setTimeout(() => input.style.borderColor = "#E7F6F8", 2000);
        });
    }
}

// Şifre Göster/Gizle
function togglePassword() {
    const passInput = document.getElementById('password');
    const icon = document.getElementById('eyeIcon');

    if (passInput.type === "password") {
        passInput.type = "text";
        icon.classList.replace('ri-eye-off-line', 'ri-eye-line');
        icon.style.color = "#10617D";
    } else {
        passInput.type = "password";
        icon.classList.replace('ri-eye-line', 'ri-eye-off-line');
        icon.style.color = "#627D98";
    }
}

// Bildirim Gösterme (Ortak Fonksiyon)
function showToast(message, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = '';
    let color = '';

    if (type === 'success') {
        color = '#27AE60';
        icon = 'ri-checkbox-circle-fill';
    } else {
        color = '#EC1C24';
        icon = 'ri-error-warning-fill';
    }

    toast.style.borderLeftColor = color;
    toast.innerHTML = `<i class="${icon}" style="color:${color}; font-size:18px;"></i> ${message}`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}