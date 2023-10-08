import { useEffect, useState } from "react"
import Link from "next/link"
import { appwriteListTeamsLimit } from "@/constants/constants"
import { useAppwrite } from "@/context/AppwriteContext"
import { Models, Query, Teams } from "appwrite"

import useUser from "@/lib/useUser"
import PanelWindow from "@/components/PanelWindow"
import Avatar from "@/components/profile/Avatar"

export default function PersonalInformationCard() {
  const { user } = useUser()
  const { client } = useAppwrite()
  const [teams, setTeams] = useState<Models.Team[]>([])

  useEffect(() => {
    async function getTeams() {
      const teams = (
        await new Teams(client!).list([Query.limit(appwriteListTeamsLimit)])
      ).teams
      setTeams(teams)
      console.log(teams.length)
    }
    getTeams().then(() => {})
  }, [client])

  return (
    <PanelWindow className="group">
      <div className="card-body items-center text-center">
        <Avatar iconSize="w-16 h-16" fontSize="text-2xl font-bold" />
        <div className="card-title">{user?.userData?.name}</div>
        <div className="text-neutral">
          <div>
            <span>Почта: </span>
            {user?.userData?.email ? (
              <Link href={`mailto:${user?.userData?.email}`} className="link">
                {user?.userData?.email}
              </Link>
            ) : (
              "Отсутствует"
            )}
          </div>
          {/*<div>*/}
          {/*  <span>Телефон: </span>*/}
          {/*  {user?.userData?.phone ? (*/}
          {/*    <Link href={`tel:${user?.userData?.phone}`} className='link'>*/}
          {/*      {user?.userData?.phone}*/}
          {/*    </Link>*/}
          {/*  ) : (*/}
          {/*    'Отсутствует'*/}
          {/*  )}*/}
          {/*</div>*/}
          <div className="pt-3">
            {teams.length > 0 ? (
              <div className="grid grid-cols-1 place-items-center justify-center gap-4 md:grid-cols-3">
                {teams.map((team, index) => (
                  <div
                    key={index}
                    className="badge-primary badge m-1 h-full overflow-hidden text-ellipsis hover:scale-110"
                  >
                    {team.name}
                  </div>
                ))}
              </div>
            ) : (
              <div>Не состоит в командах</div>
            )}
          </div>
        </div>
      </div>
    </PanelWindow>
  )
}
