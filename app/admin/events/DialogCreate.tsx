import React from "react"

import { FormMode } from "@/lib/FormMode"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import CreateOrUpdateEventForm from "./Form"

export default function CreateEventDialogButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Создать</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создание мероприятия</DialogTitle>
        </DialogHeader>
        <CreateOrUpdateEventForm formMode={FormMode.create} />
      </DialogContent>
    </Dialog>
  )
}
