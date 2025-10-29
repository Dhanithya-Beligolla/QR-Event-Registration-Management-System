const BASE = import.meta.env.VITE_API_BASE;

async function req(path, opts={}){
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('jwt');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  login: (email, password) => req('/auth/login', { method: 'POST', body: { email, password } }),

  listParticipants: ({page=1,limit=20,q=''}) => req(`/participants?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`),
  upsertParticipant: (body) => req('/participants', { method: 'POST', body }),
  retoken: (id) => req(`/participants/${id}/retoken`, { method: 'POST' }),

  validateToken: (token) => req(`/attendance/validate/${encodeURIComponent(token)}`),
  markAttendance: (token) => req('/attendance/mark', { method: 'POST', body: { token } }),
  listAttendance: ({page=1,limit=20}) => req(`/attendance?page=${page}&limit=${limit}`),

  sendQR: (participantId, via='sms') => req('/outbound/send-qr', { method: 'POST', body: { participantId, via } }),
  publicRegister: (body) => req('/outbound/public/register', { method: 'POST', body }),
};
