import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-use-before-define': 'off',
    'node/prefer-global/process': 'off',
    'ts/ban-ts-comment': 'off',
  },
})
