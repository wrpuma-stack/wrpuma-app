import * as data from './data.js';

const appDiv = document.getElementById('app');
let obraSel = "GENERAL";

// --- CONFIGURACIÓN Y ACCESOS (MANTENIDOS) ---
const getLocalISODate = (dateObj = new Date()) => {
    const z = dateObj.getTimezoneOffset() * 60000;
    return new Date(dateObj - z).toISOString().split('T')[0];
};

let fechaSel = getLocalISODate();
const getDbPath = (path) => {
    const empresa = localStorage.getItem('empresa_wr') || 'Walter';
    return empresa === 'Walter' ? path : `cuentas/${empresa}/${path}`;
};

// --- MÓDULOS OPERATIVOS ---
function dibujarMenu() {
    const rol = localStorage.getItem('rol_wr');
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-6 text-white text-center">
        <h1 class="text-4xl font-black text-red-600 mb-8">WRPUMA</h1>
        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <button onclick="window.location.hash='#asistencia'" class="bg-red-600 p-4 rounded-2xl font-bold">ASISTENCIA</button>
            <button onclick="window.location.hash='#cotizaciones'" class="bg-white text-black p-4 rounded-2xl font-bold">COTIZADOR</button>
            <button onclick="window.location.hash='#obras'" class="bg-zinc-800 p-4 rounded-2xl font-bold">OBRAS</button>
            <button onclick="window.location.hash='#personal'" class="bg-zinc-800 p-4 rounded-2xl font-bold">PERSONAL</button>
        </div>
    </div>`;
}

// --- COTIZADOR INTEGRADO (CON PDF Y BOTÓN AZUL) ---
function dibujarCotizador() {
    appDiv.innerHTML = `
    <div class="min-h-screen p-2 bg-zinc-200 pb-20">
        <div class="max-w-4xl mx-auto">
            <button onclick="window.location.hash='#menu'" class="mb-2 bg-black text-white px-4 py-1 rounded">VOLVER</button>
            <button onclick="window.arreglarFormato()" class="w-full bg-blue-600 text-white font-black py-3 rounded mb-2">🪄 ARREGLAR TABLAS (BOTÓN AZUL)</button>
            <button onclick="window.generarPDF()" class="w-full bg-red-600 text-white font-black py-4 rounded">📥 GENERAR PDF</button>
            
            <div id="hoja-pdf" style="width:210mm; padding:20mm; background:white; margin:auto; box-shadow:0 0 10px rgba(0,0,0,0.2);">
                <div style="border-bottom:4px solid #cc0000; margin-bottom:20px;">
                    <h1 style="color:#cc0000;">WRPUMA</h1>
                    <p id="doc-title" contenteditable="true">COTIZACION TECNICA</p>
                </div>
                <div id="zona-editable" contenteditable="true" style="min-height:200px;">
                    <p>--- Pegue aquí su cotización ---</p>
                </div>
            </div>
        </div>
    </div>`;
}

window.arreglarFormato = () => {
    const z = document.getElementById('zona-editable');
    z.innerHTML = z.innerHTML.replace(/\|/g, '</td><td>').replace(/\n/g, '</tr><tr>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    alert("Formato aplicado.");
};

window.generarPDF = () => { 
    html2pdf().from(document.getElementById('hoja-pdf')).save(); 
};

// --- MANTENGA AQUÍ SUS OTRAS FUNCIONES (dibujarAsistencia, dibujarObras, dibujarPersonal, etc.) ---
// ... (Aquí pegue sus funciones originales que ya tiene en su archivo) ...

// Router básico
function enrutador() {
    const h = window.location.hash;
    if (h === '#cotizaciones') dibujarCotizador();
    else if (h === '#asistencia') dibujarAsistencia();
    else if (h === '#obras') dibujarObras();
    else if (h === '#personal') dibujarPersonal();
    else dibujarMenu();
}
window.onhashchange = enrutador;
enrutador();
