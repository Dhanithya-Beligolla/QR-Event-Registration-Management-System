import { participantService } from '../services/participantService.js';
import { attendanceService } from '../services/attendanceService.js';

export const attendanceController = {
  async validate(req, res){
    const p = await participantService.byToken(req.params.token);
    if (!p) return res.json({ valid: false });
    res.json({ valid: true, participant: { id: p._id, name: p.name, email: p.email, phone: p.phone, attendedAt: p.attendedAt } });
  },
  async mark(req, res){
    const { token } = req.body || {};
    const p = await participantService.markAttendanceByToken(token);
    if (!p) return res.status(404).json({ error: 'invalid token' });
    await attendanceService.record({ participantId: p._id, token });
    res.json({ ok: true, attendedAt: p.attendedAt });
  },
  async list(req, res){
    const page = Number(req.query.page||1); const limit = Math.min(Number(req.query.limit||20), 200);
    res.json(await attendanceService.list({ page, limit }));
  }
};
