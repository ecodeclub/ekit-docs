const {description} = require('../../package.json')
const path = require('path')

module.exports = {
    /**
     * Ref：https://v1.vuepress.vuejs.org/config/#title
     */
    title: '小白社区',
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
        ['meta', {name: 'theme-color', content: '#3eaf7c'}],
        ['meta', {name: 'apple-mobile-web-app-capable', content: 'yes'}],
        ['meta', {name: 'apple-mobile-web-app-status-bar-style', content: 'black'}]
    ],

    configureWebpack: () => {
        const NODE_ENV = process.env.NODE_ENV
        //判断是否是生产环境
        if (NODE_ENV === 'production') {
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
        } else {
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
            {
                text: 'ekit',
                items: [
                    {text: "develop", link: "/ekit/develop/guide/"},
                    {text: "v0.0.5", link: "/ekit/v0.0.5/guide/"},
                    {text: "v0.0.4", link: "/ekit/v0.0.4/guide/"},
                    {text: "v0.0.3", link: "/ekit/v0.0.3/guide/"},
                ],
            },
            {
                text: 'egen',
                items: [
                    {text: "develop", link: "/egen/develop/guide/"},
                ],
            },
            {
                text: '贡献者指南',
                link: "/contribution/",
            }
        ],
        sidebar: {
            '/ekit/develop/guide/': [
                {
                    collapsable: false,
                    children: [
                        '',
                        'slice',
                        'sqlx',
                        'syncx',
                        'atomicx',
                        'bean_option',
                        'list',
                        'queue',
                        'task_pool',
                    ]
                },
            ],
            '/ekit/v0.0.5/guide/': [
                {
                    collapsable: false,
                    children: [
                        '',
                        'slice',
                        'sqlx',
                        'syncx',
                        'atomicx',
                        'bean_option',
                        'list',
                        'queue',
                        'task_pool',
                    ]
                },
            ],
            '/ekit/v0.0.4/guide/': [
                {
                    collapsable: false,
                    children: [
                        '',
                        'slice',
                        'sqlx',
                        'syncx',
                        'bean_option',
                        'list',
                        'task_pool',
                    ]
                },
            ],
            '/ekit/v0.0.3/guide/': [
                {
                    collapsable: false,
                    children: [
                        '',
                        'slice',
                        'syncx',
                        'bean_option',
                        'list',
                    ]
                },
            ],
            // ----------------- //
            '/egen/develop/guide/': [
                {
                    collapsable: false,
                    children: [
                        '',
                    ]
                },
            ],

            // ----------------- //
            '/contribution/': [
                {
                    collapsable: false,
                    children: [
                        '',
                    ]
                },
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
