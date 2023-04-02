import { Models } from 'appwrite'

export interface InitialPollDocument extends Models.Document {
  /**
   * Вопрос, по которому проводится голосование.
   */
  question: string
  /**
   * Варианты ответа.
   */
  poll_options: string[]
  /**
   * Длительность голосования в секундах.
   */
  duration: number
}
