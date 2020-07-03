'use strict';

function anyLang(minEcmaVersion)
{
    const targetSystems = { jsMinEcmaVersion: minEcmaVersion, tsMinEcmaVersion: minEcmaVersion };
    return targetSystems;
}

function define(pluginName, category, targetSystems, ruleConfig)
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
        null,
        'Possible Errors',
        5,
        {
            'for-direction':                    'error',
            'getter-return':                    'error',
            'no-async-promise-executor':        'error',
            'no-await-in-loop':                 'off',
            'no-compare-neg-zero':              'error',
            'no-cond-assign':                   'off',
            'no-console':                       'off',
            'no-constant-condition':            'error',
            'no-control-regex':                 'off',
            'no-debugger':                      'error',
            'no-dupe-args':                     'error',
            'no-dupe-else-if':                  'error',
            'no-dupe-keys':                     'error',
            'no-duplicate-case':                'error',
            'no-empty':                         ['error', { allowEmptyCatch: true }],
            'no-empty-character-class':         'error',
            'no-ex-assign':                     'error',
            'no-extra-boolean-cast':            'error',
            'no-extra-parens':                  'error',
            'no-extra-semi':                    'error',
            'no-func-assign':                   'error',
            'no-import-assign':                 'error',
            'no-inner-declarations':            'error',
            'no-invalid-regexp':                'error',
            'no-irregular-whitespace':          'error',
            'no-loss-of-precision':             'error',
            'no-misleading-character-class':    'error',
            'no-obj-calls':                     'error',
            'no-promise-executor-return':       'error',
            'no-prototype-builtins':            'off',
            'no-regex-spaces':                  'off',
            'no-setter-return':                 'error',
            'no-sparse-arrays':                 'off',
            'no-template-curly-in-string':      'off',
            'no-unexpected-multiline':          'off',
            'no-unreachable':                   'error',
            'no-unreachable-loop':              'error',
            'no-unsafe-finally':                'error',
            'no-unsafe-negation':               'error',
            // https://github.com/eslint/eslint/issues/11899
            'no-useless-backreference':         'error',
            'require-atomic-updates':           'off',
            'use-isnan':                        ['error', { enforceForSwitchCase: true }],
            'valid-typeof':                     'error',
        },
    ),
    define
    (
        null,
        'Possible Errors',
        6,
        {
            'no-inner-declarations':            'off',
        },
    ),
    define
    (
        null,
        'Best Practices',
        5,
        {
            'accessor-pairs':                   ['error', { enforceForClassMembers: true }],
            'array-callback-return':            'off',
            'block-scoped-var':                 'off',
            'class-methods-use-this':           'off',
            'complexity':                       'off',
            'consistent-return':                'off',
            'curly':                            ['error', 'multi-or-nest'],
            'default-case':                     'off',
            'default-case-last':                'off',
            'default-param-last':               'off',
            'dot-location':                     ['error', 'property'],
            'dot-notation':                     'error',
            'eqeqeq':                           ['error', 'allow-null'],
            'grouped-accessor-pairs':           ['error', 'getBeforeSet'],
            'guard-for-in':                     'off',
            'max-classes-per-file':             'off',
            'no-alert':                         'error',
            'no-caller':                        'error',
            'no-case-declarations':             'error',
            'no-constructor-return':            'off',
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
            'prefer-regex-literals':            'off',
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
        null,
        'Best Practices',
        6,
        {
            'no-proto':                         'error',
        },
    ),
    define
    (
        null,
        'Best Practices',
        onlyJS(5),
        {
            // Redeclarations are acceptable in TypeScript.
            'no-redeclare':                     ['error', { builtinGlobals: true }],
        },
    ),
    define
    (
        null,
        'Best Practices',
        anyLang(9),
        {
            'prefer-named-capture-group':       'error',
        },
    ),
    define
    (
        null,
        'Strict Mode',
        onlyJS(5),
        {
            // The strict rule is not required in TypeScript.
            'strict':                           ['error', 'global'],
        },
    ),
    define
    (
        null,
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
            'no-unused-vars':
            ['error', { ignoreRestSiblings: true, vars: 'local' }],
            'no-use-before-define':             'off',
        },
    ),
    define
    (
        null,
        'Variables',
        onlyJS(5),
        {
            // https://github.com/typescript-eslint/typescript-eslint/issues/1856
            'no-undef':                         'error',
        },
    ),
    define
    (
        null,
        'Variables',
        10,
        {
            'no-unused-vars':
            ['error', { caughtErrors: 'all', ignoreRestSiblings: true, vars: 'local' }],
        },
    ),
    define
    (
        null,
        'Variables',
        onlyTS(5),
        {
            // Unused rest parameters could be required to provide typings for arguments accessed
            // through the arguments object.
            'no-unused-vars':
            [
                'error',
                { args: 'none', caughtErrors: 'all', ignoreRestSiblings: true, vars: 'local' },
            ],
        },
    ),
    define
    (
        null,
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
            'function-call-argument-newline':   ['error', 'consistent'],
            'id-blacklist':                     'off',
            'id-length':                        'off',
            // Encourage use of abbreviations: "char", "obj", "param", "str".
            'id-match': ['error', '^(?!(characters?|objects?|parameters?|strings?)(?![_a-z]))'],
            'implicit-arrow-linebreak':         'off',
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
        null,
        'Stylistic Issues',
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
        'Stylistic Issues',
        onlyTS(5),
        {
            'spaced-comment':   ['error', 'always', { line: { markers: ['/ <reference'] } }],
        },
    ),
    define
    (
        null,
        'Stylistic Issues',
        7,
        {
            'prefer-exponentiation-operator':   'error',
        },
    ),
    define
    (
        null,
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
        null,
        'Stylistic Issues',
        9,
        {
            'prefer-object-spread':             'error',
        },
    ),
    define
    (
        null,
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
            'no-restricted-exports':            'off',
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
        null,
        'ECMAScript 6',
        anyLang(6),
        {
            'prefer-rest-params':               'error',
        },
    ),
    define
    (
        '@typescript-eslint',
        'Best Practices',
        onlyTS(5),
        {
            'adjacent-overload-signatures':             'error',
            'await-thenable':                           'error',
            'ban-ts-comment':                           'off',
            'ban-types':                                'off',
            'class-literal-property-style':             ['error', 'getters'],
            'consistent-type-assertions':               'error',
            'default-param-last':                       INHERIT,
            'dot-notation':                             INHERIT,
            'method-signature-style':                   'off',
            'no-base-to-string':                        'error',
            'no-dynamic-delete':                        'off',
            'no-empty-function':                        INHERIT,
            'no-empty-interface':                       ['error', { allowSingleExtends: true }],
            'no-explicit-any':                          'off',
            'no-extraneous-class':                      ['error', { allowConstructorOnly: true }],
            'no-floating-promises':                     'error',
            'no-for-in-array':                          'error',
            'no-implied-eval':                          'off',
            'no-inferrable-types':                      'error',
            'no-invalid-this':                          INHERIT,
            'no-invalid-void-type':                     'off',
            'no-magic-numbers':                         INHERIT,
            'no-misused-new':                           'error',
            'no-misused-promises':                      'error',
            'no-namespace':                             'off',
            'no-this-alias':                            'off',
            'no-throw-literal':                         INHERIT,
            'no-unnecessary-condition':                 'off', // False positives with unknown.
            'no-unnecessary-qualifier':                 'error',
            'no-unnecessary-type-arguments':            'error',
            'no-unnecessary-type-assertion':            'error',
            'no-unused-expressions':                    INHERIT,
            'no-unused-vars-experimental':              'off',
            'no-useless-constructor':                   INHERIT,
            'no-var-requires':                          'error',
            'prefer-as-const':                          'error',
            // https://github.com/typescript-eslint/typescript-eslint/issues/454
            'prefer-function-type':                     'off',
            'prefer-namespace-keyword':                 'off',
            'prefer-nullish-coalescing':                'error',
            'prefer-optional-chain':                    'error',
            'prefer-readonly':                          'error',
            'prefer-reduce-type-parameter':             'error',
            'prefer-regexp-exec':                       'error',
            'prefer-ts-expect-error':                   'error',
            'promise-function-async':                   ['error', { allowAny: true }],
            'require-array-sort-compare':               'off',
            'require-await':                            INHERIT,
            'restrict-plus-operands':                   'off',
            'restrict-template-expressions':            'off',
            'return-await':                             'error',
            'strict-boolean-expressions':               'off',
            'switch-exhaustiveness-check':              'error',
            'triple-slash-reference':                   ['error', { lib: 'never' }],
            'unbound-method':                           'off',
        },
    ),
    define
    (
        '@typescript-eslint',
        'Best Practices',
        onlyTS(6),
        {
            'no-require-imports':                       'error',
            'prefer-string-starts-ends-with':           'error',
        },
    ),
    define
    (
        '@typescript-eslint',
        'Best Practices',
        onlyTS(7),
        {
            'prefer-includes':                          'error',
        },
    ),
    define
    (
        '@typescript-eslint',
        'Possible Errors',
        onlyTS(5),
        {
            'no-dupe-class-members':                    INHERIT,
            'no-extra-parens':                          INHERIT,
            'no-extra-semi':                            INHERIT,
            'no-loss-of-precision':                     INHERIT,
            'no-non-null-asserted-optional-chain':      'error',
            'no-unsafe-assignment':                     'error',
            'no-unsafe-call':                           'off',
            'no-unsafe-member-access':                  'error',
            'no-unsafe-return':                         'error',
            'prefer-readonly-parameter-types':          'off',
        },
    ),
    define
    (
        '@typescript-eslint',
        'Stylistic Issues',
        onlyTS(5),
        {
            'array-type':                               'error',
            'ban-tslint-comment':                       'error',
            'brace-style':                              INHERIT,
            'comma-spacing':                            INHERIT,
            'consistent-type-definitions':              ['error', 'interface'],
            'explicit-function-return-type':            'error',
            'explicit-member-accessibility':            'error',
            'explicit-module-boundary-types':           'error',
            'func-call-spacing':                        INHERIT,
            'indent':                                   INHERIT,
            'keyword-spacing':                          INHERIT,
            'lines-between-class-members':              INHERIT,
            'member-delimiter-style':
            ['error', { singleline: { requireLast: true } }],
            'member-ordering':                          'error',
            'no-array-constructor':                     INHERIT,
            'no-confusing-non-null-assertion':          'error',
            'no-extra-non-null-assertion':              'error',
            'no-non-null-assertion':                    'off',
            'no-parameter-properties':                  'off',
            'no-type-alias':                            'off',
            'no-unnecessary-boolean-literal-compare':   'error',
            'prefer-for-of':                            'error',
            'quotes':                                   INHERIT,
            'semi':                                     INHERIT,
            'space-before-function-paren':              INHERIT,
            'type-annotation-spacing':                  'error',
            'typedef':                                  'error',
        },
    ),
    define
    (
        '@typescript-eslint',
        'Variables',
        onlyTS(5),
        {
            'init-declarations':                        INHERIT,
            'naming-convention':                        'off',
            // Rest parameters can be accessed through the arguments object.
            'no-unused-vars':                           INHERIT,
            'no-use-before-define':                     INHERIT,
            'unified-signatures':                       'error',
        },
    ),
    define
    (
        '@fasttime',
        'Stylistic Issues',
        5,
        {
            'nice-space-before-function-paren': 'error',
            'no-spaces-in-call-expression':     'error',
        },
    ),
    define
    (
        'node',
        'Best Practices',
        5,
        {
            'no-deprecated-api':                        'error',
        },
    ),
    define
    (
        'node',
        'Possible Errors',
        5,
        {
            'handle-callback-err':                      'error',
            'no-callback-literal':                      'off',
            'no-exports-assign':                        'error',
            'no-extraneous-import':                     'error',
            'no-extraneous-require':                    'error',
            'no-missing-import':                        'off',
            'no-missing-require':                       'off', // False positives ".." and "../..".
            'no-new-require':                           'error',
            'no-path-concat':                           'error',
            'no-process-exit':                          'off',
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
        'Stylistic Issues',
        5,
        {
            'callback-return':                          'off',
            'exports-style':                            'off',
            'file-extension-in-import':                 'off',
            'global-require':                           'off',
            'no-mixed-requires':                        'error',
            'no-process-env':                           'off',
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
