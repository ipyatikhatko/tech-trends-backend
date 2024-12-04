import { Job } from '@prisma/client'
import { JobListing } from '../types/job.types'

function transformJobData(listing: JobListing): Omit<Job, 'id' | 'createdAt'> {
  const { title, salary } = listing.position
  const { name: company, logo: companyLogo } = listing.company
  const { remote, location, experienceYears, englishLevel } =
    listing.workplaceInfo
  const { views, applications, postedAt } = listing.statistics
  const description = listing.description

  return {
    jobId: listing.jobId,
    title,
    salary: salary || null,
    company,
    companyLogo: companyLogo || null,
    workFormat: remote ? 'Remote' : 'Office',
    location,
    description,
    views,
    applications,
    postedAt: postedAt,
    experienceYears: parseFloat(experienceYears),
    englishLevel,
    technologyId: listing.technologyId,
  }
}

export default transformJobData
