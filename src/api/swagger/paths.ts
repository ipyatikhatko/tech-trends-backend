export const paths = {
  '/api/jobs': {
    get: {
      summary: 'Get all jobs with pagination and filters',
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer' },
          description: 'Page number (default: 1)',
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer' },
          description: 'Items per page (default: 10)',
        },
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          description: 'Search in title, company, and description',
        },
        {
          in: 'query',
          name: 'workFormat',
          schema: {
            type: 'string',
            enum: ['Remote', 'Office', 'Hybrid'],
          },
          description: 'Filter by work format',
        },
        {
          in: 'query',
          name: 'englishLevel',
          schema: {
            type: 'string',
            enum: [
              'No English',
              'Beginner/Elementary',
              'Pre-Intermediate',
              'Intermediate',
              'Upper-Intermediate',
              'Advanced',
              'Fluent',
            ],
          },
          description: 'Filter by English level',
        },
        {
          in: 'query',
          name: 'experienceYears',
          schema: { type: 'number' },
          description: 'Filter by minimum years of experience',
        },
        {
          in: 'query',
          name: 'minSalary',
          schema: { type: 'number' },
          description: 'Filter by minimum salary',
        },
        {
          in: 'query',
          name: 'maxSalary',
          schema: { type: 'number' },
          description: 'Filter by maximum salary',
        },
        {
          in: 'query',
          name: 'technologyId',
          schema: { type: 'integer' },
          description: 'Filter by technology ID',
        },
        {
          in: 'query',
          name: 'orderBy',
          schema: {
            type: 'string',
            enum: ['postedAt', 'views', 'applications', 'experienceYears'],
          },
          description: 'Sort field (default: postedAt)',
        },
        {
          in: 'query',
          name: 'order',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
          },
          description: 'Sort order (default: desc)',
        },
      ],
      responses: {
        200: {
          description: 'Paginated list of jobs',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Job' },
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      pageSize: { type: 'integer' },
                      totalPages: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/jobs/filters': {
    get: {
      summary: 'Get available filter options',
      responses: {
        200: {
          description: 'Available filter options',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  workFormats: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  englishLevels: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  technologies: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Technology' },
                  },
                  experienceRange: {
                    type: 'object',
                    properties: {
                      min: { type: 'number' },
                      max: { type: 'number' },
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
  '/api/jobs/technologies': {
    get: {
      summary: 'Get all technologies with job counts',
      responses: {
        200: {
          description: 'List of technologies',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Technology' },
              },
            },
          },
        },
      },
    },
  },
  '/api/jobs/technology/{id}': {
    get: {
      summary: 'Get jobs for a specific technology',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'Technology ID',
        },
      ],
      responses: {
        200: {
          description: 'List of jobs for the technology',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Job' },
              },
            },
          },
        },
      },
    },
  },
}
