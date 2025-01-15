import { Router } from 'express';
import { postOpCareService } from '../services/postOp';
import { asyncHandler } from '../middleware/error';
import { validateRequest, validatePartialRequest } from '../middleware/validation';
import { required, isString, isNumber } from '../utils/validation';

const router = Router();

// Validation schemas
const createCareRecordSchema = {
  id_intervento: [required('id_intervento'), isString('id_intervento')],
  CF_medico: [required('CF_medico'), isString('CF_medico')],
  note: [required('note'), isString('note')],
  parametri_vitali: [required('parametri_vitali'), {
    validate: (value: any) => {
      return value && 
        typeof value === 'object' &&
        typeof value.pressione === 'string' &&
        typeof value.frequenza_cardiaca === 'number' &&
        typeof value.temperatura === 'number' &&
        typeof value.saturazione_ossigeno === 'number';
    },
    message: 'Invalid vital parameters format'
  }],
  medicazioni: [isString('medicazioni')],
  terapia: [isString('terapia')],
  complicanze: [isString('complicanze')]
};

const updateCareRecordSchema = {
  note: [isString('note')],
  parametri_vitali: [{
    validate: (value: any) => {
      if (!value) return true;
      return typeof value === 'object' &&
        (!value.pressione || typeof value.pressione === 'string') &&
        (!value.frequenza_cardiaca || typeof value.frequenza_cardiaca === 'number') &&
        (!value.temperatura || typeof value.temperatura === 'number') &&
        (!value.saturazione_ossigeno || typeof value.saturazione_ossigeno === 'number');
    },
    message: 'Invalid vital parameters format'
  }],
  medicazioni: [isString('medicazioni')],
  terapia: [isString('terapia')],
  complicanze: [isString('complicanze')]
};

const createProtocolSchema = {
  descrizione: [required('descrizione'), isString('descrizione')],
  durata_giorni: [required('durata_giorni'), isNumber('durata_giorni')],
  istruzioni: [required('istruzioni'), isString('istruzioni')]
};

const updateProtocolSchema = {
  descrizione: [isString('descrizione')],
  durata_giorni: [isNumber('durata_giorni')],
  istruzioni: [isString('istruzioni')]
};

// Care record routes
router.post('/',
  validateRequest(createCareRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await postOpCareService.createCareRecord(req.body);
    res.status(201).json(record);
  })
);

router.get('/:id', asyncHandler(async (req, res) => {
  const record = await postOpCareService.getCareRecordById(req.params.id);
  res.json(record);
}));

router.get('/intervention/:interventionId', asyncHandler(async (req, res) => {
  const records = await postOpCareService.getCareRecordsByIntervention(req.params.interventionId);
  res.json(records);
}));

router.patch('/:id',
  validatePartialRequest(updateCareRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await postOpCareService.updateCareRecord(req.params.id, req.body);
    res.json(record);
  })
);

// Protocol routes
router.post('/protocols',
  validateRequest(createProtocolSchema),
  asyncHandler(async (req, res) => {
    const protocol = await postOpCareService.createProtocol(req.body);
    res.status(201).json(protocol);
  })
);

router.patch('/protocols/:codice',
  validatePartialRequest(updateProtocolSchema),
  asyncHandler(async (req, res) => {
    const protocol = await postOpCareService.updateProtocol(req.params.codice, req.body);
    res.json(protocol);
  })
);

// Statistics route
router.get('/statistics/:interventionId', asyncHandler(async (req, res) => {
  const statistics = await postOpCareService.getPostOpStatistics(req.params.interventionId);
  res.json(statistics);
}));

export default router;