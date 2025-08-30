import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  getIdentityGoals,
  getIdentityGoal,
  createIdentityGoal,
  updateIdentityGoal,
  updateGoalProgress,
  deleteIdentityGoal,
  reorderIdentityGoals,
} from '../controllers/identityGoals'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// GET /api/v1/identity-goals - Get all identity goals for user (optionally filtered by identity area)
router.get('/', getIdentityGoals)

// GET /api/v1/identity-goals/:id - Get specific identity goal
router.get('/:id', getIdentityGoal)

// POST /api/v1/identity-goals - Create new identity goal
router.post('/', createIdentityGoal)

// PUT /api/v1/identity-goals/:id - Update identity goal
router.put('/:id', updateIdentityGoal)

// PATCH /api/v1/identity-goals/:id/progress - Update goal progress (currentValue and achievement)
router.patch('/:id/progress', updateGoalProgress)

// DELETE /api/v1/identity-goals/:id - Delete identity goal (soft delete)
router.delete('/:id', deleteIdentityGoal)

// POST /api/v1/identity-goals/reorder/:identityAreaId - Reorder goals within an identity area
router.post('/reorder/:identityAreaId', reorderIdentityGoals)

export default router