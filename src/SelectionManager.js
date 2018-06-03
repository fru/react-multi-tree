export default function SelectionManager() {
 
    var cachedSelectionMap = null;
    var cachedSelected = null;
    var cachedHandler = {};

    function _getCachedMap(options) {
        if (cachedSelected !== options.selected) {
            cachedSelectionMap = {};
            for (let s of options.selected) {
                cachedSelectionMap[s] = true;
            }
            cachedSelected = options.selected;
        }
        return cachedSelectionMap;
    }
    
    this.getNodeState = function(node, options) {
        let id = options.normalizationHelper.getId(node);

        if (!cachedHandler[id]) {
            cachedHandler[id] = {
                up: (e) => this._up(e, id, options),
                down: (e) => this._down(e, id, options), 
            }
        }

        return { selected: _getCachedMap(options)[id], ...cachedHandler[id] };
    };

    this.isRowSelected = function (node, multi, options) {
        var checked = multi ? multi.list : [node];
        for (var n of checked) {
            let id = options.normalizationHelper.getId(n);
            if (_getCachedMap(options)[id]) return true;
        }
        return false;
    };
}

SelectionManager.prototype._extendExistingSelection = function (e, options) { 
    return options.selectedAllowMultiple && e.shiftKey;  
};

SelectionManager.prototype._down = function (e, id, options) {
    this.downPressedTime = Date.now();
    this.downResetIfNotDrag = false;

    if (this._extendExistingSelection(e, options)) {
        options.setSelected([id].concat(options.selected || []));
    } else if (options.selected  && options.selected.length === 1 && options.selected[0] === id) {
        this.downResetIfNotDrag = true;
    } else {
        options.setSelected([id]);
    }
};

SelectionManager.prototype._up = function (e, id, options) {
    var isDrag = Date.now() - this.downPressedTime > 500;
    if (!isDrag && this.downResetIfNotDrag) options.setSelected([]);
};