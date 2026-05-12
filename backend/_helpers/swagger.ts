import express from 'express';
const router = express.Router();
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

let swaggerDocument: any;
try {
    // Use process.cwd() to correctly locate swagger.yaml on Vercel
    const swaggerPath = path.resolve(process.cwd(), 'swagger.yaml');
    swaggerDocument = YAML.load(swaggerPath);
} catch (e) {
    console.error('Could not load swagger.yaml, trying backup path:', e);
    try {
        // Fallback for different environments
        swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
    } catch (e2) {
        console.error('All swagger load paths failed.');
    }
}

// Custom options to fix "Blank Page" issue on Vercel
const options = {
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
};

if (swaggerDocument) {
    router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
}

export default router;