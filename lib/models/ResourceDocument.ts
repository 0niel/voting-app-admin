import { Models } from 'appwrite'

export interface ResourceDocument extends Models.Document {
  /**
   * Название ресурса.
   */
  name: string
  /**
   * Ссылка на внешний ресурс.
   */
  url: string
  /**
   * ID мероприятия, к которому относится ресурс. Если null, то ресурс относится ко всем мероприятиям.
   */
  event_id: string | null
  /**
   * SVG-иконка ресурса.
   */
  svg_icon: string
}
