export default function DragHelper() {}

DragHelper.prototype.beginDrag = ({ path, list, index, convertToMulti }) => ({
    item: list[index], 
    path: path.removeMultiWhenNotYetConverted(convertToMulti)
});

DragHelper.prototype.drop = function ({path, convertToMulti}, monitor) {
    let item = monitor.getItem();
    let recalc = path.recalculateAfterDetach(item.path);
    this.options.transformHelper.onDrop(item.path.asArray(), recalc.asArray(), item.item, convertToMulti);
};

DragHelper.prototype.targetActive = function (item, parentDragging, before, after, isMultiNode) {
    if (parentDragging || item === before || item === after) {
        return false;
    } else if (isMultiNode && this.options.normalizationHelper.getChildren(item).hasChildren) {
        return false;
    }
    return true;
};
