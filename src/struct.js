import each from 'https://esm.sh/lodash-es/each';
import map from 'https://esm.sh/lodash-es/map';
import isUndefined from 'https://esm.sh/lodash-es/isUndefined';
import fromPairs from 'https://esm.sh/lodash-es/fromPairs';
import { Reference } from './reference.js';
import includeIoMixin from './io-mixin.js';

export class Struct {
  constructor(attributes) {
    this._attributes = attributes || {};
  }

  static read(io) {
    const fields = map(this._fields, (field) => {
      const [name, type] = field;
      const value = type.read(io);
      return [name, value];
    });

    return new this(fromPairs(fields));
  }

  static write(value, io) {
    if (!(value instanceof this)) {
      throw new Error(`XDR Write Error: ${value} is not a ${this.structName}`);
    }
    each(this._fields, (field) => {
      const [name, type] = field;
      const attribute = value._attributes[name];
      type.write(attribute, io);
    });
  }

  static isValid(value) {
    return value instanceof this;
  }

  static create(context, name, fields) {
    const ChildStruct = class extends Struct {};

    ChildStruct.structName = name;

    context.results[name] = ChildStruct;

    ChildStruct._fields = fields.map(([fieldName, field]) => {
      if (field instanceof Reference) {
        field = field.resolve(context);
      }

      return [fieldName, field];
    });

    each(ChildStruct._fields, (field) => {
      const [fieldName] = field;
      ChildStruct.prototype[fieldName] = getReadOrWriteAttribute(fieldName);
    });

    return ChildStruct;
  }
}

includeIoMixin(Struct);

function getReadOrWriteAttribute(name) {
  return function readOrWriteAttribute(value) {
    if (!isUndefined(value)) {
      this._attributes[name] = value;
    }

    return this._attributes[name];
  };
}
