/** Class: MicroS.Event

	An event.
*/
MicroS.Event=function(event){
	if(!event)event=window.event||{};
	
	/** Variable: event
		(DomEvent) DOM Event object. */
	this.event=event;
	/** Variable: type
		(string) DOM Event type.
	*/
	this.type=event.type;
	this.allow_default=true;
	/** Variable: element
		(<MicroS>) Collection containing target element.
		
		Example:
			(code)
			//Highlight red whatever the user clicks on
			MicroS.body.listen('click', function(event){
				event.element.style({backgroundColor:'#f00'});
			});
			(end)
	*/
	this.element=event.target||event.srcElement;
	if(this.element&&this.element.nodeType==3)this.element=this.element.parentNode;
	this.element=new MicroS(this.element);
	
	if(event.pageX||event.pageY)
		/** Variable: cursor
			(number[2]) Cursor position.
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

	/** Variable: button
		(number) The button pushed (keyboard or mouse)
	*/
	this.button=event.keyCode||event.which;
	/** Variable: right
		(boolean) Right mouse button?
	*/
	this.right =this.button==2;//TODO:RENAME
	/** Variable: left
		(boolean) Left mouse button?
	*/
	this.left  =!this.right;//TODO:FIXME & RENAME
	/** Variable: ctrl
		(boolean) Is the ctrl key held?
	*/
	this.ctrl  =event.ctrlKey;
	/** Variable: alt
		(boolean) Is the alt key held?
	*/
	this.alt   =event.altKey;
}
MicroS.Event.prototype={
	/** Method: stop
		
		Parameters:
		
			_default = false - (boolean) Allow the default action
			propagate = false - (boolean) Allow the event to bubble upwards.
			
		Examples:
		
			(code)
				// Stop the current event.
				// The default action is aborted, and the parents will not be notified.
				event.stop();
			(end)
			(code)
				// Stop the current event.
				// Abort the default action, but allow any parents to receive the event.
				event.stop(false, true);
			(end)
	*/
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