const router = require('express').Router();
const upload = require('../middleware/upload');
const { verifyJWT, requireAdmin } = require('../middleware/auth');
const controller = require('../controllers/issueController');

router.post('/', verifyJWT, upload.single('image'), controller.createIssue);
router.get('/my', verifyJWT, controller.getMyIssues);
router.get('/stats', verifyJWT, requireAdmin, controller.getStats);
router.get('/', verifyJWT, requireAdmin, controller.getIssues);
router.get('/:id', verifyJWT, controller.getIssueById);
router.patch('/:id/status', verifyJWT, requireAdmin, controller.updateStatus);

module.exports = router;