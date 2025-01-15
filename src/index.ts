// Export services
export { patientService } from './services/patient';
export { doctorService } from './services/doctor';
export { surgeryService } from './services/surgery';
export { nursingService } from './services/nursing';
export { postOpCareService } from './services/postOp';

// Export types
export * from './types/patient';
export * from './types/doctor';
export * from './types/surgery';
export * from './types/nursing';
export * from './types/postOp';

// Export error utilities
export * from './utils/errors';

// Export validation utilities
export * from './utils/validation';

// Export app and server configuration
export { default as app } from './app';
export { default as config } from './config/server';
export { db } from './config/database';

// Export middleware
export * from './middleware/error';
export * from './middleware/validation';