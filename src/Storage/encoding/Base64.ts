import { Encoder } from './'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = unknown> = new (...args: any[]) => T;

/**
 * Mixin to add encoding methods
 */
export function CanBase64Encode<TBase extends Constructor> (Base: TBase) {
  return class extends Base implements Encoder {
    serialize (v: string): string {
      return btoa(v)
    }

    deserialize (v: string|null): string {
      let decoded = ''
      try {
        decoded = atob(v || '')
      } catch (e) {
        return ''
      }

      return decoded
    }
  }
}
