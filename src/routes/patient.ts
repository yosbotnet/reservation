import { Router } from 'express';
import { patientService } from '../services/patient';
import { asyncHandler } from '../middleware/error';
import { validateRequest, validatePartialRequest } from '../middleware/validation';
import { required, isString, isEmail } from '../utils/validation';

const router = Router();

// Validation schemas
const createPatientSchema = {
  CF: [required('CF'), isString('CF')],
  nome: [required('nome'), isString('nome')],
  cognome: [required('cognome'), isString('cognome')],
  email: [required('email'), isEmail('email')],
  password: [required('password'), isString('password')],
  telefono: [isString('telefono')],
  gruppo_sanguigno: [isString('gruppo_sanguigno')],
  allergie: [isString('allergie')],
  patologie_croniche: [isString('patologie_croniche')]
};

const updatePatientSchema = {
  nome: [isString('nome')],
  cognome: [isString('cognome')],
  email: [isEmail('email')],
  telefono: [isString('telefono')],
  gruppo_sanguigno: [isString('gruppo_sanguigno')],
  allergie: [isString('allergie')],
  patologie_croniche: [isString('patologie_croniche')]
};

// Routes
router.post('/',
  validateRequest(createPatientSchema),
  asyncHandler(async (req, res) => {
    const patient = await patientService.createPatient(req.body);
    res.status(201).json(patient);
  })
);

router.get('/', asyncHandler(async (_, res) => {
  const patients = await patientService.getAllPatients();
  res.json(patients);
}));

router.get('/:cf', asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(req.params.cf);
  res.json(patient);
}));

router.patch('/:cf',
  validatePartialRequest(updatePatientSchema),
  asyncHandler(async (req, res) => {
    const patient = await patientService.updatePatient(req.params.cf, req.body);
    res.json(patient);
  })
);

router.delete('/:cf', asyncHandler(async (req, res) => {
  await patientService.deletePatient(req.params.cf);
  res.status(204).send();
}));

export default router;