import LocalStorageAdapter from './LocalStorageAdapter'

interface StorageAdapter {
  save: (v: string) => void;
  load: () => string;
}

export {
  StorageAdapter,
  LocalStorageAdapter
}
