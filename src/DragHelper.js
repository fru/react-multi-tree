export default function DragHelper() {}

DragHelper.prototype.beginDrag = ({ path, list, index, convertToMulti }) => ({
    item: list[index], 
    path: convertToMulti ? path.removeLast() : path
});

DragHelper.prototype.drop = function (props, monitor) {
    //if (!this.targetPreview(props, monitor.isOver(), monitor.getItem())) return;

    let item = monitor.getItem();
    let recalc = props.path.recalculateAfterDetach(item.path);
    this.options.transformHelper.onDrop(item.path, recalc, item.item);
};

DragHelper.prototype.targetVisible = function (props, isOver, item) {
    if (!item || !item.item) return false;
    let { isParentDragging, index, list, isMultiNode } = props;
    
    if (isParentDragging || item.item === list[index-1] || item.item === list[index]) {
        return false;
    } else if (isMultiNode && this.options.normalizationHelper.getChildren(item.item).hasChildren) {
        return false;
    }
    return true;
};

DragHelper.prototype.targetPreview = function (props, isOver, item) {
    if (!item || !item.item) return false;
    let { index, list, isMultiNode, path, parent, group } = props;

    path = path.recalculateAfterDetach(item.path);

    // Drop allready happend
    let id = this.options.normalizationHelper.getId(list[path.getLastSegment().getIndex()]);
    if (id === this.options.normalizationHelper.getId(item.item)) return;

    // Calculate before and after rows
    var value = { before: list.slice(), after: list.slice(), index, source: item };

    if (item.path.setIndex(null).equals(path.setIndex(null))) {
        value.after.splice(item.path.getLastSegment().getIndex(), 1);
    }
    value.after.splice(path.getLastSegment().getIndex(), 0, item.item);
    
    return this.executeAllow(isMultiNode, parent, group, path, value);    
};

// TODO allow non function constants and iterate over nodes

DragHelper.prototype.executeAllow = function (isMultiNode, parent, group, path, value) {
    if (isMultiNode) {
        return this.options.allowMultiRow(value, path);
    } else {
        return this.options.allowChildren(parent, group, value, path);
    }
};