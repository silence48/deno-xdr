import { calculatePadding, slicePadding } from './util.js';
import includeIoMixin from './io-mixin.js';
import { Buffer } from 'https://esm.sh/buffer'
export class Opaque {
  constructor(length) {
    this._length = length;
    this._padding = calculatePadding(length);
  }

  read(io) {
    const result = io.slice(this._length);
    slicePadding(io, this._padding);
    return result.buffer();
  }

  write(value, io) {
    if (value.length !== this._length) {
      throw new Error(
        `XDR Write Error: Got ${value.length} bytes, expected ${this._length}`
      );
    }

    io.writeBufferPadded(value);
  }

  isValid(value) {
    return Buffer.isBuffer(value) && value.length === this._length;
  }
}

includeIoMixin(Opaque.prototype);
