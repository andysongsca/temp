const OFF = 0;
const ERROR = 2;
const WARNING = 1;

module.exports = {
    extends: [
        'alloy',
        'alloy/react',
        'alloy/typescript',
    ],
    env: {
        // 你的环境变量（包含多个预定义的全局变量）
        //
        // browser: true,
        // node: true,
        // mocha: true,
        // jest: true,
        // jquery: true
    },
    globals: {
        // 你的全局变量（设置为 false 表示它不允许被重新赋值）
        //
        // myGlobal: false
        AnyObject: true,
    },
    rules: {
        // 自定义你的规则
        'prefer-arrow-callback': OFF,
        'no-debugger': WARNING,
        '@typescript-eslint/prefer-optional-chain': OFF,
        '@typescript-eslint/no-empty-interface': OFF,
        'no-param-reassign': OFF,
        'max-params': [ WARNING, { max: 4 } ],
        'max-nested-callbacks': OFF,
        'no-invalid-void-type': OFF,
    },
};
