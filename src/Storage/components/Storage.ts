import { defineComponent, PropType } from '@vue/composition-api'
import debounce from '@/debounce'
import basic from '@/snippets/basic'
import { Storage, LocalStore } from '../index'

const STORAGE_KEY = 'tl-playground'

export default defineComponent({
  props: {
    type: {
      type: String as PropType<'localStorage'>,
      required: false,
      default: 'localStorage'
    }
  },
  setup (props, context) {
    let storage: Storage

    if (props.type === 'localStorage') {
      storage = LocalStore(STORAGE_KEY)
    }

    function updateUrl (v: string) {
      const urlParams = new URLSearchParams(window.location.search)
      urlParams.set('c', v)
      history.replaceState(null, '', '?' + urlParams.toString())
    }

    function save (v: string): void {
      debounce(() => {
        const serializedValue = storage.serialize(v)
        storage.save(serializedValue)
        updateUrl(serializedValue)
      })
    }

    function load (): string {
      const urlParams = new URLSearchParams(window.location.search)
      const c = urlParams.get('c')

      const v = storage.deserialize(c || storage.load())

      return v || basic.code
    }

    return () => {
      return context.slots.default({ save, load })[0]
    }
  }
})
