import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragSource, DropTarget } from 'react-dnd';

import classNames from 'classnames/bind';

import styles from './theme/example.scss';

import { startsMultiRow, NodeListMultiRow, NodeListChildGroups, NodeListRoot } from './NodeList';
import { buildDefaultOptions } from './options';

@DragSource('anyform-tree', {beginDrag: (p) => p.options.beginDrag(p)}, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging()
}))
class Node extends Component {
	render() {
		let context = this.props; // TODO filter
		let { list, index, isMultiNode, parentDragging, isDragging, options } = this.props;

		let current = list[index];
		
		if (isMultiNode) {
			return this.props.connectDragSource(options.node(current));
		}

		let groups = options.containsNormalized(current);
		let row = startsMultiRow(current, options) 
			? <NodeListMultiRow {...context} row={current} />
			: this.props.connectDragSource(options.node(current));

		return <div>
			<div className={options.cx('node-anchor')}>{row}</div>
			<div className={options.cx('list-container')}>
				<NodeListChildGroups {...context} groups={groups} parentDragging={isDragging || parentDragging} />
			</div>
		</div>;
	}
}

function drop(props, monitor) {
	props.options.onDropUnnormalized(props.tree, props.path, props.options, monitor.getItem());
}

@DropTarget('anyform-tree', {drop}, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver(),
	dragging: monitor.getItem()
}))
class Target extends Component {
	render() {
		let { parentDragging, options, isOver, dragging, list, index } = this.props;

		let item = dragging && dragging.item;
		if (parentDragging || item === list[index-1] || item === list[index]) {
			dragging = false;
		}

		let target = <div className={options.cx('target', {dragging})}>
			{dragging && isOver && <div className={options.cx('preview')}></div>}
		</div>;

		return <div className={options.cx('target-anchor')}>
			{this.props.connectDropTarget(target)}
		</div>;
	}
}


@DragDropContext(HTML5Backend)
export class Tree extends Component {
	defaults = buildDefaultOptions();
	render() {
		let cx = classNames.bind(styles);
		let options = Object.assign(this.defaults, { Target, Node, styles, cx }, this.props);
		return <NodeListRoot list={this.props.nodes} options={options} />
	}
}
