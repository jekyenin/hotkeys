var Hotkeys = function( startHotkeys ){

	var _this = this,
		pressed = [],
		hotkeys = {},
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

	// При нажатии клавиши
	// Добавить в список нажатые клавиши
	function keydown( event ){
		var keyCode = getKeyCode( event ),
			match;

		if( !checkKey( keyCode ) ){
			pressed.push( keyCode );
		}
		
		hotkey = checkCombination( hotkeys, pressed );

		if(!hotkey){
			return;
		}
		
		event.preventDefault();
		if( event.repeat ){
			return;
		}

		if( hotkey.func ){
			hotkey.func();
		}

	}

	// При отпускании клавиш
	// Удалить из списка отпущенные клавиши
	function keyup( event ){
		var keyCode = getKeyCode( event );
		
		if( checkKey( keyCode ) ){
			pos = pressed.indexOf( keyCode );
			pressed.splice( pos, 1 );
		}

	}

	// Добавить событие на хоткей
	// hotkey.add('Ctrl+S', save);
	this.add = function( combination, func ){
		if(arguments.length < 2){
			throw TypeError( 'Failed to execute \'add\' on \'Hotkeys\': 2 arguments required, but ' + arguments.length + ' present.' );			
		}
		if( typeof( combination ) != 'string'){
			throw TypeError( 'The first argument must be a string' );
		}
		if( typeof( func ) != 'function'){
			throw TypeError( 'The second argument must be a function' );
		}

		combination = combination.toLowerCase();

		var symbols = combination.split( '+' ),
			codes = [],
			symbol;
			
		for(var index = 0, length = symbols.length; index < length; index++){
			symbol = symbols[ index ];
			codes.push( toCode( symbol ) );

		}

		var hotkeyObject = {
			symbols: symbols,
			codes: codes,
			length: codes.length,
			func: func,
		};

		if( destroyed ){
			destroyed = false;
			addListeners();
		}

		hotkeys[ combination ] = hotkeyObject;

		return _this;

	}

	// Удалить слушателя события для комбинации
	// hotkey.remove('Ctrl+S');
	this.remove = function( combination ){
		if(arguments.length < 1){
			throw TypeError( 'Failed to execute \'remove\' on \'Hotkeys\': 1 argument required, but ' + arguments.length + ' present.' );			
		}

		comb = combination.toLowerCase();

		if( hotkeys[ comb ] === undefined ){
			throw TypeError( 'Hotkey ' + combination + ' is undefined' );
		}
		delete hotkeys[ comb ];

		return _this;
	}

	// Генерировать нажатие комбинации
	// hotkey.trigger('Ctrl+S');
	this.trigger = function( combination ){
		if(arguments.length < 1){
			throw TypeError( 'Failed to execute \'trigger\' on \'Hotkeys\': 1 argument required, but ' + arguments.length + ' present.' );			
		}
		comb = combination.toLowerCase();
		hotkey = hotkeys[ comb ];
		if( hotkey === undefined ){
			throw TypeError( 'Hotkey ' + combination + ' is undefined' );	
		}
		hotkey.func();

		return _this;
	}

	// Разрушение библиотеки
	this.destroy = function(){
		destroyed = true;
		removeListeners();

		return _this;
	}

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
		for( code in aliases ){
			if( aliases[ code ] == symbol ){
				return +code;
			}
		}
		return +symbol.charCodeAt( 0 );
	}

	// lowercase из кода клавиши
	function codeLowerCase( keyCode ){
		return toCode( toSymbol( keyCode ).toLowerCase() );
	};

	// Очистка массива нажатых клавиш
	function clearPressed(){
		pressed = [];
	};

	// Проверка на совпадения клавиш с хоткеями
	function checkCombination( hotkeys, codes ){
		var hotkeyCodes,
			bestElem = { length: 0 };

		for( key in hotkeys ){
			hotkey = hotkeys[ key ];
			hotkeyCodes = hotkey.codes;

			if( exist( codes, hotkeyCodes ) && hotkey.length > bestElem.length ){
				bestElem = hotkey;
			}
		}
		if( bestElem.length > 0 ){
			return bestElem;
		}
		return false;
	};

	// Проверка массива на вхождение в другой
	function exist( base, primary ){
		var hash = {},
			key,
			result = true;

		for(var index = 0, length = base.length; index < length; index++){
			key = base[ index ];
			hash[ key ] = true;
		}
		for(var index = 0, length = primary.length; index < length; index++){
			key = primary[ index ];
			if( !( key in hash ) ){
				result = false;
			}
		}
		return result;
	};

	// Назначение обработчиков событий браузера
	function addListeners(){
		document.addEventListener( 'keydown', keydown, false );
		document.addEventListener( 'keyup', keyup, false );
		window.addEventListener('blur',clearPressed,false);
	};

	// Удаление обработчиков событий браузера
	function removeListeners(){
		document.removeEventListener( 'keydown', keydown);
		document.removeEventListener( 'keyup', keyup);
		window.removeEventListener( 'blur', clearPressed);
	};

	// Создание основы
	function create( startHotkeys ){
		var func;

		for (key in startHotkeys){
			func = startHotkeys[ key ];
			_this.add( key, func );
		}

		addListeners();
	};

	create(startHotkeys);
}