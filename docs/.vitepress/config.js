export default {
  title: 'Version Check JS',
  description: '通用前端版本检测工具',
  lang: 'zh-CN',
  base: '/version-check/',
  lastUpdated: true,
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      description: '通用前端版本检测工具 - 自动判断检测模式，默认自动轮询，保留手动检测',
    },
    en: {
      label: 'English',
      lang: 'en-US',
      description:
        'Universal Frontend Version Detection Tool - Auto-detect detection mode, default auto-polling, manual detection supported',
      themeConfig: {
        nav: [
          {
            text: 'Home',
            link: '/en/',
          },
          {
            text: 'Guide',
            link: '/en/guide/',
          },
          {
            text: 'Other',
            items: [
              {
                text: 'ImagesViewer',
                link: 'https://ybchen292.github.io/images-viewer/',
                target: '_blank',
                rel: 'noopener noreferrer',
              },
            ],
          },
        ],
        footer: {
          message: 'Based on MIT License',
          copyright: 'Copyright © 2026 Version Check JS',
        },
      },
    },
  },
  themeConfig: {
    search: {
      provider: 'local',
    },
    editLink: {
      pattern: 'https://github.com/ybchen292/version-check/docs/:path',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ybchen292/version-check' },
      { icon: 'gitee', link: 'https://gitee.com/ybchen292/version-check' },
    ],
    nav: [
      {
        text: '首页',
        link: '/',
      },
      {
        text: '指南',
        link: '/guide/',
      },
      {
        text: '其他',
        items: [
          {
            text: 'ImagesViewer',
            link: 'https://ybchen292.github.io/images-viewer/',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        ],
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            {
              text: '快速开始',
              link: '/guide/',
            },
          ],
        },
        {
          text: 'API 文档',
          items: [
            {
              text: '构造函数',
              link: '/guide/api/',
            },
            {
              text: '方法',
              link: '/guide/api/methods',
            },
            {
              text: '类型定义',
              link: '/guide/api/types',
            },
            {
              text: '插件',
              link: '/guide/api/plugin',
            },
          ],
        },
      ],
      '/en/': [
        {
          text: 'Guide',
          items: [
            {
              text: 'Quick Start',
              link: '/en/guide/',
            },
          ],
        },
        {
          text: 'API Documentation',
          items: [
            {
              text: 'Constructor',
              link: '/en/guide/api/',
            },
            {
              text: 'Methods',
              link: '/en/guide/api/methods',
            },
            {
              text: 'Type Definitions',
              link: '/en/guide/api/types',
            },
            {
              text: 'Plugin',
              link: '/en/guide/api/plugin',
            },
          ],
        },
      ],
    },
    footer: {
      message: '基于 MIT 许可证',
      copyright: '版权所有 © 2026 Version Check JS',
    },
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'canonical', href: 'https://ybchen292.github.io/version-check/' }],
    ['meta', { name: 'keywords', content: '版本检测,前端更新,自动轮询,ETag,版本文件,Version Check JS' }],
    [
      'meta',
      {
        name: 'description',
        content: 'Version Check JS 是一个通用前端版本检测工具，自动判断检测模式，默认自动轮询，保留手动检测',
      },
    ],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'author', content: '446354153@qq.com' }],
    ['meta', { property: 'og:title', content: 'Version Check JS - 通用前端版本检测工具' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Version Check JS 是一个通用前端版本检测工具，自动判断检测模式，默认自动轮询，保留手动检测',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://ybchen292.github.io/version-check/' }],
  ],
};
