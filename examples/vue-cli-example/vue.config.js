const { VersionCheckPlugin, VersionCheckRules } = require('../../dist/plugin.cjs');

module.exports = {
  configureWebpack: config => {
    config.plugins.push(
      new VersionCheckPlugin({
        output: 'dist/version.json',
        version: VersionCheckRules.dateTime(),
      }).webpackPlugin(),
    );
  },
};
