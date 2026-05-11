import { Router } from 'express'
import chatController from '../controllers/ChatController.js'
import { authenticate } from '../middleware/auth.js'
import { validateTenant } from '../middleware/tenant.js'

const router = Router()

router.post(
  '/',
  authenticate,
  validateTenant,
  (req, res) => chatController.chat(req, res)
)

router.get(
  '/stream',
  authenticate,
  validateTenant,
  (req, res) => chatController.streamChat(req, res)
)

router.post(
  '/conversations',
  authenticate,
  validateTenant,
  (req, res) => chatController.createConversation(req, res)
)

router.get(
  '/conversations',
  authenticate,
  validateTenant,
  (req, res) => chatController.getConversations(req, res)
)

router.get(
  '/conversations/:id',
  authenticate,
  validateTenant,
  (req, res) => chatController.getConversation(req, res)
)

router.put(
  '/conversations/:id',
  authenticate,
  validateTenant,
  (req, res) => chatController.updateConversation(req, res)
)

router.delete(
  '/conversations/:id',
  authenticate,
  validateTenant,
  (req, res) => chatController.deleteConversation(req, res)
)

router.get(
  '/conversations/:id/messages',
  authenticate,
  validateTenant,
  (req, res) => chatController.getMessages(req, res)
)

router.post(
  '/conversations/:id/messages',
  authenticate,
  validateTenant,
  (req, res) => chatController.sendMessage(req, res)
)

router.post(
  '/conversations/:id/messages/stream',
  authenticate,
  validateTenant,
  (req, res) => chatController.sendStreamingMessage(req, res)
)

router.delete(
  '/messages/:id',
  authenticate,
  validateTenant,
  (req, res) => chatController.deleteMessage(req, res)
)

export default router
