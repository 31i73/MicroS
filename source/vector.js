/** Class: MicroS.Vector

	A class for storing and manipulating 2D Vectors (positions and velocities etc).
	
	Note that no methods modify the existing vector, but return their effects as new vectors.
	
	All angles are expressed in radians.
*/

(MicroS.Vector=function(x,y){
	this.x=x;
	this.y=y;
}).prototype={
	/** Constructor: Vector
	
		Creates a new vector.
	
		Parameters:
		
			x - (number) X component.
			y - (number) Y component.
			
		Example:
		
			(code)
			var vector = new MicroS.Vector(2,3);
			(end)
			
	Group: properties
			
		Variable: x
			(number) X component.
			
		Variable: y
			(number) Y component.
	*/
	
	/** Group: operations */
	/** Method: length
	
		Gets or sets the length of the vector.
	
		Parameters:
		
			set - (number; optional) A length to set it to.
				Existing zero-length vectors are handled safely and result in MicroS.Vector(*set*,0).
			
		Returns:
		
			length - (number) If *set* is not specified the length of the vector will be returned.
			vector - (<MicroS.Vector>) If *set* is specified a new vector will be returned with the specified length.
			
		Examples:
		
			(code)
			var vector = new MicroS.Vector(2,3);
			
			var length = vector.length();
			//length = 3.60...
			
			var newvector = vector.length(5);
			//newvector = MicroS.Vector(2.77... , 4.16...)
			(end)			
	*/
	length:function(set){
		var length=Math.sqrt(this.x*this.x+this.y*this.y);
		if(set){
			if(length){
				length=set/length;
				return new MicroS.Vector(this.x*length,this.y*length);
			}else
				return new MicroS.Vector(set,0);
		}else
			return length;
	},
	
	/** Method: angle
	
		Gets or sets the angle of the vector.
		
		Note that an angle of 0 points positively along the X component & an increase turns first towards a positive on the Y.
		
		If +X is right & +Y is up this means an angle of 0 points right and rotation occurs anticlockwise.

		Parameters:
		
			set - (number; optional) An angle to set it to.
				If specified this effectively returns a new vector pointing along the specified angle, with the same length as the last.
				
		Returns:
			angle - (number) If *set* is not specified the angle of the vector will be returned.
			vector - (<MicroS.Vector>) If *set* is specified a new vector will be returned with the specified angle.
	*/
	angle:function(set){
		if(set){
			var length=this.length();
			return new MicroS.Vector(Math.cos(set)*length,Math.sin(set)*length);
		}else
			return Math.atan2(y,x);
	},
	
	/** Method: rotate
	
		Rotates the vector by the specified angle.
		
		Parameters:
		
			angle - (number) The angle.
			
		Returns:
		
			(<MicroS.Vector>) The new transformed vector.
	
	*/
	rotate:function(angle){
		var cos=Math.cos(angle);
		var sin=Math.sin(angle);
		return new MicroS.Vector(this.x*cos-this.y*sin,this.x*sin+this.y*cos);
	},
	
	/** Group: arithmetic */
	
	/** Method: add
	
		Adds a vector.
		
		Returns a + b.
	
		Parameters:
		
			vector - (<MicroS.Vector>) The vector to add.
			
		Examples:
		
			(code)
			var a = new MicroS.Vector(1,2);
			var b = new MicroS.Vector(3,4);
			var sum = a.add(b);
			(end)
	*/
	add:function(vector){
		return new MicroS.Vector(this.x+vector.x,this.y+vector.y);
	},
	/** Method: subtract
	
		Subtracts a vector.
		
		Returns a - b.
	
		Parameters:
		
			vector - (<MicroS.Vector>) The vector to subtract.
			
		Examples:
		
			(code)
			var a = new MicroS.Vector(1,2);
			var b = new MicroS.Vector(3,4);
			var result = a.subtract(b);
			(end)
	*/
	subtract:function(vector){
		return new MicroS.Vector(this.x-vector.x,this.y-vector.y);
	},
	/** Method: scale
	
		Scales a vector by a value.
		
		Returns a * b.
	
		Parameters:
		
			vector - (number) The value to scale by.
			
		Examples:
		
			(code)
			var a = new MicroS.Vector(1,2);
			var b = a.scale(2);
			// b is now a vector twice as long as a
			(end)
	*/
	scale:function(scalar){
		return new MicroS.Vector(this.x*scale,this.y*scale);
	},
	/** Method: dot
	
		Returns the dot product of this vector and another.
		
		The result is equal to: x1 * x2 + y1 * y2
		
		If both Vectors are of length 1, then the dot product will be a scalar value representing how similiar the 2 vectors are...
		
			o If the 2 Vectors match the result will be +1.
			o If one vector is the opposite of the other the result will be -1.
			o If one vector is at right angles to the other the result will be 0.
			
			o The angle between the vectors can be retrieved by passing this value to *Math.acos*.
		
		Parameters:
		
			vector - (<MicroS.Vector>) vector to dot against.
			
		Returns:
		
			(number) The result.
			
		Examples:
		
			(code)
			var a = new MicroS.Vector(2,3);
			var b = new MicroS.Vector(7,-4);
			
			var angle = Math.acos( a.length(1).dot( b.length(1) ) );
			(end)
	*/
	dot:function(vector){
		return this.x*vector.x+this.y*vector.y;
	}
};