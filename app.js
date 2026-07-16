// ==========================================================
// 🚀 WRPUMA ELITE MANAGEMENT - CÓDIGO CONSOLIDADO FINAL
// ==========================================================
import * as data from './data.js';

const appDiv = document.getElementById('app');
let obraSel = "GENERAL";
const WEBHOOK_URL_N8N = "https://hook.us2.make.com/wa7jjt78bh7vtxv0lzxlin37kta9bld3";

// --- (MANTÉN TODO EL RESTO DE TU CÓDIGO DE ASISTENCIA, LOGÍSTICA Y PERSONAL AQUÍ) ---

// ==========================================================
// 📝 GESTOR COMERCIAL B2B - REPARADO
// ==========================================================
window.cotizacionActualId = null;

function dibujarCotizador() {
    appDiv.innerHTML = `
    <div class="min-h-screen p-4 bg-zinc-100 pb-20">
        <div class="max-w-4xl mx-auto">
            <div class="bg-zinc-900 p-4 text-white flex justify-between rounded-xl mb-4">
                <h2 class="text-sm font-black italic">GESTOR COMERCIAL WRPUMA</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-black px-3 py-1 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            <div class="flex gap-2 mb-4">
                <button onclick="window.swCot('editor')" class="flex-1 bg-red-600 text-white font-black py-2 rounded-xl text-xs">📝 EDITOR</button>
                <button onclick="window.swCot('historial')" class="flex-1 bg-zinc-800 text-white font-black py-2 rounded-xl text-xs">🗂️ HISTORIAL</button>
            </div>
            <div id="tab-cot-editor">
                <div class="bg-white p-4 rounded-xl border mb-4">
                    <input id="cot-cliente" type="text" class="w-full p-2 border mb-2 rounded font-bold uppercase" placeholder="CLIENTE">
                    <input id="cot-monto" type="number" class="w-full p-2 border mb-2 rounded font-bold" placeholder="MONTO TOTAL">
                    <button onclick="window.guardarCotizacionBD()" class="w-full bg-black text-white font-black py-3 rounded-lg">💾 GUARDAR Y GENERAR CÓDIGO</button>
                </div>
                <div id="hoja-pdf" class="bg-white p-10 shadow-xl" contenteditable="true" style="min-height:297mm; font-family:Arial;">
                    --- Pegue aquí su cotización ---
                </div>
            </div>
            <div id="tab-cot-historial" style="display:none;" class="space-y-4">Cargando historial...</div>
        </div>
    </div>`;
}

window.swCot = (tab) => {
    document.getElementById('tab-cot-editor').style.display = tab === 'editor' ? 'block' : 'none';
    document.getElementById('tab-cot-historial').style.display = tab === 'historial' ? 'block' : 'none';
    if(tab === 'historial') window.renderCotizaciones();
};

window.guardarCotizacionBD = async () => {
    const cliente = document.getElementById('cot-cliente').value.trim();
    const monto = parseFloat(document.getElementById('cot-monto').value);
    const contenido = document.getElementById('hoja-pdf').innerHTML;
    
    if(!cliente || isNaN(monto)) return alert("❌ Falta Cliente o Monto.");
    
    const hoy = new Date();
    const codigo = window.cotizacionActualId || `WP-${hoy.getFullYear()}-${Date.now().toString().slice(-4)}-V1`;
    
    await firebase.database().ref(getDbPath(`cotizaciones/${codigo}`)).set({
        codigo, cliente: cliente.toUpperCase(), monto, contenido, fecha: hoy.toISOString()
    });
    
    window.cotizacionActualId = codigo;
    alert("✅ Cotización guardada: " + codigo);
};

window.renderCotizaciones = () => {
    const list = document.getElementById('lista-cotizaciones');
    firebase.database().ref(getDbPath('cotizaciones')).on('value', snap => {
        const cots = snap.val() || {};
        list.innerHTML = Object.values(cots).map(c => `
            <div class="p-4 bg-white rounded border flex justify-between">
                <div><b>${c.cliente}</b><br><small>${c.codigo}</small></div>
                <button onclick='window.cargarCot("${c.codigo}")' class="bg-black text-white px-4 py-2 rounded">ABRIR</button>
            </div>`).join('');
    });
};

window.cargarCot = (codigo) => {
    firebase.database().ref(getDbPath(`cotizaciones/${codigo}`)).once('value').then(snap => {
        const c = snap.val();
        window.cotizacionActualId = c.codigo;
        document.getElementById('cot-cliente').value = c.cliente;
        document.getElementById('cot-monto').value = c.monto;
        document.getElementById('hoja-pdf').innerHTML = c.contenido;
        window.swCot('editor');
    });
};

// --- (AQUÍ SIGUE TU CÓDIGO DE DIBUJAR MENU, DIBUJAR ACCESO, ENRUTADOR, ETC.) ---
