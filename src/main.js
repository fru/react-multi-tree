import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragSource, DropTarget } from 'react-dnd';

import classNames from 'classnames/bind';

import { startsMultiRow, NodeListMultiRow, NodeListChildGroups, NodeListRoot } from './NodeList';
import { buildDefaultOptions } from './options';


class NodeInner extends Component {
	render() {
		let { current, options, connectDragSource } = this.props;
		let { selected, down, up } = options.selectionManager.getNodeState(current, options);

		return connectDragSource(<div className={options.cx('node', {selected})} onMouseDown={down} onMouseUp={up}>
			{options.node(current)}
		</div>);
	}
}

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
			return <NodeInner current={current} {...this.props} />;
		}

		let groups = options.containsNormalized(current);
		let row = startsMultiRow(current, options) 
			? <NodeListMultiRow {...context} row={current} />
			: <NodeInner current={current} {...this.props} />;

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

		// TODO: make testable
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
	constructor (props) {
		super(props);
		this.defaults = buildDefaultOptions(this); 
	}
	render() {
		let cx = classNames.bind(this.props.classes || this.defaults.classes);
		let options = Object.assign(this.defaults, { Target, Node, cx }, this.props);
		return <NodeListRoot list={this.props.nodes} options={options} />
	}
}
