import express from 'express';
import {
  setWeeklySchedule,
  getSchedule,
  updateVisitOutcome,
  scheduleSurgery,
  getSurgeryTypes,
  getOperatingRooms
} from '../controllers/doctor.js';
import {
  weeklyAvailabilityValidation,
  unavailabilityValidation,
  scheduleValidation,
  visitOutcomeValidation,
  surgeryScheduleValidation
} from '../middleware/doctorValidators.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply doctor role check to all routes
router.use(requireRole(['dottore']));

// Set weekly availability
router.post(
  '/:dottoreId/schedule',
  setWeeklySchedule
);

// Register unavailability period

// Get doctor's schedule
router.get(
  '/:dottoreId/schedule',
  scheduleValidation,
  getSchedule
);

// Update visit outcome
router.patch(
  '/visits/:visitId/outcome',
  visitOutcomeValidation,
  updateVisitOutcome
);

// Schedule surgery
router.post(
  '/surgeries',
  surgeryScheduleValidation,
  scheduleSurgery
);

// Get surgery types
router.get('/surgery-types', getSurgeryTypes);

// Get operating rooms
router.get('/operating-rooms', getOperatingRooms);

export default router;