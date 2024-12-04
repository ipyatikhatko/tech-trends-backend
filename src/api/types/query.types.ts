export interface PaginationQuery {
  page?: string
  limit?: string
}

export interface JobFilters {
  search?: string
  workFormat?: string
  englishLevel?: string
  experienceYears?: string
  minSalary?: string
  maxSalary?: string
  technologyId?: string
  orderBy?: 'postedAt' | 'views' | 'applications'
  order?: 'asc' | 'desc'
}

export type JobsQuery = PaginationQuery & JobFilters
