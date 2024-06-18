/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  eslint configuration for MEME
  updated 2024-06-18

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// CONFIG BLOCKS /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** base eslint configuration */
const CONFIG = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'plugins': ['import', 'prettier', 'react'],
  'extends': ['airbnb', 'prettier'],
  'globals': {
    'PACKAGE_TITLE': 'readonly', // injected by webpack
    'PACKAGE_VERSION': 'readonly', // injected by webpack
    'PACKAGE_DESCRIPTION': 'readonly', // injected by webpack
    '__static': 'readonly' // injected by webpack
  },
  'parserOptions': {
    'ecmaVersion': 2020,
    'ecmaFeatures': {
      'jsx': true
    },
    'sourceType': 'module'
  }
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** relaxations of rules that we don't mind */
const INQ_RULES = {
  'prettier/prettier': ['warn'],
  'no-console': 'off',
  'no-debugger': 'warn',
  'no-alert': 'warn',
  'spaced-comment': 'off',
  'react/jsx-filename-extension': [
    1,
    {
      'extensions': ['.js', '.jsx']
    }
  ],
  'no-unused-vars': 'off',
  'arrow-body-style': 'off',
  'camelcase': 'off',
  'no-use-before-define': 'off',
  'import/no-extraneous-dependencies': [
    'error',
    {
      'devDependencies': true
    }
  ],
  'no-underscore-dangle': 'off',
  'no-plusplus': 'off',
  'prefer-const': 'off',
  'prefer-destructuring': 'off',
  'class-methods-use-this': 'off',
  'no-param-reassign': 'warn'
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** react rules that we don't like */
const REACT_ICKS = {
  'react/prop-types': 'warn',
  'react/no-unescaped-entities': 'off',
  'react/destructuring-assignment': 'off',
  'react/jsx-one-expression-per-line': 'off'
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = {
  ...CONFIG, // base eslint config
  rules: {
    ...INQ_RULES, // default inq styles
    ...REACT_ICKS
  }
};
