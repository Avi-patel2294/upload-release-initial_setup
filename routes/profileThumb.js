const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const logger = require('../logger');

const profileThumb = async (file, userId) => {
	var dir = path.join(__dirname, '../', 'images', 'profile');
	if (!fs.existsSync(dir)) {
		logger.info(
			'routes:images::storage::dir:: upload directory with userID donot exist. creating one'
		);
		fs.mkdirSync(dir);
	}

	const savePathThumb = path.join(dir, userId + '.jpg');
	await sharp(file.buffer)
		.resize({
			width: 200,
			height: 200,
			fit: sharp.fit.cover,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		})
		.jpeg({ quality: 72 })
		.toFile(savePathThumb);
	logger.info(`routes::profileThumb::Resized image to 200 width/height px`);

	return {
		mimetype: file.mimetype,
		fileName: userId,
		thumbFile: userId + '.jpg',
	};
};
module.exports = profileThumb;
