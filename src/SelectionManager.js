export default function SelectionManager() {
 
    var cachedSelectionMap = null;
    var cachedSelected = null;
    var cachedHandlers = [];
    
    this.getNodeState = function(node, options) {
        let id = options.getId(node);

        if (!cachedHandlers[id]) {
            cachedHandlers[id] = (e) => {
                this.select(e, id, options);
            }
        }

        if (cachedSelected !== options.selected) {
            cachedSelectionMap = {};
            for (let s of options.selected) {
                cachedSelectionMap[s] = true;
            }
            cachedSelected = options.selected;
        }

        return { selected: !!cachedSelectionMap[id], handler: cachedHandlers[id] };
    };
}

SelectionManager.prototype.select = function (e, id, options) {
    console.log(arguments);
    if (options.isSelectionMulti(e)) {
        options.setSelected([id].concat(options.selected || []));
    } else {
        options.setSelected([id]);
    }
};