interface UserResponseType {
  id: string
  name: string
  email: string
  prefs: {
    [key: string]: string
  }
}

export default UserResponseType
