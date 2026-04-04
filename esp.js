let pins = [];
let startTime = Date.now();

// 1. Initial Load from LocalStorage
function init() {
    const stored = localStorage.getItem('hommily_pins');
    if (stored) {
        pins = JSON.parse(stored);
    } else {
        pins = [{ id: Date.now(), name: "Built-in LED", pin: 2, state: false }];
        saveState();
    }
    render();
    updateStats();
    setInterval(updateStats, 5000); // Polling every 5 sec
    lucide.createIcons();
}

// 2. RAM & System Stats
async function updateStats() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        const percent = Math.round((data.free / data.total) * 100);
        const gauge = document.getElementById('ram-gauge');
        if (gauge) {
            gauge.setAttribute('stroke-dasharray', `${percent}, 100`);
        }
        
        const ramPercentElem = document.getElementById('ram-percent');
        if (ramPercentElem) ramPercentElem.innerText = `${percent}%`;
        
        const ramFreeElem = document.getElementById('ram-free');
        if (ramFreeElem) ramFreeElem.innerText = `${Math.round(data.free / 1024)} KB`;
        
        const uptimeElem = document.getElementById('uptime');
        if (uptimeElem) {
            const diff = Math.floor((Date.now() - startTime) / 1000);
            const m = Math.floor(diff / 60);
            const s = diff % 60;
            uptimeElem.innerText = `${m}:${s.toString().padStart(2, '0')}`;
        }
    } catch (e) { console.error("Stats fetch failed"); }
}

function saveState() { localStorage.setItem('hommily_pins', JSON.stringify(pins)); }

function render() {
    const container = document.getElementById('device-container');
    if(pins.length === 0) {
        container.innerHTML = `<div class="bg-slate-900/50 p-8 rounded-2xl text-center text-slate-500 italic">No devices found. Add your first controller above!</div>`;
        return;
    }
    
    container.innerHTML = pins.map(p => `
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex items-center justify-between shadow-2xl">
            <div class="flex-1">
                <h3 class="font-semibold text-lg text-slate-100">${p.name}</h3>
                <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">GPIO ${p.pin}</span>
                    <button onclick="confirmDelete(${p.id})" class="text-xs text-rose-500/60 hover:text-rose-500 transition-colors">remove</button>
                </div>
            </div>
            
            <label class="relative inline-flex items-center cursor-pointer group">
                <input type="checkbox" ${p.state ? 'checked' : ''} onchange="handleToggle(${p.id}, this.checked)" class="sr-only peer">
                <div class="w-14 h-8 bg-slate-800 rounded-full peer peer-checked:bg-indigo-600 transition-all active:scale-95 duration-300">
                    <div class="absolute top-[4px] left-[4px] h-6 w-6 rounded-full bg-white transition-all transform peer-checked:translate-x-6 shadow-md shadow-black/20 flex items-center justify-center">
                        <div class="transition-opacity duration-300 opacity-0 peer-checked:opacity-100">
                            <i data-lucide="zap" class="w-3.5 h-3.5 text-indigo-500"></i>
                        </div>
                        <div class="absolute transition-opacity duration-300 opacity-40 peer-checked:opacity-0">
                            <i data-lucide="power" class="w-3.5 h-3.5 text-slate-400"></i>
                        </div>
                    </div>
                </div>
            </label>
        </div>
    `).join('');
    lucide.createIcons();
}

async function promptAddDevice() {
    const { value: formValues } = await Swal.fire({
        title: 'New Controller',
        background: '#0f172a',
        color: '#f1f5f9',
        html:
            '<input id="swal-name" class="swal2-input bg-slate-900 border-slate-800 text-slate-100" placeholder="Name">' +
            '<input id="swal-pin" type="number" class="swal2-input bg-slate-900 border-slate-800 text-slate-100" placeholder="GPIO Pin">',
        confirmButtonColor: '#4f46e5',
        preConfirm: () => {
            const name = document.getElementById('swal-name').value;
            const pin = parseInt(document.getElementById('swal-pin').value);
            if (!name || isNaN(pin)) { Swal.showValidationMessage('Valid name and pin required!'); return false; }
            return { name, pin };
        }
    });
    if (formValues) { pins.push({ id: Date.now(), name: formValues.name, pin: formValues.pin, state: false }); saveState(); render(); }
}

async function confirmDelete(id) {
    const p = pins.find(x => x.id === id);
    const res = await Swal.fire({
        title: 'Remove?',
        text: `Disconnect ${p.name}?`,
        icon: 'warning',
        background: '#0f172a',
        color: '#f1f5f9',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155'
    });
    if (res.isConfirmed) { pins = pins.filter(x => x.id !== id); saveState(); render(); }
}

async function handleToggle(id, state) {
    const p = pins.find(x => x.id === id);
    const oldState = p.state;
    p.state = state;
    saveState();
    try {
        const res = await fetch(`/api/control?pin=${p.pin}&state=${state ? 1 : 0}`);
        if (!res.ok) throw new Error();
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 800, background: '#1e293b', color: '#f8fafc' })
            .fire({ icon: 'success', title: `${p.name} -> ${state ? 'ON' : 'OFF'}` });
    } catch(e) {
        p.state = oldState; saveState(); render();
        Swal.fire({ icon: 'error', title: 'Sync Failed', background: '#0f172a', color: '#f1f5f9' });
    }
}

window.onload = init;
