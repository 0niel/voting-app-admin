import { toast } from "react-hot-toast"

export function isValidResource(name: string, url: string, svg_icon: string) {
  if (name.length === 0) {
    toast.error("Не указано имя ресурса.")
    return false
  }
  if (url.length === 0) {
    toast.error("Не указана ссылка ресурса.")
    return false
  }
  if (svg_icon.length === 0) {
    toast.error("Не указана иконка ресурса.")
    return false
  }
  return true
}
