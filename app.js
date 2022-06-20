import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongooes from 'mongoose';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { readFile } from 'fs/promises';
const swaggerDocument = JSON.parse(await readFile(new URL('./swagger.json', import.meta.url)));

// env
dotenv.config();

// db
mongooes
  .connect(process.env.DATABASE_URI, { useNewUrlParser: true })
  .then(() => console.log('Database is successfully connected!'))
  .catch((err) => console.log(err));

// app
const app = express();

// middlewares
app.use(morgan('dev'));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// routes
app.use(routes);
// listen
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API is listening on port ${port}`));
