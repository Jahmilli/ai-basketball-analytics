module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    // Specify 1 to set it as a warning or 2 to specify as an error
    // To turn off a rule, set it to "off"
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    "no-new-object": 2,
    "no-array-constructor": 2,
    "no-new-func": 2,
    "object-shorthand": ["error", "always"],
    "quote-props": ["error", "consistent"],
    "no-prototype-builtins": 2,
    "prefer-destructuring": ["error", {
      "array": true,
      "object": true
    }, {
        "enforceForRenamedProperties": false
      }],
    "prefer-template": 1,
    "no-eval": ["error", { "allowIndirect": true }], // default is false
    "prefer-const": ["error", {
      "destructuring": "all",
      "ignoreReadBeforeAssign": false
    }],
    "no-trailing-spaces": 2,
    "space-before-blocks": 2,
  },
};
