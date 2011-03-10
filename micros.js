/*

	MicroS javascript library - Copyright 2010 31i73.com

	MicroS is openly licensed for your pleasure.
	See http://www.31i73.com/license/publiclibrary

*/

if(!Array.prototype.indexOf){
	/** @ignore */
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

/**
	Creates a new MicroS collection containing the specified elements.<br />
	<br />
	All methods, which do not state otherwise, return a reference to themselves to allow method chaining.
	@class MicroS element collection
	@param [list]
*/
function MicroS(/** HTMLElement[] */ list){
	this.element=list?MicroS.is_array(list)?list:[list]:[];
}

/** @ignore */
MicroS.yes=function(){return true;}
/** @ignore */
MicroS.no =function(){return false;}

MicroS.prototype={
	/** @description Returns a new collection of elements with the extra included
		@example
		* var a=MicroS.search(null,'groupa');
		* var b=MicroS.search(null,'groupb');
		* var both=a.and(b);
	*/
	and:function(/** MicroS */extra)/** MicroS */{
		return new MicroS(this.element.concat(extra.element));
	},
	
	/** @description Returns a slice of elements, starting at 'start' */
	range:function(start,length)/** MicroS */{
		return new MicroS(this.element.slice(start,length!==undefined?start+length:undefined));
	},
	
	/** @description Shuffles the order of the elements randomly. Usefull for animating collections of elements in random order */
	order_shuffle:function()/** MicroS */{
		var length=this.element.length;
		for(var I=0;I<length;I++){
			var index=Math.floor(Math.random()*length);
			var temp=this.element[I];
			this.element[I]=this.element[index];
			this.element[index]=temp;
		}
		return this;
	},
	
	/** @description Creates a new html element and inserts into each element as a child.<br />All parameters are passed on to MicroS.create.
		@example
		* MicroS.body.create('div', {class:'toolbar'}, 'This is a toolbar. &lt;a href="#top"&gt;Top&lt;/a&gt;');
		@see MicroS.create
		@see MicroS#insert
	*/
	create:function(tag, property, inner)/** MicroS */{
		return this.insert(MicroS.create(tag,property,inner));
	},
	
	/** @description Inserts children into each element as a child elements
		@returns {MicroS} children
	*/
	insert:function(/** MicroS */children)/** MicroS */{
		var element=this.element[0];
		for(var I=0;I<children.element.length;I++)
			element.appendChild(children.element[I]);
		return children;
	},
	/** @description Inserts children before the element
		@returns {MicroS} children
	*/
	insert_before:function(/** MicroS */children)/** MicroS */{
		var element=this.element[0];
		var parent=element.parentNode;
		for(var I=0;I<children.element.length;I++)
			parent.insertBefore(children.element[I],element);
		return children;
	},
	/** @description Removes elements from their parents (and the page if present). Elements may be re-inserted with <em>insert</em>
		@see MicroS#insert
	*/
	remove:function()/** MicroS */{
		this.stop();
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			element.parentNode.removeChild(element);
		}
		return this;
	},

	style:function(set)/** MicroS */{
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
	
	/** @description Fade element(s) in over a period of time.
		@example
		* MicroS.search('ul','list').child().fade_in(1,0.1); //fade each li in, in succession, taking 1 second, with 0.1 seconds between each one
		@param time The time the fade-in should take
		@param [delay=0] The delay between fading out each item
		@see MicroS#fade_out
	*/
	fade_in:function(/** number */time, /** number */delay)/** MicroS */{
		var style_display=this.style('display');
		var style_visibility=this.style('visible');
		for(var I=0,length=this.element.length;I<length;I++){
			var style=this.element[I].style;
			if(style_display[I]==='none'||style_visibility[I]==='hidden')
				MicroS._style_set(this.element[I],'opacity',0);
		}
		
		this
			.visible(true)
			.animate({opacity:1},time,false,false,delay,null,null,null,true)
		;
		
		return this;
	},
	/** @description Fade element(s) in out a period of time.
		@example
		* MicroS.search('ul','list').child().fade_out(1,0.1); //fade each li out, in succession, taking 1 second, with 0.1 seconds between each one
		@param time The time the fade-out should take
		@param [delay=0] The delay between fading out each item
		@see MicroS#fade_in
	*/
	fade_out:function(/** number */time, /** number */delay)/** MicroS */{
		this
			.animate({opacity:0},time,false,false,delay,null,null,null,true)
			.next(function(){this
				.visible(false)
				.style({opacity:1});
			});
		return this;
	},

	/** @description Return the screen position of every element.
		@param [content=false] Return the screen position of the content area (area inside the borders)
		@returns {number[2][]} An array of number[2] coordinates. One entry for each element.
	*/
	position:function(/** bool */content)/** number[2][] */{
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

	/** @description Snuggle an element around others (in a wrapper-fashion).<br />The element will be sized to contain eah target exactly, & the targets will be set to stretch, should the elements be enlarged.<br />This must be called using a collection of 1 or more elements.<br />If with more than one element is in the collection only the first will be used.<br />This element will be duplicated for each target item.
		@example
		* var target=MicroS.search(null,'item'); //target is a collection of the items we are going to 'snuggle'
		* MicroS.create('div',{class:'wrapper'}).snuggle(target); //every target is now wrapped in a <div class="wrapper">
		@see MicroS#wrap
	*/
	snuggle:function(/** MicroS */target_list)/** MicroS */{
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

	is_animating:function()/** bool */{
		var time=MicroS.frametime();
		for(var I=0;I<this.element.length;I++){
			if((this.element[I]._micros_animation_end||0)>time)
				return true;
		}
		return false;
	},
	is_moving:function()/** bool */{
		for(var I = 0;I<this.element.length;I++){
			if(this.element[I]._micros_animation_moving)
				return true;
		}
		return false;
	},

	/** @description Animates the css properties of all elements
		@set time_start
		@param set A structure containing the css properties to change, and the values to animate to.<br />Hyphenated properties should be written in camelCase (background-color as backgroundColor).
		@param time The time this should take to animate
		@param [ease_out=true] Whether to slowly accelerate as the animation begins
		@param [ease_in=true] Whether to slowly decellerate as the animation ends (or abrubtly stop)
		@param [delay=0] If specified, the animation will be applied to all elements, in sequence, wawiting this amount of time before animating the next element
		@param [index_from] Used for specifying a subset of elements to animate.<br />This specifies the first element index in that range.
		@param [index_to] Used for specifying a subset of elements to animate.<br />This specifies the index <em>after</em> the last element in that range<br />(such that index_from&lt;=index&lt;index_to).
		@param [time_start=MicroS.time()] Specifies the time the animation should start.<br />The time must be current or in the future.
		@example
		* MicroS.id('itemlist')
		* 	.child()
		* 	.animate(
		* 		{ //indent the text & set the colour to red
		* 			color: '#f00',
		* 			textIndent: '10px'
		* 		},
		* 		0.5, //animate over half a second
		* 		false,true, //start moving instantly, then slow down as the animation completes
		* 		0.25, //wait a quarter of a second between animating each element in succession
		* 	)
		* ;
	*/
	animate:function(/** cssproperty[] */set, /** number */time, /** bool */ease_out, /** bool */ease_in, /** number */delay, /** int */index_from, /** int */index_to, /** number */time_start, /** bool */skippable)/** MicroS */{
		var self=this;
		var now=MicroS.frametime();
		
		if(ease_out==null)ease_out=true;
		if(ease_in ==null)ease_in=true;
		
		if(time_start==null)time_start=now;
		if(index_from==null)index_from=0;
		if(index_to  ==null)index_to=this.element.length;
		
		if(delay){
			for(var I=index_from;I<index_to;I++){
				this.animate(set,time,ease_out,ease_in,0,I,I+1,time_start,skippable);
				time_start+=delay;
			}
		}else{
			var css_transition_real=MicroS.browser.support.css_transition();
			var css_transition=MicroS.animate_css()?css_transition_real:false;
			var css_transform=css_transition?MicroS.browser.support.css_transform():false;
			if(
				time_start>now&&
				!(css_transition&&(index_to-index_from==1)&&!this.element[index_from]._micros_animation_count)
			){
				for(var I=index_from;I<index_to;I++){
					var element=this.element[I];
					if(css_transition&&!element._micros_animation_count)
						this.animate(set,time,ease_out,ease_in,0,I,I+1,time_start+delay*I,skippable);
					else{
						var delay=Math.max(time_start-MicroS.frametime(),0);

						if(element._micros_timeout==undefined)
							element._micros_timeout=[];

						(function(group){
							element._micros_timeout.push(setTimeout(function(){
								group.animate(set,time,ease_out,ease_in,0,0,1,time_start,skippable);
							},delay*1000));
						})(new MicroS(element));

						element._micros_animation_end=Math.max(element._micros_animation_end||0,time_start+time);
					}
				}
			}else{
			
				var animation=new MicroS.Animation(time,time_start,skippable);
				
				if(ease_in){
					if(ease_out)
						/** @ignore */
						animation.formula=function(x){return x*x*(3-2*x);}
					else
						/** @ignore */
						animation.formula=function(x){return 1-((1-x)*(1-x));}
				}else if(ease_out)
					/** @ignore */
					animation.formula=function(x){return x*x;}
				if(css_transition){
					var time_real_delay=time_start-MicroS.frametime_now();
					for(var I=index_from; I<index_to; I++){
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
						for(var I=index_from; I<index_to; I++){
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
					for(var I=index_from;I<index_to;I++)
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
	
						}
						
						var current_list=this.style(property);
						for(var I=index_from;I<index_to;I++){
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
					for(var I=index_from;I<index_to;I++)
						animation.add(this.element[I]);
				
					MicroS._animation.push(animation);
				}else{
					for(var I=index_from;I<index_to;I++){
						var element=this.element[I];
						element._micros_animation_end=Math.max(element._micros_animation_end||0,time_start+time);
						element._micros_animation_count=(element._micros_animation_count||0)+1;

						if(element._micros_timeout==undefined)element._micros_timeout = [];
						/** @ignore */
						(function(item){
							element._micros_timeout.push(setTimeout(function(){
								item._micros_animation_count--;
								MicroS.event_tick.apply(MicroS);
							},Math.max((time_start+time)-now,0)*1000));
						})(new MicroS(element));
					}
				}
				MicroS.event_tick.apply(MicroS);
				if(css_transition){
					for(var I=index_from;I<index_to;I++)
						self.element[I]._micros_css_transition=true;
				}
			}
		}
		return this;
	},
	/** @description Performs the specified animation once all current animations and delays have completed
		@see MicroS#animate
	*/
	animate_next:function(/** cssproperty[] */set, /** number */time, /** bool */ease_out, /** bool */ease_in, /** number */delay, /** int */index_from, /** int */index_to, /** bool */skippable)/** MicroS */{
		if(index_from==null)index_from=0;
		if(index_to==null)index_to=this.element.length;
		if(delay==null)delay=0;

		for(var I=index_from;I<index_to;I++){
			var element=this.element[I];
			var time_end=MicroS.frametime()+Math.max((element._micros_animation_end||0)-MicroS.frametime(),0);
			this.animate(set,time,ease_out,ease_in,0,I,I+1,time_end+delay*(I-index_from),skippable);
		}
			
		return this;
	},
	/** @description Pauses for the specified number of seconds after all current animations and delays have completed<br />(For inserting delays between animations)
		@param delay Delay in seconds
	*/
	delay:function(/** number */delay)/** MicroS */{
		if(delay)for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			element._micros_animation_end=Math.max((element._micros_animation_end||0),MicroS.frametime())+delay;
		}
		return this;
	},
	
	/** @description Calls the specified function on each element once all animations and delays have completed */
	next:function(/** function */action)/** MicroS */{
		var now = MicroS.frametime();
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			var group=new MicroS(element);
			
			if(group.is_animating()){
				if(element._micros_next==undefined)
					element._micros_next=[];
				(function(group){
					element._micros_next.push({
						time:element._micros_animation_end||0,
						action:function(){action.apply(group);}
					});
				})(group);
				MicroS._next.push({//push a next event incase it's delay()ed & there's no Animation::next()
					time:element._micros_animation_end||0,
					element:element
				});
			}else
				action.apply(group);
		}
		MicroS.event_tick.apply(MicroS);
		return this;
	},
	
	/** @description Stops all animations and delays */
	stop:function()/** MicroS */{
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

	/** @description Sets the visibility of the elements, or returns an array marking which elements are visible
		@param [set] If specified all elements have their visibility set to this state
		@returns {MicroS} If 'set' is specified returns the list of elements once again
		@returns {bool[]} If 'set' is not specified returns a boolean array marking which elements are visible
	*/
	visible:function(/** bool */set, /** bool */space){
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
	/** @description Toggles the visibility on all elements (reversing their current state) */
	visible_toggle:function()/** MicroS */{
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

	/** @description Toggles the visibility on all elements (reversing their current state) */
	parent:function(/** String */tag,css_class)/** MicroS */{
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

	/** @description Returns all child elements. Optionally with the specified tag and/or class
		@param [tag=null] Tag to search for
		@param [css_class=null] Class to search for
	*/
	child:function(/** String */tag,/** String */css_class)/** MicroS */{
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
	
	sibling_next:function(){
		var list=new MicroS();
		
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			do{element=element.nextSibling;}while(element&&element.nodeType!==1);
			if(element)list.element.push(element);
		}
			
		return list;
	},
	
	sibling_prev:function(){
		var list=new MicroS();
		
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			do{element=element.previousSibling;}while(element&&element.nodeType!==1);
			if(element)list.element.push(element);
		}
			
		return list;
	},

	search:function(tag,css_class){
		return MicroS.search(tag,css_class,this.element,true);
	},
	
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
	attribute:function(/** String */name, /** Object */value){
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
		} else {
			var result = [];
			for (var I = 0; I < this.element.length; I++) {
				var element = this.element[I];
				result.push(element.getAttribute(name));
			}
			return result;
		}
	},
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
						/** @ignore */
						var callback_wrapper=function(event){
							var event_object=new MicroS.Event(event);
							callback.apply(element_wrapper,[event_object,parameter]);
							return event_object.allow_default;
						};
						if(!element._micros_event)element._micros_event={};
						element._micros_event[event]=(element._micros_event[event]||[]).concat(callback_wrapper);

						if(event==='ready'&&element===window&&MicroS.is_ready){
							MicroS.next(callback_wrapper);
						}if(event==='layout'&&element===window){
							MicroS._event_layout.push(callback_wrapper);
							MicroS.layout();
						}else{			
							if(!MicroS.browser.ie&&(match=event.match(/^mouse(enter|leave)$/))){
								event='mouse'+{enter:'over',leave:'out'}[match[1]];
								var wrapper = callback_wrapper;
								/** @ignore */
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
								/** @ignore */
								element.onsubmit=function(){var result=callback_wrapper();result&=old();return result;}
							}
						}
					})(event[I2]);
			}
		}
		return this;
	},
	trigger:function(/** String */event)/** MicroS */{
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
	},
	/** @description Sets the inner content of all elements.
		@see MicroS#html
	*/
	content:function(/** String */content){
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
	
	/** @description Sets the inner html of all elements
		@see MicroS#content
	*/
	html:function(/** String */html){
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			element.innerHTML=html;
		}
		return this;
	},
	
	drag:function(active)/** MicroS */{
		MicroS.drag(this, active);
		return this;
	},
	
	drag_reposition:function()/** MicroS */{
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
	
	/** @description Allow an element to be draggable by the mouse.<br />This will also manage depth order (dragged objects will be brought to the foreground) and bounds (objects will be constrained within their parent bounds)
		@param [cursor=false] If specified as true the mouse cursor will change to a "movement" cursor when hovering over the element
		@param [target=this] The element that will actually be dragged. This is normally either left on the default value of <em>this</em> or, if you wish the current element to simply be the drag handle, passed the parent element whom you wish to be moved
		@see MicroS#drag
	*/
	make_draggable:function(/** bool */cursor, /** MicroS */target)/** MicroS */{
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
	
	make_sortable:function(/** bool */cursor)/** MicroS */{
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
	
	/** @description Moves this element above all other sibling objects (in z-order) */
	make_topmost:function()/** MicroS */{
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
	
	/** @description Disables the browser from initialising drag actions used to select text and images, when clicking &amp; dragging on the element */
	make_unselectable:function()/** MicroS */{
		this
			.listen(['mousedown','selectstart'],function(event){
				event.stop(false,true);
			})
		;
		return this;
	},

	/** @description Adds the class to all elements */
	class_add:function(/** String */name)/** MicroS */{
		var find=new RegExp('\\b'+name+'\\b');
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			if(!element.className.match(find))
				element.className+=' '+name;
		}
		return this;
	},
	/** @description Removes the class from all elements */
	class_remove:function(/** String */name)/** MicroS */{
		var find=new RegExp(' *\\b'+name+'\\b');
		for(var I=0;I<this.element.length;I++){
			var element=this.element[I];
			element.className=element.className.replace(find,'');
		}
		return this;
	},
	/** @description Returns a boolean list, marking which elements contain the specified class */
	class_has:function(/** String */name)/** bool[] */{
		var result=[];
		var find=new RegExp('\\b'+name+'\\b');
		for(var I=0;I<this.element.length;I++)
			result.push(!!this.element[I].className.match(find));

		return result;
	},

	each:function(/** function */action, /** Object */self)/** MicroS */{
		if(self!==undefined)
			for(var I=0;I<this.element.length;I++)
				action.apply(self,[new MicroS(this.element[I])]);
		else
			for(var I=0;I<this.element.length;I++)
				action.apply(new MicroS(this.element[I]));
	},

	wrap:function(/** String */tag, /** Object[] */property)/** MicroS */{
		var result=new MicroS();
		for(var I=0;I<this.element.length;I++) {
			var element=this.element[I];
			var wrapper=(typeof tag==='string'?MicroS.create(tag, property):tag).element[0];

			if(element.parentNode)
				element.parentNode.replaceChild(wrapper, element);

			wrapper.appendChild(element);
			result.element.push(wrapper);
		}
		return result;
	}
};

/** @description Creates a new html element
	@param tag Tag name
	@param [property=null] List of properties to assign the element
	@param [inner] Inner html of element
*/
MicroS.create=function(/** String */tag, /** Property[] */property, /** String */inner)/** MicroS */{
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
MicroS.create_overlay=function(){
	return MicroS.body.create('div',{style:'position:absolute;top:0;left:0;width:100%;height:100%'}).make_topmost();
};
MicroS._drag=[];
MicroS._drag_start=[0,0];
MicroS._drag_active=false;
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
MicroS.next=function(/** Function **/action, /** Object */self, /** Object[] */parameter){
	setTimeout(function(){
		action.apply(self,parameter?parameter:[]);
	},10);
}

/** @namespace
	@property {number} ie Internet Explorer version number
	@property {bool} gecko Browser is Gecko-based
	@property {bool} webkit Browser is webkit-based
	@property {bool} opera Browser is opera-based
	@property {bool} opera_mobile Browser is opera-mobile
*/
MicroS.browser={
	_plugins:null,
	/** @description Returns a string of all browser plugins, each name on a separate line (for easy regex matching).<br />Results are cached once called once.<br />Non-functional in Internet Explorer (an empty string is returned)
		@example
		* var match;
		* if(match=MicroS.browser.plugins().match(/\bQuickTime Plug-in ([0-9.]+)\b/)
		* 	alert('QuickTime version '+match[1]+' found');
		@see MicroS.browser.plugin
	*/
	plugins:function(){
		if(!this._plugins){
			this._plugins='';
			if(navigator.plugins)for(var I=0;I<navigator.plugins.length;I++)
				this._plugins+=(I?'\n':'')+navigator.plugins[I].name;
		}
		return this._plugins;
	},
	/** @description Returns whether or not the plugin specified is present.<br />(Performs a case-insensitive search for the separated word in the plugins() list)<br />Non-functional in Internet Explorer (returns false)
		@example
		* if(MicroS.browser.plugin('QuickTime'))
		* 	alert('QuickTime present');
		@see MicroS.browser.plugins
	*/
	plugin:function(/** String */name)/** bool */{
		return !!this.plugins().match(new RegExp('\\b'+name+'\\b','i'));
	},
	/** @namespace */
	support:{
		css_transition: function () {
			var style = document.body.style;
			return (this.css_transition = style.transition !== undefined ?
			function () {
				return 'transition';
			} : style.webkitTransition !== undefined ?
			function () {
				return '-webkit-transition';
			} : style.MozTransition !== undefined ?
			function () {
				return '-moz-transition';
			} : style.oTransition !== undefined ?
			function () {
				return '-o-transition';
			} : MicroS.no)();
		},
		css_transform: function () {
			var style = document.body.style;
			return (this.css_transform = style.transform !== undefined ?
			function () {
				return 'transform';
			} : style.webkitTransform !== undefined ?
			function () {
				return '-webkit-transform';
			} : style.MozTransform ?
			function () {
				return '-moz-transform';
			} : style.oTransform ?
			function () {
				return '-o-transform';
			} : MicroS.no)();
		}
	}
};
MicroS.browser.ie    =navigator.userAgent.match(/\bMSIE (\d+)\b/);if(MicroS.browser.ie)MicroS.browser.ie=MicroS.browser.ie[1];
MicroS.browser.gecko =!this.opera&&!!navigator.userAgent.match(/\bGecko\b/)&&!navigator.userAgent.match(/\bKHTML\b/);
MicroS.browser.webkit=!this.opera&&!!navigator.userAgent.match(/\b(?:Apple)?WebKit\b/);
MicroS.browser.opera_mobile=!!navigator.userAgent.match(/\bOpera Mobi\b/)||(!!navigator.userAgent.match(/\bOpera\b/)&&!!navigator.userAgent.match(/\bHTC_/));
MicroS.browser.opera       =!this.opera_mobile && !! navigator.userAgent.match(/\bOpera\b/);

/** @namespace
	@property {bool} windows Operating system is Microsoft Windows
	@property {bool} iphone Device is an iPhone
	@property {bool} ipad Device is an iPad
	@property {bool} android Operating system is Android
	@property {number} webos webOS version number (major and minor as a decimal number)
	@property {number} windows_mobile Windows Mobile version number
	@property {bool} mobile Device is a handheld mobile device
	@property {bool} tablet Device is a tablet device
*/
MicroS.os={};
MicroS.os.windows=!!navigator.userAgent.match(/\bWindows\b/);
MicroS.os.iphone =!!navigator.userAgent.match(/\b(iPhone|iPod)\b/);
MicroS.os.ipad   =!!navigator.userAgent.match(/\biPad\b/);
MicroS.os.android=!!navigator.userAgent.match(/\bAndroid\b/);
MicroS.os.webos  =navigator.userAgent.match(/\bwebOS\/(\d+.?\d*)\b/);if(MicroS.os.webos)MicroS.os.webos=parseFloat(MicroS.os.webos[1]);
MicroS.os.windows_mobile=navigator.userAgent.match(/\b(Windows Phone|IEMobile)(\d+)\b/);if(MicroS.os.windows_mobile)MicroS.os.windows_mobile=MicroS.os.windows_mobile[2];else if(navigator.userAgent.match(/\b(XPLWP7|ZoneWP7)\b/))MicroS.os.windows_mobile=7;
MicroS.os.mobile=MicroS.os.iphone||MicroS.browser.opera_mobile||MicroS.os.android||MicroS.os.windows_mobile||MicroS.os.webos;
MicroS.os.tablet=MicroS.os.ipad;

MicroS.cursor=[0,0];

/**
	@class
*/
MicroS.Animation=function(time_length,time_start,skippable){
	// all animations MUST be inserted in order
	this.time_start=time_start?time_start:MicroS.frametime();
	this.time_length=time_length;
	this.moving=false;
	this.smooth=!skippable;
	this.property=[];
	this.element=[];
	/** @field */
	this.formula=function(x){return x;}
}
MicroS.Animation.prototype={
	add:function(element){
		this.element.push(element);
		if(element._micros_animation!=undefined)
			element._micros_animation.push(this);
		else
			element._micros_animation=[this];
		element._micros_animation_end=Math.max(element._micros_animation_end||0,this.time_end());

		if(this.moving)
			element._micros_animation_moving=(element._micros_animation_moving||0)+1;
	},
	remove:function(element){
		var element_list;
		if(element!==undefined){
			element_list=[element];
			if(this.element.length==1&&this.element[0]==element)
				this.property=[];
			else{
				for(var I=0;I<this.property.length;I++){
					if(this.property[I].element==element){
						this.property.splice(I,1);
						I--;
					}
				}
			}
			
			if(!this.property.length){
				var index;
				if((index=MicroS._animation.indexOf(this))>=0)
					MicroS._animation.splice(index,1);
			}
		}else
			element_list=this.element;
			
		for(var I=0;I<element_list.length;I++){
			var element=element_list[I];
			if(this.moving)
				element._micros_animation_moving--;
			var list=element._micros_animation;
			var index;if((index=list.indexOf(this))>=0)
				list.splice(index,1);
		}
	},
	next:function(){
		for(var I=0;I<this.element.length;I++)
			MicroS._element_next(this.element[I]);
	},
	time_end:function(){
		return this.time_start+this.time_length;
	}
}

/** Creates a new sound object
	@class
	@param [url]
	@param [play=false]
	@property {MicroS} element The html element.<br />For internal use.
*/
MicroS.Sound=function(/** String */url, /** bool */play){
	if(!MicroS.Sound.template){
		MicroS.Sound.template=
			MicroS.browser.ie?{
				tag:'bgsound',
				properties:{loop:1,autostart:true},
				url:'src'
			}:MicroS.browser.gecko&&MicroS.os.windows?(
				MicroS.browser.plugin('QuickTime')?{
					tag:'object',
					properties:{type:'audio/mpeg',width:0,height:0},
					url:'data'
				}:MicroS.browser.plugin('Windows Media')?{
					tag:'object',
					properties:{type:'application/x-mplayer2'},
					url:'data'
				}:MicroS.browser.plugin('RealPlayer')?{
					tag:'object',
					properties:{type:'audio/x-pn-realaudio-plugin',loop:false,hidden:true,style:'height:0'},
					src:'src'
				}:false
			):{
				tag:'embed',
				properties:{hidden:true,style:'height:0'},
				url:'src'
			}
		;
	}

	this._active=false;
	this.element=null;
	if(url)
		this.url(url);
	else
		this._url='';
	if(play)this.play();
}

MicroS.Sound.prototype={
	
	/** @description Sets and/or returns the current url of the sound file.<br />If a url is specified this sound is stopped (if playing) and changed to the new url.<br />The current/new url is returned.
		@param [url]
	*/
	url:function(/** String */url)/** String */{
		if(url){
			this._url=url;
			this.stop();
			var template=MicroS.Sound.template;
			if(template!==false){
				var properties=template.properties;properties[template.url]=url;
				this.element=MicroS.create(template.tag,properties);
				this.element.element[0].setAttribute('autostart',true);
				this.element.element[0].setAttribute('autoplay',true);
			}
		}
		return this._url;
	},
	/** @description Begins playing of the sound (and optionally sets/changes it)
		@param [url]
	*/
	play:function(/** String */url){
		if(url)this.url(url);
		if(this.element&&!this._active){
			MicroS.body.insert(this.element);
			this.element.element[0].Play&&this.element.element[0].Play();
			this._active=true;
		}
	},
	/** @description Stops the sound */
	stop:function(){
		if(this._active){
			this.element.remove();
			this._active=false;
		}
	}
}

MicroS._event_layout=[];
MicroS.layout=function(){
	for(var I=0;I<this._event_layout.length;I++)
		this._event_layout[I](null);
}
new MicroS(window).listen('resize',function(){
	MicroS.layout();
});

/** @class */
MicroS.Event=function(event){
	if(!event)event=window.event||{};
	
	/** DOM Event object */
	this.event=event;
	
	/** DOM Event type
		@type String
	*/
	this.type=event.type;
	this.allow_default=true;
	/** @property
		@type MicroS
	*/
	this.element=event.target||event.srcElement;
	if(this.element&&this.element.nodeType==3)this.element=this.element.parentNode;
	this.element=new MicroS(this.element);
	
	if(event.pageX||event.pageY)
		/** Cursor position
			@type number[2]
		*/
		this.cursor=[event.pageX,event.pageY];
	else if(event.clientX||event.clientY){
		var document=window.document.documentElement;
		var body=window.document.body||{scrollLeft:0};
		this.cursor=[
			event.clientX+body.scrollLeft+document.scrollLeft-(document.clientLeft||0),
			event.clientY+body.scrollTop +document.scrollTop -(document.clientTop ||0)
		];
	}else
		this.cursor=MicroS.cursor;

	/** The button pushed (keyboard or mouse)
		@type number
	*/
	this.button=event.keyCode||event.which;
	/** Right mouse button?
		@type bool
	*/
	this.right =this.button==2;//TODO:RENAME
	/** Left mouse button?
		@type bool
	*/
	this.left  =!this.right;//TODO:FIXME & RENAME
	/** Is the ctrl key held?
		@type bool
	*/
	this.ctrl  =event.ctrlKey;
	/** Is the alt key held?
		@type bool
	*/
	this.alt   =event.altKey;
}
MicroS.Event.prototype={
	stop:function(_default,propagate){
		if(!propagate){
			this.event.cancelBubble=true;
			if(this.event.stopPropagation)
				this.event.stopPropagation();
		}
		if(!_default){
			this.allow_default=false;
			this.event.returnValue=false;
			if(this.event.preventDefault)
				this.event.preventDefault();
		}
	}
}

/** @class */
MicroS.Sprite=function(parent,position,path){
	var self=this;
	this.parent=parent;
	this._path=path;
	this.element=parent.create('div',{style:'position:absolute;top:'+position[1]+'px;left:'+position[0]+'px;background:url('+path+') no-repeat'});
	this.collision_scale=[1,1];
	//this.element=parent.create('img',{style:'position:absolute;top:'+position[1]+'px;left:'+position[0]+'px',src:path});
	
	var image_size_cache;if(image_size_cache=MicroS._image_size_cache[path]){
		this.radius=[image_size_cache[0]/2,image_size_cache[1]/2];
		this.element.style({
			width:this.radius[0]*2+'px',
			height:this.radius[0]*2+'px',
			marginLeft:-this.radius[0]+'px',
			marginTop:-this.radius[1]+'px'
		});
	}else{
		this.radius=[0,0];
		var image=new Image();
		image.removeAttribute('width');
		image.removeAttribute('height');
		this._image=new MicroS(image);
		this._image.listen('load',function(){self.event_loaded.apply(self,[image]);});
		this._image.element[0].src=path;
	}
}
MicroS.Sprite.prototype={
	graphic:function(set,animate_size){
		if(set){
			if(set!=this._path){
				this.element.style({backgroundImage:'url('+set+')'});
				//this.element.element[0].src=set;
				this._path=set;
			}
		}else
			return this._path;
	},
	position:function(set){//TODO:move to MicroS.position & bubble back from there
		var element=this.element.element[0];
		if(set){
			element._micros_position=[set[0],set[1]];
			element.style.top =set[1]+'px';
			element.style.left=set[0]+'px';
		}else{
			if(element._micros_position===undefined){
				element._micros_position=[
					parseFloat(this.element.style('left')[0]),
					parseFloat(this.element.style('top' )[0])
				];
			}
			return [element._micros_position[0],element._micros_position[1]];
		}
	},
	overlap:function(sprite){
		var a=this.position();
		var b=sprite.position();
		return (
			Math.abs(a[0]-b[0])<=(this.radius[0]*this.collision_scale[0]+sprite.radius[0]*sprite.collision_scale[0])&&
			Math.abs(a[1]-b[1])<=(this.radius[1]*this.collision_scale[1]+sprite.radius[1]*sprite.collision_scale[1])
		);
	},
	remove:function(){
		this.image=undefined;
		this.element.remove();
	},
	event_loaded:function(image){
		this.radius=MicroS._image_size_cache[this._path]=[image.naturalWidth||image.width,image.naturalHeight||image.height];
		this.radius=[this.radius[0]/2,this.radius[1]/2];
		
		this.element.style({
			width:this.radius[0]*2+'px',
			height:this.radius[1]*2+'px',
			marginLeft:-this.radius[0]+'px',
			marginTop:-this.radius[1]+'px'
		});

		this._image=undefined;
	}
}

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

MicroS._time=function(){return +new Date/1000;}
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
MicroS.frametime_now=function(){
	return MicroS.time()-MicroS._frametime_delay;
}
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
	}else if(!MicroS._frametime_clear){
		/** @ignore */
		MicroS.next(function(){MicroS._frametime=null;MicroS._frametime_clear=false;});
		MicroS._frametime_clear=true;
	}
	
	return MicroS._frametime;
}

MicroS._paused=null;
MicroS.paused=function(set){if(!this._paused||!set)this._paused=set?_time():null;}

MicroS._time_start=MicroS._time();

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
			/** @ignore */
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

		this._event_tick=setTimeout(function(){MicroS.event_tick.apply(MicroS);},delay*1000);
	}
}
MicroS._animate_css = false;
MicroS.animate_css = function (set) {
	if (set !== undefined) MicroS._animate_css = set && MicroS.browser.support.css_transition();
	return MicroS._animate_css;
}

MicroS._image_size_cache=[];
MicroS._image_load=[];
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

/** @description Internal method for converting dom collections to arrays */
MicroS.collection_to_array=function(collection){
	var result=[];
	if(collection)for(var I=0;I<collection.length;I++)result.push(collection[I]);
	return result;
}

/**
 * @constructs
 */

MicroS.search=function(tag,css_class,parent,recurse){
	if(!(tag instanceof Array))tag=tag?[tag]:[];
	if(parent===undefined)parent=[document];
	if(recurse===undefined)recurse=true;
	
	if(recurse){
		var result=new MicroS;
		if(css_class&&document.querySelectorAll){
			//var css=(tag?tag:'')+'.'+css_class.join(','+(tag?tag:'')+'.');
			var css=css_class?'.'+css_class:'';css=tag.join(css)+css;
			for(var I=0,length=parent.length;I<length;I++)
				result.element=result.element.concat(this.collection_to_array(parent[I].querySelectorAll(css)));
			
			return result;
		}else{
			var search=new MicroS;
			
			if(tag){
				for(var I=0,length=parent.length;I<length;I++)for(var I2=0,length2=tag.length;I2<length2;I2++)
					search.element=search.element.concat(this.collection_to_array(parent[I].getElementsByTagName(tag[I2])));
			}else{
				for(var I=0,length=parent.length;I<length;I++)
					search.element=search.element.concat(this.collection_to_array(parent[I].getElementsByTagName('*')));
			}

			if(css_class){
				var class_match=new RegExp('\\b'+css_class+'\\b');
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
		var class_match=css_class?new RegExp('\\b'+css_class+'\\b'):null;
		
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

MicroS.id=function(id){
  return new MicroS(document.getElementById(id));
}

MicroS.ready=function(action){
	MicroS.window.listen('ready',action);
}

MicroS.window=new MicroS(window);
MicroS.document=null;
MicroS.body=null;

MicroS.is_ready=false;

(function(){
	var event_ready=function(){
		if(!MicroS.is_ready){
			MicroS.document=new MicroS(document);
			MicroS.body=new MicroS(document.body);
			
			MicroS.is_ready=true;
			
			MicroS.document
				.listen('mousemove',function(event){
					var x=event.cursor[0];
					var y=event.cursor[1];
					MicroS.cursor=[x,y];
					if(MicroS._drag.length){
						if(
							!MicroS._drag_active&&
							Math.abs(x-MicroS._drag_start[0])+Math.abs(y-MicroS._drag_start[1])>8
						){
							for(var I=0;I<MicroS._drag.length;I++)
								if(!MicroS._drag[I].element.trigger('dragstart')){
									MicroS.drag(false);
									return;
								}

							MicroS._drag_active=true;
							MicroS.create_overlay()
								.style({zIndex:9999})
								.element[0].id='_MicroS_drag_overlay'
							;
						}
						if(MicroS._drag_active){
							for(var I=0;I<MicroS._drag.length;I++){
								var drag=MicroS._drag[I];
								drag.element.element[0].style.left=Math.min(Math.max(x+drag.x,drag.x_min),drag.x_max)+'px';
								drag.element.element[0].style.top =Math.min(Math.max(y+drag.y,drag.y_min),drag.y_max)+'px';
								drag.element.trigger('dragmove');
							}
						}
					}
				})
				.listen('mouseup',function(event){
					MicroS.drag(false);
				})
			;			
			
			MicroS.window.trigger('ready');
		}
	};
	
	if(document.readyState==='complete'){
		MicroS.next(event_ready);
	}else{
		if(document.addEventListener){
			document.addEventListener('DOMContentLoaded',event_ready,false);
			window.addEventListener('load',event_ready,false);
		}else if(document.attachEvent){
			document.attachEvent('onreadystatechange',function(){if(document.readyState==="complete")event_ready();});
			window.attachEvent('onload',event_ready);
		}
	}
})();