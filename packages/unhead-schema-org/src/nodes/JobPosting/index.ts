import type { ResolvableDate, Thing } from '../../types'
import { resolvableDateToDate } from '../../utils'
import { defineSchemaOrgResolver } from '../../core'
import type { Organization } from '../Organization'
import type { Place } from './Place'
import type { MonetaryAmount } from './MonetaryAmount'

export interface JobPostingSimple extends Thing {
  /**
   * The original date that employer posted the job in ISO 8601 format.
   * For example, "2017-01-24" or "2017-01-24T19:33:17+00:00".
   */
  datePosted: ResolvableDate

  /**
   * The full description of the job in HTML format.
   *
   * The description must be a complete representation of the job, including job responsibilities, qualifications,
   * skills, working hours, education requirements, and experience requirements. The description can't be the same as
   * the title
   */
  description: string

  /**
   * The organization offering the job position. This must be the name of the company (for example, "Starbucks, Inc"),
   * and not the specific location that is hiring (for example, "Starbucks on Main Street").
   */
  hiringOrganization: Organization

  /**
   * The physical location(s) of the business where the employee will report to work (such as an office or worksite),
   * not the location where the job was posted. Include as many properties as possible. The more properties you provide,
   * the higher quality the job posting is to our users. Note that you must include the addressCountry property.
   */
  jobLocation: Place

  /**
   * The title of the job (not the title of the posting). For example, "Software Engineer" or "Barista"
   */
  title: string

  /**
   * The actual base salary for the job, as provided by the employer (not an estimate).
   */
  baseSalary?: MonetaryAmount
}

export interface JobPosting extends JobPostingSimple {}

export const jobPostingResolver = defineSchemaOrgResolver<JobPosting>({
  defaults: {
    '@type': 'JobPosting',
  },
  resolve(node) {
    node.datePosted = resolvableDateToDate(node.datePosted)
    return node
  },
})
