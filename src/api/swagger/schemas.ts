export const schemas = {
  Technology: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      djinniKeyword: { type: 'string' },
      _count: {
        type: 'object',
        properties: {
          jobs: { type: 'integer' },
        },
      },
    },
  },
  Job: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      jobId: { type: 'string' },
      title: { type: 'string' },
      salary: { type: 'string', nullable: true },
      company: { type: 'string' },
      companyLogo: { type: 'string', nullable: true },
      workFormat: { type: 'string' },
      location: { type: 'string' },
      description: { type: 'string' },
      views: { type: 'integer' },
      applications: { type: 'integer' },
      postedAt: { type: 'string', format: 'date-time' },
      experienceYears: { type: 'number' },
      englishLevel: { type: 'string' },
      technologyId: { type: 'integer' },
      technology: { $ref: '#/components/schemas/Technology' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
}
