import { Router } from 'express'
import authController from '../controllers/AuthController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/register', (req, res) => authController.register(req, res))

router.post('/login', (req, res) => authController.login(req, res))

router.post('/logout', authenticate, (req, res) => authController.logout(req, res))

router.get('/profile', authenticate, (req, res) => authController.getProfile(req, res))

export default router
