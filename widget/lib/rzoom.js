(function() {
	var global = this;
	
	// widget constructor function
	if ( !global.pl ) {
		global.pl = {};
	}
	
	if ( !global.pl.ryrych ) {
		global.pl.ryrych = {};
	}	
	
	// widget constructor function
	global.pl.ryrych.rzoom = function( opts) {
		var options = {
				width: opts.width || 300,
				height:	opts.height || 300,
				offset: opts.offset || 0,
				parent: opts.parentId
			},
			helpers = new global.pl.ryrych.helpers(),
		
		_add = function( image ) {
			var _realSizeImage,
				_storage = helpers.data( image ).data = {},
				_originalImageSize = {},
				_originalImageScaledSize = {};

			// create the structure if it has not been created yet
			if ( !data.initiated ) {
				_createStructure();
			}
			
			// get the real size – you have to do it when you add
			// add() method to an image with, eg. style="width: 380px; height: auto"
			_realSizeImage = new Image();
			_realSizeImage.src = image.src;
			
			_originalImageSize.width = _realSizeImage.width;
			_originalImageSize.height = _realSizeImage.height;
			
			// scaled size is the size of an image that was scaled for example with CSS
			_originalImageScaledSize = _calculateScaledImageSize( image, _realSizeImage );
			
			// if scaled image is >= original do not use zoom on it
			if ( _originalImageScaledSize.width >= _originalImageSize.width ) {
				return;
			}
			
			// store basic data on the image
			_storage.$originalImage = image;
			_storage.originalImagePosition = helpers.getElementPosition( image );
			_storage.originalImageSize = _originalImageSize;
			_storage.originalImageScaledSize = _originalImageScaledSize;
			
			// get postion of the parent widget will be relative to
			data.parent = document.getElementById( options.parent );
			data.parentPosition = helpers.getElementPosition( data.parent );
			data.parentSize.width = data.parent.offsetWidth;
			
			
			// add event handlers
			helpers.addEvent( image, "mousemove", function( event ) {
				_show( image, event );
			});
			helpers.addEvent( image, "mouseout", _hide );
		},
		
		_calculateScaledImageSize = function( image, originalImage ) {
			var _width, _height, _sizeRatio,
				_originalWidth = originalImage.width,
				_originalHeight = originalImage.height;
			
			if ( image.style.width !== "auto" ) {
				_sizeRatio = _originalHeight / _originalWidth;
				_width = parseInt( image.style.width, 10 );
				_height = _width * _sizeRatio;
			} else if ( image.style.height !== "auto" ) {
				_sizeRatio = _originalWidth / _originalHeight;				
				_height = parseInt( image.style.height, 10 );
				_width = _height * _sizeRatio;
			}
			
			return {
				width: _width,
				height: _height
			};
		},			
		
		_createStructure = function() {
			var $root, $container, $image,
				$widget = data.$widget;
			
			// create root of the widget
			$root = document.createElement( "div" );
			$root.id = "ui-magnifier";
			$widget.root = $root;
			
			// create image holder
			$container = document.createElement( "div" );
			$container.id = "ui-magnifier-container";
			$container.style.width = options.width + "px";
			$container.style.height = options.height + "px";
			$root.appendChild( $container );
			
			// remember the reference
			$widget.container = $container;
			
			// create an empty image
			$image = document.createElement( "img" );
			$image.id = "ui-magnifier-image";			
			
			// append the image to the container
			$container.appendChild( $image );
			
			// remember the reference to the image
			$widget.image = $image;			
			
			// and add the widget to the page
			document.getElementsByTagName( "body" )[0].appendChild( $root );
			
			data.initiated = true;
		},
		
		_hide = function () {
			data.$widget.root.style.display = "none";
		},		
		
		_positionMagnifier = function() {
			var $root = data.$widget.root;

			$root.style.left = data.parentPosition.x + data.parentSize.width + options.offset + "px";
			$root.style.top = data.parentPosition.y + "px";			
		},
		
		_positionImage = function( x, y ) {
			var $image = data.$widget.image,
			_storage = helpers.data( data.$currentImage ).data;

			$image.style.marginLeft = -x * ( _storage.originalImageSize.width / _storage.originalImageScaledSize.width ) + "px";
			$image.style.marginTop = -y * ( ( _storage.originalImageSize.height / _storage.originalImageScaledSize.height ) ) + "px";
		},
		
		_show = function ( image, event ) {
			var _storage = helpers.data( image ).data,
				$widget = data.$widget,
				$image = $widget.image,
				$root = $widget.root,
				_mousePos = helpers.getMousePosition( event ),
				_mouseXPos = _mousePos.x,
				_mouseYPos = _mousePos.y,
				_imagePosition = _storage.originalImagePosition,
				_imageXPos = _imagePosition.x,
				_imageYPos = _imagePosition.y,
				_relativeXPos = _mouseXPos - _imageXPos,
				_relativeYPos = _mouseYPos - _imageYPos;			

			// scaled image you are hovering on
			data.$currentImage = image;
			
			// copy original image to magnifier image
			$image.src = image.src;		
			
			// position magnifier
			_positionMagnifier();

			// and position image as well
			_positionImage( _relativeXPos, _relativeYPos );

			// show the magnifier
			$root.style.display = "block";			
		},		
		
		data = {
			initiated: false,
			$widget: {},
			parent: null,
			parentPosition: {},
			parentSize: {}
		};

		// public instance methods
		return {
			add: _add
		};
	};
	
	global.pl.ryrych.helpers = function() {
		this.addEvent = function( obj, type, fn ) {
			if ( obj.attachEvent ) {
				obj["e" + type + fn] = fn;
				obj[type + fn] = function() {
					obj["e" + type + fn]( window.event );
				};
				obj.attachEvent( "on" + type, obj[type + fn] );
			} else {
				obj.addEventListener( type, fn, false );
			}
		};
		
		this.data = function( element ) {
			var _expando = this.dataObj.expando,
				_cache = this.dataObj.cache,
				_cacheIndex = element[_expando],
				_nextCacheIndex = _cache.length;
			
			if ( !_cacheIndex ) {
				_cacheIndex = element[_expando] = _nextCacheIndex;
				_cache[_cacheIndex] = {};
			}
			
			return _cache[_cacheIndex];
		};
		
		this.getElementPosition = function( element ) {
			var _xPos = 0,
				_yPos = 0;
			
			if ( element.offsetParent ) {
				do {
					_xPos += element.offsetLeft;
					_yPos += element.offsetTop;
				} while ( element = element.offsetParent );
			}
			
			return {
				x: _xPos,
				y: _yPos
			};
		};
		
		this.getMousePosition = function( event ) {
			var xPos, yPos;
			
			if ( !event ) {
				event = window.event;
			}
			
			if ( event.pageX || event.pageY ) {
				xPos = event.pageX;
				yPos = event.pageY;
			} else if ( event.clientX || event.clientY ) {
				xPos = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				yPos = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}
			
			return {
				x: xPos,
				y: yPos
			};
		};
		
		this.preventDefault = function( event ) {
			if ( event.preventDefault ) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
		};
		
		this.dataObj = {
			cache: [0],
			expando: "data" + new Date().getTime()
		};
	};
})();