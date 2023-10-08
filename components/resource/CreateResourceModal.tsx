import "react-datepicker/dist/react-datepicker.css"
import { useEffect, useState } from "react"
import {
  appwriteEventsCollection,
  appwriteListEventsLimit,
  appwriteResourcesCollection,
  appwriteVotingDatabase,
} from "@/constants/constants"
import { useAppwrite } from "@/context/AppwriteContext"
import { useResource } from "@/context/ResourceContext"
import { Account, Databases, ID, Query } from "appwrite"
import ReactDatePicker from "react-datepicker"
import { toast } from "react-hot-toast"

import { mapAppwriteErrorToMessage } from "@/lib/errorMessages"
import fetchJson from "@/lib/fetchJson"
import { EventDocument } from "@/lib/models/EventDocument"
import Modal from "@/components/modal/Modal"

export default function CreateResourceModal() {
  const { createResource, setCreateResource } = useResource()
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [eventId, setEventId] = useState<string | null>(null)
  const [svgIcon, setSvgIcon] = useState("")

  const [events, setEvents] = useState<EventDocument[]>([])

  const { client } = useAppwrite()
  const databases = new Databases(client)

  const feather = require("feather-icons")
  const iconNames = Object.keys(feather.icons)

  useEffect(() => {
    const fetchEvents = async () => {
      const _events = await databases.listDocuments(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        [Query.limit(appwriteListEventsLimit)]
      )

      setEvents(_events.documents as EventDocument[])
    }
    fetchEvents().catch((error) => toast.error(error.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function addResourceToDatabase() {
    try {
      if (name === "" || url === "" || svgIcon === "") {
        toast.error("Заполните все поля")
        return
      }

      const event = events.find((event) => event.$id === eventId)

      const newResource = await databases.createDocument(
        appwriteVotingDatabase,
        appwriteResourcesCollection,
        ID.unique(),
        {
          name: name,
          url: url,
          event_id: event?.$id ?? null,
          svg_icon: feather.icons[svgIcon].toSvg(),
        }
      )
      toast.success("Ресурс успешно создан")
      setName("")
      setUrl("")
      setEventId(null)
      setSvgIcon("")
      setCreateResource(false)
    } catch (error: any) {
      toast.error(mapAppwriteErrorToMessage(error.message))
    }
  }

  const [searchTerm, setSearchTerm] = useState("")

  const filteredIcons = iconNames.filter((iconName) =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Modal
      isOpen={createResource}
      onAccept={addResourceToDatabase}
      acceptButtonName="Создать"
      onCancel={() => setCreateResource(false)}
      title="Создать ресурс"
    >
      <div className="form-control w-full pt-5">
        <label className="label">
          <span className="label-text">Название</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-base-200 text-neutral block h-auto w-full cursor-pointer rounded-lg border bg-gray-50 p-2.5 text-sm focus:border-secondary focus:ring-secondary"
        />
      </div>
      <div className="form-control w-full pt-5">
        <label className="label">
          <span className="label-text">Ссылка</span>
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border-base-200 text-neutral block h-auto w-full cursor-pointer rounded-lg border bg-gray-50 p-2.5 text-sm focus:border-secondary focus:ring-secondary"
        />
      </div>
      <div className="form-control w-full pt-5">
        <label className="label">
          <span className="label-text">Мероприятие</span>
        </label>
        <select
          value={(eventId as string) || ""}
          onChange={(e) => setEventId(e.target.value)}
          className="border-base-200 text-neutral block h-auto w-full cursor-pointer rounded-lg border bg-gray-50 p-2.5 text-sm focus:border-secondary focus:ring-secondary"
        >
          <option value={""}>Нет</option>
          {events.map((event) => (
            <option key={event.$id} value={event.$id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-control w-full pt-5">
        <label className="label">
          <span className="label-text">Иконка</span>
        </label>
        <div className="h-64 overflow-y-scroll">
          <input
            type="text"
            placeholder="Поиск иконки"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-base-200 text-neutral block h-auto w-full rounded-lg border bg-gray-50 p-2.5 text-sm focus:border-secondary focus:ring-secondary"
          />
          <div className="mt-4 grid grid-cols-4 gap-4">
            {filteredIcons.map((iconName) => (
              <div
                key={iconName}
                className={`${
                  svgIcon === iconName
                    ? "bg-secondary text-white"
                    : "text-neutral bg-gray-50"
                } flex cursor-pointer flex-col items-center justify-center rounded-lg p-2.5`}
                onClick={() => setSvgIcon(iconName)}
              >
                <div
                  className="h-8 w-8"
                  dangerouslySetInnerHTML={{
                    __html: feather.icons[iconName].toSvg({
                      class: "w-full h-full",
                    }),
                  }}
                />
                <div className="text-xs">{iconName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
