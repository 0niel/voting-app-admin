import React, { useState } from "react"

import { FormMode } from "@/lib/FormMode"
import { Database } from "@/lib/supabase/db-types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import CreateOrUpdateEventForm from "./Form"
import CreateOrUpdatePollForm from "./Form"

export default function CopyPollDialog({
  poll,
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  poll: Database["ovk"]["Tables"]["polls"]["Row"]
}) {
  const [pollToUpdate, setPollToUpdate] = useState(poll)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Копирование голосования</DialogTitle>
        </DialogHeader>

        <CreateOrUpdatePollForm
          poll={pollToUpdate}
          formMode={FormMode.copy}
        />
      </DialogContent>
    </Dialog>
  )
}
