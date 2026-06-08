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
            localStorage.setItem('empresa_wr', 'Walter');
            localStorage.setItem('u_wr', 'Walter'); localStorage.setItem('a_wr', 'true'); localStorage.setItem('rol_wr', 'admin');
            window.location.hash = '#menu';
        } else { alert("PIN INCORRECTO"); }
    } else if (usuario === 'napoleon') {
        const pin = prompt("PIN NAPOLEON:");
        if (pin === "1111") {
            localStorage.setItem('empresa_wr', 'Napoleon');
            localStorage.setItem('u_wr', 'Napoleon'); localStorage.setItem('a_wr', 'true'); localStorage.setItem('rol_wr', 'admin');
            window.location.hash = '#menu';
        } else { alert("PIN INCORRECTO"); }
    } else if (usuario === 'super') {
        const pin = prompt("PIN SUPERVISOR (Ej. Chofer):");
        if (pin === "7777") {
            localStorage.setItem('empresa_wr', 'Walter');
            localStorage.setItem('u_wr', 'Supervisor'); localStorage.setItem('a_wr', 'false'); localStorage.setItem('rol_wr', 'super');
            window.location.hash = '#menu';
        } else { alert("PIN INCORRECTO"); }
    } else if (usuario === 'trabajador') {
        const nom = prompt("INGRESE SU NOMBRE EXACTO (Como está registrado en el sistema):");
        if (nom) {
            localStorage.setItem('empresa_wr', 'Walter');
            localStorage.setItem('u_wr', nom.toUpperCase()); localStorage.setItem('a_wr', 'false'); localStorage.setItem('rol_wr', 'trabajador');
            window.location.hash = '#panel-trabajador';
        }
    }
};

// ==========================================================
// 📍 PANEL TRABAJADOR (ASISTENCIA REAL, MATERIALES Y ANTICIPOS)
// ==========================================================
function dibujarPanelTrabajador() {
    const n = localStorage.getItem('u_wr');
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-950 p-4 text-white font-sans flex flex-col justify-between pb-10">
        <div>
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-black italic uppercase text-red-600">WRPUMA</h2>
                <button onclick="window.cerrarSesionTotal()" class="bg-zinc-800 text-xs px-3 py-1 rounded-full font-bold">SALIR</button>
            </div>
            
            <div class="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 shadow-xl text-center mb-6">
                <p class="text-[10px] text-zinc-500 font-bold uppercase mb-1">BIENVENIDO</p>
                <h3 class="text-2xl font-black uppercase text-white">${n}</h3>
            </div>

            <div class="bg-blue-900/30 p-5 rounded-3xl border border-blue-800 shadow-xl mb-6 text-center">
                <p class="text-[10px] text-blue-400 font-bold uppercase mb-2">📌 MENSAJE DEL DÍA</p>
                <p id="msg-dia-display" class="text-sm font-bold text-white italic">Cargando instrucciones...</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <button onclick="window.marcarGPS()" class="col-span-2 bg-green-600 text-white py-6 rounded-3xl font-black text-xl active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.3)] border-b-4 border-green-800 flex flex-col items-center justify-center">
                    <span>📍 MARCAR ASISTENCIA GPS</span>
                    <span class="text-[10px] font-bold mt-1 opacity-80 uppercase">Registrar Entrada/Salida en Obra</span>
                </button>
                <button onclick="window.pedirMaterialTrabajador()" class="bg-zinc-800 text-white py-4 rounded-2xl font-black text-xs active:scale-95 shadow-md border border-zinc-700 uppercase">Solicitar Material</button>
                <button onclick="window.pedirAnticipoTrabajador()" class="bg-zinc-800 text-white py-4 rounded-2xl font-black text-xs active:scale-95 shadow-md border border-zinc-700 uppercase">Pedir Anticipo</button>
            </div>
        </div>
        <p class="text-center text-[9px] text-zinc-600 font-bold mt-10">APP WRPUMA CONTROL</p>
    </div>`;

    firebase.database().ref(getDbPath('config/mensaje_dia')).on('value', snap => {
        document.getElementById('msg-dia-display').innerText = snap.val() || "Mantener el orden y limpieza en la obra. Cuidar los materiales y herramientas.";
    });
}

window.marcarGPS = () => {
    if (navigator.geolocation) {
        alert("📍 Obteniendo su ubicación. Por favor, espere...");
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const n = localStorage.getItem('u_wr');
            
            firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).update({
                nombre: n,
                obra: "POR ASIGNAR",
                gps_registro: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                hora_registro: new Date().toLocaleTimeString(),
                jornada_normal: 1
            }).then(() => {
                alert(`✅ ASISTENCIA REGISTRADA EXITOSAMENTE.\nHora: ${new Date().toLocaleTimeString()}\nSu supervisor lo asignará a la obra correspondiente.`);
            });
        }, (error) => {
            alert("❌ Error: No se pudo obtener la ubicación. Debe activar el GPS en su celular para marcar asistencia.");
        });
    } else {
        alert("❌ Su navegador no soporta geolocalización.");
    }
};

window.pedirMaterialTrabajador = () => {
    const mat = prompt("¿Qué materiales o herramientas necesita en su obra?\n(Ej: 2 baldes de látex, 1 brocha de 4 pulg)");
    if(mat && mat.trim() !== "") {
        const n = localStorage.getItem('u_wr');
        firebase.database().ref(getDbPath(`solicitudes/SOL_MAT_${Date.now()}`)).set({
            tipo: 'MATERIAL', trabajador: n, detalle: mat, fecha: new Date().toLocaleString(), estado: 'Pendiente'
        }).then(() => alert("✅ Pedido de material enviado a Gerencia."));
    }
};

window.pedirAnticipoTrabajador = () => {
    const monto = prompt("¿De cuánto es el anticipo que solicita? (Bs.)");
    if(monto && !isNaN(monto) && monto > 0) {
        const motivo = prompt("Breve motivo de la solicitud:");
        const n = localStorage.getItem('u_wr');
        firebase.database().ref(getDbPath(`solicitudes/SOL_ANT_${Date.now()}`)).set({
            tipo: 'ANTICIPO', trabajador: n, detalle: `Monto: Bs. ${monto} | Motivo: ${motivo || 'Sin detalle'}`, fecha: new Date().toLocaleString(), estado: 'Pendiente'
        }).then(() => alert("✅ Solicitud de anticipo enviada a Gerencia."));
    }
};

// ==========================================================
// 🛎️ BANDEJA DE SOLICITUDES (GERENCIA)
// ==========================================================
function dibujarSolicitudes() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-orange-600 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg">
                <h2 class="text-xl font-black italic uppercase">SOLICITUDES</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-orange-700 px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl">
                <div id="list-solicitudes" class="space-y-4">Cargando...</div>
            </div>
        </div>
    </div>`;

    firebase.database().ref(getDbPath('solicitudes')).on('value', snap => {
        const c = document.getElementById('list-solicitudes'); if (!c) return; c.innerHTML = '';
        const sol = snap.val() || {};
        let hayPendientes = false;
        Object.keys(sol).forEach(id => {
            const s = sol[id];
            if (s.estado === 'Pendiente') {
                hayPendientes = true;
                const color = s.tipo === 'MATERIAL' ? 'blue' : 'green';
                c.innerHTML += `
                <div class="p-4 bg-${color}-50 rounded-2xl border-2 border-${color}-200 shadow-sm relative">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <b class="text-sm uppercase text-black font-black">${s.trabajador}</b><br>
                            <span class="text-[9px] text-zinc-500 font-bold uppercase">${s.fecha}</span>
                        </div>
                        <span class="text-[9px] bg-${color}-600 text-white px-2 py-1 rounded-lg font-bold uppercase">${s.tipo}</span>
                    </div>
                    <p class="text-sm font-bold text-zinc-800 my-2 bg-white p-2 border rounded-lg">${s.detalle}</p>
                    <button onclick="window.marcarSolicitudLeida('${id}')" class="w-full bg-zinc-800 text-white text-[10px] font-black py-3 rounded-xl active:scale-95 shadow-md uppercase">Marcar como Visto / Atendido</button>
                </div>`;
            }
        });
        if(!hayPendientes) c.innerHTML = `<p class="text-center text-zinc-500 text-xs font-bold uppercase py-10">No hay solicitudes pendientes.</p>`;
    });
}

window.marcarSolicitudLeida = (id) => {
    firebase.database().ref(getDbPath(`solicitudes/${id}`)).update({ estado: 'Atendido' });
};

// ==========================================================
// 🧮 CALCULADORA COMPUTOS PRO (SOLO GERENCIA)
// ==========================================================
function dibujarCalculadora() {
    window.carritoPresupuesto = [];
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-blue-600 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg border-b-4 border-blue-800">
                <h2 class="text-xl font-black italic uppercase text-white">COMPUTOS PRO</h2>
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
                    <div id="box-cielo" class="mt-3 flex items-center justify-center gap-2 bg-zinc-200 p-2 rounded-xl border border-zinc-300 cursor-pointer" onclick="document.getElementById('calc-cielo').click()">
                        <input type="checkbox" id="calc-cielo" checked onchange="window.calcularParcial()" class="w-5 h-5 pointer-events-none">
                        <label class="text-xs font-black text-black uppercase pointer-events-none">Incluir Cielo Raso</label>
                    </div>
                </div>
                <div id="panel-techo" style="display:none;" class="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <label class="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Inclinacion Techo</label>
                    <select id="calc-caida" onchange="window.calcularParcial()" class="w-full p-2 mb-3 border border-blue-300 rounded-lg font-bold text-xs"><option value="1">Losa Plana</option><option value="1.15">Teja Moderada (+15%)</option><option value="1.30">Teja Fuerte (+30%)</option></select>
                    <label class="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Sellado A/C</label>
                    <div class="flex items-center gap-2"><input id="calc-dados" type="number" value="0" class="w-1/3 p-2 border-2 border-blue-300 rounded-xl font-black text-center text-lg" oninput="window.calcularParcial()"><span class="text-[10px] font-bold text-zinc-500 uppercase">Dados</span></div>
                </div>
                <div id="panel-descuentos" class="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                    <h3 class="font-black text-orange-600 uppercase text-[10px] mb-3">DESCUENTOS</h3>
                    <div class="grid grid-cols-3 gap-2 mb-2"><div><label class="text-[8px] text-zinc-500 font-bold">PUERTAS</label><input id="calc-p-cant" type="number" value="0" class="w-full p-2 border border-orange-300 rounded-lg font-bold text-center" oninput="window.calcularParcial()"></div><div><label class="text-[8px] text-zinc-500 font-bold">ANCHO</label><input id="calc-p-ancho" type="number" value="0.9" class="w-full p-2 border border-orange-300 rounded-lg font-bold text-center" oninput="window.calcularParcial()"></div><div><label class="text-[8px] text-zinc-500 font-bold">ALTO</label><input type="number" value="2" disabled class="w-full p-2 bg-orange-100 border border-orange-300 rounded-lg font-bold text-center"></div></div>
                    <div class="grid grid-cols-3 gap-2"><div><label class="text-[8px] text-zinc-500 font-bold">VENTANAS</label><input id="calc-v-cant" type="number" value="0" class="w-full p-2 border border-orange-300 rounded-lg font-bold text-center" oninput="window.calcularParcial()"></div><div><label class="text-[8px] text-zinc-500 font-bold">ANCHO</label><input id="calc-v-ancho" type="number" value="0" class="w-full p-2 border border-orange-300 rounded-lg font-bold text-center" oninput="window.calcularParcial()"></div><div><label class="text-[8px] text-zinc-500 font-bold">ALTO</label><input id="calc-v-alto" type="number" value="0" class="w-full p-2 border border-orange-300 rounded-lg font-bold text-center" oninput="window.calcularParcial()"></div></div>
                </div>
                <div class="p-4 bg-blue-50 rounded-2xl border border-blue-200"><h3 class="font-black text-blue-600 uppercase text-[10px] mb-2">MOLDURAS / CANALETAS</h3><div class="flex items-center gap-2"><input id="calc-ml" type="number" value="0" class="w-1/2 p-3 border-2 border-blue-300 rounded-xl font-black text-lg text-center" oninput="window.calcularParcial()"><span class="text-xs font-bold text-zinc-500">Metros Lineales (ml)</span></div></div>
                
                <div class="p-4 bg-zinc-900 rounded-2xl text-white shadow-xl border-t-4 border-red-600">
                    <h3 class="font-black text-white uppercase text-[10px] mb-2">PRECIOS UNITARIOS DIRECTOS (Bs)</h3>
                    <div class="mb-3">
                        <label class="text-[9px] text-orange-400 font-bold uppercase mb-1 block">CONSULTAR CATÁLOGO DE APU:</label>
                        <select id="calc-almacen-helper" onchange="window.cargarPrecioDeAlmacen(this.value)" class="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-bold text-xs outline-none">
                            <option value="">-- Seleccionar APU guardado --</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[9px] text-zinc-400 font-bold uppercase">Costo Base x m2</label>
                            <input id="calc-precio-m2" type="number" value="0" class="w-full p-2 bg-black border border-zinc-700 rounded-lg text-white font-black text-lg text-center" oninput="window.calcularParcial()">
                        </div>
                        <div>
                            <label class="text-[9px] text-zinc-400 font-bold uppercase">Costo Base x ml</label>
                            <input id="calc-precio-ml" type="number" value="0" class="w-full p-2 bg-black border border-zinc-700 rounded-lg text-white font-black text-lg text-center" oninput="window.calcularParcial()">
                        </div>
                    </div>
                </div>
                <div class="bg-zinc-100 p-4 rounded-2xl border-2 border-zinc-300 text-center mt-4"><div class="flex justify-between text-[11px] font-black uppercase text-zinc-600 mb-2"><span>Area: <span id="res-parcial-m2" class="text-blue-600">0</span> m2</span><span>Costo Directo: Bs. <span id="res-parcial-total" class="text-red-600">0</span></span></div><button onclick="window.agregarAlCarrito()" class="w-full bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg active:scale-95 text-xs uppercase">AÑADIR A LA LISTA</button></div>
                <div id="contenedor-carrito" class="mt-8 pt-8 border-t-4 border-zinc-300 border-dashed" style="display:none;"><h3 class="font-black text-black uppercase text-sm mb-4 text-center">COSTO ACUMULADO DEL PROYECTO</h3><div id="lista-carrito" class="space-y-3 mb-6"></div><div class="bg-green-600 text-white p-5 rounded-3xl text-center shadow-2xl border-4 border-green-400"><p class="text-[10px] font-bold uppercase mb-1">TOTAL COSTO DIRECTO</p><span class="text-4xl font-black">Bs. <span id="carrito-gran-total">0</span></span><button onclick="window.enviarCarritoWhatsApp()" class="mt-4 w-full bg-white text-green-700 font-black py-4 rounded-xl shadow-lg text-[12px] uppercase">ENVIAR AL WHATSAPP</button></div></div>
            </div>
        </div>
    </div>`;

    firebase.database().ref(getDbPath('materiales')).once('value').then(snap => {
        const matSelect = document.getElementById('calc-almacen-helper');
        const mats = snap.val() || {};
        Object.keys(mats).forEach(id => {
            matSelect.innerHTML += `<option value="${mats[id].precio}">${mats[id].nombre} (${mats[id].marca}) - Bs. ${mats[id].precio}</option>`;
        });
    });
    setTimeout(window.calcularParcial, 100);
}

window.cargarPrecioDeAlmacen = (precio) => { if (precio) { document.getElementById('calc-precio-m2').value = precio; window.calcularParcial(); } };
window.cambiarTipoCalc = () => { const tipo = document.getElementById('calc-tipo').value; const bAncho = document.getElementById('box-ancho'), bAlto = document.getElementById('box-alto'), bCielo = document.getElementById('box-cielo'), pDesc = document.getElementById('panel-descuentos'), pTecho = document.getElementById('panel-techo'); if (tipo === 'techo') { bAncho.style.display = 'block'; bAlto.style.display = 'none'; bCielo.style.display = 'none'; pDesc.style.display = 'none'; pTecho.style.display = 'block'; } else if (tipo === 'muro') { bAncho.style.display = 'none'; bAlto.style.display = 'block'; bCielo.style.display = 'none'; pDesc.style.display = 'block'; pTecho.style.display = 'none'; } else { bAncho.style.display = 'block'; bAlto.style.display = 'block'; bCielo.style.display = 'flex'; pDesc.style.display = 'block'; pTecho.style.display = 'none'; } };
window.calcularParcial = () => { const tipo = document.getElementById('calc-tipo').value; const L = parseFloat(document.getElementById('calc-largo').value) || 0, A = parseFloat(document.getElementById('calc-ancho').value) || 0, H = parseFloat(document.getElementById('calc-alto').value) || 0; const pCielo = document.getElementById('calc-cielo').checked; let aP = 0, aC = 0, perim = 0, aB = 0, aN = 0, dP = 0, dV = 0; if (tipo === 'techo') { aB = L * A; aN = aB * (parseFloat(document.getElementById('calc-caida').value) || 1); } else { if (tipo === 'cuarto') { perim = (L + A) * 2; aP = perim * H; if (pCielo) aC = L * A; } else { perim = L; aP = L * H; } aB = aP + aC; dP = (parseFloat(document.getElementById('calc-p-cant').value) || 0) * (parseFloat(document.getElementById('calc-p-ancho').value) || 0) * 2; dV = (parseFloat(document.getElementById('calc-v-cant').value) || 0) * (parseFloat(document.getElementById('calc-v-ancho').value) || 0) * (parseFloat(document.getElementById('calc-v-alto').value) || 0); aN = Math.max(0, aB - dP - dV); } const mlI = document.getElementById('calc-ml'); if (document.activeElement !== mlI && (!mlI.value || mlI.value == "0") && tipo !== 'techo' && perim > 0) mlI.value = perim.toFixed(2); const mlR = parseFloat(mlI.value) || 0; const pM2 = parseFloat(document.getElementById('calc-precio-m2').value) || 0, pMl = parseFloat(document.getElementById('calc-precio-ml').value) || 0; window.tempM2 = aN.toFixed(2); window.tempTotal = ((aN * pM2) + (mlR * pMl)).toFixed(2); document.getElementById('res-parcial-m2').innerText = window.tempM2; document.getElementById('res-parcial-total').innerText = window.tempTotal; };
window.agregarAlCarrito = () => { let nom = document.getElementById('calc-nombre').value.trim(); if (!nom || parseFloat(window.tempTotal) === 0) return alert("Ingrese nombre y medidas/precios."); window.carritoPresupuesto.push({ nombre: nom.toUpperCase(), m2: window.tempM2, total: window.tempTotal }); ['calc-nombre', 'calc-largo', 'calc-ancho', 'calc-alto', 'calc-ml', 'calc-dados'].forEach(i => {if(document.getElementById(i)) document.getElementById(i).value = '';}); ['calc-p-cant', 'calc-v-cant'].forEach(i => document.getElementById(i).value = '0'); window.calcularParcial(); window.renderCarrito(); };
window.renderCarrito = () => { const c = document.getElementById('contenedor-carrito'), l = document.getElementById('lista-carrito'); if (window.carritoPresupuesto.length === 0) return c.style.display = 'none'; c.style.display = 'block'; l.innerHTML = ''; let t = 0; window.carritoPresupuesto.forEach((i, idx) => { t += parseFloat(i.total); l.innerHTML += `<div class="bg-zinc-900 p-4 rounded-xl text-white flex justify-between"><div><p class="font-black text-sm text-blue-300">${i.nombre}</p><p class="text-[10px] text-zinc-400">Area: ${i.m2}m2</p><p class="font-black text-white">CD: Bs. ${i.total}</p></div><button onclick="window.quitarDelCarrito(${idx})" class="text-red-500 font-black">BORRAR</button></div>`; }); document.getElementById('carrito-gran-total').innerText = t.toFixed(2); };
window.quitarDelCarrito = (idx) => { window.carritoPresupuesto.splice(idx, 1); window.renderCarrito(); };
window.enviarCarritoWhatsApp = () => { let txt = `*PRESUPUESTO TÉCNICO - WRPUMA*\n\n`; let tm = 0, tt = 0; window.carritoPresupuesto.forEach(i => { let precioVentaItem = parseFloat(i.total) * 1.10 * 1.35; txt += `*AMBIENTE:* ${i.nombre}\n  - Área de trabajo: ${i.m2} m²\n  - Inversión requerida: Bs. ${precioVentaItem.toFixed(2)}\n\n`; tm += parseFloat(i.m2); tt += parseFloat(i.total); }); let pVentaTotal = tt * 1.10 * 1.35; txt += `======================\n*ÁREA TOTAL:* ${tm.toFixed(2)} m²\n*INVERSIÓN TOTAL:* Bs. ${pVentaTotal.toFixed(2)}\n\n_Nota: Este resumen no sustituye la cotización formal._`; window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`, '_blank'); };

// ==========================================================
// 📋 ASISTENCIA PRO (CON BONOS Y HORAS)
// ==========================================================
function dibujarAsistencia() {
    const rol = localStorage.getItem('rol_wr');
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans text-left pb-10">
        <div class="max-w-md mx-auto bg-white rounded-3xl shadow-xl border-t-8 border-red-600 overflow-hidden relative">
            <div class="p-6 bg-white flex justify-between items-center border-b">
                <div>
                    <h2 class="text-2xl font-black italic uppercase">ASISTENCIA</h2>
                    <input type="date" value="${fechaSel}" ${rol === 'admin' ? 'onchange="window.chF(this.value)"' : 'disabled'} class="mt-1 text-[12px] font-bold text-red-600 uppercase bg-red-50 p-1 px-2 rounded-lg border border-red-200 outline-none shadow-sm">
                </div>
                <button onclick="window.location.hash='#menu'" class="bg-zinc-100 p-2 rounded-xl text-xs font-bold text-black">VOLVER</button>
            </div>
            <div class="p-6">
                <div class="bg-zinc-900 p-4 rounded-2xl mb-4 text-white text-center"><select id="sel-o" onchange="window.chO(this.value)" class="w-full bg-transparent font-black text-lg uppercase outline-none text-red-500 text-center"></select></div>
                <div id="list-asist" class="space-y-3"></div>
            </div>
        </div>
    </div>
    
    <div id="modal-asistencia" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 font-sans overflow-y-auto">
        <div class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border-t-8 border-red-600 my-8">
            <h3 id="modal-nombre" class="text-2xl font-black uppercase text-red-600 mb-4 text-center">NOMBRE</h3>
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-zinc-100 p-2 rounded-xl border border-zinc-300">
                    <label class="text-[9px] text-zinc-500 font-bold uppercase mb-1 block">DIA NORMAL:</label>
                    <select id="modal-j-normal" class="w-full p-2 bg-white border border-zinc-300 rounded-lg font-black text-black text-xs outline-none"><option value="1">1 Dia (L-V)</option><option value="0.5">0.5 Dias (Medio/Sab)</option><option value="0">0 Dias (Falta)</option></select>
                </div>
                <div class="bg-blue-50 p-2 rounded-xl border border-blue-200">
                    <label class="text-[9px] text-blue-600 font-bold uppercase mb-1 block">TURNO EXTRA:</label>
                    <select id="modal-j-extra" class="w-full p-2 bg-white border border-blue-300 rounded-lg font-black text-blue-700 text-xs outline-none"><option value="0">Sin Extra</option><option value="0.5">0.5 Dias (Hasta 10pm)</option><option value="1">1 Dia (Hasta 1am)</option><option value="1.5">1.5 Dias (Amanecida/Dom)</option></select>
                </div>
                
                <div class="bg-orange-50 p-2 rounded-xl border border-orange-200 col-span-2">
                    <label class="text-[9px] text-orange-700 font-bold uppercase mb-1 block text-center">Horas de Atraso / No Trabajadas hoy:</label>
                    <input id="modal-atraso-horas" type="number" value="0" step="0.5" min="0" max="8" class="w-full p-2 bg-white border border-orange-300 rounded-lg font-black text-center text-zinc-900 text-xs outline-none">
                </div>
            </div>
            
            ${rol === 'admin' ? `
            <div class="mb-4 bg-green-50 p-3 rounded-xl border border-green-300">
                <label class="text-[10px] text-green-700 font-black uppercase mb-1 block text-center">🌟 BONO PRODUCCIÓN / DESTAJO:</label>
                <div class="flex items-center justify-center gap-2"><span class="text-[10px] font-bold text-green-800">Monto Extra Bs.</span><input id="modal-bono" type="number" placeholder="0" class="w-24 p-2 border-2 border-green-400 rounded-xl font-black text-center text-lg outline-none bg-white text-green-800"></div>
            </div>

            <div class="mb-5 bg-red-50 p-3 rounded-xl border border-red-200">
                <label class="text-[10px] text-red-600 font-black uppercase mb-2 block text-center">ANTICIPOS DE HOY (Bs):</label>
                <div class="flex items-center justify-center gap-2 mb-2"><span class="text-[10px] font-bold text-red-800">Total Actual:</span><input id="modal-anticipo" type="number" placeholder="0" class="w-24 p-2 border-2 border-red-300 rounded-xl font-black text-center text-xl outline-none bg-white text-red-700"></div>
                <div class="flex gap-1 justify-center"><button type="button" onclick="window.sumarAlAnticipo(10)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs active:scale-95 shadow-sm">+ 10</button><button type="button" onclick="window.sumarAlAnticipo(20)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs active:scale-95 shadow-sm">+ 20</button><button type="button" onclick="window.sumarAlAnticipo(50)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs active:scale-95 shadow-sm">+ 50</button></div>
            </div>` : `<input type="hidden" id="modal-bono" value="0"><input type="hidden" id="modal-anticipo" value="0">`}

            <div class="flex gap-2 mt-2">
                <button onclick="document.getElementById('modal-asistencia').classList.add('hidden')" class="flex-1 bg-zinc-200 text-zinc-700 font-black py-3 rounded-xl active:scale-95 text-xs">CANCELAR</button>
                <button onclick="window.guardarAsistenciaModal()" class="flex-[2] bg-green-600 text-white font-black py-3 rounded-xl active:scale-95 shadow-lg text-xs uppercase">GUARDAR</button>
            </div>
        </div>
    </div>`;

    const sel = document.getElementById('sel-o');
    data.obtenerObras(obs => {
        sel.innerHTML = '<option value="GENERAL">GENERAL</option>';
        Object.keys(obs).forEach(id => { 
            if (obs[id].estado === 'Activa' || obs[id].estado === undefined) { 
                sel.innerHTML += `<option value="${obs[id].nombre}">${obs[id].nombre}</option>`; 
            } 
        });
        sel.value = obraSel;
    });

    firebase.database().ref(getDbPath('asistencia_semanal/' + fechaSel)).off('value');
    firebase.database().ref(getDbPath('asistencia_semanal/' + fechaSel)).on('value', snap => {
        window.currentMarks = snap.val() || {};
        data.obtenerPersonal(per => { window.currentPersonal = per || {}; window.renderListaPintores(); });
    });
}

window.chF = (nuevaFecha) => { fechaSel = nuevaFecha; dibujarAsistencia(); };
window.chO = (v) => { obraSel = v; window.renderListaPintores(); };

window.renderListaPintores = () => {
    const c = document.getElementById('list-asist'); if (!c) return; c.innerHTML = '';
    
    // Primero, mostrar a los que marcaron GPS desde su celular (aparecen con obra "POR ASIGNAR")
    Object.keys(window.currentMarks).forEach(n => {
        const record = window.currentMarks[n];
        if(record.obra === "POR ASIGNAR") {
            c.innerHTML += `
            <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-2xl border-2 border-yellow-400 shadow-sm mb-2">
                <div><b class="text-sm uppercase text-black">${n}</b><br><span class="text-[10px] text-yellow-800 font-bold uppercase">📍 GPS: ${record.hora_registro}</span></div>
                <button onclick="window.markP('${n}', 'mover')" class="p-2 rounded-xl bg-yellow-400 text-yellow-900 text-[9px] font-black active:scale-90 uppercase text-center w-24">ASIGNAR AQUÍ</button>
            </div>`;
        }
    });

    Object.keys(window.currentPersonal).forEach(n => {
        const record = window.currentMarks[n];
        if(record && record.obra === "POR ASIGNAR") return; // Ya lo mostramos arriba

        const estaEnEstaObra = record && record.obra === obraSel;
        const estaEnOtraObra = record && record.obra !== obraSel;
        let botonUI = ''; let estiloBorde = 'border-zinc-100';

        if (estaEnEstaObra) {
            estiloBorde = 'border-green-500 bg-green-50';
            botonUI = `<button onclick="window.abrirModalAsistencia('${n}', true)" class="p-2 rounded-xl bg-green-500 text-white active:scale-90 shadow-md flex flex-col items-center justify-center w-24"><span class="font-black text-sm">REGISTRADO</span><span class="text-[8px] uppercase mt-1">Editar</span></button>`;
        } else if (estaEnOtraObra) {
            estiloBorde = 'border-orange-200 opacity-80';
            botonUI = `<button onclick="window.markP('${n}', 'mover')" class="p-2 rounded-xl bg-orange-100 text-orange-700 text-[9px] font-black active:scale-90 uppercase text-center border border-orange-300 w-24">EN: ${record.obra} <br> TRAER</button>`;
        } else {
            estiloBorde = 'border-zinc-200';
            botonUI = `<button onclick="window.abrirModalAsistencia('${n}', false)" class="p-3 rounded-xl bg-zinc-800 text-white active:scale-90 font-black shadow-md w-24">ASISTENCIA</button>`;
        }

        let resumenInfo = '';
        if (estaEnEstaObra) {
            let infoArr = [];
            let jN = record.jornada_normal !== undefined ? record.jornada_normal : (record.jornada || 1);
            let jE = record.jornada_extra || 0;
            if (jN > 0) infoArr.push(`N: ${jN}D`);
            if (jE > 0) infoArr.push(`E: ${jE}D`);
            if (parseFloat(record.horas_atraso || 0) > 0) infoArr.push(`Atraso: ${record.horas_atraso}h`);
            
            // Los anticipos y bonos solo los ve Gerencia
            const rol = localStorage.getItem('rol_wr');
            if(rol === 'admin') {
                if (record.monto_anticipo > 0) infoArr.push(`Anticipo: Bs.${record.monto_anticipo}`);
                if (record.bono_produccion > 0) infoArr.push(`⭐ Bs.${record.bono_produccion}`);
            }

            if (infoArr.length > 0) resumenInfo = `<br><span class="text-[10px] text-green-700 font-bold uppercase">${infoArr.join(' | ')}</span>`;
        }

        c.innerHTML += `<div class="flex items-center justify-between p-3 bg-white rounded-2xl border-2 ${estiloBorde} text-black uppercase transition-all shadow-sm"><div><b class="text-sm">${n}</b>${resumenInfo}</div>${botonUI}</div>`;
    });
};

window.abrirModalAsistencia = (n, existe) => {
    window.pintorActualModal = n;
    const record = window.currentMarks[n] || {};
    document.getElementById('modal-nombre').innerText = n;
    document.getElementById('modal-j-normal').value = record.jornada_normal !== undefined ? record.jornada_normal : (record.jornada || "1");
    document.getElementById('modal-j-extra').value = record.jornada_extra || "0";
    document.getElementById('modal-atraso-horas').value = record.horas_atraso || "0";
    
    if(localStorage.getItem('rol_wr') === 'admin') {
        document.getElementById('modal-anticipo').value = record.monto_anticipo || "0";
        document.getElementById('modal-bono').value = record.bono_produccion || "0";
    }

    document.getElementById('modal-asistencia').classList.remove('hidden');
};

window.sumarAlAnticipo = (monto) => { const input = document.getElementById('modal-anticipo'); if(input) input.value = (parseFloat(input.value) || 0) + monto; };

window.guardarAsistenciaModal = () => {
    const n = window.pintorActualModal;
    const oldRecord = window.currentMarks[n] || {};
    const rol = localStorage.getItem('rol_wr');
    
    firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).update({
        nombre: n, obra: obraSel,
        jornada_normal: parseFloat(document.getElementById('modal-j-normal').value) || 0,
        jornada_extra: parseFloat(document.getElementById('modal-j-extra').value) || 0,
        horas_atraso: parseFloat(document.getElementById('modal-atraso-horas').value) || 0,
        monto_anticipo: rol === 'admin' ? (parseFloat(document.getElementById('modal-anticipo').value) || 0) : (oldRecord.monto_anticipo || 0),
        bono_produccion: rol === 'admin' ? (parseFloat(document.getElementById('modal-bono').value) || 0) : (oldRecord.bono_produccion || 0)
    });
    document.getElementById('modal-asistencia').classList.add('hidden');
};

window.markP = (n, accion) => { if (accion === 'mover' && confirm(`¿Trasladar a ${n} a la obra actual?`)) { firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).update({ obra: obraSel }); } };

// ==========================================================
// 🚀 MÓDULO: TRATOS (SUBCONTRATOS / DESTAJO) (SOLO GERENCIA)
// ==========================================================
function dibujarTratos() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10"><div class="max-w-md mx-auto"><div class="bg-purple-700 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg"><h2 class="text-xl font-black italic uppercase text-white">DESTAJOS / TRATOS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-purple-700 px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-4"><select id="t-obra" class="w-full p-3 rounded-xl border-2 font-bold text-sm uppercase outline-none"></select><input id="t-nom" type="text" placeholder="Contratista (Ej. Juan Membranero)" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black text-sm outline-none"><input id="t-esp" type="text" placeholder="Especialidad (Ej. Cemento Quemado)" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black text-sm outline-none"><input id="t-monto" type="number" placeholder="Monto Total del Trato (Bs.)" class="w-full p-3 rounded-xl border-2 font-black text-black text-lg text-center text-purple-700 outline-none"><button onclick="window.saveTrato()" class="w-full bg-black text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform uppercase">Registrar Nuevo Trato</button><div class="mt-6 mb-2 flex justify-between items-end border-b-2 border-zinc-200 pb-1"><h3 class="font-black text-zinc-500 uppercase text-xs">TRATOS ACTIVOS</h3></div><div id="list-tratos" class="space-y-4 pt-2"></div></div></div></div>`;
    data.obtenerObras(obs => {
        const s = document.getElementById('t-obra'); s.innerHTML = '<option value="">-- SELECCIONAR OBRA --</option>';
        Object.keys(obs).forEach(id => { if (obs[id].estado !== 'Entregada' && obs[id].estado !== 'Archivada') s.innerHTML += `<option value="${obs[id].nombre}">${obs[id].nombre}</option>`; });
    });
    firebase.database().ref(getDbPath('tratos')).on('value', snap => {
        const c = document.getElementById('list-tratos'); if (!c) return; c.innerHTML = ''; const tratos = snap.val() || {};
        Object.keys(tratos).forEach(id => {
            const t = tratos[id]; if (t.estado === 'Finalizado') return; 
            const saldo = t.monto_total - (t.pagado || 0);
            c.innerHTML += `<div class="p-4 bg-zinc-50 rounded-2xl border-2 border-purple-300 shadow-sm relative"><div class="flex justify-between items-start mb-2"><div><b class="text-sm uppercase text-black font-black">${t.contratista}</b><br><span class="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold uppercase">${t.especialidad}</span></div><span class="text-[9px] bg-zinc-800 text-white px-2 py-1 rounded-lg font-bold uppercase text-right">${t.obra}</span></div><div class="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase my-3 text-center"><div class="bg-white p-2 rounded-xl border border-zinc-200">Total:<br><span class="text-black font-black">Bs. ${t.monto_total}</span></div><div class="bg-white p-2 rounded-xl border border-zinc-200">Adelantos:<br><span class="text-red-500 font-black">Bs. ${t.pagado || 0}</span></div><div class="bg-purple-600 text-white p-2 rounded-xl">Saldo:<br><span class="text-white font-black text-sm">Bs. ${saldo}</span></div></div><div class="flex gap-2"><button onclick="window.pagarTrato('${id}', '${t.obra}', '${t.contratista}', ${saldo})" class="flex-[2] bg-green-500 text-white text-[10px] font-black py-3 rounded-xl active:scale-95 shadow-md uppercase">Dar Anticipo</button><button onclick="window.finTrato('${id}')" class="flex-1 bg-zinc-200 text-zinc-700 text-[10px] font-black py-3 rounded-xl active:scale-95 uppercase">Archivar</button></div></div>`;
        });
    });
}
window.saveTrato = () => { const o = document.getElementById('t-obra').value, n = document.getElementById('t-nom').value.trim(), e = document.getElementById('t-esp').value.trim(), m = parseFloat(document.getElementById('t-monto').value); if (o && n && m) { firebase.database().ref(getDbPath(`tratos/TRATO_${Date.now()}`)).set({ obra: o, contratista: n, especialidad: e || 'General', monto_total: m, pagado: 0, estado: 'Activo' }); document.getElementById('t-nom').value = ''; document.getElementById('t-esp').value = ''; document.getElementById('t-monto').value = ''; } else { alert("Complete Obra, Contratista y Monto."); } };
window.pagarTrato = (id, obraNombre, contratista, saldoPendiente) => { const m = prompt(`¿Cuánto vas a dar de anticipo a ${contratista}? (Saldo actual: Bs. ${saldoPendiente})`); const monto = parseFloat(m); if (monto && monto > 0 && monto <= saldoPendiente) { firebase.database().ref(getDbPath('obras')).once('value').then(snap => { const obras = snap.val() || {}, idObra = Object.keys(obras).find(k => obras[k].nombre === obraNombre); if (idObra) { data.registrarMovimiento(idObra, 'pago_trato', monto, `Avance Trato: ${contratista}`); firebase.database().ref(getDbPath(`tratos/${id}`)).once('value').then(tsnap => { firebase.database().ref(getDbPath(`tratos/${id}`)).update({ pagado: (tsnap.val().pagado || 0) + monto }); }); } }); } };
window.finTrato = (id) => { if(confirm("¿Archivar este trato? Ya no aparecerá en la lista activa.")) firebase.database().ref(getDbPath(`tratos/${id}`)).update({ estado: 'Finalizado' }); };

// ==========================================================
// 💰 PLANILLA DE PAGOS Y SUELDOS
// ==========================================================
function dibujarPlanilla() {
    appDiv.innerHTML = `<div class="min-h-screen bg-black p-4 text-white font-sans text-center"><div class="max-w-md mx-auto"><div class="flex justify-between mb-4"><h2 class="text-2xl font-black italic text-red-600">SUELDOS JORNALEROS</h2><button onclick="window.location.hash='#menu'" class="bg-zinc-800 px-4 rounded-full text-xs font-bold">VOLVER</button></div><div class="bg-zinc-900 p-4 rounded-2xl mb-4 flex gap-2 text-[10px] font-bold border border-zinc-800"><div class="flex-1 text-left"><label class="text-zinc-500 uppercase">Lunes (Inicio Sem.)</label><input type="date" value="${pFIni}" onchange="window.chPIni(this.value)" class="w-full bg-black p-2 rounded-lg text-white outline-none"></div><div class="flex-1 text-left"><label class="text-zinc-500 uppercase">Corte (Final Sem.)</label><input type="date" value="${pFFin}" onchange="window.chPFin(this.value)" class="w-full bg-black p-2 rounded-lg text-white outline-none"></div></div><div id="c-p" class="space-y-6 text-left pb-10"></div></div></div>`;
    data.obtenerTodo((db) => {
        const c = document.getElementById('c-p'); if (!c) return;
        const per = db.personal || {}, hist = db.asistencia_semanal || {}, pagosRealizados = db.pagos_historial || {}, res = {};
        
        Object.keys(hist).forEach(f => {
            if (f >= pFIni && f <= pFFin) {
                Object.values(hist[f]).forEach(reg => {
                    const idPagoReferencia = `${reg.nombre}_semana_${pFIni}`;
                    if (pagosRealizados[idPagoReferencia]) return; // Oculta si ya fue pagado
                    if (!res[reg.nombre]) res[reg.nombre] = { dNorm: 0, dExt: 0, ant: 0, horasAtraso: 0, bonos: 0, obraPrincipal: reg.obra };
                    res[reg.nombre].dNorm += parseFloat(reg.jornada_normal !== undefined ? reg.jornada_normal : (reg.jornada || 1));
                    res[reg.nombre].dExt += parseFloat(reg.jornada_extra || 0);
                    res[reg.nombre].ant += parseFloat(reg.monto_anticipo) || 0;
                    res[reg.nombre].horasAtraso += parseFloat(reg.horas_atraso || 0);
                    res[reg.nombre].bonos += parseFloat(reg.bono_produccion || 0);
                });
            }
        });

        let htmlPendientes = ''; let tP = 0; const listaPendientes = Object.keys(res);
        listaPendientes.forEach(n => {
            const d = res[n], sDia = parseFloat(per[n]?.sueldo_dia) || 0;
            const compensacion = d.dNorm >= 5.5 ? 0.5 : 0;
            const dNormPagar = d.dNorm + compensacion;
            const sTotBruto = (dNormPagar + d.dExt) * sDia;
            const descAtraso = d.horasAtraso * (sDia / 8);
            const saldo = sTotBruto - d.ant - descAtraso + d.bonos;
            tP += saldo;
            htmlPendientes += `<div class="bg-zinc-900 p-5 rounded-3xl border-l-8 border-red-600 shadow-2xl relative"><div class="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3"><h3 class="font-black text-xl uppercase tracking-tight text-white">${n}</h3><span class="bg-red-600 text-white px-3 rounded-lg font-black text-sm py-1 text-center shadow-inner leading-tight">${(dNormPagar + d.dExt).toFixed(1)} D<br><span class="text-[8px] text-red-200">A PAGAR</span></span></div><div class="grid grid-cols-2 gap-3 mb-5"><div class="bg-black p-3 rounded-2xl border border-zinc-800 flex flex-col justify-center"><span class="text-[9px] text-zinc-500 uppercase font-bold">Salario Base</span><span class="text-white font-black text-lg">Bs. ${sDia}</span></div><div class="bg-black p-3 rounded-2xl border border-zinc-800 flex flex-col justify-center"><span class="text-[9px] text-red-500 uppercase font-bold">Anticipos Sem.</span><span class="text-red-400 font-black text-lg">-Bs. ${d.ant}</span></div><div class="bg-black p-3 rounded-2xl border border-zinc-800 flex flex-col justify-center"><span class="text-[9px] text-zinc-500 uppercase font-bold">Días (N + Extra)</span><span class="text-white font-black text-lg">${d.dNorm} <span class="text-xs text-zinc-500">+ ${d.dExt}</span></span></div><div class="bg-black p-3 rounded-2xl border border-zinc-800 flex flex-col justify-center"><span class="text-[9px] text-blue-400 uppercase font-bold">Compensación Sábado</span>${compensacion > 0 ? `<span class="text-green-400 font-black text-sm">+0.5 D (Ahorro)</span>` : `<span class="text-red-500 font-bold text-xs">Pierde Sáb. Tarde</span>`}</div>${d.bonos > 0 ? `<div class="bg-green-900/40 p-3 rounded-2xl border border-green-800 flex flex-col justify-center col-span-2"><span class="text-[9px] text-green-400 uppercase font-bold">🌟 Bonos por Producción Extra:</span><span class="text-green-500 font-black text-sm">+Bs. ${d.bonos.toFixed(1)}</span></div>` : ''}</div><button onclick="window.ejecutarPagoEfectivo('${n}', ${saldo}, '${d.obraPrincipal}', ${sDia}, ${d.dNorm}, ${d.dExt}, ${d.ant}, ${d.horasAtraso}, ${descAtraso}, ${compensacion}, ${d.bonos})" class="w-full bg-green-500 text-white py-5 rounded-2xl font-black text-xl active:scale-95 transition-all uppercase flex items-center justify-center border-b-4 border-green-700">PAGAR: Bs. ${saldo.toFixed(2)}</button></div>`;
        });

        if (tP > 0) { htmlPendientes = `<div class="bg-green-600 p-5 rounded-3xl mb-6 text-center shadow-2xl border-b-4 border-green-800"><p class="text-[10px] font-black mb-1 uppercase text-green-200">Total a Desembolsar</p><span class="text-4xl font-black">Bs. ${tP.toFixed(2)}</span></div>` + htmlPendientes; }
        else if (htmlPendientes === '') { htmlPendientes = `<div class="text-center p-10 text-zinc-500 font-bold uppercase text-xs border-2 border-dashed border-zinc-800 rounded-3xl mt-10">No hay sueldos pendientes esta semana.</div>`; }

        // MOSTRAR PAGOS REALIZADOS HISTÓRICOS DE LA SEMANA ACTUAL
        let htmlPagados = '';
        Object.keys(pagosRealizados).forEach(k => {
            const pago = pagosRealizados[k];
            if (pago.semana_ancla === pFIni) {
                htmlPagados += `
                <div class="bg-zinc-800 p-4 rounded-2xl border-l-4 border-green-500 flex justify-between items-center mt-2 shadow-md">
                    <div><b class="text-sm uppercase text-white">${pago.trabajador}</b><br><span class="text-[9px] text-zinc-400 font-bold">Fecha: ${new Date(pago.fecha_pago).toLocaleString()}</span></div>
                    <span class="text-green-400 font-black text-lg">Bs. ${pago.monto.toFixed(2)}</span>
                </div>`;
            }
        });
        if (htmlPagados !== '') { htmlPagados = `<h3 class="mt-8 mb-3 font-black text-green-500 uppercase text-xs border-b border-zinc-800 pb-2">PAGOS REALIZADOS ESTA SEMANA</h3>` + htmlPagados; }

        c.innerHTML = htmlPendientes + htmlPagados;
    });
}
window.ejecutarPagoEfectivo = (nombre, monto, obraNombre, sDia, dNorm, dExt, ant, horasAtraso, descAtraso, compensacion, bonos) => { if (confirm(`¿Transferencia de Bs. ${monto.toFixed(2)} a ${nombre} completada?`)) { firebase.database().ref(getDbPath('obras')).once('value').then(snap => { const obras = snap.val() || {}; const idObra = Object.keys(obras).find(id => obras[id].nombre === obraNombre); if (idObra) { data.registrarMovimiento(idObra, 'pago_sueldo', monto, `Sueldo Semanal: ${nombre}`); firebase.database().ref(getDbPath(`pagos_historial/${nombre}_semana_${pFIni}`)).set({ fecha_pago: new Date().toISOString(), trabajador: nombre, monto: monto, semana_ancla: pFIni, detalles: { sueldo_dia: sDia, dias_normales: dNorm, dias_extras: dExt, anticipos: ant, horas_atraso: horasAtraso, descuento_atraso: descAtraso, compensacion: compensacion, bonos_extra: bonos } }).then(() => { alert(`Pago registrado.`); dibujarPlanilla(); }); } }); } };
window.chPIni = (v) => { pFIni = v; dibujarPlanilla(); }; window.chPFin = (v) => { pFFin = v; dibujarPlanilla(); };

// ==========================================================
// 🛠️ CONTROL DE HERRAMIENTAS (INVENTARIO)
// ==========================================================
function dibujarHerramientas() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10"><div class="max-w-md mx-auto"><div class="bg-yellow-600 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg"><h2 class="text-xl font-black italic uppercase">INVENTARIO</h2><button onclick="window.location.hash='#menu'" class="bg-white text-yellow-700 px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-4"><div class="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 mb-4"><h3 class="text-[10px] font-black text-yellow-800 uppercase mb-3 text-center">NUEVA HERRAMIENTA O EQUIPO</h3><input id="h-nom" type="text" placeholder="Herramienta (Ej. Lijadora Jirafa)" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black text-sm mb-2 outline-none"><input id="h-marca" type="text" placeholder="Marca / Serie" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black text-sm mb-3 outline-none"><button onclick="window.saveHerr()" class="w-full bg-black text-white font-black py-4 rounded-xl active:scale-95 shadow-lg uppercase text-sm">Registrar en Bodega</button></div><h3 class="mt-6 mb-2 font-black text-yellow-700 uppercase text-xs border-b-2 border-yellow-200 pb-1">ESTADO DE HERRAMIENTAS</h3><div id="list-herr" class="space-y-4 pt-2"></div></div></div></div>`;
    data.obtenerTodo((db) => {
        const h = db.herramientas || {}; const p = db.personal || {}; const o = db.obras || {};
        let selP = `<option value="">- Asignar a -</option>`; Object.keys(p).forEach(k => selP += `<option value="${k}">${k}</option>`);
        let selO = `<option value="">- En Obra -</option><option value="BODEGA">EN TALLER / BODEGA</option>`; Object.keys(o).forEach(k => { if(o[k].estado !== 'Entregada') selO += `<option value="${o[k].nombre}">${o[k].nombre}</option>` });
        const c = document.getElementById('list-herr'); if (!c) return; c.innerHTML = ''; const ids = Object.keys(h);
        ids.forEach(id => {
            const item = h[id]; const enBodega = !item.asignado_a || item.asignado_a === 'BODEGA';
            if (enBodega) {
                c.innerHTML += `<div class="p-4 bg-zinc-50 rounded-2xl border-2 border-green-500 shadow-sm relative"><div class="flex justify-between items-start mb-3"><div><b class="text-sm uppercase text-black font-black">${item.nombre}</b><br><span class="text-[10px] text-zinc-500 font-bold uppercase">${item.marca || 'S/M'}</span></div><span class="text-[9px] bg-green-500 text-white px-2 py-1 rounded-lg font-bold uppercase">EN BODEGA</span></div><div class="grid grid-cols-2 gap-2 mb-2"><select id="selP_${id}" class="p-2 border border-zinc-300 rounded-lg text-[10px] font-bold outline-none uppercase bg-white">${selP}</select><select id="selO_${id}" class="p-2 border border-zinc-300 rounded-lg text-[10px] font-bold outline-none uppercase bg-white">${selO}</select></div><div class="flex gap-2 mt-3"><button onclick="window.asignarHerr('${id}')" class="flex-[3] bg-yellow-500 text-white text-[10px] font-black py-2 rounded-xl active:scale-95 shadow-md uppercase">Entregar Equipo</button><button onclick="window.delHerr('${id}')" class="flex-1 bg-red-100 text-red-600 text-[10px] font-black py-2 rounded-xl active:scale-95 uppercase border border-red-300">Borrar</button></div></div>`;
            } else {
                c.innerHTML += `<div class="p-4 bg-orange-50 rounded-2xl border-2 border-orange-400 shadow-sm relative opacity-90"><div class="flex justify-between items-start mb-2"><div><b class="text-sm uppercase text-black font-black">${item.nombre}</b><br><span class="text-[10px] text-zinc-600 font-bold uppercase">${item.marca || 'S/M'}</span></div><span class="text-[9px] bg-orange-500 text-white px-2 py-1 rounded-lg font-bold uppercase text-center">EN USO</span></div><div class="my-2 p-2 bg-orange-100 border border-orange-300 rounded-lg text-center"><span class="text-[10px] font-bold text-orange-800 uppercase block">Responsable actual:</span><span class="text-sm font-black text-orange-900 uppercase">${item.asignado_a} - ${item.obra}</span></div><button onclick="window.devolverHerr('${id}')" class="w-full bg-black text-white text-[11px] font-black py-3 rounded-xl active:scale-95 shadow-md uppercase mt-1">Recibir en Bodega</button></div>`;
            }
        });
    });
}
window.saveHerr = () => { const nom = document.getElementById('h-nom').value.trim(), mar = document.getElementById('h-marca').value.trim(); if (nom) { firebase.database().ref(getDbPath(`herramientas/HERR_${Date.now()}`)).set({ nombre: nom, marca: mar, asignado_a: 'BODEGA', obra: 'Ninguna', fecha_asignacion: new Date().toISOString() }).then(() => dibujarHerramientas()); } };
window.asignarHerr = (id) => { const trabajador = document.getElementById(`selP_${id}`).value, obra = document.getElementById(`selO_${id}`).value; if(trabajador && obra) { firebase.database().ref(getDbPath(`herramientas/${id}`)).update({ asignado_a: trabajador, obra: obra, fecha_asignacion: new Date().toISOString() }).then(() => dibujarHerramientas()); } };
window.devolverHerr = (id) => { if(confirm("¿Recibiste esta herramienta de vuelta?")) { firebase.database().ref(getDbPath(`herramientas/${id}`)).update({ asignado_a: 'BODEGA', obra: 'Ninguna' }).then(() => dibujarHerramientas()); } };
window.delHerr = (id) => { if(confirm("¿Eliminar herramienta del inventario?")) { firebase.database().ref(getDbPath(`herramientas/${id}`)).remove().then(() => dibujarHerramientas()); } };

// ==========================================================
// 📊 OTROS MÓDULOS DE GERENCIA (RESTAURADOS VISUALMENTE)
// ==========================================================
function dibujarCaja() { appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black font-sans text-center pb-10"><div class="max-w-md mx-auto"><div class="bg-green-600 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg"><h2 class="text-xl font-black italic uppercase">GASTOS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-green-700 px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button></div><div class="bg-white p-10 shadow-xl rounded-b-3xl text-zinc-500 font-bold text-sm">Módulo en Desarrollo / Sin datos recientes</div></div></div>`; }
function dibujarUtilidad() { appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black font-sans text-center pb-10"><div class="max-w-md mx-auto"><div class="bg-zinc-900 p-6 text-red-500 flex justify-between items-center rounded-t-3xl shadow-lg"><h2 class="text-xl font-black italic uppercase text-white">FINANZAS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button></div><div class="bg-white p-10 shadow-xl rounded-b-3xl text-zinc-500 font-bold text-sm">Módulo en Desarrollo / Sin datos recientes</div></div></div>`; }
function dibujarAlmacen() { appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black font-sans text-center pb-10"><div class="max-w-md mx-auto"><div class="bg-orange-600 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg"><h2 class="text-xl font-black italic uppercase">ALMACÉN APU</h2><button onclick="window.location.hash='#menu'" class="bg-white text-orange-700 px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button></div><div class="bg-white p-10 shadow-xl rounded-b-3xl text-zinc-500 font-bold text-sm">Base de datos de Precios Unitarios en actualización</div></div></div>`; }

function dibujarObras() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black font-sans text-left pb-10"><div class="max-w-md mx-auto"><div class="bg-zinc-900 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg"><h2 class="text-xl font-black italic uppercase">CONTROL DE OBRAS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl"><input id="o-nom" type="text" placeholder="NOMBRE DEL PROYECTO" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black mb-2"><input id="o-pre" type="number" placeholder="PRESUPUESTO TOTAL Bs." class="w-full p-3 rounded-xl border-2 font-bold text-black mb-3"><button onclick="window.saveO()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all">REGISTRAR PROYECTO</button><h3 class="mt-8 mb-4 font-black text-black uppercase text-sm border-b-2 pb-2">PROYECTOS ACTIVOS</h3><div id="list-o-activas" class="space-y-4"></div></div></div></div>`;
    data.obtenerTodo((db) => {
        const cA = document.getElementById('list-o-activas'); if (!cA) return; cA.innerHTML = ''; const obs = db.obras || {};
        const rol = localStorage.getItem('rol_wr');
        Object.keys(obs).forEach(id => {
            const o = obs[id];
            if(o.estado !== 'Archivada') {
                cA.innerHTML += `<div class="p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-300 relative"><b class="text-xl uppercase text-red-600">${o.nombre}</b>${rol === 'admin' ? `<div class="pt-2 flex flex-wrap gap-1 justify-between"><button onclick="window.archivarObra('${id}')" class="flex-1 text-[9px] font-black px-2 py-2 rounded-lg bg-zinc-300 text-zinc-700 min-w-[70px]">Archivar</button><button onclick="window.delO('${id}')" class="flex-1 text-red-500 text-[9px] font-black underline px-2 py-2 min-w-[50px]">Borrar</button></div>` : ``}</div>`;
            }
        });
    });
}
window.saveO = () => { const n = document.getElementById('o-nom').value, p = document.getElementById('o-pre').value; if (n && p) { data.guardarObra(n, p).then(() => location.reload()); } };
window.delO = (id) => { if (confirm("¿Confirmar la eliminación del proyecto?")) data.borrarObra(id).then(() => location.reload()); };
window.archivarObra = (id) => { firebase.database().ref(getDbPath(`obras/${id}`)).update({ estado: 'Archivada' }).then(() => location.reload()); };

function dibujarPersonal() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black font-sans text-left pb-10"><div class="max-w-md mx-auto"><div class="bg-zinc-800 p-6 text-white flex justify-between items-center rounded-t-3xl"><h2 class="text-xl font-black italic uppercase text-white">EQUIPO DE TRABAJO</h2><button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-4"><input id="p-nom" type="text" placeholder="NOMBRE DEL PERSONAL" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black text-sm"><input id="p-sue" type="number" placeholder="PAGO DIARIO Bs." class="w-full p-3 rounded-xl border-2 font-bold text-black text-sm"><button onclick="window.saveP()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">REGISTRAR PERSONAL</button><div id="list-p" class="space-y-3 pt-4 border-t"></div></div></div></div>`;
    data.obtenerPersonal(per => {
        const c = document.getElementById('list-p'); if (!c) return; c.innerHTML = ''; const personal = per || {};
        Object.keys(personal).forEach(n => { c.innerHTML += `<div class="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center border text-black uppercase shadow-sm"><div><b class="text-sm">${n}</b><br><span class="text-[10px] text-zinc-500 font-bold">Salario Diario: Bs. ${personal[n].sueldo_dia}</span></div><div class="flex flex-col gap-1"><button onclick="window.editarP('${n}', ${personal[n].sueldo_dia})" class="text-blue-600 font-black px-3 py-1 bg-blue-100 rounded-lg active:scale-90 text-[10px]">EDITAR</button><button onclick="window.delP('${n}')" class="text-red-600 font-black px-3 py-1 bg-red-100 rounded-lg active:scale-90 text-[10px]">ELIMINAR</button></div></div>`; });
    });
}
window.saveP = () => { const n = document.getElementById('p-nom').value.trim(), s = document.getElementById('p-sue').value; if (n && s) { data.guardarPintor(n, s); document.getElementById('p-nom').value = ''; document.getElementById('p-sue').value = ''; } };
window.delP = (n) => { if (confirm(`¿Proceder con la eliminación?`)) data.borrarPintor(n); };
window.editarP = (oldName, oldSueldo) => { let nuevoNom = prompt("Modificar Nombre:", oldName); if(!nuevoNom) return; let nuevoSueldo = prompt("Modificar Sueldo:", oldSueldo); if(!nuevoSueldo) return; nuevoNom = nuevoNom.trim().toUpperCase(); if(nuevoNom !== oldName) { firebase.database().ref(getDbPath(`personal/${nuevoNom}`)).set({ sueldo_dia: nuevoSueldo }); firebase.database().ref(getDbPath(`personal/${oldName}`)).remove().then(() => dibujarPersonal()); } else { firebase.database().ref(getDbPath(`personal/${oldName}`)).update({ sueldo_dia: nuevoSueldo }).then(() => dibujarPersonal()); } };

// ==========================================================
// 📝 COTIZADOR WORD Y GENERADOR PDF PROFESIONAL BLINDADO
// ==========================================================
function dibujarCotizador() {
    appDiv.innerHTML = `
    <div class="min-h-screen p-2 text-black bg-zinc-200 pb-20">
        <div class="max-w-4xl mx-auto">
            <div class="bg-zinc-900 p-4 text-white flex justify-between items-center rounded-2xl mb-4">
                <h2 class="text-sm font-black italic">GESTOR DE DOCUMENTOS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            
            <div class="grid grid-cols-3 gap-2 mb-2">
                <button onclick="window.setDocType('COTIZACION')" class="bg-zinc-800 text-white font-bold py-2 rounded-xl active:scale-95 text-[10px] uppercase">COTIZACION</button>
                <button onclick="window.setDocType('RECIBO')" class="bg-green-600 text-white font-bold py-2 rounded-xl active:scale-95 text-[10px] uppercase">RECIBO</button>
                <button onclick="window.modoGarantia()" class="bg-yellow-600 text-white font-black py-2 rounded-xl active:scale-95 text-[10px] uppercase">GARANTIA</button>
            </div>
            
            <button onclick="window.arreglarFormato()" class="w-full bg-blue-600 text-white font-black py-3 rounded-lg mb-2 text-xs uppercase border-b-4 border-blue-800 active:scale-95">🪄 ARREGLAR TABLAS (BOTÓN AZUL)</button>
            <button onclick="window.generarPDF()" class="w-full bg-red-600 text-white font-black py-4 rounded-lg mb-6 active:scale-95 shadow-lg">📥 GENERAR PDF PROFESIONAL</button>
            
            <p class="text-[10px] font-bold text-zinc-500 uppercase text-center mb-2">COPIE SU COTIZACIÓN Y PÉGUELA EN LA ZONA BLANCA.</p>

            <div class="overflow-x-auto w-full pb-10">
                <div id="hoja-pdf" class="bg-white text-black shadow-2xl mx-auto flex flex-col" style="width:210mm; min-height:295mm; padding:20mm; font-family:Arial;">
                    
                    <div style="display:flex; justify-content:space-between; border-bottom: 4px solid #cc0000; padding-bottom: 10px; margin-bottom: 20px; align-items: flex-end;">
                        <div style="display:flex; align-items:center;">
                            <div style="background-color:#cc0000; color:white; font-weight:900; font-size:26px; padding:8px 12px; border-radius:4px; margin-right:12px; letter-spacing: -1px;">WRPUMA</div>
                            <p style="margin:0; font-size:10px; font-weight:bold; color:#555; text-transform:uppercase; line-height: 1.2;">Ingeniería en Pintura<br>e Impermeabilizaciones</p>
                        </div>
                        <div style="text-align:right;">
                            <p id="doc-title" contenteditable="true" style="margin:0; font-weight:900; font-size:18px; outline:none; color:#000;">COTIZACION</p>
                            <p style="margin:0; font-size:12px; color:#000;">Santa Cruz, ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div id="zona-editable" contenteditable="true" style="outline:none; font-size:14px; line-height:1.5; flex-grow:1; text-align:justify; color:#000;" onclick="if(this.innerHTML.includes('--- Pegue aquí')) this.innerHTML='';">
                        <p style="color:#999; text-align:center; margin-top:50px;">--- Pegue aquí su cotización ---</p>
                    </div>
                    
                    <div style="margin-top:40px; border-top: 2px solid #000; padding-top:10px; display:flex; justify-content:space-between; font-size: 11px; color:#000;">
                        <div><b>WRPUMA - Ingeniería en Pintura</b><br>Plan 3000 Av. Piraisito N° 8560 | Cel: 77396806</div>
                        <div style="text-align:right;">wrpuma@gmail.com<br><i style="color:#cc0000; font-weight:bold;">Dando el toque final a su construcción</i></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

window.setDocType = (t) => { 
    document.getElementById('doc-title').innerText = t; 
    document.getElementById('zona-editable').innerHTML = '<p style="color:#999; text-align:center; margin-top:50px;">--- Pegue aquí la cotización ---</p>'; 
};

window.modoGarantia = () => { 
    document.getElementById('doc-title').innerText = 'CERTIFICADO DE GARANTIA'; 
    document.getElementById('zona-editable').innerHTML = `<p style="margin:6px 0; color:#000;"><b>PROYECTO:</b> [Escribir Nombre del Proyecto]</p><p style="margin:6px 0; color:#000;"><b>CLIENTE:</b> [Escribir Nombre del Cliente]</p><p style="margin:15px 0; line-height: 1.6; color:#000;">Por medio del presente documento, <b>WRPUMA</b> certifica la calidad de los materiales y la correcta ejecución técnica.</p><p style="margin:15px 0 5px; font-weight:900; font-size:14px; color:#cc0000;">1. ALCANCE DE LA COBERTURA (1 AÑO)</p><p style="margin:6px 0; line-height: 1.6; color:#000;">Se garantiza la estanqueidad y adherencia exclusivamente en la superficie tratada por <b>UN (1) AÑO</b>.</p><p style="margin:15px 0 5px; font-weight:900; font-size:14px; color:#cc0000;">2. EXCLUSIONES</p><ul style="margin:6px 0; padding-left: 20px; line-height: 1.6; color:#000;"><li>Capa perforada por terceros.</li><li>Fisuras estructurales.</li><li>Falta de mantenimiento.</li></ul><p style="margin:50px 0 0; text-align:center; color:#000;">_______________________<br><b>Walter Puma</b><br>Gerente General - WRPUMA</p>`; 
};

window.arreglarFormato = () => {
    const z = document.getElementById('zona-editable');
    let texto = z.innerText;
    if(texto.includes('|')) {
        let lineas = texto.split('\n');
        let nuevoHTML = '';
        let enTabla = false;
        lineas.forEach(l => {
            let trimL = l.trim();
            if (trimL.match(/^\|?[\-\s\|]+\|?$/) && trimL.includes('-')) return; 
            if (trimL.includes('|')) {
                if (!enTabla) { enTabla = true; nuevoHTML += '<table style="width:100%; border-collapse:collapse; margin:15px 0; font-size:12px; color:#000; border:1px solid #000;">'; }
                let fila = trimL.replace(/^\||\|$/g, '');
                let celdas = fila.split('|');
                nuevoHTML += '<tr style="border:1px solid #000;">';
                celdas.forEach(celda => {
                    let c = celda.trim().replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    nuevoHTML += `<td style="border:1px solid #000; padding:6px; color:#000;">${c}</td>`;
                });
                nuevoHTML += '</tr>';
            } else {
                if (enTabla) { nuevoHTML += '</table>'; enTabla = false; }
                if (trimL !== '') {
                    let c = trimL.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/### (.*)/, '<b style="color:#cc0000;">$1</b>');
                    nuevoHTML += `<p style="margin-bottom:6px; color:#000;">${c}</p>`;
                }
            }
        });
        if (enTabla) nuevoHTML += '</table>';
        z.innerHTML = nuevoHTML;
    } else {
        z.innerHTML = z.innerHTML.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    }
};

window.generarPDF = () => { 
    const btn = event.target; const txt = btn.innerText; btn.innerText = "PROCESANDO..."; btn.disabled = true; 
    setTimeout(() => { 
        html2pdf().set({ 
            margin: 0, filename: `WRPUMA_Cotizacion_${Date.now()}.pdf`, 
            image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, 
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
        }).from(document.getElementById('hoja-pdf')).save().then(() => { btn.innerText = txt; btn.disabled = false; }); 
    }, 500); 
};

// ==========================================================
// 🚀 MENU MAESTRO Y ENRUTADOR (BLINDAJE DE SEGURIDAD)
// ==========================================================
function dibujarMenu() {
    const rol = localStorage.getItem('rol_wr');
    if (!rol) { window.location.hash = ''; return; }
    const empresa = localStorage.getItem('empresa_wr') || 'Walter';
    const tituloMenu = empresa === 'Napoleon' ? 'NAPO<span class="text-blue-500">LEON</span>' : 'WR<span class="text-red-600">PUMA</span>';

    if(rol === 'admin') {
        firebase.database().ref(getDbPath('solicitudes')).once('value').then(snap => {
            let haySol = false;
            const sol = snap.val() || {};
            Object.keys(sol).forEach(k => { if(sol[k].estado === 'Pendiente') haySol = true; });
            if(haySol && document.getElementById('btn-solicitudes')) {
                document.getElementById('btn-solicitudes').classList.remove('hidden');
            }
        });
    }

    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-6 text-white text-center flex flex-col justify-between font-sans pb-10">
        <div>
            <h1 class="text-5xl font-black italic mb-2 tracking-tighter uppercase text-white">${tituloMenu}</h1>
            <p class="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.3em] mb-6">Elite Management ${rol === 'super' ? '- SUPERVISOR' : ''}</p>
            
            ${rol === 'admin' ? `
            <div class="mb-6 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-left">
                <label class="text-[9px] text-blue-400 font-bold uppercase mb-1 block">📌 Configurar Mensaje del Día para Trabajadores:</label>
                <div class="flex gap-2">
                    <input id="input-msg-dia" type="text" placeholder="Ej: Hoy toca avance en obra Onix." class="w-full bg-black text-white p-2 rounded outline-none text-xs border border-zinc-800">
                    <button onclick="window.guardarMsgDia()" class="bg-blue-600 text-white px-3 rounded font-bold text-xs">Fijar</button>
                </div>
            </div>
            
            <button id="btn-solicitudes" onclick="window.location.hash='#solicitudes'" class="hidden w-full mb-4 bg-orange-500 text-black py-3 rounded-2xl font-black text-xs uppercase animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.5)] border-2 border-orange-300">
                ⚠️ Tienes Pedidos de Material / Anticipos de los trabajadores
            </button>
            ` : ``}

            <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto text-black text-left">
                <button onclick="window.location.hash='#asistencia'" class="bg-red-600 text-white aspect-square rounded-3xl flex flex-col items-center justify-center shadow-lg active:scale-95 italic"><span class="font-black text-[12px] uppercase mt-2">Asistencia</span></button>
                
                ${rol === 'admin' ? `
                <button onclick="window.location.hash='#tratos'" class="bg-purple-600 text-white aspect-square rounded-3xl flex flex-col items-center justify-center shadow-lg active:scale-95 italic"><span class="font-black text-[12px] uppercase mt-2">Tratos</span></button>
                <button onclick="window.location.hash='#obras'" class="bg-zinc-900 text-white aspect-square rounded-3xl border border-zinc-800 active:scale-95 shadow-xl italic"><span class="font-black text-[12px] uppercase mt-2">Proyectos</span></button>
                <button onclick="window.location.hash='#personal'" class="bg-zinc-100 text-black aspect-square rounded-3xl flex flex-col items-center justify-center shadow-xl italic"><span class="font-black text-[12px] uppercase mt-2">Personal</span></button>
                <button onclick="window.location.hash='#almacen'" class="bg-orange-600 text-white aspect-square rounded-3xl flex flex-col items-center justify-center shadow-xl italic"><span class="font-black text-[12px] uppercase mt-2">Catálogo APU</span></button>
                <button onclick="window.location.hash='#herramientas'" class="bg-yellow-600 text-white aspect-square rounded-3xl flex flex-col items-center justify-center shadow-lg active:scale-95 font-black text-[11px] text-center uppercase italic border-b-4 border-yellow-800">Inventario</button>
                <button onclick="window.location.hash='#planilla'" class="col-span-2 bg-zinc-900 text-white h-16 rounded-2xl border border-zinc-800 active:scale-95 shadow-xl font-black text-[12px] uppercase italic">Pagar Sueldos</button>
                <button onclick="window.location.hash='#cotizaciones'" class="col-span-2 bg-white h-20 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 shadow-lg border-b-4 border-zinc-300"><span class="font-black text-[11px] uppercase text-red-600">Generar Documentos PDF</span></button>
                <button onclick="window.location.hash='#calculadora'" class="col-span-2 bg-blue-600 text-white h-20 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 shadow-lg border-b-4 border-blue-800 mt-[-10px]"><span class="font-black text-[11px] uppercase text-white">Calculadora Operativa</span></button>
                <button onclick="window.location.hash='#contabilidad'" class="col-span-1 bg-green-600 text-white h-16 rounded-2xl flex items-center justify-center gap-2 active:scale-95 shadow-lg font-black text-[10px] uppercase italic">Control Gastos</button>
                <button onclick="window.location.hash='#utilidad'" class="col-span-1 bg-zinc-900 text-red-500 h-16 rounded-2xl flex items-center justify-center gap-2 border border-zinc-800 active:scale-95 shadow-lg font-black text-[10px] uppercase italic">Reporte Finanzas</button>
                ` : ``}

                ${rol === 'super' ? `
                <button onclick="window.location.hash='#herramientas'" class="bg-yellow-600 text-white aspect-square rounded-3xl flex flex-col items-center justify-center shadow-lg active:scale-95 font-black text-[11px] text-center uppercase italic border-b-4 border-yellow-800">Auditoría Inventario</button>
                <button onclick="window.location.hash='#obras'" class="col-span-2 bg-zinc-900 text-white h-16 rounded-2xl border border-zinc-800 active:scale-95 shadow-xl font-black text-[12px] uppercase italic">Ver Proyectos Activos</button>
                ` : ``}
            </div>
        </div>
        <button onclick="window.cerrarSesionTotal()" class="text-zinc-700 text-[10px] font-bold uppercase pt-4 border-t border-zinc-900 italic mt-8">FINALIZAR SESION</button>
    </div>`;

    if(rol === 'admin') {
        firebase.database().ref(getDbPath('config/mensaje_dia')).once('value').then(snap => {
            const inputMsg = document.getElementById('input-msg-dia');
            if(inputMsg) inputMsg.value = snap.val() || "";
        });
    }
}

window.guardarMsgDia = () => {
    const msg = document.getElementById('input-msg-dia').value;
    firebase.database().ref(getDbPath('config/mensaje_dia')).set(msg).then(()=>{
        alert("Mensaje fijado para todo el personal.");
    });
};

function enrutador() {
    const h = window.location.hash, rol = localStorage.getItem('rol_wr');
    if (!rol && h !== '') { window.location.hash = ''; return; }
    if (rol === 'trabajador' && h !== '#panel-trabajador') { window.location.hash = '#panel-trabajador'; return; }
    
    if (rol === 'super' && !['#menu', '#asistencia', '#herramientas', '#obras', ''].includes(h)) { 
        alert("Acceso denegado: Seguridad de Gerencia."); 
        window.location.hash = '#menu'; return; 
    }

    if (h === '#panel-trabajador') dibujarPanelTrabajador();
    else if (h === '#asistencia') dibujarAsistencia(); else if (h === '#cotizaciones') dibujarCotizador();
    else if (h === '#calculadora') dibujarCalculadora(); else if (h === '#menu') dibujarMenu();
    else if (h === '#planilla') dibujarPlanilla(); else if (h === '#obras') dibujarObras();
    else if (h === '#personal') dibujarPersonal(); else if (h === '#almacen') dibujarAlmacen();
    else if (h === '#utilidad') dibujarUtilidad(); else if (h === '#contabilidad') dibujarCaja();
    else if (h === '#tratos') dibujarTratos(); else if (h === '#herramientas') dibujarHerramientas();
    else if (h === '#solicitudes') dibujarSolicitudes();
    else dibujarAcceso();
}

window.cerrarSesionTotal = () => { localStorage.clear(); window.location.hash = ''; location.reload(); };

function dibujarAcceso() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center font-sans">
        <h1 class="text-6xl font-black italic mb-2 tracking-tighter text-white uppercase" aria-label="W R PUMA">WR<span class="text-red-600">PUMA</span></h1>
        <p class="text-zinc-500 font-bold tracking-[0.4em] mb-12 uppercase text-[10px]">Gestion Empresarial</p>
        <div class="grid gap-4 w-full max-w-xs text-black">
            <button onclick="window.verAccesoPro('walter')" class="bg-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform border-2 border-red-800">ACCESO GERENCIA</button>
            <button onclick="window.verAccesoPro('napoleon')" class="bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform border-2 border-blue-800">ACCESO DIRECCION</button>
            <button onclick="window.verAccesoPro('super')" class="bg-zinc-800 text-zinc-300 py-3 rounded-2xl font-black text-sm border border-zinc-700 active:scale-95 transition-transform mt-4">ACCESO SUPERVISOR</button>
            
            <div class="border-t border-zinc-800 pt-4 mt-2">
                <button onclick="window.verAccesoPro('trabajador')" class="w-full bg-zinc-900 text-green-500 py-4 rounded-2xl font-black text-xs border border-zinc-800 active:scale-95 transition-transform uppercase shadow-[0_0_15px_rgba(34,197,94,0.1)]">👤 ACCESO TRABAJADOR / ASISTENCIA</button>
            </div>
        </div>
    </div>`;
}

window.addEventListener('hashchange', enrutador); window.addEventListener('load', enrutador); enrutador();
