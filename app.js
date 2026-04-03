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
// 🧮 CALCULADORA COMPUTOS PRO (CONECTADA AL ALMACÉN)
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
                        <label class="text-[9px] text-orange-400 font-bold uppercase mb-1 block">CONSULTAR ALMACÉN INTERNO:</label>
                        <select id="calc-almacen-helper" onchange="window.cargarPrecioDeAlmacen(this.value)" class="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-bold text-xs outline-none">
                            <option value="">-- Seleccionar material guardado --</option>
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
                        <div id="box-precio-dado" class="col-span-2" style="display:none;">
                            <label class="text-[9px] text-zinc-400 font-bold uppercase">Costo Base x Dado A/C</label>
                            <input id="calc-precio-dado" type="number" value="0" class="w-full p-2 bg-black border border-zinc-700 rounded-lg text-white font-black text-lg text-center" oninput="window.calcularParcial()">
                        </div>
                    </div>
                    <div class="mt-3 p-2 bg-red-900/30 rounded-lg border border-red-800">
                        <p class="text-[8px] text-red-300 font-bold uppercase text-center leading-tight">ESTANDAR WRPUMA: El total generado es COSTO DIRECTO. Al armar el documento Word, aplica +10% (GG) y +35% (Utilidad Neta).</p>
                    </div>
                </div>

                <div class="bg-zinc-100 p-4 rounded-2xl border-2 border-zinc-300 text-center mt-4"><div class="flex justify-between text-[11px] font-black uppercase text-zinc-600 mb-2"><span>Area: <span id="res-parcial-m2" class="text-blue-600">0</span> m2</span><span>Costo Directo: Bs. <span id="res-parcial-total" class="text-red-600">0</span></span></div><button onclick="window.agregarAlCarrito()" class="w-full bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg active:scale-95 text-xs uppercase">AÑADIR A LA LISTA</button></div>
                <div id="contenedor-carrito" class="mt-8 pt-8 border-t-4 border-zinc-300 border-dashed" style="display:none;"><h3 class="font-black text-black uppercase text-sm mb-4 text-center">COSTO ACUMULADO DEL PROYECTO</h3><div id="lista-carrito" class="space-y-3 mb-6"></div><div class="bg-green-600 text-white p-5 rounded-3xl text-center shadow-2xl border-4 border-green-400"><p class="text-[10px] font-bold uppercase mb-1">TOTAL COSTO DIRECTO</p><span class="text-4xl font-black">Bs. <span id="carrito-gran-total">0</span></span><button onclick="window.enviarCarritoWhatsApp()" class="mt-4 w-full bg-white text-green-700 font-black py-4 rounded-xl shadow-lg text-[12px] uppercase">ENVIAR AL WHATSAPP</button></div></div>
            </div>
        </div>
    </div>`;

    // Cargar materiales al dropdown
    firebase.database().ref(getDbPath('materiales')).once('value').then(snap => {
        const matSelect = document.getElementById('calc-almacen-helper');
        const mats = snap.val() || {};
        Object.keys(mats).forEach(id => {
            matSelect.innerHTML += `<option value="${mats[id].precio}">${mats[id].nombre} (${mats[id].marca}) - Bs. ${mats[id].precio}</option>`;
        });
    });

    setTimeout(window.calcularParcial, 100);
}

window.cargarPrecioDeAlmacen = (precio) => {
    if (precio) {
        document.getElementById('calc-precio-m2').value = precio;
        window.calcularParcial();
    }
};

window.cambiarTipoCalc = () => {
    const tipo = document.getElementById('calc-tipo').value;
    const bAncho = document.getElementById('box-ancho'), bAlto = document.getElementById('box-alto'), bCielo = document.getElementById('box-cielo'), pDesc = document.getElementById('panel-descuentos'), pTecho = document.getElementById('panel-techo'), bPDado = document.getElementById('box-precio-dado');
    if (tipo === 'techo') { bAncho.style.display = 'block'; bAlto.style.display = 'none'; bCielo.style.display = 'none'; pDesc.style.display = 'none'; pTecho.style.display = 'block'; bPDado.style.display = 'block'; }
    else if (tipo === 'muro') { bAncho.style.display = 'none'; bAlto.style.display = 'block'; bCielo.style.display = 'none'; pDesc.style.display = 'block'; pTecho.style.display = 'none'; bPDado.style.display = 'none'; }
    else { bAncho.style.display = 'block'; bAlto.style.display = 'block'; bCielo.style.display = 'flex'; pDesc.style.display = 'block'; pTecho.style.display = 'none'; bPDado.style.display = 'none'; }
};

window.calcularParcial = () => {
    const tipo = document.getElementById('calc-tipo').value;
    const L = parseFloat(document.getElementById('calc-largo').value) || 0, A = parseFloat(document.getElementById('calc-ancho').value) || 0, H = parseFloat(document.getElementById('calc-alto').value) || 0;
    const pCielo = document.getElementById('calc-cielo').checked;
    let aP = 0, aC = 0, perim = 0, aB = 0, aN = 0, dP = 0, dV = 0;

    if (tipo === 'techo') { aB = L * A; aN = aB * (parseFloat(document.getElementById('calc-caida').value) || 1); }
    else {
        if (tipo === 'cuarto') { perim = (L + A) * 2; aP = perim * H; if (pCielo) aC = L * A; } else { perim = L; aP = L * H; }
        aB = aP + aC;
        dP = (parseFloat(document.getElementById('calc-p-cant').value) || 0) * (parseFloat(document.getElementById('calc-p-ancho').value) || 0) * 2;
        dV = (parseFloat(document.getElementById('calc-v-cant').value) || 0) * (parseFloat(document.getElementById('calc-v-ancho').value) || 0) * (parseFloat(document.getElementById('calc-v-alto').value) || 0);
        aN = Math.max(0, aB - dP - dV);
    }

    const mlI = document.getElementById('calc-ml');
    if (document.activeElement !== mlI && (!mlI.value || mlI.value == "0") && tipo !== 'techo' && perim > 0) mlI.value = perim.toFixed(2);

    const mlR = parseFloat(mlI.value) || 0, dadosC = tipo === 'techo' ? (parseFloat(document.getElementById('calc-dados').value) || 0) : 0;
    const pM2 = parseFloat(document.getElementById('calc-precio-m2').value) || 0, pMl = parseFloat(document.getElementById('calc-precio-ml').value) || 0, pDado = parseFloat(document.getElementById('calc-precio-dado').value) || 0;

    window.tempM2 = aN.toFixed(2); window.tempMl = mlR.toFixed(2); window.tempDados = dadosC; window.tempTotal = ((aN * pM2) + (mlR * pMl) + (dadosC * pDado)).toFixed(2);
    document.getElementById('res-parcial-m2').innerText = window.tempM2; document.getElementById('res-parcial-total').innerText = window.tempTotal;
};

window.agregarAlCarrito = () => {
    let nom = document.getElementById('calc-nombre').value.trim();
    if (!nom || parseFloat(window.tempTotal) === 0) return alert("Ingrese nombre y medidas/precios.");
    window.carritoPresupuesto.push({ nombre: nom.toUpperCase(), m2: window.tempM2, ml: window.tempMl, dados: window.tempDados, total: window.tempTotal });
    ['calc-nombre', 'calc-largo', 'calc-ancho', 'calc-alto', 'calc-ml', 'calc-dados'].forEach(i => document.getElementById(i).value = '');
    ['calc-p-cant', 'calc-v-cant'].forEach(i => document.getElementById(i).value = '0');
    document.getElementById('calc-almacen-helper').value = '';
    window.calcularParcial(); window.renderCarrito();
};

window.renderCarrito = () => {
    const c = document.getElementById('contenedor-carrito'), l = document.getElementById('lista-carrito');
    if (window.carritoPresupuesto.length === 0) return c.style.display = 'none';
    c.style.display = 'block'; l.innerHTML = ''; let t = 0;
    window.carritoPresupuesto.forEach((i, idx) => {
        t += parseFloat(i.total);
        l.innerHTML += `<div class="bg-zinc-900 p-4 rounded-xl text-white flex justify-between"><div><p class="font-black text-sm text-blue-300">${i.nombre}</p><p class="text-[10px] text-zinc-400">Area: ${i.m2}m2</p><p class="font-black text-white">CD: Bs. ${i.total}</p></div><button onclick="window.quitarDelCarrito(${idx})" class="text-red-500 font-black">BORRAR</button></div>`;
    });
    document.getElementById('carrito-gran-total').innerText = t.toFixed(2);
};

window.quitarDelCarrito = (idx) => { window.carritoPresupuesto.splice(idx, 1); window.renderCarrito(); };

window.enviarCarritoWhatsApp = () => {
    let txt = `RESUMEN COSTOS DIRECTOS WRPUMA\n\n`;
    let tm = 0, tt = 0;

    window.carritoPresupuesto.forEach(i => {
        txt += `AMBIENTE: ${i.nombre}\n   - Area de trabajo: ${i.m2} m2\n   - Subtotal Directo: Bs. ${i.total}\n\n`;
        tm += parseFloat(i.m2);
        tt += parseFloat(i.total);
    });

    let pVenta = tt * 1.10 * 1.35; // Aplica el estándar WRPUMA de forma automática en el mensaje

    txt += `======================\n- Area Total: ${tm.toFixed(2)} m2\n- COSTO DIRECTO: Bs. ${tt.toFixed(2)}\n\n⚠️ PRECIO DE VENTA SUGERIDO (Inc. GG y 35% Utilidad):\n👉 Bs. ${pVenta.toFixed(2)}`;

    let textoCodificado = encodeURIComponent(txt);
    window.open(`https://api.whatsapp.com/send?text=${textoCodificado}`, '_blank');
};

// ==========================================================
// 📋 ASISTENCIA PRO
// ==========================================================
function dibujarAsistencia() {
    const adm = localStorage.getItem('a_wr') === 'true';

    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans text-left pb-10">
        <div class="max-w-md mx-auto bg-white rounded-3xl shadow-xl border-t-8 border-red-600 overflow-hidden relative">
            <div class="p-6 bg-white flex justify-between items-center border-b">
                <div>
                    <h2 class="text-2xl font-black italic uppercase">ASISTENCIA</h2>
                    <input type="date" value="${fechaSel}" ${adm ? 'onchange="window.chF(this.value)"' : 'disabled title="Solo administradores pueden cambiar la fecha"'} class="mt-1 text-[12px] font-bold text-red-600 uppercase bg-red-50 p-1 px-2 rounded-lg border border-red-200 outline-none shadow-sm ${adm ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}">
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
                    <select id="modal-j-normal" class="w-full p-2 bg-white border border-zinc-300 rounded-lg font-black text-black text-xs outline-none">
                        <option value="1">1 Dia (L-V)</option>
                        <option value="0.5">0.5 Dias (Medio/Sab)</option>
                        <option value="0">0 Dias (Falta)</option>
                    </select>
                </div>
                <div class="bg-blue-50 p-2 rounded-xl border border-blue-200">
                    <label class="text-[9px] text-blue-600 font-bold uppercase mb-1 block">TURNO EXTRA:</label>
                    <select id="modal-j-extra" class="w-full p-2 bg-white border border-blue-300 rounded-lg font-black text-blue-700 text-xs outline-none">
                        <option value="0">Sin Extra</option>
                        <option value="0.5">0.5 Dias (Hasta 10pm)</option>
                        <option value="1">1 Dia (Hasta 1am)</option>
                        <option value="1.5">1.5 Dias (Amanecida/Dom)</option>
                    </select>
                </div>
            </div>

            <div class="mb-5 bg-red-50 p-3 rounded-xl border border-red-200">
                <label class="text-[10px] text-red-600 font-black uppercase mb-2 block text-center">ANTICIPOS DE HOY (Bs):</label>
                <div class="flex items-center justify-center gap-2 mb-2">
                    <span class="text-[10px] font-bold text-red-800">Total Actual:</span>
                    <input id="modal-anticipo" type="number" placeholder="0" class="w-24 p-2 border-2 border-red-300 rounded-xl font-black text-center text-xl outline-none bg-white text-red-700">
                </div>
                <div class="flex gap-1 justify-center">
                    <button type="button" onclick="window.sumarAlAnticipo(10)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs active:scale-95 shadow-sm">+ 10</button>
                    <button type="button" onclick="window.sumarAlAnticipo(20)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs active:scale-95 shadow-sm">+ 20</button>
                    <button type="button" onclick="window.sumarAlAnticipo(50)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs active:scale-95 shadow-sm">+ 50</button>
                </div>
                <p class="text-[8px] text-red-500 mt-2 text-center leading-tight">Uso exclusivo para sumar dinero entregado.</p>
            </div>

            <div class="flex gap-2 mt-2">
                <button onclick="document.getElementById('modal-asistencia').classList.add('hidden')" class="flex-1 bg-zinc-200 text-zinc-700 font-black py-3 rounded-xl active:scale-95 text-xs">CANCELAR</button>
                <button id="btn-quitar-asist" onclick="window.quitarAsistenciaModal()" class="flex-1 bg-red-100 text-red-600 font-black py-3 rounded-xl active:scale-95 text-xs hidden border border-red-300">BORRAR</button>
                <button onclick="window.guardarAsistenciaModal()" class="flex-[2] bg-green-600 text-white font-black py-3 rounded-xl active:scale-95 shadow-lg text-xs uppercase">GUARDAR</button>
            </div>
        </div>
    </div>`;

    const sel = document.getElementById('sel-o');
    data.obtenerObras(obs => {
        sel.innerHTML = '<option value="GENERAL">GENERAL</option>';
        Object.keys(obs).forEach(id => { if (obs[id].estado === 'Activa' || true) { sel.innerHTML += `<option value="${obs[id].nombre}">${obs[id].nombre}</option>`; } });
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
    const adm = localStorage.getItem('a_wr') === 'true';

    Object.keys(window.currentPersonal).forEach(n => {
        const record = window.currentMarks[n];
        const estaEnEstaObra = record && record.obra === obraSel;
        const estaEnOtraObra = record && record.obra !== obraSel;
        let botonUI = ''; let estiloBorde = 'border-zinc-100';

        if (estaEnEstaObra) {
            estiloBorde = 'border-green-500 bg-green-50';
            botonUI = `<button onclick="window.abrirModalAsistencia('${n}', true)" class="p-2 rounded-xl bg-green-500 text-white active:scale-90 shadow-md flex flex-col items-center justify-center w-24"><span class="font-black text-sm">REGISTRADO</span><span class="text-[8px] uppercase mt-1">Editar</span></button>`;
        }
        else if (estaEnOtraObra) {
            estiloBorde = 'border-orange-200 opacity-80';
            botonUI = `<button onclick="window.markP('${n}', 'mover')" class="p-2 rounded-xl bg-orange-100 text-orange-700 text-[9px] font-black active:scale-90 uppercase text-center border border-orange-300 w-24">EN: ${record.obra} <br> TRAER</button>`;
        }
        else {
            estiloBorde = 'border-zinc-200';
            botonUI = `<button onclick="window.abrirModalAsistencia('${n}', false)" class="p-3 rounded-xl bg-zinc-800 text-white active:scale-90 font-black shadow-md w-24">ASISTENCIA</button>`;
        }

        let resumenInfo = '';
        if (estaEnEstaObra) {
            let infoArr = [];
            let jN = record.jornada_normal !== undefined ? record.jornada_normal : (record.jornada || 1);
            let jE = record.jornada_extra || 0;

            if (jN > 0) infoArr.push(`Normal: ${jN}D`);
            if (jE > 0) infoArr.push(`Extra: ${jE}D`);
            if (record.monto_anticipo > 0) infoArr.push(`Anticipo: Bs.${record.monto_anticipo}`);

            if (infoArr.length > 0) resumenInfo = `<br><span class="text-[10px] text-green-700 font-bold uppercase">${infoArr.join(' | ')}</span>`;
        }

        c.innerHTML += `<div class="flex items-center justify-between p-3 bg-white rounded-2xl border-2 ${estiloBorde} text-black uppercase transition-all shadow-sm"><div><b class="text-sm">${n}</b>${resumenInfo}</div>${botonUI}</div>`;
    });
};

window.abrirModalAsistencia = (n, existe) => {
    const adm = localStorage.getItem('a_wr') === 'true';
    if (existe && !adm) {
        alert("ACCESO DENEGADO: El supervisor no puede editar registros financieros. Contacte al administrador.");
        return;
    }

    window.pintorActualModal = n;
    const record = window.currentMarks[n] || {};

    document.getElementById('modal-nombre').innerText = n;

    let jN_vieja = record.jornada_normal !== undefined ? record.jornada_normal : (record.jornada || "1");

    document.getElementById('modal-j-normal').value = jN_vieja;
    document.getElementById('modal-j-extra').value = record.jornada_extra || "0";
    document.getElementById('modal-anticipo').value = record.monto_anticipo || "0";

    const btnQuitar = document.getElementById('btn-quitar-asist');
    if (existe) {
        btnQuitar.classList.remove('hidden');
    } else {
        btnQuitar.classList.add('hidden');
    }

    document.getElementById('modal-asistencia').classList.remove('hidden');
};

window.sumarAlAnticipo = (monto) => {
    const input = document.getElementById('modal-anticipo');
    let actual = parseFloat(input.value) || 0;
    input.value = actual + monto;
};

window.guardarAsistenciaModal = () => {
    const n = window.pintorActualModal;
    const jN = parseFloat(document.getElementById('modal-j-normal').value) || 0;
    const jE = parseFloat(document.getElementById('modal-j-extra').value) || 0;
    const a = parseFloat(document.getElementById('modal-anticipo').value) || 0;

    firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).set({
        nombre: n,
        obra: obraSel,
        jornada_normal: jN,
        jornada_extra: jE,
        monto_anticipo: a
    });
    document.getElementById('modal-asistencia').classList.add('hidden');
};

window.quitarAsistenciaModal = () => {
    if (confirm(`¿Eliminar por completo el registro de asistencia de ${window.pintorActualModal}?`)) {
        firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${window.pintorActualModal}`)).remove();
        document.getElementById('modal-asistencia').classList.add('hidden');
    }
};

window.markP = (n, accion) => {
    const adm = localStorage.getItem('a_wr') === 'true';
    if (!adm) { alert("ACCESO DENEGADO: Movimiento restringido a gerencia."); return; }
    if (accion === 'mover') {
        if (confirm(`¿Trasladar a ${n} a la obra ${obraSel}?`)) { firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).update({ obra: obraSel }); }
    }
};

// ==========================================================
// 🛒 MÓDULO ALMACÉN DE PRECIOS
// ==========================================================
function dibujarAlmacen() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans text-left pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-orange-600 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg">
                <h2 class="text-xl font-black italic uppercase text-white">CATALOGO DE COSTOS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-orange-600 px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-4">
                <input id="m-nom" type="text" placeholder="Material (Ej. Goma Líquida)" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black text-sm outline-none focus:border-orange-400">
                <div class="grid grid-cols-2 gap-2">
                    <input id="m-marca" type="text" placeholder="Marca (Ej. Suvinil)" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black text-sm outline-none">
                    <input id="m-uni" type="text" placeholder="Unidad (Ej. Balde 18L)" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black text-sm outline-none">
                </div>
                <input id="m-pre" type="number" placeholder="Precio Actual (Bs.)" class="w-full p-3 rounded-xl border-2 font-black text-black text-lg text-center text-red-600 outline-none">
                <input id="m-link" type="text" placeholder="Enlace de Proforma o Foto (Opcional)" class="w-full p-3 rounded-xl border-2 font-bold text-blue-600 text-xs outline-none">
                
                <button onclick="window.saveMat()" class="w-full bg-black text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">REGISTRAR EN ALMACEN</button>
                
                <h3 class="mt-6 mb-2 font-black text-zinc-500 uppercase text-xs border-b-2 pb-1">BASE DE DATOS ACTIVA</h3>
                <div id="list-mat" class="space-y-3 pt-2"></div>
            </div>
        </div>
    </div>`;

    firebase.database().ref(getDbPath('materiales')).on('value', snap => {
        const c = document.getElementById('list-mat'); if (!c) return; c.innerHTML = '';
        const mats = snap.val() || {};
        Object.keys(mats).forEach(id => {
            const m = mats[id];
            const btnLink = m.link ? `<button onclick="window.open('${m.link}','_blank')" class="text-[9px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold uppercase mt-1 shadow-sm">Ver Proforma</button>` : '';
            c.innerHTML += `
            <div class="p-3 bg-zinc-50 rounded-2xl border-2 border-zinc-200 flex justify-between items-center shadow-sm">
                <div>
                    <b class="text-sm uppercase text-black">${m.nombre}</b> <span class="text-[9px] bg-zinc-800 px-2 py-0.5 rounded text-white font-bold uppercase">${m.marca}</span><br>
                    <span class="text-[10px] text-zinc-500 font-bold uppercase">${m.unidad}</span>
                    <div class="mt-1">${btnLink}</div>
                </div>
                <div class="text-right">
                    <span class="text-lg font-black text-red-600">Bs. ${m.precio}</span><br>
                    <button onclick="window.delMat('${id}')" class="text-[9px] text-red-400 font-bold underline mt-1">Borrar</button>
                </div>
            </div>`;
        });
    });
}

window.saveMat = () => {
    const nom = document.getElementById('m-nom').value.trim();
    const mar = document.getElementById('m-marca').value.trim();
    const uni = document.getElementById('m-uni').value.trim();
    const pre = document.getElementById('m-pre').value;
    const lin = document.getElementById('m-link').value.trim();
    if (nom && pre) {
        const id = "MAT_" + Date.now();
        firebase.database().ref(getDbPath(`materiales/${id}`)).set({
            nombre: nom, marca: mar || 'GENERICO', unidad: uni || 'UNIDAD', precio: parseFloat(pre), link: lin
        });
        document.getElementById('m-nom').value = ''; document.getElementById('m-marca').value = '';
        document.getElementById('m-uni').value = ''; document.getElementById('m-pre').value = ''; document.getElementById('m-link').value = '';
    } else {
        alert("El nombre y el precio del material son obligatorios.");
    }
};

window.delMat = (id) => {
    if (confirm("¿Confirmas la eliminacion permanente de este material del catalogo?")) {
        firebase.database().ref(getDbPath(`materiales/${id}`)).remove();
    }
};

// ==========================================================
// 👷 MÓDULO PERSONAL (ADMIN)
// ==========================================================
function dibujarPersonal() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans text-left pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-zinc-800 p-6 text-white flex justify-between items-center rounded-t-3xl">
                <h2 class="text-xl font-black italic uppercase text-white">EQUIPO DE TRABAJO</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-4">
                <input id="p-nom" type="text" placeholder="NOMBRE DEL PERSONAL" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black text-sm">
                <input id="p-sue" type="number" placeholder="PAGO DIARIO Bs." class="w-full p-3 rounded-xl border-2 font-bold text-black text-sm">
                <button onclick="window.saveP()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">REGISTRAR PERSONAL</button>
                <div id="list-p" class="space-y-3 pt-4 border-t"></div>
            </div>
        </div>
    </div>`;

    data.obtenerPersonal(per => {
        const c = document.getElementById('list-p'); if (!c) return; c.innerHTML = '';
        Object.keys(per).forEach(n => {
            c.innerHTML += `<div class="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center border text-black uppercase">
                <div><b>${n}</b><br><span class="text-[10px] text-zinc-500 font-bold">Salario Diario: Bs. ${per[n].sueldo_dia}</span></div>
                <button onclick="window.delP('${n}')" class="text-red-600 font-black p-2 bg-red-100 rounded-lg active:scale-90">ELIMINAR</button>
            </div>`;
        });
    });
}
window.saveP = () => { const n = document.getElementById('p-nom').value.trim(); const s = document.getElementById('p-sue').value; if (n && s) { data.guardarPintor(n, s); document.getElementById('p-nom').value = ''; document.getElementById('p-sue').value = ''; } else { alert("Los campos de registro están incompletos."); } };
window.delP = (n) => { if (confirm(`¿Proceder con la eliminación del personal ${n}?`)) data.borrarPintor(n); };

// ==========================================================
// 🏗️ OBRAS Y DEMÁS MÓDULOS
// ==========================================================
function dibujarObras() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black font-sans text-left pb-10"><div class="max-w-md mx-auto"><div class="bg-zinc-900 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg"><h2 class="text-xl font-black italic uppercase">CONTROL DE OBRAS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl"><input id="o-nom" type="text" placeholder="NOMBRE DEL PROYECTO" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black mb-2"><input id="o-pre" type="number" placeholder="PRESUPUESTO TOTAL Bs." class="w-full p-3 rounded-xl border-2 font-bold text-black mb-3"><button onclick="window.saveO()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all">REGISTRAR PROYECTO</button><h3 class="mt-8 mb-4 font-black text-black uppercase text-sm border-b-2 pb-2">PROYECTOS ACTIVOS</h3><div id="list-o-activas" class="space-y-4"></div><h3 class="mt-8 mb-4 font-black text-zinc-400 uppercase text-sm border-b-2 pb-2">PROYECTOS ENTREGADOS</h3><div id="list-o-entregadas" class="space-y-4 opacity-75"></div></div></div></div>`;
    data.obtenerTodo((db) => {
        const cA = document.getElementById('list-o-activas'), cE = document.getElementById('list-o-entregadas'); if (!cA || !cE) return;
        cA.innerHTML = ''; cE.innerHTML = ''; const obs = db.obras || {}; const per = db.personal || {}; const hist = db.asistencia_semanal || {}; const finanzas = db.finanzas_obras || {};
        Object.keys(obs).forEach(id => {
            const o = obs[id]; let cobrado = 0; let gastadoMat = 0; let costoSueldos = 0;
            Object.values(hist).forEach(dia => {
                Object.values(dia).forEach(reg => {
                    if (reg.obra.toUpperCase() === o.nombre.toUpperCase()) {
                        let jN = parseFloat(reg.jornada_normal !== undefined ? reg.jornada_normal : (reg.jornada || 1));
                        let jE = parseFloat(reg.jornada_extra || 0);
                        costoSueldos += (parseFloat(per[reg.nombre]?.sueldo_dia) || 0) * (jN + jE);
                    }
                });
            });
            if (finanzas[id]) Object.values(finanzas[id]).forEach(m => { if (m.tipo === 'anticipo_cliente') cobrado += parseFloat(m.monto); else gastadoMat += parseFloat(m.monto); });
            const fRes = o.presupuesto * 0.05, gNeta = o.presupuesto - costoSueldos - gastadoMat - fRes;
            const btnG = o.link_fotos ? `<div class="flex gap-1 mb-3"><button onclick="window.open('${o.link_fotos}','_blank')" class="flex-1 bg-blue-600 text-white text-[10px] font-black uppercase py-2 rounded-lg">VER REPORTE FOTOGRAFICO</button></div>` : `<button onclick="window.agregarLinkObra('${id}')" class="w-full mb-3 bg-zinc-100 text-[9px] font-black uppercase py-2 rounded-lg">Vincular Galeria</button>`;

            const card = `
            <div class="p-4 bg-zinc-50 rounded-2xl border-2 ${o.estado !== 'Entregada' ? 'border-zinc-300' : 'border-green-500'} relative">
                <b class="text-xl uppercase text-red-600">${o.nombre}</b>
                <div class="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase mb-1 mt-2">
                    <div class="bg-white p-2 rounded-xl border">Contrato:<br>Bs. ${o.presupuesto}</div>
                    <div class="bg-white p-2 rounded-xl border">Cobrado:<br><span class="text-blue-600">Bs. ${cobrado}</span></div>
                    <div class="bg-zinc-900 text-white p-2 rounded-xl">Fondo Reserva (5%):<br><span class="text-blue-400">Bs. ${fRes.toFixed(1)}</span></div>
                    <div class="bg-zinc-900 text-white p-2 rounded-xl">Utilidad Neta:<br><span class="${gNeta >= 0 ? 'text-green-400' : 'text-red-500'}">Bs. ${gNeta.toFixed(1)}</span></div>
                </div>
                ${btnG}
                <div class="pt-2 flex gap-1 justify-between">
                    <button onclick="window.cobrarAnticipo('${id}')" class="flex-1 bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-2 rounded-lg">Cobrar Anticipo</button>
                    <button onclick="window.cambiarEstadoO('${id}', '${o.estado === 'Entregada' ? 'Activa' : 'Entregada'}')" class="flex-1 text-[9px] font-black px-2 py-2 rounded-lg ${o.estado === 'Entregada' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}">Entregar</button>
                    <button onclick="window.editarNombreObra('${id}', '${o.nombre}')" class="flex-1 text-blue-600 text-[9px] font-black underline px-2 py-2">Editar</button>
                    <button onclick="window.delO('${id}')" class="flex-1 text-red-500 text-[9px] font-black underline px-2 py-2">Borrar</button>
                </div>
            </div>`;
            o.estado !== 'Entregada' ? cA.innerHTML += card : cE.innerHTML += card;
        });
    });
}
window.agregarLinkObra = (id) => { const l = prompt("Enlace de galeria fotográfica:"); if (l) firebase.database().ref(getDbPath(`obras/${id}`)).update({ link_fotos: l }).then(() => location.reload()); };
window.saveO = () => { const n = document.getElementById('o-nom').value, p = document.getElementById('o-pre').value; if (n && p) data.guardarObra(n, p).then(() => location.reload()); };
window.delO = (id) => { if (confirm("¿Confirmar la eliminación permanente del proyecto?")) data.borrarObra(id).then(() => location.reload()); };
window.cambiarEstadoO = (id, e) => { if (confirm(`¿Modificar el estado operativo del proyecto?`)) data.cambiarEstadoObra(id, e); };
window.cobrarAnticipo = (id) => { const m = prompt("Registro de Anticipo (Monto Bs.):"); if (m) data.registrarMovimiento(id, 'anticipo_cliente', m, "Anticipo").then(() => location.reload()); };

window.editarNombreObra = (id, nombreAntiguo) => {
    const nuevo = prompt("CORREGIR NOMBRE DEL PROYECTO:", nombreAntiguo);
    if (nuevo && nuevo.trim() !== "" && nuevo.trim().toUpperCase() !== nombreAntiguo.toUpperCase()) {
        const nMayus = nuevo.trim().toUpperCase();
        if (confirm("¿Guardar modificación como " + nMayus + "? El sistema actualizará los registros de asistencia para mantener la integridad financiera.")) {
            firebase.database().ref(getDbPath(`obras/${id}`)).update({ nombre: nMayus });
            data.obtenerTodo((db) => {
                const hist = db.asistencia_semanal || {};
                Object.keys(hist).forEach(f => {
                    Object.keys(hist[f]).forEach(p => {
                        if (hist[f][p].obra === nombreAntiguo) {
                            firebase.database().ref(getDbPath(`asistencia_semanal/${f}/${p}`)).update({ obra: nMayus });
                        }
                    });
                });
                setTimeout(() => location.reload(), 1000);
            });
        }
    }
};

// ==========================================================
// 💰 PLANILLA (CON REGLA DEL DOMINICAL AUTOMATICA)
// ==========================================================
function dibujarPlanilla() {
    appDiv.innerHTML = `<div class="min-h-screen bg-black p-4 text-white font-sans text-center"><div class="max-w-md mx-auto"><div class="flex justify-between mb-4"><h2 class="text-2xl font-black italic text-red-600">PLANILLA DE PAGOS</h2><button onclick="window.location.hash='#menu'" class="bg-zinc-800 px-4 rounded-full text-xs font-bold">VOLVER</button></div><div class="bg-zinc-900 p-4 rounded-2xl mb-4 flex gap-2 text-[10px] font-bold"><div class="flex-1 text-left"><label class="text-zinc-500">Periodo Inicial</label><input type="date" value="${pFIni}" onchange="window.chPIni(this.value)" class="w-full bg-black p-2 rounded-lg"></div><div class="flex-1 text-left"><label class="text-zinc-500">Periodo Final</label><input type="date" value="${pFFin}" onchange="window.chPFin(this.value)" class="w-full bg-black p-2 rounded-lg"></div></div><div id="c-p" class="space-y-4 text-left pb-10"></div></div></div>`;
    data.obtenerTodo((db) => {
        const c = document.getElementById('c-p'); if (!c) return;
        const per = db.personal || {}; const hist = db.asistencia_semanal || {}; const res = {};

        Object.keys(hist).forEach(f => {
            if (f >= pFIni && f <= pFFin) Object.values(hist[f]).forEach(reg => {
                if (!res[reg.nombre]) res[reg.nombre] = { dNorm: 0, dExt: 0, ant: 0 };

                let jN = parseFloat(reg.jornada_normal !== undefined ? reg.jornada_normal : (reg.jornada || 1));
                let jE = parseFloat(reg.jornada_extra || 0);

                res[reg.nombre].dNorm += jN;
                res[reg.nombre].dExt += jE;
                res[reg.nombre].ant += parseFloat(reg.monto_anticipo) || 0;
            });
        });

        c.innerHTML = ''; let tP = 0;
        Object.keys(res).forEach(n => {
            const d = res[n], sDia = parseFloat(per[n]?.sueldo_dia) || 0;

            const dominical = d.dNorm >= 5.5 ? 0.5 : 0;
            const dNormPagar = d.dNorm + dominical;

            const sTot = (dNormPagar + d.dExt) * sDia;
            const saldo = sTot - d.ant;
            tP += saldo;

            let textoDominical = dominical > 0 ? `<span class="text-green-400 font-bold">+0.5 Dominical</span>` : `<span class="text-red-400 font-bold">Sin Dominical</span>`;

            c.innerHTML += `
            <div class="bg-zinc-900 p-6 rounded-3xl border-l-4 border-red-600">
                <div class="flex justify-between mb-2">
                    <h3 class="font-black text-xl uppercase">${n}</h3>
                    <span class="bg-red-600 px-2 rounded-lg font-black text-[10px] py-1 text-center">${dNormPagar + d.dExt} D<br>PAGADOS</span>
                </div>
                <div class="text-[10px] text-zinc-400 mb-3 grid grid-cols-2 gap-1">
                    <div>Salario Base: Bs.${sDia}</div>
                    <div>Deducciones: -Bs.${d.ant}</div>
                    <div>Jornada Normal: ${d.dNorm}D</div>
                    <div>Bono Dominical: ${textoDominical}</div>
                    <div class="col-span-2">Jornada Extra: ${d.dExt}D</div>
                </div>
                <button onclick="window.sendW('${n}',${sTot},${d.ant},${saldo},${d.dNorm},${dominical},${d.dExt})" class="w-full bg-zinc-100 text-black py-3 rounded-xl font-black text-xs">EMITIR RECIBO: Bs. ${saldo.toFixed(2)}</button>
            </div>`;
        });
        if (Object.keys(res).length > 0) c.innerHTML = `<div class="bg-green-600 p-4 rounded-2xl mb-4 text-center"><p class="text-[10px] font-black mb-1">Desembolso Total</p><span class="text-3xl font-black">Bs. ${tP.toFixed(2)}</span></div>` + c.innerHTML;
    });
}
window.chPIni = (v) => { pFIni = v; dibujarPlanilla(); }; window.chPFin = (v) => { pFFin = v; dibujarPlanilla(); };

window.sendW = (n, s, a, t, dn, dom, de) => {
    let txtDom = dom > 0 ? `+0.5 (Aplica Bono Dominical)` : `0.0 (No aplica Bono Dominical)`;
    let texto = `COMPROBANTE DE PAGO WRPUMA\nPersonal: ${n}\n\nDETALLE OPERATIVO:\n- Jornadas Regulares: ${dn}\n- Bono Dominical: ${txtDom}\n- Jornadas Adicionales: ${de}\n\nIngresos Brutos: Bs.${s.toFixed(2)}\nDeducciones por Anticipos: -Bs.${a.toFixed(2)}\n\nLIQUIDO PAGABLE: Bs.${t.toFixed(2)}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
};

function dibujarUtilidad() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-950 p-4 text-white text-center"><div class="max-w-md mx-auto"><div class="flex justify-between mb-6"><h2 class="text-2xl font-black italic text-red-600">REPORTE FINANCIERO</h2><button onclick="window.location.hash='#menu'" class="bg-zinc-800 px-4 rounded-full text-xs">VOLVER</button></div><div id="cont-util" class="space-y-6 text-left"></div></div></div>`;
    data.obtenerTodo((db) => {
        const c = document.getElementById('cont-util'); if (!c) return;
        const obs = db.obras || {}, hist = db.asistencia_semanal || {}, fin = db.finanzas_obras || {}, per = db.personal || {};
        c.innerHTML = ''; let uG = 0, rG = 0;
        Object.keys(obs).forEach(id => {
            const o = obs[id]; let cS = 0, gM = 0;

            let sueldosPorPintor = {};

            Object.values(hist).forEach(d => Object.values(d).forEach(r => {
                if (r.obra === o.nombre) {
                    if (!sueldosPorPintor[r.nombre]) sueldosPorPintor[r.nombre] = { dN: 0, dE: 0 };
                    let jN = parseFloat(r.jornada_normal !== undefined ? r.jornada_normal : (r.jornada || 1));
                    let jE = parseFloat(r.jornada_extra || 0);
                    sueldosPorPintor[r.nombre].dN += jN;
                    sueldosPorPintor[r.nombre].dE += jE;
                }
            }));

            Object.keys(sueldosPorPintor).forEach(n => {
                let dom = sueldosPorPintor[n].dN >= 5.5 ? 0.5 : 0;
                let totalDiasObra = sueldosPorPintor[n].dN + dom + sueldosPorPintor[n].dE;
                cS += (parseFloat(per[n]?.sueldo_dia) || 0) * totalDiasObra;
            });

            if (fin[id]) Object.values(fin[id]).forEach(m => { if (m.tipo === 'compra_material') gM += parseFloat(m.monto); });
            const fR = o.presupuesto * 0.05, gN = o.presupuesto - cS - gM - fR; uG += gN; rG += fR;
            c.innerHTML += `<div class="bg-zinc-900 p-6 rounded-3xl border-l-8 ${gN >= 0 ? 'border-red-600' : 'border-orange-500'}"><h3 class="font-black text-lg mb-3">${o.nombre}</h3><div class="grid grid-cols-2 gap-2 text-[10px] mb-4"><div class="bg-black p-2 rounded-xl text-zinc-400">Contrato Base:<br><span class="text-white text-sm">Bs.${o.presupuesto}</span></div><div class="bg-black p-2 rounded-xl text-zinc-400">Costos Operativos:<br><span class="text-red-400 text-sm">-Bs.${cS + gM}</span></div></div><div class="bg-zinc-950 p-4 rounded-xl text-center"><p class="text-[9px] text-zinc-500">Beneficio Neto</p><p class="text-3xl font-black ${gN >= 0 ? 'text-green-500' : 'text-orange-500'}">Bs. ${gN.toFixed(1)}</p></div></div>`;
        });
        if (Object.keys(obs).length > 0) c.innerHTML = `<div class="bg-green-600 p-5 rounded-3xl mb-6 text-center"><p class="text-[10px] font-black">BENEFICIO GLOBAL</p><span class="text-4xl font-black">Bs. ${uG.toFixed(1)}</span></div>` + c.innerHTML;
    });
}

function dibujarCaja() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black text-center"><div class="max-w-md mx-auto"><div class="bg-green-600 p-6 text-white flex justify-between rounded-t-3xl"><h2 class="text-xl font-black italic">REGISTRO DE EGRESOS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-green-600 px-4 rounded-full text-xs">VOLVER</button></div><div class="bg-white p-6 rounded-b-3xl space-y-4 text-left"><select id="c-obra" class="w-full p-3 rounded-xl border-2 font-bold"></select><input id="c-detalle" type="text" placeholder="Concepto (Ej. Insumos...)" class="w-full p-3 rounded-xl border-2 font-bold"><input id="c-monto" type="number" placeholder="Importe Bs." class="w-full p-3 rounded-xl border-2 font-black"><button onclick="window.saveM()" class="w-full bg-black text-white font-black py-4 rounded-2xl">REGISTRAR EGRESO</button></div></div></div>`;
    data.obtenerObras((obs) => {
        const s = document.getElementById('c-obra'); s.innerHTML = '<option value="">-- SELECCIONAR PROYECTO --</option>';
        Object.keys(obs).forEach(id => { if (obs[id].estado !== 'Entregada') s.innerHTML += `<option value="${id}">${obs[id].nombre}</option>`; });
    });
}
window.saveM = () => { const id = document.getElementById('c-obra').value, m = document.getElementById('c-monto').value, d = document.getElementById('c-detalle').value; if (id && m) data.registrarMovimiento(id, 'compra_material', m, d).then(() => window.location.hash = '#obras'); };

// ==========================================================
// 📝 COTIZADOR WORD
// ==========================================================
function dibujarCotizador() {
    appDiv.innerHTML = `
    <div class="min-h-screen p-2 text-black bg-zinc-200">
        <div class="max-w-4xl mx-auto">
            <div class="bg-zinc-900 p-4 text-white flex justify-between items-center rounded-2xl mb-4">
                <h2 class="text-sm font-black italic">GESTOR DE DOCUMENTOS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            
            <div class="grid grid-cols-2 gap-2 mb-4">
                <button onclick="window.setDocType('COTIZACION TECNICA')" class="bg-zinc-800 text-white font-bold py-3 rounded-xl shadow active:scale-95 text-xs uppercase">MODO COTIZACION</button>
                <button onclick="window.setDocType('RECIBO DE PAGO')" class="bg-green-600 text-white font-bold py-3 rounded-xl shadow active:scale-95 text-xs uppercase">MODO RECIBO</button>
            </div>
            
            <button onclick="window.generarPDF()" class="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg mb-4">GENERAR DOCUMENTO PDF</button>
            <p class="text-[10px] font-bold text-zinc-500 uppercase text-center mb-2">EL ENCABEZADO ES EDITABLE.</p>
            
            <div class="overflow-x-auto w-full pb-10">
                <div id="hoja-pdf" class="bg-white text-black shadow-2xl mx-auto flex flex-col" style="width:210mm;min-height:295mm;box-sizing:border-box;padding:15mm 20mm;font-family:Arial;">
                    
                    <div style="border-bottom:4px solid #cc0000;padding-bottom:10px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;">
                        <div>
                            <img id="pdf-logo" src="logo-blanco.jpg" style="max-height:90px; object-fit: contain;">
                        </div>
                        <div style="text-align:right; color:#333;">
                            <p id="doc-title" contenteditable="true" style="margin:0;font-weight:900;font-size:18px;outline:none;">COTIZACION TECNICA</p>
                            <p style="margin:0;font-size:14px;">Santa Cruz, ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div id="zona-editable" contenteditable="true" style="outline:none;font-size:15px;line-height:1.6;flex-grow:1;text-align:justify;">
                        <p style="color:#999;text-align:center;margin-top:50px;">--- Ingrese la descripcion del presupuesto ---</p>
                    </div>
                    
                    <div style="margin-top:30px;border-top:2px solid #999;padding-top:15px;display:flex;justify-content:space-between;page-break-inside:avoid;color:#333;">
                        <div>
                            <p style="margin:0;font-weight:bold;font-size:14px;">WRPUMA - Ingenieria en Pintura e Impermeabilizaciones</p>
                            <p style="margin:0;font-size:12px;">Plan 3000 Av. Piraisito N° 8560</p>
                            <p style="margin:0;font-size:12px;">Cel.: 77396806, 76362867</p>
                        </div>
                        <div style="text-align:right;">
                            <p style="margin:0;font-size:12px;">wrpuma@gmail.com</p>
                            <p style="margin:0;font-size:12px;">www.wrpuma.com</p>
                            <p style="margin:0;font-size:13px;font-weight:bold;color:#cc0000;font-style:italic;margin-top:4px;">Dando el toque final a su construccion</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>`;

    setTimeout(() => {
        const z = document.getElementById('zona-editable');
        if (z) z.onpaste = (e) => {
            e.preventDefault();
            let t = (e.originalEvent || e).clipboardData.getData('text/plain');
            t = t.replace(/\\text\{/g, "").replace(/\}/g, "").replace(/\$/g, "").replace(/\^2/g, "2").replace(/\*/g, "").replace(/#/g, "");

            let lineas = t.split('\n'), h = "", enT = false, cab = false;
            lineas.forEach(l => {
                l = l.trim(); if (l === '---' || l === '***' || l.includes('-------')) return;

                if (l.startsWith('|') && l.endsWith('|')) {
                    if (l.includes('---')) return;
                    if (!enT) { h += '<table style="width:100%;border-collapse:collapse;margin:20px 0;border:1px solid #000;font-size:13px;"><tbody>'; enT = true; cab = true; }
                    h += '<tr>';
                    l.split('|').filter((c, i, a) => i !== 0 && i !== a.length - 1).forEach(c => h += `<td style="border:1px solid #000;padding:8px;${cab ? 'font-weight:900;background:#333;color:#fff;text-align:center;' : ''}">${c.trim()}</td>`);
                    h += '</tr>'; cab = false;
                } else {
                    if (enT) { h += '</tbody></table>'; enT = false; }
                    if (l !== "") {
                        if (l.length < 120 && l === l.toUpperCase() && !l.startsWith('HTTP')) {
                            h += `<p style="margin:15px 0 5px;font-weight:900;font-size:16px;color:#cc0000;">${l}</p>`;
                        } else {
                            h += `<p style="margin:6px 0; text-align:justify;">${l}</p>`;
                        }
                    }
                }
            });
            if (enT) h += '</tbody></table>'; z.innerHTML = h;
        };
    }, 200);
}

window.setDocType = (t) => document.getElementById('doc-title').innerText = t;

window.generarPDF = () => {
    const boton = event.target;
    const textoOriginal = boton.innerText;
    boton.innerText = "PROCESANDO DOCUMENTO...";
    boton.disabled = true;

    setTimeout(() => {
        html2pdf().set({
            margin: 0,
            filename: `Doc_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4' }
        }).from(document.getElementById('hoja-pdf')).save().then(() => {
            boton.innerText = textoOriginal;
            boton.disabled = false;
        });
    }, 1000);
};

// ==========================================================
// 🚀 MENU Y ENRUTADOR (SEGURIDAD DE NIVELES)
// ==========================================================
function dibujarMenu() {
    const u = localStorage.getItem('u_wr');
    const adm = localStorage.getItem('a_wr') === 'true';
    const empresa = localStorage.getItem('empresa_wr') || 'Walter';

    if (!u) { window.location.hash = ''; return; }

    const tituloMenu = empresa === 'Napoleon' ? 'NAPO<span class="text-blue-500">LEON</span>' : 'WR<span class="text-red-600">PUMA</span>';

    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-6 text-white text-center flex flex-col justify-between font-sans">
        <div>
            <h1 class="text-5xl font-black italic mb-2 tracking-tighter uppercase text-white">${tituloMenu}</h1>
            <p class="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.3em] mb-8">Elite Management</p>
            <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto text-black text-left">
                <button onclick="window.location.hash='#asistencia'" class="bg-red-600 text-white aspect-square rounded-3xl flex flex-col items-center justify-center shadow-lg active:scale-95 italic"><span class="font-black text-[12px] uppercase mt-2">Asistencia</span></button>
                
                ${adm ? `
                <button onclick="window.location.hash='#planilla'" class="bg-zinc-900 text-white aspect-square rounded-3xl flex flex-col items-center justify-center border border-zinc-800 active:scale-95 shadow-xl italic"><span class="font-black text-[12px] uppercase mt-2">Sueldos</span></button>
                <button onclick="window.location.hash='#obras'" class="bg-zinc-900 text-white aspect-square rounded-3xl flex flex-col items-center justify-center border border-zinc-800 active:scale-95 shadow-xl italic"><span class="font-black text-[12px] uppercase mt-2">Proyectos</span></button>
                <button onclick="window.location.hash='#personal'" class="bg-zinc-100 text-black aspect-square rounded-3xl flex flex-col items-center justify-center shadow-xl italic"><span class="font-black text-[12px] uppercase mt-2">Personal</span></button>
                <button onclick="window.location.hash='#almacen'" class="bg-orange-600 text-white aspect-square rounded-3xl flex flex-col items-center justify-center shadow-xl italic"><span class="font-black text-[12px] uppercase mt-2">Almacen</span></button>
                ` : `
                <div class="bg-zinc-950 text-zinc-700 aspect-square rounded-3xl flex flex-col items-center justify-center border border-zinc-900 shadow-inner italic cursor-not-allowed"><span class="font-black text-[10px] uppercase mt-2">Acceso Denegado</span></div>
                <div class="bg-zinc-950 text-zinc-700 aspect-square rounded-3xl flex flex-col items-center justify-center border border-zinc-900 shadow-inner italic cursor-not-allowed"><span class="font-black text-[10px] uppercase mt-2">Acceso Denegado</span></div>
                <div class="bg-zinc-950 text-zinc-700 aspect-square rounded-3xl flex flex-col items-center justify-center border border-zinc-900 shadow-inner italic cursor-not-allowed"><span class="font-black text-[10px] uppercase mt-2">Acceso Denegado</span></div>
                `}

                <button onclick="window.location.hash='#cotizaciones'" class="col-span-2 bg-white h-20 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 shadow-lg border-b-4 border-zinc-300"><span class="font-black text-[11px] uppercase text-red-600">Generar Documentos Word</span></button>
                <button onclick="window.location.hash='#calculadora'" class="col-span-2 bg-blue-600 text-white h-20 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 shadow-lg border-b-4 border-blue-800 mt-[-10px]"><span class="font-black text-[11px] uppercase text-white">Calculadora Operativa</span></button>
                
                ${adm ? `<button onclick="window.location.hash='#contabilidad'" class="col-span-1 bg-green-600 text-white h-16 rounded-2xl flex items-center justify-center gap-2 active:scale-95 shadow-lg font-black text-[10px] uppercase italic">Egresos</button><button onclick="window.location.hash='#utilidad'" class="col-span-1 bg-zinc-900 text-red-500 h-16 rounded-2xl flex items-center justify-center gap-2 border border-zinc-800 active:scale-95 shadow-lg font-black text-[10px] uppercase italic">Reporte Financiero</button>` : `<div class="col-span-2 h-16 rounded-2xl flex items-center justify-center bg-zinc-950 text-zinc-700 text-[10px] uppercase">Seccion Restringida</div>`}
            </div>
        </div>
        <button onclick="window.cerrarSesionTotal()" class="text-zinc-700 text-[10px] font-bold uppercase pt-4 border-t border-zinc-900 italic mt-8">FINALIZAR SESION</button>
    </div>`;
}

window.cerrarSesionTotal = () => {
    localStorage.clear();
    window.location.hash = '';
    window.location.reload();
};

function enrutador() {
    const h = window.location.hash;
    const adm = localStorage.getItem('a_wr') === 'true';
    const u = localStorage.getItem('u_wr');

    if (!u && h !== '') { window.location.hash = ''; return; }

    if (h === '#asistencia') dibujarAsistencia();
    else if (h === '#cotizaciones') dibujarCotizador();
    else if (h === '#calculadora') dibujarCalculadora();
    else if (h === '#menu') dibujarMenu();
    else if (!adm && (h === '#planilla' || h === '#obras' || h === '#personal' || h === '#utilidad' || h === '#contabilidad' || h === '#almacen')) {
        alert("ACCESO DENEGADO: Nivel de seguridad insuficiente.");
        window.location.hash = '#menu';
    }
    else if (h === '#planilla') dibujarPlanilla();
    else if (h === '#obras') dibujarObras();
    else if (h === '#personal') dibujarPersonal();
    else if (h === '#almacen') dibujarAlmacen();
    else if (h === '#utilidad') dibujarUtilidad();
    else if (h === '#contabilidad') dibujarCaja();
    else dibujarAcceso();
}

function dibujarAcceso() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center font-sans">
        <h1 class="text-6xl font-black italic mb-2 tracking-tighter text-white uppercase">WR<span class="text-red-600">PUMA</span></h1>
        <p class="text-zinc-500 font-bold tracking-[0.4em] mb-12 uppercase text-[10px]">Gestion Empresarial</p>
        <div class="grid gap-4 w-full max-w-xs text-black">
            <button onclick="window.verAccesoPro('walter')" class="bg-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform border-2 border-red-800">ACCESO GERENCIA</button>
            <button onclick="window.verAccesoPro('napoleon')" class="bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform border-2 border-blue-800">ACCESO DIRECCION</button>
            <button onclick="window.verAccesoPro('super')" class="bg-zinc-800 text-zinc-300 py-3 rounded-2xl font-black text-sm border border-zinc-700 active:scale-95 transition-transform mt-4">ACCESO SUPERVISOR</button>
        </div>
    </div>`;
}

window.addEventListener('hashchange', enrutador); window.addEventListener('load', enrutador); enrutador();
