// 主要用来给构建面板提供参数
export const configs = {
    "*": {
        hooks: './hooks', // 指向hooks文件，还必须是字符串，不允许是
        // options: {
        //     testProperty: {
        //         label: 'test',
        //         render: {
        //             ui: 'ui-input',
        //             attributes: {
        //                 placeholder: 'ok, test-property',
        //             }
        //         }
        //     }
        // }
    }
}
