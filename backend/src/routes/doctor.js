import express from 'express';
import {
  setWeeklyAvailability,
  registerUnavailability,
  getSchedule,
  updateVisitOutcome,
  scheduleSurgery
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
router.use(requireRole(['DOTTORE']));

// Set weekly availability
router.post(
  '/availability/weekly',
  weeklyAvailabilityValidation,
  setWeeklyAvailability
);

// Register unavailability period
router.post(
  '/availability/unavailable',
  unavailabilityValidation,
  registerUnavailability
);

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

export default router;