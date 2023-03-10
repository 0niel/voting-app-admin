import { Account } from 'appwrite'
import React from 'react'
import { toast } from 'react-hot-toast'

import { useAppwrite } from '@/context/AppwriteContext'
import fetchJson from '@/lib/fetchJson'

interface CreateTeamModalContentProps {
  eventID: string
  email: string
  setEmail: Function
}

interface SearchUserResponse {
  users: {
    length: number
    map(arg0: (user: any) => JSX.Element): React.ReactNode
    name: string
    email: string
    prefs: {
      [key: string]: string
    }
  }
}

export default function CreateMembershipModalContent(props: CreateTeamModalContentProps) {
  const [searchName, setSearchName] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<SearchUserResponse>()
  const [searchResultsLoading, setSearchResultsLoading] = React.useState(false)

  const { client } = useAppwrite()
  const account = new Account(client)

  async function searchUsers() {
    setSearchResultsLoading(true)
    const jwt = await account.createJWT().then((jwtModel) => jwtModel.jwt)

    const response = await fetch('/api/users/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventID: props.eventID,
        substring: searchName,
        jwt: jwt,
      }),
    })
      .then((response) => response.json())
      .catch((error: any) => toast.error(error))

    console.log(`response: ${JSON.stringify(response)}`)
    setSearchResults(response)
    setSearchResultsLoading(false)
  }

  return (
    <div className='form-control w-full pt-5 pb-5'>
      <label className='label'>
        <span className='label-text'>Поиск участников</span>
      </label>
      <div className='mt-1 flex flex-row items-center'>
        <input
          className='input-bordered input w-full'
          type='text'
          placeholder='Введите ФИО'
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <div className='ml-2'>
          <button className='btn-primary btn' onClick={() => searchUsers()}>
            Найти
          </button>
        </div>
      </div>
      {searchResultsLoading ? (
        <div className='mt-2'>Загрузка...</div>
      ) : (
        <div className='mt-2'>
          {searchResults && searchResults.users.length > 0 ? (
            <ul>
              {searchResults.users.map((user) => (
                <li key={user.email}>
                  <hr className='my-2 border-gray-200' />
                  <div className='flex items-center'>
                    <div className='flex-grow'>
                      <div className='font-medium'>{user.name}</div>
                      <div className='text-sm text-gray-600'>{user.email}</div>
                      <div className='text-sm text-gray-600'>
                        {user['prefs']['academicGroup'] || ''}
                      </div>
                    </div>
                    <button
                      className='btn-success btn-sm btn ml-2'
                      onClick={() => {
                        props.setEmail(user.email)
                      }}
                    >
                      Добавить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div>Ничего не найдено</div>
          )}
        </div>
      )}
      <hr className='my-2 border-gray-200' />
      <div className='mt-2'>
        <label className='label'>
          <span className='label-text'>Email для приглашения</span>
        </label>
        <input
          className='input-bordered input w-full'
          type='text'
          placeholder='Введите email'
          value={props.email}
          onChange={(e) => props.setEmail(e.target.value)}
        />
      </div>
    </div>
  )
}
