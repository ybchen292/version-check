/**
 * VersionCheck 构建插件
 * 支持 Vite 和 Webpack 构建工具，自动生成版本文件
 * @module version-check-plugin
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface VersionCheckRule {
  (): string;
}

interface VersionCheckRules {
  timestamp: VersionCheckRule;
  gitCommit: VersionCheckRule;
  gitTag: VersionCheckRule;
  date: VersionCheckRule;
  dateTime: VersionCheckRule;
  dateHash: VersionCheckRule;
  packageVersion: VersionCheckRule;
}

interface VersionCheckPluginOptions {
  /** 输出文件路径 */
  output?: string;
  /** 版本号生成规则 */
  version?: (() => string) | string;
  /** 输出格式（json, txt, js） */
  format?: 'json' | 'txt' | 'js';
  /** 仅在匹配的构建模式下执行（Webpack mode 或自定义标识），*/
  mode?: string | string[];
}

interface VitePlugin {
  name: string;
  apply: string;
  closeBundle: () => void;
}

interface WebpackCompiler {
  options: {
    mode?: string;
  };
  hooks: {
    afterEmit: {
      tapAsync: (name: string, callback: (compilation: any, cb: (error?: Error) => void) => void) => void;
    };
  };
}

interface WebpackPlugin {
  apply: (compiler: WebpackCompiler) => void;
}

/**
 * 预定义的版本号规则
 */
export const VersionCheckRules: VersionCheckRules = {
  /** 时间戳（推荐，简单可靠） */
  timestamp: () => Date.now().toString(),

  /** Git commit hash */
  gitCommit: () => execSync('git rev-parse --short HEAD').toString().trim(),

  /** Git tag */
  gitTag: () => {
    try {
      return execSync('git describe --tags --abbrev=0').toString().trim();
    } catch {
      return VersionCheckRules.timestamp();
    }
  },

  /** 日期格式 YYYYMMDD */
  date: () => new Date().toISOString().slice(0, 10).replace(/-/g, ''),

  /** 日期时间格式 YYYYMMDDHHmmss */
  dateTime: () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  },

  /** 日期 + 短 hash */
  dateHash: () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    return `${date}-${hash}`;
  },

  /** package.json version */
  packageVersion: () => {
    try {
      const pkgPath = path.resolve('package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      return pkg.version;
    } catch {
      return VersionCheckRules.timestamp();
    }
  },
};

/**
 * 版本检查构建插件
 * 支持 Vite 和 Webpack 构建工具
 */
export class VersionCheckPlugin {
  private options: Required<VersionCheckPluginOptions>;

  /**
   * 构造函数
   * @param options 配置项
   */
  constructor(options: VersionCheckPluginOptions = {}) {
    this.options = {
      output: 'dist/version.json',
      version: VersionCheckRules.timestamp,
      format: 'json',
      mode: 'production',
      ...options,
    };
  }

  /**
   * 生成版本文件
   * @private
   */
  private _generateVersion(): void {
    const version = typeof this.options.version === 'function' ? this.options.version() : this.options.version;

    let content: string;
    switch (this.options.format) {
      case 'json':
        content = JSON.stringify({ version }, null, 2);
        break;
      case 'txt':
        content = version;
        break;
      case 'js':
        content = `export const VERSION = '${version}';\n`;
        break;
      default:
        content = JSON.stringify({ version }, null, 2);
    }

    const outputPath = path.resolve(this.options.output);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`[VersionCheck] 版本文件已生成: ${outputPath} (version: ${version})`);
  }

  /**
   * Vite 插件
   * @returns Vite 插件对象
   */
  vitePlugin(): VitePlugin {
    return {
      name: 'version-check-js',
      apply: 'build',
      closeBundle: () => {
        this._generateVersion();
      },
    };
  }

  /**
   * Webpack 插件
   * @returns Webpack 插件对象
   */
  webpackPlugin(): WebpackPlugin {
    const self = this;
    return {
      apply(compiler: WebpackCompiler) {
        compiler.hooks.afterEmit.tapAsync('VersionCheckPlugin', (compilation, callback) => {
          // 如果指定了 mode，仅在匹配的模式下执行
          const modes = (Array.isArray(self.options.mode) ? self.options.mode : [self.options.mode]).filter(
            Boolean,
          ) as string[];
          if (!modes.length) {
            callback();
            return;
          }
          const currentMode = compiler.options.mode || '';
          if (!modes.includes(currentMode)) {
            callback();
            return;
          }
          try {
            self._generateVersion();
            callback();
          } catch (error) {
            callback(error as Error);
          }
        });
      },
    };
  }
}
