export default function Path(path) {
    var _path = path ? path.slice() : [];

    this.asArray = function() {
        return _path.slice();
    };
}

Path.prototype._differentPrefix = function(prefix, lengthChecked) {
    var path = this.asArray();
    for(var i = 0; i < lengthChecked; i++) {
        if (path[i] !== prefix[i]) return true;
    }
}

Path.prototype.add = function(segment) {
    return new Path(this.asArray().concat(Array.isArray(segment) ? segment: [segment]));
}

Path.prototype.clone = function(transform) {
    transform = transform || (x => x);
    return new Path(transform(this.asArray()));
}

Path.prototype.recalculateAfterDetach = function(detached) {
    if (detached.asArray) detached = detached.asArray();
    var index = detached.length - 1, path = this.asArray();
    if (this._differentPrefix(detached, index)) return this;
    if (path[index] < detached[index]) return this;
    return this.clone(path => { path[index]--; return path; });
}
