/**
 * OpenAPI 3.0 document for the BRACE Digital Platform backend.
 *
 * Kept as a single hand-authored object (rather than generated from JSDoc
 * comments scattered across route files) so the spec is one file to review,
 * cannot drift silently out of sync with a forgotten comment update, and is
 * trivial to validate/lint as plain JSON.
 *
 * Served as raw JSON at GET /openapi.json and rendered interactively by
 * Swagger UI at GET /docs.
 */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'BRACE Digital Platform API',
    version: '1.0.0',
    description:
      'Application-layer REST API for the BRACE Initiative digital platform: accounts, ' +
      'authentication, consortium partner data, and training-programme applications. ' +
      'This sits alongside (and is API-connected to) the separate content-management layer.',
    contact: {
      name: 'BRACE Digital Platform',
    },
  },
  servers: [
    { url: '/api/v1', description: 'Current API version (recommended)' },
    { url: '/api', description: 'Alias of the current version' },
  ],
  tags: [
    { name: 'Health', description: 'Liveness and readiness checks' },
    { name: 'Auth', description: 'Account registration, login, and session info' },
    { name: 'Partners', description: 'BRACE consortium partner directory' },
    { name: 'Trainings', description: 'Policy Expert Training Programme applications' },
    { name: 'News', description: 'Published and CMS-managed news content' },
    { name: 'Newsletters', description: 'Newsletter subscription and delivery management' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Obtain a token from POST /auth/login or POST /auth/register.',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'A human-readable description of what went wrong.' },
        },
      },
      UserRole: {
        type: 'string',
        enum: [
          'super_admin',
          'web_manager',
          'technical_reviewer',
          'country_coordinator',
          'consortium_partner',
          'applicant',
        ],
      },
      PublicUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_001' },
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string' },
          role: { $ref: '#/components/schemas/UserRole' },
          countryAffiliation: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@brace-initiative.org' },
          password: { type: 'string', format: 'password', example: 'ChangeMe123!' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'fullName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password', minLength: 8 },
          fullName: { type: 'string' },
          countryAffiliation: { type: 'string' },
        },
      },
      AuthResult: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/PublicUser' },
              accessToken: { type: 'string' },
              expiresIn: { type: 'string', example: '1h' },
            },
          },
        },
      },
      Partner: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'agenda-tanzania' },
          name: { type: 'string', example: 'AGENDA Tanzania' },
          country: { type: 'string', example: 'Tanzania' },
          role: { type: 'string' },
          isTechnicalLead: { type: 'boolean' },
          websiteUrl: { type: 'string', nullable: true },
        },
      },
      Newsletter: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'nl_123' },
          title: { type: 'string', example: 'Quarterly update' },
          bodyHtml: { type: 'string', example: '<p>Hello world</p>' },
          createdBy: { type: 'string', example: 'usr_web_manager' },
          sentAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      NewsletterSubscriber: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'sub_123' },
          email: { type: 'string', format: 'email', example: 'reader@example.org' },
          subscribedAt: { type: 'string', format: 'date-time' },
          isActive: { type: 'boolean', example: true },
        },
      },
      CreateNewsletterRequest: {
        type: 'object',
        required: ['title', 'bodyHtml'],
        properties: {
          title: { type: 'string', minLength: 3, example: 'Quarterly impact update' },
          bodyHtml: {
            type: 'string',
            minLength: 10,
            example: '<h2>Quarterly update</h2><p>We are publishing our latest progress.</p>',
          },
        },
      },
      NewsStatus: {
        type: 'string',
        enum: ['published', 'disabled'],
      },
      News: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'news_123' },
          title: { type: 'string', example: 'A new BRACE partnership' },
          tag: { type: 'string', example: 'Tanzania' },
          pillar: { type: 'string', example: 'Country support' },
          note: { type: 'string', example: 'Short summary for the homepage card.' },
          body: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true, example: '/uploads/news/172-abc.jpg' },
          status: { $ref: '#/components/schemas/NewsStatus' },
          publishedDate: { type: 'string', format: 'date-time' },
          createdBy: { type: 'string', example: 'usr_web_manager' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateNewsRequest: {
        type: 'object',
        required: ['title', 'tag', 'pillar', 'note'],
        properties: {
          title: { type: 'string', minLength: 3, example: 'Regional briefing launched' },
          tag: { type: 'string', minLength: 2, example: 'Tanzania' },
          pillar: { type: 'string', minLength: 2, example: 'Country support' },
          note: { type: 'string', minLength: 5, maxLength: 500, example: 'Short summary shown on the homepage.' },
          body: { type: 'string', example: 'Full story text...' },
          publishedDate: { type: 'string', format: 'date-time', example: '2026-09-23T12:00:00.000Z' },
          image: { type: 'string', format: 'binary' },
        },
      },
      UpdateNewsRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3 },
          tag: { type: 'string', minLength: 2 },
          pillar: { type: 'string', minLength: 2 },
          note: { type: 'string', minLength: 5, maxLength: 500 },
          body: { type: 'string' },
          publishedDate: { type: 'string', format: 'date-time' },
          image: { type: 'string', format: 'binary' },
        },
      },
      UpdateNewsStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { $ref: '#/components/schemas/NewsStatus' },
        },
      },
      SubscribeRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'reader@example.org' },
        },
      },
      UnsubscribeRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'reader@example.org' },
        },
      },
      TrainingApplicationStatus: {
        type: 'string',
        enum: ['submitted', 'under_review', 'approved', 'rejected'],
      },
      TrainingApplication: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'app_1a2b3c4d' },
          applicantFullName: { type: 'string' },
          applicantEmail: { type: 'string', format: 'email' },
          country: { type: 'string' },
          organisation: { type: 'string', nullable: true },
          motivation: { type: 'string' },
          status: { $ref: '#/components/schemas/TrainingApplicationStatus' },
          reviewedBy: { type: 'string', nullable: true },
          reviewNotes: { type: 'string', nullable: true },
          submittedAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      SubmitApplicationRequest: {
        type: 'object',
        required: ['applicantFullName', 'applicantEmail', 'country', 'motivation'],
        properties: {
          applicantFullName: { type: 'string' },
          applicantEmail: { type: 'string', format: 'email' },
          country: { type: 'string' },
          organisation: { type: 'string' },
          motivation: { type: 'string', minLength: 20, maxLength: 2000 },
        },
      },
      ReviewApplicationRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['approved', 'rejected'] },
          reviewNotes: { type: 'string', maxLength: 2000 },
        },
      },
    },
    responses: {
      ValidationError: {
        description: 'The request payload failed validation.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      Unauthorized: {
        description: 'Missing, invalid, or expired bearer token.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      Forbidden: {
        description: "The authenticated user's role does not permit this action.",
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      NotFound: {
        description: 'The requested resource does not exist.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      Conflict: {
        description: 'The request conflicts with the current state of the resource.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'General service status, including uptime',
        responses: { '200': { description: 'Service is running.' } },
      },
    },
    '/health/live': {
      get: {
        tags: ['Health'],
        summary: 'Liveness probe - is the process running?',
        responses: { '200': { description: 'Process is alive.' } },
      },
    },
    '/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness probe - is the process ready to accept traffic?',
        responses: { '200': { description: 'Process is ready.' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate with email and password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': {
            description: 'Authenticated successfully.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResult' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Self-register a new applicant account',
        description:
          'Always creates an account with role "applicant". Staff roles are provisioned separately.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          '201': {
            description: 'Account created.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResult' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '409': { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: "Get the current authenticated user's profile",
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user profile.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: { user: { $ref: '#/components/schemas/PublicUser' } },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out (client-side token discard)',
        description:
          'Tokens are stateless JWTs with their own expiry; this endpoint exists for a ' +
          'conventional REST contract. The client is responsible for discarding the token.',
        responses: { '200': { description: 'Acknowledged.' } },
      },
    },
    '/auth/users': {
      get: {
        tags: ['Auth'],
        summary: 'List all user accounts (staff only)',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or technical_reviewer.',
        responses: {
          '200': {
            description: 'List of users.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/PublicUser' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/partners': {
      get: {
        tags: ['Partners'],
        summary: 'List all BRACE consortium partners',
        responses: {
          '200': {
            description: 'List of partners.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        partners: { type: 'array', items: { $ref: '#/components/schemas/Partner' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/partners/country/{country}': {
      get: {
        tags: ['Partners'],
        summary: 'List partners active in a given country',
        parameters: [
          { name: 'country', in: 'path', required: true, schema: { type: 'string' }, example: 'Ghana' },
        ],
        responses: {
          '200': {
            description: 'List of partners in that country (may be empty).',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        partners: { type: 'array', items: { $ref: '#/components/schemas/Partner' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/partners/{id}': {
      get: {
        tags: ['Partners'],
        summary: 'Get a single partner by id',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'mri-ghana' },
        ],
        responses: {
          '200': {
            description: 'The partner.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { partner: { $ref: '#/components/schemas/Partner' } } },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/trainings/applications': {
      post: {
        tags: ['Trainings'],
        summary: 'Submit a training-programme application (public)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SubmitApplicationRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'Application submitted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: { application: { $ref: '#/components/schemas/TrainingApplication' } },
                    },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
      get: {
        tags: ['Trainings'],
        summary: 'List all training applications (staff only)',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin, country_coordinator, or technical_reviewer.',
        responses: {
          '200': {
            description: 'List of applications.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        applications: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/TrainingApplication' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/trainings/applications/{id}': {
      get: {
        tags: ['Trainings'],
        summary: 'Get a single training application by id (staff only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'The application.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: { application: { $ref: '#/components/schemas/TrainingApplication' } },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/trainings/applications/{id}/review': {
      patch: {
        tags: ['Trainings'],
        summary: 'Approve or reject a training application',
        security: [{ bearerAuth: [] }],
        description: 'Requires role country_coordinator or super_admin.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ReviewApplicationRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'Application updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: { application: { $ref: '#/components/schemas/TrainingApplication' } },
                    },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/newsletters/subscribe': {
      post: {
        tags: ['Newsletters'],
        summary: 'Subscribe an email address to the newsletter',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SubscribeRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'Subscriber created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: { subscriber: { $ref: '#/components/schemas/NewsletterSubscriber' } },
                    },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/newsletters/unsubscribe': {
      post: {
        tags: ['Newsletters'],
        summary: 'Unsubscribe an email address from the newsletter',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UnsubscribeRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'Unsubscription acknowledged.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { nullable: true },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/newsletters': {
      post: {
        tags: ['Newsletters'],
        summary: 'Create a new newsletter draft/campaign',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateNewsletterRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'Newsletter created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: { newsletter: { $ref: '#/components/schemas/Newsletter' } },
                    },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
      get: {
        tags: ['Newsletters'],
        summary: 'List all newsletters (admin only)',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        responses: {
          '200': {
            description: 'List of newsletters.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        newsletters: { type: 'array', items: { $ref: '#/components/schemas/Newsletter' } },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/newsletters/subscribers': {
      get: {
        tags: ['Newsletters'],
        summary: 'List all newsletter subscribers (admin only)',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        responses: {
          '200': {
            description: 'List of subscribers.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        subscribers: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/NewsletterSubscriber' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/newsletters/{id}': {
      get: {
        tags: ['Newsletters'],
        summary: 'Get a single newsletter by id',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'The newsletter.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: { newsletter: { $ref: '#/components/schemas/Newsletter' } },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/newsletters/{id}/send': {
      post: {
        tags: ['Newsletters'],
        summary: 'Send a newsletter to all active subscribers',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Newsletter sent successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'success' }, data: { type: 'object' } },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/news': {
      get: {
        tags: ['News'],
        summary: 'List published news items for the public feed',
        responses: {
          '200': {
            description: 'Published news items.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { news: { type: 'array', items: { $ref: '#/components/schemas/News' } } } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['News'],
        summary: 'Create a new news item (admin only)',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: { $ref: '#/components/schemas/CreateNewsRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'News item created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { news: { $ref: '#/components/schemas/News' } } },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/news/{id}': {
      get: {
        tags: ['News'],
        summary: 'Get a published news item by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'The news item.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { news: { $ref: '#/components/schemas/News' } } },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['News'],
        summary: 'Update a news item (admin only)',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: { $ref: '#/components/schemas/UpdateNewsRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'News item updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { news: { $ref: '#/components/schemas/News' } } },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/news/admin/all': {
      get: {
        tags: ['News'],
        summary: 'List all news items, including disabled ones',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        responses: {
          '200': {
            description: 'All news items.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { news: { type: 'array', items: { $ref: '#/components/schemas/News' } } } },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/news/admin/{id}': {
      get: {
        tags: ['News'],
        summary: 'Get a single news item for admin editing',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'The admin view of the news item.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { news: { $ref: '#/components/schemas/News' } } },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/news/{id}/status': {
      patch: {
        tags: ['News'],
        summary: 'Toggle a news item between published and disabled states',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateNewsStatusRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'Status updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { news: { $ref: '#/components/schemas/News' } } },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
};
