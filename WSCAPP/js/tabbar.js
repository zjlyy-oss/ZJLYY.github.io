//底部导航条菜单切换
(function ($, tab) {

    tab.Tap = function () {
        var self = plus.webview.currentWebview();
        var current = '';
        var styles = {
            top: '0',
            bottom: '51px'
        };
        var tabsConfig = {
            main: {
                url: 'main.html',
                styles: styles,
                default: true
            },
            message: {
                url: 'tab-message.html',
                styles: styles
            },
            contact: {
                url: 'tab-contact.html',
                styles: styles
            },
            setting: {
                url: 'setting.html',
                styles: styles
            }
        };
        var tabs = {};
        //for (id in tabsConfig) {
        //    tabs[id] = plus.webview.create(tabsConfig[id].url, id, tabsConfig[id].styles);
        //    if (tabsConfig[id]['default']) {
        //         self.append(tabs[id]);
        //        current = id;
        //    }
        //}
        mui('#bar').on('tap', 'a', function (e) {
            if (current == this.dataset.id) {
                return;
            }
            //utils.open(tabsConfig[this.dataset.id].url, 2);
            tabs[this.dataset.id] = plus.webview.create(tabsConfig[this.dataset.id].url, tabsConfig[this.dataset.id].url, tabsConfig[this.dataset.id].styles);
            tabs[this.dataset.id].show();
            current = this.dataset.id;
        });
    }
}(mui, window.tabbar = {}))