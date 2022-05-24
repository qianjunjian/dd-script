var { getVconsole } = require("./getVconsole");
var pluginName = "HtmlInsertPlugin";

function HtmlInsertPlugin(options) {
    var _options = options || {};
    this.useVConsole = _options.useVConsole
    this.beforeInner = _options.beforeInner || [];
    this.afterInner = _options.afterInner || [];
    this.beforeInnerTags = [];
    this.afterInnerTags = [];
    this.initTags();
}

HtmlInsertPlugin.prototype.initTags = function() {
    if (this.useVConsole) {
        this.beforeInnerTags = [...getVconsole()];
    }
    if (this.beforeInner) {
        this.beforeInner.map(url => {
            this.beforeInnerTags.push({
                tagName: 'script',
                selfClosingTag: true,
                attributes: {
                    src: url
                }
            })
        })
    }
    if (this.afterInner) {
        this.afterInner.map(url => {
            this.afterInnerTags.push({
                tagName: 'script',
                selfClosingTag: true,
                attributes: {
                    src: url
                }
            })
        })
    }
}

HtmlInsertPlugin.prototype.apply = function(compiler) {
    var self = this;
    compiler.hooks.compilation.tap(pluginName, function (compilation) {
        var HtmlWebpackPlugin = require('html-webpack-plugin');
        var hook = HtmlWebpackPlugin.getHooks(compilation).alterAssetTags;
        if (hook) {
            hook.tapAsync(pluginName, function (htmlPluginData, callback) {
                if (self.beforeInnerTags && self.beforeInnerTags.length > 0) {
                    htmlPluginData.assetTags.scripts = self.beforeInnerTags.concat(htmlPluginData.assetTags.scripts);
                }
                if (self.afterInnerTags && self.afterInnerTags.length > 0) {
                    htmlPluginData.assetTags.scripts = htmlPluginData.assetTags.scripts.concat(self.afterInnerTags);
                }
                callback(null, htmlPluginData);
            })
        } else {
            console.error('HtmlInsertPlugin error.')
        }
    });
};

module.exports = HtmlInsertPlugin;