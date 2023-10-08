import "react-datepicker/dist/react-datepicker.css"
import React, { useEffect, useState } from "react"
import { useAppwrite } from "@/context/AppwriteContext"
import { useEvent } from "@/context/EventContext"
import { Account } from "appwrite"
import ReactDatePicker from "react-datepicker"
import { toast } from "react-hot-toast"

import fetchJson from "@/lib/fetchJson"
import Modal from "@/components/modal/Modal"

const initialNewEventName = ""
const initialStartAtDateTime = undefined
const initialAddInitialPolls = false

export default function CreateEventModal() {
  const { createEvent, setCreateEvent } = useEvent()
  const [newEventName, setNewEventName] = useState(initialNewEventName)
  const [startAtDateTime, setStartAtDateTime] = useState<Date | undefined>(
    initialStartAtDateTime
  )
  const [addInitialPolls, setAddInitialPolls] = useState(initialAddInitialPolls)
  const { client } = useAppwrite()
  const account = new Account(client)

  useEffect(() => {
    if (createEvent) {
      setNewEventName(initialNewEventName)
      setStartAtDateTime(initialStartAtDateTime)
      setAddInitialPolls(initialAddInitialPolls)
    }
  }, [createEvent])

  async function addEventToDatabase() {
    try {
      const eventName = newEventName?.trim()
      if (!eventName && eventName.length <= 0) {
        toast.error("Введите название мероприятия.")
        return
      }
      if (startAtDateTime === undefined) {
        toast.error("Введите дату и время начала мероприятия.")
        return
      }
      const jwt = await account.createJWT().then((jwtModel) => jwtModel.jwt)
      await fetchJson("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: eventName,
          startAtDateTime: startAtDateTime?.toISOString(),
          addInitialPolls,
          jwt,
        }),
      })
      setCreateEvent(false)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      isOpen={createEvent}
      onAccept={addEventToDatabase}
      acceptButtonName="Создать"
      onCancel={() => setCreateEvent(false)}
      title="Создать мероприятие"
    >
      <div className="p-2">
        <label className="label">
          <span className="label-text">Название</span>
        </label>
        <input
          type="text"
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          className="border-base-200 text-neutral block h-auto w-full cursor-pointer rounded-lg border bg-gray-50 p-2.5 text-sm focus:border-secondary focus:ring-secondary"
        />
      </div>
      <div className="p-2">
        <label className="label">
          <span className="label-text">Дата начала</span>
        </label>
        <div>
          <ReactDatePicker
            selected={startAtDateTime}
            onChange={(date) => date && setStartAtDateTime(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={5}
            timeCaption="Время"
            dateFormat="dd.MM.yyyy HH:mm"
            className="border-base-200 text-neutral block h-auto w-full cursor-pointer rounded-lg border bg-gray-50 p-2.5 text-sm focus:border-secondary focus:ring-secondary"
            locale="ru"
          />
        </div>
      </div>
      <div className="p-2">
        <label className="label cursor-pointer">
          <span className="label-text">
            Добавить голосования начала конференции
          </span>
          <input
            type="checkbox"
            checked={addInitialPolls}
            onChange={(event) => setAddInitialPolls(event.target.checked)}
            className="checkbox-primary checkbox"
          />
        </label>
      </div>
    </Modal>
  )
}
