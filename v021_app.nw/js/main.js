
// v 0.2.1
//
// begin: 2014-02-11


var gui = require('nw.gui');
var win = gui.Window.get();
win.showDevTools();
   
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
	console.log($(this).val());
	_openpath = $(this).val();
	_fs.readFile(_openpath, "utf-8", function (err, data) {
		if (err) throw err;
		//console.log(data);
		unsavedHide();
		renderJsonFromStr(data, true);
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
	if(!_openpath) { return false; }
	var jsonstring = getJsonString();
	_fs.writeFile(_openpath, jsonstring, "utf-8", function (err, data) {
		if (err) throw err;
		unsavedHide();
	});
}

/*
	toolbar_new
*/

var toolbar_new = function (e){
	unsavedHide();
	renderJsonFromStr('{"":""}', true);
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
		return JSON.parse(str);
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
		
		if (typ == 'key') {
			str += '"'+val+'":';
			openPair = true;
		} else if (typ == 'value') {
			if (_textarea_encode) {
				val = encodeURIComponent(val);
			}
			str += '"'+val+'"';
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
	console.log(dom);
	dom = makeTable(dom);
	jQuery('#content_body').html('').append(dom);//.append('<div class="breaker"></div>');

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
	    	//console.log(key, jsonObj[key]);
			//parentKeyPath += key;
			/*var table = getTable();
			table.append(getRow(key, obj[key], ia, i, objSize, _editable));
			td_v.append(table);
			*/
			leer = leer.add(getRow(key, obj[key], ia, i, objSize, _editable));
			ia++;
		});
		td_v.append(makeTable(leer));
		tr.append(td_v);
	} else {
		var td_v = jQuery('<div />', {text: obj, class: "li_second"}).appendTo(tr);
		if (_editable) {
			td_v.html(getInput(obj,'value', i, rootRow));
		}
	}
	
	if (_editable && lastRow == i ) {

	//if (_editable ) {
		//if (!parentKeyPath) {parentKeyPath='/';}
	    var addBtn = jQuery('<button/>', {text: '+', class: 'addBtn'})
	    //.data('keypath',parentKeyPath)
	    .on('click', function (e) {
	    	
	    	//alert('jo');
	    	
	    	var row = getRow('', '', i+1, rootRow , lastRow+1, _editable);
	    	
	    	var tr = jQuery(e.currentTarget).parent().parent(); //.find('.trigger_close').remove();
	    	//row.find('.input:last').after(_trigger_close.clone());
	    	
	    	if (tr.find('.trigger_close').length > 0) {
		   		tr.find('.trigger_close').each(function (a,b) {
		   			jQuery(b).remove();
			   		//tr.prev().find('input:last').after(_trigger_close.clone());
			   		row.find('.input').last().after(_trigger_close.clone());
			   		
			   	});
		   	}
		   	
	    	tr.after(row);
	    	
			reRenderDom();
			
	    });
	    
	    tr.find('.li_second').first().after(jQuery('<div />', {class:"li_third"}).append(addBtn));
	}


	tr.find('.input').on('click', function (e) {
		jQuery('#content_body').find('.valueBtn').hide();
		jQuery(e.currentTarget).parent().parent().find('.valueBtn').show();
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
		
		//alert('change');
		
		//updateJsonByInput(e.currentTarget);
		
		//reRenderDom();
		
		var obj = getJsonFromDom();
		history_log(obj);
		
		jQuery('#textarea_jsonstring').text(pareseObjToJson(obj));
		
		return false;
	});/*
	dom.hover(function (e) {
		jQuery(e.currentTarget).parent().find('.valueBtn').show();
	}, function (e) {
		jQuery(e.currentTarget).parent().find('.valueBtn').hide();
	});*/
	
	span = span.add(dom);
	
	
	if (type == 'value') {
		
	    dom.addClass('inputValue');
	    
	} else if(type == 'key') {
	
		var typ = jQuery('<button/>', {text: '{}', class: 'valueBtn hidden'})
	   // .data('keypath',parentKeyPath)
	    .on('click', function (e) {
		    
		    //alert('add');
		   	jQuery(e.currentTarget).parent().parent().find('.inputValue').after( makeTable(getRow('', '', i+1, i , 1, 1)) ).addClass('remove');
		   	jQuery('#content_body').find('.remove').remove();

		   	reRenderDom();
		    return false;
	    });
	   // span.append(typ);
	    span = span.add(typ);
	    
	    var del = jQuery('<button/>', {text: '-', class: 'valueBtn hidden'})
	   // .data('keypath',parentKeyPath)
	    .on('click', function (e) {
		    
		   	var tr = jQuery(e.currentTarget).parent().parent();
		   	if (tr.find('.trigger_close').length > 0) {
		   		tr.find('.trigger_close').each(function () {
			   		tr.prev().find('input:last').after(_trigger_close.clone());
			   	});
		   	}
		   	if (tr.find('.trigger_open').length > 0) {
			   	tr.next().find('.input:first').before(_trigger_open.clone());
		   	}
		   	
		   //	alert(tr.parent().find('.input').length);
		   	if (tr.parent().find('.input').length > 2) {
			   	tr.remove();
		   	} else {
			   	tr.parent().parent().parent().find('ul').after( getInput('', 'value', i, rootRow) );
			   	tr.parent().parent().parent().find('ul').remove();
		   	}
		   	
		   //	getJsonFromDom();
		   	reRenderDom();
		    return false;
	    });
	    //span.append(del);
	    span = span.add(del);
	    
		dom.addClass('inputKey');
	}
	
    
    
	return span;
};


/*
	getTable
*/

var getTable = function () {
	
	var dom = jQuery('<ul />');
	//dom.append(_trigger_open.clone());
	//dom.append(_trigger_close.clone());
	return dom;	
};

/*
	makeTable
*/

var makeTable = function (rows) {
	
	var dom = getTable();
	dom.append(rows);
	
	dom.find('input:first').before(_trigger_open.clone());
	var last = dom.find('input:last');
	//.after(_trigger_close.clone());
	
	if (last.parent().parent().find('ul').length > 0) {
		alert('ups');
		last.parent().parent().parent().parent().parent().parent().find('table').after(_trigger_close.clone());
	} else {
		last.after(_trigger_close.clone());
	}
   		
   	/*

   	if (_editable ) {
		//if (!parentKeyPath) {parentKeyPath='/';}
	    var addBtn = jQuery('<button/>', {text: '+', class: 'addBtn'})
	    //.data('keypath',parentKeyPath)
	    .on('click', function (e) {
	    	
	    	addEmptyRow();
	    	//alert('jo');
	    	
	    	//jQuery(e.currentTarget).remove();
	    	
	    	
			
	    });
	    
	    dom.find('.li_second').last().after(jQuery('<div />', {class:"li_third"}).append(addBtn));
	}
	
*/
	
	return dom;	
};
/*

var addEmptyRow function () {
	
	var row = getRow('', '', i+1, rootRow , lastRow, _editable);
	//row.find('input:last').after(_trigger_close.clone());
	jQuery(e.currentTarget).parent().parent().after(row);
	//jQuery('.li_third').remove();
	
	reRenderDom();
	
	
};


*/


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
	
	
	
	

	renderJsonFromStr('{"":""}', false);
}

init();
