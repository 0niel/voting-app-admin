import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import {
  appwriteEventsCollection,
  appwriteVotingDatabase,
} from "@/constants/constants"
import { useAppwrite } from "@/context/AppwriteContext"
import { useMembership } from "@/context/MembershipContext"
import { TeamAppointment } from "@/pages/api/teams/create-membership"
import { Account, Databases, Models } from "appwrite"
import { toast } from "react-hot-toast"

import fetchJson from "@/lib/fetchJson"
import { validateEmail } from "@/lib/validateEmail"
import CreateMembershipModalContent from "@/components/modal/CreateMembershipModalContent"
import Modal from "@/components/modal/Modal"

export default function CreateAccessModeratorModal() {
  const { createMembership, setCreateMembership } = useMembership()
  const [email, setEmail] = useState("")
  const router = useRouter()
  const { eventID } = router.query
  const [event, setEvent] = useState<Models.Document>()
  const { client } = useAppwrite()
  const account = new Account(client)
  const databases = new Databases(client)

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string
      )
      setEvent(_event)
    }
    if (router.isReady) {
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  async function addMembershipToDatabase() {
    const fetchCreate = async function () {
      const newEmail = email?.trim()
      if (validateEmail(newEmail)) {
        const jwt = await account.createJWT().then((jwtModel) => jwtModel.jwt)
        await fetchJson("/api/teams/create-membership", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamID: event!.access_moderators_team_id,
            teamAppointment: TeamAppointment.accessModerators.valueOf(),
            email: newEmail,
            roles: [],
            url: process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME,
            jwt,
          }),
        })
        await fetchJson("/api/teams/create-membership", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamID: event!.participants_team_id,
            teamAppointment: TeamAppointment.accessModerators.valueOf(),
            email: newEmail,
            roles: ["owner"],
            url: process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME,
            jwt,
          }),
        })
        setEmail("")
        setCreateMembership(false)
      } else {
        toast.error("Укажите действительную почту.")
      }
    }
    await fetchCreate().catch((error: any) => toast.error(error.message))
  }

  return (
    <Modal
      isOpen={createMembership}
      onAccept={addMembershipToDatabase}
      acceptButtonName="Пригласить"
      onCancel={() => setCreateMembership(false)}
      title="Пригласить модератора доступа"
    >
      <CreateMembershipModalContent
        email={email}
        setEmail={setEmail}
        eventID={eventID as string}
      />
    </Modal>
  )
}
