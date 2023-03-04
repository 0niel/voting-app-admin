import { Models } from 'appwrite'

export interface AccessLogDocument extends Models.Document {
  /**
   * ID мероприятия, к которому относится лог.
   */
  event_id: string
  /**
   * ID пользователя, который выдал доступ.
   */
  given_by_id: string
  /**
   * ID пользователя, которому выдан доступ.
   */
  received_id: string
  /**
   * Тип доступа (выдан/отозван).
   */
  access_type: string
}
