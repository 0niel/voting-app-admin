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
  start_at?: string
  /**
   * Дата и время окончания голосования.
   */
  end_at?: string
  /**
   * ID мероприятия, к которому относится голосование.
   */
  event_id: string
  /**
   * Варианты ответа.
   */
  poll_options: string[]
  /**
   * Длительность голосования в секундах.
   */
  duration: number
  /**
   * Индикатор, что голосование завершено. Неотданные голоса добавлены в категорию воздержался.
   */
  is_finished: boolean
  /**
   * Показывать только количество проголосовавших/не проголосовавших.
   */
  show_only_voters_count: boolean
}
