// --- 1. AYARLAR ---
const SETTINGS = {
    startHour: 8,       // 08:00
    endHour: 23,        // 23:00
    cycleMinutes: 60,   // 1 Saat
    breakMinutes: 10,   // 10 Dk Mola
    dailyLimit: 1,      // Günlük Limit
    weeklyLimit: 4      // Haftalık Limit
};

// --- 2. KULLANICI BİLGİLERİ ---
const currentUser = { 
    name: "Zeynep Erdem", 
    block: "A Blok",
    penaltyPoints: 0 
};

// --- 3. VERİLER (SİMÜLASYON) ---
const scheduleData = {
    'today': {
        // --- BUGÜN: TAMAMEN DOLU SENARYOSU ---
        '08:00 - 09:00': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '09:10 - 10:10': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '10:20 - 11:20': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '11:30 - 12:30': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '12:40 - 13:40': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '13:50 - 14:50': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '15:00 - 16:00': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '16:10 - 17:10': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '17:20 - 18:20': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '18:30 - 19:30': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '19:40 - 20:40': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '20:50 - 21:50': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' },
        '22:00 - 23:00': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3', 'Y-04': 'u4', 'K-01': 'u5', 'K-02': 'u6' }
    },
    'tomorrow': {
        // --- YARIN: TEK TÜK DOLU SENARYOSU ---
        '08:00 - 09:00': { 'Y-01': 'u1' },
        '09:10 - 10:10': { 'Y-03': 'u3', 'K-01': 'u5' },
        '12:40 - 13:40': { 'Y-02': 'u2', 'Y-04': 'u4' },
        '15:00 - 16:00': { 'K-02': 'u6' },
        '19:40 - 20:40': { 'Y-01': 'u1', 'Y-02': 'u2', 'Y-03': 'u3' }
    }
};

const allMachines = [
    { id: 'Y-01', block: 'A Blok', type: 'Yıkama' },
    { id: 'Y-02', block: 'A Blok', type: 'Yıkama' },
    { id: 'Y-03', block: 'A Blok', type: 'Yıkama' },
    { id: 'Y-04', block: 'A Blok', type: 'Yıkama' },
    { id: 'K-01', block: 'A Blok', type: 'Kurutma' },
    { id: 'K-02', block: 'A Blok', type: 'Kurutma' },
    { id: 'Y-05', block: 'B Blok', type: 'Yıkama' }
];

let myReservations = [];
let pendingSelection = null;

// --- 4. BAŞLANGIÇ ---
document.addEventListener('DOMContentLoaded', () => { 
    initDateSelect(); 
    renderMyReservations();
    updatePenaltyDisplay();
    // Sayfa yüklendiğinde otomatik kontrol (isteğe bağlı)
    // loadMachineSchedule(); 
});

// --- YARDIMCI FONKSİYONLAR ---

function updatePenaltyDisplay() {
    const badge = document.getElementById('displayPenalty');
    if (badge) {
        badge.innerText = currentUser.penaltyPoints;
        if (currentUser.penaltyPoints > 0) {
            badge.parentElement.style.backgroundColor = "#FFF0F1"; 
            badge.parentElement.style.color = "#EC1C24"; 
            badge.parentElement.style.border = "1px solid #EC1C24";
        }
    }
}

function initDateSelect() {
    const gunSelect = document.getElementById('gunSec');
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    
    gunSelect.innerHTML = '';
    gunSelect.add(new Option(`Bugün (${today.toLocaleDateString('tr-TR')})`, 'today'));
    gunSelect.add(new Option(`Yarın (${tomorrow.toLocaleDateString('tr-TR')})`, 'tomorrow'));
}

function formatTime(mins) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

function showToast(msg, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const t = document.createElement('div'); 
    t.className = 'toast'; 
    t.innerHTML = `<i class="${type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}"></i> ${msg}`;
    
    if(type === 'error') t.style.borderLeftColor = "#EC1C24";
    else if(type === 'warning') t.style.borderLeftColor = "#F39C12";
    else t.style.borderLeftColor = "#27AE60"; 
    
    container.appendChild(t); 
    setTimeout(() => t.remove(), 4000);
}

// --- 5. MAKİNE LİSTELEME VE SAATLER ---

function loadMachineSchedule() {
    const container = document.getElementById('scheduleContainer');
    const notifyArea = document.getElementById('fullCapacityNotification'); 
    
    container.innerHTML = ''; 

    const type = document.getElementById('islemTipi').value;
    const dateKey = document.getElementById('gunSec').value;

    const machinesToShow = allMachines.filter(m => m.block === currentUser.block && m.type === type);

    if (machinesToShow.length === 0) { 
        container.innerHTML = '<p style="padding:20px; text-align:center; color:#627D98;">Bu kriterde makine bulunamadı.</p>'; 
        return; 
    }

    let totalAvailableSlots = 0; 

    machinesToShow.forEach(machine => {
        const card = document.createElement('div');
        card.className = 'machine-card';
        card.innerHTML = `
            <div class="machine-header">
                <i class="ri-washing-machine-line"></i>
                <h3>${machine.id}</h3>
                <span>${machine.block}</span>
            </div>
        `;
        
        const slotsWrapper = document.createElement('div');
        slotsWrapper.className = 'slots-wrapper';
        
        const availableInThisMachine = generateTimeButtons(machine.id, dateKey, slotsWrapper);
        totalAvailableSlots += availableInThisMachine;

        card.appendChild(slotsWrapper);
        container.appendChild(card);
    });

    // --- BİLDİRİM KUTUSUNU GÜNCELLE ---
    if (notifyArea) {
        if (totalAvailableSlots > 0) {
            // DURUM 1: YER VAR
            notifyArea.style.background = "#E7F6F8"; 
            notifyArea.style.borderLeftColor = "#10617D"; 
            notifyArea.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="ri-checkbox-circle-fill" style="font-size: 32px; color: #10617D;"></i>
                        <div>
                            <h3 style="margin: 0; color: #0A3D4E; font-size: 16px;">Makineler Müsait</h3>
                            <p style="margin: 5px 0 0 0; color: #10617D; font-size: 14px;">
                                Şu an <strong>${totalAvailableSlots}</strong> adet boş seans var. Randevu alabilirsiniz.
                            </p>
                        </div>
                    </div>
                    <button class="btn" disabled style="background: #10617D; color: #fff; border: none; font-weight: bold; cursor: not-allowed; opacity: 0.6;">
                        <i class="ri-check-line"></i> Şu an Yer Var
                    </button>
                </div>
            `;
        } else {
            // DURUM 2: YER YOK
            notifyArea.style.background = "#FFF0F1"; 
            notifyArea.style.borderLeftColor = "#EC1C24";
            notifyArea.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="ri-alarm-warning-fill" style="font-size: 32px; color: #EC1C24;"></i>
                        <div>
                            <h3 style="margin: 0; color: #B71C1C; font-size: 16px;">Üzgünüz, Boş Yer Yok!</h3>
                            <p style="margin: 5px 0 0 0; color: #D32F2F; font-size: 14px;">
                                Seçtiğiniz kriterlere uygun tüm makineler dolu görünüyor.
                            </p>
                        </div>
                    </div>
                    <button class="btn" style="background: #EC1C24; color: #fff; border: none; font-weight: bold; box-shadow: 0 4px 10px rgba(236, 28, 36, 0.2);" onclick="subscribeNotification()">
                        <i class="ri-notification-3-fill"></i> Boşalınca Bana Bildir
                    </button>
                </div>
            `;
        }
    }
}

function generateTimeButtons(machineId, dateKey, wrapper) {
    let currentMin = SETTINGS.startHour * 60;
    const endMin = SETTINGS.endHour * 60;
    const now = new Date();
    const currentRealMin = (now.getHours() * 60) + now.getMinutes();
    const isToday = (dateKey === 'today');
    
    let availableCount = 0;

    while (currentMin < endMin) {
        const startStr = formatTime(currentMin);
        const endCycleMin = currentMin + SETTINGS.cycleMinutes;
        if (endCycleMin > endMin) break;
        
        const endStr = formatTime(endCycleMin);
        const timeLabel = `${startStr} - ${endStr}`;

        const btn = document.createElement('div');
        
        // --- 1. GEÇMİŞ SAATLER ---
        if (isToday && currentMin <= currentRealMin) {
            btn.className = 'time-btn past';
            btn.innerText = startStr;
        } 
        // --- 2. DOLU SAATLER (GİZLİLİK MODU) ---
        else if (scheduleData[dateKey] && scheduleData[dateKey][timeLabel] && scheduleData[dateKey][timeLabel][machineId]) {
            // İsim yerine "DOLU" yazdırıyoruz
            btn.className = 'time-btn busy';
            btn.innerHTML = `${startStr}<span class="res-name" style="font-size:11px; opacity:0.8;">DOLU</span>`;
        } 
        // --- 3. MÜSAİT SAATLER ---
        else {
            btn.className = 'time-btn available';
            btn.innerHTML = `${startStr}<br><span style="font-size:10px; font-weight:normal;">Seç</span>`;
            btn.onclick = () => checkAndOpenModal(machineId, timeLabel, dateKey);
            availableCount++;
        }

        wrapper.appendChild(btn);
        currentMin = endCycleMin + SETTINGS.breakMinutes;
    }
    return availableCount;
}

// --- 6. REZERVASYON İŞLEMLERİ ---

function checkAndOpenModal(machineId, timeLabel, dateKey) {
    const type = document.getElementById('islemTipi').value;
    const dateDisplay = dateKey === 'today' ? 'Bugün' : 'Yarın';

    const weeklyCount = myReservations.filter(r => r.type === type).length;
    if (weeklyCount >= SETTINGS.weeklyLimit) { 
        showToast(`Haftalık ${SETTINGS.weeklyLimit} adet hakkınız doldu!`, "error"); 
        return; 
    }

    const dailyCount = myReservations.filter(r => r.date === dateDisplay && r.type === type).length;
    if (dailyCount >= SETTINGS.dailyLimit) { 
        showToast(`Bugünlük ${type} hakkınız doldu!`, "error"); 
        return; 
    }

    pendingSelection = { machine: machineId, time: timeLabel, date: dateDisplay, type: type };
    
    const details = document.getElementById('confirmDetails');
    details.innerHTML = `
        <strong>Makine:</strong> ${pendingSelection.machine}<br>
        <strong>Tarih:</strong> ${pendingSelection.date}<br>
        <strong>Saat:</strong> ${pendingSelection.time}
    `;
    
    document.getElementById('confirmModal').classList.remove('hidden');
}

function closeModal() { document.getElementById('confirmModal').classList.add('hidden'); }

function finalizeReservation() {
    if (!pendingSelection) return;

    myReservations.push({ ...pendingSelection, status: 'Bekliyor' });
    showToast(`${pendingSelection.machine} randevusu alındı.`, "success");
    
    closeModal();
    renderMyReservations();
    loadMachineSchedule();
}

function renderMyReservations() {
    const tbody = document.getElementById('myRezBody');
    tbody.innerHTML = '';
    
    if (myReservations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#627D98; padding:15px;">Henüz randevunuz yok.</td></tr>';
        return;
    }

    myReservations.forEach((r, i) => {
        tbody.innerHTML += `
            <tr>
                <td><b>${r.machine}</b></td>
                <td>${r.date}</td>
                <td>${r.time}</td>
                <td><span class="badge badge-info" style="color: #10617D; font-weight:600;">${r.status}</span></td>
                <td>
                    <button onclick="deleteRez(${i})" class="btn-ghost" style="color: #EC1C24; border-color: #EC1C24; font-size:12px; padding:5px 10px;">
                        <i class="ri-close-circle-line"></i> İptal
                    </button>
                </td>
            </tr>`;
    });
}

function deleteRez(i) {
    if(confirm('Randevuyu iptal etmek istiyor musunuz?')) { 
        myReservations.splice(i, 1); 
        renderMyReservations(); 
        showToast("Randevu iptal edildi.", "success"); 
        loadMachineSchedule(); 
    }
}

// --- 7. DİĞER (QR, BİLDİRİM, GEÇİŞ) ---

function handleSingleQR() {
    const resultDiv = document.getElementById('qr-result');
    resultDiv.innerHTML = "Kamera Açılıyor...";
    resultDiv.style.color = "#555";
    setTimeout(() => {
        resultDiv.innerHTML = "✅ QR Başarıyla Okundu!";
        resultDiv.style.color = "#27AE60"; 
        showToast("QR İşlemi Başarılı", "success");
    }, 1000);
}

function subscribeNotification() {
    const btn = document.querySelector('#fullCapacityNotification button');
    
    if(btn) {
        btn.innerHTML = '<i class="ri-check-line"></i> Bildirim Açıldı';
        btn.style.background = "#BFA4F3"; 
        btn.style.color = "#fff"; 
        btn.style.boxShadow = "0 4px 15px rgba(191, 164, 243, 0.4)"; 
        btn.disabled = true;
    }

    showToast("Makine boşaldığında SMS ile haber vereceğiz!", "success");
}

function switchView(id, el) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById('view-' + id);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
}

// --- 8. ARIZA BİLDİRİM ---
function handleFaultReport(e) {
    e.preventDefault(); 
    
    const machineSelect = document.getElementById('faultMachine');
    const machine = machineSelect.value;
    
    if (!machine || machine === "") {
        showToast("Lütfen arızalı makineyi seçiniz!", "error");
        return;
    }

    const btn = document.getElementById('btnAriza');
    const originalText = btn.innerHTML;
    
    btn.classList.remove('btn-primary'); 
    btn.style.backgroundColor = "#27AE60"; 
    btn.innerHTML = '<i class="ri-check-double-line"></i> Bildirim İletildi!';
    
    showToast(`${machine} için arıza kaydı oluşturuldu.`, "success");
    e.target.reset();

    setTimeout(() => {
        btn.style.backgroundColor = ""; 
        btn.classList.add('btn-primary');
        btn.innerHTML = originalText;
    }, 3000);
}

// --- CANLI SAYAÇ FONKSİYONU ---
function startLiveTimer(durationInSeconds) {
    let timer = durationInSeconds;
    const display = document.getElementById('studentTimer');
    const progressBar = document.getElementById('progressBar');
    const statusText = document.getElementById('statusText');
    const totalTime = durationInSeconds;

    const interval = setInterval(function () {
        let minutes = parseInt(timer / 60, 10);
        let seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        if (display) display.innerHTML = `<i class="ri-hourglass-fill"></i> ${minutes}:${seconds}`;

        let percentage = ((totalTime - timer) / totalTime) * 100;
        if (progressBar) progressBar.style.width = percentage + "%";

        if (percentage > 90) statusText.innerText = "Sıkma yapılıyor...";
        else if (percentage > 50) statusText.innerText = "Durulama yapılıyor...";

        if (--timer < 0) {
            clearInterval(interval);
            if (display) display.innerHTML = `<i class="ri-checkbox-circle-line"></i> BİTTİ`;
            if (statusText) statusText.innerText = "İşlem tamamlandı. Lütfen makineyi boşaltın.";
            if (progressBar) { progressBar.style.width = "100%"; progressBar.style.backgroundColor = "#27AE60"; }
            
            showToast("Çamaşırınız bitti! Lütfen makineyi boşaltın.", "success");
        }
    }, 1000);
}

// Sayfa açıldığında 25 dakikalık (1500 saniye) sayaç başlat
document.addEventListener('DOMContentLoaded', () => {
    startLiveTimer(1500); 
});