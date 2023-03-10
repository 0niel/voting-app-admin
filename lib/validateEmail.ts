export const validateEmail = (email: string) => {
  return (
    String(email)
      .toLowerCase()
      .match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/) !== null
  )
}
