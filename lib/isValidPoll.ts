import { toast } from 'react-hot-toast'

export function isValidPoll(question: string, duration: number, pollOptions: string[]) {
  if (question.length === 0) {
    toast.error('Не указан вопрос голосования.')
    return false
  }
  if (duration < 0) {
    toast.error('Длительность не может быть отрицательной.')
    return false
  }
  if (pollOptions.length < 2) {
    toast.error('Укажите хотя бы два варианта голосования.')
    return false
  }
  if (pollOptions.some((option) => option.length == 0)) {
    toast.error('Не оставляйте поля вариантов голосования пустыми.')
    return false
  }
  return true
}
