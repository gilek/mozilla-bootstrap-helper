var ui = require('sdk/ui');
var self = require("sdk/self");
var tabs = require("sdk/tabs");
var panels = require("sdk/panel");

var button = ui.ActionButton({
    id: "boostrap-helper-button",
    label: "Bootstrap Helper",
    icon: "./status-0-16.png"
});

var _data = {};
function getData(id) {
    if (_data[id] === undefined) {
        _data[id] = {
            ready: false,
            status: 0,
            worker: null
        };
    }
    return _data[id];
}

function changeButtonIco(ico) {
    button.icon = './' + ico + '-16.png';
}

changeButtonIco('status-0');

button.on("click", function (state) {
    var data = getData(tabs.activeTab.id);

    // page is not ready or URL is empty
    if (data.ready !== true) {
        panels.Panel({
            contentURL: self.data.url("info.html"),
            contentScript: 'document.body.innerHTML = "Page isn\'t ready!";',
            height: 32,
            width: 110,
            position: button
        }).show();
    } else {
        // checking status
        if (data.status === 0) {
            // enable
            var worker = tabs.activeTab.attach({
                contentScriptFile: self.data.url("site-script.js")
            });

            worker.port.on("notSupported", function () {
                panels.Panel({
                    contentURL: self.data.url("info.html"),
                    contentScript: 'document.body.innerHTML = "Bootstrap 3 isn\'t installed on this page!";',
                    height: 32,
                    width: 220,
                    position: button
                }).show();
                data.status = 0;
            });

            worker.port.on('changeColumn', function (column) {
                changeButtonIco('column-' + column);
            });

            worker.port.emit('init');

            data.worker = worker;
            data.status = 1;
        } else {
            //disable
            data.worker.port.emit('stopListening');
            data.status = 0;
            changeButtonIco('status-0');
        }
    }
});

tabs.on('activate', function (tab) {
    var data = getData(tab.id)
    if (data.status === 1) {
        data.worker.port.emit('triggerListener');
    } else {
        changeButtonIco('status-0');
    }
});

tabs.on('ready', function (tab) {
    getData(tab.id).ready = true;
});