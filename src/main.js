import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragSource, DropTarget } from 'react-dnd';
import { defaultOptions, getContext } from './options';

const NodeList = ({ path, ...context }) => {

	let { Target, Node, cx } = context.options;
	
	let content = [<Target {...context} index={0} path={path.add(0)} key={0} />];

	for (var i = 0; i < context.list.length; i++) {
		let key = context.options.getId(context.list[i]);
		content.push(<Node   {...context} index={i}   path={path.add(i)}   key={'node_' + key} />);
		content.push(<Target {...context} index={i+1} path={path.add(i+1)} key={i+1} />);
	}

	let container = context.isMultiNode ? 'node-multi-container' : 'list-container-inner';
	return <div className={cx(container)}>{content}</div>;
};

// Children grouped by property, that may have a title

const NodeListChildGroups = ({ groups, path, ...context }) => groups.map((group) => {

	let titleClass = context.options.cx('group-container');
	let title = group.title && <div className={titleClass}>{group.title}</div>
	let list = <NodeList {...context} path={group.path} list={group.list} />

	return <div key={group.prop}>{title}{list}</div>
});

class NodeInner extends Component {
	render() {
		let { list, index, options, connect } = this.props;
		let { selected, down, up } = options.selectionManager.getNodeState(list[index], options);

		return connect(<div className={options.cx('node', {selected})} onMouseDown={down} onMouseUp={up}>
			{options.node(list[index])}
		</div>);
	}
}

@DragSource('anyform-tree', {beginDrag: (p) => p.options.beginDrag(p)}, (connect, monitor) => ({
	connect: connect.dragSource(),
	isDragging: monitor.isDragging()
}))
class Node extends Component {
	render() {
		let { list, index, isMultiNode, isParentDragging, isDragging, options, connect } = this.props;
		
		if (isMultiNode) return <NodeInner {...this.props} />;

		let { groups, hasChildren } = options.getNormalizedChildGroups(list[index], this.props.path);
		let multi = options.getNormalizedMultiRow(list[index], this.props.path);

		let children = <div className={options.cx('list-container')}>
			<NodeListChildGroups {...this.props} groups={groups} isParentDragging={isDragging || isParentDragging} />
		</div>;

		// ERROR: One is rendered in node list, unconnected => isDragging is allways false, child drop active
		// TODO: Pass connect down into NodeList

		if (!hasChildren && multi) {
			return <div>
				<div className={options.cx('node-anchor')}>
					<NodeList {...this.props} isMultiNode={true} {...multi} />
				</div>
				{multi.list.length === 1 && children}
			</div>;
		}

		return <div>
			<div className={options.cx('node-anchor')}>
				<NodeInner {...this.props} />
			</div>
			{children}
		</div>;
	}
}

@DropTarget('anyform-tree', {drop: (p, m) => p.options.drop(p, m)}, (connect, monitor) => ({
	connect: connect.dropTarget(),
	isOver: monitor.isOver(),
	item: monitor.getItem()
}))
class Target extends Component {
	render() {
		let { isParentDragging, options, isOver, item, list, index, isMultiNode } = this.props;
		let dragging = item && options.targetActive(item.item, isParentDragging, list[index-1], list[index], isMultiNode);

		let target = <div className={options.cx('target', {dragging})}>
			{dragging && isOver && <div className={options.cx('preview')}></div>}
		</div>;

		return <div className={options.cx('target-anchor')}>
			{this.props.connect(target)}
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
		let context = getContext(this.defaults, this.props, {Target, Node}, this.props.nodes);
		
		return <div className={context.cx('anyform-tree')}>
			<NodeList options={context} list={this.props.nodes} path={new context.Path()} />
		</div>;
	}
}
