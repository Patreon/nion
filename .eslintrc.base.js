// This configuration contains all rules common to all front-end projects. It is extended by project specific files to
// set up the parser, add project-specific rules, etc.
//
// Do not edit this file without talking to FE Platform first. We release new lint rules on a quarterly basis, and new
// rules should be added to the preview config first.
//
// For more information, see https://www.notion.so/patreonhq/Quarterly-style-upgrades-2f0c3b7fa7bf490aa5b65bfb69e5cbe3
module.exports = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: [
    'import',
    'eslint-comments',
    'filenames',
    'react',
    'react-hooks',
    'jsx-a11y',
    'no-only-tests',
    'react-prefer-function-component',
  ],
  extends: [
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-prefer-function-component/recommended',
    'prettier',
  ],
  rules: {
    // General rules
    'consistent-return': 'error',
    'constructor-super': 'error',
    curly: 'error',
    'dot-notation': 'error',
    eqeqeq: ['error', 'smart'],
    'filenames/match-regex': ['error', '^((?!styled-components).)*$'],
    'guard-for-in': 'error',
    'id-denylist': ['error', 'any', 'Number', 'number', 'String', 'string', 'Boolean', 'boolean'],
    'import/no-default-export': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-namespace': 'error',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-cond-assign': 'error',
    'no-console': 'error',
    'no-debugger': 'error',
    'no-eval': 'error',
    'no-fallthrough': 'error',
    'no-new-wrappers': 'error',
    'no-only-tests/no-only-tests': 'error',
    'no-shadow': 'error',
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'no-unsafe-finally': 'error',
    'no-unused-expressions': 'error',
    'no-unused-labels': 'error',
    'object-shorthand': 'error',
    'one-var': ['error', 'never'],
    radix: 'error',
    'spaced-comment': 'error',
    'use-isnan': 'error',

    // React rules
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-curly-brace-presence': ['error', 'never'],
    'react/no-array-index-key': 'error',
    'react/no-danger': 'error',
    'react/no-did-mount-set-state': 'error',
    'react/no-did-update-set-state': 'error',
    'react/no-unused-prop-types': 'error',
    'react/no-unstable-nested-components': 'error',
    'react/self-closing-comp': 'error',
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks: '(useIsomorphicLayoutEffect)',
      },
    ],
    'react-hooks/rules-of-hooks': 'error',

    // Make some errors undisable-able
    'eslint-comments/no-restricted-disable': [
      'error',
      'eslint-comments/no-restricted-disable',
      '@typescript-eslint/ban-ts-comment',
    ],
  },
  overrides: [
    // Cypress tests
    {
      files: ['*.integration.*', '*.flows.*', 'cypress/**/*.js', 'cypress/**/*.ts', 'smoketests/**/*.ts'],
      plugins: ['cypress'],
      extends: ['plugin:cypress/recommended'],
      rules: {
        'cypress/no-force': 'error',
        'cypress/assertion-before-screenshot': 'error',
        'cypress/no-pause': 'error',
      },
    },
    {
      files: ['webpack/**/*'],
      rules: {
        // Webpack still needs to use require, *sigh*
        'import/no-dynamic-require': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      plugins: ['import', '@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/recommended',
        'plugin:import/typescript',
      ],
      rules: {
        // This rule is enabled by eslint:recommended, but disabled by a later
        // rule set. Normally we want to trust when a later set disables a
        // default, but not in this case
        'no-dupe-keys': 'error',

        // General rules we don't want to run on JS files for performance reasons
        'import/no-anonymous-default-export': 'error',
        'import/no-cycle': 'error',
        'import/no-named-as-default': 'error',

        // General rules covered by typescript eslint
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'default',
            format: ['camelCase'],
            // This property is part of the Jest mocking API, thus we don't control the naming format.. We use filter to
            // skip checking it instead so we don't have to eslint-disable each one manually. We have to specify it here
            // as well as in the `memberLike` rule, because filter causes just that one selector to be skipped, meaning
            // it falls back to this rule.
            filter: {
              regex: '^(__esModule)$',
              match: false,
            },
          },
          {
            selector: 'variable',
            // PascalCase is for React components
            format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          },
          {
            selector: 'function',
            // PascalCase is for React components
            format: ['camelCase', 'PascalCase'],
          },
          {
            selector: 'parameter',
            // We allow PascalCase for times when we're passing a React component as a property, which React requires
            // to be PascalCase
            format: ['camelCase', 'PascalCase'],
            leadingUnderscore: 'allow',
          },
          {
            selector: 'memberLike',
            // PascalCase is for constants on objects, e.g. `Text.Weight.Bold`, snake_case is for nion/events
            // TODO: remove PascalCase once we fully migrate to Studio 2 and get rid of these runtime constants
            format: ['camelCase', 'UPPER_CASE', 'PascalCase', 'snake_case'],
            filter: {
              // This property is part of the Jest mocking API, thus we don't control the naming format.. We use filter
              // to skip checking it instead so we don't have to eslint-disable each one manually.
              regex: '^(__esModule)$',
              match: false,
            },
          },
          {
            selector: 'enumMember',
            format: ['PascalCase'],
          },
          {
            // This selector is used to allow properties such as `data-tag`
            // that are kebab case and meant to be passed straight through
            // to React components. The `requiresQuotes` modifier means that
            // this only applies to properties that must be quoted. Note
            // that we don't allow properties that don't require quotes to
            // be quoted, so this is pretty tightly scoped
            selector: [
              'classProperty',
              'objectLiteralProperty',
              'typeProperty',
              'classMethod',
              'objectLiteralMethod',
              'typeMethod',
              'accessor',
              'enumMember',
            ],
            format: null,
            modifiers: ['requiresQuotes'],
          },
          {
            selector: 'typeLike',
            format: ['PascalCase'],
          },
        ],

        // TypeScript rules
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/ban-ts-comment': 'error',
        '@typescript-eslint/ban-types': [
          'error',
          {
            extendDefaults: true,
            types: {
              object: '`object` actually means "any non-primitive type".',
            },
          },
        ],
        '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
        // We disable this because it's customary to leave out the return type
        // of a `render` method. We might reconsider re-enabling this if and
        // when class components are done away.
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          {
            overrides: {
              constructors: 'no-public',
            },
          },
        ],
        '@typescript-eslint/member-ordering': 'error',
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-inferrable-types': 'error',
        '@typescript-eslint/no-invalid-this': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-unnecessary-type-arguments': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/unified-signatures': 'error',

        // Disabled rules in recommended configs that are overly strict
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',

        // Checked by our lint-misc import script, which is more accurate than this rule
        'import/no-unresolved': 'off',

        // This rule conflicts with Prettier's semicolon rules
        '@typescript-eslint/no-extra-semi': 'off',

        // This rule seems to be broken in TypeScript, because it flags
        // this on a base interface when we're extending it to create
        // another interface, and this interface is in fact imported
        // before use. Plus, it's an interface, not a variable
        'no-use-before-define': 'off',

        // For TypeScript, we use the TypeScript ESLint specific version of this rule
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',

        // Require enums to be initialized to a certain value.
        '@typescript-eslint/prefer-enum-initializers': 'error',
      },
    },
    // Jest tests
    {
      files: ['**/__tests__/*.{js,jsx,ts,tsx}', '**/*.{spec,test}.{js,jsx,ts,tsx}'],
      excludedFiles: ['**/__tests__/*.{integration,flows,happo,mock}.*', '**/cypress/tests/**'],
      plugins: ['jest', 'testing-library'],
      extends: ['plugin:jest/recommended', 'plugin:testing-library/react'],
      rules: {
        // This rule does not detect assertions nested in user functions
        'jest/expect-expect': 'off',
        // This rule forbids alias methods that are arguably more readable and concise
        'jest/no-alias-methods': 'off',
        // This rule is overly aggressive in determining what counts as a query
        'testing-library/await-async-queries': 'off',
        // This rule adds friction without a clear positive tradeoff
        'testing-library/no-container': 'off',
        // This rule is overly restrictive and can prevent useful workarounds
        'testing-library/no-node-access': 'off',
        // This rule doesn't have enough benefit to warrant fixing existing violations
        'testing-library/no-render-in-lifecycle': 'off',
        // This rule feels arbitrary and not useful
        'testing-library/render-result-naming-convention': 'off',

        // We someone often want to mock exports, which requires us to do a namespace import.
        'import/no-namespace': 'off',

        'jest/no-duplicate-hooks': 'error',
        'jest/valid-describe-callback': 'error',
        'jest/valid-expect': 'error',
        'jest/valid-expect-in-promise': 'error',
        'jest/valid-title': 'error',
        'jest/max-nested-describe': 'error',
        'jest/no-test-return-statement': 'error',
        'jest/prefer-each': 'error',
        'jest/prefer-expect-resolves': 'error',
        'jest/prefer-hooks-on-top': 'error',
        'jest/prefer-snapshot-hint': 'error',
        'jest/prefer-spy-on': 'error',
        'jest/prefer-to-contain': 'error',
        'jest/prefer-todo': 'error',
        'jest/require-to-throw-message': 'error',
        'testing-library/prefer-explicit-assert': 'error',
        'testing-library/prefer-query-matchers': 'error',
        'testing-library/prefer-user-event': 'error',
      },
    },
  ],
};
