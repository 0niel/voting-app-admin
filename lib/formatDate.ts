export function formatDate(rawDate: string) {
  const date = new Date(rawDate)
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${day}.${month}.${year} ${hour}:${minute}`
}
