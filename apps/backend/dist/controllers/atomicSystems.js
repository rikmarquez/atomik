"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAtomicSystem = exports.deleteAtomicSystem = exports.updateAtomicSystem = exports.createAtomicSystem = exports.getAtomicSystem = exports.getAtomicSystems = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Validation schemas
const createAtomicSystemSchema = zod_1.z.object({
    identityAreaId: zod_1.z.string().cuid('Invalid identity area ID'),
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    description: zod_1.z.string().optional(),
    cue: zod_1.z.string().min(1, 'Cue is required (1st Law: Make it Obvious)'),
    craving: zod_1.z.string().min(1, 'Craving is required (2nd Law: Make it Attractive)'),
    response: zod_1.z.string().min(1, 'Response is required (3rd Law: Make it Easy)'),
    reward: zod_1.z.string().min(1, 'Reward is required (4th Law: Make it Satisfying)'),
    frequency: zod_1.z.enum(['DAILY', 'WEEKLY', 'CUSTOM']).optional(),
    timeOfDay: zod_1.z.string().optional(),
    estimatedMin: zod_1.z.number().int().min(1).max(480).optional(), // Max 8 hours
    difficulty: zod_1.z.number().int().min(1).max(5).optional(),
    order: zod_1.z.number().int().min(0).optional(),
});
const updateAtomicSystemSchema = createAtomicSystemSchema.partial().omit({ identityAreaId: true });
/**
 * Get all atomic systems for the authenticated user
 */
const getAtomicSystems = async (req, res) => {
    try {
        const userId = req.user.id;
        const { identityAreaId } = req.query;
        const whereClause = {
            userId,
            isActive: true,
        };
        // Filter by identity area if provided
        if (identityAreaId) {
            whereClause.identityAreaId = identityAreaId;
        }
        const atomicSystems = await prisma.atomicSystem.findMany({
            where: whereClause,
            include: {
                identityArea: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
                _count: {
                    select: {
                        executions: true,
                    },
                },
            },
            orderBy: [
                { identityAreaId: 'asc' },
                { order: 'asc' },
                { createdAt: 'desc' },
            ],
        });
        const response = {
            success: true,
            data: atomicSystems,
            message: 'Atomic systems retrieved successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching atomic systems:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch atomic systems',
            code: 'FETCH_ERROR',
        });
    }
};
exports.getAtomicSystems = getAtomicSystems;
/**
 * Get a single atomic system by ID
 */
const getAtomicSystem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const atomicSystem = await prisma.atomicSystem.findFirst({
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
                executions: {
                    where: {
                        executedAt: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
                        },
                    },
                    orderBy: { executedAt: 'desc' },
                    take: 50,
                },
                _count: {
                    select: {
                        executions: true,
                    },
                },
            },
        });
        if (!atomicSystem) {
            return res.status(404).json({
                success: false,
                error: 'Atomic system not found',
                code: 'NOT_FOUND',
            });
        }
        const response = {
            success: true,
            data: atomicSystem,
            message: 'Atomic system retrieved successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching atomic system:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch atomic system',
            code: 'FETCH_ERROR',
        });
    }
};
exports.getAtomicSystem = getAtomicSystem;
/**
 * Create a new atomic system
 */
const createAtomicSystem = async (req, res) => {
    try {
        const userId = req.user.id;
        // Validate request body
        const validation = createAtomicSystemSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: validation.error.errors,
            });
        }
        const { identityAreaId, name, description, cue, craving, response: responseData, reward, frequency, timeOfDay, estimatedMin, difficulty, order } = validation.data;
        // Verify that the identity area belongs to the user
        const identityArea = await prisma.identityArea.findFirst({
            where: {
                id: identityAreaId,
                userId,
                isActive: true,
            },
        });
        if (!identityArea) {
            return res.status(404).json({
                success: false,
                error: 'Identity area not found',
                code: 'IDENTITY_AREA_NOT_FOUND',
            });
        }
        // Check for unique name within the identity area
        const existingSystem = await prisma.atomicSystem.findFirst({
            where: {
                userId,
                identityAreaId,
                name,
                isActive: true,
            },
        });
        if (existingSystem) {
            return res.status(409).json({
                success: false,
                error: 'An atomic system with this name already exists in this identity area',
                code: 'DUPLICATE_NAME',
            });
        }
        // Determine order if not provided
        let finalOrder = order;
        if (finalOrder === undefined) {
            const maxOrder = await prisma.atomicSystem.findFirst({
                where: { userId, identityAreaId, isActive: true },
                orderBy: { order: 'desc' },
                select: { order: true },
            });
            finalOrder = (maxOrder?.order ?? -1) + 1;
        }
        const atomicSystem = await prisma.atomicSystem.create({
            data: {
                userId,
                identityAreaId,
                name,
                description,
                cue,
                craving,
                response: responseData,
                reward,
                frequency: frequency || 'DAILY',
                timeOfDay,
                estimatedMin,
                difficulty: difficulty || 3,
                order: finalOrder,
            },
            include: {
                identityArea: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
                _count: {
                    select: {
                        executions: true,
                    },
                },
            },
        });
        const response = {
            success: true,
            data: atomicSystem,
            message: 'Atomic system created successfully',
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating atomic system:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create atomic system',
            code: 'CREATE_ERROR',
        });
    }
};
exports.createAtomicSystem = createAtomicSystem;
/**
 * Update an atomic system
 */
const updateAtomicSystem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        // Validate request body
        const validation = updateAtomicSystemSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: validation.error.errors,
            });
        }
        const updates = validation.data;
        // Check if atomic system exists and belongs to user
        const existingSystem = await prisma.atomicSystem.findFirst({
            where: {
                id,
                userId,
                isActive: true,
            },
        });
        if (!existingSystem) {
            return res.status(404).json({
                success: false,
                error: 'Atomic system not found',
                code: 'NOT_FOUND',
            });
        }
        // Check for unique name if name is being updated
        if (updates.name && updates.name !== existingSystem.name) {
            const duplicateSystem = await prisma.atomicSystem.findFirst({
                where: {
                    userId,
                    identityAreaId: existingSystem.identityAreaId,
                    name: updates.name,
                    isActive: true,
                    id: { not: id },
                },
            });
            if (duplicateSystem) {
                return res.status(409).json({
                    success: false,
                    error: 'An atomic system with this name already exists in this identity area',
                    code: 'DUPLICATE_NAME',
                });
            }
        }
        const atomicSystem = await prisma.atomicSystem.update({
            where: { id },
            data: updates,
            include: {
                identityArea: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
                _count: {
                    select: {
                        executions: true,
                    },
                },
            },
        });
        const response = {
            success: true,
            data: atomicSystem,
            message: 'Atomic system updated successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating atomic system:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update atomic system',
            code: 'UPDATE_ERROR',
        });
    }
};
exports.updateAtomicSystem = updateAtomicSystem;
/**
 * Delete an atomic system (soft delete)
 */
const deleteAtomicSystem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        // Check if atomic system exists and belongs to user
        const existingSystem = await prisma.atomicSystem.findFirst({
            where: {
                id,
                userId,
                isActive: true,
            },
        });
        if (!existingSystem) {
            return res.status(404).json({
                success: false,
                error: 'Atomic system not found',
                code: 'NOT_FOUND',
            });
        }
        // Soft delete the atomic system
        await prisma.atomicSystem.update({
            where: { id },
            data: { isActive: false },
        });
        const response = {
            success: true,
            data: null,
            message: 'Atomic system deleted successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error deleting atomic system:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete atomic system',
            code: 'DELETE_ERROR',
        });
    }
};
exports.deleteAtomicSystem = deleteAtomicSystem;
/**
 * Execute/complete an atomic system
 */
const executeAtomicSystem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const validation = zod_1.z.object({
            quality: zod_1.z.number().int().min(1).max(5).optional().default(3),
            notes: zod_1.z.string().optional(),
            strengthensIdentity: zod_1.z.boolean().optional().default(true),
        }).safeParse(req.body);
        if (!validation.success) {
            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: validation.error.errors,
            });
        }
        const { quality, notes, strengthensIdentity } = validation.data;
        // Check if atomic system exists and belongs to user
        const atomicSystem = await prisma.atomicSystem.findFirst({
            where: {
                id,
                userId,
                isActive: true,
            },
        });
        if (!atomicSystem) {
            return res.status(404).json({
                success: false,
                error: 'Atomic system not found',
                code: 'NOT_FOUND',
            });
        }
        // Create execution record
        const execution = await prisma.systemExecution.create({
            data: {
                systemId: id,
                userId,
                quality,
                notes,
                strengthensIdentity,
            },
        });
        const response = {
            success: true,
            data: execution,
            message: 'Atomic system executed successfully',
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error executing atomic system:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute atomic system',
            code: 'EXECUTION_ERROR',
        });
    }
};
exports.executeAtomicSystem = executeAtomicSystem;
