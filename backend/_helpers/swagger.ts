import express from 'express';
const router = express.Router();
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import path from 'path';

let swaggerDocument: any;
try {
    swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
} catch (e) {
    console.error('Could not load swagger.yaml, documentation will be disabled:', e);
}

if (swaggerDocument) {
    router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

export default router;