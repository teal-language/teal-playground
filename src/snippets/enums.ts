import { Snippet } from '../../types'

export default {
  label: 'enums',
  code: `-- Enums are a restricted type of string value, which
-- represent a common practice in Lua code: using
-- a limited set of string constants to describe an
-- enumeration of possible values.

local Direction = enum
   "north"
   "south"
   "east"
   "west"
end`
} as Snippet
