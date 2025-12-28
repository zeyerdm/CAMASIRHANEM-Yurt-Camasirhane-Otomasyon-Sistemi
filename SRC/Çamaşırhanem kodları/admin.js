// --- 1. VERİLER ---
let students = [
    { id: 1, name: "Zeynep Yılmaz", room: "A-101", points: 15, status: "Aktif" },
    { id: 2, name: "Ali Demir", room: "A-102", points: 100, status: "Görüşülecek" },
    { id: 3, name: "Ayşe Kaya", room: "A-103", points: 0, status: "Aktif" },
    { id: 4, name: "Fatma Çelik", room: "A-201", points: 105, status: "Görüşülecek" },
    { id: 5, name: "Mehmet Öz", room: "A-202", points: 5, status: "Aktif" }
];

let reservations = [
    { id: "R-101", studentId: 1, name: "Zeynep Yılmaz", machine: "Y-01", time: "14:00", status: "Bekliyor" },
    { id: "R-102", studentId: 3, name: "Ayşe Kaya", machine: "K-01", time: "14:00", status: "İşlemde" },
    { id: "R-103", studentId: 5, name: "Mehmet Öz", machine: "Y-02", time: "15:00", status: "Bekliyor" }
];

let machines = [
    { code: "Y-01", type: "Yıkama", location: "A Blok", status: "Müsait" },
    { code: "Y-02", type: "Yıkama", location: "A Blok", status: "Çalışıyor" },
    { code: "Y-03", type: "Yıkama", location: "A Blok", status: "Arızalı" },
    { code: "Y-04", type: "Yıkama", location: "A Blok", status: "Müsait" },
    { code: "K-01", type: "Kurutma", location: "A Blok", status: "Çalışıyor" },
    { code: "K-02", type: "Kurutma", location: "A Blok", status: "Müsait" }
];

let faults = [
    { id: "A-50", machine: "Y-03", issue: "Makine su almıyor ve E-10 hatası veriyor.", status: "Açık" }
];

// --- AYARLAR ---
let config = {
    noShowPenalty: 5, 
    banLimit: 100,
    dailyLimitWash: 1, 
    weeklyLimitWash: 3,
    dailyLimitDry: 1,
    weeklyLimitDry: 2
};

// --- BAŞLANGIÇ ---
document.addEventListener('DOMContentLoaded', () => {
    loadSettings(); 
    updateDashboard();
    renderMachineTable();
    renderStudentTable();
    renderReservationTable();
    renderFaultTable();
    
    // Otomatik sistemi başlat
    setInterval(autoCheckPenalties, 5000);
});

// --- AYARLARI YÜKLEME VE KAYDETME ---
function loadSettings() {
    const storedRules = localStorage.getItem('laundryRules');
    if (storedRules) {
        const data = JSON.parse(storedRules);
        
        if(data.settingNoShow) config.noShowPenalty = parseInt(data.settingNoShow);
        if(data.settingLimit) config.banLimit = parseInt(data.settingLimit);
        
        // HTML Elementlerini Doldur
        const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
        
        setVal('settingNoShow', config.noShowPenalty);
        setVal('settingLimit', config.banLimit);
        setVal('settingDailyWash', data.dailyWash || 1);
        setVal('settingWeeklyWash', data.weeklyWash || 3);
        setVal('settingDailyDry', data.dailyDry || 1);
        setVal('settingWeeklyDry', data.weeklyDry || 2);
        
        ['rule1', 'rule2', 'rule3', 'rule4'].forEach(r => {
            if(document.getElementById(r) && data[r]) document.getElementById(r).value = data[r];
        });
    }
}

function saveRules(e) {
    e.preventDefault();
    
    const rules = {
        rule1: document.getElementById('rule1').value,
        rule2: document.getElementById('rule2').value,
        rule3: document.getElementById('rule3').value,
        rule4: document.getElementById('rule4').value,
        
        settingNoShow: document.getElementById('settingNoShow').value,
        settingLimit: document.getElementById('settingLimit').value,

        dailyWash: document.getElementById('settingDailyWash').value,
        weeklyWash: document.getElementById('settingWeeklyWash').value,
        dailyDry: document.getElementById('settingDailyDry').value,
        weeklyDry: document.getElementById('settingWeeklyDry').value
    };

    localStorage.setItem('laundryRules', JSON.stringify(rules));
    
    // Config güncelle
    config.noShowPenalty = parseInt(rules.settingNoShow);
    config.banLimit = parseInt(rules.settingLimit);

    showToast("Tüm ayarlar ve kurallar başarıyla güncellendi!", "success");
    updateDashboard(); 
}

// --- OTOMATİK CEZA ---
function autoCheckPenalties() {
    const simCurrentTime = "14:15"; 
    let penaltiesApplied = 0;

    reservations.forEach(res => {
        if (res.status === "Bekliyor" && res.time < simCurrentTime) {
            res.status = "Gelmedi";
            const student = students.find(s => s.id === res.studentId);
            if (student) {
                student.points += config.noShowPenalty; 
                penaltiesApplied++;
                if (student.points >= config.banLimit) student.status = "Görüşülecek";
                showToast(`OTOMATİK CEZA: ${student.name} gelmedi. +${config.noShowPenalty} Puan.`, "warning");
            }
        }
    });

    if (penaltiesApplied > 0) {
        renderStudentTable();
        renderReservationTable();
        updateDashboard();
    }
}

// --- DASHBOARD VE TABLOLAR ---
function updateDashboard() {
    document.getElementById('stat-total').innerText = machines.length;
    
    const interviewCount = students.filter(s => s.points >= config.banLimit).length;
    const statInterview = document.getElementById('stat-interview');
    if(statInterview) statInterview.innerText = interviewCount;

    document.getElementById('stat-fault').innerText = faults.length;
    renderChart();
}
// --- 2. MAKİNE YÖNETİMİ (GELİŞMİŞ) ---

function renderMachineTable() {
    const tbody = document.getElementById('makineTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    // İstatistikleri Hesapla
    let activeCount = 0;
    let brokenCount = 0;

    machines.forEach(m => {
        // İstatistik
        if (m.status === 'Çalışıyor') activeCount++;
        if (m.status === 'Arızalı' || m.status === 'Bakımda') brokenCount++;

        // Duruma göre Badge Rengi
        let badgeClass = '';
        let statusIcon = '';
        
        if (m.status === 'Müsait') { 
            badgeClass = 'badge-success'; 
            statusIcon = '<i class="ri-checkbox-circle-line"></i>';
        } else if (m.status === 'Çalışıyor') { 
            badgeClass = 'badge-info'; // Mavi
            statusIcon = '<i class="ri-loader-2-line"></i>';
        } else if (m.status === 'Rezerve') {
            badgeClass = 'badge-warning'; // Turuncu
            statusIcon = '<i class="ri-time-line"></i>';
        } else { 
            badgeClass = 'badge-busy'; // Kırmızı (Arızalı/Bakımda)
            statusIcon = '<i class="ri-prohibited-line"></i>';
        }

        // --- MÜDAHALE KONTROLÜ (KİLİT NOKTA) ---
        // Eğer makine Çalışıyor veya Rezerve ise butonlar PASİF olur.
        const isLocked = (m.status === 'Çalışıyor' || m.status === 'Rezerve');
        
        const btnStyle = isLocked ? 'opacity: 0.5; cursor: not-allowed;' : '';
        const deleteAction = isLocked ? '' : `onclick="deleteMachine('${m.code}')"`;
        const editAction = isLocked ? '' : `onclick="openEditModal('${m.code}')"`;

        tbody.innerHTML += `
            <tr>
                <td><span style="font-weight: 700; color: #10617D;">${m.code}</span></td>
                <td>${m.type}</td>
                <td>${m.location}</td>
                <td><span class="badge ${badgeClass}" style="display:inline-flex; align-items:center; gap:5px;">${statusIcon} ${m.status}</span></td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 10px;">
                        
                        <button class="btn-ghost" style="color: #10617D; ${btnStyle}" ${editAction} title="Düzenle / Bakıma Al">
                            <i class="ri-settings-3-line" style="font-size: 18px;"></i>
                        </button>

                        <button class="btn-ghost" style="color: #C0392B; ${btnStyle}" ${deleteAction} title="Makineyi Sil">
                            <i class="ri-delete-bin-line" style="font-size: 18px;"></i>
                        </button>

                    </div>
                </td>
            </tr>`;
    });

    // İstatistikleri Ekrana Bas
    document.getElementById('total-machines-count').innerText = machines.length;
    document.getElementById('active-machines-count').innerText = activeCount;
    document.getElementById('broken-machines-count').innerText = brokenCount;
}

// --- YENİ MAKİNE EKLEME (HIZLI MODAL) ---
// Not: Bu basit bir prompt yerine modal da olabilir ama şimdilik prompt hızlı çözüm.
// --- YENİ MAKİNE EKLEME İŞLEMLERİ (MODAL İLE) ---

function openAddMachineModal() {
    // Modalı aç (Eskiden prompt açıyordu, şimdi HTML modal açacak)
    const modal = document.getElementById('addMachineModal');
    if(modal) modal.classList.remove('hidden');
}

function closeAddMachineModal() {
    const modal = document.getElementById('addMachineModal');
    if(modal) modal.classList.add('hidden');
}

function confirmAddMachine(e) {
    e.preventDefault();
    
    // Seçilen değeri al
    const selectBox = document.getElementById('newMachineType');
    const type = selectBox.value;
    
    // Otomatik Kod Üretimi (Y-05, K-03 gibi)
    const prefix = type === 'Yıkama' ? 'Y' : 'K';
    // Rastgele sayı yerine sıralı gitmek daha mantıklı olabilir ama şimdilik random kalsın
    const randomNum = Math.floor(Math.random() * 90) + 10; 
    const newCode = `${prefix}-${randomNum}`;

    // Listeye Ekle
    machines.push({
        code: newCode,
        type: type,
        location: "A Blok", // Varsayılan konum
        status: 'Müsait'
    });

    // Tabloyu Güncelle
    renderMachineTable();
    updateDashboard();
    
    // Modalı Kapat ve Bildirim Ver
    closeAddMachineModal();
    showToast(`${newCode} kodlu yeni ${type} makinesi eklendi.`, "success");
}
// --- MAKİNE DÜZENLEME İŞLEMLERİ ---

function openEditModal(code) {
    const machine = machines.find(m => m.code === code);
    if (!machine) return;

    // Modalı Doldur
    document.getElementById('editMachineCode').value = machine.code;
    document.getElementById('displayMachineCode').value = machine.code;
    document.getElementById('editMachineLocation').value = machine.location;
    document.getElementById('editMachineStatus').value = machine.status;

    // Modalı Aç
    document.getElementById('machineEditModal').classList.remove('hidden');
}

function closeMachineEditModal() {
    document.getElementById('machineEditModal').classList.add('hidden');
}

function saveMachineChanges(e) {
    e.preventDefault();
    
    const code = document.getElementById('editMachineCode').value;
    const location = document.getElementById('editMachineLocation').value;
    const status = document.getElementById('editMachineStatus').value;

    const machine = machines.find(m => m.code === code);
    if (machine) {
        machine.location = location;
        machine.status = status;
        
        renderMachineTable();
        updateDashboard(); // İstatistikleri güncelle
        closeMachineEditModal();
        showToast(`${code} güncellendi: ${status}`, "success");
    }
}

// --- SİLME İŞLEMİ (SADECE BOŞTAYSA) ---
function deleteMachine(c) { 
    if(confirm(`${c} kodlu makineyi silmek istediğinize emin misiniz?`)) { 
        machines = machines.filter(m => m.code !== c); 
        renderMachineTable(); 
        updateDashboard(); 
        showToast("Makine envanterden silindi.", "warning");
    }
}

function renderStudentTable() {
    const tbody = document.getElementById('studentTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    students.forEach(s => {
        // Ceza limiti aşıldıysa Kırmızı (#EC1C24) yap
        let pointColor = s.points >= config.banLimit ? 'color: #EC1C24; font-weight:bold;' : 'color: #102A43;';
        
        tbody.innerHTML += `
            <tr>
                <td>${s.name}</td>
                <td>${s.room}</td>
                <td style="${pointColor}">${s.points}</td>
                <td>${s.status}</td>
                <td>
                    <button class="btn btn-danger" style="background-color: #EC1C24; padding:5px 10px; font-size:11px; margin-right:5px; border:none; color:white; border-radius:4px;" onclick="addPenalty(${s.id})">Ceza</button>
                    <button class="btn btn-primary" style="background-color: #10617D; padding:5px 10px; font-size:11px; border:none; color:white; border-radius:4px;" onclick="resetPoints(${s.id})">Sıfırla</button>
                </td>
            </tr>`;
    });
}

function renderReservationTable() {
    const table = document.querySelector('#view-rezervasyonlar table tbody');
    if(!table) return;
    table.innerHTML = '';
    reservations.forEach(r => {
        let badgeClass = 'badge-info';
        if(r.status === 'İşlemde') badgeClass = 'badge-success';
        if(r.status.includes('Gelmedi')) badgeClass = 'badge-busy'; // CSS'de badge-busy kırmızıdır
        
        table.innerHTML += `
            <tr>
                <td>#${r.id}</td>
                <td>${r.name}</td>
                <td>${r.machine}</td>
                <td>${r.time}</td>
                <td><span class="badge ${badgeClass}">${r.status}</span></td>
            </tr>`;
    });
}

function renderFaultTable() {
    const tbody = document.querySelector('#arizaTable tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    if (faults.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#627D98;">Aktif arıza kaydı yok.</td></tr>'; return; }
    
    faults.forEach((f, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${f.id}</td>
                <td><b>${f.machine}</b></td>
                <td>${f.issue}</td>
                <td><span class="badge badge-busy">${f.status}</span></td>
                <td>
                    <button class="btn btn-primary" style="background-color: #10617D;" onclick="resolveIssue(${index})">
                        <i class="ri-check-double-line"></i> Çözüldü
                    </button>
                </td>
            </tr>`;
    });
}

// --- MODAL FONKSİYONLARI ---

function openInterviewModal() {
    const modal = document.getElementById('interviewModal');
    const tbody = document.getElementById('interviewTableBody');
    if (!modal || !tbody) return;

    const interviewStudents = students.filter(s => s.points >= config.banLimit);

    tbody.innerHTML = ''; 

    if (interviewStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#627D98; padding:20px;">Şu an görüşülecek öğrenci bulunmamaktadır.</td></tr>';
    } else {
        interviewStudents.forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td><b>${s.name}</b></td>
                    <td>${s.room}</td>
                    <td style="color: #EC1C24; font-weight:bold;">${s.points}</td>
                    <td>
                        <button class="btn" style="background-color: #EC1C24; color:white; padding: 6px 15px; font-size: 13px; display: flex; align-items: center; gap: 5px; border:none; border-radius:4px;" onclick="callStudent('${s.name}')">
                            <i class="ri-notification-badge-line"></i> Çağır
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    modal.classList.remove('hidden');
}

function closeInterviewModal() {
    const modal = document.getElementById('interviewModal');
    if (modal) modal.classList.add('hidden');
}

function callStudent(name) {
    showToast(`${name} için sistem bildirimi gönderildi.`, "warning");
}

// --- DİĞER İŞLEVLER ---

function addPenalty(id) {
    const student = students.find(s => s.id === id);
    if(!student) return;
    let p = prompt(`${student.name} için manuel ceza puanı giriniz:`, config.noShowPenalty);
    if (p) {
        student.points += parseInt(p);
        if (student.points >= config.banLimit) student.status = "Görüşülecek";
        renderStudentTable(); updateDashboard();
        showToast("Ceza puanı eklendi.", "warning");
    }
}

function resetPoints(id) { 
    if(confirm("Bu öğrencinin ceza puanlarını sıfırlamak istiyor musunuz?")) { 
        const s = students.find(st => st.id === id); 
        if(s) { 
            s.points = 0; 
            s.status = "Aktif"; 
            renderStudentTable(); 
            updateDashboard(); 
            showToast("Puanlar sıfırlandı.", "success");
        }
    }
}

function handleAddMachine(e) { 
    e.preventDefault(); 
    const t = document.getElementById('makTip').value; 
    const p = t==='Yıkama'?'Y':'K'; 
    const c = `${p}-0${Math.floor(Math.random()*10)+10}`; 
    machines.push({code:c, type:t, location:"A Blok", status:'Müsait'}); 
    renderMachineTable(); 
    updateDashboard(); 
    showToast(`${t} makinesi eklendi.`, "success"); 
}

function deleteMachine(c) { 
    if(confirm("Bu makineyi silmek istediğinize emin misiniz?")) { 
        machines = machines.filter(m => m.code !== c); 
        renderMachineTable(); 
        updateDashboard(); 
        showToast("Makine silindi.", "warning");
    }
}

function resolveIssue(i) { 
    if(confirm("Arıza giderildi olarak işaretlensin mi?")) { 
        const f = faults[i]; 
        const m = machines.find(mac => mac.code === f.machine); 
        if(m) m.status = "Müsait"; 
        faults.splice(i, 1); 
        renderFaultTable(); 
        renderMachineTable(); 
        updateDashboard(); 
        showToast("Arıza kaydı kapatıldı.", "success");
    }
}

// --- RENKLİ TOAST (BİLDİRİM) SİSTEMİ ---
function showToast(m, type) { 
    const c = document.getElementById('toast-container'); 
    const el = document.createElement('div'); 
    el.className = 'toast'; 
    
    // Logoya uygun renkler
    if (type === 'warning') {
        el.style.borderLeftColor = '#EC1C24'; // Kırmızı (Uyarı/Ceza)
        el.innerHTML = `<i class="ri-error-warning-fill" style="color:#EC1C24"></i> ${m}`;
    } else if (type === 'success') {
        el.style.borderLeftColor = '#27AE60'; // Yeşil (Başarılı)
        el.innerHTML = `<i class="ri-checkbox-circle-fill" style="color:#27AE60"></i> ${m}`;
    } else {
        el.style.borderLeftColor = '#10617D'; // Petrol (Bilgi)
        el.innerHTML = `<i class="ri-information-fill" style="color:#10617D"></i> ${m}`;
    }
    
    c.appendChild(el); 
    setTimeout(() => el.remove(), 4000); 
}

// --- GRAFİK (Logo Rengiyle) ---
function renderChart() { 
    const ctx = document.getElementById('usageChart'); 
    if(!ctx) return; 
    
    if(window.myChart) window.myChart.destroy(); 
    
    window.myChart = new Chart(ctx, { 
        type: 'bar', 
        data: { 
            labels: ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'], 
            datasets:[{
                label: 'Günlük İşlem Sayısı',
                data: [12, 19, 15, 25, 22, 30, 18],
                backgroundColor: '#10617D', // Ana Petrol Rengi
                borderRadius: 4
            }] 
        }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#102A43' } }
            },
            scales: {
                y: { beginAtZero: true }
            }
        } 
    }); 
}

function switchView(id, el) { 
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden')); 
    document.getElementById('view-'+id).classList.remove('hidden'); 
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); 
    el.classList.add('active'); 
}

function filterTable(id, q) { 
    const tr = document.getElementById(id).getElementsByTagName('tr'); 
    for(let i=1; i<tr.length; i++){ 
        const td = tr[i].getElementsByTagName('td')[0]; 
        if(td) tr[i].style.display = td.textContent.toUpperCase().indexOf(q.toUpperCase()) > -1 ? "" : "none"; 
    }
}
// --- MAKİNE QR KOD ÜRETME FONKSİYONU ---
function generateMachineQR() {
    // 1. Makine kodunu al (Örn: Y-01)
    const machineCode = document.getElementById('displayMachineCode').value;
    
    if (!machineCode) {
        alert("Makine kodu bulunamadı!");
        return;
    }

    // 2. API Servisi ile QR URL'i oluştur
    // Gerçek bir sistemde bu URL şifreli bir token olabilir. Şimdilik makine adını koyuyoruz.
    const qrData = machineCode; 
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

    // 3. Ekrana Bas
    const imgElement = document.getElementById('qrPreviewImage');
    const placeholder = document.getElementById('qrPlaceholder');
    const downloadLink = document.getElementById('downloadQrLink');

    // Yükleniyor efekti (Opsiyonel)
    imgElement.style.opacity = "0.5";
    
    // Resmi yükle
    imgElement.src = apiUrl;
    imgElement.style.display = "inline-block";
    placeholder.style.display = "none";
    
    // Yüklendiğinde opaklığı düzelt
    imgElement.onload = function() {
        imgElement.style.opacity = "1";
    };

    // 4. İndirme Linkini Hazırla
    // Not: Tarayıcı güvenlik ayarları nedeniyle doğrudan API linkini indirmek bazen sorun olabilir.
    // Ancak basit kullanım için href'i güncellemek yeterlidir.
    downloadLink.href = apiUrl;
    downloadLink.style.display = "inline-block";
}

// Modal kapandığında QR alanını temizlemek için (Opsiyonel ama iyi olur)
function resetQRView() {
    document.getElementById('qrPreviewImage').style.display = "none";
    document.getElementById('qrPlaceholder').style.display = "block";
    document.getElementById('downloadQrLink').style.display = "none";
}

// Mevcut closeMachineEditModal fonksiyonunun içine resetQRView()'i ekleyebilirsin.
// Örnek:
/*
function closeMachineEditModal() {
    document.getElementById('machineEditModal').classList.add('hidden');
    resetQRView(); // Bunu ekle
}
*/