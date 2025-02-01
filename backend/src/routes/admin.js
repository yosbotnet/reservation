import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getRooms,
  createOperatingRoom,
  updateOperatingRoom,
  getEquipment,
  createEquipment,
  updateEquipment,
  getSurgeryTypes,
  createSurgeryType,
  updateSurgeryType,
  deleteSurgeryType,
  getStatistics
} from '../controllers/admin.js';
import {
  createUserValidation,
  updateUserValidation,
  operatingRoomValidation,
  updateOperatingRoomValidation,
  equipmentValidation,
  updateEquipmentValidation,
  surgeryTypeValidation,
  statisticsValidation
} from '../middleware/adminValidators.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply admin role check to all routes
router.use(requireRole(['admin']));

// User Management
router.get('/users', getUsers);
router.post('/users', createUserValidation, createUser);
router.patch('/users/:cf', updateUserValidation, updateUser);
router.delete('/users/:cf', deleteUser);

// Operating Room Management
router.get('/operating-rooms', getRooms);
router.post('/operating-rooms', operatingRoomValidation, createOperatingRoom);
router.patch('/operating-rooms/:id_sala', updateOperatingRoomValidation, updateOperatingRoom);

// Equipment Management
router.get('/equipment', getEquipment);
router.post('/equipment', equipmentValidation, createEquipment);
router.patch('/equipment/:id_attrezzatura', updateEquipmentValidation, updateEquipment);

// Surgery Types Management
router.get('/surgery-types', getSurgeryTypes);
router.post('/surgery-types', surgeryTypeValidation, createSurgeryType);
router.patch('/surgery-types/:id_tipo', surgeryTypeValidation, updateSurgeryType);
router.delete('/surgery-types/:id_tipo', deleteSurgeryType);

// Statistics
router.get('/statistics', statisticsValidation, getStatistics);

export default router;
