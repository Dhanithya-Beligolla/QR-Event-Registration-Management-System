export function setToken(t){ localStorage.setItem('jwt', t); }
export function getToken(){ return localStorage.getItem('jwt'); }
export function clearToken(){ localStorage.removeItem('jwt'); }
export function isAuthed(){ return !!getToken(); }
