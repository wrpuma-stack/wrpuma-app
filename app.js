// ==========================================================
// 💰 PLANILLA DE PAGOS (MODO GERENCIA - PAGO DIRECTO)
// ==========================================================
function dibujarPlanilla() {
    appDiv.innerHTML = `
    <div class="min-h-screen bg-black p-4 text-white font-sans text-center">
        <div class="max-w-md mx-auto">
            <div class="flex justify-between mb-4">
                <h2 class="text-2xl font-black italic text-red-600">PLANILLA DE PAGOS</h2>
                <button onclick="window.location.hash='#menu'" class="bg-zinc-800 px-4 rounded-full text-xs font-bold">VOLVER</button>
            </div>
            <div class="bg-zinc-900 p-4 rounded-2xl mb-4 flex gap-2 text-[10px] font-bold">
                <div class="flex-1 text-left">
                    <label class="text-zinc-500">Periodo Inicial</label>
                    <input type="date" value="${pFIni}" onchange="window.chPIni(this.value)" class="w-full bg-black p-2 rounded-lg text-white">
                </div>
                <div class="flex-1 text-left">
                    <label class="text-zinc-500">Periodo Final</label>
                    <input type="date" value="${pFFin}" onchange="window.chPFin(this.value)" class="w-full bg-black p-2 rounded-lg text-white">
                </div>
            </div>
            <div id="c-p" class="space-y-4 text-left pb-10"></div>
        </div>
    </div>`;

    data.obtenerTodo((db) => {
        const c = document.getElementById('c-p'); if (!c) return;
        const per = db.personal || {}; 
        const hist = db.asistencia_semanal || {}; 
        const pagosRealizados = db.pagos_historial || {}; // Nueva rama para control
        const res = {};

        // 1. Calcular montos por persona en el rango de fechas
        Object.keys(hist).forEach(f => {
            if (f >= pFIni && f <= pFFin) {
                Object.values(hist[f]).forEach(reg => {
                    // Si ya existe un registro de pago para este trabajador en este rango, lo saltamos
                    const idPagoReferencia = `${reg.nombre}_${pFIni}_${pFFin}`;
                    if (pagosRealizados[idPagoReferencia]) return;

                    if (!res[reg.nombre]) res[reg.nombre] = { dNorm: 0, dExt: 0, ant: 0, obraPrincipal: reg.obra };
                    
                    let jN = parseFloat(reg.jornada_normal !== undefined ? reg.jornada_normal : (reg.jornada || 1));
                    let jE = parseFloat(reg.jornada_extra || 0);

                    res[reg.nombre].dNorm += jN;
                    res[reg.nombre].dExt += jE;
                    res[reg.nombre].ant += parseFloat(reg.monto_anticipo) || 0;
                });
            }
        });

        c.innerHTML = ''; let tP = 0;
        const listaPendientes = Object.keys(res);

        if (listaPendientes.length === 0) {
            c.innerHTML = `<div class="text-center p-10 text-zinc-500 font-bold uppercase text-xs">No hay pagos pendientes para este periodo.</div>`;
            return;
        }

        listaPendientes.forEach(n => {
            const d = res[n], sDia = parseFloat(per[n]?.sueldo_dia) || 0;
            const dominical = d.dNorm >= 5.5 ? 0.5 : 0;
            const dNormPagar = d.dNorm + dominical;
            const sTot = (dNormPagar + d.dExt) * sDia;
            const saldo = sTot - d.ant;
            tP += saldo;

            let textoDominical = dominical > 0 ? `<span class="text-green-400 font-bold">+0.5 Dominical</span>` : `<span class="text-red-400 font-bold">Sin Dominical</span>`;

            c.innerHTML += `
            <div class="bg-zinc-900 p-6 rounded-3xl border-l-4 border-red-600 shadow-xl">
                <div class="flex justify-between mb-2">
                    <h3 class="font-black text-xl uppercase">${n}</h3>
                    <span class="bg-red-600 px-2 rounded-lg font-black text-[10px] py-1 text-center">${(dNormPagar + d.dExt).toFixed(1)} D<br>POR PAGAR</span>
                </div>
                <div class="text-[10px] text-zinc-400 mb-4 grid grid-cols-2 gap-1">
                    <div>Salario Base: Bs.${sDia}</div>
                    <div>Deducciones: -Bs.${d.ant}</div>
                    <div>Jornada Normal: ${d.dNorm}D</div>
                    <div>Bono Dominical: ${textoDominical}</div>
                </div>
                <button onclick="window.ejecutarPagoEfectivo('${n}', ${saldo}, '${d.obraPrincipal}')" class="w-full bg-green-600 text-white py-4 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-transform uppercase">
                    PAGAR SALDO: Bs. ${saldo.toFixed(2)}
                </button>
            </div>`;
        });

        if (tP > 0) {
            c.innerHTML = `<div class="bg-green-600 p-4 rounded-2xl mb-4 text-center shadow-2xl"><p class="text-[10px] font-black mb-1 uppercase">Total Pendiente de Desembolso</p><span class="text-3xl font-black">Bs. ${tP.toFixed(2)}</span></div>` + c.innerHTML;
        }
    });
}

window.ejecutarPagoEfectivo = (nombre, monto, obraNombre) => {
    if (confirm(`¿Confirmas que ya transferiste Bs. ${monto.toFixed(2)} a ${nombre}? \n\nEste monto se descontará automáticamente de la utilidad de la obra: ${obraNombre}`)) {
        
        // 1. Buscar el ID de la obra por su nombre para descontar de finanzas
        firebase.database().ref(getDbPath('obras')).once('value').then(snap => {
            const obras = snap.val() || {};
            const idObra = Object.keys(obras).find(id => obras[id].nombre === obraNombre);

            if (idObra) {
                // 2. Registrar el egreso en la obra para que baje la Utilidad Neta
                data.registrarMovimiento(idObra, 'pago_sueldo', monto, `Sueldo: ${nombre} (Periodo ${pFIni} al ${pFFin})`);
                
                // 3. Marcar como pagado en el historial para que desaparezca de la planilla
                const idPagoReferencia = `${nombre}_${pFIni}_${pFFin}`;
                firebase.database().ref(getDbPath(`pagos_historial/${idPagoReferencia}`)).set({
                    fecha_pago: new Date().toISOString(),
                    trabajador: nombre,
                    monto: monto,
                    periodo: `${pFIni} / ${pFFin}`
                }).then(() => {
                    alert(`Pago de ${nombre} registrado con éxito.`);
                    dibujarPlanilla();
                });
            } else {
                alert("Error: No se encontró la obra para descontar el sueldo. El pago se marcará pero no afectará la utilidad.");
            }
        });
    }
};
