import { Database } from './supabase/db-types'

type Poll = Database['ovk']['Tables']['polls']['Row']
/**
 * Возвращает первое активное в данны момент голосование (для которого прямо сейчас проводится опрос)
 * @param polls
 */
export const getActivePoll = (polls: Poll[]) => {
  const poll = polls.find(
    (poll) =>
      poll.start_at &&
      poll.end_at &&
      !poll.is_finished &&
      new Date(poll.start_at).getTime() < new Date().getTime() &&
      new Date(poll.end_at).getTime() > new Date().getTime(),
  )

  return poll ?? null
}
