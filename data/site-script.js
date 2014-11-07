

var BootstrapHelper = {
    elementId: "bh-fd9ab41e47a9ef4f6477a8a000bf404f",
    appendElement: function () {
        var element = document.createElement("div");
        element.setAttribute("id", this.elementId);
        element.setAttribute("style", "opacity=0");

        for each(var size in ["xs", "sm", "md", "lg"]) {
            var span = document.createElement("span");
            span.setAttribute("class", "visible-" + size);
            span.innerHTML = "&zwnj;";
            element.appendChild(span);
        }

        document.body.appendChild(element);
    },
    listener: function () {
        self.port.emit("changeColumn", BootstrapHelper._getColumnName());
    },
    isInstalled: function () {
        return this._getColumnName() === undefined ? false : true;
    },
    _getColumnName: function () {
        var name;
        var elements = document.getElementById(this.elementId).getElementsByTagName("span");
        for (var i = 0; i < elements.length; i++) {
            if (this._isVisible(elements[i])) {
                if (name === undefined) {
                    var parts = elements[i].className.split("-");
                    name = parts[1];
                } else {
                    name = undefined;
                    break;
                }
            }
        }
        return name;
    },
    _isVisible: function (obj) {
        if (obj === document)
            return true;

        if (!obj)
            return false;
        if (!obj.parentNode)
            return false;
        if (obj.style) {
            if (obj.style.display === 'none')
                return false;
            if (obj.style.visibility === 'hidden')
                return false;
        }

        //Try the computed style in a standard way
        if (window.getComputedStyle) {
            var style = window.getComputedStyle(obj, "");
            if (style.display === 'none')
                return false;
            if (style.visibility === 'hidden')
                return false;
        }

        //Or get the computed style using IE's silly proprietary way
        var style = obj.currentStyle;
        if (style) {
            if (style['display'] === 'none')
                return false;
            if (style['visibility'] === 'hidden')
                return false;
        }
        return this._isVisible(obj.parentNode);
    }
};

self.port.on("init", function () {
    BootstrapHelper.appendElement();

    if (!BootstrapHelper.isInstalled()) {
        self.port.emit("notSupported");
    } else {
        window.addEventListener('resize', BootstrapHelper.listener, true);
        BootstrapHelper.listener();
    }
});

self.port.on("startListening", function () {
    window.addEventListener('resize', BootstrapHelper.listener, true);
});

self.port.on("stopListening", function () {
    window.removeEventListener('resize', BootstrapHelper.listener, true);
});

self.port.on("triggerListener", function () {
    BootstrapHelper.listener();
});