const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4200';
app.use(cors({
	origin: corsOrigin,
	credentials: true
}));

const swaggerSpec = {
	openapi: '3.0.0',
	info: {
		title: 'Angular Auth API',
		version: '1.0.0',
		description: 'Demo authentication API for the Angular app.'
	},
	servers: [
		{
			url: process.env.PUBLIC_URL || `http://localhost:${port}`
		}
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT'
			}
		},
		schemas: {
			RegisterRequest: {
				type: 'object',
				required: ['title', 'firstName', 'lastName', 'email', 'password', 'confirmPassword'],
				properties: {
					title: { type: 'string' },
					firstName: { type: 'string' },
					lastName: { type: 'string' },
					email: { type: 'string', format: 'email' },
					password: { type: 'string', format: 'password' },
					confirmPassword: { type: 'string', format: 'password' }
				}
			},
			AuthRequest: {
				type: 'object',
				required: ['email', 'password'],
				properties: {
					email: { type: 'string', format: 'email' },
					password: { type: 'string', format: 'password' }
				}
			},
			ResetRequest: {
				type: 'object',
				required: ['token', 'password'],
				properties: {
					token: { type: 'string' },
					password: { type: 'string', format: 'password' }
				}
			},
			TokenRequest: {
				type: 'object',
				required: ['token'],
				properties: {
					token: { type: 'string' }
				}
			},
			Account: {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					title: { type: 'string' },
					firstName: { type: 'string' },
					lastName: { type: 'string' },
					email: { type: 'string', format: 'email' },
					role: { type: 'string' },
					dateCreated: { type: 'string', format: 'date-time' },
					isVerified: { type: 'boolean' }
				}
			}
		}
	},
	paths: {
		'/': {
			get: {
				summary: 'Health check',
				responses: {
					'200': { description: 'OK' }
				}
			}
		},
		'/accounts/register': {
			post: {
				summary: 'Register a new account',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/RegisterRequest' }
						}
					}
				},
				responses: {
					'200': { description: 'Registration successful' },
					'400': { description: 'Email already registered' }
				}
			}
		},
		'/accounts/authenticate': {
			post: {
				summary: 'Authenticate a user',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/AuthRequest' }
						}
					}
				},
				responses: {
					'200': { description: 'Authenticated' },
					'400': { description: 'Invalid credentials' }
				}
			}
		},
		'/accounts/refresh-token': {
			post: {
				summary: 'Refresh JWT using cookie',
				responses: {
					'200': { description: 'Token refreshed' },
					'401': { description: 'Unauthorized' }
				}
			}
		},
		'/accounts/revoke-token': {
			post: {
				summary: 'Revoke refresh token',
				security: [{ bearerAuth: [] }],
				responses: {
					'200': { description: 'Token revoked' },
					'401': { description: 'Unauthorized' }
				}
			}
		},
		'/accounts/forgot-password': {
			post: {
				summary: 'Generate a reset token',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['email'],
								properties: { email: { type: 'string', format: 'email' } }
							}
						}
					}
				},
				responses: {
					'200': { description: 'Reset token generated' }
				}
			}
		},
		'/accounts/validate-reset-token': {
			post: {
				summary: 'Validate reset token',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/TokenRequest' }
						}
					}
				},
				responses: {
					'200': { description: 'Token valid' },
					'400': { description: 'Invalid token' }
				}
			}
		},
		'/accounts/reset-password': {
			post: {
				summary: 'Reset password',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/ResetRequest' }
						}
					}
				},
				responses: {
					'200': { description: 'Password reset' },
					'400': { description: 'Invalid token' }
				}
			}
		},
		'/accounts': {
			get: {
				summary: 'List accounts (admin)',
				security: [{ bearerAuth: [] }],
				responses: {
					'200': {
						description: 'Accounts list',
						content: {
							'application/json': {
								schema: {
									type: 'array',
									items: { $ref: '#/components/schemas/Account' }
								}
							}
						}
					},
					'401': { description: 'Unauthorized' },
					'403': { description: 'Forbidden' }
				}
			},
			post: {
				summary: 'Create account (admin)',
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/RegisterRequest' }
						}
					}
				},
				responses: {
					'200': { description: 'Account created' },
					'400': { description: 'Email already registered' },
					'403': { description: 'Forbidden' }
				}
			}
		},
		'/accounts/{id}': {
			get: {
				summary: 'Get account by id',
				security: [{ bearerAuth: [] }],
				parameters: [
					{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
				],
				responses: {
					'200': { description: 'Account details' },
					'404': { description: 'Account not found' }
				}
			},
			put: {
				summary: 'Update account',
				security: [{ bearerAuth: [] }],
				parameters: [
					{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
				],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: { type: 'object' }
						}
					}
				},
				responses: {
					'200': { description: 'Account updated' },
					'404': { description: 'Account not found' }
				}
			},
			delete: {
				summary: 'Delete account',
				security: [{ bearerAuth: [] }],
				parameters: [
					{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
				],
				responses: {
					'200': { description: 'Account deleted' },
					'404': { description: 'Account not found' }
				}
			}
		}
	}
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// In-memory data store for demo/dev only.
const accounts = [];

const Role = {
	User: 'User',
	Admin: 'Admin'
};

// Helpers
function nowIso() {
	return new Date().toISOString();
}

function newId() {
	return accounts.length ? Math.max(...accounts.map((x) => x.id)) + 1 : 1;
}

function makeJwtToken(account) {
	const tokenPayload = {
		exp: Math.round(new Date(Date.now() + 15 * 60 * 1000).getTime() / 1000),
		id: account.id
	};
	return `fake-jwt-token.${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}`;
}

function makeRefreshToken() {
	return Date.now().toString();
}

function setRefreshTokenCookie(res, token) {
	const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	res.cookie('fakeRefreshToken', token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.COOKIE_SECURE === 'true',
		expires
	});
}

function getRefreshToken(req) {
	return req.cookies.fakeRefreshToken;
}


function basicDetails(account) {
	const { id, title, firstName, lastName, email, role, dateCreated, isVerified } = account;
	return { id, title, firstName, lastName, email, role, dateCreated, isVerified };
}

function authRequired(req, res, next) {
	const authHeader = req.header('Authorization') || '';
	if (!authHeader.startsWith('Bearer fake-jwt-token.')) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const token = authHeader.split('.')[1];
	let payload;
	try {
		payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
	} catch (error) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	if (Date.now() > payload.exp * 1000) {
		return res.status(401).json({ message: 'Token expired' });
	}

	const account = accounts.find((x) => x.id === payload.id);
	if (!account) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	req.account = account;
	return next();
}

function adminRequired(req, res, next) {
	if (!req.account || req.account.role !== Role.Admin) {
		return res.status(403).json({ message: 'Forbidden' });
	}
	return next();
}

// Routes
app.get('/', (req, res) => {
	res.json({ status: 'ok' });
});

app.post('/accounts/register', async (req, res) => {
	const account = { ...req.body };
	if (accounts.find((x) => x.email === account.email)) {
		return res.status(400).json({ message: `Email ${account.email} is already registered` });
	}

	account.id = newId();
	account.role = account.id === 1 ? Role.Admin : Role.User;
	account.dateCreated = nowIso();
	account.isVerified = true;
	account.refreshTokens = [];
	delete account.confirmPassword;

	accounts.push(account);

	return res.json({
		message: 'Registration successful.'
	});
});

app.post('/accounts/authenticate', (req, res) => {
	const { email, password } = req.body;
	const account = accounts.find((x) => x.email === email && x.password === password && x.isVerified);
	if (!account) {
		return res.status(400).json({ message: 'Email or password is incorrect' });
	}

	const refreshToken = makeRefreshToken();
	account.refreshTokens.push(refreshToken);
	setRefreshTokenCookie(res, refreshToken);

	return res.json({
		...basicDetails(account),
		jwtToken: makeJwtToken(account)
	});
});

app.post('/accounts/refresh-token', (req, res) => {
	const token = getRefreshToken(req);
	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const account = accounts.find((x) => x.refreshTokens.includes(token));
	if (!account) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	account.refreshTokens = account.refreshTokens.filter((x) => x !== token);
	const newToken = makeRefreshToken();
	account.refreshTokens.push(newToken);
	setRefreshTokenCookie(res, newToken);

	return res.json({
		...basicDetails(account),
		jwtToken: makeJwtToken(account)
	});
});

app.post('/accounts/revoke-token', authRequired, (req, res) => {
	const token = getRefreshToken(req);
	if (!token) {
		return res.json({ message: 'Token missing' });
	}

	req.account.refreshTokens = req.account.refreshTokens.filter((x) => x !== token);
	return res.json({ message: 'Token revoked' });
});

app.post('/accounts/forgot-password', (req, res) => {
	const { email } = req.body;
	const account = accounts.find((x) => x.email === email);
	if (!account) {
		return res.json({ message: 'If your email exists, a reset token was generated.' });
	}

	account.resetToken = Date.now().toString();
	account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
	return res.json({ message: 'Reset token generated', resetToken: account.resetToken });
});

app.post('/accounts/validate-reset-token', (req, res) => {
	const { token } = req.body;
	const account = accounts.find((x) => x.resetToken === token && new Date() < new Date(x.resetTokenExpires));
	if (!account) {
		return res.status(400).json({ message: 'Invalid token' });
	}
	return res.json({ message: 'Token valid' });
});

app.post('/accounts/reset-password', (req, res) => {
	const { token, password } = req.body;
	const account = accounts.find((x) => x.resetToken === token && new Date() < new Date(x.resetTokenExpires));
	if (!account) {
		return res.status(400).json({ message: 'Invalid token' });
	}

	account.password = password;
	account.isVerified = true;
	delete account.resetToken;
	delete account.resetTokenExpires;
	return res.json({ message: 'Password reset successful' });
});

app.get('/accounts', authRequired, adminRequired, (req, res) => {
	return res.json(accounts.map(basicDetails));
});

app.get('/accounts/:id', authRequired, (req, res) => {
	const account = accounts.find((x) => x.id === parseInt(req.params.id, 10));
	if (!account) {
		return res.status(404).json({ message: 'Account not found' });
	}
	if (account.id !== req.account.id && req.account.role !== Role.Admin) {
		return res.status(403).json({ message: 'Forbidden' });
	}
	return res.json(basicDetails(account));
});

app.post('/accounts', authRequired, adminRequired, (req, res) => {
	const account = { ...req.body };
	if (accounts.find((x) => x.email === account.email)) {
		return res.status(400).json({ message: `Email ${account.email} is already registered` });
	}

	account.id = newId();
	account.dateCreated = nowIso();
	account.isVerified = true;
	account.refreshTokens = [];
	delete account.confirmPassword;
	accounts.push(account);
	return res.json({ message: 'Account created' });
});

app.put('/accounts/:id', authRequired, (req, res) => {
	const account = accounts.find((x) => x.id === parseInt(req.params.id, 10));
	if (!account) {
		return res.status(404).json({ message: 'Account not found' });
	}
	if (account.id !== req.account.id && req.account.role !== Role.Admin) {
		return res.status(403).json({ message: 'Forbidden' });
	}

	const params = { ...req.body };
	if (!params.password) {
		delete params.password;
	}
	delete params.confirmPassword;
	Object.assign(account, params);

	return res.json(basicDetails(account));
});

app.delete('/accounts/:id', authRequired, (req, res) => {
	const accountId = parseInt(req.params.id, 10);
	if (accountId !== req.account.id && req.account.role !== Role.Admin) {
		return res.status(403).json({ message: 'Forbidden' });
	}

	const index = accounts.findIndex((x) => x.id === accountId);
	if (index === -1) {
		return res.status(404).json({ message: 'Account not found' });
	}

	accounts.splice(index, 1);
	return res.json({ message: 'Account deleted' });
});

app.listen(port, () => {
	console.log(`Backend running on http://localhost:${port}`);
});
