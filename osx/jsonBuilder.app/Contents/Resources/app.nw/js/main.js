
// v 0.4
//
// begin: 2014-02-20

var gui = require('nw.gui');

onload = function() {
	var win = gui.Window.get();
	win.show();
	//win.showDevTools();
}

  
  
   
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
	_textarea_encode = false,
	_trigger_open = jQuery('<input />', {type: 'text', class:'trigger trigger_open',value:'{',readonly: true}),
	_trigger_close = jQuery('<input />', {type: 'text', class:'trigger trigger_close',value:'}',readonly: true});


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
		renewTrigger();
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
		//toolbar_saveAs();
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
		//toolbar_save();
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
	renewTrigger();
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
	pareseJsonToObj
*/

var pareseJsonToObj = function (str) {
	if (str) {
		
		try {
		 return JSON.parse(str);
		} catch (e) {
		  console.error("Parsing error:", e); 
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
	
	renderJsonFromObj(obj);
	history_log(obj);
	
	
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
			
		if (val == '}') {
			str += '}';
			return;
		} if (val == '{') {
			str += '{';
			return;
		}
		
		if (str && !openPair) {
			str += ',';
		}
		
		if (jQuery(k).hasClass('inputKey')) {
	//	if (typ == 'key') {
			
			str += '"'+val+'":';
			openPair = true;
	//	} else if (typ == 'value') {
		} else if (jQuery(k).hasClass('inputValue')) {
			val = val.replace('"','');
			if (_textarea_encode) {
				val = encodeURIComponent(val);
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
			openPair = false;
		}

	});
	//console.log(str);
	var obj = pareseJsonToObj(str);
	unsavedShow();
	return obj;	
};



/*
	renderJsonFromStr
*/

var renderJsonFromStr = function (jsonstring, history) {
	
	_jsonObj = pareseJsonToObj(jsonstring);
	renderJsonFromObj(_jsonObj);
	if (history == true) {
		history_log(_jsonObj);
	}
};

/*
	renderJsonFromObj
*/

var renderJsonFromObj = function (jsonobj) {
	
	
	var str = pareseObjToJson(jsonobj);
	//alert(str);
	jQuery('#textarea_jsonstring').text(str);
	
	
	_jsonObj = jsonobj
	//console.log(_jsonObj);
	
	var dom = jQuery();
	var i = 1;
	var objSize = Object.size(_jsonObj);
	Object.keys(_jsonObj).forEach(function(key) {
	   // console.log(key, _jsonObj[key]);
	   
	    dom = dom.add(getRow(key, _jsonObj[key], i, 0, objSize+1, _editable));
	    i++;
	});
	//console.log(dom);
	dom = makeTable(dom);
	dom = makeTrigger(dom);
	
	
	
	 
	jQuery('#content_body').html('').append(dom);//.append('<div class="breaker"></div>');

	
	moveAddBtn();
	
};

jQuery(window).resize(function() {
	moveAddBtn();
	//alert('jo');
});

var moveAddBtn = function () {
	
	jQuery('#content_body').find('.li_third').each(function (i,k) {
		
		jQuery(k).css('height',jQuery(k).prev('.li_second')[0].scrollHeight );
		//alert(jQuery(k).prev('.li_second')[0].scrollHeight);
		
	});
	
};




/*
	getRow
*/

var getRow = function (key, obj, i, rootRow, lastRow, _editable) {
	/*
	if (parentKeyPath) {
		parentKeyPath += '/';
	}*/
	//var newParentKeyPath = parentKeyPath+'/'+key;
	var tr = jQuery('<li />', {'data-i':i, 'data-rootRow':rootRow, 'data-lastRow':lastRow });
	var td_k = jQuery('<div />', {text: key, class:"li_first"}).appendTo(tr);
	if (_editable) {
		td_k.html(getInput(key,'key', i, rootRow));
	}
	if ( typeof obj === 'object' ) {
		var td_v = jQuery('<div />', {class: "li_second"});
		//parentRownr++;
		var ia = 0;
		var objSize = Object.size(obj);
		var leer = jQuery();
		Object.keys(obj).forEach(function(key) {
			leer = leer.add(getRow(key, obj[key], ia, i, objSize, _editable));
			ia++;
		});
		leer = makeTable(leer);
		leer = makeTrigger(leer);
		td_v.append(leer);
		tr.append(td_v);
	} else {
		var td_v = jQuery('<div />', {text: obj, class: "li_second"}).appendTo(tr);
		if (_editable) {
			td_v.html(getInput(obj,'value', i, rootRow));
		}
	}
	
	if (_editable && lastRow == i ) {

	    var addBtn = jQuery('<button/>', {text: '+', class: 'addBtn'})
	    //.data('keypath',parentKeyPath)
	    .on('click', function (e) {
	    	
	    	//alert('jo');
	    	var inputKey = jQuery(e.currentTarget).parent().parent().find('.li_first');
	    	var val = inputKey.find('.inputKey').val();
	    	//alert(val);
	    	if (val) {
		    	var row = getRow('', '', i+1, rootRow , lastRow+1, _editable);
		    	var tr = jQuery(e.currentTarget).parent().parent();
		    	tr.after(row);
		    	
		    	renewTrigger();
		    	
				reRenderDom();
			} else {
				inputKey.fadeOut(200, function () {
					inputKey.fadeIn(400);
				});
			}
	    });
	    var btndom = jQuery('<div />', {class:"li_third"}).append(addBtn);
	   // btndom.css('height',tr.find('.li_second')[0].scrollHeight );
	    tr.find('.li_second').first().after(btndom);
	}


	tr.find('.input').on('focus', function (e) {
		jQuery('#content_body').find('.helpers').hide();
		jQuery(e.currentTarget).parent().parent().find('.helpers').first().show();
	});
	return tr.append(jQuery('<div class="breaker"></div>'));	
};



/*
	getInput
*/

var getInput = function(value, type, i, rootRow) {
	var span = jQuery();
	var dom = jQuery('<input />', {value: decodeURIComponent(value), class: 'input'}).data('type',type).data('nr',i).data('rootRow',rootRow);
	dom.on('change', function (e) {
		

		var obj = getJsonFromDom();
		history_log(obj);
		
		jQuery('#textarea_jsonstring').text(pareseObjToJson(obj));
		
	
		return false;
	})
	.on('dblclick', function (e) {
		//alert('jo');
		//var str = jQuery(e.currentTarget).val();
		
		
		//jQuery('#content_body').find('.extendDiv').removeClass('extend').prop('disabled',false);
			
			
		if ( jQuery(e.currentTarget).parent().find('.extendDiv').length <= 0 ) {
			
			jQuery('#content_body').find('.extendDiv').remove();
			
			var str = jQuery(e.currentTarget).val();
			var extend = jQuery('<div />', {class:'extendDiv'});
			var textarea = jQuery('<textarea />', {text: str});
			textarea.on('change', function (e) {
				jQuery(e.currentTarget).parent().parent().find('.input')
					.val(jQuery(e.currentTarget).val())
					.trigger('change');
			});
			extend.append(textarea);
			jQuery(e.currentTarget).after(extend); //.prop('disabled',true);
			jQuery(e.currentTarget).parent().find('.input').on('change', function (e) {
				jQuery(e.currentTarget).parent().find('textarea')
					.val(jQuery(e.currentTarget).val());
			});
			
		} else {
			
		}
		
	});
	
	span = span.add(dom);
	
	
	if (type == 'value') {
		
	    dom.attr('placeholder','Value').addClass('inputValue');
	    
	} else if(type == 'key') {
	
		var place = jQuery('<div />', {class:'helpers hidden'});
		
		var del = jQuery('<button/>', {text: '', class: 'valueBtn valueBtn_del', tabindex: '-1'})
	   // .data('keypath',parentKeyPath)
	   .data('icon', '&#xe054;')
	    .on('click', function (e) {
		    
		    var tr = jQuery(e.currentTarget).parent().parent().parent();

			var parentTr = tr.parent();
			tr.remove();
			 
			if (parentTr.find('.input').length < 1) {
				//alert('jetzt');
				
				var input = getInput('', 'value', 0, 0);
				parentTr.append(input);
			}
			
		   	renewTrigger();
		   	
		   	reRenderDom();
		    return false;
	    });
	    //span.append(del);
	    //span = span.add(del);
	    place.append(del);
	    
		var dupli = jQuery('<button/>', {text: '', class: 'valueBtn valueBtn_dupli', tabindex: '-1'})
	   // .data('keypath',parentKeyPath)
	    .on('click', function (e) {
		    
		    var dom = jQuery(e.currentTarget).parent().parent().parent();
		    var dom_new = dom.clone();
		    dom_new.find('.inputKey').first().val(dom_new.find('.inputKey').val()+'_2');
		    dom.after(dom_new);

		   	renewTrigger();
		   	
		   	reRenderDom();
		    return false;
	    });
		place.append(dupli);
		
		
		var typ = jQuery('<button/>', {text: '', class: 'valueBtn valueBtn_obj', tabindex: '-1'})
	   // .data('keypath',parentKeyPath)
	    .on('click', function (e) {
		    
		    //alert('add');
		   var  leer = makeTable(getRow('', '', i+1, i , 1, 1));
		    //leer = makeTrigger(leer);
		   	jQuery(e.currentTarget).parent().parent().parent().find('.inputValue').after( leer ).addClass('remove');
		   	jQuery('#content_body').find('.remove').remove();

		   	renewTrigger();
		   	
		   	reRenderDom();
		    return false;
	    });
		place.append(typ);
	   // span = span.add(typ);
	    
	    
	    
	    span = span.add(place);
	    
		dom.attr('placeholder','Key').addClass('inputKey');
	}
	
    
    
	return span;
};


/*
	getTable
*/

var getTable = function () {
	
	var dom = jQuery('<ul />');
	return dom;	
};

/*
	makeTable
*/

var makeTable = function (rows) {
	
	
	var dom = getTable();
	dom.append(rows);
	
	//dom.find('input:first').before(_trigger_open.clone());
	var last = dom.find('input:last');
	//.after(_trigger_close.clone());
	/*
	if (last.parent().parent().find('ul').length > 0) {
		alert('ups ?');
		//last.parent().parent().parent().parent().parent().parent().find('table').after(_trigger_close.clone());
	} else {
		//alert('was ?');
		//last.after(_trigger_close.clone());
	}
	*/

	return dom;	
};

var makeTrigger = function (dom) {

	jQuery(dom).find('.li_first').first().prepend(_trigger_open.clone());	
	jQuery(dom).find('.li_second').last().append(_trigger_close.clone());
	return dom;
};


var renewTrigger = function () {
	
	jQuery('#content_body').find('.li_first .trigger_open').remove();
	jQuery('#content_body').find('.li_second .trigger_close').remove();
	
	jQuery('#content_body').find('ul').each(function(i, k){
		var ul = makeTrigger(jQuery(k));
		jQuery(k).append(ul);
	});
	
	//alert('trigger renew done');
};




/*

	INIT

*/

function init() {


	jQuery('#toolbar_new').on('click',toolbar_new);
	jQuery('#toolbar_open').on('click',toolbar_open);
	
	jQuery('#toolbar_save').on('click',toolbar_save);
	
	jQuery('#toolbar_undo').on('click',history_undo);
	jQuery('#toolbar_redo').on('click',history_redo);
	
	jQuery('#textarea_nice').on('click',function () {
		if (_textarea_nice == true) {
			_textarea_nice = false;
			jQuery('#textarea_nice').removeClass('touch');
		} else {
			_textarea_nice = true;
			jQuery('#textarea_nice').addClass('touch');
		}
		reRenderDom();
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
		reRenderDom();
		return false;
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

	renderJsonFromStr('{"":""}', false);
}

init();
