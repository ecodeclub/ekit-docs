const { description } = require('../../package.json')

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'ekit',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    nav: [
      // {
      //   text: 'ekit',
      //   link: '/ekit/develop/guide/',
      // },
      {
        text: 'ekit',
        items: [
          { text: "develop", link: "/ekit/develop/guide/" },
        ],
      },
      // {
      //   text: 'Config',
      //   link: '/config/'
      // },
      {
        text: 'VuePress',
        link: 'https://v1.vuepress.vuejs.org'
      }
    ],
  configureWebpack: () => {
      const NODE_ENV = process.env.NODE_ENV
      //判断是否是生产环境
      if(NODE_ENV === 'production'){
          return {
              output: {
                  publicPath: 'https://cdn.gocn.vip/ekit/'
              },
              resolve: {
                  //配置路径别名
                  alias: {
                      'public': path.resolve(__dirname, './public')
                  }
              }
          }
      }else{
          return {
              resolve: {
                  //配置路径别名
                  alias: {
                      'public': path.resolve(__dirname, './public')
                  }
              }
          }
      }
  },
  markdown: {
      lineNumbers: true, // 代码块显示行号
  },
    sidebar: {
      'ekit/develop/guide/': [
        {
          title: '快速开始',
          collapsable: false,
          children: [
              '',
              'list'
          ]
        },
        // {
        //   title: 'List',
        //   collapsable: false,
        //   link: 'list/'
        // }
      ],
    }
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
  ]
}
