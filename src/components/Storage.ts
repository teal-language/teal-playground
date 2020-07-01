import Vue from 'vue'
import { ref } from '@vue/composition-api'
import basic from '@/snippets/basic'

const STORAGE_KEY = 'tl-playground'

export default Vue.extend({
  setup (_, context) {
    const timer = ref()

    function debounce (cb: () => void) {
      if (timer.value) {
        clearTimeout(timer.value)
      }

      timer.value = setTimeout(() => {
        cb()
      }, 750)
    }

    function serialize (v: string): string {
      return btoa(v)
    }

    function deserialize (v: string|null): string {
      let decoded = ''
      try {
        decoded = atob(v || '')
      } catch (e) {
        return ''
      }

      return decoded
    }

    function save (v: string): void {
      debounce(() => {
        localStorage.setItem(STORAGE_KEY, serialize(v))
      })
    }

    function load (): string {
      const v = deserialize(localStorage.getItem(STORAGE_KEY))

      return v || basic.code
    }

    return () => {
      return context.slots.default({ save, load })[0]
    }
  }
})
