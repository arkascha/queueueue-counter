ControlWidgets = function() {

	function ButtonSet( selector, options ) {
		var options = $.extend({
			value: 1,
			change: function(event, value) {}
		}, options||{} );
		var hotspot = $( selector ).find( '.hotspot' ).buttonset( options );
		// bind change event
		hotspot.buttonset().bind( 'change', options.change );
		// activate specified option
		hotspot.find( '[value="'+options.value+'"]+label' ).click();
		hotspot.buttonset( 'refresh' );

		function getValue() {
			var button = hotspot.find( "label[aria-pressed=true]" ).attr( 'for' );
			return hotspot.find( 'input#'+button ).attr( 'value' );
		}

		function setValue( value ) {
			hotspot.find( '[value="'+value+'"]+label' ).click();
			hotspot.buttonset( 'refresh' );
			return getValue();
		}

		return {
			getValue: getValue,
			setValue: setValue
		}
	} // ButtonSet




	function Button( selector, options ) {
		var options = $.extend({
			click: function(){}
		}, options||{} );
		var widget  = $( selector );
		var hotspot = $( selector ).find( '.hotspot img' );
		hotspot.bind( 'click', click );

		function click() {
			clicked();
			options.click();
		}

		function clicked() {
			// flash button by changing the background color for 100 msecs
			widget.css( 'background-color', 'whitesmoke' );
			setTimeout( function(){ widget.css( 'background-color', 'transparent' ); }, 100 );
		}

		return {
			click:   click,
			clicked: clicked
		}
	} // Button




	function ButtonWithLight( selector, options ) {
		var options = $.extend({
			click: function(){}
		}, options||{} );
		var widget  = $( selector );
		widget.bind( 'click', click );
		var background = widget.css( 'background-color' );
		var hotspot = $( selector ).find( '.hotspot' );

		function click() {
			options.click();
			clicked();
		}

		function clicked() {
			widget.css( 'background-color', 'whitesmoke' );
			setTimeout( function(){ widget.css( 'background-color', background ); }, 200 );
		}

		return {
			click:   click,
			clicked: clicked
		}
	} // ButtonWithLight




	function ButtonWithState( selector, options ) {
		var options = $.extend({
			toggle: function(){}
		}, options||{} );
		var widget  = $( selector ),
				hotspot = $( selector ).find( '.hotspot' ),
				state   = options.state || false;
		widget.bind( 'click', clicked );

		function clicked( event, ui ) {
			toggleState();
		}

		function getState() {
			return state ? true : false;
		}

		function setState( value ) {
			return toggleState( value );
		}

		function toggleState( value ) {
			state = value || ! state;
			// signal toggle
			options.toggled( state );
			return state;
		}

		return {
			getState:    getState,
			setState:    setState,
			toggleState: toggleState
		}
	} // ButtonWithState




	function ColorChooser( selector, options ) {
		var widget_options = {
			orientation: 'horizontal',
			range:       'max',
			max:         options.max   || 255,
			step:        options.step  ||   1,
			slide:       refresh,
			stop:        changed
		};
		var values   = channelsFromRGBA( options.color || 'rgba(255,255,255,1)' );
		var Widget   = $( selector );
		var Preview  = $( '#'+Widget.find( 'div.color-preview' ).attr( 'id' ) ).get(0);
		var Channels = {
			Red  : new ControlWidgets.Slider( '#'+Widget.find('.color-channel-red'  ).attr('id'), $.extend(widget_options, {value:values.red  }) ),
			Green: new ControlWidgets.Slider( '#'+Widget.find('.color-channel-green').attr('id'), $.extend(widget_options, {value:values.green}) ),
			Blue : new ControlWidgets.Slider( '#'+Widget.find('.color-channel-blue' ).attr('id'), $.extend(widget_options, {value:values.blue }) ),
			Alpha: new ControlWidgets.Slider( '#'+Widget.find('.color-channel-alpha').attr('id'), $.extend(widget_options, {value:values.alpha, max:1, step:1/255}) ),
		};
		setRGBA( options.color );

		function getRGBA() {
			var channels = getChannels();
			return rgbaFromChannels( channels );
		}

		function setRGBA( rgba ) {
			var channels = channelsFromRGBA( rgba );
			Channels['Red'  ].setValue( channels.red   );
			Channels['Green'].setValue( channels.green );
			Channels['Blue' ].setValue( channels.blue  );
			Channels['Alpha'].setValue( channels.alpha );
			$(Preview).css( 'background-color', rgba );
			options.change( rgbaFromChannels( channels ) );
		}

		function getChannels() {
			return {
			  red:   Channels['Red'  ].getValue(),
			  green: Channels['Green'].getValue(),
			  blue:  Channels['Blue' ].getValue(),
			  alpha: Channels['Alpha'].getValue(),
			};
		}

		function setChannels( channels ) {
			var rgba = rgbaFromChannels( channels );
			Channels['Red'  ].setValue( channels.red   );
			Channels['Green'].setValue( channels.green );
			Channels['Blue' ].setValue( channels.blue  );
			Channels['Alpha'].setValue( channels.alpha );
			$(Preview).css( 'background-color', rgba );
			options.change( rgbaFromChannels( channels ) );
		}

		function rgbaFromChannels ( channels ) {
			return 'rgba('+channels.red+','+channels.green+','+channels.blue+','+channels.alpha+')'
		}

		function channelsFromRGBA( rgba ) {
			var values;
			if ('rgba'===rgba.substring(0,4)) {
				values = rgba.substring(5, rgba.length-1).replace(/ /g, '').split(',');
			} else if ('rgb'===rgba.substring(0,3)) {
				values = rgba.substring(4, rgba.length-1).replace(/ /g, '').split(',');
				values[ 3 ] = 1.0;
			} else
				values = [ 255,255,255,1.0 ];
			return { red:parseInt(values[0]), green:parseInt(values[1]), blue:parseInt(values[2]), alpha:parseFloat(values[3]) };
		}

		function refresh( event,ui ) {
			var channels = getChannels();
			if (event) {
				if      ( $(event.target).hasClass('color-channel-red'  ) )
					channels.red   = ui.value;
				else if ( $(event.target).hasClass('color-channel-green') )
					channels.green = ui.value;
				else if ( $(event.target).hasClass('color-channel-blue' ) )
					channels.blue  = ui.value;
				else if ( $(event.target).hasClass('color-channel-alpha') )
					channels.alpha = ui.value;
			}
			setChannels( channels );
		}

		function changed( event, ui ) {
			var channels = getChannels();
			// signal activity
			options.change( rgbaFromChannels( channels ) );
		}

		return {
			getChannels:      getChannels,
			setChannels:      setChannels,
			channelsFromRGBA: channelsFromRGBA,
			rgbaFromChannels: rgbaFromChannels,
			getRGBA:          getRGBA,
			setRGBA:          setRGBA,
			refresh:          refresh
		}
	} // ColorChooser



	function FileReader( selector, options ) {
		var options = $.extend({
			clicked:  function(){},
			payload:  function(){},
			selected: function(){}
		}, options||{} );
		var content = $( selector ).html(),
				widget = convert( selector );

		function clicked( event ) {
			event.stopPropagation();
			// highlight button as user feedback
			highlight();
			// raise the file selection dialog
			widget.find( 'form[name='+selector+'] input:file').get(0).click();
			// signal action to element
			options.clicked();
		}

		function convert( selector ) {
			var widget = $( selector );
			// create new content for widget
			var hotspot = $( '<a class="hotspot">' + content + '</a>' ).bind( 'click', clicked );
			var element = $( '<input type="file" style="display:none;" />' );
			element.fileReaderJS( { accept: false,
															readAsDefault: 'BinaryString',
															on: { load: selected } } );
			// replace initial content of widget
			widget.empty().append( $('<form name="'+selector+'"/>').append(element) ).append(hotspot);
			return widget;
		}

		function highlight() {
			// flash button by changing the background color for 100 msecs
			widget.css( 'background-color', 'whitesmoke' );
			setTimeout( function(){ widget.css( 'background-color', 'transparent' ); }, 100 );
		}

		function reload( input ) {
			// reconstruct unconverted state
			widget.empty().append( content );
			// re-convert the widget again
			widget = convert( selector );
		}

		function selected( event, file ) {
			// recreate the input tag to have a fresh one, otherwise we cannot load a single file _twice_
			input = reload( widget.find( 'form[name='+selector+'] input:file') );
			// process payload
			options.payload( event.target.result );
			// signal event to controlling element
			options.selected();
		}

		return {}
	} // FileReader




	function FileStorer( selector, options ) {
		var options = $.extend({
			clicked: function(){},
			payload: function(){}
		}, options||{} );
		var widget  = convert( selector );

		function clicked() {
			// highlight button as user feedback
			highlight();
			// offer stringified profile data as file to download
			widget.find( '.hotspot' ).href = 'data:text/json,' + encodeURIComponent( options.payload()||'' );
			// signal action to element
			options.clicked();
		}

		function convert( selector ) {
			var widget = $( selector );
			widget.bind( 'click', clicked );
			// insert new content into widget
			var hotspot = $( '<a href="#" class="hotspot" download="queueue-profile.txt">' + widget.html() + '</a>' );
			// replace initial content of widget
			widget.empty().append( hotspot );
			return widget;
		}

		function highlight() {
			// flash button by changing the background color for 100 msecs
			widget.css( 'background-color', 'whitesmoke' );
			setTimeout( function(){ widget.css( 'background-color', 'transparent' ); }, 100 );
		}

		return {}
	} // FileStorer




	function Knob( selector, options ) {
		var current = 0,
				hotspot  = $( selector ).find( 'div.knob-controller' );
		var options = $.extend({
			delta:    0,
			min:      0,
			max:    100,
			snap:     0,
			step:     1,
			value:  options.value || 0,
			change: function( event,ui ){},
			start:  function( event,ui ){},
			stop:   function( event,ui ){},
			turn:   function( ratio ){
				// compute the current value
				var value = valueFromRatio( ratio );
				// store new value
				setValue( value );
				// call change callback
				options.change( value );
			}
		}, options||{} );
		// set explicit inital rotation value in degree as 'value'
		options.value = rotationFromValue( options.value );
		hotspot.knobKnob( options );

		function valueFromRatio( ratio ) {
			var min   = options.min,
					max   = options.max,
					delta = options.delta;
			return Math.max( min, Math.min( max, ratio*(max-min) ) ) + delta;
		}

		function ratioFromValue( value ) {
			var min = options.min,
					max = options.max;
			value = Math.max( min, Math.min( max, value ) );
			return (value-min)/(max-min);
		}

		function rotationFromValue( value ) {
			var min = options.min,
					max = options.max;
			value = Math.max( min, Math.min( max, value ) );
			return 360*(value-min)/(max-min);
		}

		function getValue() {
			return current;
		}

		function setValue( value ) {
			current = value;
			options.change( value );
			return getValue();
		}

		return {
			getValue: getValue,
			setValue: setValue
		}
	} // Knob




	function Slider( selector, options ) {
		var options = $.extend({}, options||{} );
		var hotspot = $( selector ).find( '.hotspot' ).slider( options );

		function getValue() {
			return hotspot.slider( 'value' );
		}

		function setValue( value ) {
			hotspot.slider( 'value', value );
			return getValue();
		}

		return {
			getValue: getValue,
			setValue: setValue
		}
	} // Slider




	function SliderWithLabels( selector, options ) {
		var options = $.extend({
			step: 1,
			tickInterval: 1,
			change: function( event,ui ){},
			slide:  function( event,ui ){},
			start:  function( event,ui ){},
			stop:   function( event,ui ){}
		}, options||{} );
		var hotspot = $( selector ).find( '.hotspot' ).labeledslider( options );

		function getValue() {
			return hotspot.labeledslider( 'value' );
		}

		function setValue( value ) {
			hotspot.labeledslider( 'value', value );
			return getValue();
		}

		return {
			getValue: getValue,
			setValue: setValue
		}
	} // SliderWithLabels



	function Sparkline( selector, options ){

		var hotspot  = $( selector ).find( '.hotspot' );

		function render( history ) {
			hotspot.sparkline( history, {
				type:        'tristate',
				posBarColor: 'whitesmoke',
				negBarColor: 'dimgray',
				barWidth:    1,
				barSpacing:  0,
				height:      12,
				zeroAxis:    false,
				disableHiddenCheck: true } );
		}

		return {
			render: render
		}
	}



	function Spinner( selector, options ) {
		var options = $.extend({
			length: 4,
			numberFormat: "n",
			change: function( event,ui ){},
			spin:   function( event,ui ){},
			stop:   function( event,ui ){},
		}, options||{} );
		var hotspot = $( selector ).find( '.hotspot' ).spinner( options );
		setLength( options.length );
		hotspot.val( options.value );

		function setLength( value ) {
			hotspot.attr( 'length', value );
		}

		function getMax() {
			return hotspot.spinner( 'option', 'max' );
		}

		function setMax( max ) {
			hotspot.spinner( 'option', 'max', max );
		}

		function getValue() {
			return hotspot.spinner( 'value' );
		}

		function setValue( value ) {
			hotspot.spinner( 'value', value );
			return getValue();
		}

		return {
			setLength: setLength,
			getMax:    getMax,
			setMax:    setMax,
			getValue:  getValue,
			setValue:  setValue
		}
	} // Spinner



	function Switch( selector, options ) {
		var options = $.extend( {
			value:   1,
			change:  function( event,ui ){},
			size:    40,
			strings: ['-1-','-0-']
		}, options||{} );
		// morph html input into a jquery ui hotspot
 		var hotspot = $( selector + ' select.hotspot' ).switchify( options );
		// bind to its change event
		hotspot.data( 'switch' ).bind( 'switch:slide', options.change );
		// set initial value
		hotspot.data( 'switch' ).trigger('switch:slide', options.value);

		function getValue() {
			return hotspot.switchify().val();
		}

		function setValue( value ) {
			hotspot.switchify( 'val', value );
			return getValue();
		}

		return {
			getValue: getValue,
			setValue: setValue
		}
	} // Switch



	return {
		Button:            Button,
		ButtonSet:         ButtonSet,
		ButtonWithLight:   ButtonWithLight,
		ButtonWithState:   ButtonWithState,
		ColorChooser:      ColorChooser,
		FileReader:        FileReader,
		FileStorer:        FileStorer,
		Knob:              Knob,
		Slider:            Slider,
		SliderWithLabels:  SliderWithLabels,
		Sparkline:         Sparkline,
		Spinner:           Spinner,
		Switch:            Switch
	}

}(); // ControlWidgets
