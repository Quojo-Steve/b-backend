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
const trainingEnvelope = (description: string, dataProps: Record<string, unknown>) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: { type: 'object', properties: dataProps },
        },
      },
    },
  },
});

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
    { url: '/api', description: 'Current version' }
  ],
  tags: [
    { name: 'Health', description: 'Liveness and readiness checks' },
    { name: 'Auth', description: 'Account registration, login, and session info' },
    { name: 'Partners', description: 'BRACE consortium partner directory' },
    { name: 'Trainings', description: 'Trainings, cohorts and registrations' },
    { name: 'News', description: 'Published and CMS-managed news content' },
    { name: 'Press Releases', description: 'Published and CMS-managed press releases' },
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
      CreateUserRequest: {
        type: 'object',
        required: ['email', 'password', 'fullName', 'role'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password', minLength: 8 },
          fullName: { type: 'string', minLength: 2 },
          role: { $ref: '#/components/schemas/UserRole' },
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
          about: { type: 'string', example: 'Consortium lead' },
          aboutFr: { type: 'string', nullable: true, example: 'Chef du consortium' },
          description: { type: 'string', example: 'Consortium lead and funding recipient.' },
          descriptionFr: { type: 'string', nullable: true, example: 'Chef du consortium et bénéficiaire du financement.' },
          websiteUrl: { type: 'string', nullable: true },
          logoUrl: { type: 'string', nullable: true, example: '/uploads/partners/172-abc.png' },
          isActive: { type: 'boolean', example: true },
        },
      },
      CreatePartnerRequest: {
        type: 'object',
        required: ['name', 'country', 'about', 'description'],
        properties: {
          name: { type: 'string', minLength: 2, example: 'AGENDA Tanzania' },
          country: { type: 'string', minLength: 2, example: 'Tanzania' },
          about: { type: 'string', minLength: 2, example: 'Consortium lead' },
          aboutFr: { type: 'string', description: 'Optional French translation.', example: 'Chef du consortium' },
          description: { type: 'string', example: 'Consortium lead and funding recipient.' },
          descriptionFr: { type: 'string', description: 'Optional French translation.', example: 'Chef du consortium et bénéficiaire du financement.' },
          websiteUrl: { type: 'string', format: 'uri', example: 'https://example.org' },
          logo: { type: 'string', format: 'binary', description: 'JPEG, PNG, WEBP, or GIF; maximum 5MB.' },
          isActive: { type: 'boolean', example: true },
        },
      },
      UpdatePartnerRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          country: { type: 'string', minLength: 2 },
          about: { type: 'string', minLength: 2 },
          aboutFr: { type: 'string', description: 'Optional French translation.' },
          description: { type: 'string' },
          descriptionFr: { type: 'string', description: 'Optional French translation.' },
          websiteUrl: { type: 'string', format: 'uri' },
          logo: { type: 'string', format: 'binary', description: 'JPEG, PNG, WEBP, or GIF; maximum 5MB.' },
          isActive: { type: 'boolean' },
        },
      },
      UpdatePartnerStatusRequest: {
        type: 'object',
        required: ['isActive'],
        properties: {
          isActive: { type: 'boolean', example: false },
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
      PressReleaseStatus: {
        type: 'string',
        enum: ['published', 'disabled'],
      },
      News: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'news_123' },
          title: { type: 'string', example: 'A new BRACE partnership' },
          titleFr: { type: 'string', nullable: true, example: 'Un nouveau partenariat BRACE' },
          tag: { type: 'string', example: 'Tanzania' },
          tagFr: { type: 'string', nullable: true, example: 'Tanzanie' },
          pillar: { type: 'string', example: 'Country support' },
          pillarFr: { type: 'string', nullable: true, example: 'Appui pays' },
          note: { type: 'string', example: 'Short summary for the homepage card.' },
          noteFr: { type: 'string', nullable: true, example: 'Résumé court pour la carte de la page d’accueil.' },
          body: { type: 'string', nullable: true },
          bodyFr: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true, example: '/uploads/news/172-abc.jpg' },
          status: { $ref: '#/components/schemas/NewsStatus' },
          publishedDate: { type: 'string', format: 'date-time' },
          createdBy: { type: 'string', example: 'usr_web_manager' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PressRelease: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'pr_123' },
          title: { type: 'string', example: 'BRACE launches new policy brief' },
          titleFr: { type: 'string', nullable: true, example: 'BRACE lance une nouvelle note de politique' },
          summary: { type: 'string', nullable: true, example: 'Short overview of the release.' },
          summaryFr: { type: 'string', nullable: true, example: 'Bref aperçu du communiqué.' },
          documentUrl: { type: 'string', nullable: true, example: '/uploads/press-releases/172-abc.pdf' },
          documentName: { type: 'string', nullable: true, example: 'brief.pdf' },
          status: { $ref: '#/components/schemas/PressReleaseStatus' },
          releaseDate: { type: 'string', format: 'date-time' },
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
          titleFr: { type: 'string', description: 'Optional French translation.', example: 'Lancement d’un briefing régional' },
          tag: { type: 'string', minLength: 2, example: 'Tanzania' },
          tagFr: { type: 'string', description: 'Optional French translation.', example: 'Tanzanie' },
          pillar: { type: 'string', minLength: 2, example: 'Country support' },
          pillarFr: { type: 'string', description: 'Optional French translation.', example: 'Appui pays' },
          note: { type: 'string', minLength: 5, maxLength: 50000, example: 'Short summary shown on the homepage.' },
          noteFr: { type: 'string', description: 'Optional French translation.', maxLength: 50000, example: 'Résumé court affiché sur la page d’accueil.' },
          body: { type: 'string', example: 'Full story text...' },
          bodyFr: { type: 'string', description: 'Optional French translation.', example: 'Texte complet en français...' },
          publishedDate: { type: 'string', format: 'date-time', example: '2026-09-23T12:00:00.000Z' },
          image: { type: 'string', format: 'binary' },
        },
      },
      UpdateNewsRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3 },
          titleFr: { type: 'string', description: 'Optional French translation.' },
          tag: { type: 'string', minLength: 2 },
          tagFr: { type: 'string', description: 'Optional French translation.' },
          pillar: { type: 'string', minLength: 2 },
          pillarFr: { type: 'string', description: 'Optional French translation.' },
          note: { type: 'string', minLength: 5, maxLength: 50000 },
          noteFr: { type: 'string', description: 'Optional French translation.', maxLength: 50000 },
          body: { type: 'string' },
          bodyFr: { type: 'string', description: 'Optional French translation.' },
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
      CreatePressReleaseRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 3, example: 'BRACE launches new policy brief' },
          titleFr: { type: 'string', description: 'Optional French translation.', example: 'BRACE lance une nouvelle note de politique' },
          summary: { type: 'string', maxLength: 50000, example: 'A short summary...' },
          summaryFr: { type: 'string', description: 'Optional French translation.', maxLength: 50000, example: 'Bref résumé en français...' },
          releaseDate: { type: 'string', format: 'date-time', example: '2026-09-23T12:00:00.000Z' },
          document: { type: 'string', format: 'binary' },
        },
      },
      UpdatePressReleaseRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3 },
          titleFr: { type: 'string', description: 'Optional French translation.' },
          summary: { type: 'string', maxLength: 50000 },
          summaryFr: { type: 'string', description: 'Optional French translation.', maxLength: 50000 },
          releaseDate: { type: 'string', format: 'date-time' },
          document: { type: 'string', format: 'binary' },
        },
      },
      UpdatePressReleaseStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { $ref: '#/components/schemas/PressReleaseStatus' },
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
      TrainingStatus: { type: 'string', enum: ['published', 'disabled'] },
      TrainingApplication: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'app_1a2b3c4d' },
          cohortId: { type: 'string', nullable: true },
          cohortName: { type: 'string', nullable: true, description: 'Included in staff list/get responses.' },
          trainingId: { type: 'string', nullable: true, description: 'Included in staff list/get responses.' },
          trainingTitle: { type: 'string', nullable: true, description: 'Included in staff list/get responses.' },
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
        required: ['cohortId', 'applicantFullName', 'applicantEmail', 'country', 'motivation'],
        properties: {
          cohortId: { type: 'string', example: 'clx1abc2d0000xyz' },
          applicantFullName: { type: 'string' },
          applicantEmail: { type: 'string', format: 'email' },
          country: { type: 'string' },
          organisation: { type: 'string' },
          motivation: { type: 'string', minLength: 20, maxLength: 50000 },
        },
      },
      Cohort: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          trainingId: { type: 'string' },
          name: { type: 'string', example: 'Cohort 1' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          capacity: { type: 'integer', description: 'Application limit for this cohort.', example: 30 },
          registeredCount: { type: 'integer', description: 'Registrations that are not rejected.', example: 12 },
          spotsLeft: { type: 'integer', example: 18 },
          registrationOpen: {
            type: 'boolean',
            description: 'False once the cohort has started, the cohort is full, or the training is disabled.',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Training: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string', example: 'Policy Expert Training Programme' },
          description: { type: 'string', nullable: true },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          status: { $ref: '#/components/schemas/TrainingStatus' },
          cohortCount: { type: 'integer', example: 3 },
          cohorts: { type: 'array', items: { $ref: '#/components/schemas/Cohort' } },
          createdBy: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CohortInput: {
        type: 'object',
        required: ['name', 'startDate', 'endDate', 'capacity'],
        properties: {
          name: { type: 'string', minLength: 2, example: 'Cohort 1' },
          startDate: { type: 'string', format: 'date-time', example: '2026-11-03T08:00:00.000Z' },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'Must be after startDate and within the training dates.',
            example: '2026-11-14T17:00:00.000Z',
          },
          capacity: { type: 'integer', minimum: 1, description: 'Application limit.', example: 30 },
        },
      },
      CreateTrainingRequest: {
        type: 'object',
        required: ['title', 'startDate', 'endDate', 'cohorts'],
        properties: {
          title: { type: 'string', minLength: 3, example: 'Policy Expert Training Programme' },
          description: { type: 'string', maxLength: 50000 },
          startDate: { type: 'string', format: 'date-time', example: '2026-11-01T00:00:00.000Z' },
          endDate: { type: 'string', format: 'date-time', example: '2027-02-28T23:59:59.000Z' },
          cohorts: {
            type: 'array',
            minItems: 1,
            maxItems: 50,
            description: 'One entry per cohort; the array length is the number of cohorts.',
            items: { $ref: '#/components/schemas/CohortInput' },
          },
        },
      },
      UpdateTrainingRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3 },
          description: { type: 'string', maxLength: 50000 },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
      UpdateCohortRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          capacity: { type: 'integer', minimum: 1, description: 'Cannot be lower than the current registered count.' },
        },
      },
      UpdateTrainingStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: { status: { $ref: '#/components/schemas/TrainingStatus' } },
      },
      ReviewApplicationRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['approved', 'rejected'] },
          reviewNotes: { type: 'string', maxLength: 50000 },
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
        summary: 'Self-register a new web_manager account',
        description:
          'Always creates an account with role "web_manager". Staff roles are provisioned separately.',
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
      post: {
        tags: ['Auth'],
        summary: 'Create a user account for any role',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin. This endpoint may create any UserRole account. WEB_MANAGER = web_manager, // Day-to-day CMS/content administration, TECHNICAL_REVIEWER = technical_reviewer, // Oeko-Institut - technical/scientific, COUNTRY_COORDINATOR = country_coordinator, // Per-country content & applications, CONSORTIUM_PARTNER = consortium_partner, // Partner-restricted area access, APPLICANT = applicant, // Training programme applicants',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } } },
        },
        responses: {
          '201': {
            description: 'User account created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { user: { $ref: '#/components/schemas/PublicUser' } } },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '409': { $ref: '#/components/responses/Conflict' },
        },
      },
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
        summary: 'List active BRACE consortium partners',
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
      post: {
        tags: ['Partners'],
        summary: 'Create a consortium partner',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: { $ref: '#/components/schemas/CreatePartnerRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'Partner created.',
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
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/partners/admin/all': {
      get: {
        tags: ['Partners'],
        summary: 'List all partners, including disabled partners',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        responses: {
          '200': {
            description: 'List of all partners.',
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
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
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
      patch: {
        tags: ['Partners'],
        summary: 'Edit a consortium partner',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'mri-ghana' },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: { $ref: '#/components/schemas/UpdatePartnerRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'Partner updated.',
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
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/partners/{id}/status': {
      patch: {
        tags: ['Partners'],
        summary: 'Enable or disable a consortium partner',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager. Set isActive to false to disable a partner.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'mri-ghana' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdatePartnerStatusRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'Partner status updated.',
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
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/trainings/applications': {
      post: {
        tags: ['Trainings'],
        summary: 'Register for a training cohort (public)',
        description:
          'Fails with 409 if the cohort has already started, is full, or the email is already registered for this training.',
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
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { $ref: '#/components/responses/Conflict' },
        },
      },
      get: {
        tags: ['Trainings'],
        summary: 'List training registrations (staff only)',
        security: [{ bearerAuth: [] }],
        description:
          'Requires role super_admin, web_manager, country_coordinator, or technical_reviewer. Optionally filter by cohort or training.',
        parameters: [
          { name: 'cohortId', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'trainingId', in: 'query', required: false, schema: { type: 'string' } },
        ],
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
        summary: 'Get a single training registration by id (staff only)',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin, web_manager, country_coordinator, or technical_reviewer.',
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
    '/trainings': {
      get: {
        tags: ['Trainings'],
        summary: 'List published trainings with their cohorts (public)',
        responses: {
          '200': trainingEnvelope('Published trainings.', {
            trainings: { type: 'array', items: { $ref: '#/components/schemas/Training' } },
          }),
        },
      },
      post: {
        tags: ['Trainings'],
        summary: 'Create a training together with its cohorts',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager. Every cohort must fall within the training dates.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTrainingRequest' } } },
        },
        responses: {
          '201': trainingEnvelope('Training created.', { training: { $ref: '#/components/schemas/Training' } }),
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '409': { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/trainings/admin/all': {
      get: {
        tags: ['Trainings'],
        summary: 'List every training, including disabled ones (admin)',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        responses: {
          '200': trainingEnvelope('All trainings.', {
            trainings: { type: 'array', items: { $ref: '#/components/schemas/Training' } },
          }),
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/trainings/{id}': {
      get: {
        tags: ['Trainings'],
        summary: 'Get a published training with its cohorts (public)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': trainingEnvelope('The training.', { training: { $ref: '#/components/schemas/Training' } }),
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Trainings'],
        summary: 'Update a training',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager. New dates must still contain every existing cohort.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTrainingRequest' } } },
        },
        responses: {
          '200': trainingEnvelope('Training updated.', { training: { $ref: '#/components/schemas/Training' } }),
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/trainings/{id}/status': {
      patch: {
        tags: ['Trainings'],
        summary: 'Publish or disable a training',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager. Disabled trainings cannot be registered for.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTrainingStatusRequest' } } },
        },
        responses: {
          '200': trainingEnvelope('Status updated.', { training: { $ref: '#/components/schemas/Training' } }),
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/trainings/{id}/cohorts': {
      post: {
        tags: ['Trainings'],
        summary: 'Add a cohort to an existing training',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager. Cohort dates must fall within the training dates.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CohortInput' } } },
        },
        responses: {
          '201': trainingEnvelope('Cohort created.', { cohort: { $ref: '#/components/schemas/Cohort' } }),
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/trainings/cohorts/{cohortId}': {
      patch: {
        tags: ['Trainings'],
        summary: 'Update a cohort',
        security: [{ bearerAuth: [] }],
        description:
          'Requires role super_admin or web_manager. Dates must stay within the training dates; the application limit cannot drop below the number already registered.',
        parameters: [{ name: 'cohortId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCohortRequest' } } },
        },
        responses: {
          '200': trainingEnvelope('Cohort updated.', { cohort: { $ref: '#/components/schemas/Cohort' } }),
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
    '/press-releases': {
      get: {
        tags: ['Press Releases'],
        summary: 'List published press releases for the public feed',
        responses: {
          '200': {
            description: 'Published press releases.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { pressReleases: { type: 'array', items: { $ref: '#/components/schemas/PressRelease' } } } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Press Releases'],
        summary: 'Create a new press release (admin only)',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: { $ref: '#/components/schemas/CreatePressReleaseRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'Press release created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { pressRelease: { $ref: '#/components/schemas/PressRelease' } } },
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
    '/press-releases/{id}': {
      get: {
        tags: ['Press Releases'],
        summary: 'Get a published press release by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'The press release.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { pressRelease: { $ref: '#/components/schemas/PressRelease' } } },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Press Releases'],
        summary: 'Update a press release (admin only)',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: { $ref: '#/components/schemas/UpdatePressReleaseRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'Press release updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { pressRelease: { $ref: '#/components/schemas/PressRelease' } } },
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
    '/press-releases/admin/all': {
      get: {
        tags: ['Press Releases'],
        summary: 'List all press releases, including disabled ones',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        responses: {
          '200': {
            description: 'All press releases.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { pressReleases: { type: 'array', items: { $ref: '#/components/schemas/PressRelease' } } } },
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
    '/press-releases/admin/{id}': {
      get: {
        tags: ['Press Releases'],
        summary: 'Get a single press release for admin editing',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'The admin view of the press release.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { pressRelease: { $ref: '#/components/schemas/PressRelease' } } },
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
    '/press-releases/{id}/status': {
      patch: {
        tags: ['Press Releases'],
        summary: 'Toggle a press release between published and disabled states',
        security: [{ bearerAuth: [] }],
        description: 'Requires role super_admin or web_manager.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdatePressReleaseStatusRequest' } },
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
                    data: { type: 'object', properties: { pressRelease: { $ref: '#/components/schemas/PressRelease' } } },
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
