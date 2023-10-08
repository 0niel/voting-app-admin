import { moderatorVoterRole, presidencyRole } from "@/constants/constants"
import { Models } from "appwrite"
import { Models as ServerModels } from "node-appwrite"

export const participantFilter = (
  membership: Models.Membership | ServerModels.Membership
) =>
  !membership.roles.includes("owner") ||
  membership.roles.includes(presidencyRole) ||
  membership.roles.includes(moderatorVoterRole)
