import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';
import ejsLayouts from 'express-ejs-layouts';
import pagesRouter from './routes/pages.js';
import apiRouter from './routes/api.js';
import { startPlanSync } from './jobs/syncPlans.js';

// Load environment variables from .env file (if present)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Logging middleware
app.use(morgan('dev'));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'globelconnect-node', 'views'));

// Use layouts
app.use(ejsLayouts);
app.set('layout', 'layout');

// Serve static files from the public directory
app.use(express.static(path.join(process.cwd(), 'globelconnect-node', 'public')));

// Mount routers
app.use('/', pagesRouter());
app.use('/api', apiRouter());

// Start plan sync job
startPlanSync();

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Internal server error' });
});

// Start the HTTP server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});