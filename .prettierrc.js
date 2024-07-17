/**
 * Unless you provide the --no-editorconfig option when running prettier, the following editorconfig options
 * will roughly map to specified prettier option. See https://prettier.io/docs/en/api.html#prettierresolveconfigfilepath--options
 *
 * end_of_line -> endOfLine
 * indent_style -> useTabs
 * indent_size / tab_width -> tabWidth
 * max_line_length -> printWidth (max_line_length is only supported by a limited number of editors)
 */
module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  tabWidth: 2,
  printWidth: 120,
};
