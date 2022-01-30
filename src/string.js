import isString from 'https://esm.sh/lodash-es/isString';
import isArray from 'https://esm.sh/lodash-es/isArray';
import { Int } from './int.js';
import { UnsignedInt } from './unsigned-int.js';
import { calculatePadding, slicePadding } from './util.js';
import includeIoMixin from './io-mixin.js';
import { Buffer } from 'https://esm.sh/buffer'
export class String {
  constructor(maxLength = UnsignedInt.MAX_VALUE) {
    this._maxLength = maxLength;
  }

  read(io) {
    const length = Int.read(io);

    if (length > this._maxLength) {
      throw new Error(
        `XDR Read Error: Saw ${length} length String,` +
          `max allowed is ${this._maxLength}`
      );
    }
    const padding = calculatePadding(length);
    const result = io.slice(length);
    slicePadding(io, padding);
    return result.buffer();
  }

  readString(io) {
    return this.read(io).toString('utf8');
  }

  write(value, io) {
    if (value.length > this._maxLength) {
      throw new Error(
        `XDR Write Error: Got ${value.length} bytes,` +
          `max allows is ${this._maxLength}`
      );
    }

    let buffer;
    if (isString(value)) {
      buffer = Buffer.from(value, 'utf8');
    } else {
      buffer = Buffer.from(value);
    }

    Int.write(buffer.length, io);
    io.writeBufferPadded(buffer);
  }

  isValid(value) {
    let buffer;
    if (isString(value)) {
      buffer = Buffer.from(value, 'utf8');
    } else if (isArray(value) || Buffer.isBuffer(value)) {
      buffer = Buffer.from(value);
    } else {
      return false;
    }
    return buffer.length <= this._maxLength;
  }
}

includeIoMixin(String.prototype);
