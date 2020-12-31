import { CanBase64Encode } from './Base64'

interface Encoder {
  serialize: (v: string) => string;
  deserialize: (v: string|null) => string;
}

export {
  Encoder,
  CanBase64Encode
}
