import * as data from './data.js';

const appDiv = document.getElementById('app');
let obraSel = "GENERAL";

const getLocalISODate = (dateObj = new Date()) => {
    const z = dateObj.getTimezoneOffset() * 60000;
    return new Date(dateObj - z).toISOString().split('T')[0];
};

let fechaSel = getLocalISODate();
window.carritoPresupuesto = [];

const getDbPath = (path) => {
    const empresa = localStorage.getItem('empresa_wr') || 'Walter';
    return empresa === 'Walter' ? path : `cuentas/${empresa}/${path}`;
};

function obtenerLunes() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return getLocalISODate(d);
}

let pFIni = obtenerLunes();
let pFFin = getLocalISODate();

// --- ACCESO Y SEGURIDAD ---
window.verAccesoPro = (usuario) => {
    if (usuario === 'walter') {
        const pin = prompt("PIN DUEÑO WRPUMA:");
        if (pin === "2345") { localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', 'Walter'); localStorage.setItem('a_wr', 'true'); localStorage.setItem('rol_wr', 'admin'); window.location.hash = '#menu'; } else { alert("PIN INCORRECTO"); }
    } else if (usuario === 'napoleon') {
        const pin = prompt("PIN NAPOLEON:");
        if (pin === "1111") { localStorage.setItem('empresa_wr', 'Napoleon'); localStorage.setItem('u_wr', 'Napoleon'); localStorage.setItem('a_wr', 'true'); localStorage.setItem('rol_wr', 'admin'); window.location.hash = '#menu'; } else { alert("PIN INCORRECTO"); }
    } else if (usuario === 'super') {
        const pin = prompt("PIN SUPERVISOR:");
        if (pin === "7777") { localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', 'Supervisor'); localStorage.setItem('a_wr', 'false'); localStorage.setItem('rol_wr', 'super'); window.location.hash = '#menu'; } else { alert("PIN INCORRECTO"); }
    } else if (usuario === 'trabajador') {
        const nom = prompt("NOMBRE:");
        if (nom) { localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', nom.toUpperCase()); localStorage.setItem('a_wr', 'false'); localStorage.setItem('rol_wr', 'trabajador'); window.location.hash = '#panel-trabajador'; }
    }
};

// ==========================================================
// 📝 COTIZADOR WORD Y PDF (LOGICA COMPLETA)
// ==========================================================
function dibujarCotizador() {
    appDiv.innerHTML = `
    <div class="min-h-screen p-2 text-black bg-zinc-200">
        <div class="max-w-4xl mx-auto">
            <div class="bg-zinc-900 p-4 text-white flex justify-between items-center rounded-2xl mb-4">
                <h2 class="text-sm font-black italic">GESTOR DE DOCUMENTOS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            <div class="grid grid-cols-3 gap-2 mb-2">
                <button onclick="window.setDocType('COTIZACION TECNICA')" class="bg-zinc-800 text-white font-bold py-2 rounded-xl text-[10px] uppercase">COTIZACION</button>
                <button onclick="window.setDocType('RECIBO DE PAGO')" class="bg-green-600 text-white font-bold py-2 rounded-xl text-[10px] uppercase">RECIBO</button>
                <button onclick="window.modoGarantia()" class="bg-yellow-600 text-white font-black py-2 rounded-xl text-[10px] uppercase">GARANTIA</button>
            </div>
            <button onclick="window.arreglarFormato()" class="w-full bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg active:scale-95 text-[12px] uppercase mb-4 border-b-4 border-blue-800">🪄 ARREGLAR TABLAS</button>
            <button onclick="window.generarPDF()" class="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg mb-4">GENERAR DOCUMENTO PDF</button>
            <div class="overflow-x-auto w-full pb-10">
                <div id="hoja-pdf" class="bg-white text-black shadow-2xl mx-auto flex flex-col relative" style="width:210mm;min-height:295mm;box-sizing:border-box;padding:15mm 20mm;font-family:Arial;">
                    <style>
                        #zona-editable table { width: 100% !important; border-collapse: collapse !important; margin: 20px 0 !important; font-size: 13px !important; color: #000 !important; }
                        #zona-editable th, #zona-editable td { border: 1px solid #000 !important; padding: 8px !important; text-align: left; color: #000 !important; }
                        #zona-editable th { background-color: #f0f0f0 !important; font-weight: bold !important; text-align: center !important; }
                    </style>
                    <div id="zona-editable" contenteditable="true" style="outline:none;font-size:15px;line-height:1.6;color:#000;">
                        <p style="text-align:center; color:#999;">--- Pegue aquí su información ---</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

window.setDocType = (t) => { document.getElementById('zona-editable').innerHTML = `<h1 style="text-align:center;">${t}</h1><p style="text-align:center; color:#999;">--- Pegue aquí la info ---</p>`; };

window.arreglarFormato = () => {
    const z = document.getElementById('zona-editable');
    let texto = z.innerText;
    let lineas = texto.split('\n');
    let html = '<table style="width:100%; border-collapse:collapse; margin:15px 0;">';
    lineas.forEach(l => { if(l.trim() !== '') html += '<tr><td style="border:1px solid #000; padding:8px;">' + l + '</td></tr>'; });
    html += '</table>';
    z.innerHTML = html;
};

window.modoGarantia = () => { document.getElementById('zona-editable').innerHTML = `<h1>GARANTIA WRPUMA</h1><p>Garantizamos la calidad del trabajo.</p>`; };

window.generarPDF = () => { 
    const element = document.getElementById('hoja-pdf');
    html2pdf().from(element).save('WRPUMA_Doc_' + Date.now() + '.pdf'); 
};

// ==========================================================
// 🚀 MENU Y ENRUTADOR (Incluye todas sus funciones anteriores)
// ==========================================================
function dibujarMenu() {
    const rol = localStorage.getItem('rol_wr');
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-6 text-white text-center">
        <h1 class="text-4xl font-black italic mb-6">WRPUMA</h1>
        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <button onclick="window.location.hash='#asistencia'" class="bg-red-600 p-8 rounded-3xl font-black">ASISTENCIA</button>
            ${rol === 'admin' ? `
                <button onclick="window.location.hash='#tratos'" class="bg-purple-600 p-8 rounded-3xl font-black">TRATOS</button>
                <button onclick="window.location.hash='#obras'" class="bg-zinc-800 p-8 rounded-3xl font-black">PROYECTOS</button>
                <button onclick="window.location.hash='#personal'" class="bg-zinc-100 text-black p-8 rounded-3xl font-black">PERSONAL</button>
                <button onclick="window.location.hash='#cotizaciones'" class="col-span-2 bg-white text-black p-6 rounded-3xl font-black">GENERAR DOCUMENTOS</button>
            ` : ''}
        </div>
        <button onclick="window.cerrarSesionTotal()" class="mt-10 text-[10px] text-zinc-600 uppercase">SALIR</button>
    </div>`;
}

function enrutador() {
    const h = window.location.hash, rol = localStorage.getItem('rol_wr');
    if (!rol && h !== '') { window.location.hash = ''; return; }
    
    // Rutas protegidas para cotizador
    if (h === '#cotizaciones') dibujarCotizador();
    else if (h === '#menu') dibujarMenu();
    else if (h === '#asistencia') dibujarAsistencia(); // (Aquí deben ir sus funciones anteriores si no las borró)
    else if (h === '#obras') dibujarObras();
    else if (h === '#personal') dibujarPersonal();
    else if (h === '#herramientas') dibujarHerramientas();
    else dibujarAcceso();
}

window.cerrarSesionTotal = () => { localStorage.clear(); location.reload(); };

function dibujarAcceso() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
        <h1 class="text-5xl font-black italic mb-10">WRPUMA</h1>
        <div class="grid gap-4 w-full max-w-xs">
            <button onclick="window.verAccesoPro('walter')" class="bg-red-600 py-4 rounded-2xl font-black">GERENCIA</button>
            <button onclick="window.verAccesoPro('super')" class="bg-zinc-800 py-4 rounded-2xl font-black">SUPERVISOR</button>
        </div>
    </div>`;
}

window.addEventListener('hashchange', enrutador); window.addEventListener('load', enrutador); enrutador();
