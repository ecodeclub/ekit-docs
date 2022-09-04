import { defineUserConfig } from 'vuepress'
import { defaultTheme } from 'vuepress'
import path from "path";

export default defineUserConfig({
    lang: 'zh-CN',
    title: '小白社区',
    description: '新创建的社区',
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

    // markdown 相关配置
    // markdown: {
    //     lineNumbers: true, // 代码块显示行号
    // },
    theme: defaultTheme({
        // default theme config
        navbar: [
            {
                text: 'Home',
                link: '/',
            },
            {
                text: 'ekit',
                children: [
                    { text: "develop", link: "/ekit/develop/guide/" },
                ],
            },
            {
                text: 'egen',
                children: [
                    { text: "develop", link: "/egen/develop/guide/" },
                ],
            },
        ],

        sidebar: {
            '/ekit/develop/guide/': [
                {
                    title: '快速开始',
                    collapsable: true,
                    children:[
                        '/ekit/develop/guide/README.md',
                        '/ekit/develop/guide/list.md',
                        '/ekit/develop/guide/copier.md',
                    ]
                },

            ],
        }
    }),
    // theme: {
    //     repo: '',
    //     editLinks: false,
    //     docsDir: '',
    //     editLinkText: '',
    //     lastUpdated: false,
    //     nav: [
    //         // {
    //         //   text: 'ekit',
    //         //   link: '/ekit/develop/guide/',
    //         // },

    //         // {
    //         //   text: 'Config',
    //         //   link: '/config/'
    //         // },
    //         {
    //             text: 'VuePress',
    //             link: 'https://v1.vuepress.vuejs.org'
    //         }
    //     ],

    // },
})