import 'mysql2';
console.log('BACKEND STARTING - VERSION: 5.0 (CLASSMATE SYNC)');
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import accountsController from './accounts/accounts.controller';
import swaggerDocs from './_helpers/swagger';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// api routes
app.use('/api', accountsController); // Corrected for your project
app.use('/accounts', accountsController);
app.use('/api-docs', swaggerDocs);

// global error handler
app.use(errorHandler);

// Export the app for Vercel
export default app;

// start server (Only if not in Vercel)
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => console.log('Server listening on port ' + port));
}