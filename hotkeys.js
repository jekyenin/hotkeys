var Hotkeys = function( options ){
	
	var _this = this,
		pressed = [],
		hotkeys = {},
		callbacks = {
			onAdd: function(hotkey){},
			onDone: function(hotkey){},
			onChange: function(hotkey){},
			onRemove: function(hotkey){},
			onTrigger: function(hotkey){},
			onCreate: function(){},
			onDestroy: function(){},
		},
		aliases = {
			16 : 'shift',
			17 : 'ctrl',
			18 : 'alt',
			9 : 'tab',
			13 : 'enter',
			8 : 'backspace',
			32 : 'spacebar',
		},
		destroyed = false;

	options = options || {};

	// При нажатии клавиши
	// Добавить в список нажатые клавиши
	function keydown( event ){
		var keyCode = getKeyCode( event ),
			hotkey;

		if( !checkKey( keyCode ) ){
			pressed.push( keyCode );
		}
		
		hotkey = checkCombination( hotkeys, pressed );

		if(!hotkey){
			return;
		}
		if( hotkey.prevent ){
			event.preventDefault();
		}
		if( event.repeat ){
			return;
		}

		if( hotkey.func ){
			hotkey.func();
			callbacks.onDone(hotkey);

		}

	}

	// При отпускании клавиш
	// Удалить из списка отпущенные клавиши
	function keyup( event ){
		var keyCode = getKeyCode( event ),
			pos;
		
		if( checkKey( keyCode ) ){
			pos = pressed.indexOf( keyCode );
			pressed.splice( pos, 1 );
		}

	}

	// Добавить событие на хоткей
	// hotkey.add(string, function[, boolean]);
	this.add = function( combination, func, prevent ){
		var comb;

		if( prevent === undefined ){
			prevent = true;
		}

		if(arguments.length < 2){
			throw TypeError( 'Failed to execute \'add\' on \'Hotkeys\': 2 arguments required, but ' + arguments.length + ' present.' );			
		}
		if( typeof( combination ) != 'string'){
			throw TypeError( 'The first argument must be a string' );
		}
		if( typeof( func ) != 'function'){
			throw TypeError( 'The second argument must be a function' );
		}

		comb = combination.toLowerCase();

		var symbols = comb.split( '+' ),
			codes = [],
			symbol;
			
		for(var index = 0, length = symbols.length; index < length; index++){
			symbol = symbols[ index ];
			codes.push( toCode( symbol ) );

		}

		var hotkeyObject = {
			combination: combination,
			symbols: symbols,
			codes: codes,
			length: codes.length,
			func: func,
			prevent: prevent
		};

		if( destroyed ){
			destroyed = false;
			addListeners();
		}

		if( hotkeys[ comb ] ){
			hotkeys[ comb ] = hotkeyObject;
			callbacks.onChange(hotkeyObject);
		} else {
			hotkeys[ comb ] = hotkeyObject;
			callbacks.onAdd(hotkeyObject);
		}


		return _this;

	};

	// Удалить слушателя события для комбинации
	// hotkey.remove(string);
	this.remove = function( combination ){
		var comb, hotkey;

		if(arguments.length < 1){
			throw TypeError( 'Failed to execute \'remove\' on \'Hotkeys\': 1 argument required, but ' + arguments.length + ' present.' );			
		}

		comb = combination.toLowerCase();

		if( hotkeys[ comb ] === undefined ){
			throw TypeError( 'Hotkey ' + combination + ' is undefined' );
		}
		hotkey = hotkeys [ comb ];
		delete hotkeys[ comb ];

		callbacks.onRemove( hotkey );

		return _this;
	};

	// Генерировать нажатие комбинации
	// hotkey.trigger('Ctrl+S');
	this.trigger = function( combination ){
		var hotkey, comb;

		if(arguments.length < 1){
			throw TypeError( 'Failed to execute \'trigger\' on \'Hotkeys\': 1 argument required, but ' + arguments.length + ' present.' );			
		}

		comb = combination.toLowerCase();
		hotkey = hotkeys[ comb ];

		if( hotkey === undefined ){
			throw TypeError( 'Hotkey ' + combination + ' is undefined' );	
		}

		hotkey.func();
		callbacks.onTrigger( hotkey );

		return _this;
	};

	// Разрушение библиотеки
	this.destroy = function(){
		
		destroyed = true;
		removeListeners();
		callbacks.onDestroy();

		return _this;
	};

	// Проверка наличия нажатой клавиши в нашем массиве нажатых клавиш
	function checkKey( keyCode ){
		if( pressed.indexOf( keyCode ) !== -1 ){
			return true;
		}
		return false;
	}

	// Возвращает keyCode из event
	function getKeyCode( event ){
		var keyCode = event.keyCode || event.which || event.charCode;

		keyCode = codeLowerCase( keyCode );
		return keyCode;
	}

	// Преобразование кода клавиши в Символ
	function toSymbol( keyCode ){
		if(aliases[ keyCode ]){
			return aliases[ keyCode ];
		}
		return String.fromCharCode( keyCode );
	}

	// Преобразование символа в код клавиши
	function toCode( symbol ){
		for( var code in aliases ){
			if( aliases[ code ] == symbol ){
				return +code;
			}
		}
		return +symbol.charCodeAt( 0 );
	}

	// lowercase из кода клавиши
	function codeLowerCase( keyCode ){
		return toCode( toSymbol( keyCode ).toLowerCase() );
	}

	// Очистка массива нажатых клавиш
	function clearPressed(){
		pressed = [];
	}

	// Проверка на совпадения клавиш с хоткеями
	function checkCombination( hotkeys, codes ){
		var hotkeyCodes,
			bestElem = { length: 0 },
			hotkey;

		for( var key in hotkeys ){
			if (hotkeys.hasOwnProperty(key)) {
				hotkey = hotkeys[ key ];
				hotkeyCodes = hotkey.codes;

				if( exist( codes, hotkeyCodes ) && hotkey.length > bestElem.length ){
					bestElem = hotkey;
				}
			}
		}
		if( bestElem.length > 0 ){
			return bestElem;
		}
		return false;
	}

	// Проверка массива на вхождение в другой
	function exist( base, primary ){
		var hash = {},
			key,
			result = true;

		for(var baseIndex = 0, baseLength = base.length; baseIndex < baseLength; baseIndex++){
			key = base[ baseIndex ];
			hash[ key ] = true;
		}
		for(var primaryIndex = 0, primaryLength = primary.length; primaryIndex < primaryLength; primaryIndex++){
			key = primary[ primaryIndex ];
			if( !( key in hash ) ){
				result = false;
			}
		}
		return result;
	}

	// Назначение обработчиков событий браузера
	function addListeners(){
		document.addEventListener( 'keydown', keydown, false );
		document.addEventListener( 'keyup', keyup, false );
		window.addEventListener('blur',clearPressed,false);
	}

	// Удаление обработчиков событий браузера
	function removeListeners(){
		document.removeEventListener( 'keydown', keydown);
		document.removeEventListener( 'keyup', keyup);
		window.removeEventListener( 'blur', clearPressed);
	}

	// Создание основы
	function create( options ){
		var func;

		for (var callbackKey in callbacks){
			if( options.hasOwnProperty(callbackKey) ){
				callbacks[ callbackKey ] = options[ callbackKey ];
				delete options[ callbackKey ];
			}
		}

		for (var key in options){
			if (options.hasOwnProperty(key)) {
				func = options[ key ];
				_this.add( key, func );
			}
		}

		addListeners();
		callbacks.onCreate();
	}

	create(options);
};