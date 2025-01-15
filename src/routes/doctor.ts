import { Router } from 'express';
import { doctorService } from '../services/doctor';
import { asyncHandler } from '../middleware/error';
import { validateRequest, validatePartialRequest } from '../middleware/validation';
import { required, isString, isEmail, isDate } from '../utils/validation';

const router = Router();

// Validation schemas
const createDoctorSchema = {
  CF: [required('CF'), isString('CF')],
  nome: [required('nome'), isString('nome')],
  cognome: [required('cognome'), isString('cognome')],
  email: [required('email'), isEmail('email')],
  password: [required('password'), isString('password')],
  telefono: [isString('telefono')],
  num_albo: [required('num_albo'), isString('num_albo')],
  specializzazione: [required('specializzazione'), isString('specializzazione')],
  data_assunzione: [required('data_assunzione'), isDate('data_assunzione')],
  qualifica: [required('qualifica'), isString('qualifica')],
  livello_accesso: [required('livello_accesso'), isString('livello_accesso')]
};

const updateDoctorSchema = {
  nome: [isString('nome')],
  cognome: [isString('cognome')],
  email: [isEmail('email')],
  telefono: [isString('telefono')],
  specializzazione: [isString('specializzazione')],
  qualifica: [isString('qualifica')],
  livello_accesso: [isString('livello_accesso')]
};

const availabilitySchema = {
  data: [required('data'), isDate('data')],
  ora_inizio: [required('ora_inizio'), isString('ora_inizio')],
  ora_fine: [required('ora_fine'), isString('ora_fine')]
};

// Routes
router.post('/',
  validateRequest(createDoctorSchema),
  asyncHandler(async (req, res) => {
    const doctor = await doctorService.createDoctor(req.body);
    res.status(201).json(doctor);
  })
);

router.get('/', asyncHandler(async (_, res) => {
  const doctors = await doctorService.getAllDoctors();
  res.json(doctors);
}));

router.get('/:cf', asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.cf);
  res.json(doctor);
}));

router.patch('/:cf',
  validatePartialRequest(updateDoctorSchema),
  asyncHandler(async (req, res) => {
    const doctor = await doctorService.updateDoctor(req.params.cf, req.body);
    res.json(doctor);
  })
);

// Availability routes
router.post('/:cf/availability',
  validateRequest(availabilitySchema),
  asyncHandler(async (req, res) => {
    const availability = await doctorService.addAvailability(req.params.cf, req.body);
    res.status(201).json(availability);
  })
);

router.get('/:cf/availability', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const availability = await doctorService.getDoctorById(req.params.cf);
  res.json(availability.calendario_disponibilita?.filter(slot => {
    if (!startDate && !endDate) return true;
    const slotDate = new Date(slot.data);
    if (startDate && slotDate < new Date(startDate as string)) return false;
    if (endDate && slotDate > new Date(endDate as string)) return false;
    return true;
  }));
}));

// Statistics route
router.get('/:cf/statistics', asyncHandler(async (req, res) => {
  const statistics = await doctorService.getDoctorStatistics(req.params.cf);
  res.json(statistics);
}));

export default router;