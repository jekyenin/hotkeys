var textarea = document.querySelector('#log'),
	addButton = document.querySelector('#addButton'),
	addField = document.querySelector('#addField'),
	preventField = document.querySelector('#addPrevent'),
	list = document.querySelector('#list'),
	codes = document.querySelectorAll('.code'),
	code;

var hotkeys = new Hotkeys({
	onAdd: hotkeyAdd,
	onRemove: hotkeyRemove,
	onDone: function(hotkey){
		log('Комбинация ' + hotkey.combination + ' выполнена.');
	},
	onChange: function(hotkey){
		log('Комбинация ' + hotkey.combination + ' была изменена.');
	},
	onTrigger: function(hotkey){
		log('Функция-обработчик комбинации ' + hotkey.combination + ' была выполнена.');
	},
	onCreate: function(){
		log('Экземпляр плагина Hotkeys был создан.');
	},
	onDestroy: function(){
		log('Экземпляр плагина Hotkeys был разрушен.');
	}

});

hotkeys.add('Ctrl+Shift+C', function(){});

hotkeys.add('Ctrl+E', function(){}, false);

addButton.addEventListener('click', add, false);
document.addEventListener('click', hotkeyClick, false);

function log( text ){
	if( textarea.value !== ''){
		textarea.value += '\n';
	}
	textarea.value += text;
	textarea.scrollTop = textarea.scrollHeight;
}
function add(){
	event.preventDefault();
	value = addField.value;
	checked = preventField.checked;
	hotkeys.add(value, function(){}, checked);
}
function hotkeyClick(event){
	var combination;

	combination = event.target.parentNode.getAttribute('data-combination');
	if( !combination ){
		return;
	}
	event.preventDefault();
	if(event.target.matches('span.remove')){
		hotkeys.remove(combination);
	}
	if(event.target.matches('.hotkey a')){
		hotkeys.trigger(combination);
	}
}
function hotkeyAdd(hotkey){
	list.innerHTML += '<li class="hotkey" data-combination="' + hotkey.combination + '"><a href="#">' + hotkey.combination + ' </a><span class="remove"></span></li>';
	log('Комбинация ' + hotkey.combination + ' была добавлена.');
}
function hotkeyRemove(hotkey){
	removeNode(list.querySelector("[data-combination='"+hotkey.combination+"']"));
	log('Комбинация ' + hotkey.combination + ' была удалена.');
}
function removeNode(elem){
	elem.parentNode.removeChild(elem);
}

for(var i = 0, length = codes.length; i < length; i++){
	code = codes[i];
	code.innerHTML = Syntax(code.innerHTML);
}