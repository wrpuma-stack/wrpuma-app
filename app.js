import * as data from './data.js';
const appDiv = document.getElementById('app');
let obraSel = "GENERAL";

const getLocalISODate = (dateObj = new Date()) => {
    const z = dateObj.getTimezoneOffset() * 60000;
    return new Date(dateObj - z).toISOString().split('T')[0];
};
let fechaSel = getLocalISODate();
const getDbPath = (path) => {
    const empresa = localStorage.getItem('empresa_wr') || 'Walter';
    return empresa === 'Walter' ? path : `cuentas/${empresa}/${path}`;
};

// --- SEGURIDAD: RESTAURACIÓN DE PINS ---
window.verAccesoPro = (u) => {
    const p = prompt("PIN DE ACCESO:");
    if (u === 'walter' && p === "2345") {
        localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', 'Walter'); 
        localStorage.setItem('a_wr', 'true'); window.location.hash = '#menu';
    } else if (u === 'napoleon' && p === "1111") {
        localStorage.setItem('empresa_wr', 'Napoleon'); localStorage.setItem('u_wr', 'Napoleon'); 
        localStorage.setItem('a_wr', 'true'); window.location.hash = '#menu';
    } else if (u === 'super' && p === "0000") {
        localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', 'Supervisor'); 
        localStorage.setItem('a_wr', 'false'); window.location.hash = '#menu';
    } else { alert("ACCESO DENEGADO"); }
};

// --- COTIZADOR PROFESIONAL ---
function dibujarCotizador() {
    appDiv.innerHTML = `
    <div class="min-h-screen p-2 text-black bg-zinc-200 pb-20">
        <div class="max-w-4xl mx-auto">
            <div class="bg-zinc-900 p-4 text-white flex justify-between items-center rounded-2xl mb-4">
                <h2 class="text-sm font-black">GESTOR DE DOCUMENTOS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            <button onclick="window.arreglarFormato()" class="w-full bg-blue-600 text-white font-black py-3 rounded-lg mb-2 text-xs uppercase shadow-lg">🪄 ARREGLAR TABLAS</button>
            <button onclick="window.generarPDF()" class="w-full bg-red-600 text-white font-black py-4 rounded-lg mb-6 shadow-xl">📥 GENERAR PDF PROFESIONAL</button>
            <div id="hoja-pdf" class="bg-white shadow-2xl mx-auto p-10" style="width:210mm; min-height:295mm; color:#000;">
                <div style="display:flex; justify-content:space-between; border-bottom: 4px solid #cc0000; padding-bottom: 10px; margin-bottom: 20px;">
                    <div style="background:#cc0000; color:#fff; font-weight:900; font-size:24px; padding:10px; border-radius:5px;">WRPUMA</div>
                    <div style="text-align:right;">
                        <p id="doc-title" contenteditable="true" style="margin:0; font-weight:900;">COTIZACION</p>
                        <p style="margin:0; font-size:12px;">Santa Cruz, ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                <div id="zona-editable" contenteditable="true" style="outline:none; min-height:200mm;">--- Pegue su tabla aquí ---</div>
            </div>
        </div>
    </div>`;
}
window.arreglarFormato = () => { /* lógica de tablas */ };
window.generarPDF = () => { html2pdf().from(document.getElementById('hoja-pdf')).save(); };
function dibujarAsistencia() {
    const adm = localStorage.getItem('a_wr') === 'true';
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4">
        <div class="max-w-md mx-auto bg-white rounded-3xl shadow-2xl border-t-8 border-red-600 p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-black italic">ASISTENCIA</h2>
                <button onclick="window.location.hash='#menu'" class="bg-zinc-100 p-2 rounded-xl text-xs font-bold">VOLVER</button>
            </div>
            <div class="bg-zinc-900 p-4 rounded-2xl mb-4">
                <select id="sel-o" onchange="window.chO(this.value)" class="w-full bg-transparent text-white font-black uppercase text-center outline-none"></select>
            </div>
            <div id="list-asist" class="space-y-3"></div>
        </div>
    </div>`;
    data.obtenerObras(obs => {
        const s = document.getElementById('sel-o');
        s.innerHTML = '<option value="GENERAL">GENERAL</option>';
        Object.keys(obs).forEach(id => s.innerHTML += `<option value="${obs[id].nombre}">${obs[id].nombre}</option>`);
        s.value = obraSel;
    });
    data.obtenerPersonal(per => {
        const c = document.getElementById('list-asist'); c.innerHTML = '';
        Object.keys(per || {}).forEach(n => {
            c.innerHTML += `<div class="p-3 border rounded-2xl flex justify-between"><b>${n}</b><button class="bg-black text-white px-3 py-1 rounded-lg text-[10px]">MARCAR</button></div>`;
        });
    });
}
window.chO = (v) => { obraSel = v; dibujarAsistencia(); };

function dibujarObras() {
    appDiv.innerHTML = `<div class="p-6"><h2>MODULO OBRAS</h2><button onclick="window.location.hash='#menu'">VOLVER</button><div id="list-o"></div></div>`;
    data.obtenerObras(obs => { /* render obras */ });
}

function dibujarPersonal() {
    appDiv.innerHTML = `<div class="p-6"><h2>MODULO PERSONAL</h2><button onclick="window.location.hash='#menu'">VOLVER</button><div id="list-p"></div></div>`;
    data.obtenerPersonal(p => { /* render personal */ });
}
function dibujarMenu() {
    const adm = localStorage.getItem('a_wr') === 'true';
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-6 text-white text-center flex flex-col justify-center">
        <h1 class="text-4xl font-black uppercase mb-10">WRPUMA CONTROL</h1>
        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <button onclick="window.location.hash='#asistencia'" class="bg-red-600 p-8 rounded-3xl font-bold text-xl">ASISTENCIA</button>
            <button onclick="window.location.hash='#cotizaciones'" class="bg-white text-black p-8 rounded-3xl font-bold text-xl">COTIZADOR</button>
            ${adm ? `
                <button onclick="window.location.hash='#obras'" class="bg-zinc-800 p-6 rounded-3xl font-bold">OBRAS</button>
                <button onclick="window.location.hash='#personal'" class="bg-zinc-800 p-6 rounded-3xl font-bold">PERSONAL</button>
                <button onclick="window.location.hash='#contabilidad'" class="bg-green-600 p-6 rounded-3xl font-bold">GASTOS</button>
                <button onclick="window.location.hash='#utilidad'" class="bg-zinc-700 p-6 rounded-3xl font-bold">FINANZAS</button>
            ` : ''}
        </div>
        <button onclick="localStorage.clear(); location.reload();" class="mt-20 text-zinc-600 text-xs uppercase">Cerrar Sesión</button>
    </div>`;
}

function enrutador() {
    const h = window.location.hash;
    if (h === '#cotizaciones') dibujarCotizador();
    else if (h === '#asistencia') dibujarAsistencia();
    else if (h === '#obras') dibujarObras();
    else if (h === '#personal') dibujarPersonal();
    else if (h === '#menu') dibujarMenu();
    else dibujarAcceso();
}

function dibujarAcceso() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
        <h1 class="text-5xl font-black mb-12">WRPUMA</h1>
        <div class="space-y-4 w-full max-w-xs">
            <button onclick="window.verAccesoPro('walter')" class="w-full bg-red-600 py-6 rounded-3xl font-black text-xl">DUEÑO</button>
            <button onclick="window.verAccesoPro('napoleon')" class="w-full bg-zinc-800 py-6 rounded-3xl font-black text-xl">NAPOLEÓN</button>
            <button onclick="window.verAccesoPro('super')" class="w-full bg-zinc-800 py-6 rounded-3xl font-black text-xl text-zinc-400">SUPERVISOR</button>
        </div>
    </div>`;
}

window.addEventListener('hashchange', enrutador);
window.addEventListener('load', enrutador);
enrutador();
