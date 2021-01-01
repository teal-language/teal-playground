import { StorageAdapter } from './'

export default class LocalStorageAdapter implements StorageAdapter {
  key: string

  constructor (storageKey: string) {
    this.key = storageKey
  }

  save (v: string): void {
    localStorage.setItem(this.key, v)
  }

  load (): string {
    return localStorage.getItem(this.key) || ''
  }
}
