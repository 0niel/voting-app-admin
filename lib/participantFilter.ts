import { Models } from 'appwrite'
import { Models as ServerModels } from 'node-appwrite'

import { moderatorVoterRole, presidencyRole } from '@/constants/constants'

export const participantFilter = (membership: Models.Membership | ServerModels.Membership) =>
  !membership.roles.includes('owner') ||
  membership.roles.includes(presidencyRole) ||
  membership.roles.includes(moderatorVoterRole)
