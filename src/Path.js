// TODO test

function Segment(path, isMultiRow, index) {
    this.getPath = () => (path || []).slice();
    this.getIndex = () => index >= 0 ? index : null;
    this.isMultiRow = () => isMultiRow;
    this.setIndex = (i) => new Segment(path || [], isMultiRow, i);
}

export default function Path(segments) {
    segments = segments || [new Segment([])];
    this.getSegments = () => segments.slice();
    this.getLastSegment = () => segments[segments.length - 1];
}


// Path Utilities

Path.prototype._asArray = function () {
    var result = [];
    for (var segment of this.getSegments()) {
        for (var prop of segment.getPath()) result.push(prop);
        if (segment.getIndex() !== null) result.push(segment.getIndex());
    }    
    return result;
};

Path.prototype._splice = function(index, count, ...added) {
    var segments = this.getSegments();
    if (index === null) index = segments.length - count;

    var removed = segments.splice(index, count, ...added);
    return {removed, path: new Path(segments)};
};

Path.prototype._startWith = function (prefix) {
    var path = this._asArray();
    prefix = prefix._asArray();

    for(var i = 0; i < prefix.length; i++) {
        if (path[i] !== prefix[i]) return false;
    }
    return true;
};

Path.prototype.add = function(path, isMultiRow, index) {
    return this._splice(null, 0, new Segment(path, isMultiRow, index)).path;
};

Path.prototype.removeLast = function() {
    return this._splice(null, 1).path;
};

Path.prototype.setIndex = function(i) {
    var segments = this.getSegments();
    segments[segments.length-1] = segments[segments.length-1].setIndex(i);
    return new Path(segments);
};

Path.prototype.recalculateAfterDetach = function(detached) {
    let index = detached.getSegments().length - 1;
    let related = this.getSegments()[index];

    if (!this._startWith(detached.setIndex(null))) return this;
    if (related.getIndex() < detached.getLastSegment().getIndex()) return this;

    let recalculated = related.setIndex(related.getIndex() - 1);
    return this._splice(index, 1, recalculated).path;
};


// Path Tree Transformations

Path.prototype._findInTree = function(context) {
    for (var prop of this._asArray()) {
        if (!context) break;
        context = context[prop];
    }
    return context;
};

Path.prototype._getEditableContext = function(context) {
    let index = this.getLastSegment().getIndex();
    let parent = this.setIndex(null)._findInTree(context);
    return {index, parent};
};

Path.prototype.existsInTree = function(context) {
    return !!this._findInTree(context);
};

Path.prototype.detachInTree = function(context) {
    let {index, parent} = this._getEditableContext(context);
    return {detached: parent.splice(index, 1)[0], parent};
};

Path.prototype.mapInTree = function(context, f) {
    let {index, parent} = this._getEditableContext(context);
    parent[index] = f(parent, index);
};

Path.prototype.insertInTree = function(context, node) {
    let {index, parent} = this._getEditableContext(context);
    parent.splice(index, 0, node);
};
