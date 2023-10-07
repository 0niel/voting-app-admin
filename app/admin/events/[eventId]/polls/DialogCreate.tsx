import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FormMode } from '@/lib/FormMode'

import CreateOrUpdatePollForm from './Form'

export default function CreatePollDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Создать</Button>
      </DialogTrigger>
      <DialogContent>
        <CreateOrUpdatePollForm formMode={FormMode.create} />
      </DialogContent>
    </Dialog>
  )
}
