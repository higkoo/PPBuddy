import { Router } from 'express'
import tenantController from '../controllers/TenantController.js'
import { authenticate } from '../middleware/auth.js'
import { validateTenant } from '../middleware/tenant.js'

const router = Router()

router.post('/', authenticate, (req, res) => tenantController.create(req, res))

router.get('/', authenticate, validateTenant, (req, res) => tenantController.getAll(req, res))

router.get('/:id', authenticate, validateTenant, (req, res) => tenantController.getById(req, res))

router.put('/:id', authenticate, validateTenant, (req, res) => tenantController.update(req, res))

router.delete('/:id', authenticate, validateTenant, (req, res) => tenantController.delete(req, res))

router.get('/:id/stats', authenticate, validateTenant, (req, res) => tenantController.getStats(req, res))

router.get('/:id/users', authenticate, validateTenant, (req, res) => tenantController.getUsers(req, res))

export default router
