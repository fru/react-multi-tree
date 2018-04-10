import React from 'react';

class Path {
	constructor(path) {
		this._path = path ? path.slice() : [];
    }
    
	add(segment) {
		return this._path.concat(Array.isArray(segment) ? segment: [segment]);
    }

    clone(transform) {
        transform = transform || (x => x);
        return new Path(transform(this._path));
    }

    _differentPrefix(prefix, lengthChecked) {
        for(var i = 0; i < lengthChecked; i++) {
            if (this._path[i] !== prefix[i]) return true;
        }
    }

    recalculateAfterDetach (detached) {
        var index = detached.length - 1;
        if (this._differentPrefix(detached, index)) return this;
        if (this._path[index] < detached[index]) return this;
        return this.clone(path => { path[index]--; return path; });
    }
}

export const buildDefaultOptions = () => {

    return {

        // Defaults

        containsProp: 'contains',
        multiProp: 'multi',
        onChange: (modified) => {},
        
        node: function (node) {
            let active = node.active;
            
			return <div className={this.cx('node', {active})}>
				<span className={this.cx('handler')}>::</span>
				{node.title}
			</div>;
		},

        // Helper

        beginDrag: ({ options, path, list, index }) => ({item: list[index], path}),
        Path: Path,

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
            options.onDrop(tree, item.path.segments, recalc.segments, options, item.item);
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

        canDrop: function(tree, from, to, options) {
            // Check from -> to and to -> from
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