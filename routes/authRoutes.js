const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
router.get('/forgotPassword', authController.forgotPassword_get)
router.post('/forgotPassword', authController.forgotPassword);
router.get('/resetPassword/:token', authController.showResetForm)
router.post('/resetPassword/:token', authController.resetPassword)

module.exports = router;