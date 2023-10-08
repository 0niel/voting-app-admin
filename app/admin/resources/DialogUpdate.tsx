"use client"

import "react-datepicker/dist/react-datepicker.css"
import React from "react"

import { Database } from "@/lib/supabase/db-types"
import { Dialog, DialogContent } from "@/components/ui/dialog"

import CreateOrUpdateResourceForm from "./Form"

export default function UpdateResourceDialogContent({
  open,
  setOpen,
  resource,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  resource: Database["ovk"]["Tables"]["resources"]["Row"]
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <CreateOrUpdateResourceForm resource={resource} update />
      </DialogContent>
    </Dialog>
  )
}
