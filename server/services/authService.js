import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';

export const authService = {
  async seedAdminIfNone() {
    const count = await AdminUser.countDocuments();
    if (count === 0) {
      const admin = new AdminUser({ email: 'admin@example.com', name: 'Admin', passwordHash: 'temp' });
      await admin.setPassword('admin123');
      await admin.save();
      return admin;
    }
  },
  sign(user){
    return jwt.sign({ id: user._id, email: user.email, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '12h' });
  },
  async login(email, password){
    const user = await AdminUser.findOne({ email, isActive: true });
    if (!user) return null;
    const ok = await user.comparePassword(password);
    return ok ? user : null;
  }
};
