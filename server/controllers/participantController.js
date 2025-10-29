import Joi from 'joi';
import { participantService } from '../services/participantService.js';

const upsertSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().allow('', null),
  department: Joi.string().allow('', null),
  ticketType: Joi.string().valid('Regular','VIP','Student').default('Regular'),
  category: Joi.string().valid('Onsite','Online').default('Onsite'),
  eventDateTime: Joi.date().allow(null)
});

export const participantController = {
  async list(req, res){
    const page = Number(req.query.page||1); const limit = Math.min(Number(req.query.limit||20), 200);
    const q = (req.query.q||'').trim();
    res.json(await participantService.list({ page, limit, q }));
  },
  async upsert(req, res){
    const { error, value } = upsertSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const p = await participantService.upsert(value);
    res.json(p);
  },
  async retoken(req, res){
    const token = await participantService.retoken(req.params.id);
    if (!token) return res.status(404).json({ error: 'not found' });
    res.json({ token });
  }
};
