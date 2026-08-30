import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'Note Tracker',
    description:
      'Fast, private, local-first note tracker with tags and instant search. All data stays in your browser.',
    lang: 'en',
    permissions: ['storage'],
    browser_specific_settings: {
      gecko: {
        id: 'note-tracker@extension',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Alt+Shift+N',
          mac: 'Command+Shift+N',
        },
        description: 'Open Note Tracker',
      },
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
