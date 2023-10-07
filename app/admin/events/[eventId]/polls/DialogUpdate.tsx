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
import { FormMode } from '@/lib/FormMode'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'

import CreateOrUpdatePollForm from './Form'

export default function UpdatePollDialog({
  open,
  setOpen,
  poll,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  poll: Database['ovk']['Tables']['polls']['Row']
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <CreateOrUpdatePollForm poll={poll} formMode={FormMode.edit} />
      </DialogContent>
    </Dialog>
  )
}
