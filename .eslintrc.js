module.exports = {
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
  },
  'rules': {
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
    'react/destructuring-assignment': 'off',
    'react/jsx-one-expression-per-line': 'off',
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
    'no-param-reassign': 'warn',
    'react/prop-types': 'warn',
    'react/no-unescaped-entities': 'off'
  },
  'settings': {}
};
