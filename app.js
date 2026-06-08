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

window.verAccesoPro = (usuario) => {
    if (usuario === 'walter') {
        const pin = prompt("PIN DUEÑO WRPUMA:");
        if (pin === "2345") {
            localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', 'Walter'); localStorage.setItem('a_wr', 'true'); localStorage.setItem('rol_wr', 'admin'); window.location.hash = '#menu';
        } else { alert("PIN INCORRECTO"); }
    } else if (usuario === 'napoleon') {
        const pin = prompt("PIN NAPOLEON:");
        if (pin === "1111") {
            localStorage.setItem('empresa_wr', 'Napoleon'); localStorage.setItem('u_wr', 'Napoleon'); localStorage.setItem('a_wr', 'true'); localStorage.setItem('rol_wr', 'admin'); window.location.hash = '#menu';
        } else { alert("PIN INCORRECTO"); }
    } else if (usuario === 'super') {
        const pin = prompt("PIN SUPERVISOR (Ej. Chofer):");
        if (pin === "7777") { 
            localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', 'Supervisor'); localStorage.setItem('a_wr', 'false'); localStorage.setItem('rol_wr', 'super'); window.location.hash = '#menu';
        } else { alert("PIN INCORRECTO"); }
    } else if (usuario === 'trabajador') {
        const nom = prompt("INGRESE SU NOMBRE EXACTO:");
        if (nom) {
            localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', nom.toUpperCase()); localStorage.setItem('a_wr', 'false'); localStorage.setItem('rol_wr', 'trabajador'); window.location.hash = '#panel-trabajador';
        }
    }
};

// ==========================================================
// 📍 PANEL TRABAJADOR Y SOLICITUDES
// ==========================================================
function dibujarPanelTrabajador() {
    const n = localStorage.getItem('u_wr');
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-950 p-4 text-white font-sans flex flex-col justify-between pb-10">
        <div>
            <div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-black italic uppercase text-red-600">WRPUMA</h2><button onclick="window.cerrarSesionTotal()" class="bg-zinc-800 text-xs px-3 py-1 rounded-full font-bold">SALIR</button></div>
            <div class="bg-zinc-900 p-5 rounded-3xl shadow-xl text-center mb-6"><p class="text-[10px] text-zinc-500 font-bold uppercase mb-1">BIENVENIDO</p><h3 class="text-2xl font-black uppercase text-white">${n}</h3></div>
            <div class="bg-blue-900/30 p-5 rounded-3xl shadow-xl mb-6 text-center"><p class="text-[10px] text-blue-400 font-bold uppercase mb-2">📌 MENSAJE DEL DÍA</p><p id="msg-dia-display" class="text-sm font-bold text-white italic">Cargando instrucciones...</p></div>
            <div class="grid grid-cols-2 gap-4">
                <button onclick="window.marcarGPS()" class="col-span-2 bg-green-600 text-white py-6 rounded-3xl font-black text-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] border-b-4 border-green-800 flex flex-col items-center"><span>📍 MARCAR ASISTENCIA GPS</span><span class="text-[10px] font-bold mt-1 opacity-80 uppercase">Registrar Entrada/Salida</span></button>
                <button onclick="window.pedirMaterialTrabajador()" class="bg-zinc-800 text-white py-4 rounded-2xl font-black text-xs uppercase">Solicitar Material</button><button onclick="window.pedirAnticipoTrabajador()" class="bg-zinc-800 text-white py-4 rounded-2xl font-black text-xs uppercase">Pedir Anticipo</button>
            </div>
        </div>
        <p class="text-center text-[9px] text-zinc-600 font-bold mt-10">APP WRPUMA CONTROL</p>
    </div>`;
    firebase.database().ref(getDbPath('config/mensaje_dia')).on('value', snap => { document.getElementById('msg-dia-display').innerText = snap.val() || "Mantener el orden."; });
}
window.marcarGPS = () => {
    if (navigator.geolocation) {
        alert("📍 Obteniendo su ubicación...");
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude, lng = position.coords.longitude, n = localStorage.getItem('u_wr');
            firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).update({ nombre: n, obra: "POR ASIGNAR", gps_registro: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, hora_registro: new Date().toLocaleTimeString(), jornada_normal: 1 }).then(() => { alert(`✅ ASISTENCIA REGISTRADA.`); });
        }, () => { alert("❌ Active el GPS."); });
    } else { alert("❌ Navegador no soporta GPS."); }
};
window.pedirMaterialTrabajador = () => { const mat = prompt("Material:"); if(mat) { firebase.database().ref(getDbPath(`solicitudes/SOL_MAT_${Date.now()}`)).set({ tipo: 'MATERIAL', trabajador: localStorage.getItem('u_wr'), detalle: mat, fecha: new Date().toLocaleString(), estado: 'Pendiente' }).then(() => alert("✅ Enviado.")); } };
window.pedirAnticipoTrabajador = () => { const monto = prompt("Monto Bs:"); if(monto) { firebase.database().ref(getDbPath(`solicitudes/SOL_ANT_${Date.now()}`)).set({ tipo: 'ANTICIPO', trabajador: localStorage.getItem('u_wr'), detalle: `Monto: Bs. ${monto}`, fecha: new Date().toLocaleString(), estado: 'Pendiente' }).then(() => alert("✅ Enviado.")); } };

function dibujarSolicitudes() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black"><div class="max-w-md mx-auto"><div class="bg-orange-600 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg"><h2 class="text-xl font-black italic uppercase">SOLICITUDES</h2><button onclick="window.location.hash='#menu'" class="bg-white text-orange-700 px-4 py-1 rounded-full font-bold text-xs">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl"><div id="list-solicitudes" class="space-y-4">Cargando...</div></div></div></div>`;
    firebase.database().ref(getDbPath('solicitudes')).on('value', snap => {
        const c = document.getElementById('list-solicitudes'); if (!c) return; c.innerHTML = '';
        const sol = snap.val() || {}; let hay = false;
        Object.keys(sol).forEach(id => {
            const s = sol[id];
            if (s.estado === 'Pendiente') {
                hay = true; const color = s.tipo === 'MATERIAL' ? 'blue' : 'green';
                c.innerHTML += `<div class="p-4 bg-${color}-50 rounded-2xl border-2 border-${color}-200 shadow-sm relative"><div class="flex justify-between mb-2"><div><b class="text-sm uppercase">${s.trabajador}</b><br><span class="text-[9px] text-zinc-500">${s.fecha}</span></div><span class="text-[9px] bg-${color}-600 text-white px-2 py-1 rounded-lg">${s.tipo}</span></div><p class="text-sm font-bold bg-white p-2 border rounded-lg">${s.detalle}</p><button onclick="window.marcarSolicitudLeida('${id}')" class="w-full mt-2 bg-zinc-800 text-white text-[10px] font-black py-3 rounded-xl uppercase">Marcar Visto</button></div>`;
            }
        });
        if(!hay) c.innerHTML = `<p class="text-center text-zinc-500 text-xs font-bold py-10">No hay solicitudes.</p>`;
    });
}
window.marcarSolicitudLeida = (id) => { firebase.database().ref(getDbPath(`solicitudes/${id}`)).update({ estado: 'Atendido' }); };

// ==========================================================
// 📋 ASISTENCIA PRO (CON HORAS DE ATRASO)
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
                <div class="bg-zinc-100 p-2 rounded-xl"><label class="text-[9px] text-zinc-500 font-bold uppercase mb-1 block">DIA NORMAL:</label><select id="modal-j-normal" class="w-full p-2 border rounded-lg font-black text-xs outline-none"><option value="1">1 Dia</option><option value="0.5">0.5 Dias</option><option value="0">0 Dias</option></select></div>
                <div class="bg-blue-50 p-2 rounded-xl"><label class="text-[9px] text-blue-600 font-bold uppercase mb-1 block">TURNO EXTRA:</label><select id="modal-j-extra" class="w-full p-2 border rounded-lg font-black text-xs outline-none"><option value="0">0</option><option value="0.5">0.5</option><option value="1">1</option><option value="1.5">1.5</option></select></div>
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
    Object.keys(window.currentMarks).forEach(n => {
        const record = window.currentMarks[n];
        if(record.obra === "POR ASIGNAR") { c.innerHTML += `<div class="flex items-center justify-between p-3 bg-yellow-50 rounded-2xl border-2 border-yellow-400 mb-2"><div><b class="text-sm uppercase">${n}</b><br><span class="text-[10px] font-bold text-yellow-800">📍 GPS: ${record.hora_registro}</span></div><button onclick="window.markP('${n}', 'mover')" class="p-2 rounded-xl bg-yellow-400 text-[9px] font-black w-24">ASIGNAR AQUÍ</button></div>`; }
    });
    Object.keys(window.currentPersonal).forEach(n => {
        const record = window.currentMarks[n]; if(record && record.obra === "POR ASIGNAR") return;
        const estaEnObra = record && record.obra === obraSel, estaOtra = record && record.obra !== obraSel;
        let btn = '', bColor = 'border-zinc-200';
        if (estaEnObra) { bColor = 'border-green-500 bg-green-50'; btn = `<button onclick="window.abrirModalAsistencia('${n}', true)" class="p-2 rounded-xl bg-green-500 text-white w-24 font-black text-xs">REGISTRADO</button>`; } 
        else if (estaOtra) { bColor = 'border-orange-200'; btn = `<button onclick="window.markP('${n}', 'mover')" class="p-2 rounded-xl bg-orange-100 text-orange-700 text-[9px] font-black border border-orange-300 w-24">EN: ${record.obra}</button>`; } 
        else { btn = `<button onclick="window.abrirModalAsistencia('${n}', false)" class="p-3 rounded-xl bg-zinc-800 text-white font-black w-24 text-xs">ASISTENCIA</button>`; }
        
        let info = '';
        if (estaEnObra) {
            let iA = []; let jN = record.jornada_normal !== undefined ? record.jornada_normal : 1;
            if (jN > 0) iA.push(`N: ${jN}D`); if (record.jornada_extra > 0) iA.push(`E: ${record.jornada_extra}D`);
            if (record.horas_atraso > 0) iA.push(`Atraso: ${record.horas_atraso}h`); if (record.monto_anticipo > 0) iA.push(`Ant: Bs.${record.monto_anticipo}`);
            if (iA.length > 0) info = `<br><span class="text-[10px] text-green-700 font-bold">${iA.join(' | ')}</span>`;
        }
        c.innerHTML += `<div class="flex items-center justify-between p-3 bg-white rounded-2xl border-2 ${bColor} text-black uppercase transition-all shadow-sm"><div><b class="text-sm">${n}</b>${info}</div>${btn}</div>`;
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

// ==========================================================
// 🏗️ CONTROL DE OBRAS (COMPLETO)
// ==========================================================
function dibujarObras() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10"><div class="max-w-md mx-auto"><div class="bg-zinc-900 p-6 text-white flex justify-between items-center rounded-t-3xl"><h2 class="text-xl font-black italic uppercase">CONTROL DE OBRAS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl"><input id="o-nom" type="text" placeholder="NOMBRE DEL PROYECTO" class="w-full p-3 rounded-xl border-2 font-bold mb-2 uppercase"><input id="o-pre" type="number" placeholder="PRESUPUESTO TOTAL Bs." class="w-full p-3 rounded-xl border-2 font-bold mb-3"><button onclick="window.saveO()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-md">REGISTRAR PROYECTO</button><h3 class="mt-8 mb-4 font-black uppercase text-sm border-b-2 pb-2">PROYECTOS ACTIVOS</h3><div id="list-o-activas" class="space-y-4"></div><h3 class="mt-8 mb-4 font-black uppercase text-sm border-b-2 pb-2 text-zinc-400">PROYECTOS ENTREGADOS</h3><div id="list-o-entregadas" class="space-y-4 opacity-75"></div></div></div></div>`;
    data.obtenerTodo((db) => {
        const cA = document.getElementById('list-o-activas'), cE = document.getElementById('list-o-entregadas'); if (!cA || !cE) return; cA.innerHTML = ''; cE.innerHTML = ''; 
        const obs = db.obras || {}, fin = db.finanzas_obras || {};
        Object.keys(obs).forEach(id => {
            const o = obs[id]; let cob = 0, gas = 0;
            if (fin[id]) Object.values(fin[id]).forEach(m => { if (m.tipo === 'anticipo_cliente') cob += parseFloat(m.monto); else gas += parseFloat(m.monto); });
            const fRes = o.presupuesto * 0.05, gNeta = o.presupuesto - gas - fRes;
            const btnG = o.link_fotos ? `<div class="mb-3"><button onclick="window.open('${o.link_fotos}','_blank')" class="w-full bg-blue-600 text-white text-[10px] font-black py-2 rounded-lg">VER FOTOS</button></div>` : `<button onclick="window.agregarLinkObra('${id}')" class="w-full mb-3 bg-zinc-100 text-[10px] font-black py-2 rounded-lg">Vincular Galeria</button>`;
            const card = `<div class="p-4 bg-zinc-50 rounded-2xl border-2 ${o.estado !== 'Entregada' ? 'border-zinc-300' : 'border-green-500'} relative"><b class="text-xl uppercase text-red-600">${o.nombre}</b><div class="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase mb-2 mt-2"><div class="bg-white p-2 rounded-xl border">Contrato:<br>Bs. ${o.presupuesto}</div><div class="bg-white p-2 rounded-xl border">Cobrado:<br><span class="text-blue-600">Bs. ${cob}</span></div><div class="bg-zinc-900 text-white p-2 rounded-xl">Utilidad Neta:<br><span class="${gNeta >= 0 ? 'text-green-400' : 'text-red-500'}">Bs. ${gNeta.toFixed(1)}</span></div></div>${btnG}<div class="pt-2 flex flex-wrap gap-1 justify-between"><button onclick="window.cobrarAnticipo('${id}')" class="flex-1 bg-blue-100 text-blue-700 text-[9px] font-black p-2 rounded-lg">Cobrar Ant.</button><button onclick="window.cambiarEstadoO('${id}', '${o.estado === 'Entregada' ? 'Activa' : 'Entregada'}')" class="flex-1 text-[9px] font-black p-2 rounded-lg ${o.estado === 'Entregada' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}">Entregar</button><button onclick="window.editarNombreObra('${id}', '${o.nombre}')" class="flex-1 text-blue-600 text-[9px] font-black underline p-2">Editar</button><button onclick="window.delO('${id}')" class="flex-1 text-red-500 text-[9px] font-black underline p-2">Borrar</button></div></div>`;
            o.estado !== 'Entregada' ? cA.innerHTML += card : cE.innerHTML += card;
        });
    });
}
window.agregarLinkObra = (id) => { const l = prompt("Enlace fotos:"); if (l) firebase.database().ref(getDbPath(`obras/${id}`)).update({ link_fotos: l }).then(() => location.reload()); };
window.saveO = () => { const n = document.getElementById('o-nom').value.trim(), p = document.getElementById('o-pre').value; if (n && p) { firebase.database().ref(getDbPath('obras')).push({ nombre: n.toUpperCase(), presupuesto: p, estado: 'Activa' }).then(() => location.reload()); } else alert("Campos vacios"); };
window.delO = (id) => { if (confirm("¿Borrar?")) firebase.database().ref(getDbPath(`obras/${id}`)).remove().then(() => location.reload()); };
window.cambiarEstadoO = (id, e) => { firebase.database().ref(getDbPath(`obras/${id}`)).update({ estado: e }).then(() => location.reload()); };
window.cobrarAnticipo = (id) => { const m = prompt("Monto Cobrado (Bs.):"); if (m) data.registrarMovimiento(id, 'anticipo_cliente', m, "Anticipo").then(() => location.reload()); };
window.editarNombreObra = (id, old) => { const n = prompt("Nuevo nombre:", old); if (n && n.toUpperCase() !== old.toUpperCase()) firebase.database().ref(getDbPath(`obras/${id}`)).update({ nombre: n.toUpperCase() }).then(() => location.reload()); };

// ==========================================================
// 👷 EQUIPO DE TRABAJO (CON BOTÓN EDITAR)
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
// 💰 PLANILLAS DE PAGO Y SUELDOS (RESTAURADO)
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
                data.registrarMovimiento(idO, 'pago_sueldo', m, `Sueldo Semanal: ${n}`);
                firebase.database().ref(getDbPath(`pagos_historial/${n}_semana_${pFIni}`)).set({ fecha_pago: new Date().toISOString(), trabajador: n, monto: m, semana_ancla: pFIni, detalles: { sueldo_dia: sDia, dias_normales: dN, dias_extras: dE, anticipos: ant, horas_atraso: hA, descuento_atraso: desc, compensacion: comp } }).then(() => dibujarPlanilla());
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
// 📝 COTIZADOR PDF (ARREGLADO DEFINITIVO)
// ==========================================================
function dibujarCotizador() {
    appDiv.innerHTML = `
    <div class="min-h-screen p-2 text-black bg-zinc-200 pb-20">
        <div class="max-w-4xl mx-auto">
            <div class="bg-zinc-900 p-4 text-white flex justify-between rounded-2xl mb-4"><h2 class="text-sm font-black italic">GESTOR DE DOCUMENTOS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">VOLVER</button></div>
            <div class="grid grid-cols-3 gap-2 mb-2">
                <button onclick="window.setDocType('COTIZACION TECNICA')" class="bg-zinc-800 text-white font-bold py-2 rounded-xl text-[10px]">COTIZACION</button><button onclick="window.setDocType('RECIBO DE PAGO')" class="bg-green-600 text-white font-bold py-2 rounded-xl text-[10px]">RECIBO</button><button onclick="window.modoGarantia()" class="bg-yellow-600 text-white font-black py-2 rounded-xl text-[10px]">GARANTIA</button>
            </div>
            <button onclick="window.arreglarFormato()" class="w-full bg-blue-600 text-white font-black py-3 rounded-xl mb-4">🪄 1. ARREGLAR TABLAS (Texto a Cuadro)</button>
            <button onclick="window.generarPDF()" class="w-full bg-red-600 text-white font-black py-4 rounded-xl mb-4 shadow-xl">📥 2. GENERAR DOCUMENTO PDF</button>
            <div class="overflow-x-auto w-full pb-10">
                <div id="hoja-pdf" class="bg-white text-black shadow-2xl mx-auto p-10" style="width:210mm;min-height:295mm;box-sizing:border-box;font-family:Arial;">
                    <div style="border-bottom:4px solid #cc0000;padding-bottom:10px;margin-bottom:20px;display:flex;justify-content:space-between;">
                        <div style="background:#cc0000; color:#fff; font-weight:900; font-size:24px; padding:10px; border-radius:5px;">WRPUMA</div>
                        <div style="text-align:right;"><p id="doc-title" contenteditable="true" style="margin:0;font-weight:900;font-size:18px;">COTIZACION TECNICA</p><p style="margin:0;font-size:14px;">Santa Cruz, ${new Date().toLocaleDateString()}</p></div>
                    </div>
                    <div id="zona-editable" contenteditable="true" style="outline:none;font-size:15px;line-height:1.6;min-height:200mm;"><p style="text-align:center;color:#999;">--- Pegue su cotización aquí ---</p></div>
                    <div style="margin-top:30px;border-top:2px solid #000;padding-top:15px;display:flex;justify-content:space-between;">
                        <div><b>WRPUMA - Ingenieria en Pintura</b><br><span style="font-size:12px;">Cel.: 77396806, 76362867</span></div>
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
window.generarPDF = () => { const opt = { margin: 0.3, filename: 'Cotizacion.pdf', html2canvas: { scale: 2 }, jsPDF: { format: 'letter' } }; html2pdf().set(opt).from(document.getElementById('hoja-pdf')).save(); };

// ==========================================================
// 🚀 ENRUTADOR Y MENU PRINCIPAL
// ==========================================================
function dibujarMenu() {
    const rol = localStorage.getItem('rol_wr');
    if (!rol) { window.location.hash = ''; return; }
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-6 text-white text-center flex flex-col font-sans pb-10">
        <h1 class="text-5xl font-black italic mb-2 text-white">WR<span class="text-red-600">PUMA</span></h1><p class="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.3em] mb-6">Elite Management</p>
        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
            <button onclick="window.location.hash='#asistencia'" class="bg-red-600 text-white aspect-square rounded-3xl font-black text-[12px] shadow-lg">ASISTENCIA</button>
            <button onclick="window.location.hash='#obras'" class="bg-zinc-900 text-white aspect-square rounded-3xl font-black text-[12px] border border-zinc-800">PROYECTOS</button>
            <button onclick="window.location.hash='#personal'" class="bg-zinc-100 text-black aspect-square rounded-3xl font-black text-[12px]">PERSONAL</button>
            <button onclick="window.location.hash='#planilla'" class="bg-zinc-900 text-white aspect-square rounded-3xl font-black text-[12px] border border-zinc-800">PAGOS</button>
            <button onclick="window.location.hash='#cotizaciones'" class="col-span-2 bg-white text-red-600 h-20 rounded-2xl font-black text-[11px] shadow-lg">GENERAR PDF / WORD</button>
        </div>
        <button onclick="window.cerrarSesionTotal()" class="text-zinc-700 text-[10px] font-bold mt-10">CERRAR SESIÓN</button>
    </div>`;
}

function enrutador() {
    const h = window.location.hash, rol = localStorage.getItem('rol_wr');
    if (!rol && h !== '') { window.location.hash = ''; return; }
    if (h === '#panel-trabajador') dibujarPanelTrabajador();
    else if (h === '#solicitudes') dibujarSolicitudes();
    else if (h === '#asistencia') dibujarAsistencia(); 
    else if (h === '#obras') dibujarObras();
    else if (h === '#personal') dibujarPersonal();
    else if (h === '#planilla') dibujarPlanilla();
    else if (h === '#historial-sueldos') window.verHistorialSueldos();
    else if (h === '#cotizaciones') dibujarCotizador();
    else if (h === '#menu') dibujarMenu();
    else window.dibujarAcceso();
}

window.dibujarAcceso = () => {
    appDiv.innerHTML = `<div class="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center"><h1 class="text-6xl font-black text-white italic mb-10">WR<span class="text-red-600">PUMA</span></h1><div class="grid gap-4 w-full max-w-xs"><button onclick="window.verAccesoPro('walter')" class="bg-red-600 text-white py-4 rounded-2xl font-black text-lg">ACCESO GERENCIA</button><button onclick="window.verAccesoPro('trabajador')" class="bg-zinc-900 text-green-500 py-4 rounded-2xl font-black text-xs border border-zinc-800 mt-4">ACCESO TRABAJADOR</button></div></div>`;
};
window.cerrarSesionTotal = () => { localStorage.clear(); location.reload(); };

window.addEventListener('hashchange', enrutador); window.addEventListener('load', enrutador); enrutador();
