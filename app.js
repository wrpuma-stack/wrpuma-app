// ==========================================================
// 🚀 WRPUMA ELITE MANAGEMENT - FULL PRO VERSION
// ==========================================================
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

// ==========================================================
// 🔐 ACCESO
// ==========================================================
window.verAccesoPro = (usuario) => {
    if (usuario === 'walter') {
        const pin = prompt("PIN DUEÑO:");
        if (pin === "2345") { localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', 'Walter'); localStorage.setItem('a_wr', 'true'); localStorage.setItem('rol_wr', 'admin'); window.location.hash = '#menu'; } else alert("PIN INCORRECTO");
    } else if (usuario === 'napoleon') {
        const pin = prompt("PIN NAPOLEON:");
        if (pin === "1111") { localStorage.setItem('empresa_wr', 'Napoleon'); localStorage.setItem('u_wr', 'Napoleon'); localStorage.setItem('a_wr', 'true'); localStorage.setItem('rol_wr', 'admin'); window.location.hash = '#menu'; } else alert("PIN INCORRECTO");
    } else if (usuario === 'super') {
        const pin = prompt("PIN SUPERVISOR:");
        if (pin === "7777") { localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', 'Supervisor'); localStorage.setItem('a_wr', 'false'); localStorage.setItem('rol_wr', 'super'); window.location.hash = '#menu'; } else alert("PIN INCORRECTO");
    } else if (usuario === 'trabajador') {
        const nom = prompt("NOMBRE EXACTO:");
        if (nom) { localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', nom.toUpperCase().trim()); localStorage.setItem('a_wr', 'false'); localStorage.setItem('rol_wr', 'trabajador'); window.location.hash = '#panel-trabajador'; }
    }
};

// ==========================================================
// 📍 PANEL TRABAJADOR Y GPS
// ==========================================================
function dibujarPanelTrabajador() {
    const n = localStorage.getItem('u_wr');
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-950 p-4 text-white font-sans flex flex-col justify-between pb-10">
        <div>
            <div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-black italic uppercase text-red-600">WRPUMA</h2><button onclick="window.cerrarSesionTotal()" class="bg-zinc-800 text-xs px-3 py-1 rounded-full font-bold">SALIR</button></div>
            <div class="bg-zinc-900 p-5 rounded-3xl shadow-xl text-center mb-6"><p class="text-[10px] text-zinc-500 font-bold uppercase mb-1">BIENVENIDO</p><h3 class="text-2xl font-black uppercase text-white">${n}</h3></div>
            <div class="bg-blue-900/30 p-5 rounded-3xl shadow-xl mb-6 text-center"><p class="text-[10px] text-blue-400 font-bold uppercase mb-2">📌 MENSAJE DEL DÍA</p><p id="msg-dia-display" class="text-sm font-bold text-white italic">Cargando...</p></div>
            
            <div class="grid grid-cols-2 gap-4">
                <button onclick="window.marcarGPS('ENTRADA')" class="col-span-1 bg-green-600 text-white py-5 rounded-3xl font-black text-sm shadow-[0_0_15px_rgba(34,197,94,0.2)] border-b-4 border-green-800 flex flex-col items-center">
                    <span>☀️ ENTRADA</span>
                    <span class="text-[9px] font-bold mt-1 opacity-80 uppercase">Ingreso Mañana</span>
                </button>
                <button onclick="window.marcarGPS('SALIDA')" class="col-span-1 bg-red-600 text-white py-5 rounded-3xl font-black text-sm shadow-[0_0_15px_rgba(239,68,68,0.2)] border-b-4 border-red-800 flex flex-col items-center">
                    <span>🌙 SALIDA</span>
                    <span class="text-[9px] font-bold mt-1 opacity-80 uppercase">Egreso Tarde</span>
                </button>
                
                <button onclick="window.pedirMaterialTrabajador()" class="bg-zinc-800 text-white py-4 rounded-2xl font-black text-xs uppercase">Solicitar Material</button>
                <button onclick="window.pedirAnticipoTrabajador()" class="bg-zinc-800 text-white py-4 rounded-2xl font-black text-xs uppercase">Pedir Anticipo</button>
            </div>
        </div>
    </div>`;
    firebase.database().ref(getDbPath('config/mensaje_dia')).on('value', snap => { document.getElementById('msg-dia-display').innerText = snap.val() || "Mantener orden y limpieza."; });
}

window.marcarGPS = (tipo) => {
    if (navigator.geolocation) {
        alert(`📍 Obteniendo ubicación para ${tipo}...`);
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude, lng = pos.coords.longitude, n = localStorage.getItem('u_wr');
            const timeStr = new Date().toLocaleTimeString();
            const gpsStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            
            const updates = { nombre: n };
            
            if (tipo === 'ENTRADA') {
                updates.hora_entrada = timeStr;
                updates.gps_entrada = gpsStr;
                updates.obra = "POR ASIGNAR"; 
                updates.jornada_normal = 1;
            } else if (tipo === 'SALIDA') {
                updates.hora_salida = timeStr;
                updates.gps_salida = gpsStr;
            }
            
            firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).update(updates)
                .then(() => alert(`✅ ${tipo} REGISTRADA CON ÉXITO.`));
        }, () => alert("❌ Active el GPS."));
    } else alert("❌ Navegador no soporta GPS.");
};

window.pedirMaterialTrabajador = () => { const mat = prompt("Material a solicitar:"); if(mat) firebase.database().ref(getDbPath(`solicitudes/SOL_MAT_${Date.now()}`)).set({ tipo: 'MATERIAL', trabajador: localStorage.getItem('u_wr'), detalle: mat, fecha: new Date().toLocaleString(), estado: 'Pendiente' }).then(() => alert("✅ Solicitud enviada a Gerencia.")); };
window.pedirAnticipoTrabajador = () => { const monto = prompt("Monto del Anticipo (Bs):"); if(monto) firebase.database().ref(getDbPath(`solicitudes/SOL_ANT_${Date.now()}`)).set({ tipo: 'ANTICIPO', trabajador: localStorage.getItem('u_wr'), detalle: `Monto: Bs. ${monto}`, fecha: new Date().toLocaleString(), estado: 'Pendiente' }).then(() => alert("✅ Solicitud enviada.")); };

// ==========================================================
// 🛎️ SOLICITUDES
// ==========================================================
function dibujarSolicitudes() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black"><div class="max-w-md mx-auto"><div class="bg-orange-600 p-6 text-white flex justify-between rounded-t-3xl shadow-lg"><h2 class="text-xl font-black italic uppercase">SOLICITUDES</h2><button onclick="window.location.hash='#menu'" class="bg-white text-orange-700 px-4 py-1 rounded-full font-bold text-xs">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl"><div id="list-solicitudes" class="space-y-4">Cargando...</div></div></div></div>`;
    firebase.database().ref(getDbPath('solicitudes')).on('value', snap => {
        const c = document.getElementById('list-solicitudes'); if (!c) return; c.innerHTML = '';
        const sol = snap.val() || {}; let hay = false;
        Object.keys(sol).forEach(id => {
            const s = sol[id];
            if (s.estado === 'Pendiente') { hay = true; const color = s.tipo === 'MATERIAL' ? 'blue' : 'green';
                c.innerHTML += `<div class="p-4 bg-${color}-50 rounded-2xl border-2 border-${color}-200 shadow-sm relative"><div class="flex justify-between mb-2"><div><b class="text-sm uppercase">${s.trabajador}</b><br><span class="text-[9px] text-zinc-500">${s.fecha}</span></div><span class="text-[9px] bg-${color}-600 text-white px-2 py-1 rounded-lg">${s.tipo}</span></div><p class="text-sm font-bold bg-white p-2 border rounded-lg">${s.detalle}</p><button onclick="window.marcarSolicitudLeida('${id}')" class="w-full mt-2 bg-zinc-800 text-white text-[10px] font-black py-3 rounded-xl uppercase">Marcar Visto</button></div>`;
            }
        });
        if(!hay) c.innerHTML = `<p class="text-center text-zinc-500 text-xs font-bold py-10">No hay solicitudes.</p>`;
    });
}
window.marcarSolicitudLeida = (id) => firebase.database().ref(getDbPath(`solicitudes/${id}`)).update({ estado: 'Atendido' });

// ==========================================================
// 📋 ASISTENCIA PRO (CON HORAS DE ATRASO Y MODAL)
// ==========================================================
function dibujarAsistencia() {
    const adm = localStorage.getItem('a_wr') === 'true';
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto bg-white rounded-3xl shadow-xl border-t-8 border-red-600">
            <div class="p-6 flex justify-between items-center border-b">
                <div><h2 class="text-2xl font-black italic uppercase">ASISTENCIA</h2><input type="date" value="${fechaSel}" ${adm ? 'onchange="window.chF(this.value)"' : 'disabled'} class="mt-1 text-[12px] font-bold text-red-600 bg-red-50 p-1 px-2 rounded-lg border border-red-200 outline-none"></div>
                <button onclick="window.location.hash='#menu'" class="bg-zinc-100 p-2 rounded-xl text-xs font-bold">VOLVER</button>
            </div>
            <div class="p-6">
                <div class="bg-zinc-900 p-4 rounded-2xl mb-4 text-center"><select id="sel-o" onchange="window.chO(this.value)" class="w-full bg-transparent font-black text-lg uppercase outline-none text-red-500"></select></div>
                <div id="list-asist" class="space-y-3"></div>
            </div>
        </div>
    </div>
    
    <div id="modal-asistencia" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border-t-8 border-red-600">
            <h3 id="modal-nombre" class="text-2xl font-black uppercase text-red-600 mb-4 text-center">NOMBRE</h3>
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-zinc-100 p-2 rounded-xl"><label class="text-[9px] text-zinc-500 font-bold uppercase block">DIA NORMAL:</label><select id="modal-j-normal" class="w-full p-2 border rounded-lg font-black text-xs outline-none"><option value="1">1 Dia</option><option value="0.5">0.5 Dias</option><option value="0">0 Dias</option></select></div>
                <div class="bg-blue-50 p-2 rounded-xl"><label class="text-[9px] text-blue-600 font-bold uppercase block">TURNO EXTRA:</label><select id="modal-j-extra" class="w-full p-2 border rounded-lg font-black text-xs outline-none"><option value="0">0</option><option value="0.5">0.5</option><option value="1">1</option><option value="1.5">1.5</option></select></div>
                <div class="bg-orange-50 p-2 rounded-xl col-span-2"><label class="text-[9px] text-orange-700 font-bold block text-center">Horas de Atraso:</label><input id="modal-atraso-horas" type="number" value="0" step="0.5" class="w-full p-2 border rounded-lg font-black text-center text-xs"></div>
            </div>
            <div class="mb-5 bg-red-50 p-3 rounded-xl border border-red-200">
                <label class="text-[10px] text-red-600 font-black uppercase mb-2 block text-center">ANTICIPOS (Bs):</label>
                <div class="flex items-center justify-center gap-2 mb-2"><input id="modal-anticipo" type="number" placeholder="0" class="w-24 p-2 border-2 border-red-300 rounded-xl font-black text-center text-xl outline-none bg-white text-red-700"></div>
                <div class="flex gap-1 justify-center"><button type="button" onclick="window.sumarAlAnticipo(10)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs shadow-sm">+ 10</button><button type="button" onclick="window.sumarAlAnticipo(20)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs shadow-sm">+ 20</button><button type="button" onclick="window.sumarAlAnticipo(50)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs shadow-sm">+ 50</button></div>
            </div>
            <div class="flex gap-2 mt-2">
                <button onclick="document.getElementById('modal-asistencia').classList.add('hidden')" class="flex-1 bg-zinc-200 text-zinc-700 font-black py-3 rounded-xl text-xs">CANCELAR</button>
                <button id="btn-quitar-asist" onclick="window.quitarAsistenciaModal()" class="flex-1 bg-red-100 text-red-600 font-black py-3 rounded-xl text-xs hidden">BORRAR</button>
                <button onclick="window.guardarAsistenciaModal()" class="flex-[2] bg-green-600 text-white font-black py-3 rounded-xl shadow-lg text-xs uppercase">GUARDAR</button>
            </div>
        </div>
    </div>`;

    data.obtenerObras(obs => {
        const s = document.getElementById('sel-o'); s.innerHTML = '<option value="GENERAL">GENERAL</option>';
        Object.keys(obs).forEach(id => { if (obs[id].estado !== 'Entregada') s.innerHTML += `<option value="${obs[id].nombre}">${obs[id].nombre}</option>`; });
        s.value = obraSel;
    });

    firebase.database().ref(getDbPath('asistencia_semanal/' + fechaSel)).on('value', snap => {
        window.currentMarks = snap.val() || {};
        data.obtenerPersonal(per => { window.currentPersonal = per || {}; window.renderListaPintores(); });
    });
}
window.chF = (nuevaFecha) => { fechaSel = nuevaFecha; dibujarAsistencia(); };
window.chO = (v) => { obraSel = v; window.renderListaPintores(); };

window.renderListaPintores = () => {
    const c = document.getElementById('list-asist'); if (!c) return; c.innerHTML = '';
    const esAdmin = (localStorage.getItem('rol_wr') === 'admin');
    
    // Normalizamos las marcas para que todo se compare en MAYÚSCULAS
    const marcasMap = {};
    Object.keys(window.currentMarks).forEach(n => {
        marcasMap[n.toUpperCase()] = window.currentMarks[n];
    });
    
    Object.keys(window.currentMarks).forEach(n => {
        const r = window.currentMarks[n];
        if(r.obra === "POR ASIGNAR") {
            let gpsLink = '';
            if (r.hora_entrada) {
                gpsLink += `<button onclick="window.open('https://maps.google.com/?q=' + encodeURIComponent('${r.gps_entrada || ''}'), '_blank')" class="text-green-600 font-black text-[9px] uppercase mt-1 block underline text-left">☀️ ENT: ${r.hora_entrada} 🗺️</button>`;
            }
            if (r.hora_salida) {
                gpsLink += `<button onclick="window.open('https://maps.google.com/?q=' + encodeURIComponent('${r.gps_salida || ''}'), '_blank')" class="text-red-500 font-black text-[9px] uppercase mt-1 block underline text-left">🌙 SAL: ${r.hora_salida} 🗺️</button>`;
            }
            if (!gpsLink && r.hora_registro) { 
                gpsLink = `<button onclick="window.open('https://maps.google.com/?q=' + encodeURIComponent('${r.gps_registro || ''}'), '_blank')" class="text-blue-600 font-black text-[9px] uppercase mt-1 block underline text-left">🗺️ VER REGISTRO (${r.hora_registro})</button>`;
            }
            if (!gpsLink) gpsLink = `<span class="text-[10px] font-bold text-yellow-800 block mt-1">📍 SIN MARCAS</span>`;
                
            c.innerHTML += `<div class="flex items-center justify-between p-3 bg-yellow-50 rounded-2xl border-2 border-yellow-400 mb-2"><div><b class="text-sm uppercase">${n}</b><br>${gpsLink}</div><div class="flex flex-col gap-1"><button onclick="window.markP('${n}', 'mover')" class="p-2 rounded-xl bg-yellow-400 text-[9px] font-black w-24 shadow-sm">ASIGNAR AQUÍ</button><button onclick="window.borrarMarcaFalsa('${n}')" class="p-2 rounded-xl bg-red-100 text-red-600 border border-red-300 text-[9px] font-black w-24">BORRAR MARCA</button></div></div>`;
        }
    });

    Object.keys(window.currentPersonal).forEach(n => {
        const nombreMayus = n.toUpperCase();
        const r = marcasMap[nombreMayus]; 
        
        if(r && r.obra === "POR ASIGNAR") return;
        
        const eO = r && r.obra === obraSel, eOt = r && r.obra !== obraSel;
        let btn = '', bColor = 'border-zinc-200';
        
        if (eO) { 
            bColor = 'border-green-500 bg-green-50'; 
            btn = `<button onclick="window.abrirModalAsistencia('${nombreMayus}', true)" class="p-2 rounded-xl bg-green-500 text-white w-24 font-black text-xs">REGISTRADO</button>`; 
        } else if (eOt) { 
            bColor = 'border-orange-200'; 
            btn = `<button onclick="window.markP('${nombreMayus}', 'mover')" class="p-2 rounded-xl bg-orange-100 text-orange-700 text-[9px] font-black border border-orange-300 w-24">EN: ${r.obra}</button>`; 
        } else { 
            btn = `<button onclick="window.abrirModalAsistencia('${nombreMayus}', false)" class="p-3 rounded-xl bg-zinc-800 text-white font-black w-24 text-xs">ASISTENCIA</button>`; 
        }
        
        let info = '';
        if (r) {
            let iA = [];
            if (eO) {
                let jN = r.jornada_normal !== undefined ? r.jornada_normal : 1;
                if (jN > 0) iA.push(`N: ${jN}D`); if (r.jornada_extra > 0) iA.push(`E: ${r.jornada_extra}D`);
                if (r.horas_atraso > 0) iA.push(`Atraso: ${r.horas_atraso}h`); if (r.monto_anticipo > 0) iA.push(`Ant: Bs.${r.monto_anticipo}`);
            }
            
            const textoAsistencia = iA.length > 0 ? `<span class="text-[10px] text-green-700 font-bold block">${iA.join(' | ')}</span>` : '';
            
            let gpsLink = '';
            if (r.hora_entrada) {
                gpsLink += `<button onclick="window.open('https://maps.google.com/?q=' + encodeURIComponent('${r.gps_entrada || ''}'), '_blank')" class="text-green-700 font-black text-[9px] uppercase mt-1 inline-block underline mr-2">☀️ ENTRADA: ${r.hora_entrada}</button>`;
            }
            if (r.hora_salida) {
                gpsLink += `<button onclick="window.open('https://maps.google.com/?q=' + encodeURIComponent('${r.gps_salida || ''}'), '_blank')" class="text-red-600 font-black text-[9px] uppercase mt-1 inline-block underline">🌙 SALIDA: ${r.hora_salida}</button>`;
            }
            if (!gpsLink && r.hora_registro) {
                gpsLink = `<button onclick="window.open('https://maps.google.com/?q=' + encodeURIComponent('${r.gps_registro || ''}'), '_blank')" class="text-red-600 font-black text-[9px] uppercase mt-1 block underline">🗺️ AUDITAR GPS (${r.hora_registro})</button>`;
            }
            
            info = `<br>${textoAsistencia}${gpsLink}`;
        }
        
        c.innerHTML += `<div class="flex items-center justify-between p-3 bg-white rounded-2xl border-2 ${bColor} text-black uppercase transition-all shadow-sm"><div><b class="text-sm">${nombreMayus}</b>${info}</div>${btn}</div>`;
    });
};

window.abrirModalAsistencia = (n, existe) => {
    const adm = localStorage.getItem('a_wr') === 'true'; if (existe && !adm) { alert("Solo Gerencia edita."); return; }
    window.pintorActualModal = n; const r = window.currentMarks[n] || {};
    document.getElementById('modal-nombre').innerText = n;
    document.getElementById('modal-j-normal').value = r.jornada_normal !== undefined ? r.jornada_normal : 1;
    document.getElementById('modal-j-extra').value = r.jornada_extra || 0;
    document.getElementById('modal-anticipo').value = r.monto_anticipo || 0;
    document.getElementById('modal-atraso-horas').value = r.horas_atraso || 0;
    existe ? document.getElementById('btn-quitar-asist').classList.remove('hidden') : document.getElementById('btn-quitar-asist').classList.add('hidden');
    document.getElementById('modal-asistencia').classList.remove('hidden');
};
window.sumarAlAnticipo = (m) => { const i = document.getElementById('modal-anticipo'); i.value = (parseFloat(i.value) || 0) + m; };
window.guardarAsistenciaModal = () => {
    const n = window.pintorActualModal;
    firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).set({ nombre: n, obra: obraSel, jornada_normal: parseFloat(document.getElementById('modal-j-normal').value), jornada_extra: parseFloat(document.getElementById('modal-j-extra').value), monto_anticipo: parseFloat(document.getElementById('modal-anticipo').value), horas_atraso: parseFloat(document.getElementById('modal-atraso-horas').value) });
    document.getElementById('modal-asistencia').classList.add('hidden');
};
window.quitarAsistenciaModal = () => { if (confirm(`¿Eliminar a ${window.pintorActualModal}?`)) { firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${window.pintorActualModal}`)).remove(); document.getElementById('modal-asistencia').classList.add('hidden'); } };
window.markP = (n, acc) => { if (confirm(`¿Mover a ${n}?`)) firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).update({ obra: obraSel }); };
window.borrarMarcaFalsa = (n) => { if(confirm(`¿Desea borrar la asistencia fantasma de ${n}?`)) { firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).remove(); } };

// ==========================================================
// 🏗️ OBRAS
// ==========================================================
function dibujarObras() {
    const rol = localStorage.getItem('rol_wr');
    const esAdmin = (rol === 'admin');

    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-zinc-900 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg">
                <h2 class="text-xl font-black italic uppercase">CONTROL DE OBRAS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl">
                ${esAdmin ? `
                <input id="o-nom" type="text" placeholder="NOMBRE DEL PROYECTO" class="w-full p-3 rounded-xl border-2 font-bold mb-2 uppercase">
                <input id="o-pre" type="number" placeholder="PRESUPUESTO TOTAL Bs." class="w-full p-3 rounded-xl border-2 font-bold mb-3">
                <button onclick="window.saveO()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-md">REGISTRAR PROYECTO</button>
                ` : ''}
                
                <h3 class="mt-8 mb-4 font-black uppercase text-sm border-b-2 pb-2">PROYECTOS ACTIVOS</h3>
                <div id="list-o-activas" class="space-y-4"></div>
                
                <h3 class="mt-8 mb-4 font-black uppercase text-sm border-b-2 pb-2 text-zinc-400">PROYECTOS ENTREGADOS</h3>
                <div id="list-o-entregadas" class="space-y-4 opacity-75"></div>
            </div>
        </div>
    </div>`;

    firebase.database().ref(getDbPath('obras')).on('value', snap => {
        const cA = document.getElementById('list-o-activas'), cE = document.getElementById('list-o-entregadas');
        if (!cA || !cE) return; cA.innerHTML = ''; cE.innerHTML = ''; 
        const obs = snap.val() || {};
        firebase.database().ref(getDbPath('finanzas_obras')).once('value').then(fSnap => {
            const fin = fSnap.val() || {};
            Object.keys(obs).forEach(id => {
                const o = obs[id]; let cob = 0, gas = 0;
                if (fin[id]) Object.values(fin[id]).forEach(m => { if (m.tipo === 'anticipo_cliente') cob += parseFloat(m.monto); else gas += parseFloat(m.monto); });
                const fRes = o.presupuesto * 0.05, gNeta = o.presupuesto - gas - fRes;
                
                const btnG = o.link_fotos ? `<div class="mb-3"><button onclick="window.open('${o.link_fotos}','_blank')" class="w-full bg-blue-600 text-white text-[10px] font-black py-2 rounded-lg">VER FOTOS</button></div>` : (esAdmin ? `<button onclick="window.agregarLinkObra('${id}')" class="w-full mb-3 bg-zinc-100 text-[10px] font-black py-2 rounded-lg">Vincular Galeria</button>` : '');
                
                const card = `
                <div class="p-4 bg-zinc-50 rounded-2xl border-2 ${o.estado !== 'Entregada' ? 'border-zinc-300' : 'border-green-500'} relative">
                    <b class="text-xl uppercase text-red-600">${o.nombre}</b>
                    
                    ${esAdmin ? `
                    <div class="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase mb-2 mt-2">
                        <div class="bg-white p-2 rounded-xl border">Contrato:<br>Bs. ${o.presupuesto}</div>
                        <div class="bg-white p-2 rounded-xl border">Cobrado:<br><span class="text-blue-600">Bs. ${cob}</span></div>
                        <div class="bg-zinc-900 text-white p-2 rounded-xl">Utilidad Neta:<br><span class="${gNeta >= 0 ? 'text-green-400' : 'text-red-500'}">Bs. ${gNeta.toFixed(1)}</span></div>
                    </div>
                    ` : `<div class="py-2 text-zinc-500 italic text-[10px] font-bold uppercase">Información financiera restringida</div>`}
                    
                    ${btnG}
                    
                    ${esAdmin ? `
                    <div class="pt-2 flex flex-wrap gap-1 justify-between">
                        <button onclick="window.cobrarAnticipo('${id}')" class="flex-1 bg-blue-100 text-blue-700 text-[9px] font-black p-2 rounded-lg">Cobrar Ant.</button>
                        <button onclick="window.cambiarEstadoO('${id}', '${o.estado === 'Entregada' ? 'Activa' : 'Entregada'}')" class="flex-1 text-[9px] font-black p-2 rounded-lg ${o.estado === 'Entregada' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}">Entregar</button>
                        <button onclick="window.editarNombreObra('${id}', '${o.nombre}')" class="flex-1 text-blue-600 text-[9px] font-black underline p-2">Editar</button>
                        <button onclick="window.delO('${id}')" class="flex-1 text-red-500 text-[9px] font-black underline p-2">Borrar</button>
                    </div>` : ''}
                </div>`;
                o.estado !== 'Entregada' ? cA.innerHTML += card : cE.innerHTML += card;
            });
        });
    });
}
window.agregarLinkObra = (id) => { const l = prompt("Enlace fotos:"); if (l) firebase.database().ref(getDbPath(`obras/${id}`)).update({ link_fotos: l }); };
window.saveO = () => { const n = document.getElementById('o-nom').value.trim(), p = document.getElementById('o-pre').value; if (n && p) { firebase.database().ref(getDbPath('obras')).push({ nombre: n.toUpperCase(), presupuesto: p, estado: 'Activa' }); document.getElementById('o-nom').value = ''; document.getElementById('o-pre').value = ''; } else alert("Campos vacios"); };
window.delO = (id) => { if (confirm("¿Borrar?")) firebase.database().ref(getDbPath(`obras/${id}`)).remove(); };
window.cambiarEstadoO = (id, e) => { firebase.database().ref(getDbPath(`obras/${id}`)).update({ estado: e }); };
window.cobrarAnticipo = (id) => { const m = prompt("Monto Cobrado (Bs.):"); if (m) data.registrarMovimiento(id, 'anticipo_cliente', m, "Anticipo"); };
window.editarNombreObra = (id, old) => { const n = prompt("Nuevo nombre:", old); if (n && n.toUpperCase() !== old.toUpperCase()) firebase.database().ref(getDbPath(`obras/${id}`)).update({ nombre: n.toUpperCase() }); };

// ==========================================================
// 👷 PERSONAL
// ==========================================================
function dibujarPersonal() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black"><div class="max-w-md mx-auto"><div class="bg-zinc-800 p-6 text-white flex justify-between rounded-t-3xl"><h2 class="text-xl font-black italic">PERSONAL</h2><button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl"><input id="p-nom" type="text" placeholder="NOMBRE" class="w-full p-3 rounded-xl border-2 uppercase font-bold mb-2"><input id="p-sue" type="number" placeholder="PAGO DIARIO Bs." class="w-full p-3 rounded-xl border-2 font-bold mb-3"><button onclick="window.saveP()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg">REGISTRAR PERSONAL</button><div id="list-p" class="space-y-3 pt-4 mt-4 border-t">Cargando...</div></div></div></div>`;
    firebase.database().ref(getDbPath('personal')).on('value', snap => {
        const c = document.getElementById('list-p'); if (!c) return; c.innerHTML = ''; const p = snap.val() || {};
        Object.keys(p).forEach(n => { c.innerHTML += `<div class="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center border uppercase"><div><b class="text-sm">${n}</b><br><span class="text-[10px] text-zinc-500 font-bold">Sueldo: Bs. ${p[n].sueldo_dia}</span></div><div class="flex flex-col gap-1"><button onclick="window.editarP('${n}', ${p[n].sueldo_dia})" class="text-blue-600 font-black px-3 py-1 bg-blue-100 rounded-lg text-[10px]">EDITAR</button><button onclick="window.delP('${n}')" class="text-red-600 font-black px-3 py-1 bg-red-100 rounded-lg text-[10px]">BORRAR</button></div></div>`; });
    });
}
window.saveP = () => { const n = document.getElementById('p-nom').value.trim().toUpperCase(), s = document.getElementById('p-sue').value; if (n && s) firebase.database().ref(getDbPath(`personal/${n}`)).set({ sueldo_dia: s }); };
window.delP = (n) => { if (confirm(`¿Borrar a ${n}?`)) firebase.database().ref(getDbPath(`personal/${n}`)).remove(); };
window.editarP = (old, sOld) => { let n = prompt("Nombre:", old); if(!n) return; let s = prompt("Sueldo:", sOld); if(!s) return; if(n.toUpperCase() !== old) { firebase.database().ref(getDbPath(`personal/${n.toUpperCase()}`)).set({ sueldo_dia: s }); firebase.database().ref(getDbPath(`personal/${old}`)).remove(); } else { firebase.database().ref(getDbPath(`personal/${old}`)).update({ sueldo_dia: s }); } };

// ==========================================================
// 💰 SUELDOS Y PAGOS
// ==========================================================
function dibujarPlanilla() {
    appDiv.innerHTML = `<div class="min-h-screen bg-black p-4 text-white"><div class="max-w-md mx-auto"><div class="flex justify-between mb-4"><h2 class="text-2xl font-black italic text-red-600">SUELDOS</h2><button onclick="window.location.hash='#menu'" class="bg-zinc-800 px-4 py-1 rounded-full text-xs font-bold">VOLVER</button></div><div class="bg-zinc-900 p-4 rounded-2xl mb-4 flex gap-2 text-[10px] font-bold border border-zinc-800"><div class="flex-1 text-left"><label class="text-zinc-500 uppercase">Lunes</label><input type="date" value="${pFIni}" onchange="window.chPIni(this.value)" class="w-full bg-black p-2 rounded-lg text-white"></div><div class="flex-1 text-left"><label class="text-zinc-500 uppercase">Corte</label><input type="date" value="${pFFin}" onchange="window.chPFin(this.value)" class="w-full bg-black p-2 rounded-lg text-white"></div></div><button onclick="window.verHistorialSueldos()" class="w-full bg-zinc-800 py-3 rounded-xl mb-4 font-black text-[11px] uppercase border border-zinc-700 shadow-md">🗂️ Ver Historial Anteriores</button><div id="c-p" class="space-y-6 pb-10">Cargando...</div></div></div>`;
    data.obtenerTodo((db) => {
        const c = document.getElementById('c-p'); if (!c) return;
        const per = db.personal || {}, hist = db.asistencia_semanal || {}, pagosRealizados = db.pagos_historial || {}, res = {};
        Object.keys(hist).forEach(f => { if (f >= pFIni && f <= pFFin) { Object.values(hist[f]).forEach(reg => {
            const idRef = `${reg.nombre}_semana_${pFIni}`; if (pagosRealizados[idRef]) return;
            if (!res[reg.nombre]) res[reg.nombre] = { dNorm: 0, dExt: 0, ant: 0, hAtraso: 0, obraPrincipal: reg.obra };
            res[reg.nombre].dNorm += parseFloat(reg.jornada_normal !== undefined ? reg.jornada_normal : 1);
            res[reg.nombre].dExt += parseFloat(reg.jornada_extra || 0);
            res[reg.nombre].ant += parseFloat(reg.monto_anticipo || 0);
            res[reg.nombre].hAtraso += parseFloat(reg.horas_atraso || 0);
        });}});
        c.innerHTML = ''; let tP = 0; const list = Object.keys(res);
        if (list.length === 0) { c.innerHTML = `<p class="text-center text-zinc-500 text-xs font-bold uppercase mt-10">No hay pagos pendientes.</p>`; return; }
        list.forEach(n => {
            const d = res[n], sDia = parseFloat(per[n]?.sueldo_dia) || 0, comp = d.dNorm >= 5.5 ? 0.5 : 0;
            const sTot = (d.dNorm + comp + d.dExt) * sDia, desc = d.hAtraso * (sDia / 8), saldo = sTot - d.ant - desc; tP += saldo;
            c.innerHTML += `<div class="bg-zinc-900 p-5 rounded-3xl border-l-8 border-red-600 relative"><div class="flex justify-between mb-4 border-b border-zinc-800 pb-2"><h3 class="font-black text-xl">${n}</h3><span class="bg-red-600 px-3 rounded-lg font-black text-sm py-1">${(d.dNorm + comp + d.dExt).toFixed(1)} D</span></div><div class="grid grid-cols-2 gap-2 mb-4"><div class="bg-black p-2 rounded-xl"><span class="text-[9px] text-zinc-500 block">Salario Base</span>Bs. ${sDia}</div><div class="bg-black p-2 rounded-xl text-red-400"><span class="text-[9px] block">Anticipos</span>-Bs. ${d.ant}</div></div><button onclick="window.ejecutarPagoEfectivo('${n}', ${saldo}, '${d.obraPrincipal}', ${sDia}, ${d.dNorm}, ${d.dExt}, ${d.ant}, ${d.hAtraso}, ${desc}, ${comp})" class="w-full bg-green-500 text-white py-4 rounded-xl font-black text-lg">PAGAR: Bs. ${saldo.toFixed(2)}</button></div>`;
        });
        if (tP > 0) c.innerHTML = `<div class="bg-green-600 p-5 rounded-3xl mb-6 text-center"><p class="text-[10px] font-black mb-1">TOTAL PLANILLA</p><span class="text-4xl font-black">Bs. ${tP.toFixed(2)}</span></div>` + c.innerHTML;
    });
}
window.chPIni = (v) => { pFIni = v; dibujarPlanilla(); }; window.chPFin = (v) => { pFFin = v; dibujarPlanilla(); };
window.ejecutarPagoEfectivo = (n, m, oN, sDia, dN, dE, ant, hA, desc, comp) => {
    if (confirm(`¿Transferir Bs. ${m.toFixed(2)} a ${n}?`)) {
        firebase.database().ref(getDbPath('obras')).once('value').then(s => {
            const obs = s.val() || {}; const idO = Object.keys(obs).find(id => obs[id].nombre === oN);
            if (idO) {
                const sueldoBruto = m + ant + desc; 
                data.registrarMovimiento(idO, 'pago_sueldo', sueldoBruto, `Sueldo Semanal: ${n}`);
                firebase.database().ref(getDbPath(`pagos_historial/${n}_semana_${pFIni}`)).set({ 
                    fecha_pago: new Date().toISOString(), 
                    trabajador: n, 
                    monto: m, 
                    semana_ancla: pFIni, 
                    detalles: { sueldo_dia: sDia, dias_normales: dN, dias_extras: dE, anticipos: ant, horas_atraso: hA, descuento_atraso: desc, compensacion: comp } 
                }).then(() => dibujarPlanilla());
            }
        });
    }
};
window.verHistorialSueldos = () => {
    appDiv.innerHTML = `<div class="min-h-screen bg-black p-4 text-white"><button onclick="window.location.hash='#planilla'" class="bg-red-600 px-4 py-2 rounded-lg font-bold text-xs mb-4">VOLVER</button><h2 class="text-xl font-black mb-4">HISTORIAL DE PAGOS</h2><div id="lista-historial-sueldos">Cargando...</div></div>`;
    firebase.database().ref(getDbPath('pagos_historial')).once('value').then(s => {
        const c = document.getElementById('lista-historial-sueldos'); const p = s.val() || {}; c.innerHTML = '';
        Object.values(p).forEach(pg => { c.innerHTML += `<div class="bg-zinc-900 p-4 mb-2 rounded-xl"><b>${pg.trabajador}</b>: Bs. ${pg.monto} <br><span class="text-xs text-zinc-500">${pg.fecha_pago}</span></div>`; });
    });
};

// ==========================================================
// 🛠️ INVENTARIO (HERRAMIENTAS)
// ==========================================================
function dibujarHerramientas() {
    const rol = localStorage.getItem('rol_wr');
    const esAdmin = (rol === 'admin');

    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-yellow-600 p-6 text-white flex justify-between rounded-t-3xl shadow-lg">
                <h2 class="text-xl font-black italic">INVENTARIO PRO</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-yellow-700 px-4 py-1 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl">
                ${esAdmin ? `
                <div class="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 mb-4">
                    <h3 class="text-[10px] font-black text-yellow-800 mb-3 text-center">INGRESO Y ASIGNACIÓN EN LOTE</h3>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <div>
                            <label class="text-[9px] font-black block text-zinc-500 mb-1">RESPONSABLE:</label>
                            <select id="h-trabajador" class="w-full p-2 border rounded-xl text-xs font-bold bg-white outline-none">
                                <option value="BODEGA">-- EN BODEGA --</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[9px] font-black block text-zinc-500 mb-1">UBICACIÓN / OBRA:</label>
                            <select id="h-obra" class="w-full p-2 border rounded-xl text-xs font-bold bg-white outline-none">
                                <option value="Ninguna">-- SIN OBRA --</option>
                            </select>
                        </div>
                    </div>
                    <textarea id="h-nom" rows="4" placeholder="Escriba las herramientas (Dando ENTER por línea)." class="w-full p-3 rounded-xl border-2 uppercase font-bold text-xs mb-2 resize-none outline-none"></textarea>
                    <button onclick="window.saveHerr()" class="w-full bg-black text-white font-black py-3 rounded-xl uppercase text-xs shadow-md">REGISTRAR Y ASIGNAR</button>
                </div>
                ` : ''}

                <h3 class="mt-6 mb-2 font-black text-yellow-700 uppercase text-xs border-b-2 border-yellow-200 pb-1">ESTADO DEL EQUIPO</h3>
                <div class="flex gap-1 mb-4">
                    <button onclick="window.filtrarHerr('TODAS')" class="flex-1 bg-zinc-900 text-white font-bold py-2 rounded-xl text-[9px]">TODAS</button>
                    <button onclick="window.filtrarHerr('EN USO')" class="flex-1 bg-orange-100 text-orange-800 font-bold py-2 rounded-xl text-[9px]">EN USO</button>
                    <button onclick="window.filtrarHerr('BODEGA')" class="flex-1 bg-green-100 text-green-800 font-bold py-2 rounded-xl text-[9px]">BODEGA</button>
                </div>
                <div id="list-herr" class="space-y-4 pt-2">Cargando herramientas...</div>
            </div>
        </div>
    </div>`;

    data.obtenerTodo((db) => {
        const h = db.herramientas || {}, p = db.personal || {}, o = db.obras || {};
        window.todasHerramientas = h; 
        window.personalDisponibles = p;
        window.obrasDisponibles = o;

        if(esAdmin) {
            const selT = document.getElementById('h-trabajador');
            const selO = document.getElementById('h-obra');
            if(selT && selO) {
                Object.keys(p).forEach(k => selT.innerHTML += `<option value="${k}">${k}</option>`);
                Object.keys(o).forEach(k => { if(o[k].estado !== 'Entregada') selO.innerHTML += `<option value="${o[k].nombre}">${o[k].nombre}</option>` });
            }
        }
        window.renderListaHerr('TODAS');
    });
}

window.filtrarHerr = (filtro) => { window.renderListaHerr(filtro); };

window.renderListaHerr = (filtro) => {
    const c = document.getElementById('list-herr'); 
    if (!c) return; 
    c.innerHTML = '';
    
    const esAdmin = (localStorage.getItem('rol_wr') === 'admin');
    const h = window.todasHerramientas || {};
    const p = window.personalDisponibles || {};
    const o = window.obrasDisponibles || {};
    let hay = false;

    let opcionesP = `<option value="BODEGA">-- EN BODEGA --</option>`;
    Object.keys(p).forEach(k => opcionesP += `<option value="${k}">${k}</option>`);
    let opcionesO = `<option value="Ninguna">-- SIN OBRA --</option>`;
    Object.keys(o).forEach(k => { if(o[k].estado !== 'Entregada') opcionesO += `<option value="${o[k].nombre}">${o[k].nombre}</option>` });

    Object.keys(h).forEach(id => {
        const item = h[id]; 
        const enB = !item.asignado_a || item.asignado_a === 'BODEGA';
        if (filtro === 'EN USO' && enB) return;
        if (filtro === 'BODEGA' && !enB) return;
        hay = true;

        if (enB) {
            c.innerHTML += `
            <div class="p-4 bg-zinc-50 rounded-2xl border-2 border-green-500 shadow-sm">
                <div class="flex justify-between items-center mb-2">
                    <b class="text-sm uppercase text-zinc-800">${item.nombre}</b>
                    <span class="text-[9px] bg-green-500 text-white px-2 py-1 rounded-lg font-black">EN BODEGA</span>
                </div>
                ${esAdmin ? `
                <div class="bg-white p-3 rounded-xl border border-zinc-200 mt-2">
                    <span class="text-[9px] font-black text-zinc-400 block mb-1 uppercase">Entregar a:</span>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <select id="cardT_${id}" class="p-2 border rounded-lg text-[10px] bg-zinc-50 font-bold">${opcionesP}</select>
                        <select id="cardO_${id}" class="p-2 border rounded-lg text-[10px] bg-zinc-50 font-bold">${opcionesO}</select>
                    </div>
                    <div class="flex gap-2 items-center mt-2 pt-2 border-t">
                        <button onclick="window.cambiarDestinoHerr('${id}')" class="flex-[3] bg-yellow-500 text-white text-[10px] font-black py-2 rounded-lg uppercase">Despachar Equipo</button>
                        <button onclick="window.delHerr('${id}')" class="flex-1 text-red-600 text-[10px] font-bold underline">Borrar</button>
                    </div>
                </div>
                ` : `<div class="mt-1 text-[10px] text-zinc-500 italic font-bold">Solo Gerencia puede asignar esta herramienta.</div>`}
            </div>`;
        } else {
            c.innerHTML += `
            <div class="p-4 bg-orange-50 rounded-2xl border-2 border-orange-400 shadow-sm">
                <div class="flex justify-between items-center mb-2">
                    <b class="text-sm uppercase text-orange-900">${item.nombre}</b>
                    <span class="text-[9px] bg-orange-500 text-white px-2 py-1 rounded-lg font-black">EN USO</span>
                </div>
                <div class="my-2 p-2 bg-orange-100 border border-orange-200 rounded-xl text-center">
                    <span class="text-[9px] font-black text-orange-800 block uppercase tracking-wider">Poseedor Actual:</span>
                    <span class="text-xs font-black text-black">${item.asignado_a} 📍 ${item.obra}</span>
                </div>
                ${esAdmin ? `
                <div class="bg-white p-3 rounded-xl border border-orange-200 mt-2">
                    <span class="text-[9px] font-black text-orange-700 block mb-1 uppercase">Transferir o mover directo a:</span>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <select id="cardT_${id}" class="p-2 border rounded-lg text-[10px] bg-zinc-50 font-bold">${opcionesP}</select>
                        <select id="cardO_${id}" class="p-2 border rounded-lg text-[10px] bg-zinc-50 font-bold">${opcionesO}</select>
                    </div>
                    <div class="flex gap-2 mt-2 pt-2 border-t">
                        <button onclick="window.cambiarDestinoHerr('${id}')" class="flex-[2] bg-orange-600 text-white text-[10px] font-black py-2 rounded-lg uppercase">Confirmar Traspaso</button>
                        <button onclick="window.devolverAFlotaHerr('${id}')" class="flex-1 bg-zinc-900 text-white text-[10px] font-black py-2 rounded-lg uppercase">Bodega</button>
                        <button onclick="window.delHerr('${id}')" class="text-red-600 text-[10px] font-bold px-1 underline">Borrar</button>
                    </div>
                </div>
                ` : `<div class="mt-2 text-[10px] text-zinc-600 italic font-bold text-center border-t pt-2 border-orange-200">Verifique que el operario posea físicamente este equipo.</div>`}
            </div>`;
        }
    });
    if(!hay) c.innerHTML = `<p class="text-center text-[10px] text-zinc-500 font-bold italic py-6">No hay herramientas registradas en esta categoría.</p>`;
};

window.saveHerr = () => { 
    const nom = document.getElementById('h-nom').value; 
    const trabajador = document.getElementById('h-trabajador').value;
    const obra = document.getElementById('h-obra').value;
    if (nom.trim() !== '') {
        const lineas = nom.split('\n'); 
        lineas.forEach((linea, index) => {
            if(linea.trim() !== '') {
                firebase.database().ref(getDbPath(`herramientas/HERR_${Date.now()}_${index}`)).set({ 
                    nombre: linea.trim().toUpperCase(), 
                    marca: 'S/M', 
                    asignado_a: trabajador, 
                    obra: obra, 
                    fecha_asignacion: new Date().toISOString() 
                });
            }
        });
        document.getElementById('h-nom').value = '';
        alert("Equipo registrado y asignado correctamente.");
    } else alert("Escriba el nombre de la herramienta.");
};
window.cambiarDestinoHerr = (id) => {
    const t = document.getElementById(`cardT_${id}`).value;
    const o = document.getElementById(`cardO_${id}`).value;
    if(confirm(`¿Confirmar el traspaso de este equipo a ${t} en la obra: ${o}?`)) {
        firebase.database().ref(getDbPath(`herramientas/${id}`)).update({
            asignado_a: t, obra: o, fecha_asignacion: new Date().toISOString()
        }, () => alert("Traspaso ejecutado con éxito."));
    }
};
window.devolverAFlotaHerr = (id) => {
    if(confirm("¿Este equipo está retornando al taller/bodega central?")) {
        firebase.database().ref(getDbPath(`herramientas/${id}`)).update({ asignado_a: 'BODEGA', obra: 'Ninguna' });
    }
};
window.delHerr = (id) => { if(confirm("¿Desea borrar esta herramienta del sistema WRPUMA definitivamente?")) { firebase.database().ref(getDbPath(`herramientas/${id}`)).remove(); } };

// ==========================================================
// 🚀 TRATOS Y DESTAJOS
// ==========================================================
function dibujarTratos() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black pb-10"><div class="max-w-md mx-auto"><div class="bg-purple-700 p-6 text-white flex justify-between rounded-t-3xl shadow-lg"><h2 class="text-xl font-black italic">TRATOS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-purple-700 px-4 py-1 rounded-full text-xs font-bold">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-4"><select id="t-obra" class="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"></select><input id="t-nom" type="text" placeholder="Contratista" class="w-full p-3 rounded-xl border-2 font-bold text-sm"><input id="t-esp" type="text" placeholder="Especialidad" class="w-full p-3 rounded-xl border-2 font-bold text-sm"><input id="t-monto" type="number" placeholder="Monto Total (Bs.)" class="w-full p-3 rounded-xl border-2 font-black text-lg text-purple-700"><button onclick="window.saveTrato()" class="w-full bg-black text-white font-black py-4 rounded-2xl">Registrar Trato</button><h3 class="mt-6 mb-2 font-black text-zinc-500 text-xs border-b-2 pb-1">TRATOS ACTIVOS</h3><div id="list-tratos" class="space-y-4 pt-2">Cargando...</div></div></div></div>`;
    data.obtenerObras(obs => { const s = document.getElementById('t-obra'); s.innerHTML = '<option value="">-- SELECCIONAR OBRA --</option>'; Object.keys(obs).forEach(id => { if (obs[id].estado !== 'Entregada') s.innerHTML += `<option value="${obs[id].nombre}">${obs[id].nombre}</option>`; }); });
    firebase.database().ref(getDbPath('tratos')).on('value', snap => {
        const c = document.getElementById('list-tratos'); if (!c) return; c.innerHTML = ''; const tratos = snap.val() || {};
        Object.keys(tratos).forEach(id => {
            const t = tratos[id]; if (t.estado === 'Finalizado') return; const saldo = t.monto_total - (t.pagado || 0);
            c.innerHTML += `<div class="p-4 bg-zinc-50 rounded-2xl border-2 border-purple-300"><div class="flex justify-between mb-2"><div><b class="text-sm uppercase">${t.contratista}</b><br><span class="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded">${t.especialidad}</span></div><span class="text-[9px] bg-zinc-800 text-white px-2 py-1 rounded-lg">${t.obra}</span></div><div class="grid grid-cols-3 gap-2 text-[10px] font-bold my-3 text-center"><div class="bg-white p-2 rounded-xl border">Total:<br>Bs. ${t.monto_total}</div><div class="bg-white p-2 rounded-xl border">Adelantos:<br><span class="text-red-500">Bs. ${t.pagado || 0}</span></div><div class="bg-purple-600 text-white p-2 rounded-xl">Saldo:<br>Bs. ${saldo}</div></div><div class="flex gap-2"><button onclick="window.pagarTrato('${id}', '${t.obra}', '${t.contratista}', ${saldo})" class="flex-[2] bg-green-500 text-white text-[10px] font-black py-3 rounded-xl">Dar Anticipo</button><button onclick="window.finTrato('${id}')" class="flex-1 bg-zinc-200 text-zinc-700 text-[10px] font-black py-3 rounded-xl">Archivar</button></div></div>`;
        });
    });
}
window.saveTrato = () => { const o = document.getElementById('t-obra').value, n = document.getElementById('t-nom').value.trim(), e = document.getElementById('t-esp').value.trim(), m = parseFloat(document.getElementById('t-monto').value); if (o && n && m) firebase.database().ref(getDbPath(`tratos/TRATO_${Date.now()}`)).set({ obra: o, contratista: n, especialidad: e || 'General', monto_total: m, pagado: 0, estado: 'Activo' }); };
window.pagarTrato = (id, oN, c, sP) => { const m = prompt(`Anticipo a ${c} (Saldo: Bs. ${sP})`); const monto = parseFloat(m); if (monto && monto > 0 && monto <= sP) { firebase.database().ref(getDbPath('obras')).once('value').then(snap => { const obs = snap.val() || {}, idO = Object.keys(obs).find(k => obs[k].nombre === oN); if (idO) { data.registrarMovimiento(idO, 'pago_trato', monto, `Avance Trato: ${c}`); firebase.database().ref(getDbPath(`tratos/${id}`)).once('value').then(tsnap => { firebase.database().ref(getDbPath(`tratos/${id}`)).update({ pagado: (tsnap.val().pagado || 0) + monto }); }); } }); } };
window.finTrato = (id) => { if(confirm("¿Archivar?")) firebase.database().ref(getDbPath(`tratos/${id}`)).update({ estado: 'Finalizado' }); };

// ==========================================================
// 📊 GASTOS Y FERRETERÍAS
// ==========================================================
function dibujarCaja() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-green-600 p-6 text-white flex justify-between rounded-t-3xl shadow-lg">
                <h2 class="text-xl font-black italic">CONTROL GASTOS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-green-700 px-4 py-1 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl">
                <div class="bg-green-50 p-4 rounded-2xl border border-green-200 mb-4">
                    <h3 class="text-[10px] font-black text-green-800 mb-3">NUEVA COMPRA</h3>
                    <select id="c-obra" class="w-full p-3 rounded-xl border-2 font-bold text-xs mb-2"></select>
                    <input id="c-prov" type="text" placeholder="Proveedor / Ferretería" class="w-full p-3 rounded-xl border-2 font-bold text-xs mb-2">
                    <textarea id="c-detalle" rows="3" placeholder="Detalle Completo (Ej. 3 baldes de masilla, 5 lijas Festool)" class="w-full p-3 rounded-xl border-2 font-bold text-xs mb-2 resize-none outline-none"></textarea>
                    <div class="flex gap-2 mb-3">
                        <select id="c-tipo" class="w-1/2 p-3 rounded-xl border-2 font-black text-xs">
                            <option value="compra_contado">CONTADO</option>
                            <option value="compra_credito">CRÉDITO</option>
                        </select>
                        <input id="c-monto" type="number" placeholder="Monto Bs." class="w-1/2 p-3 rounded-xl border-2 font-black text-lg text-red-600">
                    </div>
                    <button onclick="window.saveM()" class="w-full bg-black text-white font-black py-4 rounded-xl text-sm shadow-md">Registrar Gasto</button>
                </div>
                <h3 class="mt-6 mb-2 font-black text-red-600 text-xs border-b-2 border-red-200 pb-1">Deudas Ferreterías</h3>
                <div id="list-creditos" class="space-y-3 pt-2">Cargando...</div>
            </div>
        </div>
    </div>`;
    data.obtenerObras((obs) => { const s = document.getElementById('c-obra'); s.innerHTML = '<option value="">-- PROYECTO --</option>'; Object.keys(obs).forEach(id => { if (obs[id].estado !== 'Entregada') s.innerHTML += `<option value="${id}">${obs[id].nombre}</option>`; }); });
    firebase.database().ref(getDbPath('cuentas_por_pagar')).on('value', snap => {
        const listC = document.getElementById('list-creditos'); if(!listC) return; listC.innerHTML = '';
        const deudas = snap.val() || {}; let hay = false;
        Object.keys(deudas).forEach(id => {
            const d = deudas[id];
            if(d.estado === 'Pendiente') { hay = true; listC.innerHTML += `<div class="p-4 bg-red-50 rounded-2xl border-2 border-red-200"><div class="flex justify-between mb-2"><div><b class="text-sm uppercase">${d.proveedor}</b><br><span class="text-[9px] text-zinc-600 block mt-1">${d.detalle}</span></div><span class="text-[9px] bg-red-600 text-white px-2 py-1 rounded-lg h-fit">${d.obra_nombre}</span></div><div class="flex justify-between items-center mt-3 pt-2 border-t border-red-200"><span class="text-lg font-black text-red-600">Bs. ${d.monto}</span><button onclick="window.pagarDeuda('${id}')" class="bg-green-500 text-white text-[10px] font-black px-3 py-2 rounded-lg">Liquidar</button></div></div>`; }
        });
        if(!hay) listC.innerHTML = `<p class="text-center text-[10px] text-zinc-400 font-bold py-4">No hay deudas.</p>`;
    });
}
window.saveM = () => { const sO = document.getElementById('c-obra'), idO = sO.value, oN = idO ? sO.options[sO.selectedIndex].text : '', prov = document.getElementById('c-prov').value.trim(), det = document.getElementById('c-detalle').value.trim(), tipo = document.getElementById('c-tipo').value, m = parseFloat(document.getElementById('c-monto').value); if (idO && m && prov) { const detF = `${prov.toUpperCase()} | ${det} ${tipo === 'compra_credito' ? '[CRÉDITO]' : '[CONTADO]'}`; data.registrarMovimiento(idO, tipo, m, detF).then(() => { if(tipo === 'compra_credito') { firebase.database().ref(getDbPath(`cuentas_por_pagar/DEUDA_${Date.now()}`)).set({ obra_id: idO, obra_nombre: oN, proveedor: prov.toUpperCase(), detalle: det, monto: m, fecha: new Date().toISOString(), estado: 'Pendiente' }); } alert("Gasto registrado."); }); } };
window.pagarDeuda = (id) => { if(confirm(`¿Liquidar deuda?`)) firebase.database().ref(getDbPath(`cuentas_por_pagar/${id}`)).update({estado: 'Pagado'}); };

// ==========================================================
// 📈 FINANZAS
// ==========================================================
function dibujarUtilidad() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-950 p-4 text-white text-center"><div class="max-w-md mx-auto"><div class="flex justify-between mb-6"><h2 class="text-2xl font-black italic text-red-600">REPORTE FINANCIERO</h2><button onclick="window.location.hash='#menu'" class="bg-zinc-800 px-4 rounded-full text-xs">VOLVER</button></div><div id="cont-util" class="space-y-6 text-left">Cargando...</div></div></div>`;
    data.obtenerTodo((db) => {
        const c = document.getElementById('cont-util'); if (!c) return; const obs = db.obras || {}, fin = db.finanzas_obras || {}; c.innerHTML = ''; let uG = 0;
        Object.keys(obs).forEach(id => {
            const o = obs[id]; let gM = 0;
            if (fin[id]) Object.values(fin[id]).forEach(m => { if (m.tipo === 'compra_material' || m.tipo === 'compra_contado' || m.tipo === 'compra_credito' || m.tipo === 'pago_sueldo' || m.tipo === 'pago_trato') gM += parseFloat(m.monto); });
            const fR = o.presupuesto * 0.05, gN = o.presupuesto - gM - fR; uG += gN;
            c.innerHTML += `<div class="bg-zinc-900 p-6 rounded-3xl border-l-8 ${gN >= 0 ? 'border-red-600' : 'border-orange-500'}"><h3 class="font-black text-lg mb-3">${o.nombre}</h3><div class="grid grid-cols-2 gap-2 text-[10px] mb-4"><div class="bg-black p-2 rounded-xl text-zinc-400">Contrato Base:<br><span class="text-white text-sm">Bs.${o.presupuesto}</span></div><div class="bg-black p-2 rounded-xl text-zinc-400">Costos:<br><span class="text-red-400 text-sm">-Bs.${gM}</span></div></div><div class="bg-zinc-950 p-4 rounded-xl text-center"><p class="text-[9px] text-zinc-500">Beneficio Neto</p><p class="text-3xl font-black ${gN >= 0 ? 'text-green-500' : 'text-orange-500'}">Bs. ${gN.toFixed(1)}</p></div></div>`;
        });
        if (Object.keys(obs).length > 0) c.innerHTML = `<div class="bg-green-600 p-5 rounded-3xl mb-6 text-center"><p class="text-[10px] font-black">BENEFICIO GLOBAL</p><span class="text-4xl font-black">Bs. ${uG.toFixed(1)}</span></div>` + c.innerHTML;
    });
}

// ==========================================================
// 🗄️ CATÁLOGO APU
// ==========================================================
function dibujarAlmacen() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-orange-600 p-6 text-white flex justify-between rounded-t-3xl shadow-lg">
                <h2 class="text-xl font-black italic">CATÁLOGO APU</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-orange-600 px-4 py-1 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-4">
                <input id="m-nom" type="text" placeholder="Servicio (Ej. Efecto Carrara / Velvet)" class="w-full p-3 rounded-xl border-2 font-bold text-sm uppercase">
                <textarea id="m-marca" rows="3" placeholder="Detalle Técnico (Ej. Imprimación epóxica + 2 manos de base + sellador poliuretano)" class="w-full p-3 rounded-xl border-2 font-bold text-xs uppercase resize-none outline-none"></textarea>
                <input id="m-uni" type="text" placeholder="Unidad (Ej. m2, ml, gl)" class="w-full p-3 rounded-xl border-2 font-bold text-sm uppercase">
                <input id="m-pre" type="number" placeholder="Precio Actual (Bs.)" class="w-full p-3 rounded-xl border-2 font-black text-lg text-center text-red-600">
                <button onclick="window.saveMat()" class="w-full bg-black text-white font-black py-4 rounded-2xl">REGISTRAR APU</button>
                <h3 class="mt-6 font-black text-zinc-500 text-xs border-b-2 pb-1">BASE DE DATOS</h3>
                <div id="list-mat" class="space-y-3 pt-2">Cargando...</div>
            </div>
        </div>
    </div>`;
    firebase.database().ref(getDbPath('materiales')).on('value', snap => {
        const c = document.getElementById('list-mat'); if (!c) return; c.innerHTML = ''; const mats = snap.val() || {};
        Object.keys(mats).forEach(id => {
            const m = mats[id]; c.innerHTML += `<div class="p-3 bg-zinc-50 rounded-2xl border-2 border-zinc-200 flex justify-between items-center shadow-sm"><div><b class="text-sm uppercase text-black">${m.nombre}</b><br><span class="text-[9px] text-zinc-600 font-bold block mt-1">${m.marca}</span><span class="text-[10px] text-zinc-500 font-bold bg-zinc-200 px-2 py-0.5 rounded mt-1 inline-block">${m.unidad}</span></div><div class="text-right min-w-[80px]"><span class="text-lg font-black text-red-600">Bs. ${m.precio}</span><br><button onclick="window.delMat('${id}')" class="text-[9px] text-red-400 font-bold underline mt-1">Borrar</button></div></div>`;
        });
    });
}
window.saveMat = () => { const nom = document.getElementById('m-nom').value.trim(), mar = document.getElementById('m-marca').value.trim(), uni = document.getElementById('m-uni').value.trim(), pre = document.getElementById('m-pre').value; if (nom && pre) firebase.database().ref(getDbPath(`materiales/MAT_${Date.now()}`)).set({ nombre: nom, marca: mar || 'GENERAL', unidad: uni || 'M2', precio: parseFloat(pre) }); };
window.delMat = (id) => { if (confirm("¿Borrar?")) firebase.database().ref(getDbPath(`materiales/${id}`)).remove(); };

// ==========================================================
// 🧮 CALCULADORA COMPUTOS PRO
// ==========================================================
function dibujarCalculadora() {
    window.carritoPresupuesto = [];
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-blue-600 p-6 text-white flex justify-between rounded-t-3xl border-b-4 border-blue-800"><h2 class="text-xl font-black italic">COMPUTOS PRO</h2><button onclick="window.location.hash='#menu'" class="bg-white text-blue-700 px-4 py-1 rounded-full text-xs font-bold">VOLVER</button></div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-5">
                <div><label class="text-[10px] text-zinc-500 font-bold uppercase ml-1">NOMBRE AMBIENTE:</label><input id="calc-nombre" type="text" placeholder="Ej: Dormitorio" class="w-full p-3 border-2 border-blue-400 rounded-xl font-black text-lg text-blue-900 uppercase"></div>
                <div class="p-4 bg-zinc-50 rounded-2xl border shadow-sm">
                    <select id="calc-tipo" onchange="window.cambiarTipoCalc(); window.calcularParcial();" class="w-full p-3 mb-3 border rounded-xl font-black text-zinc-700 uppercase text-xs outline-none"><option value="cuarto">CUARTO COMPLETO</option><option value="muro">MURO SIMPLE</option><option value="techo">TECHO</option></select>
                    <div class="grid grid-cols-3 gap-2"><div><label class="text-[9px] font-bold text-zinc-500">LARGO</label><input id="calc-largo" type="number" class="w-full p-2 border-2 rounded-xl text-center font-black" oninput="window.calcularParcial()"></div><div id="box-ancho"><label class="text-[9px] font-bold text-zinc-500">ANCHO</label><input id="calc-ancho" type="number" class="w-full p-2 border-2 rounded-xl text-center font-black" oninput="window.calcularParcial()"></div><div id="box-alto"><label class="text-[9px] font-bold text-zinc-500">ALTO</label><input id="calc-alto" type="number" class="w-full p-2 border-2 rounded-xl text-center font-black" oninput="window.calcularParcial()"></div></div>
                    <div id="box-cielo" class="mt-3 flex items-center justify-center gap-2 bg-zinc-200 p-2 rounded-xl" onclick="document.getElementById('calc-cielo').click()"><input type="checkbox" id="calc-cielo" checked onchange="window.calcularParcial()" class="w-5 h-5 pointer-events-none"><label class="text-xs font-black uppercase pointer-events-none">Incluir Cielo</label></div>
                </div>
                <div id="panel-techo" style="display:none;" class="p-4 bg-blue-50 rounded-2xl border border-blue-200"><label class="text-[9px] font-bold block mb-1">Inclinacion</label><select id="calc-caida" onchange="window.calcularParcial()" class="w-full p-2 mb-3 border rounded-lg font-bold text-xs"><option value="1">Losa Plana</option><option value="1.15">Teja Mod (+15%)</option><option value="1.30">Teja Fuerte (+30%)</option></select></div>
                <div id="panel-descuentos" class="p-4 bg-orange-50 rounded-2xl border border-orange-200"><h3 class="font-black text-orange-600 text-[10px] mb-3">DESCUENTOS</h3><div class="grid grid-cols-3 gap-2 mb-2"><div><label class="text-[8px] font-bold">PUERTAS (CANT)</label><input id="calc-p-cant" type="number" value="0" class="w-full p-2 border rounded-lg text-center font-bold" oninput="window.calcularParcial()"></div><div><label class="text-[8px] font-bold">ANCHO</label><input id="calc-p-ancho" type="number" value="0.9" class="w-full p-2 border rounded-lg text-center font-bold" oninput="window.calcularParcial()"></div><div><label class="text-[8px] font-bold">ALTO</label><input type="number" value="2" disabled class="w-full p-2 bg-orange-100 border rounded-lg text-center font-bold"></div></div><div class="grid grid-cols-3 gap-2"><div><label class="text-[8px] font-bold">VENTANAS (CANT)</label><input id="calc-v-cant" type="number" value="0" class="w-full p-2 border rounded-lg text-center font-bold" oninput="window.calcularParcial()"></div><div><label class="text-[8px] font-bold">ANCHO</label><input id="calc-v-ancho" type="number" value="0" class="w-full p-2 border rounded-lg text-center font-bold" oninput="window.calcularParcial()"></div><div><label class="text-[8px] font-bold">ALTO</label><input id="calc-v-alto" type="number" value="0" class="w-full p-2 border rounded-lg text-center font-bold" oninput="window.calcularParcial()"></div></div></div>
                <div class="p-4 bg-blue-50 rounded-2xl border border-blue-200"><h3 class="font-black text-blue-600 text-[10px] mb-2">MOLDURAS</h3><div class="flex items-center gap-2"><input id="calc-ml" type="number" value="0" class="w-1/2 p-3 border-2 rounded-xl font-black text-lg text-center" oninput="window.calcularParcial()"><span class="text-xs font-bold text-zinc-500">ml</span></div></div>
                <div class="p-4 bg-zinc-900 rounded-2xl text-white shadow-xl border-t-4 border-red-600"><h3 class="font-black text-[10px] mb-2">PRECIOS DIRECTOS (Bs)</h3><select id="calc-almacen-helper" onchange="window.cargarPrecioDeAlmacen(this.value)" class="w-full p-2 bg-zinc-800 rounded-lg text-xs outline-none mb-3"><option value="">-- APU Guardado --</option></select><div class="grid grid-cols-2 gap-3"><div><label class="text-[9px] text-zinc-400 font-bold block">x m2</label><input id="calc-precio-m2" type="number" value="0" class="w-full p-2 bg-black border border-zinc-700 rounded-lg text-center font-black text-lg" oninput="window.calcularParcial()"></div><div><label class="text-[9px] text-zinc-400 font-bold block">x ml</label><input id="calc-precio-ml" type="number" value="0" class="w-full p-2 bg-black border border-zinc-700 rounded-lg text-center font-black text-lg" oninput="window.calcularParcial()"></div></div></div>
                <div class="bg-zinc-100 p-4 rounded-2xl border-2 text-center mt-4"><div class="flex justify-between text-[11px] font-black uppercase text-zinc-600 mb-2"><span>Area: <span id="res-parcial-m2" class="text-blue-600">0</span> m2</span><span>Costo: Bs. <span id="res-parcial-total" class="text-red-600">0</span></span></div><button onclick="window.agregarAlCarrito()" class="w-full bg-blue-600 text-white font-black py-3 rounded-xl uppercase">AÑADIR A LISTA</button></div>
                <div id="contenedor-carrito" class="mt-8 pt-8 border-t-4 border-dashed" style="display:none;"><h3 class="font-black text-center mb-4">COSTO ACUMULADO</h3><div id="lista-carrito" class="space-y-3 mb-6"></div><div class="bg-green-600 text-white p-5 rounded-3xl text-center"><p class="text-[10px] font-bold mb-1">TOTAL DIRECTO</p><span class="text-4xl font-black">Bs. <span id="carrito-gran-total">0</span></span><button onclick="window.enviarCarritoWhatsApp()" class="mt-4 w-full bg-white text-green-700 font-black py-4 rounded-xl text-[12px]">ENVIAR A WHATSAPP</button></div></div>
            </div>
        </div>
    </div>`;
    firebase.database().ref(getDbPath('materiales')).once('value').then(snap => { const mS = document.getElementById('calc-almacen-helper'), m = snap.val() || {}; Object.keys(m).forEach(id => { mS.innerHTML += `<option value="${m[id].precio}">${m[id].nombre} - Bs. ${m[id].precio}</option>`; }); });
    setTimeout(window.calcularParcial, 100);
}
window.cargarPrecioDeAlmacen = (p) => { if(p){ document.getElementById('calc-precio-m2').value = p; window.calcularParcial(); } };
window.cambiarTipoCalc = () => { const t = document.getElementById('calc-tipo').value; document.getElementById('box-ancho').style.display = t==='muro'?'none':'block'; document.getElementById('box-alto').style.display = t==='techo'?'none':'block'; document.getElementById('box-cielo').style.display = t==='cuarto'?'flex':'none'; document.getElementById('panel-descuentos').style.display = t==='techo'?'none':'block'; document.getElementById('panel-techo').style.display = t==='techo'?'block':'none'; };
window.calcularParcial = () => { const t = document.getElementById('calc-tipo').value, L = parseFloat(document.getElementById('calc-largo').value)||0, A = parseFloat(document.getElementById('calc-ancho').value)||0, H = parseFloat(document.getElementById('calc-alto').value)||0; let perim=0, aN=0; if (t === 'techo') { aN = L * A * (parseFloat(document.getElementById('calc-caida').value)||1); } else { perim = t==='cuarto'?(L+A)*2:L; let aP = perim*H, aC = (t==='cuarto'&&document.getElementById('calc-cielo').checked)?(L*A):0, dP = (parseFloat(document.getElementById('calc-p-cant').value)||0)*(parseFloat(document.getElementById('calc-p-ancho').value)||0)*2, dV = (parseFloat(document.getElementById('calc-v-cant').value)||0)*(parseFloat(document.getElementById('calc-v-ancho').value)||0)*(parseFloat(document.getElementById('calc-v-alto').value)||0); aN = Math.max(0, aP+aC - dP - dV); } const mlI = document.getElementById('calc-ml'); if (document.activeElement !== mlI && (!mlI.value || mlI.value=="0") && t!=='techo' && perim>0) mlI.value = perim.toFixed(2); const mlR = parseFloat(mlI.value)||0, pM2 = parseFloat(document.getElementById('calc-precio-m2').value)||0, pMl = parseFloat(document.getElementById('calc-precio-ml').value)||0; window.tempM2 = aN.toFixed(2); window.tempMl = mlR.toFixed(2); window.tempTotal = ((aN*pM2)+(mlR*pMl)).toFixed(2); document.getElementById('res-parcial-m2').innerText = window.tempM2; document.getElementById('res-parcial-total').innerText = window.tempTotal; };
window.agregarAlCarrito = () => { let n = document.getElementById('calc-nombre').value.trim(); if (!n || parseFloat(window.tempTotal)===0) return; window.carritoPresupuesto.push({ nombre: n.toUpperCase(), m2: window.tempM2, total: window.tempTotal }); ['calc-nombre','calc-largo','calc-ancho','calc-alto','calc-ml'].forEach(i => {if(document.getElementById(i)) document.getElementById(i).value='';}); ['calc-p-cant','calc-v-cant'].forEach(i => document.getElementById(i).value='0'); window.calcularParcial(); window.renderCarrito(); };
window.renderCarrito = () => { const c = document.getElementById('contenedor-carrito'), l = document.getElementById('lista-carrito'); if(window.carritoPresupuesto.length===0) return c.style.display='none'; c.style.display='block'; l.innerHTML=''; let t=0; window.carritoPresupuesto.forEach((i, idx) => { t += parseFloat(i.total); l.innerHTML += `<div class="bg-zinc-900 p-4 rounded-xl text-white flex justify-between"><div><p class="font-black text-sm text-blue-300">${i.nombre}</p><p class="text-[10px] text-zinc-400">Area: ${i.m2}m2</p><p class="font-black text-white">CD: Bs. ${i.total}</p></div><button onclick="window.quitarDelCarrito(${idx})" class="text-red-500 font-black">BORRAR</button></div>`; }); document.getElementById('carrito-gran-total').innerText = t.toFixed(2); };
window.quitarDelCarrito = (idx) => { window.carritoPresupuesto.splice(idx, 1); window.renderCarrito(); };
window.enviarCarritoWhatsApp = () => { let t = `*PRESUPUESTO WRPUMA*\n\n`; let tt = 0; window.carritoPresupuesto.forEach(i => { t += `*${i.nombre}* - ${i.m2}m2 (Bs.${(parseFloat(i.total)*1.10*1.35).toFixed(2)})\n`; tt+=parseFloat(i.total); }); t += `\n*TOTAL VENTA: Bs. ${(tt*1.10*1.35).toFixed(2)}*`; window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(t)}`, '_blank'); };

// ==========================================================
// 📝 COTIZADOR PDF (CON LOGO Y FORMAL)
// ==========================================================
function dibujarCotizador() {
    appDiv.innerHTML = `
    <div class="min-h-screen p-2 text-black bg-zinc-200 pb-20">
        <div class="max-w-4xl mx-auto">
            <div class="bg-zinc-900 p-4 text-white flex justify-between rounded-2xl mb-4"><h2 class="text-sm font-black italic">GESTOR DE DOCUMENTOS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">VOLVER</button></div>
            <div class="grid grid-cols-3 gap-2 mb-2"><button onclick="window.setDocType('COTIZACION TECNICA')" class="bg-zinc-800 text-white font-bold py-2 rounded-xl text-[10px]">COTIZACION</button><button onclick="window.setDocType('RECIBO DE PAGO')" class="bg-green-600 text-white font-bold py-2 rounded-xl text-[10px]">RECIBO</button><button onclick="window.modoGarantia()" class="bg-yellow-600 text-white font-black py-2 rounded-xl text-[10px]">GARANTIA</button></div>
            <button onclick="window.arreglarFormato()" class="w-full bg-blue-600 text-white font-black py-3 rounded-xl mb-4 shadow-lg">🪄 1. ARREGLAR TABLAS (Texto a Cuadro)</button>
            <button onclick="window.generarPDF()" class="w-full bg-red-600 text-white font-black py-4 rounded-xl mb-4 shadow-xl">📥 2. GENERAR DOCUMENTO PDF</button>
            <div class="overflow-x-auto w-full pb-10">
                <div id="hoja-pdf" class="bg-white text-black shadow-2xl mx-auto p-10" style="width:210mm;min-height:295mm;box-sizing:border-box;font-family:Arial;">
                    <div style="border-bottom:4px solid #cc0000;padding-bottom:10px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;">
                        <div><img src="logo-blanco.jpg" style="max-height:90px; object-fit: contain;"></div>
                        <div style="text-align:right;"><p id="doc-title" contenteditable="true" style="margin:0;font-weight:900;font-size:18px;">COTIZACION TECNICA</p><p style="margin:0;font-size:14px;">Santa Cruz, ${new Date().toLocaleDateString()}</p></div>
                    </div>
                    <div id="zona-editable" contenteditable="true" style="outline:none;font-size:15px;line-height:1.6;min-height:200mm;"><p style="text-align:center;color:#999;">--- Pegue su cotización aquí ---</p></div>
                    <div style="margin-top:30px;border-top:2px solid #000;padding-top:15px;display:flex;justify-content:space-between;">
                        <div><b>WRPUMA - Ingenieria en Pintura e Impermeabilizaciones</b><br><span style="font-size:12px;">Cel.: 77396806, 76362867</span></div>
                        <div style="text-align:right;"><span style="font-size:12px;">wrpuma@gmail.com</span><br><i style="color:#cc0000;font-weight:bold;font-size:13px;">Dando el toque final a su construccion</i></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}
window.setDocType = (t) => { document.getElementById('doc-title').innerText = t; };
window.arreglarFormato = () => {
    const z = document.getElementById('zona-editable'); let t = z.innerText;
    if(t.includes('|')) {
        let h = '<table style="width:100%; border-collapse:collapse; margin:15px 0; font-size:13px;">';
        t.split('\n').forEach(l => { if(l.includes('|')) { h += '<tr style="border:1px solid #000;">'; l.split('|').forEach(c => h += `<td style="border:1px solid #000; padding:6px;">${c.trim()}</td>`); h += '</tr>'; } });
        z.innerHTML = h + '</table>';
    }
};
window.modoGarantia = () => { document.getElementById('doc-title').innerText = 'CERTIFICADO DE GARANTIA'; document.getElementById('zona-editable').innerHTML = `<p><b>PROYECTO:</b></p><p><b>CLIENTE:</b></p><p>Se garantiza la estanqueidad por 1 AÑO.</p>`; };
window.generarPDF = () => { const opt = { margin: 0.3, filename: 'Cotizacion.pdf', html2canvas: { scale: 2, useCORS: true }, jsPDF: { format: 'letter' } }; html2pdf().set(opt).from(document.getElementById('hoja-pdf')).save(); };

// ==========================================================
// 🚀 MENU MAESTRO Y ENRUTADOR
// ==========================================================
function dibujarMenu() {
    const rol = localStorage.getItem('rol_wr');
    if (!rol) { window.location.hash = ''; return; }
    const empresa = localStorage.getItem('empresa_wr') || 'Walter';
    const tituloMenu = empresa === 'Napoleon' ? 'NAPO<span class="text-blue-500">LEON</span>' : 'WR<span class="text-red-600">PUMA</span>';

    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-6 text-white text-center flex flex-col font-sans pb-10">
        <h1 class="text-5xl font-black italic mb-2">${tituloMenu}</h1>
        <p class="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.3em] mb-6">Elite Management ${rol === 'super' ? '- SUPERVISOR' : ''}</p>
        
        ${rol === 'admin' ? `
        <button id="btn-solicitudes" onclick="window.location.hash='#solicitudes'" class="hidden w-full mb-4 bg-orange-500 text-black py-3 rounded-2xl font-black text-xs uppercase shadow-[0_0_15px_rgba(249,115,22,0.5)]">⚠️ Pedidos de Material / Anticipo</button>
        <button onclick="window.cambiarMensaje()" class="w-full bg-blue-900 text-white py-3 rounded-2xl font-black text-[10px] mb-4 shadow-lg border border-blue-700">📢 CAMBIAR MENSAJE DEL DÍA</button>
        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left mb-4">
            <button onclick="window.location.hash='#asistencia'" class="bg-red-600 text-white aspect-square rounded-3xl font-black text-[12px] shadow-lg">ASISTENCIA</button>
            <button onclick="window.location.hash='#tratos'" class="bg-purple-600 text-white aspect-square rounded-3xl font-black text-[12px] shadow-lg">TRATOS</button>
            <button onclick="window.location.hash='#obras'" class="bg-zinc-900 text-white aspect-square rounded-3xl font-black text-[12px] border border-zinc-800">PROYECTOS</button>
            <button onclick="window.location.hash='#personal'" class="bg-zinc-100 text-black aspect-square rounded-3xl font-black text-[12px]">PERSONAL</button>
            <button onclick="window.location.hash='#almacen'" class="bg-orange-600 text-white aspect-square rounded-3xl font-black text-[12px] shadow-lg">APU</button>
            <button onclick="window.location.hash='#herramientas'" class="bg-yellow-600 text-white aspect-square rounded-3xl font-black text-[12px] shadow-lg">INVENTARIO</button>
            <button onclick="window.location.hash='#planilla'" class="col-span-2 bg-zinc-900 text-white py-4 rounded-2xl font-black text-[12px] border border-zinc-800">PAGOS Y SUELDOS</button>
            <button onclick="window.location.hash='#cotizaciones'" class="col-span-2 bg-white text-red-600 py-6 rounded-2xl font-black text-[12px] shadow-lg border-b-4 border-zinc-300">GENERAR PDF / WORD</button>
            <button onclick="window.location.hash='#calculadora'" class="col-span-2 bg-blue-600 text-white py-6 rounded-2xl font-black text-[12px] shadow-lg border-b-4 border-blue-800">CALCULADORA OPERATIVA</button>
            <button onclick="window.location.hash='#contabilidad'" class="col-span-1 bg-green-600 text-white py-4 rounded-2xl font-black text-[10px] shadow-lg">CONTROL GASTOS</button>
            <button onclick="window.location.hash='#utilidad'" class="col-span-1 bg-zinc-900 text-red-500 py-4 rounded-2xl font-black text-[10px] border border-zinc-800">REPORTE FINANZAS</button>
        </div>` : ``}
        
        ${rol === 'super' ? `
        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left mb-4">
            <button onclick="window.location.hash='#asistencia'" class="bg-red-600 text-white aspect-square rounded-3xl font-black text-[12px] shadow-lg">ASISTENCIA</button>
            <button onclick="window.location.hash='#herramientas'" class="bg-yellow-600 text-white aspect-square rounded-3xl font-black text-[12px] shadow-lg">AUDITORÍA INV.</button>
        </div>` : ``}
        
        <button onclick="window.cerrarSesionTotal()" class="text-zinc-700 text-[10px] font-bold mt-10">CERRAR SESIÓN</button>
    </div>`;

    if(rol === 'admin') {
        firebase.database().ref(getDbPath('solicitudes')).once('value').then(snap => {
            let hay = false; const sol = snap.val() || {}; Object.keys(sol).forEach(k => { if(sol[k].estado === 'Pendiente') hay = true; });
            if(hay && document.getElementById('btn-solicitudes')) document.getElementById('btn-solicitudes').classList.remove('hidden');
        });
    }
}

window.cerrarSesionTotal = () => { localStorage.clear(); location.reload(); };

function enrutador() {
    const urlParams = new URLSearchParams(window.location.search);
    const directUser = urlParams.get('user');

    if (directUser) {
        const usuarioActual = localStorage.getItem('u_wr');
        const nombreLimpio = directUser.toUpperCase().trim();
        
        if (usuarioActual !== nombreLimpio) {
            localStorage.setItem('empresa_wr', 'Walter');
            localStorage.setItem('u_wr', nombreLimpio);
            localStorage.setItem('a_wr', 'false');
            localStorage.setItem('rol_wr', 'trabajador');
        }
        window.location.hash = '#panel-trabajador';
    }

    const h = window.location.hash, rol = localStorage.getItem('rol_wr');
    if (!rol && h !== '') { window.location.hash = ''; return; }
    if (rol === 'trabajador' && h !== '#panel-trabajador') { window.location.hash = '#panel-trabajador'; return; }
    
    if (h === '#panel-trabajador') dibujarPanelTrabajador();
    else if (h === '#solicitudes') dibujarSolicitudes();
    else if (h === '#asistencia') dibujarAsistencia(); 
    else if (h === '#obras') dibujarObras();
    else if (h === '#personal') dibujarPersonal();
    else if (h === '#planilla') dibujarPlanilla();
    else if (h === '#historial-sueldos') window.verHistorialSueldos();
    else if (h === '#cotizaciones') dibujarCotizador();
    else if (h === '#calculadora') dibujarCalculadora();
    else if (h === '#tratos') dibujarTratos();
    else if (h === '#herramientas') dibujarHerramientas();
    else if (h === '#contabilidad') dibujarCaja();
    else if (h === '#utilidad') dibujarUtilidad();
    else if (h === '#almacen') dibujarAlmacen();
    else if (h === '#menu') dibujarMenu();
    else window.dibujarAcceso();
}

window.dibujarAcceso = () => {
    appDiv.innerHTML = `<div class="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center"><h1 class="text-6xl font-black text-white italic mb-10">WR<span class="text-red-600">PUMA</span></h1><div class="grid gap-4 w-full max-w-xs"><button onclick="window.verAccesoPro('walter')" class="bg-red-600 text-white py-4 rounded-2xl font-black text-lg">ACCESO GERENCIA</button><button onclick="window.verAccesoPro('napoleon')" class="bg-blue-600 text-white py-4 rounded-2xl font-black text-lg">ACCESO DIRECCION</button><button onclick="window.verAccesoPro('super')" class="bg-zinc-800 text-zinc-300 py-3 rounded-2xl font-black text-sm border border-zinc-700 mt-4">ACCESO SUPERVISOR</button><div class="border-t border-zinc-800 pt-4 mt-2"><button onclick="window.verAccesoPro('trabajador')" class="w-full bg-zinc-900 text-green-500 py-4 rounded-2xl font-black text-xs border border-zinc-800">ACCESO TRABAJADOR / ASISTENCIA</button></div></div></div>`;
};

window.cambiarMensaje = () => {
    const msg = prompt("Escriba el nuevo mensaje del día para el personal:");
    if (msg) {
        firebase.database().ref(getDbPath('config/mensaje_dia')).set(msg)
            .then(() => alert("Mensaje actualizado para todos."));
    }
};

window.addEventListener('hashchange', enrutador); window.addEventListener('load', enrutador); enrutador();
