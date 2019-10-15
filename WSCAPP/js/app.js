(function ($, owner) {
	var waiting;
	var showWaiting = function () {
		waiting = plus.nativeUI.showWaiting();
	};

	var closeWaiting = function () {
		waiting && waiting.close();
		waiting = null;
	}
	/**
	 * 用户登录
	 **/
	owner.login = function (loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.account.length === 0) {
			return callback('请输入账号');
		}
		if (loginInfo.password.length === 0) {
			return callback('请输入密码');
		}
		showWaiting();
		server.ajax({
			url: 'Account/Login',
			type: 'POST',
			data: {
				username: loginInfo.account,
				password: loginInfo.password,
				ifScan: loginInfo.ifScan
			},
			success: function (d) {

				closeWaiting();
				var data = JSON.parse(d);
				//console.log(d);
				if (data.code === 0) {
					localStorage.setItem('$bingquList', JSON.stringify(data.result));
					return owner.createState(data.result[0], callback);
				} else {
					mui.toast(data.message);
				}
			},
			error: function (xhr, type, errorThrown) {
				closeWaiting();
				mui.toast("登录失败")
			}
		});
	};

	owner.createState = function (user, callback) {
		var state = owner.getState();
		state.account = user;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function () {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function (state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
	};

	owner.setBingren = function (obj) {
		obj = obj || {};
		localStorage.removeItem("$bingren");
		localStorage.setItem('$bingren', JSON.stringify(obj));
	};

	owner.getBingren = function () {
		var text = localStorage.getItem('$bingren') || "{}";
		return JSON.parse(text);
	};

	var checkEmail = function (email) {
		email = email || '';
		return isEmail(email);
	};

	function isEmail(str) {
		var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
		return reg.test(str);
	}

	var checkPhone = function (phone) {
		phone = phone || '';
		return isTelephone(phone);
	};

	function isTelephone(str) {
		reg = /^0?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
		return reg.test(str);
	}

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function (settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function () {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}
	/**
	 * 获取本地是否安装客户端
	 **/
	owner.isInstalled = function (id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	};

	owner.alertSure = function (content) {
		var h = plus.webview.getTopWebview();
		if (h.id == "main.html") {
			h = plus.webview.getWebviewById("main-sub.html");
		}
		h.evalJS("app.proveralertSure('" + content + "')");
	};
	owner.proveralertSure = function (content) {

		if ($('.mui-popover').length > 0) {
			document.getElementById("popover").remove();
			//  $('.mui-popover')[0].remove();
		}
		var item2 = document.createElement("div");
		item2.setAttribute('id', 'popover');
		item2.setAttribute('class', 'mui-popover mui-popoverT');
		item2.setAttribute('data-disable-auto-close', 'true');
		item2.innerHTML =
			'<div class="popover_content">' +
			'<div class="alert-head">提示</div>' +
			'<div class="mui-scroll-wrapper alert-wrapper">' +
			'<div class="mui-scroll" id="content">' + content +
			'</div>' +
			'</div>' +
			//             '<div class="alert-footer">' +
			//             '<button type="button" id="btn_ok" class="mui-btn mui-btn-alert"  />确定</button>' +
			//             '</div>' +
			'</div>';
		document.body.appendChild(item2);
		//        if (mui('.mui-popover')[0].style["display"] == "none") {
		//            mui("#popover").popover('toggle');
		//        }
		mui("#popover").popover('toggle');
		mui('.mui-scroll-wrapper').scroll();
		//点击确定
		mui('.alert-footer').on('tap', '.mui-btn-alert', function () {
			mui("#popover").popover('toggle');

		});

	}

	owner.alert = function (content) {
		var h = plus.webview.getTopWebview();
		if (h.id == "main.html") {
			h = plus.webview.getWebviewById("main-sub.html");
		}
		h.evalJS("app.prover('" + content + "')");
	};
	owner.prover = function (content) {

		if ($('.mui-popover').length > 0) {
			// document.getElementById("popover").remove();
			$('.mui-popover')[0].remove();
		}
		var item2 = document.createElement("div");
		item2.setAttribute('id', 'popover');
		item2.setAttribute('class', 'mui-popover mui-popoverT');
		item2.setAttribute('data-disable-auto-close', 'true');
		item2.innerHTML =
			'<div class="popover_content">' +
			'<div class="alert-head">提示</div>' +
			'<div class="mui-scroll-wrapper alert-wrapper">' +
			'<div class="mui-scroll" id="content">' + content +
			'</div>' +
			'</div>' +
			'<div class="alert-footer">' +
			'<button type="button" id="btn_ok" class="mui-btn mui-btn-alert"  />确定</button>' +
			'</div>' +
			'</div>';
		document.body.appendChild(item2);
		//        if (mui('.mui-popover')[0].style["display"] == "none") {
		//            mui("#popover").popover('toggle');
		//        }
		mui("#popover").popover('toggle');
		mui('.mui-scroll-wrapper').scroll();
		//点击确定
		mui('.alert-footer').on('tap', '.mui-btn-alert', function () {
			mui("#popover").popover('toggle');

		});

	}

	owner.confirm = function (content, fangfa1, fangfa2) {
		var h = plus.webview.getTopWebview();
		if (h.id == "main.html") {
			h = plus.webview.getWebviewById("main-sub.html");
		}
		h.evalJS("app.proverconfirm('" + content + "'," + fangfa1 + "," + fangfa2 + ")");
	};
	owner.proverconfirm = function (content, fangfa1, fangfa2) {

		if ($('.mui-popover').length > 0) {
			//   document.getElementById("popover").remove();
			$('.mui-popover')[0].remove();
		}
		var item2 = document.createElement("div");
		item2.setAttribute('id', 'popover');
		item2.setAttribute('class', 'mui-popover mui-popoverT');
		item2.setAttribute('data-disable-auto-close', 'true');

		item2.innerHTML =
			'<div class="popover_content">' +
			'<header class="padding-b">提示</header>' +
			'<div class="mui-scroll-wrapper">' +
			'<div class="mui-scroll">' + content +
			'</div>' +
			'</div>' +
			'<div class="popover_footer">' +
			'<button type="button"  class="mui-btn Fbtn_left"  />取消</button>' +
			'<button type="button" id="btn_ok" class="mui-btn mui-btn-primary Fbtn_right"  />确定</button>' +
			'</div>' +
			'</div>';
		document.body.appendChild(item2);
		mui("#popover").popover('toggle');
		mui('.mui-scroll-wrapper').scroll();
		//点击取消
		mui('.popover_footer').on('tap', '.Fbtn_left', fangfa1);
		mui('.popover_footer').on('tap', '.Fbtn_right', fangfa2);

	}
	
	owner.confirmCancel = function (content, fangfa) {
		var h = plus.webview.getTopWebview();
		if (h.id == "main.html") {
			h = plus.webview.getWebviewById("main-sub.html");
		}
		h.evalJS("app.proverconfirmCancel('" + content + "'," + fangfa + ")");//" + btnName + ",
	};
	owner.proverconfirmCancel = function (content, fangfa) { //btnName,

		if ($('.mui-popover').length > 0) {
			//   document.getElementById("popover").remove();
			$('.mui-popover')[0].remove();
		}
		var item2 = document.createElement("div");
		item2.setAttribute('id', 'popover');
		item2.setAttribute('class', 'mui-popover mui-popoverT');
		item2.setAttribute('data-disable-auto-close', 'true');

		item2.innerHTML =
			'<div class="popover_content">' +
			'<header class="padding-b">提示</header>' +
			'<div class="mui-scroll-wrapper alert-wrapper">' +
			'<div class="mui-scroll">' + content +
			'</div>' +
			'</div>' +
			'<div class="alert-footer">' +
			'<button type="button" class="mui-btn mui-btn-alert"  />取消</button>' +//'+ btnName +'
			'</div>' +
			'</div>';
		document.body.appendChild(item2);
		mui("#popover").popover('toggle');
		mui('.mui-scroll-wrapper').scroll();
		//点击取消
		mui('.alert-footer').on('tap', '.mui-btn-alert', fangfa);
//		mui('.popover_footer').on('tap', '.Fbtn_right', fangfa2);

	}

	owner.warn = function (content, fangfa1) {
		var h = plus.webview.getTopWebview();
		if (h.id == "main.html") {
			h = plus.webview.getWebviewById("main-sub.html");
		}
		h.evalJS("app.warnprover('" + content + "'," + fangfa1 + ")");
	};
	owner.warnprover = function (content, fangfa1) {

		if ($('.mui-popover').length > 0) {
			// document.getElementById("popover").remove();
			$('.mui-popover')[0].remove();
		}
		var item2 = document.createElement("div");
		item2.setAttribute('id', 'popover');
		item2.setAttribute('class', 'mui-popover mui-popoverT');
		item2.setAttribute('data-disable-auto-close', 'true');
		item2.innerHTML =
			'<div class="popover_content">' +
			'<div class="alert-head" style="color:red">警告</div>' +
			'<div class="mui-scroll-wrapper alert-wrapper">' +
			'<div class="mui-scroll" id="content">' + content +
			'</div>' +
			'</div>' +
			'<div class="alert-footer">' +
			'<button type="button" id="btn_ok" class="mui-btn mui-btn-alert"  />确定</button>' +
			'</div>' +
			'</div>';
		document.body.appendChild(item2);
		mui("#popover").popover('toggle');
		mui('.mui-scroll-wrapper').scroll();
		//点击确定
		mui('.alert-footer').on('tap', '.mui-btn-alert', fangfa1);

	}
	owner.toast = function (content) {
		var CLASS_ACTIVE = 'mui-active';
		var toast = document.createElement("div");
		toast.classList.add('mui-toast-container');
		toast.innerHTML =
			'<div class="mui-toast-message" style="opacity: 0.6!important; color: #fff!important; width: 180px!important; padding: 70px 5px 10px 5px!important;">' +
			content + '</div>';
		toast.addEventListener('webkitTransitionEnd', function () {
			if (!toast.classList.contains(CLASS_ACTIVE)) {
				toast.parentNode.removeChild(toast);
				toast = null;
			}
		});
		//点击则自动消失
		toast.addEventListener('click', function () {
			toast.parentNode.removeChild(toast);
			toast = null;
		});
		document.body.appendChild(toast);
		toast.offsetHeight;
		toast.classList.add(CLASS_ACTIVE);
		setTimeout(function () {
			toast && toast.classList.remove(CLASS_ACTIVE);
		}, 4000);
	}
}(mui, window.app = {}));
