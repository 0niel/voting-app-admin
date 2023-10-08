import { Models } from "appwrite"

export interface EventDocument extends Models.Document {
  /**
   * Название мероприятия.
   */
  name: string
  /**
   * ID команды модераторов доступа.
   */
  access_moderators_team_id: string
  /**
   * ID команды модераторов голосования.
   */
  voting_moderators_team_id: string
  /**
   * ID команды участников.
   */
  participants_team_id: string
  /**
   * ID создателя мероприятия.
   */
  creator_id: string
  /**
   * URL логотипа мероприятия.
   */
  logo: string

  /**
   * Дата и время начала мероприятия.
   */
  start_at: Date
}
