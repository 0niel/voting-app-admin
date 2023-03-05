export async function handleFetchError(value: Response) {
  if (!value.ok) {
    const json = await value.json()
    throw Error(json.message)
  }
}
