import Joi from 'joi';
import { authService } from '../services/authService.js';

const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().min(6).required() });

export const authController = {
  async login(req, res){
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const user = await authService.login(value.email, value.password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = authService.sign(user);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  }
};
