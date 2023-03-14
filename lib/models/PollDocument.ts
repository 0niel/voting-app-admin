import { Models } from 'appwrite'

export interface PollDocument extends Models.Document {
  /**
   * Вопрос, по которому проводится голосование.
   */
  question: string
  /**
   * ID создателя голосования.
   */
  creator_id: string
  /**
   * Дата и время начала голосования.
   */
  start_at: Date
  /**
   * Дата и время окончания голосования.
   */
  end_at: Date
  /**
   * ID мероприятия, к которому относится голосование.
   */
  event_id: string
  /**
   * Варианты ответа.
   */
  poll_options: string[]
}
