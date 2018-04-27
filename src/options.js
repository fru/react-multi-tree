import React from 'react';
import Path from './Path';
import SelectionManager from './SelectionManager';
import classNames from 'classnames/bind';


export const defaultOptions = ($tree) => {

    return {

        // Defaults

        propId: 'id',
        propContains: 'contains',
        propMulti: 'multi',

        node: function (node) {
			return <div> 
				<span className={this.cx('handler')}>::</span>
				{node.title}
			</div>;
        },

        // Tran

        onChange: function (modified) {},
        
        // Selection

        selected: [],
        selectedAllowMultiple: false,

        setSelected: function (selected) {
            this.selected = selected;
            $tree.setState({});
        },

        // Behaviour

        canDrop: function (tree, from, to) {
            
        },

        canDropMulti: function (tree, from, to, index) {
            
        },

        canBecomeMultiRow: function (node) {
            return true;
        },

        // Helper

        selectionManager: new SelectionManager(),

        getId: function (node) {
            return node[this.propId];
        },

        isMultiRow: function (node) {
	        return node[this.propMulti] && node[this.propMulti].length;
        },

        getChildGroupTitle: function (prop) {
            let prefix = this.propContains + '-'
			if (prop.indexOf(prefix) === 0) {
				return prop.substring(prefix.length);
            }
        },

        wasMultipleSelected: function(event) { 
            return this.selectedAllowMultiple && event.shiftKey;  
        },

        // Outsource: DragManager

        beginDrag: ({ options, path, list, index, convertToMulti }) => ({
            item: list[index], 
            path: path.removeMultiWhenNotYetConverted(convertToMulti)
        }),
        drop: function ({tree, path, options, convertToMulti}, monitor) {
            let item = monitor.getItem();
            let recalc = path.recalculateAfterDetach(item.path);
            options.onDrop(tree, item.path.asArray(), recalc.asArray(), options, item.item, convertToMulti);
        },
        targetActive: function (item, parentDragging, before, after, isMultiNode) {
            if (parentDragging || item === before || item === after) {
                return false;
            } else if (isMultiNode && this.getNormalizedChildGroups(item).hasChildren) {
                return false;
            }
            return true;
        },

        // Outsource: TransformManager

        Path: Path,

        _getPath: function (context, path) {
            for (var i = 0; i < path.length; i++) {
                context = context[path[i]];
            }
            return context;
        },

        _clone: function (context) {
            return JSON.parse(JSON.stringify(context));
        },

        _transformToMultiRow: function (node) {
            return {[this.propMulti]: [node]};
        },
        
        onDrop: function (tree, from, to, options, node, convertToMulti) {
            tree = options._clone(tree);
        
            var fromIndex = from.pop();
            var fromParent = options._getPath(tree, from);
        
            fromParent.splice(fromIndex, 1);

            var toIndex = to.pop();
            var toName = to.pop();
            var toParent = options._getPath(tree, to);

            if (convertToMulti) {
                toParent = options._transformToMultiRow(toParent);
                var toReplaceIndex = to.pop();
                var toReplaceParent = options._getPath(tree, to);
                toReplaceParent[toReplaceIndex] = toParent; 
            }
            
            if (typeof toName !== 'undefined') {
                toParent[toName] = toParent[toName] || [];
                toParent = toParent[toName];	
            }
            toParent.splice(toIndex, 0, node);
        
            options.onChange(tree);
        },

        // Outsource: Normalize Manager

        getNormalizedChildGroups: function (node) {
			let groups = [];
			for(var prop in node) {
                let title = this.getChildGroupTitle(prop) || '';
                if (prop === this.propContains || title) {
                    groups.push({ title, prop, list: node[prop] });
                }
            }

            let hasChildren = !!groups.length;

            if (!hasChildren) {
                groups = [{prop: this.propContains, list: []}];
            }
        	return {groups, hasChildren};
        },

        getNormalizedMultiRow: function (node, parentPath) {
            let convertToMulti = !this.isMultiRow(node); 
            if (convertToMulti && !this.canBecomeMultiRow(node)) return false;
            
            let list = node[this.propMulti] || [node];
            let path = parentPath.add(this.propMulti);

            return { list, path, convertToMulti };
        }
    };
};

export const buildOptions = (defaults, props, components) => {
    let cx = classNames.bind(props.classes || {});
    return Object.assign(defaults, components, { cx }, props);
};