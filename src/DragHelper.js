export default function DragHelper() {}

DragHelper.prototype.beginDrag = ({ path, list, index, convertToMulti }) => ({
    item: list[index],
    timestamp: new Date().getTime(),
    path: convertToMulti ? path.removeLast() : path
});

DragHelper.prototype.drop = function (props, monitor) {
    if (!this._targetAllowed(props, monitor.isOver(), monitor.getItem())) return;

    let item = monitor.getItem();
    let recalc = props.path.recalculateAfterDetach(item.path);
    this.options.transformHelper.onDrop(item.path, recalc, item.item);
};

DragHelper.prototype._validateInvisibleCache = function (timestamp) {
    if (this._cacheTimestamp !== timestamp || !this._cacheInvisible) {
        this._cacheTimestamp = timestamp;
        this._cacheInvisible = {};
    }
    return this._cacheInvisible;
};

DragHelper.prototype.targetVisibleCached = function (props, isOver, item, options, path) {
    if (!item) return false;

    let invisibleCache = this._validateInvisibleCache(item.timestamp);
    let key = path.toString();

    if (invisibleCache[key]) return false;

    if (!options.dragHelper._targetPossible(props, isOver, item)) {
        invisibleCache[key] = true;
		return false;
    }

    if (isOver && !options.dragHelper._targetAllowed(props, isOver, item)) {
        invisibleCache[key] = true;
		return false;
    }

    return true;
}

DragHelper.prototype._targetPossible = function (props, isOver, item) {
    if (!item || !item.item) return false;
    let { isParentDragging, index, list, isMultiNode } = props;
    
    if (isParentDragging || item.item === list[index-1] || item.item === list[index]) {
        return false;
    } else if (isMultiNode && this.options.normalizationHelper.getChildren(item.item).hasChildren) {
        return false;
    }
    return true;
};

DragHelper.prototype._targetAllowed = function (props, isOver, item) {
    if (!item || !item.item) return false;
    let { index, list, isMultiNode, path, parent, group } = props;

    path = path.recalculateAfterDetach(item.path);

    // Drop allready happend
    let id = this.options.normalizationHelper.getId(list[path.getLastSegment().getIndex()]);
    if (id === this.options.normalizationHelper.getId(item.item)) return;

    // Calculate before and after rows
    var value = { before: list.slice(), after: list.slice(), index, source: item, path, parent };
    if (isMultiNode) value.group = group;

    if (item.path.setIndex(null).equals(path.setIndex(null))) {
        value.after.splice(item.path.getLastSegment().getIndex(), 1);
    }
    value.after.splice(path.getLastSegment().getIndex(), 0, item.item);
    
    return this._executeAllow(isMultiNode, parent, group, path, value);
};

DragHelper.prototype._executeAllow = function (isMultiNode, parent, group, path, value) {
    if (isMultiNode) {
        if (!this._isAllowed([parent], 'allowMultiChildren', [value, path])) return false;
        if (!this._isAllowed(value.after, 'allowMultiRow', [value, path])) return false;
        return this.options.allowMultiRow(value, path);
    } else {
        if (!this._isAllowed([parent], 'allowChildren', [value, path, parent, group])) return false;
        if (!this._isAllowed(value.after, 'allowSibling', [value, path, parent, group])) return false;
        return this.options.allowChildren(value, path, parent, group);
    }
};

DragHelper.prototype._isAllowed = function (nodes, property, args) {
    if (nodes) for(var node of nodes) {
        if (!node || node[property] === undefined) continue;
        if (typeof node[property] === 'function') {
            if (!node[property].apply(node, args)) return false;
        } else if (!node[property]) {
            return false;
        }
    }
    return true;
};