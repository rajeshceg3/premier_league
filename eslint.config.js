const globals = require("globals");

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      "no-console": "warn",
      "consistent-return": "off",
      "no-underscore-dangle": ["error", { allow: ["_id"] }],
    },
    ignores: [
      "node_modules/",
      "coverage/",
      "config/custom-environment-variables.json",
      "client/",
      "scripts/loadData.js",
    ],
  },
];
