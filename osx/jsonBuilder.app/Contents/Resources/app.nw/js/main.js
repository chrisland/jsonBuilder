
//alert('jo');


var gui = require('nw.gui');
var win = gui.Window.get();
win.showDevTools();
    
  

var _editable = true;
 
var fs = require('fs');


var openpath = undefined;
var _jsonObj = {}

var openLocalFile = function(evt) {
	console.log($(this).val());
	openpath = $(this).val();
	fs.readFile(openpath, "utf-8", function (err, data) {
		if (err) throw err;
		//console.log(data);
		renderJsonFromStr(data);
	});
	

};

var unsavedHide = function () {
	jQuery('#toolbar_save .unsaved').fadeOut();
};

var unsavedShow = function () {
	jQuery('#toolbar_save .unsaved').fadeIn();
};

var toolbar_save = function (e){
	if(!openpath) { return false; }
	var jsonstring = getJsonString();
	if(!openpath) { return false; }
	fs.writeFile(openpath, jsonstring, "utf-8", function (err, data) {
		if (err) throw err;
		unsavedHide();
	});
}

var toolbar_open = function (e){
	var node = jQuery('#system_openfile');
	node.on('change', openLocalFile);
	node.trigger('click');
	return false;
};

var getJsonString = function () {
	var str = jQuery('#textarea_jsonstring').val();
	if (str) {
		return str;
	}
	return '';
};

var renderJsonFromStr = function (jsonstring) {
	
	_jsonObj = pareseJsonToObj(jsonstring);
	renderJsonFromObj(_jsonObj);
	
};
var renderJsonFromObj = function (jsonobj) {
	
	var str = pareseObjToJson(jsonobj);
	jQuery('#textarea_jsonstring').text(str);
	
	
	_jsonObj = jsonobj
	//console.log(_jsonObj);
	
	var table = getTable();
	
	var i = 0;
	var objSize = Object.size(_jsonObj);
	Object.keys(_jsonObj).forEach(function(key) {
	   // console.log(key, _jsonObj[key]);
	   
	    table.append(getRow(key, _jsonObj[key], '', i, objSize, _editable));
	    
	    i++;
	});
	
	
	
	jQuery('#content').html('').append(table);
};

var pareseJsonToObj = function (str) {
	if (str) {
		return JSON.parse(str);
	}
	return false;
};

var pareseObjToJson = function (str) {
	if (str) {
		return JSON.stringify(str);
	}
	return false;
};

var updateJsonByInput = function (dom) {
	
	dom = jQuery(dom);
	
	var keypath = dom.data('keypath');
	
	var db = SpahQL.db(_jsonObj);
	
	//alert(keypath);
	var avatar_large = db.select('/'+keypath).replace( dom.val() );
	//alert( avatar_large.value() );

	//console.log(db[0].value);

	renderJsonFromObj(db.sourceData());
	
};

var addPair = function (keypath) {
	alert(keypath);
	var db = SpahQL.db(_jsonObj);
	var avatar_large = db.select(keypath).set( 'new', {'gag':'wuff'} );
	renderJsonFromObj(db.sourceData());
};



Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    //alert(size);
    return size-1;
};



var getRow = function (key, obj, parentKeyPath , i,lastRow, _editable) {
	/*
	if (parentKeyPath) {
		parentKeyPath += '/';
	}*/
	var newParentKeyPath = parentKeyPath+'/'+key;
	var tr = jQuery('<tr />');
	var td_k = jQuery('<td />', {text: key}).appendTo(tr);
	if (_editable) {
		td_k.html(getInput(key,'key',newParentKeyPath));
	}
	if ( typeof obj === 'object' ) {
		var td_v = jQuery('<td />');
		//parentRownr++;
		var i = 0;
		var objSize = Object.size(obj);
		Object.keys(obj).forEach(function(key) {
	    	//console.log(key, jsonObj[key]);
			//parentKeyPath += key;
			td_v.append(getRow(key, obj[key], newParentKeyPath, i, objSize, _editable));
			i++;
		});
		tr.append(td_v);
	} else {
		var td_v = jQuery('<td />', {text: obj}).appendTo(tr);
		if (_editable) {
			td_v.html(getInput(obj,'value',newParentKeyPath));
		}
	}
	if (_editable && lastRow == i ) {
		if (!parentKeyPath) {parentKeyPath='/';}
	    var addBtn = jQuery('<button/>', {text: '+'})
	    .data('keypath',parentKeyPath)
	    .on('click', function (e) {
		    addPair(jQuery(e.currentTarget).data('keypath'));
	    });
	    tr.find('td:first input').before(addBtn);
	}
	return tr;	
};

var getTable = function () {
	
	var dom = jQuery('<table />');
	return dom;	
};

var getInput = function(value, type, parentKeyPath) {
	var dom = jQuery('<input />', {value: value}).data('type',type).data('keypath',parentKeyPath);
	dom.on('change', function (e) {
		unsavedShow();
		updateJsonByInput(e.currentTarget);
		return false;
	});
	var typ = jQuery('<select><option>1</option></select>')
    //.data('keypath',parentKeyPath)
    .on('change', function (e) {
	    alert('jo');
    });
    dom.after(typ);
	return dom;
};

/*

	INIT

*/

function init() {


	jQuery('#toolbar_open').on('click',toolbar_open);
	
	jQuery('#toolbar_save').on('click',toolbar_save);

}

init();
