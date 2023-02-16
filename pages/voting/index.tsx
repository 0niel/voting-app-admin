import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { ReactElement } from 'react'
import Settings from '@/pages/settings'

const Voting = () => {
  return (
    <span className='underline'>
      nunc enim rhoncus urna, eget viverra mauris odio in est. Proin magna tellus, efficitur sit
      amet lobortis non, lacinia iaculis nibh. Nulla dapibus nisi eget erat auctor pulvinar. Vivamus
      molestie enim sit amet quam rhoncus, sed tempor enim viverra. In et dolor nec ex luctus cursus
      eu vitae massa. Ut consectetur iaculis quam, eu viverra ante semper ut. Duis fermentum
      consequat odio aliquet tristique. Aliquam erat volutpat. Ut bibendum finibus dui sed
      facilisis. Suspendisse pulvinar ligula tortor, sed blandit risus dapibus eget. Quisque
      vehicula congue tortor vitae bibendum. Nunc tincidunt, tortor eget malesuada faucibus, tortor
      dolor interdum felis, sagittis tristique enim augue et ante. Nunc mollis felis id semper
      tempor. Morbi mattis lorem a elementum mattis. Donec purus tortor, fermentum a est ut, maximus
      fermentum est. Nulla convallis, tellus vitae varius tristique, arcu neque bibendum lacus, id
      mattis urna nunc in ante. Sed non odio a lectus rutrum sollicitudin quis eget odio. Orci
      varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc aliquam
      mauris a sem rhoncus, nec vulputate velit consectetur. Phasellus imperdiet vehicula dolor,
      eget ultricies libero elementum nec. Nullam non dictum ante. Quisque posuere orci eu iaculis
      volutpat. Integer tempus odio id egestas ultricies. Nam diam mi, euismod sit amet rutrum quis,
      dapibus sit amet dolor. Phasellus tempor nunc eget enim aliquet sagittis. Vivamus sed
      venenatis purus. Fusce mattis nibh vel malesuada fringilla. Sed bibendum, ligula et tincidunt
      cursus, mauris libero maximus lectus, vel lobortis magna diam eget dolor. Etiam sollicitudin
      et et et neque in porta. Sed pulvinar nec lacus quis accumsan. In ex felis, aliquam at egestas
      sed, gravida vel erat. Praesent vehicula ac sem quis aliquam. Phasellus ut nunc at diam
      molestie tincidunt euismod sit amet orci. Praesent ac risus nibh. Aenean suscipit facilisis
      commodo. Nunc velit ex, eleifend nec lectus auctor, pellentesque laoreet massa.
    </span>
  )
}

Voting.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Voting
