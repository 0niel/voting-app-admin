import { Models } from 'appwrite'

export interface VoteDocument extends Models.Document {
  /**
   * ID пользователя, который проголосовал.
   */
  voter_id: string
  /**
   * ID опроса, в котором проголосовал пользователь.
   */
  poll_id: string
  /**
   * Вариант ответа, который выбрал пользователь.
   */
  vote: string
}
