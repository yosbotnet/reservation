import { Router } from 'express';
import { surgeryService } from '../services/surgery';
import { asyncHandler } from '../middleware/error';
import { validateRequest, validatePartialRequest } from '../middleware/validation';
import { required, isString, isNumber } from '../utils/validation';

const router = Router();

// Validation schemas
const createSurgerySchema = {
  CF_paziente: [required('CF_paziente'), isString('CF_paziente')],
  codice_tipo: [required('codice_tipo'), isString('codice_tipo')],
  numero_sala: [required('numero_sala'), isString('numero_sala')],
  data_ora: [required('data_ora'), isString('data_ora')],
  durata_prevista: [required('durata_prevista'), isNumber('durata_prevista')],
  medici: [required('medici'), {
    validate: (value: any) => Array.isArray(value) && value.length > 0,
    message: 'At least one doctor must be assigned'
  }]
};

const updateSurgerySchema = {
  stato: [{
    validate: (value: string) => 
      ['scheduled', 'in_progress', 'completed', 'cancelled'].includes(value),
    message: 'Invalid surgery status'
  }],
  data_ora: [isString('data_ora')],
  numero_sala: [isString('numero_sala')],
  durata_prevista: [isNumber('durata_prevista')]
};

const drugAdministrationSchema = {
  drugs: [required('drugs'), {
    validate: (value: any) => 
      Array.isArray(value) && value.every(drug => 
        drug.codice_farmaco && 
        typeof drug.quantita === 'number' && 
        drug.quantita > 0
      ),
    message: 'Invalid drug administration data'
  }]
};

// Routes
router.post('/',
  validateRequest(createSurgerySchema),
  asyncHandler(async (req, res) => {
    const surgery = await surgeryService.createSurgery(req.body);
    res.status(201).json(surgery);
  })
);

router.get('/', asyncHandler(async (req, res) => {
  const surgeries = await surgeryService.getSurgeryById(req.params.id);
  res.json(surgeries);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const surgery = await surgeryService.getSurgeryById(req.params.id);
  res.json(surgery);
}));

router.patch('/:id',
  validatePartialRequest(updateSurgerySchema),
  asyncHandler(async (req, res) => {
    const surgery = await surgeryService.updateSurgeryStatus(req.params.id, req.body);
    res.json(surgery);
  })
);

// Drug administration routes
router.post('/:id/drugs',
  validateRequest(drugAdministrationSchema),
  asyncHandler(async (req, res) => {
    await surgeryService.administeredDrugs(req.params.id, req.body.drugs);
    res.status(201).json({ message: 'Drugs administered successfully' });
  })
);

router.get('/:id/drugs', asyncHandler(async (req, res) => {
  const surgery = await surgeryService.getSurgeryById(req.params.id);
  res.json(surgery.farmaci_intervento);
}));

// Statistics route
router.get('/statistics', asyncHandler(async (_req, res) => {
  const statistics = await surgeryService.getSurgeryStatistics();
  res.json(statistics);
}));

// Equipment routes
router.get('/equipment/:roomNumber', asyncHandler(async (req, res) => {
  const surgery = await surgeryService.getSurgeryById(req.params.id);
  res.json(surgery.sala_operatoria.attrezzatura);
}));

export default router;