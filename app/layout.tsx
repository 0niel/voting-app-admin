"use client"

import "styles/global.css"
import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import ru from "date-fns/locale/ru"
import { registerLocale, setDefaultLocale } from "react-datepicker"
import { Toaster } from "react-hot-toast"

import AdminPanelHead from "@/components/Head"

import SupabaseProvider from "../lib/supabase/supabase-provider"

registerLocale("ru", ru)
setDefaultLocale("ru")

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
        <html lang="ru">
          <AdminPanelHead />
          <body className="h-screen">
            {children}

            <Toaster />
          </body>
        </html>
      </QueryClientProvider>
    </SupabaseProvider>
  )
}
