import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragSource, DropTarget } from 'react-dnd';
import { defaultOptions, buildOptions } from './options';

const NodeList = ({ wrapper, path, ...context }) => {

	let { Target, Node } = context.options;

	let content = [<Target {...context} index={0} path={path.add(0)} key={0} />];

	for (var i = 0; i < context.list.length; i++) {
		let key = context.options.getId(context.list[i]);
		content.push(<Node   {...context} index={i}   path={path.add(i)}   key={'node_' + key} />);
		content.push(<Target {...context} index={i+1} path={path.add(i+1)} key={i+1} />);
	}

	return <div className={wrapper}>{content}</div>;
};

// Children grouped by property, that may have a title

const NodeListChildGroups = ({ groups, path, ...context }) => groups.map((group) => {

	let titleClass = context.options.cx('group-container');
	let title = group.title && <div className={titleClass}>{group.title}</div>
	let list = <NodeList {...context} 
		path={path.add(group.prop)} isMultiNode={false} list={group.list}
		wrapper={context.options.cx('list-container-inner')} />

	return <div key={group.prop}>{title}{list}</div>
});

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
		let { list, index, isMultiNode, parentDragging, isDragging, options } = this.props;
		let current = list[index];
		
		if (isMultiNode) {
			return <NodeInner current={current} {...this.props} />;
		}

		let { groups, hasChildren } = options.getNormalizedChildGroups(current);
		let multi = options.getNormalizedMultiRow(current, this.props.path);

		let children = <div className={options.cx('list-container')}>
			<NodeListChildGroups {...this.props} groups={groups} parentDragging={isDragging || parentDragging} />
		</div>;

		// ERROR: One is rendered in node list, unconnected => isDragging is allways false, child drop active
		// TODO: Pass connect down into NodeList

		if (!hasChildren && multi) {
			return <div>
				<div className={options.cx('node-anchor')}>
					<NodeList {...this.props} isMultiNode={true} {...multi} wrapper={options.cx('node-multi-container')} />
				</div>
				{multi.list.length === 1 && children}
			</div>;
		}

		return <div>
			<div className={options.cx('node-anchor')}>
				<NodeInner current={current} {...this.props} />
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
		let { parentDragging, options, isOver, item, list, index, isMultiNode } = this.props;
		let dragging = item && options.targetActive(item.item, parentDragging, list[index-1], list[index], isMultiNode);

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
		let options = buildOptions(this.defaults, this.props, {Target, Node});
		return <NodeList options={options} wrapper={options.cx('anyform-tree')}
			tree={this.props.nodes} list={this.props.nodes} path={new options.Path()} />;
	}
}
