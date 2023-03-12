export const appName = 'ОВК админ-панель'
export const shortAppName = 'ОВК'
export const appDescription =
  'Админ-панель отчётно-выборных конференций студенческого союза РТУ МИРЭА'
export const mireaNinjaURL = 'https://mirea.ninja/'
export const studentUnionURL = 'https://sumirea.ru/'
export const appwriteEndpoint = 'https://appwrite.mirea.ninja/v1'
export const appwriteProjectId = '63f74535e4d0790a5fac'
export const appwriteVotingDatabase = '63f74b8d640effade5a3'
export const appwriteEventsCollection = '63fdfe6b9d7f2bedfcde'
export const appwritePollsCollection = '63f751383945d22cf031'
export const appwriteVotesCollection = '63f74ddbdcc5c832a40f'
export const appwriteAccessLogsCollection = '640241d92161453b21e3'

// Пользователи, которые имеют все права на все опросы.
export const appwriteSuperUsersTeam = '63f746e7a52922b3dc38'

// Коллекция 'timers' используется для синхронизации таймеров на всех устройствах.
// Содержит атрибуты: poll_id и time_left (в секундах).
// Может быть null, если таймер не запущен, или опрос не имеет таймера.
export const appwriteTimerCollection = '6403486e078581b4a04e'
