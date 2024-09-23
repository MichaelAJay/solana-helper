export const ACCOUNT_ENVIRONMENT = {
  LOCAL: 'LOCAL',
  DEV: 'DEV',
} as const;

export type AccountEnvironment =
  (typeof ACCOUNT_ENVIRONMENT)[keyof typeof ACCOUNT_ENVIRONMENT];
