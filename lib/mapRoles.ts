import { presidencyRole } from '@/constants/constants'

export function mapRoles(role: string) {
  switch (role) {
    case 'owner':
      return 'администратор'
    case presidencyRole:
      return 'председатель'
    default:
      return role
  }
}
