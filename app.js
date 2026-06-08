// ==========================================================
// 🚀 WRPUMA ELITE MANAGEMENT - CORE SYSTEM (PRO VERSION)
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
// 🔐 MÓDULO DE ACCESO Y SEGURIDAD
// ==========================================================
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
// 📍 PANEL TRABAJADOR (ASISTENCIA GPS Y SOLICITUDES)
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
                nombre: n, obra: "POR ASIGNAR", gps_registro: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, hora_registro: new Date().toLocaleTimeString(), jornada_normal: 1
            }).then(() => { alert(`✅ ASISTENCIA REGISTRADA EXITOSAMENTE.\nHora: ${new Date().toLocaleTimeString()}\nSu supervisor lo asignará a la obra correspondiente.`); });
        }, (error) => { alert("❌ Error: No se pudo obtener la ubicación. Debe activar el GPS en su celular para marcar asistencia."); });
    } else { alert("❌ Su navegador no soporta geolocalización."); }
};

window.pedirMaterialTrabajador = () => {
    const mat = prompt("¿Qué materiales o herramientas necesita en su obra?\n(Ej: 2 baldes de látex, 1 brocha de 4 pulg)");
    if(mat && mat.trim() !== "") {
        const n = localStorage.getItem('u_wr');
        firebase.database().ref(getDbPath(`solicitudes/SOL_MAT_${Date.now()}`)).set({ tipo: 'MATERIAL', trabajador: n, detalle: mat, fecha: new Date().toLocaleString(), estado: 'Pendiente' }).then(() => alert("✅ Pedido de material enviado a Gerencia."));
    }
};

window.pedirAnticipoTrabajador = () => {
    const monto = prompt("¿De cuánto es el anticipo que solicita? (Bs.)");
    if(monto && !isNaN(monto) && monto > 0) {
        const motivo = prompt("Breve motivo de la solicitud:");
        const n = localStorage.getItem('u_wr');
        firebase.database().ref(getDbPath(`solicitudes/SOL_ANT_${Date.now()}`)).set({ tipo: 'ANTICIPO', trabajador: n, detalle: `Monto: Bs. ${monto} | Motivo: ${motivo || 'Sin detalle'}`, fecha: new Date().toLocaleString(), estado: 'Pendiente' }).then(() => alert("✅ Solicitud de anticipo enviada a Gerencia."));
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
        const sol = snap.val() || {}; let hayPendientes = false;
        Object.keys(sol).forEach(id => {
            const s = sol[id];
            if (s.estado === 'Pendiente') {
                hayPendientes = true;
                const color = s.tipo === 'MATERIAL' ? 'blue' : 'green';
                c.innerHTML += `
                <div class="p-4 bg-${color}-50 rounded-2xl border-2 border-${color}-200 shadow-sm relative">
                    <div class="flex justify-between items-start mb-2">
                        <div><b class="text-sm uppercase text-black font-black">${s.trabajador}</b><br><span class="text-[9px] text-zinc-500 font-bold uppercase">${s.fecha}</span></div>
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
window.marcarSolicitudLeida = (id) => { firebase.database().ref(getDbPath(`solicitudes/${id}`)).update({ estado: 'Atendido' }); };

// ==========================================================
// 🏗️ MÓDULO OBRAS (CONECTADO 100%)
// ==========================================================
function dibujarObras() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-zinc-900 p-6 text-white flex justify-between items-center rounded-t-3xl shadow-lg">
                <h2 class="text-xl font-black italic uppercase">CONTROL DE OBRAS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs shadow-md">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl">
                <input id="o-nom" type="text" placeholder="NOMBRE DEL PROYECTO" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black mb-2">
                <input id="o-pre" type="number" placeholder="PRESUPUESTO TOTAL Bs." class="w-full p-3 rounded-xl border-2 font-bold text-black mb-3">
                <button onclick="window.saveO()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all">REGISTRAR PROYECTO</button>
                <h3 class="mt-8 mb-4 font-black text-black uppercase text-sm border-b-2 pb-2">PROYECTOS ACTIVOS</h3>
                <div id="list-o-activas" class="space-y-4">Cargando datos...</div>
            </div>
        </div>
    </div>`;

    firebase.database().ref(getDbPath('obras')).on('value', snap => {
        const cA = document.getElementById('list-o-activas');
        if (!cA) return;
        cA.innerHTML = '';
        const obs = snap.val() || {};
        Object.keys(obs).forEach(id => {
            const o = obs[id];
            if(o.estado !== 'Archivada') {
                cA.innerHTML += `
                <div class="p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-300 shadow-sm relative">
                    <b class="text-xl uppercase text-red-600">${o.nombre}</b>
                    <p class="text-[10px] font-bold text-zinc-500">PRESUPUESTO: Bs. ${o.presupuesto}</p>
                    <button onclick="window.delO('${id}')" class="text-red-500 text-[10px] font-black underline mt-2">Borrar Proyecto</button>
                </div>`;
            }
        });
    });
}
window.saveO = () => { 
    const n = document.getElementById('o-nom').value.trim(); const p = document.getElementById('o-pre').value; 
    if (n && p) { firebase.database().ref(getDbPath('obras')).push({ nombre: n.toUpperCase(), presupuesto: p, estado: 'Activa' }); document.getElementById('o-nom').value=''; document.getElementById('o-pre').value=''; } else { alert("Complete los campos."); }
};
window.delO = (id) => { if (confirm("¿Confirmar eliminación?")) firebase.database().ref(getDbPath(`obras/${id}`)).remove(); };

// ==========================================================
// 👷 MÓDULO PERSONAL (CONECTADO 100%)
// ==========================================================
function dibujarPersonal() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-zinc-800 p-6 text-white flex justify-between items-center rounded-t-3xl">
                <h2 class="text-xl font-black italic uppercase text-white">EQUIPO DE TRABAJO</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl space-y-4">
                <input id="p-nom" type="text" placeholder="NOMBRE DEL PERSONAL" class="w-full p-3 rounded-xl border-2 uppercase font-bold text-black text-sm">
                <input id="p-sue" type="number" placeholder="PAGO DIARIO Bs." class="w-full p-3 rounded-xl border-2 font-bold text-black text-sm">
                <button onclick="window.saveP()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">REGISTRAR PERSONAL</button>
                <div id="list-p" class="space-y-3 pt-4 border-t">Cargando...</div>
            </div>
        </div>
    </div>`;
    firebase.database().ref(getDbPath('personal')).on('value', snap => {
        const c = document.getElementById('list-p'); if (!c) return; c.innerHTML = ''; const personal = snap.val() || {};
        Object.keys(personal).forEach(n => { c.innerHTML += `<div class="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center border text-black uppercase shadow-sm"><div><b class="text-sm">${n}</b><br><span class="text-[10px] text-zinc-500 font-bold">Salario Diario: Bs. ${personal[n].sueldo_dia}</span></div><button onclick="window.delP('${n}')" class="text-red-600 font-black px-3 py-2 bg-red-100 rounded-lg active:scale-90 text-xs">ELIMINAR</button></div>`; });
    });
}
window.saveP = () => { const n = document.getElementById('p-nom').value.trim().toUpperCase(), s = document.getElementById('p-sue').value; if (n && s) { firebase.database().ref(getDbPath(`personal/${n}`)).set({ sueldo_dia: s }); document.getElementById('p-nom').value = ''; document.getElementById('p-sue').value = ''; } };
window.delP = (n) => { if (confirm(`¿Proceder con la eliminación?`)) firebase.database().ref(getDbPath(`personal/${n}`)).remove(); };

// ==========================================================
// 📝 COTIZADOR PDF (CONECTADO Y LISTO PARA MAÑANA)
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
                <button onclick="window.setDocType('COTIZACION TECNICA')" class="bg-zinc-800 text-white font-bold py-2 rounded-xl shadow active:scale-95 text-[10px] uppercase">COTIZACION</button>
                <button onclick="window.setDocType('RECIBO DE PAGO')" class="bg-green-600 text-white font-bold py-2 rounded-xl shadow active:scale-95 text-[10px] uppercase">RECIBO</button>
                <button onclick="window.modoGarantia()" class="bg-yellow-600 text-white font-black py-2 rounded-xl shadow-lg active:scale-95 text-[10px] uppercase">GARANTIA</button>
            </div>
            
            <button onclick="window.arreglarFormato()" class="w-full bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg active:scale-95 text-[12px] uppercase mb-4 border-b-4 border-blue-800">🪄 1. ARREGLAR TABLAS DEL TEXTO</button>
            <button onclick="window.generarPDF()" class="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg mb-4">📥 2. GENERAR DOCUMENTO PDF</button>
            
            <div class="overflow-x-auto w-full pb-10">
                <div id="hoja-pdf" class="bg-white text-black shadow-2xl mx-auto flex flex-col relative" style="width:210mm;min-height:295mm;box-sizing:border-box;padding:15mm 20mm;font-family:Arial; background-color: white;">
                    <div style="border-bottom:4px solid #cc0000;padding-bottom:10px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;">
                        <div style="background:#cc0000; color:#fff; font-weight:900; font-size:24px; padding:10px; border-radius:5px;">WRPUMA</div>
                        <div style="text-align:right; color:#000;">
                            <p id="doc-title" contenteditable="true" style="margin:0;font-weight:900;font-size:18px;outline:none;color:#000;">COTIZACION TECNICA</p>
                            <p style="margin:0;font-size:14px;color:#000;">Santa Cruz, ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div id="zona-editable" contenteditable="true" style="outline:none;font-size:15px;line-height:1.6;flex-grow:1;text-align:justify;color:#000;">
                        <p style="text-align:center; color:#999; margin-top:50px;">--- Pegue aquí la cotización ---</p>
                    </div>
                    <div style="margin-top:30px;border-top:2px solid #000;padding-top:15px;display:flex;justify-content:space-between;page-break-inside:avoid;color:#000;">
                        <div><p style="margin:0;font-weight:bold;font-size:14px;color:#000;">WRPUMA - Ingenieria en Pintura e Impermeabilizaciones</p><p style="margin:0;font-size:12px;color:#000;">Cel.: 77396806, 76362867</p></div>
                        <div style="text-align:right;"><p style="margin:0;font-size:12px;color:#000;">wrpuma@gmail.com</p><p style="margin:0;font-size:13px;font-weight:bold;color:#cc0000;font-style:italic;margin-top:4px;">Dando el toque final a su construccion</p></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

window.setDocType = (t) => { document.getElementById('doc-title').innerText = t; document.getElementById('zona-editable').innerHTML = '<p style="text-align:center; color:#999; margin-top:50px;">--- Pegue aquí la cotización ---</p>'; };

window.arreglarFormato = () => {
    const z = document.getElementById('zona-editable');
    let texto = z.innerText;
    if(texto.includes('|')) {
        let nuevoHTML = '<table style="width:100%; border-collapse:collapse; margin:15px 0; font-size:13px; color:#000;">';
        texto.split('\n').forEach(linea => {
            if (linea.includes('|')) {
                nuevoHTML += '<tr style="border:1px solid #000;">';
                linea.split('|').forEach(celda => { nuevoHTML += `<td style="border:1px solid #000; padding:6px; color:#000;">${celda.trim()}</td>`; });
                nuevoHTML += '</tr>';
            }
        });
        nuevoHTML += '</table>';
        z.innerHTML = nuevoHTML;
    }
};

window.modoGarantia = () => { document.getElementById('doc-title').innerText = 'CERTIFICADO DE GARANTIA'; document.getElementById('zona-editable').innerHTML = `<p><b>PROYECTO:</b> [Obra]</p><p><b>CLIENTE:</b> [Nombre]</p><p>WRPUMA certifica la calidad técnica por UN (1) AÑO.</p>`; };

window.generarPDF = () => {
    const elemento = document.getElementById('hoja-pdf');
    if (!elemento) { alert("Error: No se encuentra el área de impresión."); return; }
    const opt = { margin: 0.3, filename: 'Cotizacion_WRPUMA.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
    html2pdf().set(opt).from(elemento).save();
};


// ==========================================================
// 🚀 MENU MAESTRO Y ENRUTADOR (NUCLEO)
// ==========================================================
function dibujarMenu() {
    const rol = localStorage.getItem('rol_wr');
    if (!rol) { window.location.hash = ''; return; }
    const empresa = localStorage.getItem('empresa_wr') || 'Walter';
    const tituloMenu = empresa === 'Napoleon' ? 'NAPO<span class="text-blue-500">LEON</span>' : 'WR<span class="text-red-600">PUMA</span>';

    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-6 text-white text-center flex flex-col justify-between font-sans pb-10">
        <div>
            <h1 class="text-5xl font-black italic mb-2 tracking-tighter uppercase text-white">${tituloMenu}</h1>
            <p class="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.3em] mb-6">Elite Management ${rol === 'super' ? '- SUPERVISOR' : ''}</p>
            
            ${rol === 'admin' ? `
            <div class="mb-6 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-left">
                <label class="text-[9px] text-blue-400 font-bold uppercase mb-1 block">📌 Fijar Mensaje del Día para Trabajadores:</label>
                <div class="flex gap-2">
                    <input id="input-msg-dia" type="text" placeholder="Ej: Hoy toca avance en obra Onix." class="w-full bg-black text-white p-2 rounded outline-none text-xs border border-zinc-800">
                    <button onclick="window.guardarMsgDia()" class="bg-blue-600 text-white px-3 rounded font-bold text-xs">Fijar</button>
                </div>
            </div>
            <button id="btn-solicitudes" onclick="window.location.hash='#solicitudes'" class="hidden w-full mb-4 bg-orange-500 text-black py-3 rounded-2xl font-black text-xs uppercase animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.5)] border-2 border-orange-300">⚠️ Pedidos de Material</button>
            ` : ``}

            <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto text-black text-left">
                <button onclick="window.location.hash='#asistencia'" class="bg-red-600 text-white aspect-square rounded-3xl flex flex-col items-center justify-center shadow-lg active:scale-95 italic"><span class="font-black text-[12px] uppercase mt-2">Asistencia</span></button>
                <button onclick="window.location.hash='#obras'" class="bg-zinc-900 text-white aspect-square rounded-3xl border border-zinc-800 active:scale-95 shadow-xl italic"><span class="font-black text-[12px] uppercase mt-2">Proyectos</span></button>
                <button onclick="window.location.hash='#personal'" class="bg-zinc-100 text-black aspect-square rounded-3xl flex flex-col items-center justify-center shadow-xl italic"><span class="font-black text-[12px] uppercase mt-2">Personal</span></button>
                <button onclick="window.location.hash='#cotizaciones'" class="col-span-2 bg-white h-20 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 shadow-lg border-b-4 border-zinc-300"><span class="font-black text-[11px] uppercase text-red-600">Generar Documentos Word / PDF</span></button>
            </div>
        </div>
        <button onclick="window.cerrarSesionTotal()" class="text-zinc-700 text-[10px] font-bold uppercase pt-4 border-t border-zinc-900 italic mt-8">FINALIZAR SESION</button>
    </div>`;

    if(rol === 'admin') {
        firebase.database().ref(getDbPath('config/mensaje_dia')).once('value').then(snap => { const inputMsg = document.getElementById('input-msg-dia'); if(inputMsg) inputMsg.value = snap.val() || ""; });
        firebase.database().ref(getDbPath('solicitudes')).once('value').then(snap => {
            let haySol = false; const sol = snap.val() || {}; Object.keys(sol).forEach(k => { if(sol[k].estado === 'Pendiente') haySol = true; });
            if(haySol && document.getElementById('btn-solicitudes')) document.getElementById('btn-solicitudes').classList.remove('hidden');
        });
    }
}

window.guardarMsgDia = () => { firebase.database().ref(getDbPath('config/mensaje_dia')).set(document.getElementById('input-msg-dia').value).then(()=>{ alert("Mensaje fijado para todo el personal."); }); };
window.cerrarSesionTotal = () => { localStorage.clear(); window.location.hash = ''; location.reload(); };

function enrutador() {
    const h = window.location.hash, rol = localStorage.getItem('rol_wr');
    if (!rol && h !== '') { window.location.hash = ''; return; }
    if (rol === 'trabajador' && h !== '#panel-trabajador') { window.location.hash = '#panel-trabajador'; return; }
    
    if (h === '#panel-trabajador') dibujarPanelTrabajador();
    else if (h === '#solicitudes') dibujarSolicitudes();
    else if (h === '#asistencia') dibujarAsistencia(); 
    else if (h === '#cotizaciones') dibujarCotizador();
    else if (h === '#menu') dibujarMenu();
    else if (h === '#obras') dibujarObras();
    else if (h === '#personal') dibujarPersonal(); 
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
            <div class="border-t border-zinc-800 pt-4 mt-2">
                <button onclick="window.verAccesoPro('trabajador')" class="w-full bg-zinc-900 text-green-500 py-4 rounded-2xl font-black text-xs border border-zinc-800 active:scale-95 transition-transform uppercase shadow-[0_0_15px_rgba(34,197,94,0.1)]">👤 ACCESO TRABAJADOR / ASISTENCIA</button>
            </div>
        </div>
    </div>`;
}

window.addEventListener('hashchange', enrutador); window.addEventListener('load', enrutador); enrutador();
