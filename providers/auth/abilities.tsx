import { defineAbility } from '@casl/ability';

// * types
export type Role = Exclude<keyof typeof abilities, 'any'>;

const anyAbility = defineAbility(() => {});

const adminAbility = defineAbility(can => {
  can('manage', 'all');
});

export const abilities = {
  admin: adminAbility,
  any: anyAbility, // * context initializer
};
