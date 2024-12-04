export function validateAndParseDate(dateString: string): Date {
  // Handle empty or invalid input
  if (!dateString) {
    return new Date()
  }

  try {
    // Try parsing the date directly
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date
    }

    // If the direct parsing fails, try to parse the relative date format
    if (dateString.includes('today')) {
      return new Date()
    }
    if (dateString.includes('yesterday')) {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date
    }
    if (dateString.includes('days ago')) {
      const days = parseInt(dateString.match(/\d+/)?.[0] || '0')
      const date = new Date()
      date.setDate(date.getDate() - days)
      return date
    }

    // Default to current date if all parsing fails
    return new Date()
  } catch (error) {
    console.warn(`Failed to parse date: ${dateString}, using current date`)
    return new Date()
  }
}
