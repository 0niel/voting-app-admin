import { moderatorVoterRole, presidencyRole } from "@/constants/constants"

export function mapRoles(role: string) {
  switch (role) {
    case "owner":
      return "администратор"
    case presidencyRole:
      return "председатель"
    case moderatorVoterRole:
      return "голосующий модератор"
    default:
      return role
  }
}
