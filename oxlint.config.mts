import { defineLintConfig, lintConfig } from "@folio/eslint-config-stripes";

export default defineLintConfig({ ...lintConfig });


/*
export default defineLintConfig({
  ...lintConfig,
  overrides: lintConfig.overrides.map(override => ({
    ...override,
    rules: {
      ...override.rules,
      "jest/expect-expect": ["warn", { assertFunctionNames: ["expect", "screen.getBy*", "screen.findBy*"] }],
    },
  })),
});
*/
