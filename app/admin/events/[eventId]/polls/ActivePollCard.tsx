"use client"

import { useEffect, useState } from "react"
import { Label } from "@radix-ui/react-dropdown-menu"
import { useQuery } from "@tanstack/react-query"
import { getTime } from "date-fns"
import toast from "react-hot-toast"

import { getActivePoll } from "@/lib/getActivePoll"
import { Database } from "@/lib/supabase/db-types"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Poll = Database["ovk"]["Tables"]["polls"]["Row"]

export default function ActivePollCard({ polls }: { polls: Poll[] }) {
  const { supabase } = useSupabase()

  const [realtimePolls, setRealtimePolls] = useState(polls)

  const [activePoll, setActivePoll] = useState<Poll | null>(
    getActivePoll(realtimePolls)
  )

  const changes = supabase
    .channel("table-db-changes")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "ovk",
        table: "polls",
      },
      (payload) => {
        setRealtimePolls((prev) =>
          prev.filter((poll) => poll.id !== payload.old.id)
        )
        setRealtimePolls((prev) => [...prev, payload.new as Poll])
      }
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "ovk",
        table: "polls",
      },
      (payload) => {
        setRealtimePolls((prev) =>
          prev.filter((poll) => poll.id !== payload.old.id)
        )
      }
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "ovk",
        table: "polls",
      },
      (payload) => {
        setRealtimePolls((prev) => [...prev, payload.new as Poll])
      }
    )
    .subscribe()

  useEffect(() => {
    setActivePoll(getActivePoll(realtimePolls))
  }, [realtimePolls])

  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (activePoll?.end_at) {
      setTimeLeft(
        Math.floor(
          (new Date(activePoll.end_at).getTime() - new Date().getTime()) / 1000
        )
      )
    }
  }, [activePoll])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => prevTimeLeft - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  const setPollTimeEnd = async (timeEnd: Date) => {
    await supabase
      .from("polls")
      .update({ end_at: timeEnd.toISOString() })
      .eq("id", activePoll?.id)
      .throwOnError()
  }

  const handleAddTime = async (secondsToAdd: number) => {
    const endDate = activePoll?.end_at
      ? new Date(activePoll.end_at)
      : new Date()

    if (endDate.getTime() < new Date().getTime()) {
      await setPollTimeEnd(new Date(new Date().getTime() + secondsToAdd * 1000))
      setTimeLeft(secondsToAdd)
    } else {
      await setPollTimeEnd(new Date(endDate.getTime() + secondsToAdd * 1000))
      setTimeLeft((prevTimeLeft) => prevTimeLeft + secondsToAdd)
    }

    toast.success("Время голосования продлено на " + secondsToAdd + " секунд")
  }

  const handleStopPoll = async () => {
    await setPollTimeEnd(new Date())
    setTimeLeft(0)
  }

  const handleFinishPoll = async () => {
    if (
      confirm(
        "Подвести итоги? После этого нельзя будет добавить время голосованию?"
      )
    ) {
      await setPollTimeEnd(new Date())
      await supabase
        .from("polls")
        .update({ is_finished: true })
        .eq("id", activePoll?.id)
      setTimeLeft(0)
      window.location.reload()
    }
  }

  return activePoll ? (
    <Card>
      <CardHeader className="space-y-1">
        <CardDescription>Идёт голосование!</CardDescription>
        <CardTitle className="text-2xl">{activePoll.question}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex justify-start space-x-4">
          <Button variant="outline" onClick={() => handleAddTime(5)}>
            +5 сек
          </Button>
          <Button variant="outline" onClick={() => handleAddTime(10)}>
            +10 сек
          </Button>
          <Button variant="outline" onClick={() => handleAddTime(30)}>
            +30 сек
          </Button>
          <Button variant="outline" onClick={() => handleAddTime(60)}>
            +1 мин
          </Button>
        </div>

        {timeLeft > 0 && (
          <div className="rounded-lg bg-background p-4">
            <p>{timeLeft} секунд осталось до окончания</p>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              дополнительно
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="space-x-4">
        <Button variant="outline" onClick={handleStopPoll}>
          Остановить
        </Button>
        <Button onClick={handleFinishPoll}>Завершить</Button>
      </CardFooter>
    </Card>
  ) : (
    <></>
  )
}
