import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const isDatabaseConnected = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};

export const getConnectionInfo = () => {
  const readyState = mongoose.connection.readyState;
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    isConnected: isDatabaseConnected(),
    readyState: states[readyState] || 'unknown',
    mode: isDatabaseConnected() ? ('mongodb' as const) : ('fallback_demo' as const),
    host: isDatabaseConnected() ? mongoose.connection.host : undefined,
    database: isDatabaseConnected() ? mongoose.connection.name : undefined,
  };
};

export const connectDatabase = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.warn(
      '⚠️  [Database] MONGODB_URI not set or contains placeholder credentials. Running in DEMO/FALLBACK mode.'
    );
    isConnected = false;
    return false;
  }

  try {
    console.log('🔄 [Database] Attempting connection to MongoDB...');
    
    // Configure connection with tight timeout for graceful fallback
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(
      `✅ [Database] MongoDB connected successfully to [${mongoose.connection.host}/${mongoose.connection.name}]`
    );

    mongoose.connection.on('error', (err) => {
      console.error('❌ [Database] MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  [Database] MongoDB disconnected. Falling back to synthetic demo provider.');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 [Database] MongoDB reconnected.');
      isConnected = true;
    });

    return true;
  } catch (error: any) {
    isConnected = false;
    console.warn(
      `⚠️  [Database] Could not connect to MongoDB (${error.message || 'Connection failed'}).`
    );
    console.warn('⚡ [Database] VASPTrace will operate in FALLBACK / DEMO MODE without data loss.');
    return false;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 [Database] MongoDB disconnected gracefully.');
  }
};
