export default function TransformHelper() {}

TransformHelper.prototype._clone = function (context) {
    return JSON.parse(JSON.stringify(context));
};

TransformHelper.prototype._transformToMultiRow = function (parent, index) {
    return {[this.options.propMulti]: [parent[index]]};
};

TransformHelper.prototype._removeMultiRow = function (parent, index) {
    return parent[index][this.options.propMulti][0];
};

TransformHelper.prototype._detach = function (tree, from) {
    let {detached, parent} = from.detachInTree(tree);
    if (parent.length === 1 && from.getLastSegment().isMultiRow()) {
        from.removeLast().mapInTree((p, i) => this._removeMultiRow(p, i));
    }
    return detached;
};

TransformHelper.prototype._insert = function (tree, detached, to) {
    if (to.getLastSegment().isMultiRow() && !to.setIndex(null).existsInTree(tree)) {
        to.removeLast().mapInTree((p, i) => this._transformToMultiRow(p, i));
    }
    to.insertInTree(tree, detached);
};

TransformHelper.prototype.onDrop = function (from, to) {
    let tree = this._clone(this.options.root);
    this._insert(tree, this._detach(tree, from), to);
    this.options.onChange(tree);
};
