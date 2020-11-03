const express = require('express');
const router = express.Router();
const multer = require('multer');

const resizeWithSharp = require('./resizeWithSharp');
const profileThumb = require('./profileThumb');
const logger = require('../logger');

require('dotenv').config({ path: '../.env' });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	// reject a file
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		logger.info(
			`routes:fileFilter::filemimetype::${file.mimetype}::filter success`
		);
		cb(null, true);
	} else {
		logger.error(
			`routes:fileFilter::filemimetype::${file.mimetype}::filemimetype not supported`
		);
		cb(null, false);
	}
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 5,
	},
	fileFilter: fileFilter,
});

router.post('/upload', upload.single('image_file'), async (req, res, next) => {
	if (req.session.userId) {
		const imageData = await resizeWithSharp(req.file, req.session.userId);
		res.send(imageData);
	} else {
		res.sendStatus('401');
	}
});

router.post(
	'/profile',
	upload.single('profile_image'),
	async (req, res, next) => {
		if (req.session.userId) {
			const imageData = await profileThumb(req.file, req.session.userId);
			res.send(imageData);
		} else {
			res.sendStatus('401');
		}
	}
);
//Export the module
module.exports = router;
