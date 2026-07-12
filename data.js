// ==========================================================
// 🚀 WRPUMA ELITE - DATA.JS (VERSIÓN OPTIMIZADA PRO)
// ==========================================================

// CONFIGURACIÓN OFICIAL WRPUMA
const firebaseConfig = {
    apiKey: "AIzaSyCuH9Rub9DRy0cUQgCQe7dN6_qxnhNqhMEk",
    authDomain: "wrpuma-control.firebaseapp.com",
    databaseURL: "https://wrpuma-control-default-rtdb.firebaseio.com",
    projectId: "wrpuma-control",
    storageBucket: "wrpuma-control.firebasestorage.app",
    messagingSenderId: "371296735201",
    appId: "1:371296735201:web:96e2a278635591340b008d"
};

// INICIALIZACIÓN SEGURA
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// ENRUTADOR DE EMPRESA (WALTER / NAPOLEON)
const getDbPath = (path) => {
    const empresa = localStorage.getItem('empresa_wr') || 'Walter';
    if (empresa === 'Walter') {
        return path === '' ? '/' : path;
    } else {
        return path === '' ? `cuentas/${empresa}` : `cuentas/${empresa}/${path}`;
    }
};

// ==========================================================
// 👷 MÓDULO PERSONAL
// ==========================================================
export const guardarPintor = (n, s) => firebase.database().ref(getDbPath('personal/' + n)).set({ nombre: n.toUpperCase(), sueldo_dia: parseFloat(s) || 0 });
export const borrarPintor = (n) => firebase.database().ref(getDbPath('personal/' + n)).remove();
export const obtenerPersonal = (cb) => {
    // Optimizado: Usamos .once() para evitar saturar la memoria del celular
    firebase.database().ref(getDbPath('personal')).once('value').then((s) => cb(s.val() || {}));
};

// ==========================================================
// 🏗️ MÓDULO OBRAS
// ==========================================================
export const guardarObra = (n, p) => {
    const id = n.toLowerCase().replace(/\s+/g, '-');
    return firebase.database().ref(getDbPath('obras/' + id)).set({ nombre: n.toUpperCase(), presupuesto: parseFloat(p) || 0, estado: 'Activa' });
};
export const borrarObra = (id) => {
    firebase.database().ref(getDbPath(`finanzas_obras/${id}`)).remove();
    return firebase.database().ref(getDbPath('obras/' + id)).remove();
};
export const obtenerObras = (cb) => {
    // Optimizado: .once() para mayor velocidad de carga
    firebase.database().ref(getDbPath('obras')).once('value').then((s) => cb(s.val() || {}));
};
export const cambiarEstadoObra = (id, estado) => firebase.database().ref(getDbPath(`obras/${id}`)).update({ estado: estado });

// ==========================================================
// 💰 MÓDULO FINANZAS Y ASISTENCIA
// ==========================================================
export const registrarMovimiento = (id, t, m, d) => firebase.database().ref(getDbPath(`finanzas_obras/${id}`)).push({ tipo: t, monto: parseFloat(m) || 0, detalle: d });

export const guardarAsistenciaPro = (n, o, m, h) => {
    const fID = new Date().toISOString().split('T')[0];
    return firebase.database().ref(getDbPath(`asistencia_semanal/${fID}/${n}`)).set({ nombre: n, obra: o, monto_anticipo: parseFloat(m) || 0, horas_extra: parseFloat(h) || 0 });
};

// ==========================================================
// 🚀 MOTOR DE CARGA ACELERADA (ELIMINA EL CUELLO DE BOTELLA)
// ==========================================================
export const obtenerTodo = (cb) => {
    // En lugar de descargar TODA la base de datos (lo que ponía lenta la app),
    // hacemos llamadas precisas en paralelo (Promise.all) solo a lo que necesitamos.
    // Esto reduce el consumo de datos y hace que las pantallas abran al instante.
    
    Promise.all([
        firebase.database().ref(getDbPath('obras')).once('value'),
        firebase.database().ref(getDbPath('finanzas_obras')).once('value'),
        firebase.database().ref(getDbPath('personal')).once('value'),
        firebase.database().ref(getDbPath('asistencia_semanal')).once('value'),
        firebase.database().ref(getDbPath('pagos_historial')).once('value'),
        firebase.database().ref(getDbPath('herramientas')).once('value')
    ]).then(resultados => {
        cb({
            obras: resultados[0].val() || {},
            finanzas_obras: resultados[1].val() || {},
            personal: resultados[2].val() || {},
            asistencia_semanal: resultados[3].val() || {},
            pagos_historial: resultados[4].val() || {},
            herramientas: resultados[5].val() || {}
        });
    }).catch(error => {
        console.error("Error en la carga optimizada:", error);
        cb({}); // Devuelve vacío si falla la conexión en lugar de congelar la pantalla
    });
};
