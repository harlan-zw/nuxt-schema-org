import antfu from '@antfu/eslint-config'
import harlanzw from 'eslint-plugin-harlanzw'

export default antfu(
  {
    type: 'lib',
  },
  ...harlanzw({
    // docs carry their own prose tooling, and every markdown file here is docs
    base: { ignores: ['**/*.md', 'docs/**'] },
    link: true,
    nuxt: true,
    vue: true,
  }),
  {
    rules: {
      // schema definitions build regexes from schema keys
      'e18e/prefer-static-regex': 'off',
    },
  },
  {
    files: ['**/server/**/*.ts', '**/src/**/*.ts'],
    rules: {
      'harlanzw/vue-no-faux-composables': 'off',
    },
  },
)
