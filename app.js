// ==========================================================
// 🚀 WRPUMA ELITE MANAGEMENT - FULL PRO VERSION
// ==========================================================
import * as data from './data.js';

const appDiv = document.getElementById('app');
let obraSel = "GENERAL";

// 🔗 AQUÍ PEGA LA URL DE SU WEBHOOK DE N8N O ZAPIER
const WEBHOOK_URL_N8N = "https://hook.us2.make.com/wa7jjt78bh7vtxv0lzxlin37kta9bld3";
const getLocalISODate = (dateObj = new Date()) => {
    const z = dateObj.getTimezoneOffset() * 60000;
    return new Date(dateObj - z).toISOString().split('T')[0];
};

let fechaSel = getLocalISODate();
window.carritoPresupuesto = [];
window.aplicarMultaSalida = true;
window.aplicarMultaAtraso = false; // POR DEFECTO APAGADO PARA NO PERJUDICAR LA PLANILLA ACTUAL

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
// 📡 MOTOR DE ALERTAS WHATSAPP (CAPATAZ VIRTUAL)
// ==========================================================
window.dispararAlertaWhatsApp = (mensajeAlerta) => {
    if (WEBHOOK_URL_N8N && WEBHOOK_URL_N8N.includes("http")) {
        fetch(WEBHOOK_URL_N8N, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                empresa: "WRPUMA", 
                alerta: mensajeAlerta, 
                fecha_hora: new Date().toLocaleString() 
            })
        }).then(response => {
            if(response.ok) {
                console.log("Alerta disparada al Webhook correctamente.");
            }
        }).catch(err => {
            alert("❌ Alerta de Control: Hubo un fallo enviando la notificación al servidor central.");
            console.log("Webhook no enviado (revisar URL o conexión):", err);
        });
    }
};

// ==========================================================
// 🔒 MÓDULO DE SEGURIDAD WRPUMA (FIREBASE AUTH)
// ==========================================================

const USUARIOS_AUTORIZADOS = {
    "walter@wrpuma.com":   { empresa: "Walter",   rol: "admin", nombre: "Walter" },
    // "napoleon@wrpuma.com": { empresa: "Napoleon", rol: "admin", nombre: "Napoleon" },
};

window.verAccesoPro = (usuario) => {
    if (usuario === 'walter' || usuario === 'napoleon' || usuario === 'super') {
        const pass = prompt("PIN de seguridad (Modo Operativo):");
        
        if (pass === "2345") {
            // Bypass de emergencia: Carga directa sin Google
            let perfil;
            if (usuario === 'walter') {
                perfil = { empresa: "Walter", rol: "admin", nombre: "Walter" };
            } else if (usuario === 'napoleon') {
                perfil = { empresa: "Napoleon", rol: "admin", nombre: "Napoleon" };
            }
            
            iniciarSesion(perfil); 
        } else {
            alert("Acceso denegado. PIN incorrecto.");
        }
    }
};
window.cerrarSesionTotal = () => {
    if (firebase.auth().currentUser) {
        firebase.auth().signOut().then(() => {
            localStorage.clear();
            location.reload();
        }).catch(() => {
            localStorage.clear();
            location.reload();
        });
    } else {
        localStorage.clear();
        location.reload();
    }
};

// ==========================================================
// 📍 PANEL TRABAJADOR Y MOTOR DE ASISTENCIA GEOESPACIAL PRO
// ==========================================================
function dibujarPanelTrabajador() {
    const n = localStorage.getItem('u_wr');
    let pendientes = JSON.parse(localStorage.getItem('asistencias_offline') || '[]');
    let btnSync = pendientes.length > 0 ? `<button onclick="window.sincronizarOffline()" class="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black text-[12px] uppercase shadow-[0_0_15px_rgba(234,179,8,0.5)] border-b-4 border-yellow-700 animate-pulse mb-4">⚠️ TIENES ${pendientes.length} MARCAS SIN INTERNET - TOCA AQUÍ PARA ENVIARLAS AL SISTEMA</button>` : '';

    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-950 p-4 text-white font-sans flex flex-col justify-between pb-10">
        <div>
            <div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-black italic uppercase text-red-600">WRPUMA</h2><button onclick="window.cerrarSesionTotal()" class="bg-zinc-800 text-xs px-3 py-1 rounded-full font-bold">SALIR</button></div>
            <div class="bg-zinc-900 p-5 rounded-3xl shadow-xl text-center mb-6"><p class="text-[10px] text-zinc-500 font-bold uppercase mb-1">BIENVENIDO</p><h3 class="text-2xl font-black uppercase text-white">${n}</h3></div>
            <div class="bg-blue-900/30 p-5 rounded-3xl shadow-xl mb-6 text-center"><p class="text-[10px] text-blue-400 font-bold uppercase mb-2">📌 DIRECTIVA DE HOY</p><p id="msg-dia-display" class="text-sm font-bold text-white italic">Cargando...</p></div>
            
            <div id="estado-actual-trabajador" class="bg-zinc-900 p-4 rounded-2xl mb-4 text-center border border-zinc-800">
                <span class="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Estado Actual de Asistencia</span>
                <span class="text-sm font-black text-white animate-pulse">Consultando satélite...</span>
            </div>

            ${btnSync}

            <div class="grid grid-cols-2 gap-3">
                <button onclick="window.marcarGPS('ENTRADA_URUBO')" class="col-span-1 bg-green-600 text-white py-6 rounded-3xl font-black text-[14px] shadow-[0_0_15px_rgba(34,197,94,0.3)] border-b-4 border-green-800 flex flex-col items-center justify-center">
                    <span class="text-[10px] mb-1 opacity-80 uppercase tracking-widest">ENTRADA</span>
                    <span>☀️ URUBÓ</span>
                </button>
                <button onclick="window.marcarGPS('ENTRADA_OTRAS')" class="col-span-1 bg-emerald-600 text-white py-6 rounded-3xl font-black text-[14px] shadow-md border-b-4 border-emerald-800 flex flex-col items-center justify-center">
                    <span class="text-[10px] mb-1 opacity-80 uppercase tracking-widest">ENTRADA</span>
                    <span>☀️ OTRAS OBRAS</span>
                </button>
                <button onclick="window.marcarGPS('SALIDA')" class="col-span-2 bg-red-600 text-white py-6 rounded-3xl font-black text-[16px] shadow-[0_0_15px_rgba(239,68,68,0.3)] border-b-4 border-red-800 flex flex-col items-center mt-1">
                    <span>🌙 MARCAR SALIDA</span>
                </button>
                
                <button onclick="window.pedirMaterialTrabajador()" class="bg-transparent border-2 border-blue-500 text-blue-400 py-4 rounded-2xl font-black text-[11px] uppercase shadow-sm flex flex-col items-center justify-center gap-1 mt-2">
                    <span class="text-xl">🏗️</span><span>Pedir Material</span>
                </button>
                <button onclick="window.pedirAnticipoTrabajador()" class="bg-transparent border-2 border-zinc-500 text-zinc-400 py-4 rounded-2xl font-black text-[11px] uppercase shadow-sm flex flex-col items-center justify-center gap-1 mt-2">
                    <span class="text-xl">💰</span><span>Pedir Anticipo</span>
                </button>
            </div>
        </div>
    </div>`;
    firebase.database().ref(getDbPath('config/mensaje_dia')).on('value', snap => { document.getElementById('msg-dia-display').innerText = snap.val() || "Mantener orden y limpieza."; });
    
    // LISTENER PARA EL ESTADO EN VIVO
    firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).on('value', snap => {
        const r = snap.val();
        const caja = document.getElementById('estado-actual-trabajador');
        if(!caja) return;
        if(r && r.hora_salida) {
            caja.innerHTML = `<span class="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Estado Actual de Asistencia</span><span class="text-[13px] font-black text-red-500">🌙 JORNADA FINALIZADA (${r.hora_salida})</span>`;
        } else if (r && r.hora_entrada) {
            caja.innerHTML = `<span class="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Estado Actual de Asistencia</span><span class="text-[13px] font-black text-green-400">☀️ EN OBRA: ${r.obra || 'General'} (${r.hora_entrada})</span>`;
        } else {
            caja.innerHTML = `<span class="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Estado Actual de Asistencia</span><span class="text-[13px] font-black text-yellow-500">⚠️ FUERA DE LA OBRA / SIN MARCAR</span>`;
        }
    });
}

window.marcarGPS = (tipo) => {
    // PROTECCIÓN ANTES DE AUDITAR EL GPS
    if (tipo === 'SALIDA') {
        if (!confirm("¿SEGURO QUE TERMINASTE TU JORNADA?\n\nEsta acción registrará tu hora final y cerrará tu asistencia por hoy.")) return;
    }

    if (!navigator.geolocation) return alert("❌ Su teléfono no soporta GPS.");
    alert(`📍 Auditando ubicación y hora...`);

    navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude, n = localStorage.getItem('u_wr');
        const ahora = new Date();
        const timeStr = ahora.toLocaleTimeString();
        const gpsStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        const horaNum = ahora.getHours() + (ahora.getMinutes() / 60);
        const diaSemana = ahora.getDay();
        
        if (!navigator.onLine) {
            let pendientes = JSON.parse(localStorage.getItem('asistencias_offline') || '[]');
            pendientes.push({ tipo, lat, lng, n, timeStr, gpsStr, horaNum, fecha: fechaSel, dia_semana: diaSemana });
            localStorage.setItem('asistencias_offline', JSON.stringify(pendientes));
            dibujarPanelTrabajador(); 
            return alert("⚠️ MODO SIN SEÑAL (OFFLINE)\nTu registro se guardó en la memoria local de tu teléfono.\nCuando tengas señal de red móvil o WiFi, presiona el botón amarillo 'SINCRONIZAR' en tu pantalla para enviarlo al sistema de control.");
        }

        window.procesarMarcaGPS(tipo, lat, lng, n, timeStr, gpsStr, horaNum, fechaSel, diaSemana, false);

    }, (err) => {
        if (err.code === 1) alert("❌ PERMISO DENEGADO: Active el GPS en su celular para marcar. Es obligatorio en WRPUMA.");
        else if (err.code === 2) alert("❌ GPS NO DISPONIBLE: Salga al exterior e intente nuevamente.");
        else if (err.code === 3) alert("❌ TIEMPO AGOTADO: El GPS tardó demasiado. Intente nuevamente en campo abierto.");
        else alert("❌ Error de GPS. Intente nuevamente.");
    }, {
        enableHighAccuracy: false, 
        timeout: 10000,             
        maximumAge: 60000           
    });
};

window.procesarMarcaGPS = (tipo, lat, lng, n, timeStr, gpsStr, horaNum, fSel, diaSemana, esSincronizacion) => {
    const updates = { nombre: n };

    firebase.database().ref(getDbPath(`asistencia_semanal/${fSel}/${n}`)).once('value').then(s => {
        let record = s.val() || {};

        // VALIDACIÓN DE SEGURIDAD 1: Doble Entrada
        if (tipo.includes('ENTRADA') && record.hora_entrada && !esSincronizacion) {
            if (!confirm(`⚠️ Ya tienes una entrada registrada a las ${record.hora_entrada} en ${record.obra}.\n\n¿Deseas SOBREESCRIBIR tu ubicación y hora de entrada actual?`)) {
                return; 
            }
        }

        // VALIDACIÓN DE SEGURIDAD 2: Salida Repetida
        if (tipo === 'SALIDA' && record.hora_salida && !esSincronizacion) {
            return alert("❌ Ya marcaste tu salida el día de hoy.");
        }

        // VALIDACIÓN DE SEGURIDAD 3: Salida sin Entrada (Evitar que se ponga en Cero por error)
        if (tipo === 'SALIDA' && !record.hora_entrada && !esSincronizacion) {
            if (!confirm("⚠️ ATENCIÓN: No tienes marcada tu ENTRADA de hoy.\nSi marcas salida ahora, el sistema anulará el día completo.\n\n¿Quieres marcar salida de todos modos?")) return;
        }

        firebase.database().ref(getDbPath('obras')).once('value').then(snap => {
            const obras = snap.val() || {};
            let obraAsignada = "POR ASIGNAR";
            let menorDistancia = Infinity;

            Object.values(obras).forEach(o => {
                if(o.estado !== 'Entregada' && o.latitud && o.longitud) {
                    const R = 6371e3; 
                    const r1 = lat * Math.PI/180; 
                    const r2 = parseFloat(o.latitud) * Math.PI/180;
                    const d1 = (parseFloat(o.latitud)-lat) * Math.PI/180; 
                    const d2 = (parseFloat(o.longitud)-lng) * Math.PI/180;
                    const a = Math.sin(d1/2)*Math.sin(d1/2) + Math.cos(r1)*Math.cos(r2)*Math.sin(d2/2)*Math.sin(d2/2);
                    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                    if(dist <= 100 && dist < menorDistancia) {
                        menorDistancia = dist;
                        obraAsignada = o.nombre;
                    }
                }
            });

            if (tipo === 'ENTRADA_OTRAS') {
                obraAsignada = "OTRAS OBRAS";
            } else if (tipo === 'SALIDA' && record.obra === "OTRAS OBRAS") {
                obraAsignada = "OTRAS OBRAS";
            }

            if (tipo !== 'SALIDA' && obraAsignada === "POR ASIGNAR") {
                return alert(`❌ OPERACIÓN REBOTADA${esSincronizacion ? ' (Marca Offline)' : ''}.\nEstás fuera de ruta. No se detecta ninguna obra activa a menos de 100 metros de tu ubicación.`);
            }

            if (tipo === 'ENTRADA_URUBO' || tipo === 'ENTRADA_OTRAS') {
                if(horaNum >= 8.01) {
                    updates.estado = 'ROJA';
                    updates.horas_atraso = parseFloat((horaNum - 8.00).toFixed(2));
                    if(!esSincronizacion) window.dispararAlertaWhatsApp(`⚠️ ATRASO CONFIRMADO: ${n} marcó ingreso tarde a las ${timeStr} en ${obraAsignada}.`);
                } else {
                    updates.estado = 'VERDE';
                }

                updates.hora_entrada = timeStr;
                updates.gps_entrada = gpsStr;
                updates.obra = obraAsignada;
                updates.jornada_normal = (diaSemana === 6) ? 0.5 : 1.0; 
                updates.dia_semana = diaSemana;

                firebase.database().ref(getDbPath(`asistencia_semanal/${fSel}/${n}`)).update(updates)
                    .then(() => alert(`✅ ENTRADA REGISTRADA CON ÉXITO${esSincronizacion ? ' (Sincronizada)' : ''}.\n📍 Asignado a: ${obraAsignada}`));

            } else if (tipo === 'SALIDA') {
                updates.hora_salida = timeStr;
                updates.gps_salida = gpsStr;
                
                let obraSalida = record.obra || obraAsignada;
                if(obraSalida === "POR ASIGNAR") obraSalida = "OTRAS OBRAS";

                if(!record.obra || record.obra === "POR ASIGNAR" || !record.hora_entrada) {
                     updates.obra = obraSalida;
                     updates.jornada_normal = 0; 
                     updates.estado = 'ROJA';
                     updates.dia_semana = diaSemana;
                }
                firebase.database().ref(getDbPath(`asistencia_semanal/${fSel}/${n}`)).update(updates)
                    .then(() => alert(`✅ SALIDA REGISTRADA CON ÉXITO${esSincronizacion ? ' (Sincronizada)' : ''}`));
            }
        });
    });
};

window.sincronizarOffline = () => {
    let pendientes = JSON.parse(localStorage.getItem('asistencias_offline') || '[]');
    if (pendientes.length === 0) return alert("✅ No hay registros pendientes.");
    if (!navigator.onLine) return alert("❌ Sigues sin internet. Sincroniza al tener datos móviles estables o WiFi.");

    pendientes.forEach(p => {
        window.procesarMarcaGPS(p.tipo, p.lat, p.lng, p.n, p.timeStr, p.gpsStr, p.horaNum, p.fecha, p.dia_semana, true);
    });
    localStorage.setItem('asistencias_offline', '[]'); 
    dibujarPanelTrabajador(); 
};

window.pedirMaterialTrabajador = () => { 
    const n = localStorage.getItem('u_wr');
    const mat = prompt("Escriba el Material a solicitar (Ej: 2 brochas, 1 masilla):"); 
    if(mat) {
        if(confirm(`¿Confirmar solicitud de material?\n\nDetalle: ${mat}`)) {
            firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).once('value').then(s => {
                const r = s.val();
                const obraActual = (r && r.obra) ? r.obra : 'SIN ASIGNAR';
                firebase.database().ref(getDbPath(`solicitudes/SOL_MAT_${Date.now()}`)).set({ 
                    tipo: 'MATERIAL', trabajador: n, obra: obraActual, detalle: mat, fecha: new Date().toLocaleString(), estado: 'Pendiente' 
                }).then(() => {
                    alert("✅ Solicitud de material enviada a Administración.");
                    window.dispararAlertaWhatsApp(`PEDIR MATERIAL: ${n} en ${obraActual} solicita: ${mat}`);
                });
            });
        }
    }
};

window.pedirAnticipoTrabajador = () => { 
    const n = localStorage.getItem('u_wr');
    const reqID = `SOL_ANT_${n}_${fechaSel}`;
    
    firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).once('value').then(s => {
        const r = s.val() || {};
        if(r.estado === 'ROJA') return alert("❌ ACCESO DENEGADO: Tienes un atraso registrado hoy. Los anticipos están bloqueados por indisciplina.");

        firebase.database().ref(getDbPath(`solicitudes/${reqID}`)).once('value').then(snapAnt => {
            if(snapAnt.exists()) return alert("❌ LÍMITE ALCANZADO: Ya enviaste una solicitud de anticipo el día de hoy.");
            
            const montoStr = prompt("Monto del Anticipo (Bs):"); 
            if(!montoStr) return;
            
            const montoNum = parseFloat(montoStr.replace(/[^0-9.]/g, ''));
            if(isNaN(montoNum) || montoNum <= 0) return alert("❌ ERROR: Ingrese solo números válidos.");

            if(confirm(`¿Confirmar solicitud de anticipo por Bs. ${montoNum}?`)) {
                const obraActual = r.obra ? r.obra : 'SIN ASIGNAR';
                firebase.database().ref(getDbPath(`solicitudes/${reqID}`)).set({ 
                    tipo: 'ANTICIPO', trabajador: n, obra: obraActual, detalle: montoNum, fecha_corta: fechaSel, fecha: new Date().toLocaleString(), estado: 'Pendiente' 
                }).then(() => {
                    alert(`✅ Solicitud enviada a Administración.`);
                    window.dispararAlertaWhatsApp(`PEDIR ANTICIPO: ${n} en ${obraActual} solicita: Bs. ${montoNum}`);
                });
            }
        });
    });
};

// ==========================================================
// 🛎️ SOLICITUDES Y HISTORIAL AUTOMATIZADO
// ==========================================================
function dibujarSolicitudes() {
    appDiv.innerHTML = `<div class="min-h-screen bg-zinc-100 p-4 text-black"><div class="max-w-md mx-auto"><div class="bg-orange-600 p-6 text-white flex justify-between rounded-t-3xl shadow-lg"><h2 class="text-xl font-black italic uppercase">SOLICITUDES</h2><button onclick="window.location.hash='#menu'" class="bg-white text-orange-700 px-4 py-1 rounded-full font-bold text-xs">VOLVER</button></div><div class="bg-white p-6 shadow-xl rounded-b-3xl"><button onclick="window.location.hash='#historial-solicitudes'" class="w-full bg-zinc-800 text-white py-3 rounded-xl mb-4 font-black text-[11px] uppercase border border-zinc-700 shadow-md">🗂️ Ver Historial Atendidos</button><div id="list-solicitudes" class="space-y-4">Cargando...</div></div></div></div>`;
    firebase.database().ref(getDbPath('solicitudes')).on('value', snap => {
        const c = document.getElementById('list-solicitudes'); if (!c) return; c.innerHTML = '';
        const sol = snap.val() || {}; let hay = false;
        Object.keys(sol).forEach(id => {
            const s = sol[id];
            if (s.estado === 'Pendiente') { 
                hay = true; 
                if (s.tipo === 'MATERIAL') {
                    c.innerHTML += `<div class="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 shadow-sm relative"><div class="flex justify-between mb-2"><div><b class="text-sm uppercase">${s.trabajador}</b><br><span class="text-[9px] text-zinc-500">${s.fecha}</span></div><div class="text-right"><span class="text-[9px] bg-blue-600 text-white px-2 py-1 rounded-lg">MATERIAL</span><br><span class="text-[8px] font-black text-blue-800 mt-1 inline-block">📍 ${s.obra || 'SIN OBRA'}</span></div></div><p class="text-sm font-bold bg-white p-2 border rounded-lg border-blue-200">${s.detalle}</p><button onclick="window.marcarSolicitudLeida('${id}')" class="w-full mt-2 bg-zinc-800 text-white text-[10px] font-black py-3 rounded-xl uppercase shadow-md">MARCAR VISTO Y SURTIR</button></div>`;
                } else if (s.tipo === 'ANTICIPO') {
                    const montoLimpio = parseInt(String(s.detalle).match(/\d+/)) || 0;
                    c.innerHTML += `<div class="p-4 bg-green-50 rounded-2xl border-2 border-green-300 shadow-sm relative"><div class="flex justify-between mb-2"><div><b class="text-sm uppercase">${s.trabajador}</b><br><span class="text-[9px] text-zinc-500">${s.fecha}</span></div><div class="text-right"><span class="text-[9px] bg-green-600 text-white px-2 py-1 rounded-lg">ANTICIPO</span><br><span class="text-[8px] font-black text-green-800 mt-1 inline-block">📍 ${s.obra || 'SIN OBRA'}</span></div></div><p class="text-xl text-center text-green-700 font-black bg-white p-2 border rounded-lg border-green-200 shadow-inner">Monto: Bs. ${montoLimpio}</p><button onclick="window.aprobarAnticipo('${id}', '${s.trabajador}', ${montoLimpio}, '${s.fecha_corta}')" class="w-full mt-2 bg-green-600 shadow-lg text-white text-[10px] font-black py-3 rounded-xl uppercase">💸 APROBAR Y DESCONTAR EN PLANILLA</button></div>`;
                }
            }
        });
        if(!hay) c.innerHTML = `<div class="text-center py-10 opacity-50"><span class="text-4xl block mb-2">✅</span><p class="text-zinc-500 text-xs font-bold uppercase">Bandeja limpia.<br>No hay solicitudes pendientes.</p></div>`;
    });
}

window.marcarSolicitudLeida = (id) => {
    firebase.database().ref(getDbPath(`solicitudes/${id}`)).update({ estado: 'Atendido', fecha_atencion: new Date().toLocaleString() });
};

window.aprobarAnticipo = (id, trabajador, montoPedido, fechaCorta) => {
    const montoFinalStr = prompt(`Aprobar anticipo para ${trabajador}.\nEl trabajador pidió: Bs. ${montoPedido}\n\nSi le entregará otra cantidad, cámbielo aquí:`, montoPedido);
    if(montoFinalStr === null) return; 
    
    const montoFinal = parseFloat(montoFinalStr);
    if(isNaN(montoFinal) || montoFinal <= 0) { alert("Error: Monto inválido."); return; }

    firebase.database().ref(getDbPath(`solicitudes/${id}`)).update({ estado: 'Atendido', monto_aprobado: montoFinal, fecha_atencion: new Date().toLocaleString() });

    const refAsist = firebase.database().ref(getDbPath(`asistencia_semanal/${fechaCorta}/${trabajador}/monto_anticipo`));
    refAsist.once('value').then(snap => {
        const antActual = parseFloat(snap.val() || 0);
        refAsist.set(antActual + montoFinal).then(() => { alert(`✅ ¡ÉXITO! Bs. ${montoFinal} aprobados y enlazados a la planilla de ${trabajador}.`); });
    });
};

window.verHistorialSolicitudes = (filtro = 'TODOS') => {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black">
        <div class="max-w-md mx-auto">
            <div class="bg-zinc-800 p-6 text-white flex justify-between rounded-t-3xl shadow-lg">
                <h2 class="text-xl font-black italic uppercase">HISTORIAL PEDIDOS</h2>
                <button onclick="window.location.hash='#solicitudes'" class="bg-white text-black px-4 py-1 rounded-full font-bold text-xs">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl">
                <div class="flex gap-2 mb-4">
                    <button onclick="window.verHistorialSolicitudes('TODOS')" class="flex-1 ${filtro === 'TODOS' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'} text-[9px] font-bold py-2 rounded-lg transition-colors">TODOS</button>
                    <button onclick="window.verHistorialSolicitudes('MATERIAL')" class="flex-1 ${filtro === 'MATERIAL' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'} text-[9px] font-bold py-2 rounded-lg transition-colors">MATERIALES</button>
                    <button onclick="window.verHistorialSolicitudes('ANTICIPO')" class="flex-1 ${filtro === 'ANTICIPO' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'} text-[9px] font-bold py-2 rounded-lg transition-colors">ANTICIPOS</button>
                </div>
                <div id="list-historial-sol" class="space-y-4">Cargando...</div>
            </div>
        </div>
    </div>`;
    
    firebase.database().ref(getDbPath('solicitudes')).once('value').then(snap => {
        const c = document.getElementById('list-historial-sol'); if (!c) return; c.innerHTML = '';
        const sol = snap.val() || {}; let hay = false;
        
        const solicitudesArray = Object.keys(sol).map(id => ({ id, ...sol[id] })).reverse();
        
        solicitudesArray.forEach(s => {
            if (s.estado === 'Atendido') { 
                if (filtro !== 'TODOS' && s.tipo !== filtro) return;
                hay = true; const color = s.tipo === 'MATERIAL' ? 'blue' : 'green';
                const mPed = parseInt(String(s.detalle).match(/\d+/)) || 0;
                const detalleVisual = s.tipo === 'ANTICIPO' ? `Pidió: Bs. ${mPed} | <span class="text-green-700">Aprobado: Bs. ${s.monto_aprobado || mPed}</span>` : s.detalle;

                c.innerHTML += `<div class="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between"><div class="flex justify-between mb-2"><div><b class="text-sm uppercase">${s.trabajador}</b><br><span class="text-[9px] text-zinc-500">${s.fecha}</span></div><div class="text-right"><span class="text-[9px] bg-${color}-100 text-${color}-800 px-2 py-1 rounded-lg font-bold">${s.tipo}</span><br><span class="text-[8px] font-black mt-1 inline-block">📍 ${s.obra || 'SIN OBRA'}</span></div></div><p class="text-xs font-bold bg-white p-2 border rounded-lg mb-1">${detalleVisual}</p><span class="text-[10px] text-zinc-400 font-black text-right mt-1">✓ PROCESADO: ${s.fecha_atencion || s.fecha}</span></div>`;
            }
        });
        if(!hay) c.innerHTML = `<p class="text-center text-zinc-500 text-xs font-bold py-10">No hay registros en esta categoría.</p>`;
    });
};

// ==========================================================
// 📋 ASISTENCIA PRO (SEMÁFORO VISUAL Y MULTAS)
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
            <div class="mb-4 bg-red-50 p-3 rounded-xl border border-red-200">
                <label class="text-[10px] text-red-600 font-black uppercase mb-2 block text-center">ANTICIPOS EFECTIVO (Bs):</label>
                <div class="flex items-center justify-center gap-2 mb-2"><input id="modal-anticipo" type="number" placeholder="0" class="w-24 p-2 border-2 border-red-300 rounded-xl font-black text-center text-xl outline-none bg-white text-red-700"></div>
                <div class="flex gap-1 justify-center"><button type="button" onclick="window.sumarAlAnticipo(10)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs shadow-sm">+ 10</button><button type="button" onclick="window.sumarAlAnticipo(20)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs shadow-sm">+ 20</button><button type="button" onclick="window.sumarAlAnticipo(50)" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-black text-xs shadow-sm">+ 50</button></div>
            </div>
            
            <div class="mb-5 bg-zinc-900 p-3 rounded-xl border border-zinc-700">
                <label class="text-[9px] text-zinc-400 font-black uppercase mb-1 block text-center">MULTA POR DAÑO A HERRAMIENTA (Bs):</label>
                <input id="modal-dano" type="number" value="0" class="w-full p-2 border border-zinc-600 rounded-lg font-black text-center text-lg text-white bg-black outline-none" placeholder="Penalización">
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
    const marcasMap = {};
    Object.keys(window.currentMarks).forEach(n => { marcasMap[n.toUpperCase()] = window.currentMarks[n]; });
    
    Object.keys(window.currentMarks).forEach(n => {
        const r = window.currentMarks[n];
        if(r.obra === "POR ASIGNAR") {
            let gpsLink = '';
            if (r.hora_entrada) gpsLink += `<button onclick="window.open('https://maps.google.com/?q=' + encodeURIComponent('${r.gps_entrada || ''}'), '_blank')" class="text-green-600 font-black text-[9px] uppercase mt-1 block underline text-left">☀️ ENT: ${r.hora_entrada} 🗺️</button>`;
            if (r.hora_salida) gpsLink += `<button onclick="window.open('https://maps.google.com/?q=' + encodeURIComponent('${r.gps_salida || ''}'), '_blank')" class="text-red-500 font-black text-[9px] uppercase mt-1 block underline text-left">🌙 SAL: ${r.hora_salida} 🗺️</button>`;
            if (!gpsLink && r.hora_registro) gpsLink = `<button onclick="window.open('https://maps.google.com/?q=' + encodeURIComponent('${r.gps_registro || ''}'), '_blank')" class="text-blue-600 font-black text-[9px] uppercase mt-1 block underline text-left">🗺️ VER REGISTRO (${r.hora_registro})</button>`;
            if (!gpsLink) gpsLink = `<span class="text-[10px] font-bold text-yellow-800 block mt-1">📍 SIN MARCAS</span>`;
                
            c.innerHTML += `<div class="flex items-center justify-between p-3 bg-yellow-50 rounded-2xl border-2 border-yellow-400 mb-2 shadow-sm"><div><b class="text-sm uppercase">${n}</b><br>${gpsLink}</div><div class="flex flex-col gap-1"><button onclick="window.markP('${n}', 'mover')" class="p-2 rounded-xl bg-yellow-400 text-[9px] font-black w-24 shadow-sm">ASIGNAR AQUÍ</button><button onclick="window.borrarMarcaFalsa('${n}')" class="p-2 rounded-xl bg-red-100 text-red-600 border border-red-300 text-[9px] font-black w-24">BORRAR MARCA</button></div></div>`;
        }
    });

    Object.keys(window.currentPersonal).forEach(n => {
        const nombreMayus = n.toUpperCase();
        const r = marcasMap[nombreMayus]; 
        if(r && r.obra === "POR ASIGNAR") return;
        
        const eO = r && r.obra === obraSel, eOt = r && r.obra !== obraSel;
        let btn = '', bColor = 'border-yellow-500 bg-yellow-50';
        
        if (eO) { 
            if (r.estado === 'VERDE') bColor = 'border-green-500 bg-green-50';
            else if (r.estado === 'ROJA') bColor = 'border-red-500 bg-red-50';
            else bColor = 'border-blue-300 bg-blue-50';

            btn = `<button onclick="window.abrirModalAsistencia('${nombreMayus}', true)" class="p-2 rounded-xl bg-zinc-800 text-white w-24 font-black text-[10px] shadow-sm">VER/EDITAR</button>`; 
        } else if (eOt) { 
            bColor = 'border-orange-200 bg-orange-50'; 
            btn = `<button onclick="window.markP('${nombreMayus}', 'mover')" class="p-2 rounded-xl bg-orange-200 text-orange-800 text-[9px] font-black border border-orange-300 w-24">EN: ${r.obra}</button>`; 
        } else { 
            btn = `<button onclick="window.abrirModalAsistencia('${nombreMayus}', false)" class="p-3 rounded-xl bg-zinc-800 text-white font-black w-24 text-[10px]">ASISTENCIA</button>`; 
        }
        
        let info = '';
        if (r) {
            let iA = [];
            if (eO) {
                let jN = r.jornada_normal !== undefined ? r.jornada_normal : 1;
                if (jN > 0) iA.push(`N: ${jN}D`); if (r.jornada_extra > 0) iA.push(`E: ${r.jornada_extra}D`);
                if (r.horas_atraso > 0) iA.push(`Atraso: ${r.horas_atraso}h`); 
                if (r.monto_anticipo > 0) iA.push(`Ant: Bs.${r.monto_anticipo}`);
                if (r.monto_dano > 0) iA.push(`Multa: Bs.${r.monto_dano}`);
            }
            
            const textoAsistencia = iA.length > 0 ? `<span class="text-[10px] text-zinc-700 font-bold block">${iA.join(' | ')}</span>` : '';
            
            let gpsLink = '';
            if (r.hora_entrada) gpsLink += `<button onclick="window.open('https://maps.google.com/?q=' + encodeURIComponent('${r.gps_entrada || ''}'), '_blank')" class="text-zinc-800 font-black text-[9px] uppercase mt-1 inline-block underline mr-2">☀️ ENTRADA: ${r.hora_entrada}</button>`;
            if (r.hora_salida) gpsLink += `<button onclick="window.open('https://maps.google.com/?q=' + encodeURIComponent('${r.gps_salida || ''}'), '_blank')" class="text-zinc-800 font-black text-[9px] uppercase mt-1 inline-block underline">🌙 SALIDA: ${r.hora_salida}</button>`;
            info = `<br>${textoAsistencia}${gpsLink}`;
        } else {
            info = `<br><span class="text-[9px] font-bold text-yellow-700">🚨 SIN MARCAR / FALTA</span>`;
        }
        
        c.innerHTML += `<div class="flex items-center justify-between p-3 rounded-2xl border-2 ${bColor} text-black uppercase transition-all shadow-sm"><div><b class="text-sm">${nombreMayus}</b>${info}</div>${btn}</div>`;
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
    document.getElementById('modal-dano').value = r.monto_dano || 0;
    existe ? document.getElementById('btn-quitar-asist').classList.remove('hidden') : document.getElementById('btn-quitar-asist').classList.add('hidden');
    document.getElementById('modal-asistencia').classList.remove('hidden');
};
window.sumarAlAnticipo = (m) => { const i = document.getElementById('modal-anticipo'); i.value = (parseFloat(i.value) || 0) + m; };
window.guardarAsistenciaModal = () => {
    const n = window.pintorActualModal;
    firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).update({ nombre: n, obra: obraSel, jornada_normal: parseFloat(document.getElementById('modal-j-normal').value), jornada_extra: parseFloat(document.getElementById('modal-j-extra').value), monto_anticipo: parseFloat(document.getElementById('modal-anticipo').value), horas_atraso: parseFloat(document.getElementById('modal-atraso-horas').value), monto_dano: parseFloat(document.getElementById('modal-dano').value) });
    document.getElementById('modal-asistencia').classList.add('hidden');
};
window.quitarAsistenciaModal = () => { if (confirm(`¿Eliminar a ${window.pintorActualModal}?`)) { firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${window.pintorActualModal}`)).remove(); document.getElementById('modal-asistencia').classList.add('hidden'); } };
window.markP = (n, acc) => { if (confirm(`¿Mover a ${n}?`)) firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).update({ obra: obraSel }); };
window.borrarMarcaFalsa = (n) => { if(confirm(`¿Desea borrar la asistencia fantasma de ${n}?`)) { firebase.database().ref(getDbPath(`asistencia_semanal/${fechaSel}/${n}`)).remove(); } };

// ==========================================================
// ✅ CORRECCIÓN 3: VER DETALLE SEMANA (BOTÓN BUSCADOR) Y TOGGLE DE ATRASOS
// ==========================================================
window.verDetalleSemana = (n) => {
    firebase.database().ref(getDbPath('asistencia_semanal')).once('value').then(snap => {
        const hist = snap.val() || {};
        let msg = `🔍 REPORTE DE LA SEMANA: ${n}\n\n`;
        let hay = false;
        
        Object.keys(hist).sort().forEach(f => {
            if (f >= pFIni && f <= pFFin) {
                if (hist[f][n]) {
                    let r = hist[f][n];
                    let info = [];
                    if (r.horas_atraso > 0) info.push(`Llegó tarde: ${r.horas_atraso}h`);
                    if (r.monto_anticipo > 0) info.push(`Anticipo: Bs. ${r.monto_anticipo}`);
                    if (r.monto_dano > 0) info.push(`Multa Herramienta: Bs. ${r.monto_dano}`);
                    if (r.hora_entrada && !r.hora_salida) info.push(`Falta marcar Salida`);
                    
                    if (info.length > 0) {
                        msg += `📅 ${f}: \n👉 ${info.join(' | ')}\n\n`;
                        hay = true;
                    }
                }
            }
        });
        if(!hay) msg += "✅ Ningún descuento o anticipo esta semana.";
        alert(msg);
    });
};

function dibujarPlanilla() {
    appDiv.innerHTML = `<div class="min-h-screen bg-black p-4 text-white"><div class="max-w-md mx-auto"><div class="flex justify-between mb-4"><h2 class="text-2xl font-black italic text-red-600">SUELDOS</h2><button onclick="window.location.hash='#menu'" class="bg-zinc-800 px-4 py-1 rounded-full text-xs font-bold">VOLVER</button></div><div class="bg-zinc-900 p-4 rounded-2xl mb-4 flex gap-2 text-[10px] font-bold border border-zinc-800"><div class="flex-1 text-left"><label class="text-zinc-500 uppercase">Lunes</label><input type="date" value="${pFIni}" onchange="window.chPIni(this.value)" class="w-full bg-black p-2 rounded-lg text-white"></div><div class="flex-1 text-left"><label class="text-zinc-500 uppercase">Corte</label><input type="date" value="${pFFin}" onchange="window.chPFin(this.value)" class="w-full bg-black p-2 rounded-lg text-white"></div></div><button onclick="window.toggleMultaSalida()" class="w-full ${window.aplicarMultaSalida ? 'bg-red-600 border-red-800' : 'bg-zinc-700 border-zinc-600'} text-white py-3 rounded-xl mb-2 font-black text-[11px] uppercase border shadow-md transition-colors">${window.aplicarMultaSalida ? '🔴 MULTAS DE SALIDA: ACTIVAS (-0.5D)' : '⚪ MULTAS DE SALIDA: APAGADAS (0.0D)'}</button><button onclick="window.toggleMultaAtraso()" class="w-full ${window.aplicarMultaAtraso ? 'bg-orange-600 border-orange-800' : 'bg-zinc-700 border-zinc-600'} text-white py-3 rounded-xl mb-4 font-black text-[11px] uppercase border shadow-md transition-colors">${window.aplicarMultaAtraso ? '🔴 MULTAS DE ATRASO: ACTIVAS' : '⚪ MULTAS DE ATRASO: APAGADAS'}</button><button onclick="window.location.hash='#historial-sueldos'" class="w-full bg-zinc-800 py-3 rounded-xl mb-4 font-black text-[11px] uppercase border border-zinc-700 shadow-md">🗂️ Ver Historial Anteriores</button><div id="c-p" class="space-y-6 pb-10">Cargando...</div></div></div>`;
    
    data.obtenerTodo((db) => {
        const c = document.getElementById('c-p'); if (!c) return;
        const per = db.personal || {}, hist = db.asistencia_semanal || {}, pagosRealizados = db.pagos_historial || {}, res = {};
        const personalMayus = {}; Object.keys(per).forEach(k => { personalMayus[k.toUpperCase()] = per[k]; });
        const pagosMap = {}; Object.keys(pagosRealizados).forEach(k => { pagosMap[k.toUpperCase()] = pagosRealizados[k]; });

        const hoyStr = getLocalISODate();

        Object.keys(hist).forEach(f => { if (f >= pFIni && f <= pFFin) { Object.values(hist[f]).forEach(reg => {
            const nombreMayus = reg.nombre.toUpperCase();
            const idRef = `${nombreMayus}_semana_${pFIni}`.toUpperCase(); 
            if (pagosMap[idRef]) return;
            
            if (!res[nombreMayus]) res[nombreMayus] = { dNorm: 0, dSabado: 0, dExt: 0, ant: 0, hAtraso: 0, dano: 0, faltasSalida: 0, obraPrincipal: reg.obra };
            
            if (window.aplicarMultaSalida && reg.hora_entrada && !reg.hora_salida && f < hoyStr) {
                res[nombreMayus].faltasSalida += 0.5;
            }

            const valorDia = parseFloat(reg.jornada_normal !== undefined ? reg.jornada_normal : 1);
            if (reg.dia_semana === 6) {
                res[nombreMayus].dSabado += valorDia;
            } else {
                res[nombreMayus].dNorm += valorDia;
            }

            res[nombreMayus].dExt += parseFloat(reg.jornada_extra || 0);
            res[nombreMayus].ant += parseFloat(reg.monto_anticipo || 0);
            res[nombreMayus].hAtraso += parseFloat(reg.horas_atraso || 0);
            res[nombreMayus].dano += parseFloat(reg.monto_dano || 0);
        });}});
        
        c.innerHTML = ''; let tP = 0; const list = Object.keys(res);
        if (list.length === 0) { c.innerHTML = `<p class="text-center text-zinc-500 text-xs font-bold uppercase mt-10">No hay pagos pendientes.</p>`; return; }
        
        list.forEach(n => {
            const d = res[n], sDia = parseFloat(personalMayus[n]?.sueldo_dia) || 0;
            
            let diasTrabajados = d.dNorm + d.dSabado;
            let compensacion = 0;
            
            if (d.dNorm >= 5.0 && d.dSabado > 0) {
                diasTrabajados = 6.0;
                compensacion = 6.0 - (d.dNorm + d.dSabado);
            } else if (d.dNorm < 5.0) {
                diasTrabajados = Math.min(diasTrabajados, 4.5);
            }

            diasTrabajados -= d.faltasSalida;

            const sTot = (diasTrabajados + d.dExt) * sDia;
            
            const horasDescontar = window.aplicarMultaAtraso ? Math.ceil(d.hAtraso) : 0; 
            const desc = horasDescontar * (sDia / 8); 

            const saldo = sTot - d.ant - desc - d.dano; tP += saldo;
            
            let detalleAtraso = '';
            if (d.hAtraso > 0) {
                if (window.aplicarMultaAtraso) {
                    detalleAtraso = `Llegó ${d.hAtraso}h tarde → descuenta ${horasDescontar}h completa(s)`;
                } else {
                    detalleAtraso = `Llegó ${d.hAtraso}h tarde (Multa Apagada)`;
                }
            }
            
            c.innerHTML += `<div class="bg-zinc-900 p-5 rounded-3xl border-l-8 ${d.hAtraso > 0 || d.faltasSalida > 0 ? 'border-red-600' : 'border-green-500'} relative"><div class="flex justify-between mb-4 border-b border-zinc-800 pb-2"><h3 class="font-black text-xl">${n}</h3><span class="${diasTrabajados >= 5.5 ? 'bg-green-600' : 'bg-red-600'} px-3 rounded-lg font-black text-sm py-1">${diasTrabajados.toFixed(1)} Días</span></div><div class="grid grid-cols-2 gap-2 mb-2"><div class="bg-black p-2 rounded-xl"><span class="text-[9px] text-zinc-500 block">Salario Base</span>Bs. ${sDia}/día</div><div class="bg-black p-2 rounded-xl text-red-400"><span class="text-[9px] block">Anticipos / Descuentos</span>-Bs. ${(d.ant + desc).toFixed(1)}</div></div>${detalleAtraso ? `<div class="bg-orange-900/50 border border-orange-700 p-2 rounded-xl text-orange-300 mb-2 text-center text-[10px] font-black">${detalleAtraso}</div>` : ''}${d.faltasSalida > 0 ? `<div class="bg-red-900/50 border border-red-800 p-2 rounded-xl text-red-300 mb-2 text-center text-xs font-black">MULTA SALIDA INCOMPLETA: -${d.faltasSalida} Días</div>` : ''}${d.dano > 0 ? `<div class="bg-red-900/50 border border-red-800 p-2 rounded-xl text-red-300 mb-3 text-center text-xs font-black">MULTA HERRAMIENTA: -Bs. ${d.dano}</div>` : ''}
            <button onclick="window.verDetalleSemana('${n}')" class="w-full mb-3 bg-blue-900/40 text-blue-300 border border-blue-800 py-2 rounded-xl font-bold text-[10px] uppercase shadow-sm">🔍 Buscar Anticipos / Atrasos</button>
            <button onclick="window.ejecutarPagoEfectivo('${n}', ${saldo}, '${d.obraPrincipal}', ${sDia}, ${diasTrabajados}, ${d.dExt}, ${d.ant}, ${d.hAtraso}, ${desc}, ${compensacion}, ${d.dano})" class="w-full bg-green-500 text-white py-4 rounded-xl font-black text-lg shadow-lg">LIQUIDAR: Bs. ${saldo.toFixed(2)}</button></div>`;
        });
        if (tP > 0) c.innerHTML = `<div class="bg-green-600 p-5 rounded-3xl mb-6 text-center"><p class="text-[10px] font-black mb-1">TOTAL PLANILLA</p><span class="text-4xl font-black">Bs. ${tP.toFixed(2)}</span></div>` + c.innerHTML;
    });
}
window.toggleMultaSalida = () => { window.aplicarMultaSalida = !window.aplicarMultaSalida; dibujarPlanilla(); };
window.toggleMultaAtraso = () => { window.aplicarMultaAtraso = !window.aplicarMultaAtraso; dibujarPlanilla(); };
window.chPIni = (v) => { pFIni = v; dibujarPlanilla(); }; window.chPFin = (v) => { pFFin = v; dibujarPlanilla(); };

window.ejecutarPagoEfectivo = (n, m, oN, sDia, dN, dE, ant, hA, desc, comp, dano) => {
    if (confirm(`¿Transferir Bs. ${m.toFixed(2)} a ${n}?`)) {
        const guardarHistorial = () => {
            firebase.database().ref(getDbPath(`pagos_historial/${n}_semana_${pFIni}`)).set({ 
                fecha_pago: new Date().toISOString(), trabajador: n, monto: m, semana_ancla: pFIni, 
                detalles: { sueldo_dia: sDia, dias_normales: dN, dias_extras: dE, anticipos: ant, horas_atraso: hA, descuento_atraso: desc, compensacion: comp, multas_dano: dano } 
            }).then(() => { dibujarPlanilla(); });
        };
        firebase.database().ref(getDbPath('obras')).once('value').then(s => {
            const obs = s.val() || {}; const idO = Object.keys(obs).find(id => obs[id].nombre === oN);
            if (idO) { const sueldoBruto = m + ant + desc + dano; data.registrarMovimiento(idO, 'pago_sueldo', sueldoBruto, `Sueldo Semanal: ${n}`); guardarHistorial(); } else { guardarHistorial(); }
        });
    }
};

window.verHistorialSueldos = () => {
    appDiv.innerHTML = `<div class="min-h-screen bg-black p-4 text-white"><button onclick="window.location.hash='#planilla'; window.dibujarPlanilla();" class="bg-red-600 px-4 py-2 rounded-lg font-bold text-xs mb-4 shadow-md">VOLVER</button><h2 class="text-xl font-black mb-4">HISTORIAL DE PAGOS</h2><div id="lista-historial-sueldos">Cargando...</div></div>`;
    
    firebase.database().ref(getDbPath('pagos_historial')).once('value').then(s => {
        const c = document.getElementById('lista-historial-sueldos'); 
        const p = s.val() || {}; 
        c.innerHTML = '';
        
        // Ordenamos por fecha descendente (los más recientes primero)
        const pagosArray = Object.values(p).sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));
        
        // Renderizamos la tarjeta con la radiografía financiera
        pagosArray.forEach(pg => { 
            const fechaLegible = new Date(pg.fecha_pago).toLocaleString();
            
            // Extraemos los detalles si existen en la base de datos
            let detallesHTML = '';
            if (pg.detalles) {
                const diasTotales = (pg.detalles.dias_normales || 0) + (pg.detalles.dias_extras || 0);
                const anticipos = pg.detalles.anticipos || 0;
                const multasTotales = (pg.detalles.descuento_atraso || 0) + (pg.detalles.multas_dano || 0);
                const horasAtraso = pg.detalles.horas_atraso || 0;
                
                detallesHTML = `
                <div class="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800 text-[10px]">
                    <div class="bg-black p-2 rounded text-zinc-300 border border-zinc-900">
                        <span class="block text-[8px] text-zinc-500 mb-1 font-black">DÍAS (Norm + Ext)</span>
                        ${diasTotales} Días
                    </div>
                    <div class="bg-black p-2 rounded text-yellow-500 border border-zinc-900">
                        <span class="block text-[8px] text-zinc-500 mb-1 font-black">ANTICIPOS</span>
                        - Bs. ${anticipos}
                    </div>
                    <div class="bg-black p-2 rounded text-red-400 border border-zinc-900">
                        <span class="block text-[8px] text-zinc-500 mb-1 font-black">MULTAS (${horasAtraso}h)</span>
                        - Bs. ${multasTotales}
                    </div>
                </div>`;
            } else {
                detallesHTML = `<div class="mt-3 pt-3 border-t border-zinc-800 text-[9px] text-zinc-600 italic">Registro antiguo - Detalles no guardados</div>`;
            }

            c.innerHTML += `
            <div class="bg-zinc-900 p-5 mb-3 rounded-2xl border border-zinc-800 shadow-lg">
                <div class="flex justify-between items-center mb-1">
                    <b class="text-lg uppercase text-white">${pg.trabajador}</b>
                    <span class="text-xl font-black text-green-500">Bs. ${parseFloat(pg.monto).toFixed(2)}</span>
                </div>
                <span class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">${fechaLegible}</span>
                ${detallesHTML}
            </div>`; 
        });
    });
};
// ==========================================================
// 🚚 MÓDULO DE LOGÍSTICA, AUDITORÍA Y TRASPASOS
// ==========================================================
function dibujarLogistica() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-zinc-100 p-4 text-black font-sans pb-10">
        <div class="max-w-md mx-auto">
            <div class="bg-indigo-600 p-6 text-white flex justify-between rounded-t-3xl shadow-lg">
                <h2 class="text-xl font-black italic uppercase">LOGÍSTICA / OBRA</h2>
                <button onclick="window.location.hash='#menu'" class="bg-white text-indigo-700 px-4 py-1 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            <div class="bg-white p-6 shadow-xl rounded-b-3xl">
                <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 mb-6">
                    <label class="text-[10px] font-black text-indigo-800 block mb-2">UBICACIÓN A AUDITAR:</label>
                    <select id="log-obra" onchange="window.cargarInventarioObra()" class="w-full p-3 border-2 border-indigo-300 rounded-xl font-black uppercase outline-none text-indigo-900">
                        <option value="">-- SELECCIONE UNA OBRA --</option>
                        <option value="BODEGA">TALLER / BODEGA CENTRAL</option>
                    </select>
                </div>
                
                <div id="panel-inventario" style="display:none;">
                    <div class="flex justify-between items-end border-b-2 pb-2 mb-4">
                        <h3 class="font-black text-sm uppercase">📋 Herramientas Asignadas</h3>
                    </div>
                    <div id="list-log-herramientas" class="space-y-3 mb-8"></div>
                    
                    <div class="flex justify-between items-end border-b-2 border-orange-200 pb-2 mb-4">
                        <h3 class="font-black text-sm uppercase text-orange-700">📦 Materiales Sobrantes</h3>
                    </div>
                    <div class="bg-orange-50 p-3 rounded-2xl border border-orange-200 mb-4">
                        <textarea id="log-mat-nombre" rows="3" placeholder="Ej: 2 Baldes Masilla, 4 Rodillos, 1 Lija..." class="w-full p-3 border border-orange-300 rounded-xl text-xs font-bold uppercase mb-3 resize-none outline-none shadow-inner"></textarea>
                        <button onclick="window.registrarMaterialObra()" class="w-full bg-orange-600 text-white font-black py-3 rounded-lg text-xs shadow-md">+ REGISTRAR MATERIAL AQUÍ</button>
                    </div>
                    <div id="list-log-materiales" class="space-y-3"></div>
                </div>
            </div>
        </div>
    </div>`;

    data.obtenerObras(obs => {
        const s = document.getElementById('log-obra');
        Object.keys(obs).forEach(id => { if (obs[id].estado !== 'Entregada') s.innerHTML += `<option value="${obs[id].nombre}">${obs[id].nombre}</option>`; });
    });
}

window.cargarInventarioObra = () => {
    const obra = document.getElementById('log-obra').value;
    const panel = document.getElementById('panel-inventario');
    if(!obra) { panel.style.display = 'none'; return; }
    panel.style.display = 'block';

    firebase.database().ref(getDbPath('herramientas')).on('value', snap => {
        const cH = document.getElementById('list-log-herramientas'); if(!cH) return; cH.innerHTML = '';
        const herr = snap.val() || {}; let hayH = false;
        Object.keys(herr).forEach(id => {
            const h = herr[id];
            if(h.obra === obra || (obra === 'BODEGA' && (!h.obra || h.obra === 'Ninguna'))) {
                hayH = true;
                cH.innerHTML += `
                <div class="p-3 bg-white rounded-xl border border-zinc-300 shadow-sm flex justify-between items-center">
                    <div><b class="text-[11px] uppercase">${h.nombre}</b><br><span class="text-[9px] text-zinc-500">A cargo: ${h.asignado_a || 'Nadie'}</span></div>
                    <button onclick="window.trasladoRapidoHerr('${id}', '${h.nombre}')" class="bg-indigo-600 text-white text-[9px] font-black px-3 py-2 rounded-lg shadow-md">🚚 MOVER</button>
                </div>`;
            }
        });
        if(!hayH) cH.innerHTML = `<p class="text-[10px] text-zinc-400 font-bold text-center italic">No hay herramientas registradas aquí.</p>`;
    });

    firebase.database().ref(getDbPath('inventario_obras')).on('value', snap => {
        const cM = document.getElementById('list-log-materiales'); if(!cM) return; cM.innerHTML = '';
        const mats = snap.val() || {}; let hayM = false;
        Object.keys(mats).forEach(id => {
            const m = mats[id];
            if(m.obra === obra) {
                hayM = true;
                cM.innerHTML += `
                <div class="p-3 bg-orange-50 rounded-xl border border-orange-200 shadow-sm flex justify-between items-center">
                    <b class="text-[11px] uppercase text-orange-900">${m.detalle}</b>
                    <div class="flex gap-1">
                        <button onclick="window.trasladoRapidoMat('${id}', '${m.detalle}')" class="bg-indigo-600 text-white text-[9px] font-black px-2 py-2 rounded-lg">🚚 MOVER</button>
                        <button onclick="window.borrarMaterialObra('${id}')" class="bg-red-100 text-red-600 text-[9px] font-black px-2 py-2 rounded-lg border border-red-200">USADO / BORRAR</button>
                    </div>
                </div>`;
            }
        });
        if(!hayM) cM.innerHTML = `<p class="text-[10px] text-zinc-400 font-bold text-center italic">No hay materiales sobrantes registrados.</p>`;
    });
};

window.trasladoRapidoHerr = (id, font) => {
    const nuevaObra = prompt(`Mover equipo: ${font}\nEscriba el nombre exacto de la Obra de destino (o escriba BODEGA):`);
    if(nuevaObra) {
        let dest = nuevaObra.toUpperCase().trim() === 'BODEGA' ? 'Ninguna' : nuevaObra.toUpperCase().trim();
        firebase.database().ref(getDbPath(`herramientas/${id}`)).update({ obra: dest, fecha_asignacion: new Date().toISOString() }, () => {
            window.dispararAlertaWhatsApp(`🚨 TRASLADO EQUIPO WRPUMA: El equipo [${font}] fue movido a la obra [${dest}] por el Supervisor.`);
        });
    }
};

window.registrarMaterialObra = () => {
    const obra = document.getElementById('log-obra').value;
    const det = document.getElementById('log-mat-nombre').value.trim();
    if(det && obra) {
        firebase.database().ref(getDbPath(`inventario_obras/MAT_${Date.now()}`)).set({ 
            obra: obra, detalle: det.toUpperCase(), fecha: new Date().toISOString() 
        }).then(() => {
            document.getElementById('log-mat-nombre').value = ''; 
            alert("✅ Material registrado exitosamente.");
            window.dispararAlertaWhatsApp(`📦 REPORTE MATERIAL WRPUMA: Se registraron sobrantes en [${obra}] -> ${det.toUpperCase()}`);
        }).catch(err => alert("❌ Error de conexión al guardar en base de datos."));
    } else {
        alert("⚠️ Seleccione una obra y escriba el detalle del material.");
    }
};

window.borrarMaterialObra = (id) => {
    if(confirm("¿Este material ya se gastó o se desechó?")) firebase.database().ref(getDbPath(`inventario_obras/${id}`)).remove();
};

window.trasladoRapidoMat = (id, detalle) => {
    const nuevaObra = prompt(`Trasladar material: ${detalle}\nEscriba la Obra de destino (o BODEGA):`);
    if(nuevaObra) {
        firebase.database().ref(getDbPath(`inventario_obras/${id}`)).update({ obra: nuevaObra.toUpperCase().trim() });
    }
};

// ==========================================================
// 🏗️ OBRAS Y MICRO-OBRAS
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
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <input id="o-lat" type="number" placeholder="LATITUD (Ej: -17.7532)" class="w-full p-2 rounded-xl border-2 font-bold text-xs">
                    <input id="o-lng" type="number" placeholder="LONGITUD (Ej: -63.2109)" class="w-full p-2 rounded-xl border-2 font-bold text-xs">
                </div>
                <button onclick="window.saveO()" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-md">REGISTRAR PROYECTO</button>
                <button onclick="window.crearMicroObra()" class="w-full mt-2 bg-blue-600 text-white font-black py-3 rounded-2xl shadow-md">+ REGISTRAR MICRO-OBRA EXPRESS</button>
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
                    ${o.latitud && o.longitud ? `<span class="bg-green-100 text-green-700 text-[9px] font-black px-2 py-1 rounded border border-green-300 inline-block ml-2 align-middle mb-1">📍 GPS ACTIVADO</span>` : `<span class="bg-yellow-100 text-yellow-700 text-[9px] font-black px-2 py-1 rounded border border-yellow-300 inline-block ml-2 align-middle mb-1">⚠️ SIN GPS</span>`}
                    
                    ${esAdmin ? `
                    <div class="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase mb-2 mt-2">
                        <div class="bg-white p-2 rounded-xl border">Contrato:<br>Bs. ${o.presupuesto}</div>
                        <div class="bg-white p-2 rounded-xl border">Cobrado Total:<br><span class="text-blue-600">Bs. ${cob}</span></div>
                        <div class="bg-zinc-900 text-white p-2 rounded-xl col-span-2">Utilidad Neta del Proyecto (Tras retenciones y gastos):<br><span class="text-lg ${gNeta >= 0 ? 'text-green-400' : 'text-red-500'}">Bs. ${gNeta.toFixed(1)}</span></div>
                    </div>
                    ` : `<div class="py-2 text-zinc-500 italic text-[10px] font-bold uppercase">Información financiera restringida</div>`}
                    
                    ${btnG}
                    
                    ${esAdmin ? `
                    <div class="pt-2 flex flex-wrap gap-1 justify-between">
                        <button onclick="window.cobrarAnticipo('${id}')" class="flex-[2] bg-blue-600 text-white text-[10px] font-black p-2 rounded-lg shadow-sm">💰 Cobrar Ant.</button>
                        <button onclick="window.corregirAnticipos('${id}')" class="flex-[1.5] bg-red-100 text-red-700 text-[9px] font-black p-2 rounded-lg border border-red-300">Corregir</button>
                        <button onclick="window.cambiarEstadoO('${id}', '${o.estado === 'Entregada' ? 'Activa' : 'Entregada'}')" class="flex-[1.5] text-[9px] font-black p-2 rounded-lg ${o.estado === 'Entregada' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}">Entregar</button>
                    </div>
                    <div class="pt-2 flex flex-wrap gap-1 justify-between mt-1 border-t border-zinc-200">
                        <button onclick="window.editarGPSObra('${id}')" class="flex-[2] bg-zinc-800 text-white text-[9px] font-black p-2 rounded-lg">📍 Fijar GPS</button>
                        <button onclick="window.editarNombreObra('${id}', '${o.nombre}')" class="flex-1 text-blue-600 text-[9px] font-black underline p-2">Editar Nombre</button>
                        <button onclick="window.delO('${id}')" class="flex-1 text-red-500 text-[9px] font-black underline p-2">Borrar</button>
                    </div>
                    ` : ''}
                </div>`;
                o.estado !== 'Entregada' ? cA.innerHTML += card : cE.innerHTML += card;
            });
        });
    });
}
window.agregarLinkObra = (id) => { const l = prompt("Enlace fotos:"); if (l) firebase.database().ref(getDbPath(`obras/${id}`)).update({ link_fotos: l }); };

window.saveO = () => { 
    const n = document.getElementById('o-nom').value.trim(), 
          p = document.getElementById('o-pre').value,
          lat = document.getElementById('o-lat').value,
          lng = document.getElementById('o-lng').value;
    if (n && p) { 
        firebase.database().ref(getDbPath('obras')).push({ 
            nombre: n.toUpperCase(), 
            presupuesto: p, 
            latitud: lat ? parseFloat(lat) : "",
            longitud: lng ? parseFloat(lng) : "",
            estado: 'Activa' 
        }); 
        document.getElementById('o-nom').value = ''; 
        document.getElementById('o-pre').value = ''; 
        if(document.getElementById('o-lat')) document.getElementById('o-lat').value = '';
        if(document.getElementById('o-lng')) document.getElementById('o-lng').value = '';
    } else alert("Campos vacios"); 
};

window.crearMicroObra = () => {
    const n = prompt("Nombre del Tratamiento / Impermeabilización:");
    const pre = prompt("Precio Acordado (Bs):");
    if(n && pre) {
        firebase.database().ref(getDbPath('obras')).push({
            nombre: "EXPRESS: " + n.toUpperCase(),
            presupuesto: parseFloat(pre),
            estado: 'Activa',
            tipo: 'Micro-Obra', 
            fecha_creacion: new Date().toISOString()
        });
        alert("Micro-Obra registrada. Lista para asignar garantías.");
    }
};
window.delO = (id) => { if (confirm("¿Borrar?")) firebase.database().ref(getDbPath(`obras/${id}`)).remove(); };
window.cambiarEstadoO = (id, e) => { firebase.database().ref(getDbPath(`obras/${id}`)).update({ estado: e }); };

window.editarGPSObra = (id) => {
    const lat = prompt("Ingrese la LATITUD (Ejemplo: -17.753245):");
    if(lat === null || lat.trim() === '') return; 
    
    const lng = prompt("Ingrese la LONGITUD (Ejemplo: -63.210981):");
    if(lng === null || lng.trim() === '') return;

    if(!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
        firebase.database().ref(getDbPath(`obras/${id}`)).update({
            latitud: parseFloat(lat),
            longitud: parseFloat(lng)
        }).then(() => alert("📍 Coordenadas GPS vinculadas exitosamente a la obra."));
    } else {
        alert("❌ Error: Solo debe ingresar números. Use el punto (.) para los decimales.");
    }
};

window.cobrarAnticipo = (id) => { 
    const m = prompt("💰 MODO BLINDAJE FINANCIERO:\nIngrese el Monto TOTAL Cobrado al Cliente (Bs.):"); 
    const monto = parseFloat(m);
    if (monto && monto > 0) { 
        const aCaja = monto * 0.80;
        const resHerr = monto * 0.10;
        const resComb = monto * 0.05;
        const resRep = monto * 0.05;
        const retencionTotal = resHerr + resComb + resRep; 

        alert(`💰 BLINDAJE APLICADO EXITOSAMENTE:\n\nIngreso Total Cliente: Bs. ${monto}\n\n🟢 A Caja de Obra (80%): Bs. ${aCaja.toFixed(1)}\n🔴 Retención WRPUMA (20%): Bs. ${retencionTotal.toFixed(1)}`);
        
        data.registrarMovimiento(id, 'anticipo_cliente', monto, `Cobro Real al Cliente (100%)`).then(() => {
            data.registrarMovimiento(id, 'retencion_fondos_wr', retencionTotal, `Descuento Automático 20% (Herramientas, Combustible, Repuestos)`);
        });
    } 
};

window.corregirAnticipos = (id) => {
    const m = prompt("🛠️ MODO CORRECCIÓN:\nIngrese el MONTO TOTAL REAL Y EXACTO que el cliente le ha entregado hasta ahora (Bs):");
    const monto = parseFloat(m);
    if (!isNaN(monto) && monto >= 0) {
        if (confirm(`⚠️ ALERTA DE GERENCIA:\n¿Está seguro de BORRAR el historial de cobros con errores de esta obra y fijar el cobrado real en Bs. ${monto}?`)) {
            firebase.database().ref(getDbPath(`finanzas_obras/${id}`)).once('value').then(snap => {
                const fin = snap.val() || {};
                const updates = {};
                Object.keys(fin).forEach(k => {
                    if(fin[k].tipo === 'anticipo_cliente' || fin[k].tipo === 'retencion_fondos_wr') updates[k] = null;
                });
                
                firebase.database().ref(getDbPath(`finanzas_obras/${id}`)).update(updates).then(() => {
                    if (monto > 0) {
                        data.registrarMovimiento(id, 'anticipo_cliente', monto, "Corrección Gerencia - Cobro Real (100%)").then(() => {
                             data.registrarMovimiento(id, 'retencion_fondos_wr', monto * 0.20, "Corrección Gerencia - Retención (20%)");
                        });
                    }
                    alert("✅ Finanzas reseteadas y corregidas con éxito.");
                });
            });
        }
    }
};

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
// 🛠️ INVENTARIO (HERRAMIENTAS GESTOR CENTRAL)
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
        window.todasHerramientas = h; window.personalDisponibles = p; window.obrasDisponibles = o;

        if(esAdmin) {
            const selT = document.getElementById('h-trabajador'), selO = document.getElementById('h-obra');
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
    const c = document.getElementById('list-herr'); if (!c) return; c.innerHTML = '';
    const esAdmin = (localStorage.getItem('rol_wr') === 'admin');
    const h = window.todasHerramientas || {}, p = window.personalDisponibles || {}, o = window.obrasDisponibles || {};
    let hay = false;

    let opcionesP = `<option value="BODEGA">-- EN BODEGA --</option>`; Object.keys(p).forEach(k => opcionesP += `<option value="${k}">${k}</option>`);
    let opcionesO = `<option value="Ninguna">-- SIN OBRA --</option>`; Object.keys(o).forEach(k => { if(o[k].estado !== 'Entregada') opcionesO += `<option value="${o[k].nombre}">${o[k].nombre}</option>` });

    Object.keys(h).forEach(id => {
        const item = h[id], enB = !item.asignado_a || item.asignado_a === 'BODEGA';
        if (filtro === 'EN USO' && enB) return; if (filtro === 'BODEGA' && !enB) return;
        hay = true;

        if (enB) {
            c.innerHTML += `
            <div class="p-4 bg-zinc-50 rounded-2xl border-2 border-green-500 shadow-sm"><div class="flex justify-between items-center mb-2"><b class="text-sm uppercase text-zinc-800">${item.nombre}</b><span class="text-[9px] bg-green-500 text-white px-2 py-1 rounded-lg font-black">EN BODEGA</span></div>
                ${esAdmin ? `<div class="bg-white p-3 rounded-xl border border-zinc-200 mt-2"><span class="text-[9px] font-black text-zinc-400 block mb-1 uppercase">Entregar a:</span><div class="grid grid-cols-2 gap-2 mb-2"><select id="cardT_${id}" class="p-2 border rounded-lg text-[10px] bg-zinc-50 font-bold">${opcionesP}</select><select id="cardO_${id}" class="p-2 border rounded-lg text-[10px] bg-zinc-50 font-bold">${opcionesO}</select></div><div class="flex gap-2 items-center mt-2 pt-2 border-t"><button onclick="window.cambiarDestinoHerr('${id}')" class="flex-[3] bg-yellow-500 text-white text-[10px] font-black py-2 rounded-lg uppercase">Despachar Equipo</button><button onclick="window.delHerr('${id}')" class="flex-1 text-red-600 text-[10px] font-bold underline">Borrar</button></div></div>` : `<div class="mt-1 text-[10px] text-zinc-500 italic font-bold">Solo Gerencia puede asignar.</div>`}
            </div>`;
        } else {
            c.innerHTML += `
            <div class="p-4 bg-orange-50 rounded-2xl border-2 border-orange-400 shadow-sm"><div class="flex justify-between items-center mb-2"><b class="text-sm uppercase text-orange-900">${item.nombre}</b><span class="text-[9px] bg-orange-500 text-white px-2 py-1 rounded-lg font-black">EN USO</span></div><div class="my-2 p-2 bg-orange-100 border border-orange-200 rounded-xl text-center"><span class="text-[9px] font-black text-orange-800 block uppercase tracking-wider">Poseedor Actual:</span><span class="text-xs font-black text-black">${item.asignado_a} 📍 ${item.obra}</span></div>
                ${esAdmin ? `<div class="bg-white p-3 rounded-xl border border-orange-200 mt-2"><span class="text-[9px] font-black text-orange-700 block mb-1 uppercase">Transferir o mover:</span><div class="grid grid-cols-2 gap-2 mb-2"><select id="cardT_${id}" class="p-2 border rounded-lg text-[10px] bg-zinc-50 font-bold">${opcionesP}</select><select id="cardO_${id}" class="p-2 border rounded-lg text-[10px] bg-zinc-50 font-bold">${opcionesO}</select></div><div class="flex gap-2 mt-2 pt-2 border-t"><button onclick="window.cambiarDestinoHerr('${id}')" class="flex-[2] bg-orange-600 text-white text-[10px] font-black py-2 rounded-lg uppercase">Confirmar Traspaso</button><button onclick="window.devolverAFlotaHerr('${id}')" class="flex-1 bg-zinc-900 text-white text-[10px] font-black py-2 rounded-lg uppercase">Bodega</button><button onclick="window.delHerr('${id}')" class="text-red-600 text-[10px] font-bold px-1 underline">Borrar</button></div></div>` : `<div class="mt-2 text-[10px] text-zinc-600 italic font-bold text-center border-t pt-2 border-orange-200">Verifique posesión física.</div>`}
            </div>`;
        }
    });
    if(!hay) c.innerHTML = `<p class="text-center text-[10px] text-zinc-500 font-bold italic py-6">No hay herramientas aquí.</p>`;
};

window.saveHerr = () => { const nom = document.getElementById('h-nom').value, trabajador = document.getElementById('h-trabajador').value, obra = document.getElementById('h-obra').value; if (nom.trim() !== '') { const lineas = nom.split('\n'); lineas.forEach((linea, index) => { if(linea.trim() !== '') { firebase.database().ref(getDbPath(`herramientas/HERR_${Date.now()}_${index}`)).set({ nombre: linea.trim().toUpperCase(), marca: 'S/M', asignado_a: trabajador, obra: obra, fecha_asignacion: new Date().toISOString() }); } }); document.getElementById('h-nom').value = ''; alert("Equipo registrado."); } else alert("Escriba el nombre."); };
window.cambiarDestinoHerr = (id) => { const t = document.getElementById(`cardT_${id}`).value, o = document.getElementById(`cardO_${id}`).value; if(confirm(`¿Confirmar traspaso a ${t} en: ${o}?`)) { firebase.database().ref(getDbPath(`herramientas/${id}`)).update({ asignado_a: t, obra: o, fecha_asignacion: new Date().toISOString() }, () => alert("Traspaso ejecutado.")); } };
window.devolverAFlotaHerr = (id) => { if(confirm("¿Retornar a Bodega Central?")) { firebase.database().ref(getDbPath(`herramientas/${id}`)).update({ asignado_a: 'BODEGA', obra: 'Ninguna' }); } };
window.delHerr = (id) => { if(confirm("¿Borrar definitivamente?")) { firebase.database().ref(getDbPath(`herramientas/${id}`)).remove(); } };

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
window.gastoFotoBase64 = "";
window.procesarFotoGasto = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            window.gastoFotoBase64 = canvas.toDataURL('image/jpeg', 0.8);
            const preview = document.getElementById('c-foto-preview');
            preview.src = window.gastoFotoBase64;
            preview.style.display = 'block';
        };
    };
};

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
                    
                    <div class="mb-3">
                        <label class="text-[10px] text-green-800 font-bold block mb-1">FOTO DE COMPROBANTE (OPCIONAL):</label>
                        <input type="file" id="c-foto" accept="image/*" capture="environment" onchange="window.procesarFotoGasto(event)" class="w-full text-xs font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 outline-none">
                        <img id="c-foto-preview" src="" style="display:none;" class="mt-2 w-full h-32 object-cover rounded-xl border-2 border-dashed border-green-300">
                    </div>

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
window.saveM = () => { 
    const sO = document.getElementById('c-obra'), idO = sO.value, oN = idO ? sO.options[sO.selectedIndex].text : '', prov = document.getElementById('c-prov').value.trim(), det = document.getElementById('c-detalle').value.trim(), tipo = document.getElementById('c-tipo').value, m = parseFloat(document.getElementById('c-monto').value); 
    if (idO && m && prov) { 
        const txId = Date.now();
        const detF = `${prov.toUpperCase()} | ${det} ${tipo === 'compra_credito' ? '[CRÉDITO]' : '[CONTADO]'}`; 
        data.registrarMovimiento(idO, tipo, m, detF).then(() => { 
            if(tipo === 'compra_credito') { 
                firebase.database().ref(getDbPath(`cuentas_por_pagar/DEUDA_${txId}`)).set({ obra_id: idO, obra_nombre: oN, proveedor: prov.toUpperCase(), detalle: det, monto: m, fecha: new Date().toISOString(), estado: 'Pendiente', foto: window.gastoFotoBase64 || null }); 
            } else if (window.gastoFotoBase64) {
                firebase.database().ref(getDbPath(`gastos_contado_fotos/G_${txId}`)).set({ obra_id: idO, obra_nombre: oN, proveedor: prov.toUpperCase(), detalle: det, monto: m, fecha: new Date().toISOString(), foto: window.gastoFotoBase64 });
            }
            alert("Gasto registrado."); 
            document.getElementById('c-prov').value = '';
            document.getElementById('c-detalle').value = '';
            document.getElementById('c-monto').value = '';
            const fotoInput = document.getElementById('c-foto');
            if(fotoInput) fotoInput.value = '';
            const preview = document.getElementById('c-foto-preview');
            if(preview) preview.style.display = 'none';
            window.gastoFotoBase64 = "";
        }); 
    } 
};
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
window.enviarCarritoWhatsApp = () => { let t = `*PRESUPUESTO WRPUMA*\n\n`; let tt = 0; window.carritoPresupuesto.forEach(i => { t += `*${i.nombre}* - ${i.m2}m2 (Bs.${parseFloat(i.total).toFixed(2)})\n`; tt+=parseFloat(i.total); }); t += `\n*TOTAL VENTA: Bs. ${tt.toFixed(2)}*`; window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(t)}`, '_blank'); };

// ==========================================================
// 📝 COTIZADOR PDF (CON LOGO Y FORMAL)
// ==========================================================
function dibujarCotizador() {
    appDiv.innerHTML = `
    <div class="min-h-screen p-2 text-black bg-zinc-200 pb-20">
        <div class="max-w-4xl mx-auto">
            <div class="bg-zinc-900 p-4 text-white flex justify-between rounded-2xl mb-4"><h2 class="text-sm font-black italic">GESTOR DE DOCUMENTOS</h2><button onclick="window.location.hash='#menu'" class="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">VOLVER</button></div>
            <div class="grid grid-cols-4 gap-2 mb-2">
                <button onclick="window.setDocType('COTIZACION TECNICA')" class="bg-zinc-800 text-white font-bold py-2 rounded-xl text-[10px]">COTIZACION</button>
                <button onclick="window.setDocType('RECIBO DE PAGO')" class="bg-green-600 text-white font-bold py-2 rounded-xl text-[10px]">RECIBO</button>
                <button onclick="window.modoGarantia()" class="bg-yellow-600 text-white font-black py-2 rounded-xl text-[10px]">GARANTIA</button>
                <button onclick="window.modoActa()" class="bg-blue-600 text-white font-black py-2 rounded-xl text-[10px]">ACTA ENTREGA</button>
            </div>
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
    const z = document.getElementById('zona-editable');
    let textoBruto = z.innerText.replace(/####/g, '').replace(/###/g, '').replace(/--- Pegue su cotización aquí ---/g, '').replace(/Como tu asesor.*/g, '').replace(/\*\*WRPUMA\*\*/g, '').trim();
    let lineas = textoBruto.split('\n');
    let h = '';
    let enTabla = false;
    let esPrimeraFila = true;

    lineas.forEach(l => {
        let lineaLimpia = l.trim();
        if (lineaLimpia === '') return;

        if (lineaLimpia.includes('|')) {
            if (!enTabla) {
                h += '<table style="width:100%; border-collapse:collapse; margin:10px 0; font-size:12px; page-break-inside: avoid;">';
                enTabla = true;
                esPrimeraFila = true;
            }
            let estiloFila = esPrimeraFila ? 'background-color:#1e293b; color:white; font-weight:bold; text-align:center;' : 'border-bottom:1px solid #ddd;';
            if (lineaLimpia.toUpperCase().includes('TOTAL')) estiloFila = 'background-color:#fee2e2; color:#b91c1c; font-weight:900;';
            
            h += `<tr style="${esPrimeraFila ? 'border:1px solid #1e293b;' : ''}">`;
            lineaLimpia.split('|').forEach(celda => {
                h += `<td style="padding:6px; border:1px solid #ccc; ${estiloFila}">${celda.trim().replace(/\*/g, '')}</td>`;
            });
            h += '</tr>';
            esPrimeraFila = false;
        } else {
            if (enTabla) { h += '</table>'; enTabla = false; }
            let esNumeral = lineaLimpia.match(/^\d+\.?\s/);
            
            if (esNumeral) {
                h += `<p style="margin: 15px 0 5px 0; font-size:15px; font-weight:900; color:#1e293b; border-bottom:2px solid #f97316; padding-bottom:3px;">${lineaLimpia}</p>`;
            } else {
                h += `<p style="margin: 2px 0; font-size:12px;">${lineaLimpia.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</p>`;
            }
        }
    });
    if (enTabla) h += '</table>';
    z.innerHTML = h;
};
window.modoGarantia = () => { document.getElementById('doc-title').innerText = 'CERTIFICADO DE GARANTIA'; document.getElementById('zona-editable').innerHTML = `<p><b>PROYECTO:</b></p><p><b>CLIENTE:</b></p><p>Se garantiza la estanqueidad por 1 AÑO.</p>`; };
window.modoActa = () => {
    document.getElementById('doc-title').innerText = 'ACTA DE ENTREGA Y CONFORMIDAD';
    document.getElementById('zona-editable').innerHTML = `
    <p><b>PROYECTO:</b> [Nombre de la Obra]</p>
    <p><b>CLIENTE:</b> [Nombre del Cliente]</p>
    <p style="margin-top:20px;">Conste por el presente documento que el cliente recibe a entera satisfacción los trabajos de acabados y pintura decorativa detallados en el contrato correspondiente.</p>
    <p>A partir de la fecha y firma de esta acta, la obra se considera entregada en perfectas condiciones de terminación. Cualquier retoque, reparación o daño posterior provocado por traslados, mudanzas, instalaciones o terceros será considerado como <b>MANTENIMIENTO</b> y tendrá un costo de cotización adicional.</p>
    <p><i>Nota: De acuerdo a las políticas explícitas de WRPUMA, no se emiten garantías sobre pintura decorativa o efectos de alta decoración en interiores.</i></p>
    <br><br><br>
    <div style="display:flex; justify-content:space-between; text-align:center; margin-top:50px;">
        <div style="border-top:1px solid #000; width:40%; padding-top:5px;"><b>Firma Cliente</b></div>
        <div style="border-top:1px solid #000; width:40%; padding-top:5px;"><b>Firma Gerencia WRPUMA</b></div>
    </div>`;
};
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
        <button onclick="window.cambiarMensaje()" class="w-full bg-blue-900 text-white py-3 rounded-2xl font-black text-[10px] mb-4 shadow-lg border border-blue-700">📢 CAMBIAR DIRECTIVA DEL DÍA</button>
        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left mb-4">
            <button onclick="window.location.hash='#asistencia'" class="bg-red-600 text-white aspect-square rounded-3xl font-black text-[12px] shadow-lg">ASISTENCIA</button>
            <button onclick="window.location.hash='#logistica'" class="bg-indigo-600 text-white aspect-square rounded-3xl font-black text-[12px] shadow-lg">🚚 AUDITORÍA Y TRASPASOS</button>
            <button onclick="window.location.hash='#obras'" class="bg-zinc-900 text-white aspect-square rounded-3xl font-black text-[12px] border border-zinc-800">PROYECTOS</button>
            <button onclick="window.location.hash='#tratos'" class="bg-purple-600 text-white aspect-square rounded-3xl font-black text-[12px] shadow-lg">TRATOS</button>
            <button onclick="window.location.hash='#personal'" class="bg-zinc-100 text-black aspect-square rounded-3xl font-black text-[12px]">PERSONAL</button>
            <button onclick="window.location.hash='#almacen'" class="bg-orange-600 text-white aspect-square rounded-3xl font-black text-[12px] shadow-lg">APU</button>
            <button onclick="window.location.hash='#planilla'" class="col-span-2 bg-zinc-900 text-white py-4 rounded-2xl font-black text-[12px] border border-zinc-800">PAGOS Y SUELDOS</button>
            <button onclick="window.location.hash='#cotizaciones'" class="col-span-2 bg-white text-red-600 py-6 rounded-2xl font-black text-[12px] shadow-lg border-b-4 border-zinc-300">GENERAR PDF / WORD</button>
            <button onclick="window.location.hash='#calculadora'" class="col-span-2 bg-blue-600 text-white py-6 rounded-2xl font-black text-[12px] shadow-lg border-b-4 border-blue-800">CALCULADORA OPERATIVA</button>
            <button onclick="window.location.hash='#contabilidad'" class="col-span-1 bg-green-600 text-white py-4 rounded-2xl font-black text-[10px] shadow-lg">CONTROL GASTOS</button>
            <button onclick="window.location.hash='#utilidad'" class="col-span-1 bg-zinc-900 text-red-500 py-4 rounded-2xl font-black text-[10px] border border-zinc-800">REPORTE FINANZAS</button>
        </div>` : ``}
        
        ${rol === 'super' ? `
        <div class="grid grid-cols-1 gap-4 max-w-sm mx-auto text-left mb-4">
            <button onclick="window.location.hash='#logistica'" class="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-[12px] shadow-lg text-center uppercase tracking-widest">🚚 AUDITORÍA Y TRASPASOS</button>
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
        if (usuarioActual !== nombreLimpio) { localStorage.setItem('empresa_wr', 'Walter'); localStorage.setItem('u_wr', nombreLimpio); localStorage.setItem('a_wr', 'false'); localStorage.setItem('rol_wr', 'trabajador'); }
        window.location.hash = '#panel-trabajador';
    }

    const h = window.location.hash, rol = localStorage.getItem('rol_wr');
    if (!rol && h !== '') { window.location.hash = ''; return; }
    if (rol === 'trabajador' && h !== '#panel-trabajador') { window.location.hash = '#panel-trabajador'; return; }
    
    if (h === '#panel-trabajador') dibujarPanelTrabajador();
    else if (h === '#solicitudes') dibujarSolicitudes();
    else if (h === '#historial-solicitudes') window.verHistorialSolicitudes();
    else if (h === '#asistencia') dibujarAsistencia(); 
    else if (h === '#obras') dibujarObras();
    else if (h === '#personal') dibujarPersonal();
    else if (h === '#planilla') dibujarPlanilla();
    else if (h === '#historial-sueldos') window.verHistorialSueldos();
    else if (h === '#cotizaciones') dibujarCotizador();
    else if (h === '#calculadora') dibujarCalculadora();
    else if (h === '#tratos') dibujarTratos();
    else if (h === '#herramientas') dibujarHerramientas();
    else if (h === '#logistica') dibujarLogistica();
    else if (h === '#contabilidad') dibujarCaja();
    else if (h === '#utilidad') dibujarUtilidad();
    else if (h === '#almacen') dibujarAlmacen();
    else if (h === '#menu') dibujarMenu();
    else window.dibujarAcceso();
}

window.dibujarAcceso = () => {
    appDiv.innerHTML = `<div class="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center"><h1 class="text-6xl font-black text-white italic mb-10">WR<span class="text-red-600">PUMA</span></h1><div class="grid gap-4 w-full max-w-xs"><button onclick="window.verAccesoPro('walter')" class="bg-red-600 text-white py-4 rounded-2xl font-black text-lg">ACCESO GERENCIA</button><button onclick="window.verAccesoPro('napoleon')" class="bg-blue-600 text-white py-4 rounded-2xl font-black text-lg">ACCESO DIRECCION</button><button onclick="window.verAccesoPro('super')" class="bg-zinc-800 text-zinc-300 py-3 rounded-2xl font-black text-sm border border-zinc-700 mt-4">ACCESO SUPERVISOR</button><div class="border-t border-zinc-800 pt-4 mt-2"><button onclick="window.verAccesoPro('trabajador')" class="w-full bg-zinc-900 text-green-500 py-4 rounded-2xl font-black text-xs border border-zinc-800">ACCESO TRABAJADOR / ASISTENCIA</button></div></div></div>`;
};

window.cambiarMensaje = () => { const msg = prompt("Escriba la nueva directiva o mensaje del día:"); if (msg) { firebase.database().ref(getDbPath('config/mensaje_dia')).set(msg).then(() => alert("Mensaje actualizado.")); } };

window.addEventListener('hashchange', enrutador); window.addEventListener('load', enrutador); enrutador();
