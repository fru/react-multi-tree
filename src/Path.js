export function Segment(path, index) {    
    var _path = path || [];
    var _index = index;
    
    this.getPath = function () {
        return _path.slice();
    };

    this.getIndex = function () {
        return _index;
    };
}

Segment.prototype.hasIndex = function () {
    return !isNaN(+this.getIndex());
};

export default function Path(segments) {
    var _segments = segments || [];
    
    this.getSegments = function () {
        return _segments.slice();
    };
}

Path.prototype.asArray = function () {
    var result = [];
    for (var segment of this.getSegments()) {
        for (var prop of segment.getPath()) result.push(prop);
        if (segment.hasIndex()) result.push(segment.getIndex());
    }    
    return result;
};

Path.prototype.find = function(context) {
    for (var prop of this.asArray()) {
        context = context[prop];
    }
    return context;
};


Path.prototype._splice = function(index, count, ...added) {
    var segments = this.getSegments();
    if (index === null) index = segments.length - 1;
    
    var removed  = segments.splice(index, count, ...added);
    return {removed, path: new Path(segments)};
};

Path.prototype.add = function(segment) {
    return this._splice(null, 0, segment).path;
};

Path.prototype.setIndex = function(i) {
    let {removed, path} = this._splice(null, 1);
    return path.add(new Segment(removed[0].getPath(), i));
};


Path.prototype._startWith = function (prefix) {
    var path = this.asArray(), prefix = detached.asArray();
    for(var i = 0; i < prefix.length; i++) {
        if (path[i] !== prefix[i]) return false;
    }
    return true;
};

Path.prototype.recalculateAfterDetach = function(detached) {
    let related = this.getSegments()[detached.length - 1];

    if (!this._startWith(detached.setIndex(null))) return this;
    if (related.getIndex() < detached[detached.length - 1].getIndex()) return this;

    let recalculated = related.setIndex(related.getIndex() - 1);
    return this._splice(detached.length - 1, 1, recalculated);
}