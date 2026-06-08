import * as data from './data.js';
const appDiv = document.getElementById('app');
let obraSel = "GENERAL";

// --- CORE Y FECHAS ---
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

// --- ACCESO ---
window.verAccesoPro = (usuario) => {
    if (usuario === 'walter') {
        const pin = prompt("PIN DUEÑO WRPUMA:");
        if (pin === "2345") {
            localStorage.setItem('empresa_wr', 'Walter');
            localStorage.setItem('u_wr', 'Walter'); localStorage.setItem('a_wr', 'true');
            window.location.hash = '#menu';
        } else { alert("PIN INCORRECTO"); }
    } else if (usuario === 'napoleon') {
        const pin = prompt("PIN NAPOLEON:");
        if (pin === "1111") {
            localStorage.setItem('empresa_wr', 'Napoleon');
            localStorage.setItem('u_wr', 'Napoleon'); localStorage.setItem('a_wr', 'true');
            window.location.hash = '#menu';
        } else { alert("PIN INCORRECTO"); }
    } else if (usuario === 'super') {
        localStorage.setItem('empresa_wr', 'Walter');
        localStorage.setItem('u_wr', 'Supervisor'); localStorage.setItem('a_wr', 'false');
        window.location.hash = '#menu';
    }
};

// --- COTIZADOR BLINDADO (PARTE 1/3) ---
function dibujarCotizador() {
    appDiv.innerHTML = `
    <div class="min-h-screen p-2 text-black bg-zinc-200 pb-20">
        <div class="max-w-4xl mx-auto">
            <div class="bg-zinc-900 p-4 text-white flex justify-between items-center rounded-2xl mb-4">
                <h2 class="text-sm font-black italic">GESTOR DE DOCUMENTOS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            <button onclick="window.arreglarFormato()" class="w-full bg-blue-600 text-white font-black py-3 rounded-lg mb-2 text-xs uppercase border-b-4 border-blue-800 active:scale-95">🪄 ARREGLAR TABLAS</button>
            <button onclick="window.generarPDF()" class="w-full bg-red-600 text-white font-black py-4 rounded-lg mb-6 shadow-lg active:scale-95">📥 GENERAR PDF PROFESIONAL</button>
            <div id="hoja-pdf" class="bg-white shadow-2xl mx-auto" style="width:210mm; min-height:295mm; padding:20mm; font-family:Arial; color:#000;">
                <div style="display:flex; justify-content:space-between; border-bottom: 4px solid #cc0000; padding-bottom: 10px; margin-bottom: 20px; align-items: flex-end;">
                    <div style="background-color:#cc0000; color:white; font-weight:900; font-size:26px; padding:8px 12px; border-radius:4px; margin-right:12px;">WRPUMA</div>
                    <div style="text-align:right;">
                        <p id="doc-title" contenteditable="true" style="margin:0; font-weight:900; font-size:18px; outline:none;">COTIZACION</p>
                        <p style="margin:0; font-size:12px;">Santa Cruz, ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                <div id="zona-editable" contenteditable="true" style="outline:none; font-size:14px; line-height:1.5; color:#000;">
                    <p style="color:#999; text-align:center;">--- Pegue aquí su tabla ---</p>
                </div>
            </div>
        </div>
    </div>`;
}
// --- BLOQUE 2: ASISTENCIA, OBRAS Y PERSONAL ---

function dibujarAsistencia() {
    const adm = localStorage.getItem('a_wr') === 'true';
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans text-left pb-10">
        <div class="max-w-md mx-auto bg-white rounded-3xl shadow-xl border-t-8 border-red-600 overflow-hidden relative">
            <div class="p-6 bg-white flex justify-between items-center border-b">
                <div>
                    <h2 class="text-2xl font-black italic uppercase">ASISTENCIA</h2>
                    <input type="date" value="${fechaSel}" ${adm ? 'onchange="window.chF(this.value)"' : 'disabled'} class="mt-1 text-[12px] font-bold text-red-600 uppercase bg-red-50 p-1 px-2 rounded-lg border border-red-200 outline-none shadow-sm">
                </div>
                <button onclick="window.location.hash='#menu'" class="bg-zinc-100 p-2 rounded-xl text-xs font-bold text-black">VOLVER</button>
            </div>
            <div class="p-6">
                <div class="bg-zinc-900 p-4 rounded-2xl mb-4 text-white text-center"><select id="sel-o" onchange="window.chO(this.value)" class="w-full bg-transparent font-black text-lg uppercase outline-none text-red-500 text-center"></select></div>
                <div id="list-asist" class="space-y-3"></div>
            </div>
        </div>
    </div>
    
    <div id="modal-asistencia" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 font-sans">
        <div class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border-t-8 border-red-600">
            <h3 id="modal-nombre" class="text-2xl font-black uppercase text-red-600 mb-4 text-center">NOMBRE</h3>
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-zinc-100 p-2 rounded-xl border border-zinc-300">
                    <label class="text-[9px] text-zinc-500 font-bold uppercase mb-1 block">DIA NORMAL:</label>
                    <select id="modal-j-normal" class="w-full p-2 bg-white border border-zinc-300 rounded-lg font-black text-black text-xs outline-none"><option value="1">1 Dia</option><option value="0.5">0.5 Dias</option><option value="0">0 Dias</option></select>
                </div>
                <div class="bg-blue-50 p-2 rounded-xl border border-blue-200">
                    <label class="text-[9px] text-blue-600 font-bold uppercase mb-1 block">TURNO EXTRA:</label>
                    <select id="modal-j-extra" class="w-full p-2 bg-white border border-blue-300 rounded-lg font-black text-blue-700 text-xs outline-none"><option value="0">Sin Extra</option><option value="0.5">0.5 Dias</option><option value="1">1 Dia</option></select>
                </div>
                <div class="bg-orange-50 p-2 rounded-xl border border-orange-200 col-span-2">
                    <label class="text-[9px] text-orange-700 font-bold uppercase mb-1 block text-center">Atraso (Horas):</label>
                    <input id="modal-atraso-horas" type="number" value="0" step="0.5" class="w-full p-2 bg-white border border-orange-300 rounded-lg font-black text-center text-zinc-900 text-xs outline-none">
                </div>
            </div>
            <div class="flex gap-2 mt-2">
                <button onclick="document.getElementById('modal-asistencia').classList.add('hidden')" class="flex-1 bg-zinc-200 text-zinc-700 font-black py-3 rounded-xl active:scale-95 text-xs">CANCELAR</button>
                <button onclick="window.guardarAsistenciaModal()" class="flex-[2] bg-green-600 text-white font-black py-3 rounded-xl active:scale-95 shadow-lg text-xs uppercase">GUARDAR</button>
            </div>
        </div>
    </div>`;

    const sel = document.getElementById('sel-o');
    data.obtenerObras(obs => {
        sel.innerHTML = '<option value="GENERAL">GENERAL</option>';
        Object.keys(obs).forEach(id => { sel.innerHTML += `<option value="${obs[id].nombre}">${obs[id].nombre}</option>`; });
        sel.value = obraSel;
    });

    firebase.database().ref(getDbPath('asistencia_semanal/' + fechaSel)).on('value', snap => {
        window.currentMarks = snap.val() || {};
        data.obtenerPersonal(per => { window.currentPersonal = per || {}; window.renderListaPintores(); });
    });
}

window.chF = (v) => { fechaSel = v; dibujarAsistencia(); };
window.chO = (v) => { obraSel = v; window.renderListaPintores(); };
window.renderListaPintores = () => {
    const c = document.getElementById('list-asist'); if (!c) return; c.innerHTML = '';
    Object.keys(window.currentPersonal).forEach(n => {
        const record = window.currentMarks[n];
        const estaEnEstaObra = record && record.obra === obraSel;
        c.innerHTML += `<div class="p-3 bg-white rounded-2xl border flex justify-between items-center shadow-sm"><b>${n}</b><button onclick="window.abrirModalAsistencia('${n}')" class="p-2 bg-zinc-800 text-white rounded-lg text-xs font-black">ASISTENCIA</button></div>`;
    });
};
window.abrirModalAsistencia = (n) => {
    window.pintorActualModal = n;
    document.getElementById('modal-nombre').innerText = n;
    document.getElementById('modal-asistencia').classList.remove('hidden');
};
window.guardarAsistenciaModal = () => {
    const n = window.pintorActualModal;
    firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).set({
        nombre: n, obra: obraSel,
        jornada_normal: parseFloat(document.getElementById('modal-j-normal').value) || 0,
        jornada_extra: parseFloat(document.getElementById('modal-j-extra').value) || 0,
        horas_atraso: parseFloat(document.getElementById('modal-atraso-horas').value) || 0
    }).then(() => { document.getElementById('modal-asistencia').classList.add('hidden'); dibujarAsistencia(); });
};

function dibujarObras() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 font-sans"><div class="max-w-md mx-auto"><div class="bg-zinc-900 p-6 text-white flex justify-between rounded-t-3xl"><h2>CONTROL DE OBRAS</h2><button onclick="window.location.hash='#menu'">VOLVER</button></div><div class="bg-white p-6 rounded-b-3xl"><input id="o-nom" placeholder="PROYECTO" class="w-full p-3 border mb-2"><input id="o-pre" type="number" placeholder="PRESUPUESTO" class="w-full p-3 border mb-3"><button onclick="window.saveO()" class="w-full bg-red-600 text-white py-3 rounded-xl">REGISTRAR</button><div id="list-o-activas" class="mt-6 space-y-3"></div></div></div></div>`;
    data.obtenerTodo((db) => {
        const cA = document.getElementById('list-o-activas'); cA.innerHTML = ''; const obs = db.obras || {};
        Object.keys(obs).forEach(id => {
            cA.innerHTML += `<div class="p-4 border rounded-xl flex justify-between"><b>${obs[id].nombre}</b><button onclick="window.delO('${id}')" class="text-red-500">Borrar</button></div>`;
        });
    });
}
window.saveO = () => { const n = document.getElementById('o-nom').value, p = document.getElementById('o-pre').value; if (n && p) data.guardarObra(n, p).then(() => location.reload()); };
window.delO = (id) => { if (confirm("¿Borrar?")) data.borrarObra(id).then(() => location.reload()); };

function dibujarPersonal() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 font-sans"><div class="max-w-md mx-auto"><div class="bg-zinc-800 p-6 text-white flex justify-between rounded-t-3xl"><h2>PERSONAL</h2><button onclick="window.location.hash='#menu'">VOLVER</button></div><div class="bg-white p-6 rounded-b-3xl"><input id="p-nom" placeholder="NOMBRE" class="w-full p-3 border mb-2"><input id="p-sue" type="number" placeholder="SUELDO DIARIO" class="w-full p-3 border mb-3"><button onclick="window.saveP()" class="w-full bg-red-600 text-white py-3 rounded-xl">REGISTRAR</button><div id="list-p" class="mt-6 space-y-3"></div></div></div></div>`;
    data.obtenerPersonal(per => {
        const c = document.getElementById('list-p'); c.innerHTML = '';
        Object.keys(per || {}).forEach(n => { c.innerHTML += `<div class="p-3 border rounded-lg flex justify-between"><b>${n}</b><button onclick="window.delP('${n}')" class="text-red-600">DEL</button></div>`; });
    });
}
window.saveP = () => { const n = document.getElementById('p-nom').value.trim(), s = document.getElementById('p-sue').value; if (n && s) data.guardarPintor(n, s); };
window.delP = (n) => { data.borrarPintor(n); };
// --- BLOQUE 3: FINANZAS, UTILIDAD, CONTROL GASTOS Y ENRUTADOR ---

function dibujarCaja() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-green-600 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg">
                <h2 class="text-xl font-black italic uppercase">CONTROL DE GASTOS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-green-700 px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-4">
                <div class="bg-green-50 p-4 rounded-2xl border border-green-200">
                    <select id="c-obra" class="w-full p-3 rounded-xl border-2 mb-2"></select>
                    <input id="c-prov" placeholder="Proveedor" class="w-full p-3 border rounded-xl mb-2">
                    <input id="c-monto" type="number" placeholder="Monto Bs." class="w-full p-3 border rounded-xl mb-3">
                    <button onclick="window.saveM()" class="w-full bg-black text-white py-3 rounded-xl uppercase">Registrar Gasto</button>
                </div>
                <div id="list-creditos" class="space-y-3 pt-2"></div>
            </div>
        </div>
    </div>`;
    data.obtenerObras((obs) => {
        const s = document.getElementById('c-obra'); s.innerHTML = '<option value="">-- OBRA --</option>';
        Object.keys(obs).forEach(id => { s.innerHTML += `<option value="${id}">${obs[id].nombre}</option>`; });
    });
}

function dibujarUtilidad() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-950 p-4 text-white text-center"><div class="max-w-md mx-auto"><div class="flex justify-between mb-6"><h2>REPORTE FINANCIERO</h2><button onclick="window.location.hash='#menu'">VOLVER</button></div><div id="cont-util" class="space-y-6 text-left"></div></div></div>`;
    data.obtenerTodo((db) => {
        const c = document.getElementById('cont-util'); if (!c) return;
        const obs = db.obras || {}, fin = db.finanzas_obras || {};
        c.innerHTML = '';
        Object.keys(obs).forEach(id => {
            const o = obs[id]; let gM = 0;
            if (fin[id]) Object.values(fin[id]).forEach(m => { if (['compra_material', 'pago_sueldo', 'pago_trato'].includes(m.tipo)) gM += parseFloat(m.monto); });
            const gN = o.presupuesto - gM - (o.presupuesto * 0.05);
            c.innerHTML += `<div class="bg-zinc-900 p-6 rounded-3xl"><h3>${o.nombre}</h3><p>Utilidad: Bs. ${gN.toFixed(1)}</p></div>`;
        });
    });
}

// --- MENU Y ENRUTADOR FINAL ---
function dibujarMenu() {
    const adm = localStorage.getItem('a_wr') === 'true';
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-6 text-white text-center flex flex-col justify-center">
        <h1 class="text-4xl font-black uppercase mb-8">WRPUMA</h1>
        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <button onclick="window.location.hash='#asistencia'" class="bg-red-600 p-6 rounded-2xl font-bold">ASISTENCIA</button>
            <button onclick="window.location.hash='#cotizaciones'" class="bg-white text-black p-6 rounded-2xl font-bold">COTIZADOR</button>
            ${adm ? `
                <button onclick="window.location.hash='#obras'" class="bg-zinc-800 p-6 rounded-2xl">OBRAS</button>
                <button onclick="window.location.hash='#planilla'" class="bg-zinc-800 p-6 rounded-2xl">SUELDOS</button>
                <button onclick="window.location.hash='#contabilidad'" class="bg-green-600 p-6 rounded-2xl">GASTOS</button>
            ` : ''}
        </div>
        <button onclick="localStorage.clear(); location.reload();" class="mt-10 text-zinc-600 text-xs uppercase">Cerrar Sesión</button>
    </div>`;
}

function enrutador() {
    const h = window.location.hash;
    if (h === '#cotizaciones') dibujarCotizador();
    else if (h === '#asistencia') dibujarAsistencia();
    else if (h === '#planilla') dibujarPlanilla();
    else if (h === '#obras') dibujarObras();
    else if (h === '#personal') dibujarPersonal();
    else if (h === '#contabilidad') dibujarCaja();
    else if (h === '#utilidad') dibujarUtilidad();
    else dibujarMenu();
}

window.addEventListener('hashchange', enrutador);
window.addEventListener('load', enrutador);
enrutador();
