export const mapAppwriteErroToMessage = (error: string) => {
  switch (error) {
    case 'Team with the requested ID could not be found.':
      return 'Произошла ошибка при удалении какой-то из команд.'
    case 'The current user is not authorized to perform the requested action.':
      return 'Произошла ошибка при выполнении запроса. У вас нет прав на выполнение этого действия.'
    case 'Invalid credentials. Please check the email and password.':
      return 'Неверные почта или пароль.'
    case 'Rate limit for the current endpoint has been exceeded. Please try again after some time.':
      return 'Превышен лимит попыток входа. Повторите попытку через некоторое время.'
    case 'Network request failed':
      return 'Проверьте подключение к Интернету'
    default:
      return `Произошла ошибка: ${error}`
  }
}
