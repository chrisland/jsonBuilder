
// v 0.2
//
// begin: 2014-02-10

//alert('jo');


var gui = require('nw.gui');
var win = gui.Window.get();
win.showDevTools();
    
  

var _editable = true;
 
var fs = require('fs');


var openpath = undefined;
var _jsonObj = {}
var _history = [];
var _history_open = 0;

var _trigger_open = jQuery('<input />', {type: 'text', class:'trigger trigger_open',value:'{'});
var _trigger_close = jQuery('<input />', {type: 'text', class:'trigger trigger_close',value:'}'});

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    //alert(size);
    return size-1;
};

/*
	history_log
*/

var history_log = function (jsonobj) {
	_history.push(jsonobj);
	_history_open++;
	
	console.log(_history);
	console.log(_history_open);
};


/*
	history_undo
*/

var history_undo = function () {
	if (_history_open-1 >= 0) {
		_history_open = _history_open-1;
		console.log('render und '+_history_open);
		renderJsonFromObj(_history[_history_open]);
	}
	
};

/*
	history_redo
*/

var history_redo = function () {
	if (_history_open+1 <= _history.length-1) {
		_history_open = _history_open+1;
		console.log('render  red'+_history_open);
		renderJsonFromObj(_history[_history_open]);
	}
};


/*
	openLocalFile
*/

var openLocalFile = function(evt) {
	console.log($(this).val());
	openpath = $(this).val();
	fs.readFile(openpath, "utf-8", function (err, data) {
		if (err) throw err;
		//console.log(data);
		renderJsonFromStr(data);
	});
	

};


/*
	unsavedHide
*/

var unsavedHide = function () {
	jQuery('#toolbar_save .unsaved').fadeOut();
};

/*
	unsavedShow
*/

var unsavedShow = function () {
	jQuery('#toolbar_save .unsaved').fadeIn();
};

/*
	toolbar_save
*/

var toolbar_save = function (e){
	if(!openpath) { return false; }
	var jsonstring = getJsonString();
	if(!openpath) { return false; }
	fs.writeFile(openpath, jsonstring, "utf-8", function (err, data) {
		if (err) throw err;
		unsavedHide();
	});
}

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
	renderJsonFromStr
*/

var renderJsonFromStr = function (jsonstring) {
	
	_jsonObj = pareseJsonToObj(jsonstring);
	renderJsonFromObj(_jsonObj);
	history_log(_jsonObj);
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
	
	var dom = jQuery('<span/>');
	var i = 1;
	var objSize = Object.size(_jsonObj);
	Object.keys(_jsonObj).forEach(function(key) {
	   // console.log(key, _jsonObj[key]);
	   
	    dom.append(getRow(key, _jsonObj[key], i, 0, objSize+1, _editable));
	    i++;
	});
	dom = makeTable(dom);
	jQuery('#content').html('').append(dom);
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

var pareseObjToJson = function (str) {
	if (str) {
		return JSON.stringify(str);
		//return JSON.stringify(str, null, "\t");
	}
	return false;
};


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

	jQuery('#content table').find('input').each(function(i, k){
		
		
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
			str += '"'+encodeURIComponent(val)+'"';
			openPair = false;
		}

	});

	
	//console.log(str);
	//jQuery('#textarea_jsonstring').text(str);
	
	var obj = pareseJsonToObj(str);
	
	return obj;
	//console.log(obj);
	
	//alert(str);
	
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
	var tr = jQuery('<tr />');
	var td_k = jQuery('<td />', {text: key}).appendTo(tr);
	if (_editable) {
		td_k.html(getInput(key,'key', i, rootRow));
	}
	if ( typeof obj === 'object' ) {
		var td_v = jQuery('<td />');
		//parentRownr++;
		var ia = 0;
		var objSize = Object.size(obj);
		var leer = jQuery('<span/>');
		Object.keys(obj).forEach(function(key) {
	    	//console.log(key, jsonObj[key]);
			//parentKeyPath += key;
			/*var table = getTable();
			table.append(getRow(key, obj[key], ia, i, objSize, _editable));
			td_v.append(table);
			*/
			leer.append(getRow(key, obj[key], ia, i, objSize, _editable));
			ia++;
		});
		td_v.append(makeTable(leer));
		tr.append(td_v);
	} else {
		var td_v = jQuery('<td />', {text: obj}).appendTo(tr);
		if (_editable) {
			td_v.html(getInput(obj,'value', i, rootRow));
		}
	}
	
	if (_editable && lastRow == i ) {
		//if (!parentKeyPath) {parentKeyPath='/';}
	    var addBtn = jQuery('<button/>', {text: '+'})
	    //.data('keypath',parentKeyPath)
	    .on('click', function (e) {
	    	
	    	//alert('jo');
	    	//var newForm = jQuery('#system_newform').clone();
	    	/*
	    	var table = getTable();
	    	table.append( getRow('', '', i+1, rootRow , lastRow, _editable) );
	    	jQuery(e.currentTarget).parent().after( table );
	    	*/
	    	jQuery(e.currentTarget).parent().find('.trigger_close').remove();
	    	var row = getRow('', '', i+1, rootRow , lastRow, _editable);
	    	row.find('input:last').after(_trigger_close.clone());
	    	jQuery(e.currentTarget).parent().after(row);
	    	
	    	
	    	//getJsonFromDom();
			
			reRenderDom();
			//jQuery(e.currentTarget).after(newForm);
			
	    	//showOverlayForm(jQuery(e.currentTarget).data('keypath'));
	    	
		    //addPair(jQuery(e.currentTarget).data('keypath'));
	    });
	    tr.after().append(addBtn);
	}
	
	return tr;	
};



/*
	getInput
*/

var getInput = function(value, type, i, rootRow) {
	var span = jQuery('<span />');
	var dom = jQuery('<input />', {value: decodeURIComponent(value), class: 'input'}).data('type',type).data('nr',i).data('rootRow',rootRow);
	dom.on('change', function (e) {
		//alert('change');
		//unsavedShow();
		//updateJsonByInput(e.currentTarget);
		
		//getJsonFromDom();
		
		var obj = getJsonFromDom();
		history_log(obj);
	
		return false;
	});
	span.append(dom);
	
	
	if (type == 'value') {
		var typ = jQuery('<button/>', {text: '{}'})
	   // .data('keypath',parentKeyPath)
	    .on('click', function (e) {
		    
		   	jQuery(e.currentTarget).parent().find('.input').after( makeTable(getRow('', '', i+1, i , 1, 1)) ).addClass('remove');
		   	jQuery(e.currentTarget).parent().find('.remove').remove();
		   //	getJsonFromDom();
		   	reRenderDom();
		    return false;
	    });
	    span.append(typ);
	    
	    var del = jQuery('<button/>', {text: '-'})
	   // .data('keypath',parentKeyPath)
	    .on('click', function (e) {
		    
		   	var tr = jQuery(e.currentTarget).parent().parent().parent();
		   	if (tr.find('.trigger_close').length > 0) {
			   	tr.prev().find('input:last').after(_trigger_close.clone());
		   	}
		   	if (tr.find('.trigger_open').length > 0) {
			   	tr.next().find('.input:first').before(_trigger_open.clone());
		   	}
		   	
		   //	alert(tr.parent().find('.input').length);
		   	if (tr.parent().find('.input').length > 2) {
			   	tr.remove();
		   	} else {
			   	tr.parent().parent().parent().find('table').after( getInput('', 'value', i, rootRow) );
			   	tr.parent().parent().parent().find('table').remove();
		   	}
		   	
		   //	getJsonFromDom();
		   	reRenderDom();
		    return false;
	    });
	    span.append(del);
	}
	
    
    
	return span;
};


/*
	getTable
*/

var getTable = function () {
	
	var dom = jQuery('<table />');
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
	
	if (last.parent().parent().parent().parent().parent().parent().find('table').length > 0) {
		last.parent().parent().parent().parent().parent().parent().find('table').after(_trigger_close.clone());
	} else {
		last.after(_trigger_close.clone());
	}
   		
   		
	return dom;	
};

/*

	INIT

*/

function init() {


	jQuery('#toolbar_open').on('click',toolbar_open);
	
	jQuery('#toolbar_save').on('click',toolbar_save);
	
	jQuery('#toolbar_undo').on('click',history_undo);
	jQuery('#toolbar_redo').on('click',history_redo);
	
	//jQuery('#overlay_form').on('click','.submit',submitPair);

	renderJsonFromStr('{"":""}');
}

init();
