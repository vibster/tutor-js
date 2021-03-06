import { registerCustomType } from 'mobx-decorated-models';
import Big from 'big.js';

registerCustomType('bignum', {
  serialize(num) { num ? num.toJSON() : num; },
  deserialize(num) { return new Big(num); },
});
