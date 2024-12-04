export interface JobPosition {
  title: string
  salary?: string
}

export interface JobCompany {
  name: string
  logo?: string
}

export interface JobWorkplace {
  remote: boolean
  location: string
  experienceYears: string
  englishLevel: string
}

export interface JobStatistics {
  views: number
  applications: number
  postedAt: Date | null
}

export interface JobListing {
  jobId: string
  position: JobPosition
  company: JobCompany
  workplaceInfo: JobWorkplace
  statistics: JobStatistics
  description: string
  technologyId: number
}
