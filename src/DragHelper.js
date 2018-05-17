export default function DragHelper() {}

DragHelper.prototype.beginDrag = ({ path, list, index, convertToMulti }) => ({
    item: list[index], 
    path: convertToMulti ? path.removeSegment().path : path
});

DragHelper.prototype.drop = function (props, monitor) {
    if (!this.targetPreview(props, monitor.isOver(), monitor.getItem())) return;

    let item = monitor.getItem();
    let recalc = props.path.recalculateAfterDetach(item.path);
    this.options.transformHelper.onDrop(item.path.asArray(), recalc.asArray(), item.item);
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

    var value = { before: list.slice(), after: list.slice(), index, source: item };

    // TODO: More inteligent logic / share with transformationHelper?
    value.afterDrop.splice(index, 0, item.item);

    // TODO allow non function constants and iterate over nodes

    if (isMultiNode) {
        return this.options.allowMultiRow(list, path, value);
    } else {
        return this.options.allowChildren(parent, group, path, value);
    }
};
