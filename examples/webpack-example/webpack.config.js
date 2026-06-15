import path from 'path';
import { fileURLToPath } from 'url';
import { VersionCheckPlugin, VersionCheckRules } from '../../dist/plugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new VersionCheckPlugin({
      output: 'dist/version.json',
      version: VersionCheckRules.dateTime(),
    }).webpackPlugin(),
  ],
};
