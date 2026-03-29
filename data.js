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

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }

const getDbPath = (path) => {
    const empresa = localStorage.getItem('empresa_wr') || 'Walter';
    if (empresa === 'Walter') {
        return path === '' ? '/' : path;
    } else {
        return path === '' ? `cuentas/${empresa}` : `cuentas/${empresa}/${path}`;
    }
};

export const guardarPintor = (n, s) => firebase.database().ref(getDbPath('personal/' + n)).set({ nombre: n.toUpperCase(), sueldo_dia: parseFloat(s) || 0 });
export const borrarPintor = (n) => firebase.database().ref(getDbPath('personal/' + n)).remove();
export const obtenerPersonal = (cb) => firebase.database().ref(getDbPath('personal')).on('value', (s) => cb(s.val() || {}));

export const guardarObra = (n, p) => {
    const id = n.toLowerCase().replace(/\s+/g, '-');
    return firebase.database().ref(getDbPath('obras/' + id)).set({ nombre: n.toUpperCase(), presupuesto: parseFloat(p) || 0, estado: 'Activa' });
};
export const borrarObra = (id) => {
    firebase.database().ref(getDbPath(`finanzas_obras/${id}`)).remove();
    return firebase.database().ref(getDbPath('obras/' + id)).remove();
};
export const obtenerObras = (cb) => firebase.database().ref(getDbPath('obras')).on('value', (s) => cb(s.val() || {}));
export const cambiarEstadoObra = (id, estado) => firebase.database().ref(getDbPath(`obras/${id}`)).update({ estado: estado });

export const registrarMovimiento = (id, t, m, d) => firebase.database().ref(getDbPath(`finanzas_obras/${id}`)).push({ tipo: t, monto: parseFloat(m) || 0, detalle: d });
export const guardarAsistenciaPro = (n, o, m, h) => {
    const fID = new Date().toISOString().split('T')[0];
    return firebase.database().ref(getDbPath(`asistencia_semanal/${fID}/${n}`)).set({ nombre: n, obra: o, monto_anticipo: parseFloat(m) || 0, horas_extra: parseFloat(h) || 0 });
};

// 🔥 ESTA ES LA LÍNEA QUE ARREGLA TUS PANTALLAS NEGRAS
export const obtenerTodo = (cb) => {
    const empresa = localStorage.getItem('empresa_wr') || 'Walter';
    const referencia = empresa === 'Walter' ? firebase.database().ref() : firebase.database().ref(`cuentas/${empresa}`);
    referencia.on('value', (s) => cb(s.val() || {}));
};