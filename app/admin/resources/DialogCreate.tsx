"use client"

import "react-datepicker/dist/react-datepicker.css"
import React from "react"

import { Database } from "@/lib/supabase/db-types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import CreateOrUpdateResourceForm from "./Form"

export default function CreateResourceDialogButton({
  events,
}: {
  events: Database["ovk"]["Tables"]["events"]["Row"][]
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Создание ресурса</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создание нового ресуса</DialogTitle>
        </DialogHeader>

        <CreateOrUpdateResourceForm />

        <DialogFooter>
          <Button type="submit">Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
