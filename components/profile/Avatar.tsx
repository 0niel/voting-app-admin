import useUser from '@/lib/useUser'

interface AvatarProps {
  iconSize: string
  fontSize: string
}

export default function Avatar(props: AvatarProps) {
  const { user } = useUser()
  return (
    <div className='placeholder avatar'>
      <div
        className={`${props.iconSize} rounded-full bg-accent ring-1 ring-secondary duration-200 group-hover:bg-accent-focus group-hover:ring-2`}
      >
        <span className={`${props.fontSize} text-accent-content`}>
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
