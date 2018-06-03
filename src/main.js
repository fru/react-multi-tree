import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragSource, DropTarget } from 'react-dnd';
import { defaultOptions, getContext } from './options';

const NodeList = ({ path, ...context }) => {

	let { Target, Node, cx, indent, indentUnit } = context.options;
	context.marginLeft = (added) => (added + path.getDepth()) * indent + indentUnit;
	if (context.isMultiNode) context.marginLeft = () => 0;
	
	let content = [<Target {...context} index={0} path={path.setIndex(0)} key={0} />];

	for (var i = 0; i < context.list.length; i++) {
		let key = context.options.normalizationHelper.getId(context.list[i]);
		content.push(<Node   {...context} index={i}   path={path.setIndex(i)}   key={'node_' + key} />);
		content.push(<Target {...context} index={i+1} path={path.setIndex(i+1)} key={i+1} />);
	}

	let container = context.isMultiNode ? 'node-multi-container' : 'list-container-inner';
	return <div className={cx(container)}>{content}</div>;
};

// Children grouped by property, that may have a title

const NodeListChildGroups = ({ groups, path, marginLeft, ...context }) => groups.map((group) => {

	let titleClass = context.options.cx('group-container');
	let title = group.title && <div className={titleClass} style={{marginLeft: marginLeft(1)}}>{group.title}</div>
	let list = <NodeList {...context} group={group.prop} path={group.path} list={group.list} />

	return <div key={group.prop}>{title}{list}</div>
});

// Inner node container with event bindings

const NodeInner = ({ list, index, options, connect }) => {
	let { selected, down, up } = options.selectionManager.getNodeState(list[index], options);

	return connect(<div className={options.cx('node', {selected})} onMouseDown={down} onMouseUp={up}>
		{options.node(list[index])}
	</div>);
};

@DragSource('anyform-tree', {beginDrag: (p) => p.options.dragHelper.beginDrag(p)}, (connect, monitor) => ({
	connect: connect.dragSource(),
	isDragging: monitor.isDragging()
}))
class Node extends Component {
	render() {
		let { list, index, isMultiNode, isParentDragging, isDragging, options, connect, parentConnect } = this.props;
		if (isMultiNode) {
			return <NodeInner {...this.props} connect={list.length === 1 ? parentConnect : connect } />;
		}

		let pass = { ...this.props, isParentDragging: isParentDragging || isDragging, parentConnect: connect };

		let { groups, multi } = options.normalizationHelper.normalize(list[index], this.props.path);
		return <div>
			<div className={options.cx('node-anchor')} style={{marginLeft: this.props.marginLeft(0)}}>
				{ multi ? <NodeList {...pass} isMultiNode={true} {...multi} /> : <NodeInner {...pass}  /> }
			</div>
			<div className={options.cx('list-container')}>
				{ groups && <NodeListChildGroups {...pass} groups={groups} parent={list[index]} /> }
			</div>
		</div>;
	}
}

@DropTarget('anyform-tree', {drop: (p, m) => p.options.dragHelper.drop(p, m)}, (connect, monitor) => ({
	connect: connect.dropTarget(),
	isOver: monitor.isOver(),
	item: monitor.getItem()
}))
class Target extends Component {
	render() {
		let { options, item, isOver, path, marginLeft } = this.props;
		let visible = options.dragHelper.targetVisibleCached(this.props, isOver, item, options, path);
		let first = path.getLastSegment().getIndex() === 0;

		let target = <div className={options.cx('target', {visible, first})} style={{zIndex: path.getDepth() + 100}}>
			{isOver && <div className={options.cx('preview')}></div>}
		</div>;

		return <div className={options.cx('target-anchor', {visible})} style={{marginLeft: marginLeft(0)}}>
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
