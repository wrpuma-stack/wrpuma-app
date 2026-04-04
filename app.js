import * as data from './data.js';

const appDiv = document.getElementById('app');
let obraSel = "GENERAL";
let fechaSel = new Date().toISOString().split('T')[0];
window.carritoPresupuesto = [];

const getDbPath = (path) => {
    const empresa = localStorage.getItem('empresa_wr') || 'Walter';
    return empresa === 'Walter' ? path : `cuentas/${empresa}/${path}`;
};

function obtenerLunes() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
}
let pFIni = obtenerLunes();
let pFFin = new Date().toISOString().split('T')[0];

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

// ==========================================================
// 🧮 CALCULADORA COMPUTOS PRO
// ==========================================================
function dibujarCalculadora() {
    window.carritoPresupuesto = [];
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-blue-600 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg border-b-4 border-blue-800">
                <h2 class="text-xl font-black italic uppercase">COMPUTOS PRO</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-blue-700 px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-5">
                <div class="mb-2">
                    <label class="text-[10px] text-zinc-500 font-bold uppercase ml-1">NOMBRE DEL AMBIENTE:</label>
                    <input id="calc-nombre" type="text" placeholder="Ej: Dormitorio, Sala, Techo" class="w-full p-3 border-2 border-blue-400 rounded-xl font-black text-lg text-blue-900 uppercase focus:outline-none focus:border-blue-600 shadow-inner bg-blue-50">
                </div>
                <div class="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-sm">
                    <select id="calc-tipo" onchange="window.cambiarTipoCalc(); window.calcularParcial();" class="w-full p-3 mb-3 border border-zinc-300 rounded-xl font-black text-zinc-700 uppercase text-xs outline-none">
                        <option value="cuarto">MODO: CUARTO COMPLETO</option>
                        <option value="muro">MODO: MURO SIMPLE / FACHADA</option>
                        <option value="techo">MODO: IMPERMEABILIZACION</option>
                    </select>
                    <div class="grid grid-cols-3 gap-2">
                        <div><label class="text-[9px] text-zinc-500 font-bold">LARGO (m)</label><input id="calc-largo" type="number" class="w-full p-2 border-2 border-zinc-300 rounded-xl font-black text-center text-lg" oninput="window.calcularParcial()"></div>
                        <div id="box-ancho"><label class="text-[9px] text-zinc-500 font-bold">ANCHO (m)</label><input id="calc-ancho" type="number" class="w-full p-2 border-2 border-zinc-300 rounded-xl font-black text-center text-lg" oninput="window.calcularParcial()"></div>
                        <div id="box-alto"><label class="text-[9px] text-zinc-500 font-bold">ALTO (m)</label><input id="calc-alto" type="number" class="w-full p-2 border-2 border-zinc-300 rounded-xl font-black text-center text-lg" oninput="window.calcularParcial()"></div>
                    </div>
                </div>
                
                <div class="p-4 bg-zinc-900 rounded-2xl text-white shadow-xl border-t-4 border-red-600">
                    <h3 class="font-black text-white uppercase text-[10px] mb-2">PRECIOS UNITARIOS DIRECTOS (Bs)</h3>
                    <div class="mb-3">
                        <label class="text-[9px] text-orange-400 font-bold uppercase mb-1 block">CONSULTAR ALMACÉN:</label>
                        <select id="calc-almacen-helper" onchange="window.cargarPrecioDeAlmacen(this.value)" class="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-bold text-xs outline-none">
                            <option value="">-- Seleccionar material guardado --</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[9px] text-zinc-400 font-bold uppercase">Costo Base x m2</label>
                            <input id="calc-precio-m2" type="number" value="0" class="w-full p-2 bg-black border border-zinc-700 rounded-lg text-white font-black text-lg text-center" oninput="window.calcularParcial()">
                        </div>
                    </div>
                </div>

                <div class="bg-zinc-100 p-4 rounded-2xl border-2 border-zinc-300 text-center mt-4"><div class="flex justify-between text-[11px] font-black uppercase text-zinc-600 mb-2"><span>Area: <span id="res-parcial-m2" class="text-blue-600">0</span> m2</span><span>Costo Directo: Bs. <span id="res-parcial-total" class="text-red-600">0</span></span></div><button onclick="window.agregarAlCarrito()" class="w-full bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg text-xs uppercase">AÑADIR A LA LISTA</button></div>
                <div id="contenedor-carrito" class="mt-8 pt-8 border-t-4 border-zinc-300 border-dashed" style="display:none;"><h3 class="font-black text-black uppercase text-sm mb-4 text-center">COSTO ACUMULADO</h3><div id="lista-carrito" class="space-y-3 mb-6"></div><div class="bg-green-600 text-white p-5 rounded-3xl text-center shadow-2xl border-4 border-green-400"><p class="text-[10px] font-bold uppercase mb-1">TOTAL COSTO DIRECTO</p><span class="text-4xl font-black">Bs. <span id="carrito-gran-total">0</span></span><button onclick="window.enviarCarritoWhatsApp()" class="mt-4 w-full bg-white text-green-700 font-black py-4 rounded-xl shadow-lg text-[12px] uppercase">ENVIAR AL WHATSAPP</button></div></div>
            </div>
        </div>
    </div>`;

    firebase.database().ref(getDbPath('materiales')).once('value').then(snap => {
        const matSelect = document.getElementById('calc-almacen-helper');
        const mats = snap.val() || {};
        Object.keys(mats).forEach(id => { matSelect.innerHTML += `<option value="${mats[id].precio}">${mats[id].nombre} (${mats[id].marca}) - Bs. ${mats[id].precio}</option>`; });
    });
    setTimeout(window.calcularParcial, 100);
}

window.cargarPrecioDeAlmacen = (precio) => { if (precio) { document.getElementById('calc-precio-m2').value = precio; window.calcularParcial(); } };

window.cambiarTipoCalc = () => {
    const tipo = document.getElementById('calc-tipo').value;
    const bAncho = document.getElementById('box-ancho'), bAlto = document.getElementById('box-alto');
    if (tipo === 'muro') { bAncho.style.display = 'none'; bAlto.style.display = 'block'; }
    else { bAncho.style.display = 'block'; bAlto.style.display = 'block'; }
};

window.calcularParcial = () => {
    const tipo = document.getElementById('calc-tipo').value;
    const L = parseFloat(document.getElementById('calc-largo').value) || 0, A = parseFloat(document.getElementById('calc-ancho').value) || 0, H = parseFloat(document.getElementById('calc-alto').value) || 0;
    let aN = tipo === 'techo' ? L * A : (tipo === 'cuarto' ? (L+A)*2*H : L*H);
    const pM2 = parseFloat(document.getElementById('calc-precio-m2').value) || 0;
    window.tempM2 = aN.toFixed(2); window.tempTotal = (aN * pM2).toFixed(2);
    document.getElementById('res-parcial-m2').innerText = window.tempM2; document.getElementById('res-parcial-total').innerText = window.tempTotal;
};

window.agregarAlCarrito = () => {
    let nom = document.getElementById('calc-nombre').value.trim();
    if (!nom || parseFloat(window.tempTotal) === 0) return alert("Ingrese nombre y medidas.");
    window.carritoPresupuesto.push({ nombre: nom.toUpperCase(), m2: window.tempM2, total: window.tempTotal });
    ['calc-nombre', 'calc-largo', 'calc-ancho', 'calc-alto'].forEach(i => document.getElementById(i).value = '');
    window.calcularParcial(); window.renderCarrito();
};

window.renderCarrito = () => {
    const c = document.getElementById('contenedor-carrito'), l = document.getElementById('lista-carrito');
    if (window.carritoPresupuesto.length === 0) return c.style.display = 'none';
    c.style.display = 'block'; l.innerHTML = ''; let t = 0;
    window.carritoPresupuesto.forEach((i, idx) => {
        t += parseFloat(i.total);
        l.innerHTML += `<div class="bg-zinc-900 p-4 rounded-xl text-white flex justify-between"><div><p class="font-black text-sm text-blue-300">${i.nombre}</p><p class="text-[10px] text-zinc-400">Area: ${i.m2}m2</p><p class="font-black">CD: Bs. ${i.total}</p></div><button onclick="window.quitarDelCarrito(${idx})" class="text-red-500 font-black">BORRAR</button></div>`;
    });
    document.getElementById('carrito-gran-total').innerText = t.toFixed(2);
};

window.quitarDelCarrito = (idx) => { window.carritoPresupuesto.splice(idx, 1); window.renderCarrito(); };

window.enviarCarritoWhatsApp = () => {
    let txt = `*PRESUPUESTO TÉCNICO - WRPUMA*\n\n`; let tt = 0;
    window.carritoPresupuesto.forEach(i => {
        let precioVentaItem = parseFloat(i.total) * 1.10 * 1.35;
        txt += `*AMBIENTE:* ${i.nombre}\n  - Área: ${i.m2} m²\n  - Inversión: Bs. ${precioVentaItem.toFixed(2)}\n\n`;
        tt += parseFloat(i.total);
    });
    let pVentaTotal = tt * 1.10 * 1.35;
    txt += `======================\n*INVERSIÓN TOTAL:* Bs. ${pVentaTotal.toFixed(2)}\n\n_Nota: Precios sujetos a verificación._`;
    alert(`🔒 CONTROL WRPUMA\nCosto Directo: Bs. ${tt.toFixed(2)}\nPrecio Venta: Bs. ${pVentaTotal.toFixed(2)}`);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`, '_blank');
};

// ==========================================================
// 📋 ASISTENCIA PRO
// ==========================================================
function dibujarAsistencia() {
    const adm = localStorage.getItem('a_wr') === 'true';
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto bg-white rounded-3xl shadow-xl border-t-8 border-red-600 overflow-hidden relative">
            <div class="p-6 bg-white flex justify-between items-center border-b">
                <div><h2 class="text-2xl font-black italic uppercase">ASISTENCIA</h2><input type="date" value="${fechaSel}" ${adm ? 'onchange="window.chF(this.value)"' : 'disabled'} class="mt-1 text-[12px] font-bold text-red-600 uppercase bg-red-50 p-1 px-2 rounded-lg border border-red-200 outline-none"></div>
                <button onclick="window.location.hash='#menu'" class="bg-zinc-100 p-2 rounded-xl text-xs font-bold text-black">VOLVER</button>
            </div>
            <div class="p-6">
                <div class="bg-zinc-900 p-4 rounded-2xl mb-4 text-white text-center"><select id="sel-o" onchange="window.chO(this.value)" class="w-full bg-transparent font-black text-lg uppercase outline-none text-red-500 text-center"></select></div>
                <div id="list-asist" class="space-y-3"></div>
            </div>
        </div>
    </div>
    <div id="modal-asistencia" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border-t-8 border-red-600">
            <h3 id="modal-nombre" class="text-2xl font-black uppercase text-red-600 mb-4 text-center">NOMBRE</h3>
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-zinc-100 p-2 rounded-xl border border-zinc-300">
                    <label class="text-[9px] text-zinc-500 font-bold uppercase mb-1 block">DIA NORMAL:</label>
                    <select id="modal-j-normal" class="w-full p-2 bg-white border border-zinc-300 rounded-lg font-black text-xs outline-none"><option value="1">1 Dia (L-V)</option><option value="0.5">0.5 Dias (Medio/Sab)</option><option value="0">0 Dias (Falta)</option></select>
                </div>
                <div class="bg-blue-50 p-2 rounded-xl border border-blue-200">
                    <label class="text-[9px] text-blue-600 font-bold uppercase mb-1 block">TURNO EXTRA:</label>
                    <select id="modal-j-extra" class="w-full p-2 bg-white border border-blue-300 rounded-lg font-black text-blue-700 text-xs outline-none"><option value="0">Sin Extra</option><option value="0.5">0.5 Dias</option><option value="1">1 Dia</option></select>
                </div>
            </div>
            <div class="mb-5 bg-red-50 p-3 rounded-xl border border-red-200">
                <label class="text-[10px] text-red-600 font-black uppercase mb-2 block text-center">ANTICIPOS (Bs):</label>
                <input id="modal-anticipo" type="number" class="w-full p-2 border-2 border-red-300 rounded-xl font-black text-center text-xl outline-none bg-white text-red-700">
                <div class="flex gap-1 justify-center mt-2"><button onclick="window.sumarAlAnticipo(10)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs">+10</button><button onclick="window.sumarAlAnticipo(50)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs">+50</button></div>
            </div>
            <div class="flex gap-2"><button onclick="document.getElementById('modal-asistencia').classList.add('hidden')" class="flex-1 bg-zinc-200 text-zinc-700 font-black py-3 rounded-xl text-xs">CANCELAR</button><button onclick="window.guardarAsistenciaModal()" class="flex-[2] bg-green-600 text-white font-black py-3 rounded-xl shadow-lg text-xs uppercase">GUARDAR</button></div>
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
window.sumarAlAnticipo = (m) => { const i = document.getElementById('modal-anticipo'); i.value = (parseFloat(i.value) || 0) + m; };

window.renderListaPintores = () => {
    const c = document.getElementById('list-asist'); if (!c) return; c.innerHTML = '';
    Object.keys(window.currentPersonal).forEach(n => {
        const record = window.currentMarks[n]; const enObra = record && record.obra === obraSel;
        c.innerHTML += `<div class="flex items-center justify-between p-3 bg-white rounded-2xl border-2 ${enObra ? 'border-green-500 bg-green-50' : 'border-zinc-200'} shadow-sm">
            <div><b class="text-sm uppercase">${n}</b>${enObra ? `<br><span class="text-[9px] text-green-700 font-bold uppercase">Anticipo: Bs.${record.monto_anticipo || 0}</span>` : ''}</div>
            <button onclick="window.abrirModalAsistencia('${n}', ${enObra})" class="p-3 rounded-xl ${enObra ? 'bg-green-500' : 'bg-zinc-800'} text-white font-black text-xs w-24 uppercase">${enObra ? 'EDITAR' : 'REGISTRAR'}</button>
        </div>`;
    });
};

window.abrirModalAsistencia = (n, existe) => {
    window.pintorActualModal = n; const record = window.currentMarks[n] || {};
    document.getElementById('modal-nombre').innerText = n;
    document.getElementById('modal-j-normal').value = record.jornada_normal || "1";
    document.getElementById('modal-j-extra').value = record.jornada_extra || "0";
    document.getElementById('modal-anticipo').value = record.monto_anticipo || "0";
    document.getElementById('modal-asistencia').classList.remove('hidden');
};

window.guardarAsistenciaModal = () => {
    const n = window.pintorActualModal;
    firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).set({
        nombre: n, obra: obraSel, jornada_normal: parseFloat(document.getElementById('modal-j-normal').value) || 0,
        jornada_extra: parseFloat(document.getElementById('modal-j-extra').value) || 0, monto_anticipo: parseFloat(document.getElementById('modal-anticipo').value) || 0
    });
    document.getElementById('modal-asistencia').classList.add('hidden');
};

// ==========================================================
// 🛒 ALMACÉN DE PRECIOS
// ==========================================================
function dibujarAlmacen() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-orange-600 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg">
                <h2 class="text-xl font-black italic uppercase">CATALOGO COSTOS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-orange-600 px-4 py-1 rounded-full font-bold text-xs">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-4">
                <input id="m-nom" type="text" placeholder="MATERIAL" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-sm">
                <input id="m-pre" type="number" placeholder="PRECIO Bs." class="w-full p-3 rounded-xl border-2 font-black text-center text-red-600">
                <button onclick="window.saveMat()" class="w-full bg-black text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">REGISTRAR EN ALMACEN</button>
                <div id="list-mat" class="space-y-3 pt-2"></div>
            </div>
        </div>
    </div>`;
    firebase.database().ref(getDbPath('materiales')).on('value', snap => {
        const c = document.getElementById('list-mat'); if (!c) return; c.innerHTML = ''; const mats = snap.val() || {};
        Object.keys(mats).forEach(id => {
            c.innerHTML += `<div class="p-3 bg-zinc-50 rounded-2xl border-2 border-zinc-200 flex justify-between items-center shadow-sm">
                <div><b class="text-sm uppercase">${mats[id].nombre}</b></div>
                <div class="text-right"><span class="text-lg font-black text-red-600">Bs. ${mats[id].precio}</span><br><button onclick="window.delMat('${id}')" class="text-[9px] text-red-400 font-bold underline">Borrar</button></div>
            </div>`;
        });
    });
}
window.saveMat = () => {
    const n = document.getElementById('m-nom').value.trim(), p = document.getElementById('m-pre').value;
    if (n && p) { firebase.database().ref(getDbPath(`materiales/MAT_${Date.now()}`)).set({ nombre: n, precio: parseFloat(p) }); document.getElementById('m-nom').value = ''; document.getElementById('m-pre').value = ''; }
};
window.delMat = (id) => { if (confirm("¿Borrar material?")) firebase.database().ref(getDbPath(`materiales/${id}`)).remove(); };

// ==========================================================
// 👷 PERSONAL (ADMIN)
// ==========================================================
function dibujarPersonal() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10"><div class="max-w-md mx-auto"><div class="bg-zinc-800 p-6 text-white flex justify-between items-center rounded-t-3xl"><h2 class="text-xl font-black italic uppercase">EQUIPO TRABAJO</h2><button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-4"><input id="p-nom" type="text" placeholder="NOMBRE" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-sm"><input id="p-sue" type="number" placeholder="SUELDO DIA Bs." class="w-full p-3 rounded-xl border-2 font-bold text-sm"><button onclick="window.saveP()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg">REGISTRAR PERSONAL</button><div id="list-p" class="space-y-3 pt-4 border-t"></div></div></div></div>`;
    data.obtenerPersonal(per => {
        const c = document.getElementById('list-p'); if (!c) return; c.innerHTML = '';
        Object.keys(per).forEach(n => { c.innerHTML += `<div class="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center border uppercase"><div><b>${n}</b><br><span class="text-[10px] text-zinc-500 font-bold">Bs. ${per[n].sueldo_dia}</span></div><button onclick="window.delP('${n}')" class="text-red-600 font-black p-2 bg-red-100 rounded-lg">ELIMINAR</button></div>`; });
    });
}
window.saveP = () => { const n = document.getElementById('p-nom').value.trim(), s = document.getElementById('p-sue').value; if (n && s) { data.guardarPintor(n, s); document.getElementById('p-nom').value = ''; document.getElementById('p-sue').value = ''; } };
window.delP = (n) => { if (confirm(`¿Eliminar a ${n}?`)) data.borrarPintor(n); };

// ==========================================================
// 🏗️ OBRAS
// ==========================================================
function dibujarObras() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10"><div class="max-w-md mx-auto"><div class="bg-zinc-900 p-6 text-white flex justify-between items-center rounded-t-3xl"><h2 class="text-xl font-black italic uppercase">CONTROL OBRAS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl"><input id="o-nom" type="text" placeholder="PROYECTO" class="w-full p-3 rounded-xl border-2 uppercase font-bold mb-2"><input id="o-pre" type="number" placeholder="CONTRATO Bs." class="w-full p-3 rounded-xl border-2 font-bold mb-3"><button onclick="window.saveO()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-md">REGISTRAR PROYECTO</button><h3 class="mt-8 mb-4 font-black uppercase text-sm border-b-2 pb-2">PROYECTOS ACTIVOS</h3><div id="list-o-activas" class="space-y-4"></div></div></div></div>`;
    data.obtenerTodo((db) => {
        const cA = document.getElementById('list-o-activas'); if (!cA) return; cA.innerHTML = '';
        const obs = db.obras || {}; const per = db.personal || {}; const hist = db.asistencia_semanal || {}; const fin = db.finanzas_obras || {};
        Object.keys(obs).forEach(id => {
            const o = obs[id]; let cobrado = 0; let gastadoMat = 0; let costoSueldos = 0;
            Object.values(hist).forEach(dia => { Object.values(dia).forEach(reg => { if (reg.obra.toUpperCase() === o.nombre.toUpperCase()) { costoSueldos += (parseFloat(per[reg.nombre]?.sueldo_dia) || 0) * ((parseFloat(reg.jornada_normal) || 1) + (parseFloat(reg.jornada_extra) || 0)); } }); });
            if (fin[id]) Object.values(fin[id]).forEach(m => { if (m.tipo === 'anticipo_cliente') cobrado += parseFloat(m.monto); else gastadoMat += parseFloat(m.monto); });
            const fRes = o.presupuesto * 0.05, gNeta = o.presupuesto - costoSueldos - gastadoMat - fRes;
            cA.innerHTML += `<div class="p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-300 relative">
                <b class="text-xl uppercase text-red-600">${o.nombre}</b>
                <div class="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase mt-2">
                    <div class="bg-white p-2 rounded-xl border">Contrato: Bs. ${o.presupuesto}</div>
                    <div class="bg-white p-2 rounded-xl border">Cobrado: Bs. ${cobrado}</div>
                    <div class="bg-zinc-900 text-white p-2 rounded-xl">Utilidad Neta: <span class="text-green-400">Bs. ${gNeta.toFixed(1)}</span></div>
                </div>
                <div class="pt-3 flex gap-1"><button onclick="window.cobrarAnticipo('${id}')" class="flex-1 bg-blue-100 text-blue-700 text-[9px] font-black py-2 rounded-lg">COBRAR ANTICIPO</button><button onclick="window.delO('${id}')" class="flex-1 bg-red-100 text-red-600 text-[9px] font-black py-2 rounded-lg uppercase">BORRAR</button></div>
            </div>`;
        });
    });
}
window.saveO = () => { const n = document.getElementById('o-nom').value, p = document.getElementById('o-pre').value; if (n && p) data.guardarObra(n, p).then(() => location.reload()); };
window.delO = (id) => { if (confirm("¿Borrar proyecto?")) data.borrarObra(id).then(() => location.reload()); };
window.cobrarAnticipo = (id) => { const m = prompt("Monto Anticipo:"); if (m) data.registrarMovimiento(id, 'anticipo_cliente', m, "Anticipo").then(() => location.reload()); };

// ==========================================================
// 💰 PLANILLA DE PAGOS (VERSION MEJORADA)
// ==========================================================
function dibujarPlanilla() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-4 text-white font-sans text-center">
        <div class="max-w-md mx-auto">
            <div class="flex justify-between mb-4"><h2 class="text-2xl font-black italic text-red-600">PLANILLA DE PAGOS</h2><button onclick="window.location.hash='#menu'" class="bg-zinc-800 px-4 rounded-full text-xs font-bold">VOLVER</button></div>
            <div class="bg-zinc-900 p-4 rounded-2xl mb-4 flex gap-2 text-[10px] font-bold">
                <div class="flex-1 text-left"><label class="text-zinc-500">Periodo Inicial</label><input type="date" value="${pFIni}" onchange="window.chPIni(this.value)" class="w-full bg-black p-2 rounded-lg"></div>
                <div class="flex-1 text-left"><label class="text-zinc-500">Periodo Final</label><input type="date" value="${pFFin}" onchange="window.chPFin(this.value)" class="w-full bg-black p-2 rounded-lg"></div>
            </div>
            <div id="c-p" class="space-y-4 text-left pb-10"></div>
        </div>
    </div>`;

    data.obtenerTodo((db) => {
        const c = document.getElementById('c-p'); if (!c) return;
        const per = db.personal || {}; const hist = db.asistencia_semanal || {}; const pagosRealizados = db.pagos_historial || {}; const res = {};

        Object.keys(hist).forEach(f => {
            if (f >= pFIni && f <= pFFin) {
                Object.values(hist[f]).forEach(reg => {
                    const idPagoRef = `${reg.nombre}_${pFIni}_${pFFin}`;
                    if (pagosRealizados[idPagoRef]) return;
                    if (!res[reg.nombre]) res[reg.nombre] = { dNorm: 0, dExt: 0, ant: 0, obraPrincipal: reg.obra };
                    res[reg.nombre].dNorm += parseFloat(reg.jornada_normal || 1);
                    res[reg.nombre].dExt += parseFloat(reg.jornada_extra || 0);
                    res[reg.nombre].ant += parseFloat(reg.monto_anticipo || 0);
                });
            }
        });

        c.innerHTML = ''; let tP = 0;
        Object.keys(res).forEach(n => {
            const d = res[n], sDia = parseFloat(per[n]?.sueldo_dia) || 0;
            const dominical = d.dNorm >= 5.5 ? 0.5 : 0;
            const saldo = (d.dNorm + dominical + d.dExt) * sDia - d.ant;
            tP += saldo;
            c.innerHTML += `
            <div class="bg-zinc-900 p-6 rounded-3xl border-l-4 border-red-600 shadow-xl">
                <div class="flex justify-between mb-2"><h3 class="font-black text-xl uppercase">${n}</h3><span class="bg-red-600 px-2 rounded-lg font-black text-[10px] py-1 text-center">PAGO PENDIENTE</span></div>
                <div class="text-[10px] text-zinc-400 mb-4">Salario: Bs.${sDia} | Deducciones: -Bs.${d.ant} | Jornadas: ${d.dNorm+dominical+d.dExt}D</div>
                <button onclick="window.ejecutarPagoEfectivo('${n}', ${saldo}, '${d.obraPrincipal}')" class="w-full bg-green-600 text-white py-4 rounded-xl font-black text-sm shadow-lg uppercase">MARCAR PAGADO: Bs. ${saldo.toFixed(2)}</button>
            </div>`;
        });
        if (tP > 0) c.innerHTML = `<div class="bg-green-600 p-4 rounded-2xl mb-4 text-center"><p class="text-[10px] font-black uppercase mb-1">Total Desembolso</p><span class="text-3xl font-black">Bs. ${tP.toFixed(2)}</span></div>` + c.innerHTML;
        else c.innerHTML = `<div class="text-center p-10 text-zinc-500 font-bold uppercase text-xs">No hay pagos pendientes.</div>`;
    });
}

window.ejecutarPagoEfectivo = (nombre, monto, obraNombre) => {
    if (confirm(`¿Transferencia de Bs. ${monto.toFixed(2)} a ${nombre} realizada?`)) {
        firebase.database().ref(getDbPath('obras')).once('value').then(snap => {
            const obras = snap.val() || {}; const idObra = Object.keys(obras).find(id => obras[id].nombre === obraNombre);
            if (idObra) {
                data.registrarMovimiento(idObra, 'pago_sueldo', monto, `Sueldo: ${nombre}`);
                const idPagoRef = `${nombre}_${pFIni}_${pFFin}`;
                firebase.database().ref(getDbPath(`pagos_historial/${idPagoRef}`)).set({ fecha: new Date().toISOString(), trabajador: nombre, monto: monto }).then(() => dibujarPlanilla());
            }
        });
    }
};

window.chPIni = (v) => { pFIni = v; dibujarPlanilla(); }; window.chPFin = (v) => { pFFin = v; dibujarPlanilla(); };

// ==========================================================
// 📝 GESTOR DOCUMENTOS
// ==========================================================
function dibujarCotizador() {
    appDiv.innerHTML = `
    <div class="min-h-screen p-2 bg-zinc-200">
        <div class="max-w-4xl mx-auto">
            <div class="bg-zinc-900 p-4 text-white flex justify-between rounded-2xl mb-4">
                <h2 class="text-sm font-black italic">GESTOR DOCUMENTOS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            <div class="grid grid-cols-2 gap-2 mb-2">
                <button onclick="window.setDocType('COTIZACION TECNICA')" class="bg-zinc-800 text-white font-bold py-3 rounded-xl text-xs uppercase">COTIZACION</button>
                <button onclick="window.setDocType('RECIBO DE PAGO')" class="bg-green-600 text-white font-bold py-3 rounded-xl text-xs uppercase">RECIBO</button>
            </div>
            <button onclick="window.modoGarantia()" class="w-full bg-yellow-600 text-white font-black py-3 rounded-xl text-xs uppercase mb-4 border-b-4 border-yellow-800">GARANTIA TECNICA</button>
            <button onclick="window.generarPDF()" class="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg mb-4">GENERAR PDF</button>
            <div class="overflow-x-auto w-full pb-10">
                <div id="hoja-pdf" class="bg-white text-black shadow-2xl mx-auto flex flex-col" style="width:210mm;min-height:295mm;box-sizing:border-box;padding:15mm 20mm;font-family:Arial;">
                    <div style="border-bottom:4px solid #cc0000;padding-bottom:10px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;">
                        <div><img src="logo-blanco.jpg" style="max-height:90px;"></div>
                        <div style="text-align:right;"><p id="doc-title" contenteditable="true" style="margin:0;font-weight:900;font-size:18px;">COTIZACION TECNICA</p><p style="margin:0;font-size:14px;">Santa Cruz, ${new Date().toLocaleDateString()}</p></div>
                    </div>
                    <div id="zona-editable" contenteditable="true" style="outline:none;font-size:15px;line-height:1.6;flex-grow:1;text-align:justify;"><p style="color:#999;text-align:center;margin-top:50px;">--- Ingrese descripcion ---</p></div>
                    <div style="margin-top:30px;border-top:2px solid #999;padding-top:15px;display:flex;justify-content:space-between;font-size:12px;">
                        <div><p><b>WRPUMA - Ingenieria en Pintura</b></p><p>Cel.: 77396806</p></div>
                        <div style="text-align:right;"><p>wrpuma@gmail.com</p><p>www.wrpuma.com</p></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

window.setDocType = (t) => { document.getElementById('doc-title').innerText = t; document.getElementById('zona-editable').innerHTML = '<p style="color:#999;text-align:center;margin-top:50px;">--- Ingrese descripcion ---</p>'; };

window.modoGarantia = () => {
    document.getElementById('doc-title').innerText = 'CERTIFICADO DE GARANTIA';
    document.getElementById('zona-editable').innerHTML = `
        <p><b>PROYECTO:</b> [Obra]</p><p><b>CLIENTE:</b> [Nombre]</p>
        <p style="margin-top:15px;">Por medio del presente, <b>WRPUMA</b> garantiza la impermeabilidad en la superficie tratada por <b>UN (1) AÑO</b>.</p>
        <p style="margin-top:10px;font-weight:bold;color:#cc0000;">CONDICIONES:</p>
        <ul><li>No perforar la capa impermeable.</li><li>Mantenimiento de desagües.</li></ul>
        <br><p style="text-align:center;">_______________________<br><b>Walter Puma</b><br>Gerente General</p>`;
};

window.generarPDF = () => { html2pdf().set({ margin: 0, filename: `Doc_${Date.now()}.pdf`, image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' } }).from(document.getElementById('hoja-pdf')).save(); };

// ==========================================================
// 🚀 MENU Y ENRUTADOR
// ==========================================================
function dibujarMenu() {
    const adm = localStorage.getItem('a_wr') === 'true';
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-6 text-white text-center flex flex-col justify-between font-sans">
        <div>
            <h1 class="text-5xl font-black italic mb-2 tracking-tighter uppercase">WR<span class="text-red-600">PUMA</span></h1>
            <p class="text-zinc-600 text-[9px] font-bold uppercase mb-8">Elite Management</p>
            <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto text-black">
                <button onclick="window.location.hash='#asistencia'" class="bg-red-600 text-white aspect-square rounded-3xl font-black text-xs uppercase italic">Asistencia</button>
                ${adm ? `
                <button onclick="window.location.hash='#planilla'" class="bg-zinc-900 text-white aspect-square rounded-3xl border border-zinc-800 font-black text-xs uppercase italic">Sueldos</button>
                <button onclick="window.location.hash='#obras'" class="bg-zinc-900 text-white aspect-square rounded-3xl border border-zinc-800 font-black text-xs uppercase italic">Proyectos</button>
                <button onclick="window.location.hash='#personal'" class="bg-zinc-100 aspect-square rounded-3xl font-black text-xs uppercase italic">Personal</button>
                <button onclick="window.location.hash='#almacen'" class="bg-orange-600 text-white aspect-square rounded-3xl font-black text-xs uppercase italic">Almacen</button>
                ` : ''}
                <button onclick="window.location.hash='#cotizaciones'" class="col-span-2 bg-white h-20 rounded-2xl font-black text-xs uppercase text-red-600">Documentos Word</button>
                <button onclick="window.location.hash='#calculadora'" class="col-span-2 bg-blue-600 text-white h-20 rounded-2xl font-black text-xs uppercase">Calculadora Operativa</button>
            </div>
        </div>
        <button onclick="localStorage.clear(); location.reload();" class="text-zinc-700 text-[10px] font-bold uppercase pt-4 border-t border-zinc-900 italic mt-8">FINALIZAR SESION</button>
    </div>`;
}

function enrutador() {
    const h = window.location.hash, u = localStorage.getItem('u_wr'); if (!u && h !== '') { window.location.hash = ''; return; }
    if (h === '#asistencia') dibujarAsistencia(); else if (h === '#cotizaciones') dibujarCotizador(); else if (h === '#calculadora') dibujarCalculadora();
    else if (h === '#menu') dibujarMenu(); else if (h === '#planilla') dibujarPlanilla(); else if (h === '#obras') dibujarObras();
    else if (h === '#personal') dibujarPersonal(); else if (h === '#almacen') dibujarAlmacen(); else dibujarAcceso();
}

function dibujarAcceso() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
        <h1 class="text-6xl font-black italic mb-12">WR<span class="text-red-600">PUMA</span></h1>
        <div class="grid gap-4 w-full max-w-xs text-black">
            <button onclick="window.verAccesoPro('walter')" class="bg-red-600 text-white py-4 rounded-2xl font-black text-lg border-2 border-red-800 uppercase">GERENCIA</button>
            <button onclick="window.verAccesoPro('super')" class="bg-zinc-800 text-zinc-300 py-3 rounded-2xl font-black text-sm border border-zinc-700 uppercase">SUPERVISOR</button>
        </div>
    </div>`;
}

window.addEventListener('hashchange', enrutador); window.addEventListener('load', enrutador); enrutador();
