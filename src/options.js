import React from 'react';
import Path from './Path';
import SelectionManager from './SelectionManager';
import NormalizationHelper from './NormalizationHelper';
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

        // Transform

        onChange: function (modified) {},
        
        // Selection

        selected: [],
        selectedAllowMultiple: false,

        setSelected: function (selected) {
            this.selected = selected;
            $tree.setState({});
        },

        // Helper
        
        getChildGroupTitle: (property) => property,

        selectionManager: new SelectionManager(),
        normalizationHelper: new NormalizationHelper(),

        // Behaviour

        // TODO allow non function constants and iterate over nodes

        allowChildren: (parent, path, children, key) => true,
        allowMultiRow: (nodes, path) => true,

        // Check on hover if these node combinations are valid  

        validateChildrenDrop: (parent, path, children, key) => true,
        validateMultiRowDrop: (nodes, path) => true,

        // Outsource: DragManager

        beginDrag: ({ options, path, list, index, convertToMulti }) => ({
            item: list[index], 
            path: path.removeMultiWhenNotYetConverted(convertToMulti)
        }),
        drop: function ({path, options, convertToMulti}, monitor) {
            let item = monitor.getItem();
            let recalc = path.recalculateAfterDetach(item.path);
            options.onDrop(item.path.asArray(), recalc.asArray(), options, item.item, convertToMulti);
        },
        targetActive: function (item, parentDragging, before, after, isMultiNode) {
            if (parentDragging || item === before || item === after) {
                return false;
            } else if (isMultiNode && this.normalizationHelper.getChildren(item).hasChildren) {
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

        _normalizeMultiRow: function (tree, from, fromParent) {
            var type = from.pop();
            if (fromParent.length === 1 && type === this.propMulti) {
                var index = from.pop();
                var target = this._getPath(tree, from);
                target[index] = fromParent[0];
            }
        },

        // TODO use this instead of options parameter?
        
        onDrop: function (from, to, options, node, convertToMulti) {
            let tree = options._clone(options.root);
        
            var fromIndex = from.pop();
            var fromParent = options._getPath(tree, from);

            fromParent.splice(fromIndex, 1);
            options._normalizeMultiRow(tree, from.slice(), fromParent);

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
        }
    };
};

export const getContext = (defaults, props, components, root) => {
    let cx = classNames.bind(props.classes || {});
    // TODO use clever caching to only return a context when rendering is affected by property changes 
    // TODO include setSelected and cache as state
    let context = Object.assign(defaults, components, { cx }, props);
    context.root = root;
    context.normalizationHelper.options = context;
    return context;
};