import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import React, { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAppwrite } from '@/context/AppwriteContext'
import { Databases, Models, Teams } from 'appwrite'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import PanelWindow from '@/components/PanelWindow'

const VotingModerators = () => {
  const { client } = useAppwrite()
  const router = useRouter()
  const { eventID } = router.query
  const [team, setTeam] = useState<Models.Team>()

  useEffect(() => {
    new Databases(client!)
      .getDocument(appwriteVotingDatabase, appwriteEventsCollection, eventID as string)
      .then((event) => {
        new Teams(client!)
          .get(event.voting_moderators_team_id as string)
          .then((team) => setTeam(team))
      })
  }, [])

  return (
    <div className='grid grid-cols-4 grid-flow-row-dense gap-4 p-3'>
      <PanelWindow inCard className='col-span-4'>
        {team?.$id} {team?.name}
      </PanelWindow>
    </div>
  )
}

VotingModerators.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default VotingModerators
