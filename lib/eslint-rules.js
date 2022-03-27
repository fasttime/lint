'use strict';

function define(pluginName, type, targetSystems, ruleConfig)
{
    if (pluginName)
        ruleConfig = prependToPropertyNames(ruleConfig, `${pluginName}/`);
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

    /* c8 ignore next 2 */
    default:
        throw TypeError();
    }
    const definition = { type, jsMinEcmaVersion, ruleConfig, tsMinEcmaVersion };
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
        null,
        'layout',
        5,
        {
            'array-bracket-newline':            ['error', 'consistent'],
            'array-bracket-spacing':            'error',
            'array-element-newline':            'off',
            'arrow-parens':                     ['error', 'as-needed'],
            'arrow-spacing':                    'error',
            'block-spacing':                    'error',
            'brace-style':                      ['error', 'allman'],
            'comma-dangle':                     ['error', 'always-multiline'],
            'comma-spacing':                    'error',
            'comma-style':
            ['error', 'last', { exceptions: { ArrayExpression: true } }],
            'computed-property-spacing':        'error',
            'dot-location':                     ['error', 'property'],
            'eol-last':                         'error',
            'func-call-spacing':                'off',
            'function-call-argument-newline':   ['error', 'consistent'],
            'generator-star-spacing':           ['error', 'both'],
            'implicit-arrow-linebreak':         'off',
            'jsx-quotes':                       'error',
            'key-spacing':                      ['error', { mode: 'minimum' }],
            'keyword-spacing':                  'error',
            'line-comment-position':            'off',
            'linebreak-style':                  'error',
            'lines-between-class-members':      'off',
            'max-len':                          ['error', { code: 100 }],
            'max-statements-per-line':          'error',
            'multiline-ternary':                'off',
            'new-parens':                       'error',
            'newline-per-chained-call':         'off',
            'no-extra-parens':                  'error',
            'no-mixed-spaces-and-tabs':         'off',
            'no-multi-spaces':                  'off',
            'no-multiple-empty-lines':          ['error', { max: 1 }],
            'no-tabs':                          'error',
            'no-trailing-spaces':               'error',
            'no-whitespace-before-property':    'error',
            'nonblock-statement-body-position': 'off',
            'object-curly-newline':             'off',
            'object-curly-spacing':             ['error', 'always'],
            'object-property-newline':          ['error', { allowMultiplePropertiesPerLine: true }],
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
            'quotes':                           ['error', 'single'],
            'rest-spread-spacing':              'error',
            'semi':                             'error',
            'semi-spacing':                     'error',
            'semi-style':                       'error',
            'space-before-blocks':              'error',
            'space-before-function-paren':      'off',
            'space-in-parens':                  'error',
            'space-infix-ops':                  'error',
            'space-unary-ops':                  'error',
            'switch-colon-spacing':             ['error', { after: true, before: false }],
            'template-curly-spacing':           'error',
            'template-tag-spacing':             ['error', 'always'],
            'unicode-bom':                      'error',
            'wrap-iife':                        'off',
            'wrap-regex':                       'off',
            'yield-star-spacing':               ['error', 'both'],
        },
    ),
    define
    (
        null,
        'layout',
        onlyJS(5),
        {
            // https://github.com/typescript-eslint/typescript-eslint/issues/942
            'function-paren-newline':           ['error', 'consistent'],
            // typescript-eslint rule is flawed.
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
            // In TypeScript files, lines-around-comment doesn't work well at the start of a block.
            'lines-around-comment':
            ['error', { allowBlockStart: true, allowObjectStart: true }],
        },
    ),
    define
    (
        null,
        'problem',
        5,
        {
            'array-callback-return':            'off',
            'constructor-super':                'error',
            'for-direction':                    'error',
            'getter-return':                    'error',
            'no-async-promise-executor':        'error',
            'no-await-in-loop':                 'off',
            'no-class-assign':                  'error',
            'no-compare-neg-zero':              'error',
            'no-cond-assign':                   'off',
            'no-const-assign':                  'off',
            'no-constant-condition':            'error',
            'no-constructor-return':            'off',
            'no-control-regex':                 'off',
            'no-debugger':                      'error',
            'no-dupe-args':                     'error',
            'no-dupe-class-members':            'error',
            'no-dupe-else-if':                  'error',
            'no-dupe-keys':                     'error',
            'no-duplicate-case':                'error',
            'no-duplicate-imports':             'error',
            'no-empty-character-class':         'error',
            'no-empty-pattern':                 'error',
            'no-ex-assign':                     'error',
            'no-fallthrough':                   'error',
            'no-func-assign':                   'error',
            'no-import-assign':                 'error',
            'no-inner-declarations':            'error',
            'no-invalid-regexp':                'error',
            'no-irregular-whitespace':          'error',
            'no-loss-of-precision':             'error',
            'no-misleading-character-class':    'error',
            'no-new-symbol':                    'error',
            'no-obj-calls':                     'error',
            'no-promise-executor-return':       'error',
            'no-prototype-builtins':            'off',
            'no-self-assign':                   'error',
            'no-self-compare':                  'off',
            'no-setter-return':                 'error',
            'no-sparse-arrays':                 'off',
            'no-template-curly-in-string':      'off',
            'no-this-before-super':             'error',
            'no-unexpected-multiline':          'off',
            'no-unmodified-loop-condition':     'off',
            'no-unreachable':                   'error',
            'no-unreachable-loop':              'error',
            'no-unsafe-finally':                'error',
            'no-unsafe-negation':               'error',
            'no-unsafe-optional-chaining':      'error',
            'no-unused-private-class-members':  'error',
            'no-unused-vars':
            ['error', { ignoreRestSiblings: true, vars: 'local' }],
            'no-use-before-define':             'off',
            'no-useless-backreference':         'error',
            'require-atomic-updates':           'off',
            'use-isnan':                        ['error', { enforceForSwitchCase: true }],
            'valid-typeof':                     'error',
        },
    ),
    define
    (
        null,
        'problem',
        onlyJS(5),
        {
            'no-undef':                         'error', // Not required in TypeScript.
        },
    ),
    define
    (
        null,
        'problem',
        6,
        {
            'no-inner-declarations':            'off',
        },
    ),
    define
    (
        null,
        'problem',
        10,
        {
            'no-unused-vars':
            ['error', { caughtErrors: 'all', ignoreRestSiblings: true, vars: 'local' }],
        },
    ),
    define
    (
        null,
        'suggestion',
        5,
        {
            'accessor-pairs':                   ['error', { enforceForClassMembers: true }],
            'block-scoped-var':                 'off',
            'camelcase':                        'off',
            'capitalized-comments':             'off',
            'class-methods-use-this':           'off',
            'complexity':                       'off',
            'consistent-return':                'off',
            'consistent-this':                  'off',
            'curly':                            ['error', 'multi-or-nest'],
            'default-case':                     'off',
            'default-case-last':                'off',
            'default-param-last':               'off',
            'dot-notation':                     'error',
            'eqeqeq':                           ['error', 'allow-null'],
            'func-name-matching':               'off',
            'func-names':                       ['error', 'never'],
            'func-style':                       'off',
            'grouped-accessor-pairs':           ['error', 'getBeforeSet'],
            'guard-for-in':                     'off',
            'id-denylist':                      'off',
            'id-length':                        'off',
            // Encourage use of abbreviations: "char", "obj", "param", "str".
            'id-match': ['error', '^(?!(characters?|objects?|parameters?|strings?)(?![_a-z]))'],
            'init-declarations':                'off',
            'max-classes-per-file':             'off',
            'max-depth':                        'off',
            'max-lines':                        'off',
            'max-lines-per-function':           'off',
            'max-nested-callbacks':             'error',
            'max-params':                       'off',
            'max-statements':                   'off',
            'multiline-comment-style':          'off',
            'new-cap':                          ['error', { capIsNew: false }],
            'no-alert':                         'error',
            'no-array-constructor':             'error',
            'no-bitwise':                       'off',
            'no-caller':                        'error',
            'no-case-declarations':             'error',
            'no-console':                       'off',
            'no-continue':                      'off',
            'no-delete-var':                    'error',
            'no-div-regex':                     'error',
            'no-else-return':                   'error',
            'no-empty':                         ['error', { allowEmptyCatch: true }],
            'no-empty-function':                'off',
            'no-eq-null':                       'off',
            'no-eval':                          'off',
            'no-extend-native':                 'error',
            'no-extra-bind':                    'error',
            'no-extra-boolean-cast':            'error',
            'no-extra-label':                   'error',
            'no-extra-semi':                    'error',
            'no-floating-decimal':              'error',
            'no-global-assign':                 'error',
            'no-implicit-coercion':             'off',
            'no-implicit-globals':              'off',
            'no-implied-eval':                  'error',
            'no-inline-comments':               'off',
            'no-invalid-this':                  'off',
            'no-iterator':                      'error',
            'no-label-var':                     'error',
            'no-labels':                        ['error', { allowLoop: true, allowSwitch: true }],
            'no-lone-blocks':                   'error',
            'no-lonely-if':                     'off',
            'no-loop-func':                     'error',
            'no-magic-numbers':                 'off',
            'no-mixed-operators':               'off',
            'no-multi-assign':                  'off',
            'no-multi-str':                     'error',
            'no-negated-condition':             'off',
            'no-nested-ternary':                'off',
            'no-new':                           'off',
            'no-new-func':                      'off',
            'no-new-object':                    'error',
            'no-new-wrappers':                  'error',
            'no-nonoctal-decimal-escape':       'error',
            'no-octal':                         'error',
            'no-octal-escape':                  'error',
            'no-param-reassign':                'off',
            'no-plusplus':                      'off',
            'no-proto':                         'off',
            'no-regex-spaces':                  'off',
            'no-restricted-globals':            'error',
            'no-restricted-properties':         'off',
            'no-restricted-syntax':             'error',
            'no-return-assign':                 ['error', 'always'],
            'no-return-await':                  'error',
            'no-script-url':                    'error',
            'no-sequences':                     'error',
            'no-shadow':                        'off',
            'no-shadow-restricted-names':       'error',
            'no-ternary':                       'off',
            'no-throw-literal':                 'error',
            'no-undef-init':                    'error',
            'no-undefined':                     'off',
            'no-underscore-dangle':             'off',
            'no-unneeded-ternary':              'error',
            'no-unused-expressions':            'error',
            'no-unused-labels':                 'error',
            'no-useless-call':                  'error',
            'no-useless-catch':                 'error',
            'no-useless-concat':                'error',
            'no-useless-escape':                'error',
            'no-useless-return':                'error',
            'no-void':                          'off',
            'no-warning-comments':              'off',
            'no-with':                          'error',
            'one-var':                          ['error', 'never'],
            'one-var-declaration-per-line':     'error',
            'operator-assignment':              'error',
            'prefer-named-capture-group':       'off',
            'prefer-object-spread':             'off',
            'prefer-promise-reject-errors':     'off',
            'prefer-regex-literals':            'off',
            'quote-props':                      'off',
            'radix':                            'error',
            'require-await':                    'error',
            'require-unicode-regexp':           'off',
            'sort-keys':                        'off',
            'sort-vars':                        'off',
            'spaced-comment':                   'error',
            'vars-on-top':                      'off',
            'yoda':                             'error',
        },
    ),
    define
    (
        null,
        'suggestion',
        onlyJS(5),
        {
            // Redeclarations are acceptable in TypeScript.
            'no-redeclare':                     ['error', { builtinGlobals: true }],
            'spaced-comment':
            ['error', 'always', { line: { markers: ['/ <reference'] } }],
            'strict':                           ['error', 'global'], // Not required in TypeScript.
        },
    ),
    define
    (
        null,
        'suggestion',
        6,
        {
            'arrow-body-style':                 'error',
            'no-confusing-arrow':               'off',
            'no-proto':                         'error',
            'no-restricted-exports':            'off',
            'no-restricted-imports':            'off',
            'no-useless-computed-key':          'error',
            'no-useless-constructor':           'error',
            'no-useless-rename':                'error',
            'no-var':                           'error',
            'object-shorthand':                 'error',
            'prefer-arrow-callback':            'error',
            'prefer-const':                     ['error', { ignoreReadBeforeAssign: true }],
            'prefer-destructuring':             'error',
            'prefer-numeric-literals':          'error',
            'prefer-rest-params':               'error',
            'prefer-spread':                    'error',
            'prefer-template':                  'error',
            'require-yield':                    'error',
            'sort-imports':                     ['error', { ignoreDeclarationSort: true }],
            'symbol-description':               'off',
        },
    ),
    define
    (
        null,
        'suggestion',
        onlyJS(7),
        {
            // Do not prefer the exponentiation operator in TypeScript, because that would result
            // in getting the value of Math.pow upon every evaluation in ES5 transpiled code.
            'prefer-exponentiation-operator':   'error',
        },
    ),
    define
    (
        null,
        'suggestion',
        9,
        {
            'prefer-object-spread':             'error',
        },
    ),
    define
    (
        null,
        'suggestion',
        13,
        {
            'prefer-object-has-own':            'error',
        },
    ),
    define
    (
        '@typescript-eslint',
        'layout',
        onlyTS(5),
        {
            'brace-style':                              INHERIT,
            'comma-dangle':                             INHERIT,
            'func-call-spacing':                        INHERIT,
            'indent':                                   INHERIT,
            'keyword-spacing':                          INHERIT,
            'lines-between-class-members':              INHERIT,
            'no-extra-parens':                          INHERIT,
            'object-curly-spacing':                     INHERIT,
            'padding-line-between-statements':          INHERIT,
            'quotes':                                   INHERIT,
            'semi':                                     INHERIT,
            'space-before-blocks':                      INHERIT,
            'space-before-function-paren':              INHERIT,
            'space-infix-ops':                          INHERIT,
            'type-annotation-spacing':                  'error',
        },
    ),
    define
    (
        '@typescript-eslint',
        'problem',
        onlyTS(5),
        {
            'await-thenable':                           'error',
            'ban-ts-comment':                           'off',
            'class-literal-property-style':             ['error', 'getters'],
            'explicit-function-return-type':
            ['error', { allowTypedFunctionExpressions: false }],
            'explicit-member-accessibility':            'error',
            'explicit-module-boundary-types':           'error',
            'no-confusing-non-null-assertion':          'error',
            'no-confusing-void-expression':             'off',
            'no-dupe-class-members':                    INHERIT,
            'no-duplicate-imports':                     INHERIT,
            'no-extra-non-null-assertion':              'error',
            'no-floating-promises':                     'error',
            'no-for-in-array':                          'error',
            'no-invalid-void-type':                     'off',
            'no-loss-of-precision':                     INHERIT,
            'no-misused-new':                           'error',
            'no-misused-promises':                      'error',
            'no-non-null-asserted-nullish-coalescing':  'error',
            'no-non-null-asserted-optional-chain':      'error',
            'no-non-null-assertion':                    'off',
            'no-parameter-properties':                  'off',
            'no-throw-literal':                         INHERIT,
            'no-unsafe-argument':                       'error',
            'no-unsafe-assignment':                     'error',
            'no-unsafe-call':                           'off',
            'no-unsafe-member-access':                  'error',
            'no-unsafe-return':                         'error',
            'no-unused-vars':                           INHERIT,
            'no-use-before-define':                     INHERIT,
            'no-useless-constructor':                   INHERIT,
            'no-var-requires':                          'error',
            'prefer-reduce-type-parameter':             'error',
            'prefer-ts-expect-error':                   'error',
            'require-array-sort-compare':               'off',
            'restrict-plus-operands':                   'off',
            'restrict-template-expressions':            'off',
            'return-await':                             'error',
            'unbound-method':                           'off',
        },
    ),
    define
    (
        '@typescript-eslint',
        'problem',
        onlyTS(6),
        {
            'no-require-imports':                       'error',
        },
    ),
    define
    (
        '@typescript-eslint',
        'suggestion',
        onlyTS(5),
        {
            'adjacent-overload-signatures':             'error',
            'array-type':                               'error',
            'ban-tslint-comment':                       'error',
            'ban-types':                                'off',
            'comma-spacing':                            INHERIT,
            'consistent-indexed-object-style':          ['error', 'index-signature'],
            'consistent-type-assertions':               'error',
            'consistent-type-definitions':              ['error', 'interface'],
            'consistent-type-exports':                  'error',
            'consistent-type-imports':                  'error',
            'default-param-last':                       INHERIT,
            'dot-notation':                             INHERIT,
            'init-declarations':                        INHERIT,
            'member-delimiter-style':
            ['error', { singleline: { requireLast: true } }],
            'member-ordering':                          'error',
            'method-signature-style':                   'off',
            'naming-convention':                        'off',
            'no-array-constructor':                     INHERIT,
            'no-base-to-string':                        'error',
            'no-dynamic-delete':                        'off',
            'no-empty-function':                        INHERIT,
            'no-empty-interface':                       ['error', { allowSingleExtends: true }],
            'no-explicit-any':                          'off',
            'no-extra-semi':                            INHERIT,
            'no-extraneous-class':                      ['error', { allowConstructorOnly: true }],
            'no-implied-eval':                          'off',
            'no-inferrable-types':                      'error',
            'no-invalid-this':                          INHERIT,
            'no-loop-func':                             INHERIT,
            'no-magic-numbers':                         INHERIT,
            'no-meaningless-void-operator':             ['error', { checkNever: true }],
            'no-namespace':                             'off',
            'no-redeclare':                             'off',
            'no-redundant-type-constituents':           'error',
            'no-shadow':                                INHERIT,
            'no-this-alias':                            'off',
            'no-type-alias':                            'off',
            'no-unnecessary-boolean-literal-compare':   'error',
            'no-unnecessary-condition':                 'error',
            'no-unnecessary-qualifier':                 'error',
            'no-unnecessary-type-arguments':            'error',
            // https://github.com/typescript-eslint/typescript-eslint/issues/2248
            'no-unnecessary-type-assertion':            'off',
            'no-unnecessary-type-constraint':           'error',
            'no-unused-expressions':                    INHERIT,
            'no-useless-empty-export':                  'error',
            'non-nullable-type-assertion-style':        'error',
            'prefer-as-const':                          'error',
            'prefer-enum-initializers':                 'off',
            'prefer-for-of':                            'error',
            // https://github.com/typescript-eslint/typescript-eslint/issues/454
            'prefer-function-type':                     'off',
            'prefer-literal-enum-member':               'off',
            'prefer-namespace-keyword':                 'off',
            'prefer-nullish-coalescing':                'error',
            'prefer-optional-chain':                    'error',
            'prefer-readonly':                          'error',
            'prefer-readonly-parameter-types':          'off',
            'prefer-regexp-exec':                       'error',
            'prefer-return-this-type':                  'error',
            'promise-function-async':                   ['error', { allowAny: true }],
            'require-await':                            INHERIT,
            'sort-type-union-intersection-members':     'off',
            'strict-boolean-expressions':               'off',
            'switch-exhaustiveness-check':              'error',
            'triple-slash-reference':                   ['error', { lib: 'never' }],
            'typedef':                                  'error',
            'unified-signatures':                       'error',
        },
    ),
    define
    (
        '@typescript-eslint',
        'suggestion',
        onlyTS(6),
        {
            'no-restricted-imports':                    INHERIT,
            'prefer-string-starts-ends-with':           'error',
        },
    ),
    define
    (
        '@typescript-eslint',
        'suggestion',
        onlyTS(7),
        {
            'prefer-includes':                          'error',
        },
    ),
    define
    (
        '@fasttime',
        'layout',
        5,
        {
            'nice-space-before-function-paren': 'error',
            'no-spaces-in-call-expression':     'error',
        },
    ),
    define
    (
        'node',
        'problem',
        5,
        {
            'no-callback-literal':                      'off',
            'no-deprecated-api':                        'error',
            'no-exports-assign':                        'error',
            'no-extraneous-import':                     'error',
            'no-extraneous-require':                    'error',
            'no-missing-import':                        'off',
            'no-missing-require':                       'off', // False positives ".." and "../..".
            'no-unpublished-bin':                       'error',
            'no-unpublished-import':                    'error',
            'no-unpublished-require':                   'off', // Crashes on "." and "./".
            'no-unsupported-features/es-builtins':      'off',
            'no-unsupported-features/es-syntax':        'off',
            'no-unsupported-features/node-builtins':    'off',
            'process-exit-as-throw':                    'error',
            'shebang':                                  'off',
        },
    ),
    define
    (
        'node',
        'suggestion',
        5,
        {
            'callback-return':                          'off',
            'exports-style':                            'off',
            'file-extension-in-import':                 'off',
            'global-require':                           'off',
            'handle-callback-err':                      'error',
            'no-mixed-requires':                        'error',
            'no-new-require':                           'error',
            'no-path-concat':                           'error',
            'no-process-env':                           'off',
            'no-process-exit':                          'off',
            'no-restricted-import':                     'error',
            'no-restricted-require':                    'error',
            'no-sync':                                  'off',
            'prefer-global/buffer':                     'error',
            'prefer-global/console':                    'error',
            'prefer-global/process':                    'error',
            'prefer-global/text-decoder':               'error',
            'prefer-global/text-encoder':               'error',
            'prefer-global/url':                        'error',
            'prefer-global/url-search-params':          'error',
            'prefer-promises/dns':                      'error',
            'prefer-promises/fs':                       'off',
        },
    ),
];

module.exports = { INHERIT, ruleDefinitions };
