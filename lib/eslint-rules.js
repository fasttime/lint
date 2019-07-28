'use strict';

function anyLang(minEcmaVersion)
{
    const targetSystems = { jsMinEcmaVersion: minEcmaVersion, tsMinEcmaVersion: minEcmaVersion };
    return targetSystems;
}

function define(category, targetSystems, ruleConfig)
{
    const match = category.match(/^plugin:(?<plugin>.*)/);
    if (match)
        ruleConfig = prependToPropertyNames(ruleConfig, `${match.groups.plugin}/`);
    let jsMinEcmaVersion;
    let tsMinEcmaVersion;
    switch (typeof targetSystems)
    {
    case 'object':
        ({ jsMinEcmaVersion, tsMinEcmaVersion } = targetSystems);
        break;
    case 'number':
        jsMinEcmaVersion = targetSystems;
        tsMinEcmaVersion = 5;
        break;
    // istanbul ignore next
    default:
        throw TypeError();
    }
    const definition = { category, jsMinEcmaVersion, ruleConfig, tsMinEcmaVersion };
    return definition;
}

function onlyJS(jsMinEcmaVersion)
{
    const targetSystems = { jsMinEcmaVersion, tsMinEcmaVersion: NaN };
    return targetSystems;
}

function onlyTS(tsMinEcmaVersion)
{
    const targetSystems = { jsMinEcmaVersion: NaN, tsMinEcmaVersion };
    return targetSystems;
}

function prependToPropertyNames(inputConfig, prefix)
{
    const outputConfig = { };
    for (const [inputPropName, value] of Object.entries(inputConfig))
    {
        const outputPropName = prefix + inputPropName;
        outputConfig[outputPropName] = value;
    }
    return outputConfig;
}

const INHERIT = Symbol('inherit');

const ruleDefinitions =
[
    define
    (
        'Possible Errors',
        5,
        {
            'for-direction':                    'error',
            'getter-return':                    'error',
            'no-async-promise-executor':        'error',
            'no-await-in-loop':                 'error',
            'no-compare-neg-zero':              'error',
            'no-cond-assign':                   'off',
            'no-console':                       'off',
            'no-constant-condition':            'error',
            'no-control-regex':                 'off',
            'no-debugger':                      'error',
            'no-dupe-args':                     'error',
            'no-dupe-keys':                     'error',
            'no-duplicate-case':                'error',
            'no-empty':                         ['error', { allowEmptyCatch: true }],
            'no-empty-character-class':         'error',
            'no-ex-assign':                     'error',
            'no-extra-boolean-cast':            'error',
            'no-extra-parens':                  'error',
            'no-extra-semi':                    'error',
            'no-func-assign':                   'error',
            'no-inner-declarations':            'error',
            'no-invalid-regexp':                'error',
            'no-irregular-whitespace':          'error',
            'no-misleading-character-class':    'error',
            'no-obj-calls':                     'error',
            'no-prototype-builtins':            'off',
            'no-regex-spaces':                  'off',
            'no-sparse-arrays':                 'off',
            'no-template-curly-in-string':      'off',
            'no-unexpected-multiline':          'off',
            'no-unreachable':                   'error',
            'no-unsafe-finally':                'error',
            'no-unsafe-negation':               'error',
            'require-atomic-updates':           'error',
            'use-isnan':                        'error',
            'valid-typeof':                     'error',
        },
    ),
    define
    (
        'Possible Errors',
        6,
        {
            'no-inner-declarations':            'off',
        },
    ),
    define
    (
        'Best Practices',
        5,
        {
            'accessor-pairs':                   'error',
            'array-callback-return':            'off',
            'block-scoped-var':                 'off',
            'class-methods-use-this':           'off',
            'complexity':                       'off',
            'consistent-return':                'off',
            'curly':                            ['error', 'multi-or-nest'],
            'default-case':                     'off',
            'dot-location':                     ['error', 'property'],
            'dot-notation':                     'error',
            'eqeqeq':                           ['error', 'allow-null'],
            'guard-for-in':                     'off',
            'max-classes-per-file':             'off',
            'no-alert':                         'error',
            'no-caller':                        'error',
            'no-case-declarations':             'error',
            'no-div-regex':                     'error',
            'no-else-return':                   'error',
            'no-empty-function':                'off',
            'no-empty-pattern':                 'error',
            'no-eq-null':                       'off',
            'no-eval':                          'off',
            'no-extend-native':                 'error',
            'no-extra-bind':                    'error',
            'no-extra-label':                   'error',
            'no-fallthrough':                   'error',
            'no-floating-decimal':              'error',
            'no-global-assign':                 'error',
            'no-implicit-coercion':             'off',
            'no-implicit-globals':              'off',
            'no-implied-eval':                  'error',
            'no-invalid-this':                  'off',
            'no-iterator':                      'error',
            'no-labels':                        ['error', { allowLoop: true, allowSwitch: true }],
            'no-lone-blocks':                   'error',
            'no-loop-func':                     'error',
            'no-magic-numbers':                 'off',
            'no-multi-spaces':                  'off',
            'no-multi-str':                     'error',
            'no-new':                           'off',
            'no-new-func':                      'off',
            'no-new-wrappers':                  'error',
            'no-octal':                         'error',
            'no-octal-escape':                  'error',
            'no-param-reassign':                'off',
            'no-proto':                         'off',
            'no-restricted-properties':         'off',
            'no-return-assign':                 ['error', 'always'],
            'no-return-await':                  'error',
            'no-script-url':                    'error',
            'no-self-assign':                   'error',
            'no-self-compare':                  'off',
            'no-sequences':                     'error',
            'no-throw-literal':                 'error',
            'no-unmodified-loop-condition':     'error',
            'no-unused-expressions':            'error',
            'no-unused-labels':                 'error',
            'no-useless-call':                  'error',
            'no-useless-catch':                 'error',
            'no-useless-concat':                'error',
            'no-useless-escape':                'error',
            'no-useless-return':                'error',
            'no-void':                          'off',
            'no-warning-comments':              'error',
            'no-with':                          'error',
            'prefer-promise-reject-errors':     'off',
            'radix':                            'error',
            'require-await':                    'error',
            'require-unicode-regexp':           'off',
            'vars-on-top':                      'off',
            'wrap-iife':                        'off',
            'yoda':                             'error',
        },
    ),
    define
    (
        'Best Practices',
        6,
        {
            'no-proto':                         'error',
        },
    ),
    define
    (
        'Best Practices',
        onlyJS(5),
        {
            // Redeclarations are acceptable in TypeScript.
            'no-redeclare':                     ['error', { builtinGlobals: true }],
        },
    ),
    define
    (
        'Best Practices',
        anyLang(9),
        {
            'prefer-named-capture-group':       'error',
        },
    ),
    define
    (
        'Strict Mode',
        onlyJS(5),
        {
            // The strict rule is not required in TypeScript.
            'strict':                           ['error', 'global'],
        },
    ),
    define
    (
        'Variables',
        5,
        {
            'init-declarations':                'off',
            'no-delete-var':                    'error',
            'no-label-var':                     'error',
            'no-restricted-globals':            'error',
            'no-shadow':                        'off',
            'no-shadow-restricted-names':       'error',
            'no-undef-init':                    'error',
            'no-undefined':                     'off',
            'no-unused-vars':                   ['error', { vars: 'local' }],
            'no-use-before-define':             'off',
        },
    ),
    define
    (
        'Variables',
        onlyJS(5),
        {
            // https://github.com/typescript-eslint/typescript-eslint/issues/342
            'no-undef':                         'error',
        },
    ),
    define
    (
        'Variables',
        10,
        {
            'no-unused-vars':                   ['error', { caughtErrors: 'all', vars: 'local' }],
        },
    ),
    define
    (
        'Variables',
        onlyTS(5),
        {
            // Unused rest parameters could be required to provide typings for arguments accessed
            // through the arguments object.
            'no-unused-vars':
            ['error', { args: 'none', caughtErrors: 'all', vars: 'local' }],
        },
    ),
    define
    (
        'Node.js and CommonJS',
        5,
        {
            'callback-return':                  'off',
            'global-require':                   'off',
            'handle-callback-err':              'error',
            'no-buffer-constructor':            'off',
            'no-mixed-requires':                'error',
            'no-new-require':                   'error',
            'no-path-concat':                   'error',
            'no-process-env':                   'error',
            'no-process-exit':                  'error',
            'no-restricted-modules':            'error',
            'no-sync':                          'off',
        },
    ),
    define
    (
        'Stylistic Issues',
        5,
        {
            'array-bracket-newline':            ['error', 'consistent'],
            'array-bracket-spacing':            'error',
            'array-element-newline':            'off',
            'block-spacing':                    'error',
            'brace-style':                      ['error', 'allman'],
            'camelcase':                        'off',
            'capitalized-comments':             'off',
            'comma-dangle':                     ['error', 'always-multiline'],
            'comma-spacing':                    'error',
            'comma-style':
            ['error', 'last', { exceptions: { ArrayExpression: true } }],
            'computed-property-spacing':        'error',
            'consistent-this':                  'off',
            'eol-last':                         'error',
            'func-call-spacing':                'off',
            'func-name-matching':               'off',
            'func-names':                       ['error', 'never'],
            'func-style':                       'off',
            'function-paren-newline':           ['error', 'consistent'],
            'id-blacklist':                     'off',
            'id-length':                        'off',
            // Encourage use of abbreviations: "char", "obj", "param", "str".
            'id-match': ['error', '^(?!(characters?|objects?|parameters?|strings?)(?![_a-z]))'],
            'implicit-arrow-linebreak':         'off',
            'indent':
            [
                'error',
                4,
                {
                    CallExpression: { arguments: 'first' },
                    FunctionDeclaration: { parameters: 'first' },
                    FunctionExpression: { parameters: 'first' },
                    MemberExpression: 0,
                    VariableDeclarator: 0,
                    ignoredNodes:
                    [
                        'ArrowFunctionExpression',
                        'ClassDeclaration[superClass]',
                        'ConditionalExpression',
                        'ImportDeclaration',
                    ],
                },
            ],
            'jsx-quotes':                       'error',
            'key-spacing':                      ['error', { mode: 'minimum' }],
            'keyword-spacing':                  'error',
            'line-comment-position':            'off',
            'linebreak-style':                  'error',
            'lines-between-class-members':      'off',
            'max-depth':                        'off',
            'max-len':                          ['error', { code: 100 }],
            'max-lines':                        'off',
            'max-lines-per-function':           'off',
            'max-nested-callbacks':             'error',
            'max-params':                       'off',
            'max-statements':                   'off',
            'max-statements-per-line':          'error',
            'multiline-comment-style':          'off',
            'multiline-ternary':                'off',
            'new-cap':                          ['error', { capIsNew: false }],
            'new-parens':                       'error',
            'newline-per-chained-call':         'off',
            'no-array-constructor':             'error',
            'no-bitwise':                       'off',
            'no-continue':                      'off',
            'no-inline-comments':               'off',
            'no-lonely-if':                     'off',
            'no-mixed-operators':               'off',
            'no-mixed-spaces-and-tabs':         'off',
            'no-multi-assign':                  'off',
            'no-multiple-empty-lines':          ['error', { max: 1 }],
            'no-negated-condition':             'off',
            'no-nested-ternary':                'off',
            'no-new-object':                    'error',
            'no-plusplus':                      'off',
            'no-restricted-syntax':             'error',
            'no-tabs':                          'error',
            'no-ternary':                       'off',
            'no-trailing-spaces':               'error',
            'no-underscore-dangle':             'off',
            'no-unneeded-ternary':              'error',
            'no-whitespace-before-property':    'error',
            'nonblock-statement-body-position': 'off',
            'object-curly-newline':             'off',
            'object-curly-spacing':             ['error', 'always'],
            'object-property-newline':          ['error', { allowMultiplePropertiesPerLine: true }],
            'one-var':                          ['error', 'never'],
            'one-var-declaration-per-line':     'error',
            'operator-assignment':              'error',
            'operator-linebreak':               ['error', 'after'],
            'padded-blocks':                    ['error', 'never'],
            'padding-line-between-statements':
            [
                'error',
                {
                    blankLine: 'always',
                    prev: '*',
                    next: ['class', 'directive', 'export', 'function', 'import'],
                },
                {
                    blankLine: 'always',
                    prev: ['class', 'directive', 'export', 'function', 'import'],
                    next: '*',
                },
                { blankLine: 'any', prev: 'export', next: 'export' },
                { blankLine: 'any', prev: 'import', next: 'import' },
            ],
            'prefer-object-spread':             'off',
            'quote-props':                      'off',
            'quotes':                           ['error', 'single'],
            'semi':                             'error',
            'semi-style':                       'error',
            'semi-spacing':                     'error',
            'sort-keys':                        'off',
            'sort-vars':                        'off',
            'space-before-blocks':              'error',
            'space-before-function-paren':      'off',
            'space-in-parens':                  'error',
            'space-infix-ops':                  'error',
            'space-unary-ops':                  'error',
            'spaced-comment':                   'error',
            'switch-colon-spacing':             ['error', { after: true, before: false }],
            'template-tag-spacing':             ['error', 'always'],
            'unicode-bom':                      'error',
            'wrap-regex':                       'off',
        },
    ),
    define
    (
        'Stylistic Issues',
        onlyJS(5),
        {
            // In TypeScript files, lines-around-comment doesn't work well at the start of a block.
            'lines-around-comment':
            ['error', { allowBlockStart: true, allowObjectStart: true }],
        },
    ),
    define
    (
        'Stylistic Issues',
        8,
        {
            'comma-dangle':
            [
                'error',
                {
                    'arrays':       'always-multiline',
                    'objects':      'always-multiline',
                    'imports':      'always-multiline',
                    'exports':      'always-multiline',
                    'functions':    'always-multiline',
                },
            ],
        },
    ),
    define
    (
        'Stylistic Issues',
        9,
        {
            'prefer-object-spread':             'error',
        },
    ),
    define
    (
        'ECMAScript 6',
        6,
        {
            'arrow-body-style':                 'error',
            'arrow-parens':                     ['error', 'as-needed'],
            'arrow-spacing':                    'error',
            'constructor-super':                'error',
            'generator-star-spacing':           ['error', 'both'],
            'no-class-assign':                  'error',
            'no-confusing-arrow':               'off',
            'no-const-assign':                  'off',
            'no-dupe-class-members':            'error',
            'no-duplicate-imports':             'error',
            'no-new-symbol':                    'error',
            'no-restricted-imports':            'off',
            'no-this-before-super':             'error',
            'no-useless-computed-key':          'error',
            'no-useless-constructor':           'error',
            'no-useless-rename':                'error',
            'no-var':                           'error',
            'object-shorthand':                 'error',
            'prefer-arrow-callback':            'error',
            'prefer-const':                     'error',
            'prefer-destructuring':             'error',
            'prefer-numeric-literals':          'error',
            'prefer-spread':                    'error',
            'prefer-template':                  'error',
            'require-yield':                    'error',
            'rest-spread-spacing':              'error',
            'sort-imports':                     ['error', { ignoreDeclarationSort: true }],
            'symbol-description':               'off',
            'template-curly-spacing':           'error',
            'yield-star-spacing':               ['error', 'both'],
        },
    ),
    define
    (
        'ECMAScript 6',
        anyLang(6),
        {
            'prefer-rest-params':               'error',
        },
    ),
    define
    (
        'plugin:@typescript-eslint',
        onlyTS(5),
        {
            'adjacent-overload-signatures':     'error',
            'array-type':                       'off', // ReadonlyArray cannot be forbidden.
            'await-thenable':                   'error',
            'ban-ts-ignore':                    'off',
            'ban-types':                        'off',
            'camelcase':                        INHERIT,
            'class-name-casing':                'off',
            'consistent-type-definitions':      ['error', 'interface'],
            'explicit-function-return-type':    'error',
            'explicit-member-accessibility':    'error',
            'func-call-spacing':                INHERIT,
            'generic-type-naming':              'off',
            'indent':                           'off', // typescript-eslint rule is flawed.
            'interface-name-prefix':            'off',
            'member-delimiter-style':           ['error', { singleline: { requireLast: true } }],
            'member-naming':                    'off',
            'member-ordering':                  'error',
            'no-angle-bracket-type-assertion':  'error',
            'no-array-constructor':             INHERIT,
            'no-empty-function':                INHERIT,
            'no-empty-interface':               'error',
            'no-explicit-any':                  'off',
            'no-extra-parens':                  INHERIT,
            'no-extraneous-class':              'error',
            'no-floating-promises':             'error',
            'no-for-in-array':                  'error',
            'no-inferrable-types':              'error',
            'no-magic-numbers':                 INHERIT,
            'no-misused-new':                   'error',
            'no-misused-promises':              'error',
            'no-namespace':                     'error',
            'no-non-null-assertion':            'error',
            'no-object-literal-type-assertion': 'error',
            'no-parameter-properties':          'off',
            // https://github.com/typescript-eslint/typescript-eslint/issues/759
            'no-this-alias':                    'off',
            'no-type-alias':                    'off',
            'no-unnecessary-qualifier':         'error',
            'no-unnecessary-type-assertion':    'error',
            // Rest parameters can be accessed through the arguments object.
            'no-unused-vars':                   INHERIT,
            'no-use-before-define':             INHERIT,
            'no-useless-constructor':           INHERIT,
            'no-var-requires':                  'error',
            'prefer-function-type':             'error',
            'prefer-for-of':                    'error',
            'prefer-includes':                  'error',
            'prefer-namespace-keyword':         'off',
            'prefer-readonly':                  'error',
            'prefer-regexp-exec':               'error',
            'promise-function-async':           ['error', { allowAny: true }],
            'require-array-sort-compare':       'off',
            'require-await':                    INHERIT,
            'restrict-plus-operands':           'off',
            'semi':                             INHERIT,
            'strict-boolean-expressions':       'off',
            'triple-slash-reference':           ['error', { lib: 'never', types: 'never' }],
            'type-annotation-spacing':          'error',
            'unbound-method':                   'off',
            'unified-signatures':               'error',
        },
    ),
    define
    (
        'plugin:@typescript-eslint',
        onlyTS(6),
        {
            'no-require-imports':               'error',
            'prefer-string-starts-ends-with':   'error',
        },
    ),
    define
    (
        'plugin:fasttime-rules',
        5,
        {
            'nice-space-before-function-paren': 'error',
            'no-spaces-in-call-expression':     'error',
        },
    ),
];

module.exports = { INHERIT, ruleDefinitions };
