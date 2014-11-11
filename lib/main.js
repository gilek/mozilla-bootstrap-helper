var self = require("sdk/self");
var tabs = require("sdk/tabs");

var button = require('sdk/ui').ActionButton({
    id: "boostrap-helper-button",
    label: "Bootstrap Helper",
    icon: "./status-0-16.png"
});

var _data = {};

function getData(id) {
    if (_data[id] === undefined) {
		_data[id] = {
			status: 0,
			worker: null
		};
    }
    return _data[id];
}

function changeButtonIco(ico) {
    button.icon = './' + ico + '-16.png';
}

function createWorker(tab) {
	var data = getData(tab.id);
	
	var worker = tab.attach({
		contentScriptFile: self.data.url("../lib/site-script.js")
	});

	worker.port.on("notSupported", function () {
		require("sdk/panel").Panel({
			contentURL: self.data.url("info.html"),
			contentScript: 'document.body.innerHTML = "Bootstrap 3 isn\'t installed on this page!";',
			height: 32,
			width: 220,
			position: button
		}).show();

		changeButtonIco('status-' + data.status);
	});
		
	worker.port.on('changeColumn', function (column) {
		changeButtonIco('column-' + column);
	});
	return worker;
}

changeButtonIco('status-0');

button.on("click", function (state) {
    var data = getData(tabs.activeTab.id);

	if (data.status === 0) {
		// enable
		data.worker = createWorker(tabs.activeTab);
		data.worker.port.emit('start');		
		data.status = 1;		
		changeButtonIco('status-1');
	} else {
		//disable
		data.worker.port.emit('stop');
		data.status = 0;
		changeButtonIco('status-0');	
	}
});

tabs.on('ready', function (tab) {
	// url was changed
	var data = getData(tab.id);
	
	data.worker = createWorker(tab);
	
    if (data.status === 1) {	
		data.worker.port.emit('start');
	}
});

tabs.on('activate', function (tab) {
    var data = getData(tab.id);
	
	changeButtonIco('status-' + data.status);
	
    if (data.status === 1) {
        data.worker.port.emit('trigger');
    }
});