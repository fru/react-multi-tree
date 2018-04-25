import React from 'react';
import Path from './Path';
import SelectionManager from './SelectionManager';
import classNames from 'classnames/bind';

export const buildOptions = (defaults, props, components) => {
    let cx = classNames.bind(props.classes || defaults.classes);
    return Object.assign(defaults, components, { cx }, props);
};

export const defaultOptions = ($tree) => {

    return {

        // Defaults

        containsProp: 'contains',
        multiProp: 'multi',
        onChange: (modified) => {},
        
        node: function (node) {
			return <div> 
				<span className={this.cx('handler')}>::</span>
				{node.title}
			</div>;
		},

        // Helper

        beginDrag: ({ options, path, list, index, convertToMulti }) => ({
            item: list[index], 
            path: path.removeMultiWhenNotYetConverted(convertToMulti)
        }),
        drop: function ({tree, path, options, convertToMulti}, monitor) {
            let item = monitor.getItem();
            let recalc = path.recalculateAfterDetach(item.path);
            options.onDrop(tree, item.path.asArray(), recalc.asArray(), options, item.item, convertToMulti);
        },
        Path: Path,
        classes: {},

        // Id
        
        propId: 'id',
        getId: function (node) {
            return node[this.propId];
        },

        // Selection

        selected: [],
        setSelected: function (selected) {
            this.selected = selected;
            $tree.setState({});
        },
        isSelectionMulti: (e) => e.shiftKey,
        selectionManager: new SelectionManager(),

        // Modify tree

        getPath: function (context, path) {
            for (var i = 0; i < path.length; i++) {
                context = context[path[i]];
            }
            return context;
        },

        clone: function (context) {
            return JSON.parse(JSON.stringify(context));
        },
        
        onDrop: function (tree, from, to, options, node, convertToMulti) {
            tree = options.clone(tree);
        
            var fromIndex = from.pop();
            var fromParent = options.getPath(tree, from);
        
            fromParent.splice(fromIndex, 1);

            var toIndex = to.pop();
            var toName = to.pop();
            var toParent = options.getPath(tree, to);

            if (convertToMulti) {
                toParent = options.transformToMultiRow(toParent);
                var toReplaceIndex = to.pop();
                var toReplaceParent = options.getPath(tree, to);
                toReplaceParent[toReplaceIndex] = toParent; 
            }
            
            if (typeof toName !== 'undefined') {
                toParent[toName] = toParent[toName] || [];
                toParent = toParent[toName];	
            }
            toParent.splice(toIndex, 0, node);
        
            options.onChange(tree);
        },

        canDrop: function (tree, from, to) {
            
        },

        canDropMulti: function (tree, from, to, index) {
            
        },

        // Helper to decide if single or multi row is used

        isMultiRow: function (node) {
	        return node[this.multiProp] && node[this.multiProp].length;
        },
        
        canBecomeMultiRow: function (node) {
            return true;
        },

        getNormalizedMultiRow: function (node, parentPath) {
            let convertToMulti = !this.isMultiRow(node); 
            if (convertToMulti && !this.canBecomeMultiRow(node)) return false;
            
            let list = node[this.multiProp] || [node];
            let path = parentPath.add(this.multiProp);

            return { list, path, convertToMulti };
        },

        transformToMultiRow: function (node) {
            return {[this.multiProp]: [node]};
        },

        // Groups of child components

		containsGroupTitle: (id) => {
			return id.replace(/-/g, '\s');
        },
        
		containsId: function (key) {
            if (key === this.containsProp) return '';

            let prefix = this.containsProp + '-'
			if (key.indexOf(prefix) === 0) {
				return key.substring(prefix.length);
            }
			return false;
        },

        targetActive: function (item, parentDragging, before, after) {
            // TODO: item has children dont add to row
            return !parentDragging && item !== before && item !== after;
        },

        // Dont create list, use callback, allways return list
        
        getNormalizedGroups: function (node) {
			let results = [];
			for(var key in node) {
				let id = this.containsId(key);
				if (id !== false) results.push({
                    id, path: key, value: node[key] || [], 
                    title: this.containsGroupTitle(id)
				})
			}
        	return results;
        }
    };
}