import { defineTheme } from 'pinceau'
import { getColors } from 'theme-colors'

const light = getColors('#007ca7')
const primary = Object
  .entries(getColors('#0097fd'))
  .reduce((acc, [key, value]) => {
    acc[key] = {
      initial: light[key]!,
      dark: value,
    }
    return acc
  }, {} as Record<string | number, { initial: string, dark: string }>)

export default defineTheme({
  color: { primary },
})
