const express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('./logger');
const dotenv = require('dotenv');
const images = require('./routes/images');
const jwt = require('jsonwebtoken');
const path = require('path');
const session = require('express-session');
const connectRedis = require('connect-redis');
const redis = require('./redis');
const { redisSessionPrefix } = require('./constant');

//Bringing the Environment variables
dotenv.config({ path: './.env' });

const corsOptions = {
	origin: ' http://localhost:3000',
	credentials: true,
};

//Init Express Upload Server
const app = express();
const RedisStore = connectRedis(session);

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(express.static('./images')); //Images set as the public folder

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
	session({
		store: new RedisStore({
			client: redis,
			prefix: redisSessionPrefix,
		}),
		name: 'adactoid',
		secret: process.env.ACCESS_TOKEN_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 31556952000,
		},
	})
);

app.use(cookieParser());

// app.use(async (req, res, next) => {
// 	const token = req.cookies.aptoid;
// 	console.log(token);
// 	if (token !== 'null') {
// 		try {
// 			const userId = await jwt.verify(token, process.env.SECRET);
// 			if (userId) {
// 				req.userId = userId.sub;
// 			}
// 		} catch (err) {
// 			logger.error(`upload::cookie verification failed`);
// 		}
// 	}

// 	const auth = req.headers['authorization'];
// 	if (auth !== 'null') {
// 		try {
// 			const userId = await jwt.verify(auth, process.env.SECRET);
// 			//console.log(userId);
// 			if (userId) {
// 				req.userId = userId.sub;
// 			}
// 		} catch (err) {
// 			logger.error(`upload::Authorization verification failed`);
// 		}
// 	}

// 	if (!req.userId) {
// 		res.sendStatus('401');
// 	}
// 	next();
// });

app.use('/image/', images);
app.get('/', (req, res) =>
	res.json({
		msg: 'Upload test Works',
	})
);
const port = process.env.PORT || 5000;

app.listen(port, () => {
	logger.info(`Server Started on Port ${port}`);
});
