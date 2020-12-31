import { StorageAdapter, LocalStorageAdapter } from './adapters'
import { Encoder, CanBase64Encode } from './encoding'

export interface Storage extends StorageAdapter, Encoder {}

export const LocalStore = (key: string) => {
  return new (CanBase64Encode(LocalStorageAdapter))(key)
}
