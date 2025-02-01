import express from 'express';
import {
  getDoctors,
  getDoctorAvailability,
  bookAppointment,
  getPatientAppointments,
  getAllergiesById,
  getAllergies,
  getPatientSurgeries,
  getPostOperativeProtocols,
  assignPostOperativeProtocols
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

router.get('/patients/:patientId/surgeries', getPatientSurgeries);
router.get('/surgeries/:surgeryId/protocols', getPostOperativeProtocols);
router.post('/surgeries/:surgeryId/protocols', assignPostOperativeProtocols);

export default router;
