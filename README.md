# dd-script

打包工具开发中

## 使用教程

1. 在package.json中增加 browserslist
```json
"browserslist": {
    "production": [
      "last 2 Chrome versions",
      "ie >= 11",
      "Firefox >= 20",
      "iOS 9",
      "> 5%"
    ],
    "development": [
      "last 2 Chrome versions",
      "ie >= 11",
      "Firefox >= 20",
      "iOS 9",
      "> 5%"
    ]
  }
```
2. 项目根目录增加 .babelrc 文件
```
{
  "presets": [
    [
      "@babel/preset-react", {
        "runtime": "automatic"
      }
    ],
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": 3,
        "helpers": false
      }
    ]
  ]
}
```

3. package.json 中修改scripts
```
"scripts": {
    "build": "dd-script build",
    "dev": "dd-script dev",
    "clear": "dd-script clear"
},
```

4. 项目根目录增加配置文件 .dd.js
```
module.exports = {
    buildPath: "build", // 编译目录，默认build目录
    releasePath: "release", // 生成打包目录
    useMerroyBuild: false, // 使用内存编译，否则开发环境编译文件会写入buildPath目录
    publicPath: {
        dev: "./", // 开发环境output的publicPath, 当useMerroyBuild为true时，此配置无效
        prd: "./app/" // 生产环境output的publicPath
    },
    devtool: "", // 开发环境下使用这个配置，默认 cheap-module-source-map
    devServer: {
        host: "", // 配置host，默认 0.0.0.0
        port: "3456", // 不指定端口号，默认3000
        publicPath: "",
        open: true, // 自动打开浏览器
    },
    useVConsole: true, // 是否启用vconsole
    useAnalyzer: false, // 是否使用打包分析
    insertHtml: { // 向html插入额外的脚本
        beforeInner: ["./lib/sensorsdata.min.js"], // 向webpack生成的脚本之前插入script
        afterInner: [] // 向webpack生成的脚本之后插入script
    },
    useReactRefresh: true, // 使用热更新，开发环境下使用
    cacheTimeout: 7, // cache 失效时间，单位天，默认7天
    // babelTransformContains: [], // es6转成es5 例如：["node_modules/lodash-es"]
    // rules: [], // 额外webpack的rule规则
    // plugins: {
    //     dev: [], // 开发环境下额外增加的插件
    //     prd: [] // 生产环境下额外增加的插件
    // },
    reactVendor: [ // 如果引用了下面包，就会打包到 reactRel.min.js 中
        "react",
        "react-dom",
        "react-transition-group",
        "react-router",
        "react-router-dom",
        "redux",
        "redux-thunk",
        "react-redux"
    ],
    libVendor: [ // 如果引用了下面包，就会打包到 lib.min.js 中
        "antd-mobile",
        "bignumber.js",
        "immer",
        "@reduxjs",
        "better-scroll"
    ]
}
```