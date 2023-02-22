import useUser from '@/lib/useUser'

interface AvatarProps {
  iconSize: string
  fontSize: string
}

export default function Avatar(props: AvatarProps) {
  const { user } = useUser()
  return (
    <div className='avatar placeholder'>
      <div
        className={`${props.iconSize} rounded-full ring-1 group-hover:ring-2 duration-200 ring-secondary bg-accent group-hover:bg-accent-focus`}
      >
        <span className={`${props.fontSize} text-access-content`}>
          {user?.userData?.name
            .split(' ')
            .map((words) => words[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </span>
      </div>
    </div>
  )
}
