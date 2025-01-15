import { Router } from 'express';
import { nursingService } from '../services/nursing';
import { asyncHandler } from '../middleware/error';
import { validateRequest, validatePartialRequest } from '../middleware/validation';
import { required, isString, isEmail, isDate } from '../utils/validation';

const router = Router();

// Validation schemas
const createNurseSchema = {
  CF: [required('CF'), isString('CF')],
  nome: [required('nome'), isString('nome')],
  cognome: [required('cognome'), isString('cognome')],
  email: [required('email'), isEmail('email')],
  telefono: [isString('telefono')],
  reparto: [required('reparto'), isString('reparto')],
  data_assunzione: [required('data_assunzione'), isDate('data_assunzione')],
  qualifica: [required('qualifica'), isString('qualifica')],
  livello_accesso: [required('livello_accesso'), isString('livello_accesso')]
};

const updateNurseSchema = {
  nome: [isString('nome')],
  cognome: [isString('cognome')],
  email: [isEmail('email')],
  telefono: [isString('telefono')],
  reparto: [isString('reparto')],
  qualifica: [isString('qualifica')],
  livello_accesso: [isString('livello_accesso')]
};

const createShiftSchema = {
  data: [required('data'), isDate('data')],
  ora_inizio: [required('ora_inizio'), isString('ora_inizio')],
  ora_fine: [required('ora_fine'), isString('ora_fine')],
  tipo_turno: [{
    validate: (value: string) => 
      ['mattina', 'pomeriggio', 'notte'].includes(value),
    message: 'Invalid shift type'
  }]
};

const assignNurseSchema = {
  CF_infermiere: [required('CF_infermiere'), isString('CF_infermiere')]
};

// Routes
router.post('/',
  validateRequest(createNurseSchema),
  asyncHandler(async (req, res) => {
    const nurse = await nursingService.createNurse(req.body);
    res.status(201).json(nurse);
  })
);

router.get('/', asyncHandler(async (_req, res) => {
  const nurses = await nursingService.getNurseById(_req.params.cf);
  res.json(nurses);
}));

router.get('/:cf', asyncHandler(async (req, res) => {
  const nurse = await nursingService.getNurseById(req.params.cf);
  res.json(nurse);
}));

router.patch('/:cf',
  validatePartialRequest(updateNurseSchema),
  asyncHandler(async (req, res) => {
    const nurse = await nursingService.updateNurse(req.params.cf, req.body);
    res.json(nurse);
  })
);

// Shift routes
router.post('/shifts',
  validateRequest(createShiftSchema),
  asyncHandler(async (req, res) => {
    const shift = await nursingService.createShift(req.body);
    res.status(201).json(shift);
  })
);

router.post('/shifts/:shiftId/assign',
  validateRequest(assignNurseSchema),
  asyncHandler(async (req, res) => {
    const shift = await nursingService.assignNurseToShift(req.params.shiftId, req.body);
    res.status(201).json(shift);
  })
);

router.get('/shifts', asyncHandler(async (req, res) => {
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const shifts = await nursingService.getNurseById(req.params.cf);
  res.json(shifts);
}));

router.get('/:cf/shifts', asyncHandler(async (req, res) => {
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const nurse = await nursingService.getNurseById(req.params.cf);
  
  const filteredShifts = nurse.turni_infermiere?.filter(shift => {
    if (!startDate && !endDate) return true;
    const shiftDate = new Date(shift.turno.data);
    if (startDate && shiftDate < new Date(startDate)) return false;
    if (endDate && shiftDate > new Date(endDate)) return false;
    return true;
  });
  
  res.json(filteredShifts);
}));

// Workload route
router.get('/:cf/workload', asyncHandler(async (req, res) => {
  const workload = await nursingService.getNurseWorkload(req.params.cf);
  res.json(workload);
}));

export default router;