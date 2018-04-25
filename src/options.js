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

        beginDrag: ({ options, path, list, index }) => ({item: list[index], path}),
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
        
        onDropUnnormalized: function (tree, path, options, item) {
            var recalc = path.recalculateAfterDetach(item.path);
            options.onDrop(tree, item.path.asArray(), recalc.asArray(), options, item.item);
        },
        
        onDrop: function (tree, from, to, options, node) {
            tree = options.clone(tree);
        
            var fromIndex = from.pop();
            var fromParent = options.getPath(tree, from);
        
            fromParent.splice(fromIndex, 1);
        
            var toIndex = to.pop();
            var toName = to.pop();
            var toParent = options.getPath(tree, to);
            
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

        canContainMulti: function () {
            
        },

        transformContainMulti: function () {

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

        targetActive: function (dragging, parentDragging, before, after) {
            let item = dragging && dragging.item;
            return !parentDragging && item !== before && item !== after;
        },

        // Dont create list, use callback, allways return list
        
        containsNormalized: function (node) {
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