import path from 'path';
import express from 'express';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import apiRouter from './routes';
import { errorHandler } from './middlewares';
import { NotFoundError } from './errors';
import { clientBaseUrl } from './config/baseUrls';

const app = express();

app.use(
  cors({
    credentials: process.env.NODE_ENV === 'production',
    origin: clientBaseUrl,
  }),
);
app.use(express.json());
app.use(cookieParser());

// DEV LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(
    morgan(
      ':method :url :status :req[content-type] :res[set-cookie] - :response-time ms',
    ),
  );
}

// ROUTE FOR SERVING FRONT END
app.use('/', express.static(path.join(__dirname, '/../client/dist')));

// API ROUTES
app.use('/api/v1', apiRouter);

// NOT FOUND ROUTE HANDLER
app.use((_req, _res) => {
  throw new NotFoundError('app.ts: Catch all route handler');
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

export { app };
