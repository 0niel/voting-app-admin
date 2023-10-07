'use client'

import 'react-datepicker/dist/react-datepicker.css'

import React, { useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'

import CreateOrUpdateResourceForm from './Form'

export default function UpdateResourceDialogContent({
  open,
  setOpen,
  resource,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  resource: Database['ovk']['Tables']['resources']['Row']
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <CreateOrUpdateResourceForm resource={resource} update />
      </DialogContent>
    </Dialog>
  )
}
