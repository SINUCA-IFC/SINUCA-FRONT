import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'dev-dist/**', 'node_modules/**', 'auditoria/**', 'public/**'] },
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // Existing screens contain preparatory bindings; do not rework unrelated UI.
      'no-unused-vars': 'off',
      'vue/multi-word-component-names': 'off',
      // Registration steps edit a shared, parent-owned reactive form draft.
      'vue/no-mutating-props': ['error', { shallowOnly: true }],
    },
  },
]
