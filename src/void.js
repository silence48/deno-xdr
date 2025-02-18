import isUndefined from 'https://esm.sh/lodash-es/isUndefined';
import includeIoMixin from './io-mixin.js';

export const Void = {
  /* jshint unused: false */

  read() {
    return undefined;
  },

  write(value) {
    if (!isUndefined(value)) {
      throw new Error('XDR Write Error: trying to write value to a void slot');
    }
  },

  isValid(value) {
    return isUndefined(value);
  }
};

includeIoMixin(Void);
