// Ported 1:1 from app/Constants/Status.php so numeric values stay compatible with migrated data.
export const S = {
  NO: 0, YES: 1,
  PAYMENT: { INITIATE: 0, SUCCESS: 1, PENDING: 2, REJECT: 3 },
  TICKET: { OPEN: 0, ANSWER: 1, REPLY: 2, CLOSE: 3 },
  USER: { BAN: 0, ACTIVE: 1 },
  JOB: { DRAFT: 0, PUBLISH: 1, PROCESSING: 2, COMPLETED: 3, FINISHED: 4 },
  JOB_APPROVAL: { PENDING: 0, APPROVED: 1, REJECTED: 3 },
  BID: { PENDING: 0, ACCEPTED: 1, COMPLETED: 2, REJECTED: 3, WITHDRAW: 4 },
  PROJECT: { RUNNING: 1, COMPLETED: 2, REJECTED: 3, BUYER_REVIEW: 4, REPORTED: 5 },
  SCOPE: { LARGE: 1, MEDIUM: 2, SMALL: 3 },
  SKILL_LEVEL: { PRO: 1, EXPERT: 2, INTERMEDIATE: 3, ENTRY: 4 },
  LONGEVITY: { WEEK: 1, MONTH: 2, ABOVE_MONTH: 3, MORE_MONTH: 4 },
} as const;

export const LABELS = {
  scope: { 1: 'Large', 2: 'Medium', 3: 'Small' } as Record<number, string>,
  skillLevel: { 1: 'Pro', 2: 'Expert', 3: 'Intermediate', 4: 'Entry' } as Record<number, string>,
  longevity: { 1: 'Up to a week', 2: 'Up to a month', 3: 'Above a month', 4: 'More than a month' } as Record<number, string>,
  job: { 0: 'Draft', 1: 'Published', 2: 'Processing', 3: 'Completed', 4: 'Finished' } as Record<number, string>,
  approval: { 0: 'Pending', 1: 'Approved', 3: 'Rejected' } as Record<number, string>,
  bid: { 0: 'Pending', 1: 'Hired', 2: 'Done', 3: 'Rejected', 4: 'Withdrawn' } as Record<number, string>,
  project: { 1: 'Running', 2: 'Completed', 3: 'Rejected', 4: 'Reviewing', 5: 'Reported' } as Record<number, string>,
  payment: { 0: 'Initiated', 1: 'Approved', 2: 'Pending', 3: 'Rejected' } as Record<number, string>,
};
