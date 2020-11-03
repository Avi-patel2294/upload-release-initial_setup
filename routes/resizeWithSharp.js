const sharp = require('sharp');
const path = require('path');
var sizeOf = require('image-size');
const fs = require('fs');
const { v5 } = require('uuid');

const logger = require('../logger');

const resizeWithSharp = async (file, userId) => {
	var dir = path.join(__dirname, '../', 'images', userId);
	if (!fs.existsSync(dir)) {
		logger.info(
			'routes:images::storage::dir:: upload directory with userID donot exist. creating one'
		);
		fs.mkdirSync(dir);
	}
	const newFileName =
		new Date().getTime() + v5(file.originalname, process.env.UUID_NAMESPACE);
	var dimensions = await sizeOf(file.buffer);
	let size = {};
	//Large Image
	if (dimensions.width >= dimensions.height) {
		size = { width: 920 };
	} else if (dimensions.height > dimensions.width) {
		size = { height: 920 };
	}
	const savePathLarge = path.join(dir, newFileName + '-920.jpg');

	await sharp(file.buffer)
		.resize({
			...size,
			fit: sharp.fit.contain,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		})
		.jpeg({ quality: 72 })
		.toFile(savePathLarge);
	logger.info(`routes::resizeWithSharp::Resized image to 920 width/height px`);

	//Thumb Image
	if (dimensions.width >= dimensions.height) {
		size = { width: 220 };
	} else if (dimensions.height > dimensions.width) {
		size = { height: 220 };
	}
	const savePathThumb = path.join(dir, newFileName + '-220.jpg');
	await sharp(file.buffer)
		.resize({
			...size,
			fit: sharp.fit.contain,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		})
		.jpeg({ quality: 72 })
		.toFile(savePathThumb);
	logger.info(`routes::resizeWithSharp::Resized image to 220 width/height px`);

	return {
		mimetype: file.mimetype,
		fileName: newFileName,
		largeFile: newFileName + '-920.jpg',
		thumbFile: newFileName + '-220.jpg',
	};
};
module.exports = resizeWithSharp;
