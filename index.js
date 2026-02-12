(function (global, factory) {
  // UMD包装器，支持CommonJS、AMD和全局变量
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS/Node.js环境
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD环境 (RequireJS等)
    define([], factory);
  } else {
    // 浏览器全局环境
    global.VersionCheck = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * 通用前端版本检测工具
   * 自动判断检测模式（ETag/版本文件）| 默认自动轮询 | 保留手动检测 | 内置原生confirm提示
   * @module version-check-js
   * @version 1.0.0
   */
  class VersionCheck {
    /**
     * 构造函数：初始化配置和存储（极简配置）
     * @param {Object} options 配置项
     * @param {string} [options.url='/'] 检测地址（默认/：ETag模式；传文件路径如/version.json：版本文件模式）
     * @param {number} [options.interval=5 * 60 * 1000] 轮询间隔（毫秒），默认5分钟
     * @param {string} [options.message='检测到新版本，是否立即刷新？'] 更新提示文案
     * @param {Function} [options.onUpdate=null] 自定义更新回调（优先级高于默认confirm）
     * @param {Function} [options.onError=(err)=>console.error(err)] 错误回调
     * @param {Object} [options.storage=null] 自定义存储配置（get/set方法）
     */
    constructor(options = {}) {
      // 合并默认配置
      this.config = {
        url: '/', // 默认ETag模式（检测入口HTML的ETag）
        interval: 5 * 60 * 1000,
        message: '检测到新版本，是否立即刷新？',
        onUpdate: null,
        onError: err => console.error('版本检测失败：', err),
        storage: null,
        ...options,
      };

      // 初始化核心状态
      this.timer = null; // 轮询定时器（默认自动启动）
      this.memoryStorage = null; // 内存存储降级
      this.storageApi = this._initStorage(); // 存储适配器
      this.versionKey = 'version_identifier'; // 存储版本标识的key
      this.checkMode = this._getCheckMode(); // 自动判断检测模式
      this.isRunning = false; // 检测状态
      this._bindVisibilityListener(); // 绑定可见性变化监听器
    }
    /**
     * 绑定页面可见性变化监听器
     * @private
     */
    _bindVisibilityListener() {
      // 移除 visibilitychange 监听器
      document.removeEventListener('visibilitychange', this._handleVisibilityChange);
      // 监听 visibilitychange 事件
      document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this));
    }
    _handleVisibilityChange() {
      if (!this.isRunning) return;
      document.hidden ? this.stop(true) : this.start();
    }

    /**
     * 初始化存储适配器（优先自定义 → localStorage → 内存）
     * @private
     * @returns {Object} 存储接口（get/set）
     */
    _initStorage() {
      const defaultStorage = {
        get: key => {
          try {
            if (window.localStorage) return localStorage.getItem(key);
          } catch (e) {
            this.config.onError(new Error('localStorage 不可用，使用内存存储'));
          }
          return this.memoryStorage;
        },
        set: (key, value) => {
          try {
            if (window.localStorage) return localStorage.setItem(key, value);
          } catch (e) {
            this.config.onError(new Error('localStorage 不可用，使用内存存储'));
          }
          this.memoryStorage = value;
        },
      };

      return this.config.storage || defaultStorage;
    }

    /**
     * 自动判断检测模式（核心逻辑）
     * - url为 '/' → ETag模式（检测入口HTML的ETag）
     * - url为具体文件路径（如/version.json）→ 版本文件模式
     * @private
     * @returns {string} 'etag' | 'file'
     */
    _getCheckMode() {
      const { url } = this.config;
      // 判定规则：默认/ → ETag模式；非/且包含文件后缀 → 版本文件模式
      const isVersionFile = url !== '/' && /\.\w+$/.test(url);
      return isVersionFile ? 'file' : 'etag';
    }

    /**
     * ETag模式检测逻辑（检测入口HTML的ETag变化）
     * @private
     * @returns {Promise<boolean>} 是否检测到更新
     */
    async _checkByEtag() {
      const { url, onError } = this.config;
      try {
        const response = await fetch(url, {
          method: 'HEAD', // 仅获取响应头，性能最优
          cache: 'no-cache',
          credentials: 'same-origin',
        });

        if (!response.ok) throw new Error(`请求失败，状态码：${response.status}`);
        const newVersion = response.headers.get('ETag');

        if (!newVersion) {
          onError(new Error('服务器未返回ETag，检测失败'));
          return false;
        }

        return this._compareVersion(newVersion);
      } catch (error) {
        onError(error);
        return false;
      }
    }

    /**
     * 版本文件模式检测逻辑（检测版本文件的version字段）
     * 版本文件需返回 { version: 'xxx' } 格式（如/version.json）
     * @private
     * @returns {Promise<boolean>} 是否检测到更新
     */
    async _checkByVersionFile() {
      const { url, onError } = this.config;
      try {
        const response = await fetch(url, {
          method: 'GET',
          cache: 'no-cache',
          credentials: 'same-origin',
        });

        if (!response.ok) throw new Error(`请求失败，状态码：${response.status}`);
        const result = await response.json();
        const newVersion = result.version;

        if (!newVersion) {
          onError(new Error('版本文件格式错误，缺少version字段'));
          return false;
        }

        return this._compareVersion(newVersion);
      } catch (error) {
        onError(error);
        return false;
      }
    }

    /**
     * 对比版本标识（核心逻辑：新旧版本不一致则触发更新）
     * @private
     * @param {string} newVersion 最新版本标识
     * @returns {boolean} 是否检测到更新
     */
    _compareVersion(newVersion) {
      const oldVersion = this.storageApi.get(this.versionKey);

      // 首次检测：存储新版本，不触发更新
      if (!oldVersion) {
        this.storageApi.set(this.versionKey, newVersion);
        return false;
      }

      // 版本一致：无更新
      if (newVersion == oldVersion) return false;

      // 版本不一致：触发更新逻辑
      this.storageApi.set(this.versionKey, newVersion);
      this._triggerUpdate(oldVersion);
      return true;
    }

    /**
     * 触发更新回调（优先自定义onUpdate，否则用原生confirm）
     * @private
     */
    _triggerUpdate(oldVersion) {
      const { onUpdate, message } = this.config;

      // 优先执行自定义回调
      if (typeof onUpdate === 'function') {
        onUpdate();
        return;
      }

      // 默认触发原生confirm提示，确认后刷新
      const isConfirm = window.confirm(message);
      if (isConfirm) {
        this.reload();
      } else {
        this.storageApi.set(this.versionKey, oldVersion);
      }
    }

    /**
     * reload 函数用于重新加载当前页面，并在URL中添加一个时间戳参数以避免缓存问题。
     * 该函数会移除已有的时间戳参数（t），然后添加一个新的时间戳参数，
     * 最后使用 replace 方法刷新页面，且不会在浏览器历史记录中留下痕迹。
     */
    reload() {
      // 获取当前 URL
      let currentUrl = window.location.href;
      // 移除已有的 t 参数
      currentUrl = currentUrl.replace(/[?&]t=\d+/g, '');

      // 处理已有参数的情况，避免重复拼接
      const separator = currentUrl.includes('?') ? '&' : '?';
      const newUrl = `${currentUrl}${separator}t=${new Date().getTime()}`;

      // 替换当前页面并刷新（不会产生历史记录）
      window.location.replace(newUrl);
    }

    /**
     * 手动触发单次检测（对外暴露核心方法）
     * @returns {Promise<boolean>} 是否检测到更新
     */
    async check() {
      return this.checkMode === 'etag' ? await this._checkByEtag() : await this._checkByVersionFile();
    }

    /**
     * 启动自动轮询检测（默认初始化时自动调用）
     */
    start() {
      if (!this.isRunning) this.isRunning = true;
      // 先停止已有定时器，避免重复启动
      this.stop(true);

      // 立即执行一次检测
      this.check();

      // 启动轮询
      this.timer = setInterval(() => {
        this.check();
      }, this.config.interval);
    }

    /**
     * 停止自动轮询检测
     * @param {boolean} flag 标记内部外部调用
     */
    stop(flag) {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (!flag) this.isRunning = false;
    }

    /**
     * 销毁实例（停止轮询，清理状态）
     */
    destroy() {
      this.stop();
      this.memoryStorage = null;
      this.config = null;
      document.removeEventListener('visibilitychange', this._handleVisibilityChange);
    }
  }

  return VersionCheck;
});
