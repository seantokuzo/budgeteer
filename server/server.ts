import mongoose from 'mongoose';
import { app } from './app';
import { checkEnvVars } from './utils';

const PORT = process.env.PORT || 3000;

const start = async () => {
  checkEnvVars();

  try {
    await mongoose.connect(process.env.MONGO_URI!, {});
    console.log('🍃 Connected to MongoDB');
  } catch (err) {
    console.log('❌ Error connecting to MongoDB: ', err);
    throw new Error();
  }

  app.listen(PORT, () => {
    console.log(`💥 App listening on port ${PORT}`);
  });
};

start();
