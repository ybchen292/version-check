import { defineConfig } from 'vite';
import { VersionCheckPlugin, VersionCheckRules } from '../../plugin.ts';

export default defineConfig({
  plugins: [
    new VersionCheckPlugin({
      output: 'dist/version.json',
      version: VersionCheckRules.dateTime(),
    }).vitePlugin(),
  ],
});
