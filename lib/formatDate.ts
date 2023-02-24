export function formatDate(rawDate: string) {
  const date = new Date(rawDate)
  return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
}
