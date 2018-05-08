export default function SelectionManager() {
 
    var cachedSelectionMap = null;
    var cachedSelected = null;
    var cachedHandler = {};
    
    this.getNodeState = function(node, options) {
        let id = options.normalizationHelper.getId(node);

        if (!cachedHandler[id]) {
            cachedHandler[id] = {
                up: (e) => this.up(e, id, options),
                down: (e) => this.down(e, id, options), 
            }
        }

        if (cachedSelected !== options.selected) {
            cachedSelectionMap = {};
            for (let s of options.selected) {
                cachedSelectionMap[s] = true;
            }
            cachedSelected = options.selected;
        }
        return { selected: cachedSelectionMap[id], ...cachedHandler[id] };
    };
}

SelectionManager.prototype.extendExistingSelection = function (e, options) { 
    return options.selectedAllowMultiple && e.shiftKey;  
};

SelectionManager.prototype.down = function (e, id, options) {
    this.downPressedTime = Date.now();
    this.downResetIfNotDrag = false;

    if (this.extendExistingSelection(e, options)) {
        options.setSelected([id].concat(options.selected || []));
    } else if (options.selected  && options.selected.length === 1 && options.selected[0] === id) {
        this.downResetIfNotDrag = true;
    } else {
        options.setSelected([id]);
    }
};

SelectionManager.prototype.up = function (e, id, options) {
    var isDrag = Date.now() - this.downPressedTime > 500;
    if (!isDrag && this.downResetIfNotDrag) options.setSelected([]);
};