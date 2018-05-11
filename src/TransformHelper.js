export default function TransformHelper() {}

TransformHelper.prototype._getPath = function (context, path) {
    for (var i = 0; i < path.length; i++) {
        context = context[path[i]];
    }
    return context;
},

TransformHelper.prototype._clone = function (context) {
    return JSON.parse(JSON.stringify(context));
};

TransformHelper.prototype._transformToMultiRow = function (node) {
    return {[this.options.propMulti]: [node]};
};

TransformHelper.prototype._normalizeMultiRow = function (tree, from, fromParent) {
    var type = from.pop();
    if (fromParent.length === 1 && type === this.options.propMulti) {
        var index = from.pop();
        var target = this._getPath(tree, from);
        target[index] = fromParent[0];
    }
};

TransformHelper.prototype.onDrop = function (from, to, node) {
    let tree = this._clone(this.options.root);

    var fromIndex = from.pop();
    var fromParent = this._getPath(tree, from);

    fromParent.splice(fromIndex, 1);
    this._normalizeMultiRow(tree, from.slice(), fromParent);

    var toIndex = to.pop();
    var toName = to.pop();
    var toParent = this._getPath(tree, to);

    if (toName === this.options.propMulti && !toParent[this.options.propMulti]) {
        toParent = this._transformToMultiRow(toParent);
        var toReplaceIndex = to.pop();
        var toReplaceParent = this._getPath(tree, to);
        toReplaceParent[toReplaceIndex] = toParent; 
    }
    
    if (typeof toName !== 'undefined') {
        toParent[toName] = toParent[toName] || [];
        toParent = toParent[toName];	
    }
    toParent.splice(toIndex, 0, node);

    this.options.onChange(tree);
};
