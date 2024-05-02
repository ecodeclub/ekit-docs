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

    toc: {
        includeLevel: [1, 2, 3, 4],
    },

    locales: {
        "/": {
            lang: "zh-CN",
            title: "小白社区",
            description: "小白混迹的社区",
        },
        "/en-US/": {
            lang: "en-US",
            title: "ecodeclub",
            description: "easy coding, easy work",
            themeConfig: {},
        },
    },

    configureWebpack: () => {
        // const NODE_ENV = process.env.NODE_ENV
        //判断是否是生产环境
        return {
            resolve: {
                //配置路径别名
                alias: {
                    'public': path.resolve(__dirname, './public')
                }
            }
        }
        // if (NODE_ENV === 'production') {
        //     return {
        //         output: {
        //             publicPath: 'https://cdn.gocn.vip/ekit/'
        //         },
        //         resolve: {
        //             //配置路径别名
        //             alias: {
        //                 'public': path.resolve(__dirname, './public')
        //             }
        //         }
        //     }
        // } else {
        //     return {
        //         resolve: {
        //             //配置路径别名
        //             alias: {
        //                 'public': path.resolve(__dirname, './public')
        //             }
        //         }
        //     }
        // }
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
        navbar: true,
        sidebar: "auto",
        displayAllHeaders: true,
        // repo: '',
        // editLinks: false,
        // docsDir: '',
        // editLinkText: '',
        // lastUpdated: false,
        locales: {
            '/': {
                nav: [
                    {
                        text: 'beego',
                        // text: "版本",
                        ariaLabel: "版本",
                        items: [
                            {text: "develop", link: "/beego/developing/"},
                            {text: "v2.2.x", link: "/beego/v2.2.x/"},
                            {text: "v2.1.x", link: "/beego/v2.1.x/"},
                            {text: "v2.0.x", link: "/beego/v2.0.x/"},
                        ],
                    },
                    {
                        text: 'ekit',
                        items: [
                            {text: "develop", link: "/ekit/develop/guide/"},
                            {text: "v0.0.9", link: "/ekit/v0.0.9/guide/"},
                            {text: "v0.0.8", link: "/ekit/v0.0.8/guide/"},
                            {text: "v0.0.7", link: "/ekit/v0.0.7/guide/"},
                            {text: "v0.0.6", link: "/ekit/v0.0.6/guide/"},
                        ],
                    },
                    {
                        text: 'eorm',
                        items: [
                            {text: "develop", link: "/eorm/develop/"},
                        ],
                    },
                    {
                        text: '贡献者指南',
                        link: "/contribution/",
                    }
                ],
                sidebar: {
                    // 目前中英文没区别
                    "/beego/developing/": buildBeegoVersionSideBarEn("developing"),
                    "/beego/v2.0.x/": buildBeegoVersionSideBarEn("v2.0.x"),
                    "/beego/v2.1.x/": buildBeegoVersionSideBarEn("v2.1.0"),
                    "/beego/v2.2.x/": buildBeegoVersionSideBarEn("v2.1.0"),
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
                                'mapx',
                                'task_pool',
                            ]
                        },
                    ],
                    '/ekit/v0.0.9/guide/': [
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
                                'retry',
                                'iox',
                            ]
                        },
                    ],
                    '/ekit/v0.0.8/guide/': [
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
                                'retry',
                            ]
                        },
                    ],
                    '/ekit/v0.0.7/guide/': [
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
                                'retry',
                            ]
                        },
                    ],
                    '/ekit/v0.0.6/guide/': [
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
                                'mapx',
                                'task_pool',
                            ]
                        },
                    ],
                    // ----------------- //
                    '/eorm/develop/': [
                        {
                            collapsable: false,
                            sidebarDepth: 2,
                            children: [
                                '',
                            ]
                        },
                    ],

                    '/egen/develop/guide/': [
                        {
                            collapsable: false,
                            children: [
                                '',
                            ]
                        },
                    ],

                    '/ecron/develop/guide/': [
                        {
                            collapsable: false,
                            children: [
                                '',
                                'architecture',
                                'solutions',
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
            "/en-US/": {
                nav: [
                    {
                        text: "Beego",
                        ariaLabel: "Beego",
                        // text: 'beego',
                        items: [
                            {text: "develop", link: "/en-US/beego/developing/"},
                            {text: "v2.2.x", link: "/en-US/beego/v2.2.x/"},
                            {text: "v2.1.x", link: "/en-US/beego/v2.1.x/"},
                            {text: "v2.0.x", link: "/en-US/beego/v2.0.x/"},
                        ],
                    },
                ],
                sidebar: {
                    "/en-US/beego/developing/": buildBeegoVersionSideBarEn("developing"),
                    "/en-US/beego/v2.0.x/": buildBeegoVersionSideBarEn("v2.0.x"),
                    "/en-US/beego/v2.1.x/": buildBeegoVersionSideBarEn("v2.1.x"),
                    "/en-US/beego/v2.2.x/": buildBeegoVersionSideBarEn("v2.2.x"),
                }
            }
        },
    },

    /**
     * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
     */
    plugins: [
        '@vuepress/plugin-back-to-top',
        '@vuepress/plugin-medium-zoom',
    ]
}

function buildBeegoVersionSideBarEn() {
    return [
        "environment/",
        "bee/",
        "config/",
        {
            title: "Web Module",
            collapsable: true,
            sidebarDepth: 0,
            children: [
                {
                    title: "Routes",
                    collapsable: true,
                    sidebarDepth: 0,
                    children: [
                        "web/router/ctrl_style/",
                        "web/router/functional_style/",
                        "web/router/router_tree",
                        "web/router/namespace",
                        "web/router/best_practice",
                    ],
                },
                "web/input/",
                "web/file/",
                "web/session/",
                "web/cookie/",
                "web/error/",
                "web/admin/",
                "web/xsrf/",
                {
                    title: "View",
                    collapsable: true,
                    sidebarDepth: 0,
                    children: [
                        "web/view/",
                        "web/view/func.md",
                        "web/view/page.md",
                        "web/view/static_file.md",
                    ],
                },
                "web/grace",
            ],
        },
        {
            title: "ORM",
            collapsable: true,
            sidebarDepth: 0,
            children: [
                "orm/",
                "orm/db.md",
                "orm/model.md",
                "orm/orm.md",
                "orm/transaction.md",
                "orm/query_builder.md",
                "orm/query_seter.md",
                "orm/raw_seter.md",
                "orm/query_m2m.md",
            ],
        },
        {
            title: "Cache",
            collapsable: true,
            sidebarDepth: 0,
            children: [
                "cache/cache_pattern.md"
            ],
        },
        "logs/",
        "validation/",
        "task/",
        "i18n/",
        {
            title: "Q & A",
            collapsable: true,
            sidebarDepth: 0,
            children: [
                ["qa/", "Q&A and FAQ"],
                "qa/failed_to_start_web_server",
                // 'writing-a-theme',
                // 'option-api',
                // 'default-theme-config',
                // 'blog-theme',
                // 'inheritance'
            ],
        },
    ];
}