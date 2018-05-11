export default function DragHelper() {}

DragHelper.prototype.beginDrag = ({ path, list, index, convertToMulti }) => ({
    item: list[index], 
    path: path.removeMultiWhenNotYetConverted(convertToMulti)
});

DragHelper.prototype.drop = function (props, monitor) {
    // TODO add this check
    // if (!this.targetActive(props, monitor.getItem(), monitor.isOver())) return false;
    let item = monitor.getItem(), {path, convertToMulti} = props;
    let recalc = path.recalculateAfterDetach(item.path);
    this.options.transformHelper.onDrop(item.path.asArray(), recalc.asArray(), item.item, convertToMulti);
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
    if (!item || !item.item || !isOver) return false;

    let { index, list, isMultiNode, path, parent, group } = props;

    var value = { beforeDrop: list.slice(), afterDrop: list.slice(), index, source: item };

    // TODO: More inteligent logic
    value.afterDrop.splice(index, 0, item.item);

    if (isMultiNode) {
        this.options.allowMultiRow(list, path, value);
    } else {
        this.options.allowChildren(parent, group, path, value);
    }

    return true;
};
