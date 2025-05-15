import pino from 'pino';

// Create a logger instance
export const logger = pino({ 
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV === 'production' 
    ? undefined 
    : { target: 'pino-pretty' }
});