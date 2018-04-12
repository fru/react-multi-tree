import React from 'react';

const NodeList = ({ wrapper, path, ...context }) => {

	let { Target, Node } = context.options;

	let content = [<Target {...context} index={0} path={path.add(0)} key={0} />];

	for (var i = 0; i < context.list.length; i++) {
		let key = context.list[i].id;
		content.push(<Node   {...context} index={i}   path={path.add(i)}   key={'node_' + key} />);
		content.push(<Target {...context} index={i+1} path={path.add(i+1)} key={i+1} />);
	}

	return <div className={wrapper}>{content}</div>;
}


// Helper to decide if single or multi row is used

export const startsMultiRow = (node, options) => {
	let multiProp = options.multiProp;
	return node[multiProp] && node[multiProp].length;
}


// Horrizontal collection of nodes in a single row

export const NodeListMultiRow = ({ row, path, ...context }) => {

	let multiProp = context.options.multiProp;
	context.wrapper = context.options.cx('node-multi-container');

	context.path = path.add(multiProp);
	context.list = row[multiProp];

	return <NodeList {...context} isMultiNode={true} />
}


// Children grouped by property, that may have a title

export const NodeListChildGroups = ({ groups, path, ...context }) => groups.map((group) => {

	let titleClass = context.options.cx('group-container');
	let title = group.title && <div className={titleClass}>{group.title}</div>
	let list = <NodeList {...context} 
		path={path.add(group.path)} isMultiNode={false} list={group.value}
		wrapper={context.options.cx('list-container-inner')} />

	return <div key={group.id}>{title}{list}</div>
})


// Initial simple root list

export const NodeListRoot = (props) => <NodeList {...props} path={new props.options.Path()} 
	tree={props.list} wrapper={props.options.cx('anyform-tree')} />;
