import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  getIdentityAreas,
  getIdentityArea,
  createIdentityArea,
  updateIdentityArea,
  deleteIdentityArea,
  reorderIdentityAreas,
} from '../controllers/identityAreas'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// GET /api/v1/identity-areas - Get all identity areas for user
router.get('/', getIdentityAreas)

// GET /api/v1/identity-areas/:id - Get specific identity area
router.get('/:id', getIdentityArea)

// POST /api/v1/identity-areas - Create new identity area
router.post('/', createIdentityArea)

// PUT /api/v1/identity-areas/:id - Update identity area
router.put('/:id', updateIdentityArea)

// DELETE /api/v1/identity-areas/:id - Delete identity area (soft delete)
router.delete('/:id', deleteIdentityArea)

// POST /api/v1/identity-areas/reorder - Reorder identity areas
router.post('/reorder', reorderIdentityAreas)

export default router