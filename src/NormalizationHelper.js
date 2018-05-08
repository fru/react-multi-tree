export default function NormalizationHelper() {}

NormalizationHelper.prototype.getId = function (node) {
    return node[this.options.propId];
};

NormalizationHelper.prototype.getChildren = function (node) {
    let prefix = this.options.propContains + '-';
    let { propContains, getChildGroupTitle } = this.options;
    let groups = [{prop: propContains}];

    for (var prop in node) {
        if (getChildGroupTitle && prop.indexOf(prefix) === 0) {
            let title = getChildGroupTitle(prop.substring(prefix.length));
            if (title) groups.push({ prop, title });
        }
    }

    let hasChildren = false;
    groups.forEach(({prop}) => {
        if (node[prop] && node[prop].length > 0) hasChildren = true;
    });
    return { groups, hasChildren };
};

NormalizationHelper.prototype._extendGroups = function (groups, node, parentPath) {
    return groups.map(group => {
        return {...group, path: parentPath.add(group.prop), list: node[group.prop] || []}
    });
};

NormalizationHelper.prototype._getMultiRow = function (node, parentPath) {
    let multi = node[this.options.propMulti]
    let convertToMulti = !multi || !multi.length;
    let list = convertToMulti ? [node] : multi;

    return { list, convertToMulti, path: parentPath.add(this.options.propMulti) };
};

NormalizationHelper.prototype.normalize = function (node, parentPath) {
    let children = this.getChildren(node);
    let multi = this._getMultiRow(node, parentPath);
    
    if (!children.hasChildren) {
        if (multi.list.length > 1) return { multi };
        else return { multi, groups: this._extendGroups(children.groups, node, parentPath) }; 
    } else {
        return { groups: this._extendGroups(children.groups, node, parentPath) };
    }
};
