import { nanoid } from 'nanoid';
import Participant from '../models/Participant.js';

export const participantService = {
  async list({ page=1, limit=20, q='' }){
    const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
    const [items, total] = await Promise.all([
      Participant.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit),
      Participant.countDocuments(filter)
    ]);
    return { items, total, page, pages: Math.ceil(total/limit) };
  },
  async upsert({ name, email, phone, department, ticketType, category, eventDateTime }){
    const by = (email ? { email } : (phone ? { phone } : null));
    let p = by ? await Participant.findOne(by) : null;
    if (!p) {
      p = await Participant.create({ name, email, phone, department, ticketType, category, eventDateTime, token: nanoid(24) });
    } else {
      p.set({ name, email: email||p.email, phone: phone||p.phone, department, ticketType, category, eventDateTime });
      await p.save();
    }
    return p;
  },
  async retoken(id){
    const p = await Participant.findById(id);
    if (!p) return null;
    p.token = nanoid(24);
    await p.save();
    return p.token;
  },
  async byToken(token){ return Participant.findOne({ token }); },
  async markAttendanceByToken(token){
    const p = await Participant.findOne({ token });
    if (!p) return null;
    if (!p.attendedAt) { p.attendedAt = new Date(); await p.save(); }
    return p;
  }
};
