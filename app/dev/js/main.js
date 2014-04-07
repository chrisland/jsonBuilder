
// v 0.6
//
// begin: 2014-02-20

var gui = require('nw.gui');

onload = function() {
	var win = gui.Window.get();
	win.show();
	win.showDevTools();
}


process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});
  

window.ondragover = function(e) { e.preventDefault(); return false };
window.ondrop = function(e) { e.preventDefault(); 


   // console.log(e.dataTransfer.files[0].path);

  _openpath = e.dataTransfer.files[0].path;
	_fs.readFile(_openpath, "utf-8", function (err, data) {
		if (err) throw err;
		//console.log(data);
		unsavedHide();
		renderJsonFromStr(data, true);
		//##renewTrigger();
	});
	
  return false };



   
/*
	GLOBALS
*/ 

var _fs = require('fs');


var _editable = true,
	_openpath = undefined,
	_jsonObj = {},
	_history = [],
	_history_open = 0,
	_textarea_nice = false,
	_textarea_encode = false;

var _errorMsg;
	
	/*
var _trigger_open = jQuery('<input />', {type: 'text', class:'trigger trigger_open',value:'{',readonly: true}),
	_trigger_close = jQuery('<input />', {type: 'text', class:'trigger trigger_close',value:'}',readonly: true});
	*/
	
var _trigger_open = jQuery('<input />', {type: 'text', class:'trigger trigger_open',value:''}),
	_trigger_close = jQuery('<input />', {type: 'text', class:'trigger trigger_close',value:''});


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size-1;
};




/*
	history_log
*/

var history_log = function (jsonobj) {
	_history.push(jsonobj);
	_history_open++;
	
	//console.log(_history);
	//console.log(_history_open);
	jQuery('#toolbar_undo').prop('disabled',false);
};


/*
	history_undo
*/

var history_undo = function () {
	if (_history_open-1 >= 0) {
		_history_open = _history_open-1;
		//console.log('render und '+_history_open);
		renderJsonFromObj(_history[_history_open]);
		jQuery('#toolbar_redo').prop('disabled',false);
	} else {
		jQuery('#toolbar_undo').prop('disabled',true);
	}
	
};

/*
	history_redo
*/

var history_redo = function () {
	if (_history_open+1 <= _history.length-1) {
		_history_open = _history_open+1;
		//console.log('render  red'+_history_open);
		renderJsonFromObj(_history[_history_open]);
	} else {
		jQuery('#toolbar_redo').prop('disabled',true);
	}
};


/*
	openLocalFile
*/

var openLocalFile = function(evt) {
	//console.log($(this).val());
	_openpath = $(this).val();
	_fs.readFile(_openpath, "utf-8", function (err, data) {
		if (err) throw err;
		//console.log(data);
		unsavedHide();
		renderJsonFromStr(data, true);
		//##renewTrigger();
	});
};


/*
	unsavedHide
*/

var unsavedHide = function () {
	jQuery('#toolbar_save').prop('disabled',true);
};

/*
	unsavedShow
*/

var unsavedShow = function () {
	jQuery('#toolbar_save').prop('disabled',false);
};

/*
	toolbar_save
*/

var toolbar_save = function (e){
	if(!_openpath) { 
		toolbar_saveAs();
		//alert('no saved');
		return false;
	}
	//alert('save '+_openpath);
	var jsonstring = getJsonString();
	_fs.writeFile(_openpath, jsonstring, "utf-8", function (err, data) {
		if (err) throw err;
		unsavedHide();
	});
}


/*
	toolbar_save
*/

var toolbar_saveAs = function (){

	var node = jQuery('#system_savefile');
	node.on('change', function () {
		_openpath = $(this).val();
		
		if (!_openpath) {
			return false;
		}

		//alert('save as '+_openpath);
		toolbar_save();
		return false;
	});
	node.trigger('click');
	return false;
};


/*
	toolbar_new
*/

var toolbar_new = function (e){
	_openpath = undefined;
	unsavedHide();
	renderJsonFromStr('{"":""}', true);
	//##renewTrigger();
	return false;
};

/*
	toolbar_open
*/

var toolbar_open = function (e){
	var node = jQuery('#system_openfile');
	node.on('change', openLocalFile);
	node.trigger('click');
	return false;
};

/*
	getJsonString
*/

var getJsonString = function () {
	var str = jQuery('#textarea_jsonstring').val();
	if (str) {
		return str;
	}
	return '';
};


/*
	showMsg
*/

var showMsg = function () {

	if (_errorMsg) {
		jQuery('#msgbox')
			.text(_errorMsg).show()
			.on('mouseover',function() {
				jQuery('#msgbox').hide();
			});
	}
};



/*
	pareseJsonToObj
*/

var pareseJsonToObj = function (str) {
	if (str) {
		
		try {
			return JSON.parse(str);
		} catch (e) {
		  	console.log("Parsing error:", e);
		  	_errorMsg = e;
		  	return false;
		}

	}
	return false;
};

/*
	pareseObjToJson
*/

var pareseObjToJson = function (obj) {
	if (obj) {
		if (_textarea_nice) {
			return JSON.stringify(obj, null, "\t");
		}
		return JSON.stringify(obj);
	}
	return false;
};

/*
	reRenderDom
*/

var reRenderDom = function () {

	
	var obj = getJsonFromDom();
	if (!obj) {
		showMsg();
		return false;
	} else {
		renderJsonFromObj(obj);
		history_log(obj);
	}
	
	
	
};


/*
	getJsonFromDom
*/

var getJsonFromDom = function () {
	
	var str = '',
		openPair = true;
	
	jQuery('#content_body').find('input').each(function(i, k){
		
		
		var typ = jQuery(k).data('type'),
			val = jQuery(k).val();

		if (jQuery(k).hasClass('inputKey')) {

			
			if (_textarea_encode) {
				val = encodeURIComponent(val);
			} else {
				val = val.replace(/["']/g, "");
			}
			str += '"'+val+'":';
			//openPair = true;
		

		} else if (jQuery(k).hasClass('inputValue')) {
		
			
			if (_textarea_encode) {
				val = encodeURIComponent(val);
			} else {
				val = val.replace(/["']/g, "");
			}
			if (val == '') {
				str += '""';
			} else {
				if (isNaN(val)) {
					str += '"'+val+'"';
				} else {
					str += val;
				}
			}
			//str += '"'+val+'"';
			//openPair = false;
			
			
		} else if (jQuery(k).hasClass('inputTrigger')) {
		
			str += val;
		}


	});
	console.log(str);
	
	var obj = pareseJsonToObj(str);
	if (!obj) {
		showMsg();
		return false;
	}
	unsavedShow();
	return obj;	
};



/*
	renderJsonFromStr
*/

var renderJsonFromStr = function (jsonstring, history) {
	
	var obj = pareseJsonToObj(jsonstring);
	if (!obj) {
		showMsg();
		return false;
	}
	_jsonObj = obj;
	renderJsonFromObj(_jsonObj);
	if (history == true) {
		history_log(_jsonObj);
	}
};

/*
	renderJsonFromObj
*/

var renderJsonFromObj = function (jsonobj) {
	
	//console.log('renderJsonFromObj');
	//console.log(jsonobj);
	
	var str = pareseObjToJson(jsonobj);
	//alert(str);
	jQuery('#textarea_jsonstring').text(str);
	
	
	_jsonObj = jsonobj
	//console.log(_jsonObj);
	
	var dom = jQuery('<table class="mainTable" />');
	var i = 0;
	var objSize = Object.size(_jsonObj);
	
	dom.append('<input value="{" class="inputTrigger" />');
	
	Object.keys(_jsonObj).forEach(function(key) {
	   
	   // console.log(key, _jsonObj[key]);


	    dom.append( makeBlock( _jsonObj[key], key, i, objSize ) );
	   /*
 
	    if (i != objSize) {
	    	//console.log(i, objSize);
			dom.append('<input value="," class="inputTrigger" />');    
	    }
*/

	    i++;
	});
	
	dom.append('<input value="}" class="inputTrigger" />');
	
	dom.on('change','.editable', function (e) {
			
		var obj = getJsonFromDom();
		if (!obj) {
			return false;
		}
		history_log(obj);
		
		jQuery('#textarea_jsonstring').text(pareseObjToJson(obj));
		
		return false;
	});
		
		
	dom.on('focus','.editable', function (e) {
		jQuery('#content_body').find('.active').removeClass('active');
		jQuery(e.currentTarget).parent().parent().addClass('active');
		return false;
	});
	
	dom.on('click','.clickable', function (e) {
		jQuery('#content_body').find('.active').removeClass('active');
		jQuery(e.currentTarget).parent().parent().addClass('active');
		return false;
	});
			

	 
	jQuery('#content_body').html('').append(dom);


};


/*
	makeBlock
*/

var makeBlock = function (obj, key, i, objSize) {
	//console.log(obj);
	
	var box = jQuery('<tr />');
	var content = jQuery();
	
	
	
	if ( jQuery.isArray(obj) ) {
		//console.log('-> array');

		var span = jQuery('<table />', {class:'arrayTable'});
		var ia = 0;
		var objSizea = Object.size(obj);
		Object.keys(obj).forEach(function(key2) {
			span.append( makeBlock( obj[key2], undefined, ia, objSizea ) );
			ia++;
		});
		
		span.find('.inputKey').remove();
		
		var dom = jQuery();
		//var td_key = jQuery('<td>');
		var td_value = jQuery('<td>');
		
		//td_key.append(domKey);
		
		td_value.append('<input value="[" class="inputTrigger" />');
		
		td_value.append(span);
		td_value.append('<input value="]" class="inputTrigger" />');
		
	//	dom = dom.add(td_key).add(td_value);
		
		var td_key = jQuery('<td>');
		if (key) {
			var domKey = jQuery('<input />', {value: key, class: 'editable inputKey'}); 
		} else {
			var domKey = jQuery('<button />', {text: '###',class: 'clickable'}); 
		}
		td_key.append(domKey);
		td_key.append('a');
		dom = dom.add(td_key);
		
		dom = dom.add(td_value);
		
		content = content.add(dom);
		
		
		
	} else if ( typeof obj === 'object' ) {
		//console.log('-> obj');
		
		
		
		var span = jQuery('<table />', {class:'objTable'});
		var ia = 0;
		var objSizea = Object.size(obj);
		Object.keys(obj).forEach(function(key2) {
			span.append( makeBlock( obj[key2], key2, ia, objSizea ) );
			ia++;
		});

		var dom = jQuery();
		
		var td_value = jQuery('<td>');
		
		
		
		td_value.append('<input value="{" class="inputTrigger" />');
		td_value.append(span);
		td_value.append('<input value="}" class="inputTrigger" />');
		
		var td_key = jQuery('<td>');
		if (key) {
			var domKey = jQuery('<input />', {value: key, class: 'editable inputKey'}); 
		} else {
			var domKey = jQuery('<button />', {text: '###',class: 'clickable'}); 
		}
		td_key.append(domKey);
		td_key.append('o');
		dom = dom.add(td_key);
		
		dom = dom.add(td_value);
		
		content = content.add(dom);
		
	} else {
		//console.log('-> text');
		content = content.add( getBoxInput(obj, key, true) );
		
		
			
		//content = content.add('<input value=",#" class="inputTrigger" />');
	}
	
	if (i != objSize) {
		content = content.add('<input value="," class="inputTrigger" />');
		box.addClass('triggert');
	}
	
	//content = content.add('<input value="}" />');
	
	box.append(content);
	
	return box;
};



/*
	getBoxInput
*/

var getBoxInput = function(value, key, forceKey) {
	

	value = decodeURIComponent(value);
	
	var span = jQuery();
	
	
	var domValue = jQuery('<input />', {value: value, class: 'editable inputValue'}); 
	
	
	
	//var domKey = undefined;
	if (key || forceKey) {
		//console.log('->', key);
		var domKey = jQuery('<input />', {value: key, class: 'editable inputKey'}); 
		span = span.add( jQuery('<td>').append(domKey) );
	}
	
	
	span = span.add( jQuery('<td>').append(domValue) );
	
	
	
		
	return span;
	
}




/*

	INIT

*/

function init() {


	jQuery('#toolbar_new').on('click',toolbar_new);
	jQuery('#toolbar_open').on('click',toolbar_open);
	
	jQuery('#toolbar_save').on('click',toolbar_save);
	
	jQuery('#toolbar_undo').on('click',history_undo);
	jQuery('#toolbar_redo').on('click',history_redo);
	
	
	
	jQuery('#textarea_jsonstring').on('mouseover',function () {
	
		reRenderDom();
		return false;
	});
	
	
	
	jQuery('#textarea_nice').on('click',function () {
		if (_textarea_nice == true) {
			_textarea_nice = false;
			jQuery('#textarea_nice').removeClass('touch');
		} else {
			_textarea_nice = true;
			jQuery('#textarea_nice').addClass('touch');
		}
		//reRenderDom();
		return false;
	});
	
	jQuery('#textarea_encode').on('click',function () {
		if (_textarea_encode == true) {
			_textarea_encode = false;
			jQuery('#textarea_encode').removeClass('touch');
		} else {
			_textarea_encode = true;
			jQuery('#textarea_encode').addClass('touch');
		}
		//reRenderDom();
		return false;
	});
	
	
	jQuery('#json_insert').on('click',function (e) {
		
		var active = jQuery('#content_body .active');
		if (active.length != 1) { return false; }
		
		if ( active.parent().parent().hasClass('objTable') ) {
			
			
			
			var td = active.find('.inputValue').parent('td');
			td.find('.inputValue').remove();
			
			td.append('<input value="{" class="inputTrigger" />');
			td.append( getBoxInput('', '', true) );
			td.append('<input value="}" class="inputTrigger" />');
			
		}
		
	});
	
	
	jQuery('#json_add').on('click',function (e) {
	
		var active = jQuery('#content_body .active');
		if (active.length != 1) { return false; }
		/*

		alert( active.parent().parent().attr('class') );
		
		var tableclass = active.parent().parent().attr('class');
		
		if (tableclass == 'arrayTable') {
			
		}
*/


		var tr = active.clone();
		tr.removeClass('active'); 
		
		tr.find('.editable').val('');
		
		tr.find('table').remove();
		tr.find('.inputTrigger').remove();
		

		active.after(tr);

		if ( tr.next('tr').length > 0 ) {
			tr.addClass('triggert2').append('<input value="," class="inputTrigger" />'); 
		}
		

		if ( !active.hasClass('triggert') ) {
			active.addClass('triggert').append('<input value="," class="inputTrigger" />'); 
		}
		//reRenderDom();
		return false;
		
	});
	
	jQuery('#json_dupli').on('click',function (e) {
	
		var active = jQuery('#content_body .active');
		if (active.length != 1) { return false; }

		var tr = active.clone();
		tr.removeClass('active'); //.find('editable').val('');

		active.after(tr);

		if ( !active.hasClass('triggert') ) {
			active.addClass('triggert').append('<input value="," class="inputTrigger" />'); 
		}
		//reRenderDom();
		return false;
	});
	
	

	
	jQuery('#json_del').on('click',function (e) {
		
		var active = jQuery('#content_body .active');
		if (active.length != 1) { return false; }
		
		if ( active.next('tr').length == 0 ) {
			active.prev('tr').find('.inputTrigger').remove(); 
		}
		
		
		active.remove();
		
	});
	
	
	
	jQuery("#page").split({
	    orientation: 'vertical',
	    limit: 70,
	    position: '20%'
	});
	
	
	jQuery(document).on('keydown',function (e) {
		//console.log(e);
		if (e.metaKey) {
			switch (e.keyCode) {
				case 78: // n
					toolbar_new()
					return false;
					break;
				case 87: // w
					//MYAPP.filesystem.remove();
					e.preventDefault();
					return false;
					break;
				case 79: // o
					toolbar_open();
					break;
				case 83: // s
				

					if (e.shiftKey) {
						toolbar_saveAs();
					} else {
						toolbar_save();
					}

					return true;
					break;
				case 90: // z
				
					if (e.shiftKey) {
						history_redo();
					} else {
						history_undo();
					}
					break;
			}
		}
	});
	
	
	// START BLANK !!!

	//renderJsonFromStr('{"":""}', false);
}

init();



