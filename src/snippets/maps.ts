import { Snippet } from '../../types'

export default {
  label: 'maps',
  code: `local populations: {string:number}
local modes = { -- this is {boolean:number}
    [false] = 127,
    [true] = 230,
}
`
} as Snippet
