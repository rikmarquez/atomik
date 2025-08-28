import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  getAtomicSystems,
  getAtomicSystem,
  createAtomicSystem,
  updateAtomicSystem,
  deleteAtomicSystem,
  executeAtomicSystem,
} from '../controllers/atomicSystems'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// GET /api/v1/atomic-systems - Get all atomic systems for user (optionally filtered by identityAreaId)
router.get('/', getAtomicSystems)

// GET /api/v1/atomic-systems/:id - Get specific atomic system
router.get('/:id', getAtomicSystem)

// POST /api/v1/atomic-systems - Create new atomic system
router.post('/', createAtomicSystem)

// PUT /api/v1/atomic-systems/:id - Update atomic system
router.put('/:id', updateAtomicSystem)

// DELETE /api/v1/atomic-systems/:id - Delete atomic system (soft delete)
router.delete('/:id', deleteAtomicSystem)

// POST /api/v1/atomic-systems/:id/execute - Execute/complete atomic system
router.post('/:id/execute', executeAtomicSystem)

export default router