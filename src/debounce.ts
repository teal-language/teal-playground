import { ref } from '@vue/composition-api'

export default function debounce (cb: () => void, delay = 750) {
  const timer = ref()

  if (timer.value) {
    clearTimeout(timer.value)
  }

  timer.value = setTimeout(() => {
    cb()
  }, delay)
}
