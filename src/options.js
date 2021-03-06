import React from 'react';
import Path from './Path';
import SelectionManager from './SelectionManager';
import NormalizationHelper from './NormalizationHelper';
import DragHelper from './DragHelper';
import classNames from 'classnames/bind';
import TransformHelper from './TransformHelper';


export const defaultOptions = ($tree) => {

    return {

        // Defaults

        indent: 24,
        indentUnit: 'px',
        indentLeft: function (path, added = 0) { 
            return {
                marginLeft: (added + path.getDepth()) * this.indent + this.indentUnit
            };
        },

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

        Path: Path,
        selectionManager: new SelectionManager(),
        normalizationHelper: new NormalizationHelper(),
        dragHelper: new DragHelper(),
        transformHelper: new TransformHelper(),

        // Behaviour
        
        allowChildren: function (parent, prop, path, children) {
            //console.log(parent, prop, path.asArray(), children);
            return true;
        },
        allowMultiRow: function (nodes, path, row) {
            //console.log(nodes, path.asArray(), row);
            return true;
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
    context.dragHelper.options = context;
    context.transformHelper.options = context;
    return context;
};