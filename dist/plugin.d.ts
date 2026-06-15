/**
 * VersionCheck 构建插件
 * 支持 Vite 和 Webpack 构建工具，自动生成版本文件
 * @module version-check-plugin
 */
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
export declare const VersionCheckRules: VersionCheckRules;
/**
 * 版本检查构建插件
 * 支持 Vite 和 Webpack 构建工具
 */
export declare class VersionCheckPlugin {
    private options;
    /**
     * 构造函数
     * @param options 配置项
     */
    constructor(options?: VersionCheckPluginOptions);
    /**
     * 生成版本文件
     * @private
     */
    private _generateVersion;
    /**
     * Vite 插件
     * @returns Vite 插件对象
     */
    vitePlugin(): VitePlugin;
    /**
     * Webpack 插件
     * @returns Webpack 插件对象
     */
    webpackPlugin(): WebpackPlugin;
}
export {};
