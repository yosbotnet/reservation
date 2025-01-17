import express from 'express';
import {
  createUser,
  updateUser,
  deleteUser,
  createOperatingRoom,
  updateOperatingRoom,
  createEquipment,
  updateEquipment,
  createSurgeryType,
  getStatistics
} from '../controllers/admin.js';
import {
  createUserValidation,
  updateUserValidation,
  operatingRoomValidation,
  equipmentValidation,
  surgeryTypeValidation,
  statisticsValidation
} from '../middleware/adminValidators.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply admin role check to all routes
router.use(requireRole(['ADMIN']));

// User Management
router.post('/users', createUserValidation, createUser);
router.patch('/users/:id', updateUserValidation, updateUser);
router.delete('/users/:id', deleteUser);

// Operating Room Management
router.post('/operating-rooms', operatingRoomValidation, createOperatingRoom);
router.patch('/operating-rooms/:codice', operatingRoomValidation, updateOperatingRoom);

// Equipment Management
router.post('/equipment', equipmentValidation, createEquipment);
router.patch('/equipment/:codiceInventario', equipmentValidation, updateEquipment);

// Surgery Types Management
router.post('/surgery-types', surgeryTypeValidation, createSurgeryType);

// Statistics
router.get('/statistics', statisticsValidation, getStatistics);

export default router;