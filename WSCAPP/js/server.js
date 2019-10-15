var server = server || {};
//$(document).ajaxStart(function () {
//	$("body").append('<div class="mui-loading"><div class="mui-spinner"></div></div>');
//}).ajaxStop(function () {
//	setTimeout(function() {$(".mui-loading").remove();}, 1000);
//}).ajaxError(function () {
//	$(".mui-loading").remove();
//	mui.toast("请求失败");
//});

server = (function() {
	var proxies = {};
	//proxies.defaultIp = '192.168.102.202:88';
	//proxies.defaultIp = '47.91.220.249:8080';
	proxies.defaultIp = '10.0.2.2:8888';

	proxies.ip = localStorage.getItem('$ip')||proxies.defaultIp;
	proxies.authorizationHeader_ = localStorage.getItem('authorizationHeader');

	proxies.setAuthorizationHeader = function() {
		var account = app.getState().account;
		var tok = account.Mobile_Phone + ':' + account.User_Pwd,
			createHttpBasicAuthorizationString = function() {
				var hash = Base64.encode(tok);
				return 'Basic ' + hash;
			};
		proxies.authorizationHeader_ = createHttpBasicAuthorizationString();

		localStorage.setItem("authorizationHeader", proxies.authorizationHeader_);
	};

	proxies.ajax = function(options) {
		var baseUri = "http://"+ proxies.ip + "/api/";
		if(plus && plus.networkinfo && plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
			mui.toast('网络异常，请检查网络设置');
			return;
		}
		if(options.showWaiting == undefined) {
			options.showWaiting = false;
		}

		if(options.showWaiting) {
			plus.nativeUI.showWaiting();
		}			
		var config = {
			url: baseUri + options.url,
			headers: {
				'Authorization': proxies.authorizationHeader_,
				'Content-Type':'application/json'
			},
			data: JSON.stringify(options.data),
			type: options.type || 'GET',
			cache: false,
			dataType: 'JSON',
			crossDomain: true,
			error: function(jqXHR, textStatus, errorThrown) {
				if(errorThrown === "Unauthorized") {
					
				} else {
					if(options.error){
						options.error();
					}
				}
			},
			success: function(data) {
				if(options.success){
					options.success(data);
				}
			}
		};
		if(options.headers) {
			for(var o in options.headers) {
				config.headers[o] = options.headers[o];
			}
		}
		return mui.ajax(config);
	}

	return proxies;
}());


/**

*

*  Base64 encode / decode

*  http://www.webtoolkit.info/

*

**/

var Base64 = {

	// private property

	_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding

	encode: function(input) {

		var output = "";

		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;

		var i = 0;

		input = Base64._utf8_encode(input);

		while(i < input.length) {

			chr1 = input.charCodeAt(i++);

			chr2 = input.charCodeAt(i++);

			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;

			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);

			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);

			enc4 = chr3 & 63;

			if(isNaN(chr2)) {

				enc3 = enc4 = 64;

			} else if(isNaN(chr3)) {

				enc4 = 64;

			}

			output = output +

				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +

				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;

	},

	// public method for decoding

	decode: function(input) {

		var output = "";

		var chr1, chr2, chr3;

		var enc1, enc2, enc3, enc4;

		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while(i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));

			enc2 = this._keyStr.indexOf(input.charAt(i++));

			enc3 = this._keyStr.indexOf(input.charAt(i++));

			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);

			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);

			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if(enc3 != 64) {

				output = output + String.fromCharCode(chr2);

			}

			if(enc4 != 64) {

				output = output + String.fromCharCode(chr3);

			}

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding

	_utf8_encode: function(string) {

		string = string.replace(/\r\n/g, "\n");

		var utftext = "";

		for(var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if(c < 128) {

				utftext += String.fromCharCode(c);

			} else if((c > 127) && (c < 2048)) {

				utftext += String.fromCharCode((c >> 6) | 192);

				utftext += String.fromCharCode((c & 63) | 128);

			} else {

				utftext += String.fromCharCode((c >> 12) | 224);

				utftext += String.fromCharCode(((c >> 6) & 63) | 128);

				utftext += String.fromCharCode((c & 63) | 128);

			}

		}

		return utftext;

	},

	// private method for UTF-8 decoding

	_utf8_decode: function(utftext) {

		var string = "";

		var i = 0;

		var c = c1 = c2 = 0;

		while(i < utftext.length) {

			c = utftext.charCodeAt(i);

			if(c < 128) {

				string += String.fromCharCode(c);

				i++;

			} else if((c > 191) && (c < 224)) {

				c2 = utftext.charCodeAt(i + 1);

				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));

				i += 2;

			} else {

				c2 = utftext.charCodeAt(i + 1);

				c3 = utftext.charCodeAt(i + 2);

				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));

				i += 3;

			}

		}

		return string;

	}

}