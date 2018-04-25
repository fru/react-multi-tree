import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragSource, DropTarget } from 'react-dnd';
import { NodeList, NodeListChildGroups } from './NodeList';
import { defaultOptions, buildOptions } from './options';


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
		let { list, index, isMultiNode, parentDragging, isDragging, options, convertToMulti } = this.props;
		let current = list[index];
		
		if (isMultiNode) {
			return <NodeInner current={current} {...this.props} />;
		}

		let groups = options.getNormalizedGroups(current);

		let multiOptions = options.getNormalizedMultiRow(current, this.props.path);
		let multi = <NodeList {...this.props} isMultiNode={true} {...multiOptions}
			wrapper={options.cx('node-multi-container')} />

		return <div>
			<div className={options.cx('node-anchor')}>
				{multiOptions ? multi : <NodeInner current={current} {...this.props} />}
			</div>
			<div className={options.cx('list-container')}>
				<NodeListChildGroups {...this.props} groups={groups} parentDragging={isDragging || parentDragging} />
			</div>
		</div>;
	}
}

@DropTarget('anyform-tree', {drop: (p, m) => p.options.drop(p, m)}, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver(),
	item: monitor.getItem()
}))
class Target extends Component {
	render() {
		let { parentDragging, options, isOver, item, list, index } = this.props;
		let dragging = item && options.targetActive(item.item, parentDragging, list[index-1], list[index]);

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
		this.defaults = defaultOptions(this); 
	}
	render() {
		return <NodeList 
			options={buildOptions(this.defaults, this.props, {Target, Node})} 
			wrapper={props.options.cx('anyform-tree')} tree={this.props.nodes}
			list={this.props.nodes} path={new props.options.Path()} />;
	}
}
