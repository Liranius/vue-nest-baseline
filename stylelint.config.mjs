/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  ignoreFiles: [
    '**/dist/**',
    '**/out-tsc/**',
    '**/coverage/**',
    '**/test-output/**',
    '**/playwright-report/**',
    '**/test-results/**',
    '.nx/**',
  ],
};
