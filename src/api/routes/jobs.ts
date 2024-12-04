import { Router } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'
import { JobsQuery } from '../types/query.types'

const router = Router()
const prisma = new PrismaClient()

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs with pagination and filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of jobs
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      workFormat,
      englishLevel,
      experienceYears,
      minSalary,
      maxSalary,
      technologyId,
      orderBy = 'postedAt',
      order = 'desc',
    } = req.query as JobsQuery

    // Build where clause
    const where: Prisma.JobWhereInput = {
      AND: [
        // Search in title, company, or description
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        // Filters
        workFormat ? { workFormat } : {},
        englishLevel ? { englishLevel } : {},
        experienceYears
          ? { experienceYears: { gte: parseFloat(experienceYears) } }
          : {},
        technologyId ? { technologyId: parseInt(technologyId) } : {},
        // Salary filter (if salary is stored as string, needs parsing)
        minSalary || maxSalary
          ? {
              salary: {
                not: null,
                // Add your salary parsing logic here
              },
            }
          : {},
      ],
    }

    // Calculate pagination
    const pageNum = parseInt(page)
    const pageSize = parseInt(limit)
    const skip = (pageNum - 1) * pageSize

    // Get total count for pagination
    const total = await prisma.job.count({ where })

    // Get paginated and filtered jobs
    const jobs = await prisma.job.findMany({
      where,
      include: {
        technology: true,
      },
      orderBy: {
        [orderBy]: order,
      },
      skip,
      take: pageSize,
    })

    // Return paginated response
    res.json({
      data: jobs,
      pagination: {
        total,
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({ error: 'Failed to fetch jobs' })
  }
})

// GET /api/jobs/filters - Get available filter options
router.get('/filters', async (req, res) => {
  try {
    const [workFormats, englishLevels, technologies, experienceRange] =
      await Promise.all([
        // Get unique work formats
        prisma.job.findMany({
          select: { workFormat: true },
          distinct: ['workFormat'],
          where: { workFormat: { not: null } },
        }),
        // Get unique English levels
        prisma.job.findMany({
          select: { englishLevel: true },
          distinct: ['englishLevel'],
          where: { englishLevel: { not: null } },
        }),
        // Get technologies with job counts
        prisma.technology.findMany({
          include: {
            _count: {
              select: { jobs: true },
            },
          },
        }),
        // Get min/max experience years
        prisma.job.aggregate({
          _min: { experienceYears: true },
          _max: { experienceYears: true },
        }),
      ])

    res.json({
      workFormats: workFormats.map((w) => w.workFormat).filter(Boolean),
      englishLevels: englishLevels.map((e) => e.englishLevel).filter(Boolean),
      technologies,
      experienceRange: {
        min: experienceRange._min.experienceYears,
        max: experienceRange._max.experienceYears,
      },
    })
  } catch (error) {
    console.error('Error fetching filters:', error)
    res.status(500).json({ error: 'Failed to fetch filters' })
  }
})

// GET /api/jobs/technologies
router.get('/technologies', async (req, res) => {
  try {
    const technologies = await prisma.technology.findMany({
      include: {
        _count: {
          select: { jobs: true },
        },
      },
    })
    res.json(technologies)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch technologies' })
  }
})

// GET /api/jobs/technology/:id
router.get('/technology/:id', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        technologyId: parseInt(req.params.id),
      },
      include: {
        technology: true,
      },
    })
    res.json(jobs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs by technology' })
  }
})

export default router
