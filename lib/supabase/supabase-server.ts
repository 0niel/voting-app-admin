import { cache } from "react"
import { cookies } from "next/headers"
import {
  User,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs"

import { Database } from "./db-types"

export const createServerSupabaseClient = cache(() =>
  createServerComponentClient<Database>({ cookies })
)

export async function getSession() {
  const supabase = createServerSupabaseClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getUserDetails() {
  const supabase = createServerSupabaseClient()
  try {
    const { data: userDetails } = await supabase
      .schema("ovk")
      .from("users")
      .select("*")
      .single()
    return userDetails
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getEvents() {
  const supabase = createServerSupabaseClient()
  try {
    const { data: events } = await supabase
      .schema("ovk")
      .from("events")
      .select("*")
      .throwOnError()
    return events
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getEventParticipants(eventId: number) {
  const supabase = createServerSupabaseClient()
  try {
    const { data: eventParticipants } = await supabase
      .schema("ovk")
      .from("participants")
      .select(`*`)
      .eq("event_id", eventId)
      .throwOnError()

    return eventParticipants
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getSuperusers() {
  const supabase = createServerSupabaseClient()
  try {
    const { data: superusers } = await supabase
      .schema("ovk")
      .from("superusers")
      .select("*")
      .throwOnError()
    return superusers
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getUsersPermissions() {
  const supabase = createServerSupabaseClient()
  try {
    const { data: usersPermissions } = await supabase
      .schema("ovk")
      .from("users_permissions")
      .select("*")
      .throwOnError()
    return usersPermissions
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getEventAccessModerators(eventId: number) {
  const supabase = createServerSupabaseClient()
  try {
    const { data: eventParticipants } = await supabase
      .schema("ovk")
      .from("users_permissions")
      .select(`*`)
      .eq("event_id", eventId)
      .eq("is_access_moderator", true)
      .throwOnError()

    return eventParticipants
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getEventVotingModerators(eventId: number) {
  const supabase = createServerSupabaseClient()
  try {
    const { data: eventParticipants } = await supabase
      .schema("ovk")
      .from("users_permissions")
      .select(`*`)
      .eq("event_id", eventId)
      .eq("is_voting_moderator", true)
      .throwOnError()

    return eventParticipants
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}
export type UserToView = Pick<User, "id" | "email" | "created_at">

export async function getUsers() {
  const supabase = createServerComponentClient(
    { cookies },
    { supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY }
  )
  try {
    const { error, data: users } = await supabase.auth.admin.listUsers()
    if (error) throw error
    return users.users as UserToView[]
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getResourses() {
  const supabase = createServerSupabaseClient()
  try {
    const { data: resources } = await supabase
      .schema("ovk")
      .from("resources")
      .select("*")
      .throwOnError()
    return resources
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getPollsByEvent(id: number) {
  const supabase = createServerSupabaseClient()
  try {
    const { data: polls } = await supabase
      .schema("ovk")
      .from("polls")
      .select("*")
      .eq("event_id", id)
      .throwOnError()
    return polls
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getAnswerOptionsByPoll(id: number) {
  const supabase = createServerSupabaseClient()
  try {
    const { data: answerOptions } = await supabase
      .schema("ovk")
      .from("answer_options")
      .select("*")
      .eq("poll_id", id)
      .throwOnError()
    return answerOptions
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}
