import tokenUtilities from './scripts/stylelint-token-utilities.mjs';

export default {
  plugins: [tokenUtilities],
  ignoreFiles: ['**/dist/**', '**/node_modules/**', 'registry/**', 'public/**'],
  rules: {
    'cyberui/token-utilities': true,
    'property-disallowed-list': ['composes'],
    'at-rule-no-unknown': [true, { ignoreAtRules: ['theme', 'source', 'custom-variant', 'slot', 'reference', 'apply'] }],
    'property-no-unknown': [true, { ignoreProperties: ['composes'] }],
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global', 'local'] }],
    'selector-pseudo-element-no-unknown': true,
    'color-no-invalid-hex': true,
    'function-no-unknown': true,
    'declaration-block-no-duplicate-properties': [true, { ignore: ['consecutive-duplicates-with-different-syntaxes'] }],
    'keyframe-declaration-no-important': true,
    'no-invalid-double-slash-comments': true,
    'block-no-empty': true,
  },
  overrides: [{
    files: ['packages/react/src/**/*.css', 'apps/docs/src/web-scenes/web.module.css'],
    rules: {
      // Existing off-scale geometry stays exact; values already in the scale use tokens.
      'declaration-property-value-disallowed-list': {
        '/^(gap|row-gap|column-gap|padding(?:-.+)?|margin(?:-.+)?)$/': ['/(?<![\\w.])-?(4|6|10|14|18|24|32|48|64)px\\b/'],
        '/^(animation|transition)(-.+)?$/': ['/\\b(120|180|800|1600)ms\\b/'],
      },
    },
  }],
};
