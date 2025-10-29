import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: ['admin'] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

AdminUserSchema.methods.setPassword = async function(password){
  this.passwordHash = await bcrypt.hash(password, 10);
};

AdminUserSchema.methods.comparePassword = async function(password){
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model('AdminUser', AdminUserSchema);
