"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderIdentityGoals = exports.deleteIdentityGoal = exports.updateGoalProgress = exports.updateIdentityGoal = exports.createIdentityGoal = exports.getIdentityGoal = exports.getIdentityGoals = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Validation schemas
const createIdentityGoalSchema = zod_1.z.object({
    identityAreaId: zod_1.z.string().cuid('Invalid identity area ID'),
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    description: zod_1.z.string().optional(),
    targetValue: zod_1.z.number().optional(),
    currentValue: zod_1.z.number().optional(),
    unit: zod_1.z.string().max(50).optional(),
    goalType: zod_1.z.enum(['ABOVE', 'BELOW', 'EXACT', 'QUALITATIVE']).default('EXACT'),
    targetDate: zod_1.z.string().datetime().optional(),
    color: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
    order: zod_1.z.number().int().min(0).optional(),
});
const updateIdentityGoalSchema = createIdentityGoalSchema.partial();
const updateGoalProgressSchema = zod_1.z.object({
    currentValue: zod_1.z.number(),
    isAchieved: zod_1.z.boolean().optional(),
});
/**
 * Get all identity goals for the authenticated user
 */
const getIdentityGoals = async (req, res) => {
    try {
        const userId = req.user.id;
        const { identityAreaId } = req.query;
        const whereClause = {
            userId,
            isActive: true,
        };
        if (identityAreaId) {
            whereClause.identityAreaId = identityAreaId;
        }
        const identityGoals = await prisma.identityGoal.findMany({
            where: whereClause,
            include: {
                identityArea: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' },
            ],
        });
        const response = {
            success: true,
            data: identityGoals,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching identity goals:', error);
        const response = {
            success: false,
            error: 'Failed to fetch identity goals',
        };
        res.status(500).json(response);
    }
};
exports.getIdentityGoals = getIdentityGoals;
/**
 * Get a single identity goal by ID
 */
const getIdentityGoal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const identityGoal = await prisma.identityGoal.findFirst({
            where: {
                id,
                userId,
                isActive: true,
            },
            include: {
                identityArea: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
        });
        if (!identityGoal) {
            const response = {
                success: false,
                error: 'Identity goal not found',
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: identityGoal,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching identity goal:', error);
        const response = {
            success: false,
            error: 'Failed to fetch identity goal',
        };
        res.status(500).json(response);
    }
};
exports.getIdentityGoal = getIdentityGoal;
/**
 * Create a new identity goal
 */
const createIdentityGoal = async (req, res) => {
    try {
        const userId = req.user.id;
        const validation = createIdentityGoalSchema.safeParse(req.body);
        if (!validation.success) {
            const response = {
                success: false,
                error: 'Validation error',
                message: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
            };
            return res.status(400).json(response);
        }
        const data = validation.data;
        // Verify the identity area belongs to the user
        const identityArea = await prisma.identityArea.findFirst({
            where: {
                id: data.identityAreaId,
                userId,
                isActive: true,
            },
        });
        if (!identityArea) {
            const response = {
                success: false,
                error: 'Identity area not found or not accessible',
            };
            return res.status(404).json(response);
        }
        // Get the next order value if not provided
        let order = data.order;
        if (order === undefined) {
            const lastGoal = await prisma.identityGoal.findFirst({
                where: {
                    identityAreaId: data.identityAreaId,
                    userId,
                },
                orderBy: { order: 'desc' },
                select: { order: true },
            });
            order = (lastGoal?.order ?? -1) + 1;
        }
        const identityGoal = await prisma.identityGoal.create({
            data: {
                ...data,
                userId,
                order,
                targetDate: data.targetDate ? new Date(data.targetDate) : null,
            },
            include: {
                identityArea: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
        });
        const response = {
            success: true,
            data: identityGoal,
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating identity goal:', error);
        if (error.code === 'P2002') {
            const response = {
                success: false,
                error: 'A goal with this title already exists in this identity area',
            };
            return res.status(400).json(response);
        }
        const response = {
            success: false,
            error: 'Failed to create identity goal',
        };
        res.status(500).json(response);
    }
};
exports.createIdentityGoal = createIdentityGoal;
/**
 * Update an identity goal
 */
const updateIdentityGoal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const validation = updateIdentityGoalSchema.safeParse(req.body);
        if (!validation.success) {
            const response = {
                success: false,
                error: 'Validation error',
                message: validation.error.errors.map(e => e.message).join(', '),
            };
            return res.status(400).json(response);
        }
        const data = validation.data;
        // Check if goal exists and belongs to user
        const existingGoal = await prisma.identityGoal.findFirst({
            where: {
                id,
                userId,
                isActive: true,
            },
        });
        if (!existingGoal) {
            const response = {
                success: false,
                error: 'Identity goal not found',
            };
            return res.status(404).json(response);
        }
        // If changing identity area, verify it belongs to user
        if (data.identityAreaId) {
            const identityArea = await prisma.identityArea.findFirst({
                where: {
                    id: data.identityAreaId,
                    userId,
                    isActive: true,
                },
            });
            if (!identityArea) {
                const response = {
                    success: false,
                    error: 'Identity area not found or not accessible',
                };
                return res.status(404).json(response);
            }
        }
        const identityGoal = await prisma.identityGoal.update({
            where: { id },
            data: {
                ...data,
                targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
            },
            include: {
                identityArea: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
        });
        const response = {
            success: true,
            data: identityGoal,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating identity goal:', error);
        if (error.code === 'P2002') {
            const response = {
                success: false,
                error: 'A goal with this title already exists in this identity area',
            };
            return res.status(400).json(response);
        }
        const response = {
            success: false,
            error: 'Failed to update identity goal',
        };
        res.status(500).json(response);
    }
};
exports.updateIdentityGoal = updateIdentityGoal;
/**
 * Update goal progress (currentValue and achievement status)
 */
const updateGoalProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const validation = updateGoalProgressSchema.safeParse(req.body);
        if (!validation.success) {
            const response = {
                success: false,
                error: 'Validation error',
                message: validation.error.errors.map(e => e.message).join(', '),
            };
            return res.status(400).json(response);
        }
        const { currentValue, isAchieved } = validation.data;
        // Check if goal exists and belongs to user
        const existingGoal = await prisma.identityGoal.findFirst({
            where: {
                id,
                userId,
                isActive: true,
            },
        });
        if (!existingGoal) {
            const response = {
                success: false,
                error: 'Identity goal not found',
            };
            return res.status(404).json(response);
        }
        const identityGoal = await prisma.identityGoal.update({
            where: { id },
            data: {
                currentValue,
                isAchieved,
                achievedAt: isAchieved ? new Date() : null,
            },
            include: {
                identityArea: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
        });
        const response = {
            success: true,
            data: identityGoal,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating goal progress:', error);
        const response = {
            success: false,
            error: 'Failed to update goal progress',
        };
        res.status(500).json(response);
    }
};
exports.updateGoalProgress = updateGoalProgress;
/**
 * Delete an identity goal (soft delete)
 */
const deleteIdentityGoal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const existingGoal = await prisma.identityGoal.findFirst({
            where: {
                id,
                userId,
                isActive: true,
            },
        });
        if (!existingGoal) {
            const response = {
                success: false,
                error: 'Identity goal not found',
            };
            return res.status(404).json(response);
        }
        await prisma.identityGoal.update({
            where: { id },
            data: { isActive: false },
        });
        const response = {
            success: true,
            data: { message: 'Identity goal deleted successfully' },
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error deleting identity goal:', error);
        const response = {
            success: false,
            error: 'Failed to delete identity goal',
        };
        res.status(500).json(response);
    }
};
exports.deleteIdentityGoal = deleteIdentityGoal;
/**
 * Reorder identity goals within an identity area
 */
const reorderIdentityGoals = async (req, res) => {
    try {
        const userId = req.user.id;
        const { identityAreaId } = req.params;
        const { goalIds } = req.body;
        if (!Array.isArray(goalIds)) {
            const response = {
                success: false,
                error: 'goalIds must be an array',
            };
            return res.status(400).json(response);
        }
        // Verify identity area belongs to user
        const identityArea = await prisma.identityArea.findFirst({
            where: {
                id: identityAreaId,
                userId,
                isActive: true,
            },
        });
        if (!identityArea) {
            const response = {
                success: false,
                error: 'Identity area not found',
            };
            return res.status(404).json(response);
        }
        // Verify all goals belong to the user and identity area
        const goals = await prisma.identityGoal.findMany({
            where: {
                id: { in: goalIds },
                userId,
                identityAreaId,
                isActive: true,
            },
        });
        if (goals.length !== goalIds.length) {
            const response = {
                success: false,
                error: 'Some goals not found or not accessible',
            };
            return res.status(404).json(response);
        }
        // Update order for each goal
        const updatePromises = goalIds.map((goalId, index) => prisma.identityGoal.update({
            where: { id: goalId },
            data: { order: index },
        }));
        await Promise.all(updatePromises);
        const response = {
            success: true,
            data: { message: 'Goals reordered successfully' },
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error reordering identity goals:', error);
        const response = {
            success: false,
            error: 'Failed to reorder identity goals',
        };
        res.status(500).json(response);
    }
};
exports.reorderIdentityGoals = reorderIdentityGoals;
