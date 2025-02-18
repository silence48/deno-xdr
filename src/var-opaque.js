import { Int } from './int.js';
import { UnsignedInt } from './unsigned-int.js';
import { calculatePadding, slicePadding } from './util.js';
import includeIoMixin from './io-mixin.js';
import { Buffer } from 'https://esm.sh/buffer'
export class VarOpaque {
  constructor(maxLength = UnsignedInt.MAX_VALUE) {
    this._maxLength = maxLength;
  }

  read(io) {
    const length = Int.read(io);

    if (length > this._maxLength) {
      throw new Error(
        `XDR Read Error: Saw ${length} length VarOpaque,` +
          `max allowed is ${this._maxLength}`
      );
    }
    const padding = calculatePadding(length);
    const result = io.slice(length);
    slicePadding(io, padding);
    return result.buffer();
  }

  write(value, io) {
    if (value.length > this._maxLength) {
      throw new Error(
        `XDR Write Error: Got ${value.length} bytes,` +
          `max allows is ${this._maxLength}`
      );
    }
    Int.write(value.length, io);
    io.writeBufferPadded(value);
  }

  isValid(value) {
    return Buffer.isBuffer(value) && value.length <= this._maxLength;
  }
}

includeIoMixin(VarOpaque.prototype);
