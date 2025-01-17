import express from 'express';
import {
  getDoctors,
  getDoctorAvailability,
  bookAppointment,
  getPatientAppointments,
  getAllergiesById,
  getAllergies
} from '../controllers/public.js';
import {
  availabilityValidation,
  bookAppointmentValidation,
  patientAppointmentsValidation
} from '../middleware/publicValidators.js';

const router = express.Router();

// Get list of all doctors
router.get('/doctors', getDoctors);

// Get doctor's availability
router.get(
  '/doctors/:doctorId/availability',
  availabilityValidation,
  getDoctorAvailability
);

// Book an appointment
router.post(
  '/appointments',
  bookAppointmentValidation,
  bookAppointment
);

// Get patient's appointments
router.get(
  '/patients/:patientId/appointments',
  patientAppointmentsValidation,
  getPatientAppointments
);
router.get('/allergies', getAllergies);
router.get('/allergies/:patientId', getAllergiesById);

export default router;