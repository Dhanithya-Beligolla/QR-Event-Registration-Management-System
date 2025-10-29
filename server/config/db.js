import mongoose from 'mongoose';

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: true,
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 10000
  });
  return mongoose.connection;
}
