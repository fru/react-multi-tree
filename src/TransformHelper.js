export default function TransformHelper() {}

TransformHelper.prototype._clone = function (context) {
    return JSON.parse(JSON.stringify(context));
};

TransformHelper.prototype._transformToMultiRow = function (parent, index) {
    return this.options.normalizationHelper.setRandomId({[this.options.propMulti]: [parent[index]]});
};

TransformHelper.prototype._transformAddChildren = function (parent, index) {
    return {[this.options.propContains]: [], ...parent[index]}; 
};

TransformHelper.prototype._removeMultiRow = function (parent, index) {
    return parent[index][this.options.propMulti][0];
};

TransformHelper.prototype._detach = function (tree, from) {
    let {detached, parent} = from.detachInTree(tree);
    if (parent.length === 1 && from.getLastSegment().isMultiRow()) {
        from.removeLast().mapInTree(tree, (p, i) => this._removeMultiRow(p, i));
    }
    return detached;
};

TransformHelper.prototype._insert = function (tree, detached, to) {
    if (!to.setIndex(null).existsInTree(tree)) {
        if (to.getLastSegment().isMultiRow()) {
            to.removeLast().mapInTree(tree, (p, i) => this._transformToMultiRow(p, i));
        } else {
            to.removeLast().mapInTree(tree, (p, i) => this._transformAddChildren(p, i));
        }
    }
    to.insertInTree(tree, detached);
};

TransformHelper.prototype.onDrop = function (from, to) {
    let tree = this._clone(this.options.root);
    this._insert(tree, this._detach(tree, from), to);
    this.options.onChange(tree);
};
