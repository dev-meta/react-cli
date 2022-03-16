const inquirerConfig = {
    cover: [{
        type: 'list',
        message: '文件夹已存在，请选择处理方式',
        name: 'cover',
        choices: [
            {
                name: '覆盖',
                value: 'cover',
            },
            {
                name: '新建',
                value: 'new',
            },
            {
                name: '退出',
                value: 'exit'
            }
        ]
    }],
    create: [{
        type: 'input',
        message: '请输入名称',
        name: 'name',
    }],
}

const repo = {
    ts: 'direct:https://github.com/wangzongqi1001/react-template-ts#main',
    js: 'direct:https://github.com/wangzongqi1001/react-template'
}

module.exports = {
    inquirerConfig,
    repo
}