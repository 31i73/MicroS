/** Header: MicroS
	MicroS version 11.4 documentation.
*/
/** Namespace: Globals */

/** Function: MicroS.id

	Searches for an element by id.
	
	If found, a collection will be returned containing just the element with the specified id, otherwise an empty collection will be returned.

	Parameters:
	
		id - (string) The id to search for
		
	Examples:
	
		(code)
		<div id="logo">
			...
		</div>
		...
		
		<script>
			var logo=MicroS.id('logo');
			
			//make the logo pulse, once
			logo.animate({opacity:0},0.2).animate_next({opacity:1},3);
		</script>
		(end)
*/

MicroS.id=function(id){
  return new MicroS(document.getElementById(id));
}

/** Function: MicroS.search

	Searches for elements by tag and/or class name.

	Parameters:
	
		tag = null - (string | string[]; optional) Single or list of tags to filter by
		css_class = null - (string | string[]; optional) Single or list of css classes to filter by
		parent = MicroS.document - (<MicroS>; optional) The object to search within. Bu default the whole document is searched
		recurse = true - (boolean; optional) Search children nodes recursively?
		
	Examples:
	
		(code)
			//Make all `<a>` tags red
			MicroS.search('a').style({color:'#f00'});
		(end)
		(code)
			//Return all elements with classes `classA` or `classB`
			var elements = MicroS.search(null, ['classA', 'classB']);
		(end)
*/

MicroS.search=function(tag,css_class,parent,recurse){
	if(!(tag instanceof Array))tag=tag?[tag]:[];
	if(!(css_class instanceof Array))css_class=css_class?[css_class]:[];
	if(parent===undefined)parent=[document];
	if(recurse===undefined)recurse=true;
	
	if(recurse){
		var result=new MicroS;
		if(css_class.length&&document.querySelectorAll){
			if(!tag.length)tag=[''];
			var css='';
			for(var I1=0;I1<tag.length;I1++)for(var I2=0;I2<css_class.length;I2++)
				css+=(css.length?',':'')+tag[I1]+'.'+css_class[I2];
				
			for(var I=0,length=parent.length;I<length;I++)
				result.element=result.element.concat(this.collection_to_array(parent[I].querySelectorAll(css)));
			
			return result;
		}else{
			var search=new MicroS;
			
			if(tag.length){
				for(var I=0,length=parent.length;I<length;I++)for(var I2=0,length2=tag.length;I2<length2;I2++)
					search.element=search.element.concat(this.collection_to_array(parent[I].getElementsByTagName(tag[I2])));
			}else{
				for(var I=0,length=parent.length;I<length;I++)
					search.element=search.element.concat(this.collection_to_array(parent[I].getElementsByTagName('*')));
			}

			if(css_class.length){
				var class_match=new RegExp('\\b('+css_class.join('|')+')\\b');
				for(var I=0,length=search.element.length;I<length;I++){
					var item=search.element[I];
					if(item.className.match(class_match))
						result.element.push(item);
				}
				return result;
			}else
				return search;
		}
	}else{
		var result=new MicroS;
		
		var tag_match=tag.length?new RegExp('\\b('+tag.join('|').toUpperCase()+')\\b'):null;
		var class_match=css_class.length?new RegExp('\\b('+css_class.join('|')+')\\b'):null;
		
		for(var I=0,length=parent.length;I<length;I++){
			for(var element=parent[I].firstChild;element;element=element.nextSibling)
				if(
					(element.nodeType===1)&&
					(!tag_match||element.nodeName.match(tag_match))&&
					(!class_match||element.className.match(class_match))
				)
					result.element.push(element);
		}
		
		return result;
	}
}

/** Group: objects */

/**
	Variable: MicroS.body
		(<MicroS>) Collection containing the body element.
		
		(*null*) Before the page has loaded.
		
		To access this globally, do so within <MicroS.ready> to ensure the page has loaded and it is accessible.
		
	Variable: MicroS.cursor
		(number[2]; readonly) The position of the cursor in the document.
		
	Variable: MicroS.document
		(<MicroS>) Collection containing the document element.
		
		(*null*) Before the page has loaded.
		
		To access this globally, do so within <MicroS.ready> to ensure the page has loaded and it is accessible.
		
	Variable: MicroS.window
		(<MicroS>) Collection containing the window object.	
*/

/** Group: debug */

/** Function: MicroS.log

	Logs arguments to browser console if available.
*/

MicroS.log=function(){
	return (MicroS.log=
		console&&console.log?function(){console.log.apply(console,arguments);}:
		function(){}
	).apply(this,arguments);
}

/** Function: MicroS.assert

	Asserts case if development tools available.
	
	Otherwise ignored.
	
	Parameters:
	
		assert - (boolean) Assertion
		message - (string) Assertion message
		
	Examples:
	
		(code)
		MicroS.assert(value > minimum, 'Value above minimum');
		(end)
		
	See also:
		<MicroS.log>
*/

MicroS.assert=function(assert,message){
	return (MicroS.assert=
		console&&console.assert?function(){console.assert.apply(console,arguments);}:
		console&&console.error?function(assert,message){if(!assert)console.error('Assertion failed: '+message);}:
		console&&console.log?function(assert,message){if(!assert)console.log('Assertion failed: '+message);}:
		function(){}
	).apply(this,arguments);
}

if(!Array.prototype.indexOf){
	Array.prototype.indexOf=function(searchElement, fromIndex){
		for(var I=fromIndex||0;I<this.length;I++)
			if(this[I]==searchElement)
				return I;

		return -1;
	}
}

MicroS.is_array=function(object){
	return object.length!==undefined&&object.push!==undefined;
}

MicroS.yes=function(){return true;}
MicroS.no =function(){return false;}

/** Group: time management */

MicroS._time=function(){return +new Date/1000;}
/** Function: MicroS.time
	
	Gets or sets the current time, in seconds.
	
	Parameters:
	
		set - (number; optional) The current time to set
		
	Returns:
	
		(number) The current/new time
		*/
MicroS.time=function(set){
	if(set===undefined)
		return this._paused||(this._time()-this._time_start);
	else
		this._time_start=_time-set;
}

MicroS._frametime=null;
MicroS._frametime_delay=0;
MicroS._frametime_max=null;
MicroS._frametime_clear=false;

/** Function: MicroS.frametime
	
	Returns the current frametime, in seconds.
	
	The frametime is used to control the flow of animations.
	
	Frametime ideally updates at the same rate as <MicroS.time> (in seconds), but may be temporarily slowed by the animation system sometimes to ensure smooth playback on slower clients.
	
	It only updates between periods of executed code, so calling it repeatedly within the same block will always return the same time.
	
	See also:
	
		<MicroS.frametime_now>
*/
MicroS.frametime=function(){
	if(MicroS._frametime===null){
		MicroS._frametime=MicroS.frametime_now();
		if(MicroS._frametime_max!==null){
			if(MicroS._frametime>MicroS._frametime_max){
				MicroS._frametime_delay+=MicroS._frametime-MicroS._frametime_max;
				MicroS._frametime=MicroS._frametime_max;
			}
			MicroS._frametime_max=null;
		}
	}
	if(!MicroS._frametime_clear){
		MicroS.next(function(){MicroS._frametime=null;MicroS._frametime_clear=false;});
		MicroS._frametime_clear=true;
	}
	
	return MicroS._frametime;
}

/** Function: MicroS.frametime_now

	Returns the current frametime, in seconds, at the current moment.
	
	This is identical to <MicroS.frametime>, except it is accurate to the current moment, instead of only updating between executed code.
	
	Calling it repeatedly within the same block may return different (increasing) times.
	
	See also:
	
		<MicroS.frametime>
	
*/
MicroS.frametime_now=function(){
	return MicroS.time()-MicroS._frametime_delay;
}

MicroS._paused=null;
/** Function: MicroS.paused
	
	Gets or sets whether time is paused.
	
	Parameters:
	
		set - (boolean; optional) If different from the current paused state time will either be frozen at current, or resume from where it last was
		
	Returns:
	
		(boolean) The current/new paused state
		*/
MicroS.paused=function(set){if(!this._paused||!set)this._paused=set?_time():null;}

MicroS._time_start=MicroS._time();

/** Function: MicroS.next

	Run a function at the next available moment (when code executation ends).
	
	Parameters:
	
		action - (function) The function to call
		self - (object) The object to assign as *this*
		parameter - (object[]; optional) An array of parameters to pass the function
*/
MicroS.next=function(action, self, parameter){
	setTimeout(function(){
		action.apply(self,parameter?parameter:[]);
	},0);
}

/** Group: manipulation */

/** Function: MicroS.create

	Creates a new html element.
	
	Parameters:
		tag - (String) The tag type to create
		property - (object; optional) A collection of properties to assign as tag attributes and values
		inner - (string; optional) Inner html of element
		
	Returns:
		(<MicroS>) Collection containing the newly created element
		*/
MicroS.create=function(tag, property, inner){
	var child=document.createElement(tag);
	if(property!==undefined)for(name in property)switch(name){
		case 'class':
			child.className=property[name];
		break;
		case 'style':
			child.style.cssText=property[name];
		break;
		default:
			child[name]=property[name];
	}
	if(inner!==undefined)
		child.innerHTML=inner;
		
	return new MicroS(child);
};
/** Function: MicroS.create_overlay

	Creates and inserts a new div element that covers the whole page.
	
	Returns:
		(Micros) Collection containing the new element
		
	Example:
		(code)
			//create a darkened overlay over the entire page
			var overlay = MicroS.create_overlay().style({background:'#000',opacity:0.4});
			
			//create a popup & place it above the overlay
			var popup = MicroS.body.create('div',{'class':'popup'},'<p>Overlay message!</p>').make_topmost();
		(end)
		
*/
MicroS.create_overlay=function(){
	return MicroS.body.create('div',{style:'position:absolute;top:0;left:0;width:100%;height:100%'}).make_topmost();
};

MicroS._image_size_cache=[];
MicroS._image_load=[];
/** Function: MicroS.image_load

	Preload an image.
	
	Parameters:
	
		path - (string) The image url to load

*/
MicroS.image_load=function(path){
	var image=new Image;
	var element=new MicroS(image);
	element.listen('load',function(){
		var image=this.element[0];
		MicroS._image_size_cache[path]=[image.naturalWidth||image.width,image.naturalHeight||image.height];
	});
	image.removeAttribute('width');
	image.removeAttribute('height');
	image.src=path;
	MicroS._image_load.push(image);
}

/** Group: events */

MicroS._drag=[];
MicroS._drag_start=[0,0];
MicroS._drag_active=false;
/** Function: MicroS.drag

	Set which element(s) are currently being dragged.
	
	When called all dragging of existing elements will first be ended.
	
	Parameters:
	
		set - (<MicroS> | null) The new elements to commence dragging.
		active = true - (boolean; optional) If true the drag is started immediately, and all movement of the cursor will move the element(s).
			If false the drag will not commence until the cursor has moved a set distance from it's starting position, as with native operating system drags.
			
	See also:
	
		<MicroS.drag>
*/
MicroS.drag=function(set,active){
	for(var I=0;I<MicroS._drag.length;I++)
		MicroS._drag[I].element.trigger('dragstop');
	MicroS._drag=[];
	MicroS._drag_start=MicroS.cursor;
	MicroS._drag_active=active===null||active;
	MicroS.id('_MicroS_drag_overlay').remove();
	if(set){
		var allow=true;
		if(MicroS._drag_active){
			if(!set.trigger('dragstart'))
				allow=false;
		}
		if (allow) {
			var parent=set.parent();
			var top=set.style('top');
			var left=set.style('left');
			var position=set.position();
			var container_position=parent.position(true);
			var container_size=[parent.element[0].clientWidth,parent.element[0].clientHeight];
			
			for(var I=0;I<set.element.length;I++)(function(){
				var element=set.element[I];
				var offset=[parseInt(left[I])||0,parseInt(top[I])||0];
				var min=[offset[0]-(position[I][0]-container_position[I][0]),offset[1]-(position[I][1]-container_position[I][1])];
				
				MicroS._drag.push({
					element:new MicroS(element),
					x:offset[0]-MicroS.cursor[0],
					y:offset[1]-MicroS.cursor[1],
					x_min:min[0],
					y_min:min[1],
					x_max:min[0]+container_size[0]-element.clientWidth,
					y_max:min[1]+container_size[1]-element.clientHeight
				});
			})();
			MicroS.document.trigger('mousemove');
		}	
	}
}

MicroS._event_layout=[];
/** Function: MicroS.layout

	Triggers the window to fire the "layout" event & run all callbacks.
	
	An alias for
	
	(code)
	MicroS.window.trigger('layout');
	(end)
	
	See also:
	
		<MicroS.listen>
*/
MicroS.layout=function(){
	MicroS.window.trigger('layout');
}

/** Function: MicroS.ready

	Executes a function once the page has finished loading, or immediately if it has passed.
	
	An alias for *MicroS.window.listen('ready', action)*
	
	Parameters:
		action - (function) Action to run
		
	Examples:
		(code)
		MicroS.ready(function(){
		
			...
			MicroS.search(null,'draggable').make_draggable();
			...
			
		});
		(end)
*/

MicroS.ready=function(action){
	MicroS.window.listen('ready',action);
}

/**	Class: MicroS
	
	A collection of elements

	Constructor: MicroS
	
		Creates a new MicroS collection containing the specified elements.
		
		All methods, which do not state otherwise, return a reference to themselves to allow method chaining.
		
		Parameters:
			list - (HTMLElement | HTMLElement[]; Optional) Element or list of elements
			
		Example:
		
			(code)
				<form name="login">
					<input name="user" type="text" />
					...
				</form>
				
				<script>
					var user = new MicroS(document.forms.login.user);
				</script>
			(end)
			(code)
				//Create a collection from all the images in the doc
				var element = new MicroS(document.images);
			(end)
*/
function MicroS(list){
	this.element=list?MicroS.is_array(list)?list:[list]:[];
}

MicroS.prototype={
	/** Group: collection */
	
	/** Method: range
	
		Returns a subrange of elements.
	
		Parameters:
			start - (number) The index of the first element to return
			length - (number; optional) The maximum number of elements to return. If omitted all remaining elements are returned
	*/
	range:function(start, length){
		return new MicroS(this.element.slice(start,length!==undefined?start+length:undefined));
	},
	
	/** Method: order_shuffle
	
		Returns the collection of elements, randomly shuffled.
		
		Usefull for animating collections of elements in random order
		
		Example:
		
			(code)
			var shuffled = list.order_shuffle();
			(end)
		
	*/
	order_shuffle:function(){
		var length=this.element.length;
		for(var I=0;I<length;I++){
			var index=Math.floor(Math.random()*length);
			var temp=this.element[I];
			this.element[I]=this.element[index];
			this.element[index]=temp;
		}
		return this;
	},
	
	/** Group: manipulation */
	
	/** Method: attribute
	
		Gets or sets the html attributes of a collection.
		
		Parameters:
		
			name - (string) The attribute name to get/set
			value - (optional) The value to assign
			
		Returns:
		
			If no value is specified returns a (string[]) containing the attribute value of each element
	*/
	attribute:function(name, value){
		if(value!==undefined){
			for(var I=0;I<this.element.length;I++) {
				var element=this.element[I];

				if(!name.match(/href|src|style/)&&(name in element||element[name]!==undefined))
					element[name]=value;
				else{
					if(value==null)
						element.removeAttribute(name);
					else
						element.setAttribute(name,''+value);
				}
			}
			return this;
		}else{
			var result=[];
			for(var I=0;I<this.element.length;I++){
				var element=this.element[I];
				result.push(element.getAttribute(name));
			}
			return result;
		}
	},
	
	/** Method: create
	
		Creates a new html element and inserts into each element as a child.
		
		All parameters are passed on to MicroS.create.

		Example:
			(code)
			var toolbar = MicroS.body.create('div', {class:'toolbar'}, 'This is a toolbar. <a href="#top">Top</a>');
			(end)
			
		See also:
			<MicroS.create>
			
			<MicroS.insert>
	*/
	create:function(tag, property, inner){
		return this.insert(MicroS.create(tag,property,inner));
	},
	
	/** Method: content
	
		Sets the inner content of all elements.
		
		This can either be used on normal html elements to set their inner text (note that any special characters will automatically be escaped), or on form elements to set their value (in the case of a <select> it will search for a matching <option> to select, or spawn a new if one is not found).
		
		Parameters:
		
			content - (string) Text content to set
		
		See also:
		
			<MicroS.html>
	*/
	content:function(content){
		var html=content.replace(/&/g,"&").replace(/</g,"<").replace(/>/g,">");
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			switch(element.tagName) {
				case 'INPUT':
					element.value=content;
				break;
				case 'SELECT':
					for(var I=0;I<element.options.length;I++)
						if(element.options[I].value==content)break;

					if(I==element.options.length)
						new MicroS(element).create('option',{value:content},content);

					element.selectedIndex=I;
				break;
				default:
					element.innerHTML=html;
			}
		}
		return this;
	},
	
	/** Function: duplicate

		Returns a duplicate of every element with an optional different tag type.
		
		Parameters:
		
			tag - (string; optional) An optional tag name to set on the new elements
			
		Returns:
		
			(Micros) Collection containing the new element(s)
			
		See also:
		
			<MicroS.insert>
	*/
	duplicate:function(tag){
		if(tag)tag=tag.toUpperCase();
		
		var result=new MicroS();
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			if(!tag||tag==element.tagName)
				result.element.push(element.cloneNode(true));
			else{
				var newelement=document.createElement(tag);
				for(var I=0;I<element.attributes.length;I++)newelement.setAttribute(element.attributes[I].name,element.attributes[I].value);
				for(var I=0;I<element.childNodes.length;I++)newelement.appendChild(element.childNodes[I]);
				result.element.push(newelement);
			}
		}
		
		return result;
	},

	
	/** Method: html
	
		Sets the inner html of all elements.
		
		Parameters:
		
			content - (string) Html content to set
			
		Seel also:
		
			<MicroS.content>
	*/
	html:function(html){
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			element.innerHTML=html;
		}
		return this;
	},
	
	/** Method: insert
	
		Inserts children into each element as a child elements.
		
		Parameters:
			children - (<MicroS>) Child elements to insert
			
		Returns:
			(<MicroS>) inserted child elements
	*/
	insert:function(children){
		var element=this.element[0];
		for(var I=0;I<children.element.length;I++)
			element.appendChild(children.element[I]);
		return children;
	},
	/** Method: insert_before
		
		Inserts children before the element.
		
		This <MicroS> Collection must contain at least 1 element. If it contains more only the first will be used.
		
		Parameters:
			children - (<MicroS>) Child elements to insert
			
		Returns:
			(<MicroS>) inserted child elements
	*/
	insert_before:function(children){
		var element=this.element[0];
		var parent=element.parentNode;
		for(var I=0;I<children.element.length;I++)
			parent.insertBefore(children.element[I],element);
		return children;
	},
	/** Method: remove
	
		Removes elements from their parents (and the page if present).
		
		Elements may be re-inserted with <MicroS.insert>.
		
		See also:
			<MicroS.insert>
	*/
	remove:function(){
		this.stop();
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			element.parentNode.removeChild(element);
		}
		return this;
	},
	
	/** Method: position
	
		Return the screen position of every element.
		
		Parameters:
			content=false - Return the screen position of the content area (area inside the borders)
		
		Returns:
			(number[2][]) An array of *number[2]* coordinates. One entry for each element
	*/
	position:function(content){
		var result=[];
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			var coord=content?[element.clientLeft,element.clientTop]:[0,0];
			do{
				coord[0]+=element.offsetLeft;
				coord[1]+=element.offsetTop;
			}while(element=element.offsetParent);
			result.push(coord);
		}
		return result;
	},
	
	/** Method: style
	
		Sets or retrieves current css styling.
		
		Parameters:
		
			Set - (string|object) If a string is specified, an array is returned containing the css value of that named property for each element.
				If an object is specified it's properties are used to assign css values.
			
		Examples:
			(code)
				var size = MicroS.search('p').style('font-size');
				
				// size[0] - (string) font size of first <p> tag
				// size[1] - (string) font size of second <p> tag
				// etc..
			(end)
			(code)
				//Select the element with id `menu` & set the opacity & border on it
				MicroS.id('menu').style({
					border: '3px solid #aaa',
					opacity: 0.5,
				});
			(end)
	
	*/
	style:function(set){
		if(typeof set==='string'){
			var result=[];
			for(var I=0,length=this.element.length;I<length;I++){
				var element=this.element[I];
				var get=set;
				switch(get){
					case 'float':
						if(typeof element.style.styleFloat!=='undefined')
							get='styleFloat';
						else
							get='cssFloat';
					break;
				}
				var value=element.style[get];
				if(!value||value==='auto'){
					if(document.defaultView&&document.defaultView.getComputedStyle){
						var css=document.defaultView.getComputedStyle(element,null);
						value=css?css[get]:null;
						if(value==='auto')value=0;
					}else if(element.currentStyle){
						value=element.currentStyle[get];
						if(value==='auto')//for margin left & right
							value=set==='zIndex'?0:'0px';
						else if(isNaN(value)&&set==='opacity')
							value=1;
						else if(set!=='zIndex'&&(value+'').match(/^-?\d/)&&!(value+'').match(/^-?\d+\.?\d*(px)?$/i)){
							//Dean Edwards method
							var left_old = element.style.left;
							var runtime_left_old=element.runtimeStyle.left;

								element.runtimeStyle.left=element.currentStyle.left;
								element.style.left=get==='fontSize'?'1em':(value||0);
								value=element.style.pixelLeft+'px';

							element.style.left=left_old;
							element.runtimeStyle.left=runtime_left_old;
						}
					}
				}
				if(value==parseInt(value))
					value=parseInt(value);
				result.push(value);
			}
			return result;
		}else{
			var css_transition=MicroS.browser.support.css_transition();
			for(var I=0,length=this.element.length;I<length;I++){
				var element=this.element[I];
				if(element._micros_css_transition){
					element.style[css_transition+'-property']='none';
					element._micros_css_transition=false;
				}
				for(var property in set){
					var value=set[property];
					switch(property){
						case 'x':
							property='left';
							MicroS._style_set(element,'transform',null);
						break;
						case 'y':
							property='top';
							MicroS._style_set(element,'transform',null);
						break;
					}
					MicroS._style_set(element,property,value);
				}
			}
		}
		return this;
	},
	
	/** Method: snuggle
	
		Snuggle an element around others (in a wrapper-fashion).
	
		The element will be sized to contain each target exactly, & the targets will be set to stretch, should the elements be enlarged.
		
		This must be called using a collection of 1 or more elements.
		
		If more than one element is in the collection only the first will be used. This element will be duplicated for each target item.
		
		Note that this is called on the new, outer element you wish to use, with the elements to surround as the parameter; While <MicroS.wrap> is the reverse.
		
		Parameters:
			target_list - (<MicroS>) The target element(s) to snuggle
			
		Examples:
			(code)
			var target = MicroS.search(null,'item'); //target is a collection of the items we are going to snuggle
			MicroS.create('div',{'class':'wrapper'}).snuggle(target); //every target is now wrapped in a <div class="wrapper">
			(end)
			
		See also:
			<MicroS.wrap>
	*/
	snuggle:function(target_list){
		var position=target_list.style('position');
		var css_float=target_list.style('float');
		var top_left=[target_list.style('left'),target_list.style('top')];

		var element_list=[this.element[0]];for(var I=1;I<target_list.length;I++)element_list.push(element_list[0].cloneNode());

		for(var I=0;I<target_list.element.length;I++){
			var target=target_list.element[I];
			var parent=new MicroS(target.parentNode);
			var element=element_list[I];
			var top_left=null;

			switch(position[I1]){
				case 'relative':
				case 'absolute':
					break;
				default:
					top_left=[0][I]=null;
			}

			element.style.position=position[I];

			MicroS._style_set(element,'float',css_float[I]);

			if(top_left[0][I1]!==null){
				element.style.left=top_left[0][I];
				element.style.top=top_left[1][I];
			}
			element.style.width=target.offsetWidth+'px';
			element.style.height=target.offsetHeight+'px';
			parent.insertBefore(element,target);
			element.appendChild(target);
			target.style.width='100%';
			target.style.height='100%';
		}
		return this;
	},
	/** Method: wrap
	
		Wrap each element within a new parent element.
		
		Note that this is called on the element(s) you are wrapping, with the new elements to go around them as the parameter; While <MicroS.snuggle> is the reverse.
	
		Parameters:
			tag - (string | <MicroS>) Either the tag type, which is passed to <MicroS.create>, or a collection of 1 or more elements (only the first is used), that will be duplicated to wrap each target
			property - (object; optional) If the first property is a string, then this is passed as the second parameter to <MicroS.create>, and contains the element properties
			
		Returns:
			(<MicroS>) The newly created outer elements
			
		Examples:
			(code)
			var target = MicroS.search(null,'item'); //target is a collection of the items we are going to wrap
			target.wrap('div',{'class':'wrapper'}); //every target is now wrapped in a <div class="wrapper">
			(end)
			
		See also:
			<MicroS.snuggle>
			
			<MicroS.create>
	*/
	wrap:function(tag, property){
		var result=new MicroS();
		for(var I=0;I<this.element.length;I++) {
			var element=this.element[I];
			var wrapper=typeof tag==='string'?MicroS.create(tag, property).element[0]:tag.element[0].cloneNode();

			if(element.parentNode)
				element.parentNode.replaceChild(wrapper, element);

			wrapper.appendChild(element);
			result.element.push(wrapper);
		}
		return result;
	},
	/** Method: visible
	
		Sets the visibility of the elements, or returns an array marking which elements are visible.
		
		Paramenters:
		
			set - (boolean; optional) If specified all elements have their visibility set to this state
			space = false - (boolean; optional) If hiding the element(s), should they continue to take up space in the document?
			
		Returns:
		
			(<MicroS>) If *set* is specified returns the list of elements once again.
			
			(bool[]) If *set* is not specified returns a boolean array marking which elements are visible.
			
		Examples:
			(code)
				var visible = MicroS.id('list').child('li').is_visible();
				
				// visible[0] - (boolean) marking whether the first <li> tag is visible
				// visible[1] - (boolean) marking whether the second...
				// etc...
			(end)
	*/
	visible:function(set, space){
		var style_display=this.style('display');
		var style_visibility=this.style('visibility');
		if(set===undefined){
			var result=[];
			for(var I=0,length=style_display.length;I<length;I++)
				result.push(style_display[I]!=='none'&&style_visibility[I]!=='hidden');
			return result;
		}if(set){
			var style_float=this.style('float');
			for(var I=0,length=this.element.length;I<length;I++){
				var style=this.element[I].style;
				if(style_display[I]==='none')
					style.display=style._display?style._display:style.display==='none'?'':(style_float[I]==='left'||style_float[I]==='right'?'inline':'block');
				if(style_visibility[I]==='hidden') 
					style.visibility='visible';
			}
		}else
			for(var I=0,length=this.element.length;I<length;I++){
				if(space)
					this.element[I].style.visibility='hidden';
				else if(style_display[I]!=='none'){
					var style=this.element[I].style;
					style._display=style_display[I];
					style.display='none';
				}
			}
		return this;
	},
	/** Method: visible_toggle
	
		Toggles the visibility on all elements (reversing their current state).
	*/
	visible_toggle:function(){
		var style_display=this.style('display');
		for(var I=0,length=this.element.length;I<length;I++){
			var style=this.element[I].style;
			if(style_display[I]==='none')
				style.display=style._display?style._display:'';
			else{
				style._display=style_display[I];
				style.display='none';
			}
		}
		return this;
	},
	
	/** Method: drag
	
		Begin dragging the element(s) with the pointer.
		
		The drag will automatically abort when the mouse button is released, so this is usually triggered as a result of a mousedown event.
		
		Parameters:
		
			active = true - (boolean; optional) If true the drag is started immediately, and all movement of the cursor will move the element(s).
				If false the drag will not commence until the cursor has moved a set distance from it's starting position, as with native operating system drags.
	*/
	drag:function(active){
		MicroS.drag(this, active);
		return this;
	},
	
	/** Method: drag_reposition
	
		Reposition a element(s) that are currently being dragged.
		
		Call this function after changing the position or parent of dragging element(s) to allow continued dragging from that position, rather than them snapping back into place.
	*/
	drag_reposition:function(){
		for(var I=0;I<MicroS._drag.length;I++){
			var drag=MicroS._drag[I];
			
			var match=false;
			for(var I2=0;I2<this.element.length;I2++)
				if(this.element[I2]===drag.element.element[0]){
					match=true;
					break;
				}
				
			if(match){
				var parent=drag.element.parent();
				var top=drag.element.style('top')[0];
				var left=drag.element.style('left')[0];
				var position=drag.element.position()[0];
				var container_position=parent.position()[0];
				var container_size=[parent.element[0].offsetWidth,parent.element[0].offsetHeight];
			
				var element=drag.element.element[0];
				var offset=[parseInt(left)||0,parseInt(top)||0];
				var min=[offset[0]-(position[0]-container_position[0]),offset[1]-(position[1]-container_position[1])];
				
				drag.x=offset[0]-MicroS.cursor[0];
				drag.y=offset[1]-MicroS.cursor[1];
				drag.x_min=min[0];
				drag.y_min=min[1];
				drag.x_max=min[0]+container_size[0]-element.clientWidth;
				drag.y_max=min[1]+container_size[1]-element.clientHeight;
			}
		}
			
		return this;
	},
	
	/** Method: each
	
		Runs the specified function for each element
	
		Parameters:
		
			action - (function) The callback function to call.
			self - (object; optional) If specified, becomes the *this* reference in the function, and the element is passed in as the first parameter; Otherwise the element is *this*.
	*/
	each:function(action, self){
		if(self!==undefined)
			for(var I=0;I<this.element.length;I++)
				action.apply(self,[new MicroS(this.element[I])]);
		else
			for(var I=0;I<this.element.length;I++)
				action.apply(new MicroS(this.element[I]));
	},
	
	/** Method: make_draggable
	
		Allow an element to be draggable by the mouse.
	
		This will also manage depth order (dragged objects will be brought to the foreground) and bounds (objects will be constrained within their parent bounds).
		
		Parameters:
		
			cursor = false - (boolean; optional) If specified as true the mouse cursor will change to a "movement" cursor when hovering over the element
			target = this - (<MicroS>; optional) The element that will actually be dragged. This is normally either left on the default value of *this* or, if you wish the current element to simply be the drag handle, passed the parent element whom you wish to be moved
			
		See also:
		
			<MicroS.drag>
	*/
	make_draggable:function(cursor, target){
		var self=this;
		
		if(target)target=target.range(0,1);
		if(cursor)this.style({cursor:'move'});

		for(var I=0;I<this.element.length;I++)(function(){
			var element=new MicroS(self.element[I]);
			var element_target=target?target:element;
			element
				.make_unselectable()
				.listen('mousedown',function(event){
					element_target.make_draggable.start=element_target.position()[0];
					element_target.drag(false);
					switch(element_target.style('position')[0]){
						case 'absolute':
						case 'relative':
						case 'fixed':
						break;
						default:
							element_target.element[0].style.left=element_target.element[0].style.top='0px';
							element_target.element[0].style.position='relative';
					}
					element_target.make_topmost();
					event.stop();
				})
			;
		})();
		return this;
	},
	
	/** Method: make_sortable
	
		Make a collection of elements "sortable".
		
		When applied to a collection of elements they can now be dragged about to rearrange vertically within their parent object.
		
		Note that this only works with completely vertical lists. It will not work if any of the elements or elements siblings are absolute positioned, floating side-by-side, or inline.
	
		Properties:
		
			cursor = false - (boolean; optional) If specified as true the mouse cursor will change to a “movement” cursor when hovering over the sortable elements
			
		Examples:
		
			(code)
				<ul id="list">
					<li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
					<li>Maecenas adipiscing auctor nunc, in sollicitudin mauris consectetur vitae.</li>
					<li>Nulla aliquam faucibus turpis, et volutpat augue aliquam ac.</li>
					<li>Sed a mauris quam, sit amet hendrerit leo.</li>
					<li>Cras convallis mattis lorem, quis malesuada dui dictum ac.</li>
				</ul>
				
				<script>
					// Make every single child of <ul id="list"> sortable
					// They can now be dragged about.
					MicroS.id('list').child().make_sortable();
				</script>
			(end)
			
		See also:
		
			<MicroS.make_draggable>
	*/
	make_sortable:function(cursor){
		var self=this;
		this
			.style({position:'relative'})
			.make_draggable(cursor)
			.listen('dragstop',function(){
				this
					.style({
						left: null,
						top: null
					})
				;
					
			})
			.listen('dragmove',function(){
				var y=this.position()[0][1];
				var element=this.element[0];
				var prev=element;do{prev=prev.previousSibling;}while(prev&&prev.nodeType!==1);
				var next=element;do{next=next.nextSibling;}while(next&&next.nodeType!==1);
				var slide=false;
				if(prev){
					prev_element=new MicroS(prev);
					if(y<prev_element.position()[0][1]+prev.offsetHeight/2-1){
						new MicroS(prev).insert_before(this);
						this.style({top:parseFloat(this.style('top')[0])+(y-this.position()[0][1])+'px'});
						slide=true;
					}
				}
				if(!slide&&next){
					next_element=new MicroS(next);
					if(y+element.offsetHeight/2>next_element.position()[0][1]+1){
						this.insert_before(new MicroS(next));
						this.style({top:parseFloat(this.style('top')[0])-(this.position()[0][1]-y)+'px'});
						slide=true;
					}
				}
				if(slide)
					this.drag_reposition();
			})
		;

		return this;
	},
	
	/** Method: make_topmost
	
		Moves this element above all other sibling objects (in z-order)
	*/
	make_topmost:function(){
		for(var I=0;I<this.element.length;I++){
			var element=this.range(I,1);
			var parent=element.parent();
			var sibling_list=parent.child();
			var sibling_zindex=sibling_list.style('zIndex');
			parent.style({zIndex:parent.style('zIndex')[0]||0});
			var zindex_max=0;
			for(var I=0;I<sibling_zindex.length;I++){
				var sibling=sibling_list.element[I];
				if(sibling!=element.element[0]&&!sibling.id.match(/^_MicroS_/))
					zindex_max=Math.max(zindex_max,sibling_zindex[I]||0);
			}
			element.style({zIndex:zindex_max+1});
		}
		return this;
	},
	
	/** Method: make_unselectable
	
		Makes the elements "unselectable" by the browser.
	
		Disables the browser from initialising drag actions used to select text and images, when clicking & dragging on the element.
	*/
	make_unselectable:function(){
		this
			.listen(['mousedown','selectstart'],function(event){
				event.stop(false,true);
			})
		;
		return this;
	},

	/** Method: class_add
	
		Adds the class to all elements (if not already present).
		
		Parameters:
		
			name - (string) class name to add
	*/
	class_add:function(name){
		var find=new RegExp('\\b'+name+'\\b');
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			if(!element.className.match(find))
				element.className+=' '+name;
		}
		return this;
	},
	/** Method: class_has
	
		Check which elements contain the specified class.
		
		Parameters:
		
			name - (string) class name to check
			
		Returns:
		
			(boolean[]) - An array marking which elements contain the specified class name
	*/
	class_has:function(name){
		var result=[];
		var find=new RegExp('\\b'+name+'\\b');
		for(var I=0;I<this.element.length;I++)
			result.push(!!this.element[I].className.match(find));

		return result;
	},
	/** Method: class_remove
	
		Removes the class from all elements.

		Parameters:
		
			name - (string) class name to remove
	*/
	class_remove:function(name){
		var find=new RegExp(' *\\b'+name+'\\b');
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			element.className=element.className.replace(find,'');
		}
		return this;
	},
	
	/** Group: transversal */
	
	/** Method: and
	
		Returns a new collection of elements with the extra included.
		
		Parameters:
			extra - (<MicroS>) The extra collection to include
			
		Example:
		(code)
		var a = MicroS.search(null,'groupa');
		var b = MicroS.search(null,'groupb');
		var both = a.and(b);
		(end)
	*/
	and:function(extra){
		return new MicroS(this.element.concat(extra.element));
	},
	
	/** Method: child
	
		Returns child elements. Optionally with the specified tag and/or class.
		
		If filtering parameters are specified only immediate children that match the search will be returned.
		
		Parmaeters:
		
		tag - (string;optional) Tag to filter for
		css_class - (string; optional) Class to filter for
	*/
	child:function(tag, css_class){
		if(tag||css_class)
			return MicroS.search(tag,css_class,this.element,false)
		else{
			var list=new MicroS();
			
			for(var I=0;I<this.element.length;I++){
				for(var element=this.element[I].firstChild;element;element=element.nextSibling)
					if(element.nodeType===1)list.element.push(element);
			}
			
			return list;
		}
	},
	
	/** Method: parent
	
		Returns parent elements.
		
		If filtering parameters are specified only parents that match the search will be returned.
		
		In the case of non-matches grandparents etc will be searched instead. The first match will be counted
		
		Parameters:
		
			tag - (string; optional) Tag to filter by
			css_class - (string; optional) Css class to filter by
			
		
		Toggles the visibility on all elements (reversing their current state)
	*/
	parent:function(tag,css_class){
		if(tag)tag=tag.toUpperCase();
		if(css_class)css_class=new RegExp('\\b'+css_class+'\\b');
		
		var list=new MicroS();
		for(var I=0,length=this.element.length;I<length;I++){
			var parent=this.element[I];
			do{
				parent=parent.parentNode;
			}while(parent&&(
				(tag&&parent.nodeName!=tag)||
				(css_class&&!parent.className.match(css_class))
			))
			if(parent)list.element.push(parent);
		}
		
		return list;
	},
	
	/** Method: sibling_next
		Returns the next sibling of each element
	*/
	sibling_next:function(){
		var list=new MicroS();
		
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			do{element=element.nextSibling;}while(element&&element.nodeType!==1);
			if(element)list.element.push(element);
		}
			
		return list;
	},
	
	/** Method: sibling_prev
		Returns the previous sibling of each element
	*/
	sibling_prev:function(){
		var list=new MicroS();
		
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			do{element=element.previousSibling;}while(element&&element.nodeType!==1);
			if(element)list.element.push(element);
		}
			
		return list;
	},
	
	/** Method: search
	
		Searches all child elements by tag and/or class name.

		Parameters:
		
			tag = null - (string | string[]; optional) Single or list of tags to filter by
			css_class = null - (string | string[]; optional) Single or list of css classes to filter by
			
		Examples:
		
			(code)
				//Search the element with id "menu" and mark all `<a>` tags red
				MicroS.id('menu').search('a').style({color:'#f00'});
			(end)
			
		See also:
		
			<MicroS.search>
	*/
	search:function(tag,css_class){
		return MicroS.search(tag,css_class,this.element,true);
	},
	
	/** Method: filter
	
		Filter current collection by tag and/or class name.

		Parameters:
		
			tag = null - (string; optional) Tag name to filter by
			css_class = null - (string | string[]; optional) Single or list of css classes to filter by
			
		Examples:
		
			(code)
				//Select all <a> tags
				var list = MicroS.search('a');
				
				//make them all red
				list.style({color:'#f00'});
				
				//from that set select just the ones with the css class "external" & change the cursor on them
				list.filter(null,'external').style({cursor:'help'});
			(end)
			
		See also:
		
			<MicroS.search>
	*/
	filter:function(tag,css_class){
		if(tag)tag=tag.toUpperCase();
		if(css_class)css_class=new RegExp('\\b'+css_class+'\\b');
		
		var list=new MicroS();
		for(var I=0,length=this.element.length;I<length;I++){
			var element=this.element[I];
			
			if(
				(!tag||element.nodeName===tag)&&
				(!css_class||element.className.match(css_class))
			)
				list.element.push(element);
		}
		
		return list;
	},

	/** Group: animation */

	/** Method: animate
	
		Animates the css properties of all elements
		
		Parameters:
		
		set - (object) A structure containing the css properties to change, and the values to animate to.
			For values in 'px' units the units can be dropped and the value supplied as just a number.
			Hyphenated properties should be written in camelCase (background-color as backgroundColor).
			
		time - (number) The time this should take to animate
		
		ease_out = true - (boolean; optional) Whether to slowly accelerate as the animation begins
		
		ease_in = true - (boolean; optional) Whether to slowly decellerate as the animation ends (or abrubtly stop)
		
		delay - (number; optional) If specified, the animation will be applied to all elements, in sequence, wawiting this amount of time before animating the next element
		
		options - (object; optional) An object containing extra options:
		
		Options:
		
		index_from - (number) Used for specifying a subset of elements to animate.
			This specifies the first element index in that range.
			
		index_to - (number) Used for specifying a subset of elements to animate.
			This specifies the index *after* the last element in that range
			(such that index_from<=index<index_to).
			
		time_start - (number) Specifies the time the animation should start.
			The time must be current or in the future.
			If omitted the animation begins now.
			
		skippable = false - (boolean) If true the animation will be allowed to "skip" if client rendering performance is low, otherwise MicroS will temporarily slow <MicroS.frametime> and subsequently all animations to ensure smoother playback.
		
		css_transition = false - (boolean; *experimental*) If true and supported by the browser css transitions will be used. This will offer better performance on supporting cpu-restricted devices such as mobile devices. This feature is still experimental, varys across browser and does exhibit several bugs. Browser-test and cross-reference against <MicroS.browser> before enabling, to ensure known behaviour.
		
		Example:
			(code)
			MicroS.id('itemlist')
				.child()
				.animate(
					{ //indent the text & set the colour to red
						color: '#f00',
						textIndent: 10
					},
					0.5, //animate over half a second
					false,true, //start moving instantly, then slow down as the animation completes
					0.25 //wait a quarter of a second between animating each element in succession
				)
			;
			(end)
			
		See also:
			<MicroS.animate_next>
			
			<MicroS.delay>

			<MicroS.style>
		*/
	animate:function(set, time, ease_out, ease_in, delay, options){
		var self=this;
		var now=MicroS.frametime();
		
		if(ease_out==null)ease_out=true;
		if(ease_in ==null)ease_in=true;
		
		if(options==null)options={};
		var time_clear=true;//options.time_start==null;
		if(options.time_start==null)options.time_start=now;
		if(options.index_from==null)options.index_from=0;
		if(options.index_to  ==null)options.index_to=this.element.length;
		
		if(delay){
			var from=options.index_from;
			var to=options.index_to;
			for(var I=from;I<to;I++){
				options.index_from=I;
				options.index_to=I+1;
				this.animate(set,time,ease_out,ease_in,0,options);
				options.time_start+=delay;
			}
		}else{
			var css_transition_real=MicroS.browser.support.css_transition();
			var css_transition=options.css_transition?css_transition_real:false;
			var css_transform=css_transition?MicroS.browser.support.css_transform():false;
			if(
				options.time_start>now&&
				!(css_transition&&(options.index_to-options.index_from==1)&&!this.element[options.index_from]._micros_animation_count)
			){
				var index_from=options.index_from;
				var index_to  =options.index_to;
				var time_start=options.time_start;
				for(var I=index_from;I<index_to;I++){
					var element=this.element[I];
					if(css_transition&&!element._micros_animation_count){
						options.index_from=I;
						options.index_to  =I+1;
						options.time_start=time_start+delay*I;
						this.animate(set,time,ease_out,ease_in,0,options);
					}else{
						var delay=Math.max(time_start-MicroS.frametime(),0);

						if(element._micros_timeout==undefined)
							element._micros_timeout=[];
							
						var element_options={};for(var property in options)element_options[property]=options[property];

						(function(group){
							element._micros_timeout.push(setTimeout(function(){
								element_options.index_from=0;
								element_options.index_to  =1;
								group.animate(set,time,ease_out,ease_in,0,element_options);
							},delay*1000));
						})(new MicroS(element));

						element._micros_animation_end=time_clear?time_start+time:Math.max(element._micros_animation_end||0,time_start+time);
					}
				}
			}else{
			
				var animation=new MicroS.Animation(time,options.time_start,options.skippable);
				
				if(ease_in){
					if(ease_out)
						animation.formula=function(x){return x*x*(3-2*x);}
					else
						animation.formula=function(x){return 1-((1-x)*(1-x));}
				}else if(ease_out)
					animation.formula=function(x){return x*x;}
				if(css_transition){
					var time_real_delay=options.time_start-MicroS.frametime_now();
					for(var I=options.index_from; I<options.index_to; I++){
						var element=this.element[I];
						element.style[css_transition+'-property']='all';
						element.style[css_transition+'-duration']=time+'s';
						element.style[css_transition+'-delay']=time_real_delay+'s';
						element.style[css_transition+'-timing-function']=ease_in ? ease_out ? 'ease-in-out':'ease-in':ease_out ? 'ease-out':'linear';
					}
				}
				var transform=[null, null];
				if(css_transform){
					for(var property in set){
						var value=set[property];
						switch(property){
						case 'x':
							transform[0]=parseFloat(value);
							break;
						case 'y':
							transform[1]=parseFloat(value);
							break;
						}
					}
					if(transform[0]!==null||transform[1]!==null){
						var position=this.position();
						for(var I=options.index_from; I<options.index_to; I++){
							var element=this.element[I];
							if(transform[0]!==null)transform[0]=transform[0] - position[I][0];
							if(transform[1]!==null)transform[1]=transform[1] - position[I][1];
							element.style[css_transform]='translate3d('+(transform[0]||0)+'px,'+(transform[1]||0)+'px,0)';
						}
					}
				}
				for(var property in set){
					var value=set[property];
					var value_numerical=false;
					var unit;
					switch(property){
						case 'x':
							if(css_transform)
								continue;
							else
								property='left';
						break;
						case 'y':
							if(css_transform)
								continue;
							else
								property='top';
						break;
					}
					if(css_transition){
						switch(property){
							case 'zIndex':
							case 'opacity':
							break;
							default:
								if(typeof(value)==='number')
									value+='px';
						}
						for(var I=options.index_from;I<options.index_to;I++)
							this.element[I].style[property] = value;
					} else {
						switch(property){
							case 'zIndex':
							case 'opacity':
								unit='';
								value=parseFloat(value);
								value_numerical=true;
							break;
							default:
								var colour;
								if(typeof value==='number'){
									value=Math.round(value);
									unit='px';
									value_numerical=true;
								}else if(colour=MicroS._style_colour(value)){
									unit='#';
									value=colour;
								}else{
									var match=value.match(/^-?\d+(?:\.\d*)?(.*)/);
									if(match){
										unit=match[1];
										value=parseFloat(value);
										if(unit==='px')value=Math.round(value);
										value_numerical=true;
									}else
										unit='';
								}
							break;	
						}
						
						var current_list=this.style(property);
						for(var I=options.index_from;I<options.index_to;I++){
							var current=current_list[I];
							var element=this.element[I];

							if(element._micros_css_transition){
								element.style[css_transition_real+'-property']='none';
								element._micros_css_transition=false;
							}

							if(value_numerical){
								if(value_numerical)current=parseFloat(current);
								if(current!=value){
									switch (property) {
										case 'top':
										case 'left':
										case 'bottom':
										case 'right':
											animation.moving = true;
									}
									animation.property.push({
										element:element,
										style:element.style,
										property:property,
										offset:current,
										delta:value-current,
										unit:unit
									});
								}
							}else if(unit==='#'){
								current=MicroS._style_colour(current)||[255,255,255];
								animation.property.push({
									element:element,
									style:element.style,
									property:property,
									offset:current,
									delta:[value[0]-current[0],value[1]-current[1],value[2]-current[2]],
									unit:unit
								});
							}
						}
					}
				}
				if(animation.property.length){
					for(var I=options.index_from;I<options.index_to;I++)
						animation.add(this.element[I],time_clear);
				
					MicroS._animation.push(animation);
				}else{
					for(var I=options.index_from;I<options.index_to;I++){
						var element=this.element[I];
						element._micros_animation_end=time_clear?options.time_start+time:Math.max(element._micros_animation_end||0,options.time_start+time);
						element._micros_animation_count=(element._micros_animation_count||0)+1;

						if(element._micros_timeout==undefined)element._micros_timeout = [];
						(function(item){
							element._micros_timeout.push(setTimeout(function(){
								item._micros_animation_count--;
								MicroS.event_tick.apply(MicroS);
							},Math.max((options.time_start+time)-now,0)*1000));
						})(new MicroS(element));
					}
				}
				MicroS.event_tick.apply(MicroS);
				if(css_transition){
					for(var I=options.index_from;I<options.index_to;I++)
						self.element[I]._micros_css_transition=true;
				}
			}
		}
		return this;
	},
	/** Method: animate_next
	
		Performs the specified animation once all current animations and delays have completed.
		
		See also:
			<MicroS.animate>
			
			<MicroS.next>
	*/
	animate_next:function(set, time, ease_out, ease_in, delay, options){
		if(delay==null)delay=0;

		if(options==null)options={};
		var index_from=options.index_from==null?0:options.index_from;
		var index_to=options.index_to==null?this.element.length:options.index_to;

		for(var I=index_from;I<index_to;I++){
			var element=this.element[I];
			var time_end=MicroS.frametime()+Math.max((element._micros_animation_end||0)-MicroS.frametime(),0);
			options.index_from=I;
			options.index_to=I+1;
			options.time_start=time_end+delay*(I-index_from);
			this.animate(set,time,ease_out,ease_in,0,options);
		}
			
		return this;
	},
	/** Method: delay
	
		Pauses for the specified number of seconds after all current animations and delays have completed
		
		(For inserting delays between animations)
		
		Parameters:
			delay - (number) Delay in seconds
			
		Examples:
			(code)
			//Select the element with id `target`,
			// animate the left margin to 20px,
			// pause for 1 second,
			// then animate it to 0px
			MicroS.id('target')
				.animate({marginLeft:20},1)
				.delay(1)
				.animate_next({marginLeft:0},1)
			;
			(end)
			
		See also:
			<MicroS.animate_next>
	*/
	delay:function(delay){
		if(delay)for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			element._micros_animation_end=Math.max((element._micros_animation_end||0),MicroS.frametime())+delay;
		}
		return this;
	},
	
	/** Method: next
	
		Calls the specified function on each element once all animations and delays have completed.
		
		When executed *this* is a <MicroS> collection containing just the specific element.
		
		Parameters:
		
			action (function) function to call
			All extra parameters are passed to the action function
			
		Example:
		
			(code)
				<style>
					.clickeffect{
						position: absolute;
						width: ..
						height: ..
						background: ..
						...
					}
				</style>
				
				<script>
					// When the user clicks on the page
					//  spawn a <div class="clickeffect">
					//  under the cursor
					//  animate it fading out, floating upwards
					//  then remove it
					MicroS.document.listen('mousedown',function(event){	
						MicroS.body.create('div',{class:'clickeffect'})
							.style({left:event.cursor[0]+'px',top:event.cursor[1]+'px'})
							.animate({top:event.cursor[1]-50,opacity:0},1,false,true)
							.next(function(){this.remove();})
						;
					});
				</script>
			(end)
	*/
	next:function(action){
		var now = MicroS.frametime();
		var action_arguments=Array.prototype.slice.call(arguments);action_arguments.shift();
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			var group=new MicroS(element);
			
			if(group.is_animating()){
				if(element._micros_next==undefined)
					element._micros_next=[];
				(function(group){
					element._micros_next.push({
						time:element._micros_animation_end||0,
						action:function(){action.apply(group,action_arguments);}
					});
				})(group);
				MicroS._next.push({//push a next event incase it's delay()ed & there's no Animation::next()
					time:element._micros_animation_end||0,
					element:element
				});
			}else(function(){
				var group=new MicroS(element);
				MicroS.next(function(){action.apply(group,action_arguments);});
			})();
		}
		MicroS.event_tick.apply(MicroS);
		return this;
	},
	
	/** Method: stop
	
		Stops all animations and delays.
	*/
	stop:function(){
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			if(element._micros_animation!==undefined){
				while(element._micros_animation.length)
					element._micros_animation[0].remove(element);
			}
			if(element._micros_timeout!==undefined){
				for(var I2=0;I2<element._micros_timeout.length;I2++)
					clearTimeout(element._micros_timeout[I2]);
				element._micros_timeout=[];
			}
			if(element._micros_css_transition&&(css_transition=MicroS.browser.support.css_transition())){
				element.style[css_transition+'-property']='none';
				element._micros_css_transition=false;
			}
			element._micros_animation_end=0;
			element._micros_animation_count=0;
			element._micros_animation_moving=0;
			element._micros_next=[];
		}
		return this;
	},
	/** Method: fade_in
	
		Fade element(s) in over a period of time.
		
		Parameters:
			time - (number) The time the fade-in should take
			delay=0 - (number) The delay between fading out each item
		
		Examples:
			(code)
			//fade each li in, in succession, taking 1 second, with 0.1 seconds between each one
			MicroS.search('ul','list').child().fade_in(1,0.1);
			(end)
			
		See also:
			<MicroS.fade_out>
	*/
	fade_in:function(/** number */time, /** number */delay)/** MicroS */{
		var style_display=this.style('display');
		var style_visibility=this.style('visibility');
		for(var I=0,length=this.element.length;I<length;I++){
			var style=this.element[I].style;
			if(style_display[I]==='none'||style_visibility[I]==='hidden')
				MicroS._style_set(this.element[I],'opacity',0);
		}
		
		this
			.visible(true)
			.animate({opacity:1},time,false,false,delay,{skippable:true})
		;
		
		return this;
	},
	/** Method: fade_out
	
		Fade element(s) out over a period of time.
		
		Parameters:
			time - (number) The time the fade-in should take
			delay=0 - (number) The delay between fading out each item
		
		Examples:
			(code)
			//fade each li out, in succession, taking 1 second, with 0.1 seconds between each one
			MicroS.search('ul','list').child().fade_out(1,0.1);
			(end)
			
		See also:
			<MicroS.fade_in>
	*/
	fade_out:function(/** number */time, /** number */delay)/** MicroS */{
		this
			.animate({opacity:0},time,false,false,delay,{skippable:true})
			.next(function(){this
				.visible(false)
				.style({opacity:1});
			});
		return this;
	},
	/** Method: is_animating
	
		Returns whether any of the elements are currently animating (or involved in a delay during it's animation sequence).
		
		Returns:
			(boolean) Whether any of the elements are currently animating
			
		See also:
		
			<MicroS.is_moving>
	*/
	is_animating:function(){
		var time=MicroS.frametime();
		for(var I=0;I<this.element.length;I++){
			if((this.element[I]._micros_animation_end||0)>time)
				return true;
		}
		return false;
	},
	
	/** Method: is_moving
	
		Returns whether any of the elements are currently moving (if it's top, bottom, left or right properties are animating).
		
		Returns:
			(boolean) Whether any of the elements are currently moving
			
		See also:
		
			<MicroS.is_animating>
	*/
	is_moving:function(){
		for(var I = 0;I<this.element.length;I++){
			if(this.element[I]._micros_animation_moving)
				return true;
		}
		return false;
	},
	
	/** Group: events */
	
	/** Method: listen
	
		Listen and respond to element events.
		
		MicroS supports all the standard Javascript DOM events. It also offers the following extra events..
	
		Extra events:
		
			ready - Fired by *MicroS.window* when the dom has finished loading.
				The callback will fire immediately if this moment has already passed.
			layout - Fired by <MicroS.window> when a content re-layout is required (Either the window is resized, or <MicroS.layout> is called).
				Used for performing javascript-based content layout.
				When assigned, this event will fire immediately & run all callbacks.
			dragstart - Fires when dragging commences on an element. This default action may be canceled within the event handler with <MicroS.Event.Stop>.
			dragstop - Fires when dragging ends on an element.
			mouseenter - Fires when the mouse cursor moves over an element; But, unlike mouseover, does not also refire when you unhover a child element.
			mouseleave - Fires when the mouse cursor moves out from an element; But, unlike mouseout, does not also fire when you hover a child element.
	
		Parameters:
			
			event - (string | string[]) The name of the event, or events to respond to
			callback - (function) The callback function to call. An <MicroS.Event> is passed as the first parameter
			parameter - (optional) A second parameter to pass the callback function
			
		Examples:
		
			(code)

			<div id="logo">
				...
			</div>
			
			<script>
				var logo=MicroS.id('logo');
				
				//Fade out and then smoothly fade in the logo when the mouse clicks and releases on it
				logo
					.listen('mousedown',function(event){
						logo.style({opacity:0.5});
					})
					.listen('mouseup',function(event){
						logo.animate({opacity:1},1,false,false);
					})
				;
			</script>
			(end)
			
		See also:
			<MicroS.trigger>
	*/
	listen:function(event,callback,parameter){
		if(!(event instanceof Array))
			event=[event];
			
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			switch(element.nodeType){
				case 3:
				case 8:
				break;
				default:
					for(var I2=0;I2<event.length;I2++)(function(event){
						var element_wrapper=new MicroS(element);
						var callback_wrapper=function(event){
							var event_object=new MicroS.Event(event);
							callback.apply(element_wrapper,[event_object,parameter]);
							return event_object.allow_default;
						};
						if(!element._micros_event)element._micros_event={};
						element._micros_event[event]=(element._micros_event[event]||[]).concat(callback_wrapper);

						if(event==='ready'&&element===window){
							if(MicroS.is_ready)
								MicroS.next(callback_wrapper);
						}else if(event==='layout'&&element===window){
							MicroS.layout();
						}else{			
							if(!MicroS.browser.ie&&(match=event.match(/^mouse(enter|leave)$/))){
								event='mouse'+{enter:'over',leave:'out'}[match[1]];
								var wrapper = callback_wrapper;
								callback_wrapper=function(event){
									var parent=event.relatedTarget;
									while (parent&&parent!=element)try{
										parent=parent.parentNode;
									}catch(e){
										parent=element;
									}
									if(parent!==element)wrapper(event);
								}
							}
							if(element.addEventListener)
								element.addEventListener(event,callback_wrapper,false);
							else if(element.attachEvent)
								element.attachEvent('on'+event,callback_wrapper);
							if(event==='submit'){
								var old=element.onsubmit||MicroS.yes;
								element.onsubmit=function(){var result=callback_wrapper();result&=old();return result;}
							}
						}
					})(event[I2]);
			}
		}
		return this;
	},
	
	/** Method: trigger
	
		Manually trigger element events.
		
		This will call any event listeners instated through <MicroS.listen> or assignment of the "on[event]" attributes.
		
		Parameters:
			event - (string) The event name to trigger
			
		See also:
			<MicroS.listen>
	*/
	trigger:function(event){
		var result=true;
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			var onevent=element['on'+event];if(onevent){
				if(!onevent.apply(element))result=false;
			}
			if(element._micros_event){
				var list = element._micros_event[event];
				if (list) for (var I = 0; I < list.length; I++)
				if (!list[I]()) result = false;
			}
		}
		return result;
	}
};

MicroS.cursor=[0,0];

MicroS.window=new MicroS(window);
MicroS.document=null;
MicroS.body=null;

MicroS._animation=[];
MicroS._next=[];

MicroS._element_next=function(element){
	var next=element._micros_next;
	if(next!==undefined){
		var time=MicroS.frametime();
		
		if(next.length&&next[0].time<=time&&element._micros_css_transition&&(css_transition=MicroS.browser.support.css_transition())){
			element.style[css_transition+'-property']='none';
			element._micros_css_transition=false;
		}
		while(next.length&&next[0].time<=time)
			next.shift().action();
	}
}

MicroS._style_set=function(element,property,value){
	var style=element.style;
	if(style[property]!==value)switch(property){
		case 'opacity':
			style[property]=value;
			if(MicroS.browser.ie<=8){
				style.zoom=value===null?null:1;
				style.filter=value===null||value>=1?null:'alpha(opacity='+Math.round(value*100)+')';
			}
		break;
		case 'float':
			if(typeof style.styleFloat!=='undefined')
				style.styleFloat=value;
			else
				style.cssFloat=value;
		break;
		case 'transform':
			if(property=MicroS.browser.support.css_transform())
				style[property]=value!=null?value:'';
		break;
		case 'transition':
			if(property=MicroS.browser.support.css_transition())
				style[property]=value!=null?value:'';
		break;
		case 'left':
		case 'top':
			element._micros_position=undefined;
		default:
			style[property]=value!=null?value:'';
		break;
	}
}

MicroS._style_colour=function(value){
	var test;
	if(test=value.match(/^rgb\((\d+), ?(\d+), ?(\d+)\)/i))
		return [parseInt(test[1]),parseInt(test[2]),parseInt(test[3])];
	else if(test=value.match(/^#([0-9a-f]{3})$/i)){
		test=test[1];
		return [parseInt(test.charAt(0),16)*17,parseInt(test.charAt(1),16)*17,parseInt(test.charAt(2),16)*17];
	}else if(test=value.match(/^#([0-9a-f]{6})$/i)){
		test=test[1];
		return [parseInt(test.substr(0,2),16),parseInt(test.substr(2,2),16),parseInt(test.substr(4,2),16)];
	}
}

MicroS.event_tick=function(){
	clearTimeout(this._event_tick);
	
	var delay=null;
	var delay_animation=0.01;
	var time=this.frametime();
	var smooth=false;

	for(var I=0;I<this._animation.length;I++){
		var animation=this._animation[I];
		var time_in=time-animation.time_start;
		if(time_in<0){
			delay=-time_in;
			break;
		}else{
			phase=animation.formula(Math.min(time_in/animation.time_length,1));
			for(var I2=0;I2<animation.property.length;I2++){
				var property=animation.property[I2];
				switch(property.unit){
					case '#':
						value='rgb('+Math.round(property.offset[0]+phase*property.delta[0])+','+Math.round(property.offset[1]+phase*property.delta[1])+','+Math.round(property.offset[2]+phase*property.delta[2])+')';
					break;
					case 'px':
						value=Math.round(property.offset+phase*property.delta)+property.unit;//NOTE:OPTIMISATION:round to encourage matching. speeds up _style_set
					break;
					default:
						value=property.offset+phase*property.delta+property.unit;
				}
				this._style_set(property.element,property.property,value);
			}

			if(phase<1){
				delay=delay_animation;
				if(animation.smooth)smooth=true;
			}else{
				animation.remove();
				this._animation.splice(I--,1);
				animation.next();
			}
		}
	}
	
	for(var I=0;I<this._next.length;I++){
		var next=this._next[I];
		if(time>=next.time){
			this._element_next(next.element);
			this._next.splice(I--,1);
		}else
			delay=Math.min(delay,next.time-time);
	}
	
	if(delay!==null){
		if(smooth&&delay<=0.1)
			this._frametime_max=time+0.1;

		if(window.mozRequestAnimationFrame&&delay<=delay_animation)
			window.mozRequestAnimationFrame()
		else
			this._event_tick=setTimeout(function(){MicroS.event_tick.apply(MicroS);},delay*1000);
	}
}

/** @description Internal method for converting dom collections to arrays */
MicroS.collection_to_array=function(collection){
	var result=[];
	if(collection)for(var I=0;I<collection.length;I++)result.push(collection[I]);
	return result;
}