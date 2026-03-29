import { menuItems, inventoryData, WORKERS, PLANILLA_DIARIA, OBRAS, GASTOS, getState, setUser, navigateTo, syncCloud } from './data.js';

function createElement(tag, className, html) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
}

// 🚪 LOGIN
export function renderLogin() {
    const c = createElement('div', 'flex flex-col items-center justify-center h-screen bg-black px-6');
    c.innerHTML = `
        <div class="p-10 text-center w-full max-w-sm border-t-8 border-red-600 bg-white rounded-[3rem] shadow-2xl">
            <img src="529221.jpg" class="w-48 mx-auto mb-4">
            <h1 class="text-4xl font-black text-black mb-1 italic">WR<span class="text-red-600">PUMA</span></h1>
            <p class="text-[9px] tracking-widest font-bold text-gray-400 mb-10 uppercase italic text-center">Gestión de Elite</p>
            <button id="bW" class="w-full mb-4 bg-red-600 text-white py-8 rounded-3xl font-black text-2xl active:scale-95 shadow-lg">👨‍💼 WALTER</button>
            <button id="bN" class="w-full bg-black text-white py-8 rounded-3xl font-black text-2xl active:scale-95 shadow-lg">👷 NAPOLEÓN</button>
        </div>`;
    setTimeout(() => {
        document.getElementById('bW').onclick = () => { setUser({ name: 'Walter', role: 'owner' }); navigateTo('menu'); };
        document.getElementById('bN').onclick = () => { setUser({ name: 'Napoleón', role: 'supervisor' }); navigateTo('menu'); };
    }, 100);
    return c;
}

// 📋 MENÚ
export function renderMenu() {
    const s = getState();
    const c = createElement('div', 'p-6 w-full bg-gray-50 min-h-screen');
    c.innerHTML = `<div class="flex justify-between items-center mb-10">
        <div class="flex items-center gap-3"><img src="529219.jpg" class="h-10"><div><h1 class="text-2xl font-black text-black">WRPUMA</h1><p class="text-[9px] font-bold text-red-600 uppercase italic">${s.user.role === 'owner' ? 'Dueño' : 'Supervisor'}</p></div></div>
        <button id="lo" class="bg-black text-white p-4 rounded-xl font-black text-[10px] uppercase">SALIR</button></div>`;
    const g = createElement('div', 'grid grid-cols-2 gap-5');
    menuItems.forEach(i => {
        if (s.user.role !== 'owner' && (i.view === 'finanzas' || i.view === 'gastos')) return;
        const card = createElement('div', 'bg-white flex flex-col items-center justify-center p-10 text-center rounded-[3rem] shadow-sm border-b-8 border-gray-200 active:border-red-600 active:scale-95 transition-all');
        card.innerHTML = `<div class="text-6xl mb-3">${i.icon}</div><div class="font-black text-[11px] text-black uppercase italic">${i.text}</div>`;
        card.onclick = () => navigateTo(i.view);
        g.appendChild(card);
    });
    setTimeout(() => { document.getElementById('lo').onclick = () => navigateTo('login'); }, 100);
    c.appendChild(g); return c;
}

// 👷 PERSONAL
export function renderPersonal() {
    const s = getState();
    const c = createElement('div', 'p-6 w-full bg-white min-h-screen');
    let h = `<button class="mb-6 font-black text-red-600 uppercase text-xs italic" id="bk">← VOLVER</button>`;
    if (s.user.role === 'owner') {
        h += `<div class="bg-gray-100 p-8 rounded-[3rem] mb-10 border-2 border-black/5 shadow-inner">
            <h3 class="font-black text-xs text-black mb-6 uppercase text-center italic underline">Contratar Personal</h3>
            <input id="nP" placeholder="Nombre completo" class="w-full p-5 mb-3 rounded-2xl border-none font-bold text-lg shadow-sm text-center">
            <input id="jP" type="number" placeholder="Jornal Bs/día" class="w-full p-5 mb-6 rounded-2xl border-none font-black text-lg text-center">
            <button id="addP" class="w-full bg-black text-white p-6 rounded-2xl font-black text-sm uppercase italic active:bg-red-600">AÑADIR PINTOR</button>
        </div>`;
    }
    h += `<h2 class="font-black text-2xl mb-8 text-black border-l-8 border-red-600 pl-4 uppercase italic">Asistencia Diaria</h2>
        <div class="bg-gray-50 p-8 rounded-[3rem] shadow-xl mb-10 border-2 border-gray-100">
            <select id="selO_P" class="w-full p-5 mb-6 bg-white rounded-2xl font-black border-none shadow-sm">${OBRAS.map(o => `<option value="${o.nombre}">${o.nombre}</option>`).join('')}</select>
            <div id="listaWorkers" class="space-y-4 mb-8">
                ${WORKERS.map(w => `<div class="flex items-center gap-3 p-5 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-red-600 cursor-pointer" onclick="window.workerSelected='${w.nombre}'; this.parentNode.querySelectorAll('div').forEach(d=>d.style.borderColor='transparent'); this.style.borderColor='#dc2626'">
                    <div class="flex-1 font-black uppercase text-sm italic">${w.nombre} ${s.user.role === 'owner' ? `<br><small class="text-red-600">Bs. ${w.jornal}/Día</small>` : ''}</div>
                    ${s.user.role === 'owner' ? `<button onclick="if(confirm('¿Borrar?')){ WORKERS.splice(WORKERS.indexOf(WORKERS.find(x=>x.nombre==='${w.nombre}')),1); syncCloud(); navigateTo('personal'); }" class="bg-red-50 text-red-600 p-3 rounded-xl text-[8px] font-black uppercase">Borrar</button>` : ''}
                </div>`).join('')}
            </div>
            <div class="grid grid-cols-3 gap-3 mb-6">
                <button onclick="window.asist='1'" class="bg-black text-white p-5 rounded-2xl text-[9px] font-black uppercase">Día</button>
                <button onclick="window.asist='0.5'" class="bg-gray-200 text-black p-5 rounded-2xl text-[9px] font-black uppercase">Medio</button>
                <button onclick="window.asist='0'" class="bg-red-600 text-white p-5 rounded-2xl text-[9px] font-black uppercase">Falta</button>
            </div>
            <input type="number" id="antP" placeholder="Vale Bs." class="w-full p-6 mb-8 bg-white rounded-2xl font-black text-xl shadow-inner border-none text-center">
            <button id="saveP" class="w-full bg-red-600 text-white p-7 rounded-[2.5rem] font-black text-xl shadow-xl uppercase italic">GUARDAR ASISTENCIA</button>
        </div>`;
    c.innerHTML = h;
    setTimeout(() => {
        document.getElementById('bk').onclick = () => navigateTo('menu');
        if (document.getElementById('addP')) document.getElementById('addP').onclick = () => {
            const n = document.getElementById('nP').value; const j = document.getElementById('jP').value;
            if (n && j) { WORKERS.push({ nombre: n, jornal: j }); syncCloud(); navigateTo('personal'); }
        };
        document.getElementById('saveP').onclick = () => {
            if (!window.workerSelected) return alert('¡Selecciona un pintor!');
            PLANILLA_DIARIA.push({ nombre: window.workerSelected, asistencia: window.asist, anticipo: document.getElementById('antP').value || 0, obra: document.getElementById('selO_P').value });
            syncCloud(); navigateTo('personal');
        };
    }, 100);
    return c;
}

// 📦 INVENTARIO
export function renderInventory() {
    const c = createElement('div', 'p-6 w-full bg-white min-h-screen');
    c.innerHTML = `
        <button class="mb-6 font-black text-red-600 uppercase text-xs italic" id="bk">← VOLVER</button>
        <div class="bg-black p-8 rounded-[3rem] mb-10 shadow-2xl">
            <h3 class="font-black text-xs text-red-600 mb-6 uppercase text-center italic underline">Cargar Materiales</h3>
            <input id="nI" placeholder="Ej: Látex 18L" class="w-full p-5 mb-3 bg-gray-900 text-white rounded-2xl border-none font-bold text-center uppercase">
            <input id="cI" type="number" placeholder="Cantidad" class="w-full p-5 mb-4 bg-gray-900 text-white rounded-2xl border-none font-black text-2xl text-center">
            <select id="selDest" class="w-full p-5 mb-8 bg-gray-900 text-white rounded-2xl border-none font-black italic">
                <option value="ALMACÉN">ALMACÉN CENTRAL</option>
                ${OBRAS.map(o => `<option value="${o.nombre}">${o.nombre}</option>`).join('')}
            </select>
            <button id="addI" class="w-full bg-red-600 text-white p-7 rounded-2xl font-black text-lg uppercase shadow-lg shadow-red-900">Mover a Stock</button>
        </div>
        <h2 class="text-2xl font-black mb-8 italic border-l-8 border-black pl-4 uppercase leading-none text-center">Inventario Pro</h2>
        <div class="space-y-6">
            <div class="bg-gray-100 p-8 rounded-[3.5rem] italic font-bold uppercase text-[10px]">
                <h4 class="mb-4 border-b-2 border-black pb-2 text-center">🏢 ALMACÉN CENTRAL</h4>
                ${inventoryData.filter(i => i.dest === 'ALMACÉN').map(i => `<div class="flex justify-between py-4 border-b border-gray-200"><span>${i.material}</span><b class="text-xl text-black">${i.cantidad}</b></div>`).join('')}
            </div>
            ${OBRAS.map(o => `<div class="bg-red-50 p-8 rounded-[3.5rem] border-2 border-red-100 italic font-bold uppercase text-[10px]">
                <h4 class="mb-4 border-b-2 border-red-600 pb-2 text-red-600 text-center">🏗️ OBRA: ${o.nombre}</h4>
                ${inventoryData.filter(i => i.dest === o.nombre).map(i => `<div class="flex justify-between py-4 border-b border-red-200 text-black"><span>${i.material}</span><b class="text-xl text-red-600">${i.cantidad}</b></div>`).join('')}
            </div>`).join('')}
        </div>`;
    setTimeout(() => {
        document.getElementById('bk').onclick = () => navigateTo('menu');
        document.getElementById('addI').onclick = () => {
            const n = document.getElementById('nI').value; const ct = document.getElementById('cI').value;
            if (n && ct) { inventoryData.push({ material: n, cantidad: ct, dest: document.getElementById('selDest').value }); syncCloud(); navigateTo('inventory'); }
        };
    }, 100);
    return c;
}

// 💰 FINANZAS
export function renderFinanzas() {
    const c = createElement('div', 'p-6 w-full bg-white min-h-screen font-sans');
    const totalS = WORKERS.reduce((t, w) => t + (PLANILLA_DIARIA.filter(r => r.nombre === w.nombre).reduce((st, r) => st + parseFloat(r.asistencia), 0) * (w.jornal || 0)), 0);
    const totalG = GASTOS.reduce((t, g) => t + parseFloat(g.monto), 0);
    const ingT = OBRAS.reduce((t, o) => t + parseFloat(o.contrato || 0), 0);
    const uGlobal = ingT - (totalS + totalG);
    c.innerHTML = `<button class="mb-10 font-black text-red-600 uppercase text-xs italic" id="bk">← VOLVER</button>
        <div class="bg-black text-white p-12 rounded-[4.5rem] shadow-2xl mb-12 relative overflow-hidden text-center">
            <h2 class="text-red-600 font-black text-[11px] mb-8 uppercase tracking-[0.5em] italic">Utilidad Neta Hoy</h2>
            <h3 class="text-7xl font-black mb-12 italic leading-none tracking-tighter">Bs. ${uGlobal.toLocaleString()}</h3>
        </div>
        <h2 class="text-2xl font-black mb-10 italic border-l-8 border-black pl-5 uppercase leading-none">Rendimiento por Obra</h2>
        <div class="space-y-8 italic">${OBRAS.map(o => {
        const sObra = PLANILLA_DIARIA.filter(r => r.obra === o.nombre).reduce((t, r) => t + (parseFloat(r.asistencia) * (WORKERS.find(w => w.nombre === r.nombre)?.jornal || 0)), 0);
        const gObra = GASTOS.filter(g => g.obra === o.nombre).reduce((t, g) => t + parseFloat(g.monto), 0);
        const cost = sObra + gObra; const util = parseFloat(o.contrato || 0) - cost;
        const por = o.contrato > 0 ? ((util / o.contrato) * 100).toFixed(0) : 0;
        return `<div class="bg-gray-100 p-8 rounded-[4rem] border-2 border-gray-200 shadow-sm">
                <div class="flex justify-between items-start mb-6"><div><h4 class="font-black text-2xl uppercase leading-none mb-2 text-black italic underline tracking-tighter">${o.nombre}</h4><span class="text-[10px] font-bold text-gray-400 uppercase italic">Bs. ${parseFloat(o.contrato).toLocaleString()}</span></div><div class="bg-black text-white px-5 py-2 rounded-full text-[12px] font-black italic shadow-lg">${por}% PROFIT</div></div>
                <div class="grid grid-cols-2 gap-5"><div class="bg-white p-6 rounded-[2rem] shadow-inner font-black uppercase text-[9px] italic text-red-600"><p class="mb-2 leading-none">Inversión</p><b class="text-xl">Bs. ${cost.toLocaleString()}</b></div><div class="bg-white p-6 rounded-[2rem] shadow-inner font-black uppercase text-[9px] italic text-black"><p class="mb-2 leading-none">Ganancia</p><b class="text-xl">Bs. ${util.toLocaleString()}</b></div></div></div>`;
    }).join('')}</div>`;
    setTimeout(() => document.getElementById('bk').onclick = () => navigateTo('menu'), 100);
    return c;
}

// 🏗️ OBRAS
export function renderObras() {
    const c = createElement('div', 'p-6 bg-white min-h-screen');
    c.innerHTML = `<button class="mb-6 font-black text-red-600 uppercase text-xs italic" id="bk">← VOLVER</button>
        <div class="bg-gray-100 p-8 rounded-[3rem] mb-10 border-2 border-black/5">
            <h3 class="font-black text-[10px] text-gray-400 mb-6 uppercase text-center italic underline">Iniciar Proyecto</h3>
            <input id="nO" placeholder="Nombre de la Obra" class="w-full p-5 mb-3 rounded-2xl border-none font-bold shadow-sm uppercase text-center">
            <input id="pO" type="number" placeholder="Precio Contrato Bs." class="w-full p-5 mb-8 rounded-2xl border-none font-black shadow-sm text-center text-xl">
            <button id="addO" class="w-full bg-black text-white p-6 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95 italic">Abrir Obra</button>
        </div>
        <div class="space-y-6">${OBRAS.map(o => `<div class="bg-white p-8 rounded-[3.5rem] border-4 border-gray-50 shadow-sm relative italic"><h3 class="font-black text-2xl uppercase leading-none mb-3 tracking-tighter">${o.nombre}</h3><p class="text-[11px] font-black text-red-600 italic uppercase underline mb-8">Contrato: Bs. ${parseFloat(o.contrato).toLocaleString()}</p><input type="file" accept="image/*" capture="camera" class="block w-full bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 font-black text-[10px] uppercase"></div>`).join('')}</div>`;
    setTimeout(() => {
        document.getElementById('bk').onclick = () => navigateTo('menu');
        document.getElementById('addO').onclick = () => { const n = document.getElementById('nO').value; const p = document.getElementById('pO').value; if (n && p) { OBRAS.push({ nombre: n, contrato: p }); syncCloud(); navigateTo('obras'); } };
    }, 100);
    return c;
}

// 💸 GASTOS
export function renderGastos() {
    const c = createElement('div', 'p-6 bg-white min-h-screen');
    c.innerHTML = `<button class="mb-6 font-black text-red-600 uppercase text-xs italic" id="bk">← VOLVER</button>
        <div class="bg-gray-100 p-8 rounded-[3rem] mb-10 border-2 border-black/5">
            <h2 class="font-black text-3xl mb-8 uppercase text-black italic leading-none border-l-8 border-red-600 pl-4">Caja Chica</h2>
            <select id="selO_G" class="w-full p-6 mb-4 bg-white rounded-2xl font-black border-none shadow-sm">${OBRAS.map(o => `<option value="${o.nombre}">${o.nombre}</option>`).join('')}</select>
            <input type="text" id="dG" placeholder="Detalle (Lijas, Rodillos...)" class="w-full p-6 mb-3 bg-white rounded-2xl font-bold uppercase text-xs italic text-center">
            <input type="number" id="mG" placeholder="Monto Bs." class="w-full p-6 mb-10 bg-white rounded-2xl font-black text-2xl text-center shadow-inner">
            <button id="sG" class="w-full bg-red-600 text-white p-6 rounded-2xl font-black text-lg shadow-xl uppercase italic">Registrar Salida</button>
        </div>
        <div class="space-y-4 uppercase text-[10px] font-black italic">${GASTOS.map(g => `<div class="flex justify-between p-6 bg-white border-b-2 border-gray-100 border-l-8 border-black shadow-sm rounded-r-2xl"><span>${g.det} (${g.obra})</span><b class="text-red-600 text-sm">Bs. ${g.monto}</b></div>`).join('')}</div>`;
    setTimeout(() => {
        document.getElementById('bk').onclick = () => navigateTo('menu');
        document.getElementById('sG').onclick = () => { const d = document.getElementById('dG').value; const m = document.getElementById('mG').value; if (d && m > 0) { GASTOS.unshift({ det: d, monto: m, obra: document.getElementById('selO_G').value }); syncCloud(); navigateTo('gastos'); } };
    }, 100);
    return c;
}

// 📋 COTIZADOR
export function renderCotizador() {
    const c = createElement('div', 'p-6 w-full bg-white min-h-screen');
    c.innerHTML = `<button class="mb-10 font-black text-red-600 uppercase text-xs italic" id="bk">← VOLVER</button>
        <div class="p-10 rounded-[4.5rem] border-8 border-black shadow-2xl bg-gray-50 text-center relative overflow-hidden">
            <h2 class="text-3xl font-black mb-12 text-black uppercase italic border-b-4 border-red-600 pb-6 underline">Calculadora</h2>
            <input type="number" id="m2" placeholder="Área (m2)" class="w-full p-12 mb-8 bg-white rounded-[2.5rem] font-black text-center text-6xl shadow-inner border-none text-red-600 italic">
            <button id="cl" class="w-full bg-red-600 text-white p-8 rounded-[2.5rem] font-black text-2xl shadow-xl uppercase italic">Calcular</button>
            <div id="re" class="mt-12 hidden p-10 bg-black rounded-[3rem] text-white text-center shadow-2xl border-t-8 border-red-600 italic"></div>
        </div>`;
    setTimeout(() => {
        document.getElementById('bk').onclick = () => navigateTo('menu');
        document.getElementById('cl').onclick = () => {
            const m = document.getElementById('m2').value;
            const cant = Math.ceil(m / 70);
            const res = document.getElementById('re');
            res.innerHTML = `<h4 class="text-8xl font-black leading-none">${cant}</h4><p class="text-[14px] font-black text-gray-500 uppercase mt-4 italic">Baldes de 18L</p>`;
            res.classList.remove('hidden');
        };
    }, 100);
    return c;
}