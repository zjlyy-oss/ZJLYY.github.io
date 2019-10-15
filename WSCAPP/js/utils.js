(function ($, util) {
	var waiting = null;
	util.showWaiting = function () {
		waiting = plus.nativeUI.showWaiting();
	};

	util.closeWaiting = function () {
		waiting && waiting.close();
		waiting = null;
	}
	util.openNow = function (url) {
		var loginvw = plus.webview.getWebviewById(url);
		if (loginvw != null) {
			//      	loginvw.show();
			//      	plus.webview.loadURL(url);
			loginvw.loadURL(url);
			return false;
		}
		mui.openWindow({
			id: url,
			url: url,
			createNew: true,
			waiting: {
				options: {}
			}
		});
	}
	util.open = function (url, type) {
		plus.webview.close(url);
		//      plus.webview.currentWebview().opener().close();
		type = 2;
		if (type == 2) {
			mui.openWindow({
				id: url,
				url: url,
				createNew: true,
				waiting: {
					options: {}
				}
			});
		} else {
			var page = $.preload({
				"id": url,
				"url": url
			});
			var id = setInterval(function () {
				clearInterval(id);
				$.fire(page, 'show', null);
				page.show("pop-in");
			}, 20);
		}
	}

	util.bindEvents = function (loginUrl) {
		//退出
		var toLogin = function () {
			util.open(loginUrl);
		};
		var exit = document.getElementById("exit");
		if (exit) {
			exit.addEventListener('tap', function (e) {
				e.stopPropagation();
				mui.confirm('确认退出当前登录？', '确认', ['取消', '确认'], function (e) {
					if (e.index == 1) {
						app.setState(null);

						// 获取所有Webview窗口  
						var curr = plus.webview.currentWebview();
						var wvs = plus.webview.all();
						for (var i = 0, len = wvs.length; i < len; i++) {
							//关闭除主页页面外的其他页面  
							if (wvs[i].getURL() == curr.getURL())
								continue;
							plus.webview.close(wvs[i]);
						}
						//打开login页面后再关闭主页面  
						plus.webview.open(loginUrl);
						curr.close();
						plus.device.vibrate(500);
						app.toast('注销成功！');
						localStorage.clear();
						//plus.webview.close('main.html');
					}
				})
			});
		}

		//切换用户
		var user = document.getElementById("user");
		if (user) {
			document.getElementById("user").addEventListener('tap', function (e) {
				e.stopPropagation();
				mui.confirm('确认登录其他用户？', '确认', ['取消', '确认'], function (e) {
					if (e.index == 1) {
						app.setState(null);
						toLogin();
						mui.toast('请登录其他用户账号！');
					}
				})
			});
		}
	}

	util.setInfo = function (bingren) {
		var infoHtml =
			'<div>' +
			'<img src="../images/PatientList/' + (bingren.XINGBIE === '女' ? 'woman' : 'Man') +
			'@2x.png" style="height:22px;top:-1px;left:-2px;">' +
			'<span style="font-size: 18px; color:rgb(51,51,51);font-weight: bold;margin-left: -8px;">' + (bingren.XINGMING ||
				'--') + '</span>' +
			'<span style="font-size: 12px;color:rgb(73,97,211);border: 1px solid rgb(73,97,211);' +
			'height:19px;border-radius: 19px;padding: 4px 12px;margin-left:15px;">' + (bingren.NIANLING || '--') + '岁 ' + (
				bingren.BINGANHAO || '') + '</span>' +
			'</div>' +
			'<div class="line2">' +
			'<img src="../images/vitalSign/bed.png" style="width:13px;top:-2px;">' +
			(bingren.CHUANGWEI || '--') +
			'<img src="../images/vitalSign/date.png" style="width: 13px;top:-2px;margin-left: 20px;">' +
			'出生日期：' + (bingren.CHUSHENGRQ || '').substring(0, 10) +
			'</div>' +
			'<div class="line3">' +
			'<img src="../images/vitalSign/diagnosis.png" style="width:13px;top:-2px;">' +
			'诊断：' + '--' +
			'</div>' +
			'<div class="line4">' +
			'<img src="../images/vitalSign/allergy.png" style="width:13px;top:-2px;">' +
			'过敏药物：' + ((bingren.GUOMINGYP == "null" || bingren.GUOMINGYP == null) ? "---" : bingren.GUOMINGYP) +
			'</div>';
		document.getElementById('info').innerHTML = infoHtml;
	}
}(mui, window.utils = {}));

var bingren = JSON.parse(localStorage.getItem('$bingren') || "{}");
if (document.getElementById("title-name")) {
	document.getElementById('title-name').innerText = (bingren.CHUANGWEI || '') + '-' + (bingren.XINGMING || '');
}
if (document.getElementById("info")) {
	utils.setInfo(bingren);
}

(function ($, doc) {
	$.plusReady(function () {
		plus.navigator.setStatusBarBackground("#000");
		var back = document.getElementById("back");
		if (back) {
			document.getElementById("back").addEventListener('tap', function (e) {
				e.stopPropagation();
				localStorage.removeItem("$yizhulist");
				localStorage.removeItem("$yizhutxm");
				localStorage.removeItem("$AllowYizhizx");
				localStorage.removeItem("$yidaosuszxx");
				localStorage.removeItem("$dingwyz");
				localStorage.removeItem("$bengtui"); //泵推设置json字符串
				localStorage.removeItem("$caozuofs"); //输液操作方式 接瓶 多路 
				localStorage.removeItem("$wandaitxm"); //腕带条码信息
				localStorage.removeItem("$zxyizhuid"); //选择停止的医嘱ID
				mui.back();
			});
		}
	});
}(mui, document));
//注册监听扫码器，自动支持所有厂商
function scanInitial(getReceiveFunc) {
	var model = plus.device.model; //获取机型
	if (model == "Nr510") { //联新
		var main = plus.android.runtimeMainActivity(); //获取activity
		var context = plus.android.importClass('android.content.Context'); //上下文
		var receiver = plus.android.implements('io.dcloud.feature.internal.reflect.BroadcastReceiver', {
			onReceive: getReceiveFunc //实现onReceiver回调函数
		});
		var IntentFilter = plus.android.importClass('android.content.IntentFilter'); //引入过滤器
		var Intent = plus.android.importClass('android.content.Intent');
		var filter = new IntentFilter();

		filter.addAction('lachesis_barcode_value_notice_broadcast'); //监听扫码广播
		main.registerReceiver(receiver, filter); //注册监听
	} else if (model == "MT6735" || model == "Nurse Terminal") { //赫盛光电
		var main = plus.android.runtimeMainActivity(); //获取activity
		var context = plus.android.importClass('android.content.Context'); //上下文
		var receiver = plus.android.implements('io.dcloud.feature.internal.reflect.BroadcastReceiver', {
			onReceive: getReceiveFunc //实现onReceiver回调函数
		});
		var IntentFilter = plus.android.importClass('android.content.IntentFilter'); //引入过滤器
		var Intent = plus.android.importClass('android.content.Intent');
		var filter = new IntentFilter();

		filter.addAction('com.android.server.scannerservice.broadcast'); //监听扫码广播
		main.registerReceiver(receiver, filter); //注册监听  
	}
}
//获取扫码结果
function StringExtra(intent) {
	var model = plus.device.model; //获取机型
	console.log(model);
	if (model == "Nr510") {
		return intent.getStringExtra('lachesis_barcode_value_notice_broadcast_data_string');
	} else if (model == "MT6735" || model == "Nurse Terminal") {
		return intent.getStringExtra('scannerdata');
	}
};

var bingrenMatch = false;

function getReceiveType1(context, intent, medicineVal, zhixingIndex) {
	// var value = medicineVal || intent.getStringExtra('lachesis_barcode_value_notice_broadcast_data_string');
	var value = medicineVal || StringExtra(intent);
	currIndex = zhixingIndex || -1;
	var doType = jQuery('.mui-control-item.mui-active').html();
	if (value !== '' && currIndex > -1) {
		var currCount = parseInt(jQuery(jQuery('.mui-control-content.mui-active .dispensing-table-row.' + currIndex +
			' .currCount')[0]).html());
		var allCount = parseInt(jQuery(jQuery('.mui-control-content.mui-active .dispensing-table-row.' + currIndex +
			' .allCount')[0]).html());

		var currCountBaiyao = jiluList.filter(function (a) {
			return a.YIZHUID == currentList[currIndex].YIZHUID && a.ZHIXINGNR == '摆药' + medicineVal
		}).length;
		var currCountPeiyao = jiluList.filter(function (a) {
			return a.YIZHUID == currentList[currIndex].YIZHUID && a.ZHIXINGNR == '配药' + medicineVal
		}).length;
		var currCountZhixing = jiluList.filter(function (a) {
			return a.YIZHUID == currentList[currIndex].YIZHUID && a.ZHIXINGNR == '执行' + medicineVal
		}).length;

		if (parseInt(currCount) >= parseInt(allCount) || (doType == '摆药' && currCountBaiyao >= 1) ||
			(doType == '配药' && currCountPeiyao >= 1) || (doType == '执行' && currCountZhixing >= 1)) {
			plus.device.vibrate(1000);
			alert('当前医嘱已执行，请勿重复执行！');
		} else if (currYizhuType != '口服药' && ((doType == '配药' && currCountBaiyao <= currCountPeiyao) ||
				(doType == '执行' && currCountPeiyao <= currCountZhixing))) {
			plus.device.vibrate(1000);
			alert('请先执行前置步骤！');
		} else {
			utils.showWaiting();
			var addDayCount = currentList[currIndex].EVERYDAY - 1 < 0 ? 0 : currentList[currIndex].EVERYDAY - 1;
			server.ajax({
				url: 'Bingren/YizhuSave',
				type: 'POST',
				data: {
					queryDate: queryDate,
					yizhuId: currentList[currIndex].YIZHUID,
					bingrenId: bingren.BINGRENID,
					userId: state.account.YONGHUID,
					yizhuFl: currentList[currIndex].GEIYAOFSMC,
					zhixingNr: (doType + medicineVal),
					kssj: queryDate,
					jssj: new Date(queryDate).addDays(addDayCount).format('yyyy-MM-dd'),
					count: allCount
				},
				success: function (d) {
					utils.closeWaiting();
					var data = JSON.parse(d);
					if (data.code === 0) {
						plus.device.vibrate(500);
						alert('操作成功！');
						jQuery('.mui-control-content.mui-active .dispensing-table-row.' + currIndex + ' .currCount').html(currCount +
							1);
						jQuery('.mui-control-content.mui-active .dispensing-table-row.' + currIndex).addClass('finished');
						jiluList.push({
							"YIZHUID": currentList[currIndex].YIZHUID,
							"ZHIXINGNR": (doType + medicineVal)
						});
						if (doType == '执行') {
							bingrenMatch = false;
						}
					} else {
						app.alert(data.message);
					}
				},
				error: function (xhr, type, errorThrown) {
					utils.closeWaiting();
					plus.device.vibrate(1000);
					app.alert("请求失败");
				}
			});
		}
	} else if (value !== '') {
		if (doType == '摆药' || doType == '配药' || (doType == '执行' && bingrenMatch)) {
			if (doType == '执行' && value == bingren.BINGANHAO) {
				plus.device.vibrate(500);
				app.alert('病人匹配，请扫描药品条码！');
				bingrenMatch = true;
				return;
			}
			var yzID = value.split('P')[0];
			var yaopinId = value.substring(value.indexOf('P') + 1);
			var yizhudiv = jQuery('.mui-control-content.mui-active .dispensing-table-row .' + yzID);
			if (yzID != '' && yizhudiv.length > 0) {
				var idx = jQuery(jQuery(yizhudiv).parent().find('.index')[0]).val();
				jQuery('.mui-control-content.mui-active .dispensing-table-body').scrollTop(0);
				var top = jQuery('.mui-control-content.mui-active .dispensing-table-row.' + idx).offset().top;
				jQuery('.mui-control-content.mui-active .dispensing-table-row.' + idx).addClass('dispensing-table-row__hover');
				jQuery('.mui-control-content.mui-active .dispensing-table-body').scrollTop(top);
				getReceiveType1(null, null, yaopinId, idx);
			} else {
				plus.device.vibrate(1000);
				app.alert('找不到对应医嘱，请确认条码信息！');
			}
		} else if (doType == '执行' && !bingrenMatch) {
			if (value !== bingren.BINGANHAO) {
				plus.device.vibrate(1000);
				app.alert('病人不匹配，请先扫描病人手腕');
			} else {
				plus.device.vibrate(500);
				pp.alert('病人匹配，请扫描药品条码！');
				bingrenMatch = true;
			}
		}
	}
}

function getReceiveType2(context, intent) {
	//  var value = intent.getStringExtra('lachesis_barcode_value_notice_broadcast_data_string');
	var value = getStringExtra(intent);
	if (value !== '' && currIndex > -1) {
		var currCount = parseInt(jQuery(jQuery('.right.' + currIndex + ' .currCount')[0]).html());
		var allCount = parseInt(jQuery(jQuery('.right.' + currIndex + ' .allCount')[0]).html());
		if (parseInt(currCount) >= parseInt(allCount)) {
			plus.device.vibrate(1000);
			app.alert('当前医嘱已执行，请勿重复执行！');
		} else if (currentList[currIndex].PISHIJG === '*') {
			plus.device.vibrate(1000);
			app.alert('皮试结果为阳性，不能执行！');
		} else {
			utils.showWaiting();
			var addDayCount = currentList[currIndex].EVERYDAY - 1 < 0 ? 0 : currentList[currIndex].EVERYDAY - 1;
			server.ajax({
				url: 'Bingren/YizhuSave',
				type: 'POST',
				data: {
					queryDate: queryDate,
					yizhuId: currentList[currIndex].YIZHUID,
					bingrenId: bingren.BINGRENID,
					userId: state.account.YONGHUID,
					yizhuFl: currentList[currIndex].GEIYAOFSMC,
					zhixingNr: '执行',
					kssj: queryDate,
					jssj: new Date(queryDate).addDays(addDayCount).format('yyyy-MM-dd'),
					count: allCount
				},
				success: function (d) {
					utils.closeWaiting();
					var data = JSON.parse(d);
					if (data.code === 0) {
						if (currYizhuType = '过敏试验') {
							app.alert('操作成功！');
							plus.device.vibrate(500);
							//							setTimeout(function(){
							//								//alert(currentList[currIndex].YIZHUID)
							//								var btnArray = ['', '确定'];
							//				                mui.prompt('请输入是否过敏：', '是/否', '皮试结果', btnArray, function(e) {
							//				                    if (e.index == 1) {
							//				                        console.log(e.value);
							//				                    }
							//				                })
							//							}, 600000);
						} else {
							app.alert('操作成功！');
							plus.device.vibrate(500);
						}
						jQuery(jQuery('.right.' + currIndex + ' .currCount')[0]).html(currCount + 1);
						jQuery(jQuery('.right.' + currIndex + ' .doing-status.right-text')[0]).html('在执行');
						if (currCount + 1 >= allCount) {
							jQuery(jQuery('.right.' + currIndex).parent()[0]).addClass('ready');
						}
						jiluList.push({
							"YIZHUID": currentList[currIndex].YIZHUID,
							"ZHIXINGNR": "执行"
						});
					} else {
						app.alert(data.message);
						plus.device.vibrate(1000);
					}
				},
				error: function (xhr, type, errorThrown) {
					utils.closeWaiting();
					app.alert("请求失败");
					plus.device.vibrate(1000);
				}
			});
		}
	}
}

function getReceiveType3(context, intent, medicineVal, zhixingIndex) {
	//  var value = medicineVal || intent.getStringExtra('lachesis_barcode_value_notice_broadcast_data_string');
	var value = medicineVal || StringExtra(intent);
	currIndex = zhixingIndex || -1;
	if (value !== '' && currIndex > -1) {
		var currCount = jQuery('.sample-div.' + currIndex + ' .img-btn.finished').length;

		if (currCount >= 1) {
			app.alert('当前医嘱已执行，请勿重复执行！');
		} else {
			utils.showWaiting();
			server.ajax({
				url: 'Bingren/YizhuSave',
				type: 'POST',
				data: {
					queryDate: queryDate,
					yizhuId: currentList[currIndex].TIAOMAHAO,
					bingrenId: bingren.BINGRENID,
					userId: state.account.YONGHUID,
					yizhuFl: '样本采集',
					zhixingNr: '执行',
					kssj: queryDate,
					jssj: queryDate,
					count: 1
				},
				success: function (d) {
					utils.closeWaiting();
					var data = JSON.parse(d);
					if (data.code === 0) {
						app.alert('操作成功2！');
						plus.device.vibrate(500);
						jQuery('.sample-div.' + currIndex + ' .img-btn').addClass('finished');
						jQuery('.sample-div.' + currIndex + ' .img-btn').html('已执行');
						jiluList.push({
							"YIZHUID": currentList[currIndex].TIAOMAHAO,
							"ZHIXINGNR": "执行"
						});
					} else {
						app.alert(data.message);
						plus.device.vibrate(1000);
					}
				},
				error: function (xhr, type, errorThrown) {
					utils.closeWaiting();
					app.alert("请求失败");
					plus.device.vibrate(1000);
				}
			});
		}
	} else if (value !== '') {
		var yizhudiv = jQuery('.sample-div .' + value);
		if (yizhudiv.length > 0) {
			var idx = jQuery(jQuery(yizhudiv).parent().find('.index')[0]).val();
			jQuery('.body-withHeader').scrollTop(0);
			var top = jQuery('.content .sample-div.' + idx).offset().top;
			jQuery('.content .sample-div.' + idx + ' .sample-line').addClass('active');
			jQuery('.body-withHeader').scrollTop(top);
			getReceiveType3(null, null, value, idx);
		} else {
			app.alert('找不到对应医嘱，请确认条码信息！');
			plus.device.vibrate(1000);
		}
	}
}

function getRecevieType(context, intent) {
	var h = plus.webview.getTopWebview();
	if (h.id == "main.html") {
		h = plus.webview.getWebviewById("main-sub.html");
	}
	//var value = intent.getStringExtra('lachesis_barcode_value_notice_broadcast_data_string');
	var value = StringExtra(intent);
	value = value.replace(/\-/g, '');
	var yizhulist = JSON.parse(localStorage.getItem('$yizhulist') || "{}");
	//如果弹出了皮试结果录入对话框，必须先录入结果
	if (localStorage.getItem("$haspsjl")) {
		if (value.split('P').length == 1) {
			if (h.id == "main.html") {
				h = plus.webview.getWebviewById("main-sub.html");
			}
			var checkpass = true;
			var pishiList = JSON.parse(localStorage.getItem('$haspsjl') || "{}");
			mui.each(pishiList, function (index) {
				if (pishiList[index].binganhao !== value && pishiList[index].wanchengbz == "0") {
					checkpass = false;
					return false;
				}
			});
			if (!checkpass) {
				localStorage.removeItem("$haspsjl");
				plus.device.vibrate(1000);
				app.warn("皮试医嘱和病人信息不匹配,请重新核对", function () {
					mui("#popover").popover('toggle');
					var topview = plus.webview.getTopWebview();
					if (topview.id == "main.html") {
						topview = plus.webview.getWebviewById("main-sub.html");
					}
					plus.device.setWakelock(true);
					topview.evalJS("popover_pishijg()");
				});
				return false;
			}
			h.evalJS("pishijgBtn()");
			return false;
		} else {
			return false;
		}
	};
	//体征记录
	if (h.id == "/subPage/vitalSign.html") {
		h.evalJS("popover_remove()");
		var bingren = JSON.parse(localStorage.getItem('$bingren') || "{}");
		if (bingren.BINGANHAO != value) {
			plus.device.vibrate(1000);
			app.warn("当前病人和腕带信息不一致,请核对", function () {
				//app.alertSure("请扫病人腕带")
				app.confirmCancel("请扫病人腕带",
					function () {
						utils.openNow("/subPage/menu.html");
					}
				)
			});
			return false;
		} else {
			h.evalJS("VSCanSave()"); // 
			return false;
		}

	}

	//血糖录入
	if (h.id == "/subPage/blood-sugar.html") {
		h.evalJS("popover_remove()");
		var bingren = JSON.parse(localStorage.getItem('$bingren') || "{}");
		if (bingren.BINGANHAO != value) {
			plus.device.vibrate(1000);
			app.warn("当前病人和腕带信息不一致,请核对", function () {
				app.confirmCancel("请扫病人腕带",
					function () {
						utils.openNow("/subPage/menu.html");
					}
				);
			});
			return false;
		} else {
			//检查是否有血糖医嘱
			var yizhulist = JSON.parse(localStorage.getItem('$yizhulist') || "{}");
			utils.showWaiting();
			server.ajax({
				url: 'Bingren/CheckAllow',
				type: 'POST',
				data: {
					bingrenId: bingren.BINGRENID,
					checktype: "XUETANG"
				},
				success: function (d) {
					utils.closeWaiting();
					var data = JSON.parse(d);
					if (data.code === 0) {
						h.evalJS("CanSave()"); // 
					} else {
						app.warn(data.message, function () {
							utils.openNow("/subPage/menu.html");
						});

					}
				},
				error: function (xhr, type, errorThrown) {
					utils.closeWaiting();
					app.alert("请求失败");
				}
			});
			return false;
		}

	}

	//如果在皮试界面，扫腕带 需要查询是否有皮试信息 录入皮试结果
	if (h.id == "/orders/anaphylaxisTest.html" && !localStorage.getItem('$yizhulist') && value.split('P').length === 1) {
		utils.showWaiting();
		server.ajax({
			url: 'Bingren/PiShiByWanDai?binganhao=' + value,
			type: 'Get',
			success: function (d) {
				utils.closeWaiting();
				var data = JSON.parse(d);
				if (data.code === 0) {
					var psxx = data.result.PiShixx;
					var brxx = data.result.bingrenxx;
					var pishiList = JSON.parse(localStorage.getItem('$pishilist'));
					$.each(psxx, function (n, value) {
						var currCnt = pishiList.filter(function (a) {
							return a.jiluid == value.JILUID;
						}).length;
						console.log("数量：" + currCnt);
						if (currCnt == 0) {
							console.log(value.PISHIKSSJ);
							pishiList.push({
								"jiluid": "" + value.JILUID + "",
								"bingrenxm": "" + brxx.XINGMING + "",
								"bingrenid": "" + brxx.BINGRENID + "",
								"binganhao": "" + brxx.BINGANHAO + "",
								"xiangmumc": "" + value.XIANGMUMC + "",
								"xiangmudm": "" + value.XIANGMUDM + "",
								"pishisj": "" + value.PISHIKSSJ + "",
								"yizhuid": "" + value.YIZHUID + "",
								"yizhucode": "" + value.YIZHUCODE + "",
								"wanchengbz": "0"
							});
						}
					});
					localStorage.removeItem("$pishilist");
					localStorage.setItem("$pishilist", JSON.stringify(pishiList));
					h.evalJS("popover_pishijg()");
				} else {
					app.alert(data.message);
					plus.device.vibrate(1000);
				}
			},
			error: function (xhr, type, errorThrown) {
				utils.closeWaiting();
				plus.device.vibrate(1000);
				app.alert("请求失败");
			}
		});
		return false;
	}
	//如果医嘱信息存在，则说明等待扫描病人腕带验证了

	if ((h.id === "main-sub.html" || h.id === "/subPage/menu.html") && value.split('P').length === 1) //如果在病人列表扫码，而且扫码对象是病人腕带，则跳转到病人详情界面
	{
		console.log("在病人列表或菜单界面扫腕带");
		CheckBingRenXX(value);
	}
	//扫码腕带前 必须确认      localStorage.setItem("$AllowYizhizx",true);值  防止没点击确定 就允许扫描
	else if (yizhulist.length > 0 && value.split('P').length === 1 && localStorage.getItem("$AllowYizhizx")) { //扫描腕带

		h.evalJS("popover_remove()");
		var checkpass = true;
		mui.each(yizhulist, function (index) {
			if (yizhulist[index].BINGANHAO !== value) {
				localStorage.removeItem("$yizhulist"); //扫码得出的医嘱列表      
				localStorage.removeItem("$wandaitxm"); //腕带条码信息
				localStorage.removeItem("$AllowYizhizx");
				app.alert("医嘱信息和病人信息不匹配,请重新核对");
				checkpass = false;
				return false;
			}
		});
		if (!checkpass) {
			return false;
		}
		localStorage.setItem('$wandaitxm', value);
		var zhixinglx = yizhulist[0].ZHIXINGLX;
		if (zhixinglx == "3") {
			if (yizhulist[0].ZHIXINGWZ == "2") { //2018年7月17日 10:25:42  暂停恢复 需要扫码 ID:112  by HU.Q
				if (yizhulist[0].YIZHUTYPE == "静脉输液") {
					h.evalJS("popover_caozuofs('操作方式')");
					return false;
				}
				//2018年8月1日 22:17:22 静脉输液 活性药暂停恢复 需要重新设置流速 ID:394 by HU.Q
				else if (yizhulist[0].YIZHUTYPE == "静脉注射" && yizhulist[0].HUOXINHYBZ == "1") {
					h.evalJS("popover_tuizhu('推注泵设置',2)");
					return false;
				} else {
					server.ajax({
						url: 'Bingren/HuifuZhix',
						type: 'POST',
						data: {
							yizhutxm: localStorage.getItem("$yizhutxm"),
							bingrenId: yizhulist[0].BINGRENID
						},
						success: function (d) {
							utils.closeWaiting();
							var data = JSON.parse(d);
							if (data.code === 0) {
								plus.device.vibrate(500);
								app.toast('操作成功！');
								localStorage.removeItem("$yizhulist");
								localStorage.removeItem("$yizhutxm");
								localStorage.removeItem("$AllowYizhizx");
								var h = plus.webview.getTopWebview();
								h.evalJS("refreshData(function () { }, true)"); //调用子界面的方法
							} else {
								plus.device.vibrate(1000);
								app.alert(data.message);
							}
						},
						error: function (xhr, type, errorThrown) {
							utils.closeWaiting();
							app.alert("请求失败");
						}
					});
					return false;
				}
			}
			if (yizhulist[0].YIZHUTYPE == "皮下注射") //皮下注射病人 需要点人形图 才能执行完成
			{
				utils.open("/orders/Insulin.html");
				return false;
			} else if (yizhulist[0].YIZHUTYPE == "静脉输液") { //静脉输液需要弹出操作方式
				h.evalJS("popover_caozuofs('操作方式')");
				return false;
			} else if (yizhulist[0].YIZHUTYPE == "静脉注射") {
				//if (yizhulist[0].HUOXINHYBZ == "1" && yizhulist.length > 1) {
				if (yizhulist[0].HUOXINHYBZ == "1") {
					//活性药弹出推注泵速度和单位设置
					//先判断是否有其他相同的泵推类药品在执行
					utils.showWaiting();
					server.ajax({
						url: 'Bingren/HuoXingYList',
						type: 'POST',
						data: {
							bingrenId: yizhulist[0].BINGRENID
						},
						success: function (d) {
							utils.closeWaiting();
							var data = JSON.parse(d);
							if (data.code === 0) {
								h.evalJS("popover_tuizhu('推注泵设置',1)");

							} else {
								alert(data.message);
							}
						},
						error: function (xhr, type, errorThrown) {
							utils.closeWaiting();
							app.alert("请求失败");
						}
					});
					return false;
				}
			} else if (yizhulist[0].YIZHUTYPE == "过敏试验") {
				console.log(yizhulist[0].PISHIJG);
				if (yizhulist[0].PISHIJG == "") { //先做皮试					 
					var yizhutxm = localStorage.getItem('$yizhutxm');
					utils.showWaiting();
					server.ajax({
						url: 'Bingren/PiShiSave',
						type: 'POST',
						data: {
							bingrenid: yizhulist[0].BINGRENID,
							userid: state.account.YONGHUID,
							xiangmudm: yizhulist[0].YIZHUXMID,
							xiangmumc: yizhulist[0].YAOPINMC,
							tiaoxm: yizhutxm
						},
						success: function (d) {
							console.log(d);
							utils.closeWaiting();
							var data = JSON.parse(d);
							if (data.code === 0) {
								var h = plus.webview.getTopWebview();
								h.evalJS("refreshData(function () { }, true)"); //调用子界面的方法
								localStorage.removeItem("$yizhulist"); //扫码得出的医嘱列表      
								localStorage.removeItem("$wandaitxm"); //腕带条码信息
								localStorage.removeItem("$AllowYizhizx");
								var bingren = JSON.parse(localStorage.getItem('$bingren') || "{}");
								var tixingsj = 1200000;
								var canshu = localStorage.getItem("$canshu");
								if (canshu) {
									var canshuObj = JSON.parse(canshu);
									var zhengchang = canshuObj.canshu.filter(function (c) {
										return c.CANSHUDM == '皮试提示间隔时间';
									});
									tixingsj = zhengchang[0].CANSHUZ;
								}
								var minutes = Math.round(tixingsj / 60000 * 100) / 100;
								plus.device.vibrate(500);
								//								app.toast("操作成功,'" + minutes + "'分钟后输入皮试结果'");
								//								h.evalJS("app.toast('操作成功,'" + minutes + "'分钟后输入皮试结果'')");
								//								h.evalJS("mui.toast('操作成功,'" + minutes + "'分钟后输入皮试结果'')");
								//								mui.toast("操作成功,'" + minutes + "'分钟后输入皮试结果");
								app.toast("操作成功,'" + minutes + "'分钟后输入皮试结果");

								var pishiList = JSON.parse(localStorage.getItem('$pishilist') ||
									"[{ \"jiluid\": \"\", \"binganhao\": \"\",\"bingrenxm\": \"\",  \"bingrenid\": \"\",\"xiangmumc\": \"\",\"xiangmudm\": \"\",\"pishisj\":\"\",\"yizhuid\":\"\" ,\"yizhucode\":\"\" ,\"wanchengbz\":\"-1\" }]"
								);
								pishiList.push({
									"jiluid": data.result.jiluid,
									"bingrenxm": "" + bingren.XINGMING + "",
									"bingrenid": "" + yizhulist[0].BINGRENID + "",
									"binganhao": "" + yizhulist[0].BINGANHAO + "",
									"xiangmumc": "" + yizhulist[0].YAOPINMC + "",
									"xiangmudm": "" + yizhulist[0].YIZHUXMID + "",
									"pishisj": "" + new Date() + "",
									"yizhuid": "" + yizhulist[0].YIZHUID + "",
									"yizhucode": "" + yizhutxm.split('P')[1] + "",
									"wanchengbz": "0"
								});
								localStorage.setItem("$pishilist", JSON.stringify(pishiList));
								// 								setInterval(function () {
								// 									var topview = plus.webview.getTopWebview();
								// 									if (topview.id == "main.html") {
								// 										topview = plus.webview.getWebviewById("main-sub.html");
								// 									}
								// 									plus.device.setWakelock(true);
								// 									topview.evalJS("popover_pishijg()");
								// 								}, 60000); //900000毫秒=15分钟
							} else {
								plus.device.vibrate(1000);
								localStorage.removeItem("$yizhulist");
								alert(data.message);
							}
						},
						error: function (xhr, type, errorThrown) {
							utils.closeWaiting();
							localStorage.removeItem("$yizhulist");
							app.alert("请求失败");
						}
					});
					return false;
				}
			}

		}
		CheckYizhu(yizhulist, value, h.id);
	}
	//扫描医嘱条形码
	else if (value.split('P').length > 1) {

		localStorage.removeItem("$yizhulist");
		localStorage.setItem('$yizhutxm', value);
		utils.showWaiting();
		server.ajax({
			url: 'Bingren/CheckAllow',
			type: 'POST',
			data: {
				tiaoxm: value,
				checktype: "CheckYZ"
			},
			success: function (d) {
				utils.closeWaiting();
				var data = JSON.parse(d);
				if (data.code === 0) {
					h.evalJS("GetYaoPingLx()");
				} else {
					app.confirm(data.message,
						function () {
							localStorage.removeItem("$yizhulist");
							localStorage.removeItem("$yizhutxm");
							popover_hide();
						},
						function () {
							popover_hide();
							GetYaoPingLx();
						});
				}
			},
			error: function (xhr, type, errorThrown) {
				utils.closeWaiting();
				app.alert("请求失败");
			}
		});
		return false;
	} else {
		plus.device.vibrate(1000);
		h.evalJS("app.alert('条码未识别')");
	}
}

function GetYaoPingLx() {
	utils.showWaiting();
	var h = plus.webview.getTopWebview();
	server.ajax({
		url: 'Bingren/YaoPingLx',
		type: 'POST',
		data: {
			TiaoXingM: localStorage.getItem("$yizhutxm"),
			bingqudm: localStorage.getItem('$bingqu')
		},
		success: function (d) {
			utils.closeWaiting();
			var data = JSON.parse(d);
			if (data.code === 0) {
				if (data.result.yizhuList.length === 0) {
					alert("医嘱已执行或已经失效");
					return false;
				}
				if (data.result.bingrenList.length === 0) {
					app.alert("查询不到该医嘱的在院病人信息");
					return false;
				}
				if (data.result.bingrenList[0].ZAIYUANZT === '出院') {
					app.alert("病人已经出院");
					return false;
				}
				var bingren = JSON.parse(localStorage.getItem('$bingren') || "{}");
				localStorage.setItem('$dingwyz', JSON.stringify(data.result.yizhuList));
				if (localStorage.getItem('$bingqu') != data.result.bingrenList[0].BINGQUDM) {
					h.evalJS("app.alert('该医嘱病人不属于当前病区,请先切换')");
					return false;
				}
				localStorage.setItem("$TmDate", data.result.queryDate);
				if (bingren.BINGRENID !== data.result.bingrenList[0].BINGRENID) { //当前医嘱不属于目前病人界面，询问是否切换                       
					if (h.id != "main.html") {
						localStorage.setItem('$yizhulist', JSON.stringify(data.result.yizhuList));
						localStorage.setItem('$bingrenlist', JSON.stringify(data.result.bingrenList));
						app.confirm("该医嘱不属于当前病人，是否切换？",
							function () {
								localStorage.removeItem("$yizhulist");
								localStorage.removeItem("$bingrenlist");
								popover_hide();
							},
							function () {
								popover_hide();
								//同意切换病人界面
								var yizhutpye = JSON.parse(localStorage.getItem("$yizhulist"))[0].YIZHUTYPE;
								app.setBingren(JSON.parse(localStorage.getItem("$bingrenlist"))[0]);
								localStorage.removeItem("$bingrenlist");
								var h = plus.webview.getTopWebview();
								var webview = NavigateBar(yizhutpye);
								if (webview === h.id) { //判断顶层界面ID和需要跳转的界面ID相等(切换病人，但是界面还是同一个)
									mui.fire(h, "pageflowrefresh"); //刷新当前界面 pageflowrefresh方法                                                         
								} else {
									utils.open(webview, 2);
								}
							});
						return false;
					} else {
						var yizhutpye = data.result.yizhuList[0].YIZHUTYPE;
						app.setBingren(data.result.bingrenList[0]);
						localStorage.setItem('$yizhulist', JSON.stringify(data.result.yizhuList));
						var webview = NavigateBar(yizhutpye);
						if (webview === h.id) { //判断顶层界面ID和需要跳转的界面ID相等(切换病人，但是界面还是同一个)
							mui.fire(h, "pageflowrefresh"); //刷新当前界面 pageflowrefresh方法                                                         
						} else {
							utils.open(webview, 2);
						}
					}

					return false;
				} else {
					if (h.id == "/subPage/orders.html") { //判断是否在医嘱查询页面
						scrolltoYZ();
						h.evalJS("scrolltoOrder()");
						if (data.result.yizhuList[0].YIZHUYCBZ == 1) {

							h.evalJS("popover_cancleyichang()");
						}
						if (data.result.yizhuList[0].YIZHUYCBZ == 0) {

							h.evalJS("popover_yichang()");
						}

						return false;
					} else {
						var yizhutpye = data.result.yizhuList[0].YIZHUTYPE;
						app.setBingren(data.result.bingrenList[0]);
						localStorage.setItem('$yizhulist', JSON.stringify(data.result.yizhuList));
						var webview = NavigateBar(yizhutpye); //即将跳转的界面
						if (webview === h.id) {
							IsConfirm(data.result.yizhuList, h, "2");
						} else {
							utils.open(webview, 2);
						}
					}

				}
			} else {
				plus.device.vibrate(1000);
				h.evalJS("app.alert('" + data.message + "')");
			}
		},
		error: function (xhr, type, errorThrown) {
			plus.device.vibrate(1000);
			h.evalJS("app.alert('扫码失败')");
		}
	});

}
//根据扫描到的医嘱条形码切换tab
function switchtab(parm) {
	var doType = jQuery('.mui-control-item.mui-active');
	if (doType.data("zhixinglx") !== parm) {
		//tab按钮切换
		var elems = jQuery('.mui-control-item');
		if (elems != null && elems.length > 0) {
			var length = elems.length;
			for (var i = 0; i < length; i++) {
				var elem = elems[i];
				if (elem.getAttribute("data-zhixinglx") == parm) {
					elem.setAttribute("class", "mui-control-item mui-active");
				} else {
					elem.setAttribute("class", "mui-control-item");
				}

			}
		}
		//tap内容切换
		var contentelems = jQuery('.mui-control-content');
		if (contentelems != null && contentelems.length > 0) {
			var contentlength = contentelems.length;
			for (var i = 0; i < contentlength; i++) {
				var contentelem = contentelems[i];
				if (contentelem.getAttribute("data-zhixinglx") == parm) {
					contentelem.setAttribute("class", "mui-control-content mui-active");
				} else {
					contentelem.setAttribute("class", "mui-control-content");
				}

			}
		}
	}
	scrolltoYZ();
	scrolltoPS();
	//	scrolltoOrder();
}
//根据扫描到的医嘱条形码定位到相关医嘱
function switchscroll(parm) {
	var yzID = parm; //yizhulist[0].YIZHUID;
	var yizhudiv = jQuery('#' + yzID);
	if (yzID != '' && yizhudiv.length > 0) {
		jQuery('.mui-control-content.mui-active .dispensing-table-body').scrollTop(0);
		var top = yizhudiv.position().top; //yizhudiv.scrollTop();//offset().top;
		yizhudiv.addClass('dispensing-table-row__hover');
		jQuery('.mui-control-content.mui-active .dispensing-table-body').scrollTop(yizhudiv.offset().top);
	}
}

//function GetActive() {
//    console.log("执行GetActive");
//    localStorage.removeItem("$active");
//    var doType = jQuery('.mui-control-item.mui-active');
//    var zhixinglx = doType.data("zhixinglx");
//    localStorage.setItem("$active", zhixinglx);
//}
function showAG(laiyuan) {
	console.log("showAG->laiyuan:" + laiyuan);
	var yizhulist = JSON.parse(localStorage.getItem('$yizhulist') || "{}");
	if (yizhulist.length == 0) {
		//   mui.alert("请重新扫码医嘱条形码");
		return false;
	}
	var zhixinglx = yizhulist[0].ZHIXINGLX;
	var zhixingwz = yizhulist[0].ZHIXINGWZ;
	var doType = jQuery('.mui-control-item.mui-active');
	var yizhuitem = "";
	mui.each(yizhulist, function (index) {
		yizhuitem += "<div class='yplist'><div class='yplistItem'>" + yizhulist[index].YAOPINMC +
			"</div><div class='yplistItem'>" + yizhulist[index].YICIJL + yizhulist[index].YICIJLDW + "</div></div>";
		//      yizhuitem += yizhulist[index].YAOPINMC + "(" + yizhulist[index].YICIJL + yizhulist[index].YICIJLDW + ")\</br>"; //
	});
	//如果在当前tap界面，再一次刷新，要取消摆药或配药
	if (laiyuan == "2") {
		console.log("当前tap:" + doType.data("zhixinglx"));
		if (doType.data("zhixinglx") == "1" && zhixinglx == "1" && zhixingwz == "1") {
			CancleZhix(yizhulist);
			return false;
		} else if (doType.data("zhixinglx") != "1" && zhixinglx == "1" && zhixingwz == "1") {
			app.alert('当天医嘱未摆药');
			return false;
		}
		if (yizhulist.length == 1 && yizhulist[0].YIZHUTYPE == "静脉输液") { //单组药 只摆药不配药
			if (doType.data("zhixinglx") == "1" && zhixinglx == "3") {
				CancleZhix(yizhulist);
				return false;
			}
		} else {
			if (doType.data("zhixinglx") == "1" && zhixinglx == "2") {
				CancleZhix(yizhulist);
				return false;
			} else if (doType.data("zhixinglx") == "2" && zhixinglx == "3") {
				CancleZhix(yizhulist);
				return false;
			}
		}

	} else {
		if (zhixinglx == "1" && zhixingwz == "1") {
			app.alert('当天医嘱未摆药');
			return false;
		}
	}
	switchtab(yizhulist[0].ZHIXINGLX);
	if (zhixinglx === "1") {
		popover_yizhuxx(
			"医嘱摆药核对",
			yizhuitem,
			function () {
				localStorage.removeItem("$yizhulist");
				popover_hide();
			},
			function () {
				popover_hide();
				SaveYizhujl(yizhulist);
			}
		);
	} else if (zhixinglx === "2") {
		popover_yizhuxx(
			"医嘱配药核对",
			yizhuitem,
			function () {
				localStorage.removeItem("$yizhulist");
				popover_hide();
			},
			function () {
				popover_hide();
				SaveYizhujl(yizhulist);
			}
		);
	} else if (zhixinglx === "3") {
		//判断执行是否完成，再次扫码 需要巡视 修改流速 停止 操作
		if (yizhulist[0].ZHIXINGWZ == "1") {
			popover_anniu(
				yizhuitem,
				function () {
					mui("#popover_anniu").popover('toggle');
					SaveXunShijl("0", ""); //2018年7月17日 11:09:18 巡视不需要在选择正异常 ID：113  by HU.Q
					return false;
					popover_xunshijl("静脉注射巡视",
						function () {
							localStorage.removeItem("$yizhulist");
							popover_hide();
						},
						function () {
							var yichangbz = $("input:checkbox[name='yichangbz']:checked").val();
							var yichangyy = $(".mui_textarea>textarea").val();
							SaveXunShijl(yichangbz, yichangyy);
						});
				},
				function () {
					mui("#popover_anniu").popover('toggle');
					//					popover_hide();
					//					alert("2");
				},
				function () {
					popover_stoppause("静脉注射暂停/结束",
						function () {
							localStorage.removeItem("$yizhulist");
							popover_hide();
						},
						function () {
							var type = $("input:checkbox[name='stoppause']:checked").val();
							var yuanying = $(".mui_textarea>textarea").val();
							var yuliang = $(".yuliang").val();
							Stoppause(type, yuanying, yuliang);
						});
				}
			);
		} else if (yizhulist[0].ZHIXINGWZ == "2") {
			//暂停的医嘱 恢复执行
			popover_yizhuxx(
				"医嘱暂停,是否恢复?",
				yizhuitem,
				function () {
					localStorage.removeItem("$yizhulist");
					localStorage.removeItem("$yizhutxm");
					popover_hide();
				},
				function () {
					PostCheckYz(yizhulist[0].YIZHUID, yizhulist[0].BINGRENID);
					return false; //2018年7月17日 10:25:42  暂停恢复 需要扫码 ID:112  by HU.Q
					server.ajax({
						url: 'Bingren/HuifuZhix',
						type: 'POST',
						data: {
							yizhutxm: localStorage.getItem("$yizhutxm"),
							bingrenId: yizhulist[0].BINGRENID
						},
						success: function (d) {
							utils.closeWaiting();
							var data = JSON.parse(d);
							if (data.code === 0) {
								plus.device.vibrate(500);
								app.toast('操作成功！');
								localStorage.removeItem("$yizhulist");
								localStorage.removeItem("$yizhutxm");
								var h = plus.webview.getTopWebview();
								h.evalJS("refreshData(function () { }, true)"); //调用子界面的方法
							} else {
								plus.device.vibrate(1000);
								app.alert(data.message);
							}
						},
						error: function (xhr, type, errorThrown) {
							utils.closeWaiting();
							app.alert("请求失败");
						}
					});
				});
		} else {
			if (yizhulist[0].YIZHUTYPE == "皮下注射") { //皮下注射 需要判定是不是胰岛素
				popover_yidaosu(
					"皮下医嘱执行核对",
					yizhulist[0].YIDAOSBZ == "1" ? true : false,
					yizhuitem,
					function () {
						//取消事件
						popover_hide();
						localStorage.removeItem('pixiazs');
						localStorage.removeItem("$yizhulist");

					},
					function () {
						//确定事件
						var a = $(".mui-input-row.mui-checkbox.mui-left>input:checkbox:checked").length;
						if (a == 1) {
							if (yizhulist[0].YIDAOSBZ == "1" && yizhulist[0].ZONGLIANG != 0) {
								popover_yidaosure(
									"胰岛素注射液管理",
									yizhulist[0].ZONGLIANG,
									yizhulist[0].YULIANG,
									yizhulist[0].YOUXIAOTS,
									function () {
										popover_hide();
										localStorage.removeItem("$yizhulist");
									},
									function () {
										if (yizhulist[0].YULIANG < yizhulist[0].YICIJL) {
											app.alert('胰岛素剩余量不足');
											return false;
										}
										if (yizhulist[0].YOUXIAOTS < 0) {
											app.alert('已经超过有效时间');
											return false;
										}
										popover_hide();
										localStorage.setItem('$yidaossz', true);
										localStorage.setItem("$AllowYizhizx", true);
										app.alert('请扫描病人腕带');
									},
									function () {
										popover_yidaosuz("胰岛素注射液管理",
											function () {
												popover_hide();
												localStorage.removeItem("$yizhulist");
											},
											function () {
												var zongliang = $('.zongl').val();
												var days = $('.dayNum').val();
												var yidaosusz = "{ \"zongliang\": \"" + zongliang + "\", \"days\": \"" + days + "\"}";
												popover_hide();
												localStorage.setItem('$yidaosuszxx', yidaosusz);
												localStorage.setItem("$AllowYizhizx", true);
												app.alert('设置成功,请扫描病人腕带');

											});
									});
							} else {
								// 如果勾选了胰岛素，则需要设置总量和有效天数
								popover_yidaosuz("胰岛素注射液管理",
									function () {
										popover_hide();
										localStorage.removeItem("$yizhulist");
									},
									function () {
										var zongliang = $('.zongl').val();
										var days = $('.dayNum').val();
										var yidaosusz = "{ \"zongliang\": \"" + zongliang + "\", \"days\": \"" + days + "\"}";
										// Saveyidaossz(zongliang, days);
										popover_hide();
										//localStorage.setItem('$yidaossz', true);
										localStorage.setItem('$yidaosuszxx', yidaosusz);
										localStorage.setItem("$AllowYizhizx", true);
										app.alert('设置成功,请扫描病人腕带');

									});
							}
						} else {
							popover_hide();
							localStorage.setItem("$AllowYizhizx", true);
							app.alert('请扫描病人腕带');
						}
					}
				);
			} else if (yizhulist[0].YIZHUTYPE == "过敏试验") {
				if (yizhulist[0].PISHIJG == "") { //还未做皮试,就需要先皮试
					// app.alert('请扫病人腕带,开始皮试');
					popover_yizhuxx(
						"过敏试验执行核对",
						yizhuitem,
						function () {
							localStorage.removeItem("$yizhulist");
							popover_hide();
						},
						function () {
							popover_hide();
							localStorage.setItem("$AllowYizhizx", true);
							app.alert('请扫病人腕带,开始皮试');
						}
					);
				} else if (yizhulist[0].PISHIJG != "0") {
					popover_hide();
					localStorage.removeItem("$yizhulist");
					app.alert('皮试结果为阳性，不允许执行');
				} else {
					popover_yizhuxx(
						"医嘱执行核对",
						yizhuitem,
						function () {
							localStorage.removeItem("$yizhulist");
							popover_hide();
						},
						function () {
							popover_hide();
							localStorage.setItem("$AllowYizhizx", true);
							app.alert('请扫病人腕带');
						});
				}
			} else {
				popover_yizhuxx(
					"医嘱执行核对",
					yizhuitem,
					function () {
						localStorage.removeItem("$yizhulist");
						popover_hide();
					},
					function () {
						popover_hide();
						PostCheckYz(yizhulist[0].YIZHUID, yizhulist[0].BINGRENID);
						//    app.alert('请扫病人腕带');
					});
				//mui.alert(yizhuitem, '医嘱执行核对');
			}
		}
		//webview.evalJS("switchscroll('" + yizhulist[0].YIZHUID + "')");//调用子界面的方法
	}
};

//通过后台验证，医嘱是否存在相同泵推药物，是否允许执行
function PostCheckYz(yizhuId, bingrenid) {
	var yizhulist = JSON.parse(localStorage.getItem('$yizhulist') || "{}");
	utils.showWaiting();
	server.ajax({
		url: 'Bingren/CheckAllow',
		type: 'POST',
		data: {
			yizhuId: yizhuId,
			bingrenId: bingrenid
		},
		success: function (d) {
			utils.closeWaiting();
			var data = JSON.parse(d);
			if (data.code === 0) {
				localStorage.setItem("$AllowYizhizx", true);
				popover_hide();
				app.alert('请扫描病人腕带！');
			} else {
				app.alert(data.message);
			}
		},
		error: function (xhr, type, errorThrown) {
			utils.closeWaiting();
			app.alert("请求失败");
		}
	});
}
//弹出校验提示框，是否摆药 是否配药
function IsConfirm(yizhulist, webview, laiyuan) {
	//webview.evalJS("switchtab('" + yizhulist[0].ZHIXINGLX + "')");//调用子界面的方法 切换tab
	webview.evalJS("showAG('" + laiyuan + "')"); // 
}

//校验医嘱和病人信息是否对应
function CheckYizhu(yizhulist, value, webview, zhixingfs) {
	var save = true;
	mui.each(yizhulist, function (index) {
		console.log(yizhulist[index].BINGANHAO);
		console.log(value);
		if (yizhulist[index].BINGANHAO !== value) {
			app.alert("医嘱信息和病人信息不匹配,请重新核对");
			save = false;
			return false;
		}
	});
	if (save) {
		if (yizhulist[0].YIZHUTYPE == "静脉输液") {
			var caozuofs = 0;
			caozuofs = localStorage.getItem("$caozuofs"); //1多路 2接瓶
			if (caozuofs == "2") { //如果存在多条通路同时在执行，则需要提供列表 接瓶通路
				//判断是否存在多条通路
				GetJingMaiSYList();
				return false;
			}
		}
		SaveYizhujl(yizhulist, zhixingfs);
	}
}
///获取正在执行的静脉输液
function GetJingMaiSYList() {
	utils.showWaiting();
	var yizhulist = JSON.parse(localStorage.getItem('$yizhulist') || "{}");
	server.ajax({
		url: 'Bingren/YizhuTongluList',
		type: 'POST',
		data: {
			bingrenId: yizhulist[0].BINGRENID
		},
		success: function (d) {
			console.log(d);
			utils.closeWaiting();
			var data = JSON.parse(d);
			if (data.code === 0) {
				var list = data.result.yizhuList;
				var h = plus.webview.getTopWebview();
				if (list.length == 0) {
					localStorage.setItem('$zxyizhuid', "");
					SaveYizhujl(yizhulist, h.id);
				} else if (list.length == 1) {
					localStorage.setItem('$zxyizhuid', list[0].YIZHUID + 'P' + list[0].YIZHUCODE);
					SaveYizhujl(yizhulist, h.id);
				} else {
					var yizhuitem = "";
					mui.each(list, function (index) {
						yizhuitem +=
							'<div class="mui-radio" style="padding:3px 0px; border-bottom:1px dashed #dfdfdf;">' +
							'<input name="radio1" value="' + list[index].YIZHUID + 'P' + list[index].YIZHUCODE +
							'" type="radio" class="rds">' +
							'<label>' + list[index].YIZHUMC + '</label>' +
							'</div>';
					});
					console.log(yizhuitem);
					popover_duoluyz(
						"请选择结束的通路",
						yizhuitem,
						function () {
							localStorage.removeItem("$yizhulist");
							popover_hide();
						},
						function () {
							var checkVal = getRadioRes('rds');
							if (checkVal == null) {
								app.alert('请选择需要结束的多路');
								return;
							}
							localStorage.setItem('$zxyizhuid', checkVal);
							popover_hide();
							var h = plus.webview.getTopWebview();
							SaveYizhujl(yizhulist, h.id);
						}
					);
				}
			} else {
				app.alert(data.message);
			}
		},
		error: function (xhr, type, errorThrown) {
			utils.closeWaiting();
			app.alert("请求失败");
		}
	});
}
//保存医嘱操作记录 zhixingfs 1执行 2泵推药物 暂停恢复
function SaveYizhujl(yizhulist, zhixingfs) {

	var caozuofs = 0;
	var zxyizhuid = "";
	if (yizhulist[0].YIZHUTYPE == "静脉输液") {
		caozuofs = localStorage.getItem("$caozuofs"); //1多路 2接瓶
		if (caozuofs == "2") {
			//如果存在多条通路同时在执行，则需要提供列表 接瓶通路
			zxyizhuid = localStorage.getItem("$zxyizhuid");
		}
		if (yizhulist[0].ZHIXINGWZ == "2") //如果暂停的医嘱需要恢复
		{
			utils.showWaiting();
			server.ajax({
				url: 'Bingren/HuifuZhix',
				type: 'POST',
				data: {
					yizhutxm: localStorage.getItem("$yizhutxm"),
					bingrenId: yizhulist[0].BINGRENID,
					caozuofs: caozuofs,
					userId: state.account.YONGHUID,
					zxyizhuid: zxyizhuid
				},
				beforeSend:function(){
					utils.showWaiting();
				},
				success: function (d) {
					utils.closeWaiting();
					var data = JSON.parse(d);
					if (data.code === 0) {
						plus.device.vibrate(500);
						app.toast('操作成功！');
						localStorage.removeItem("$yizhulist");
						localStorage.removeItem("$yizhutxm");
						localStorage.removeItem("$AllowYizhizx");
						var h = plus.webview.getTopWebview();
						h.evalJS("refreshData(function () { }, true)"); //调用子界面的方法
					} else {
						localStorage.removeItem("$yizhulist");
						localStorage.removeItem("$yizhutxm");
						localStorage.removeItem("$AllowYizhizx");
						plus.device.vibrate(1000);
						app.alert(data.message);
					}
				},
				complete:function(){
					utils.closeWaiting();
				},
				error: function (xhr, type, errorThrown) {
					localStorage.removeItem("$yizhulist");
					localStorage.removeItem("$yizhutxm");
					utils.closeWaiting();
					app.alert("请求失败");
				}
			});
			return false;
		}
	}
	var danwei = "";
	var bengtuisd = "";
	var tizhong = "";
	var jisuanz = "";
	var zhixinglx = yizhulist[0].ZHIXINGLX;
	if (zhixinglx == "3") {
		if (yizhulist[0].HUOXINHYBZ == "1") {
			var bengtui = jQuery.parseJSON(localStorage.getItem('$bengtui'));
			danwei = bengtui[0].DANWEI;
			bengtuisd = bengtui[0].BENTUISD;
			tizhong = bengtui[0].TIZHONG;
			jisuanz = bengtui[0].JISUANZ;
		}
	}

	utils.showWaiting();
	server.ajax({
		url: 'Bingren/YizhuSave',
		type: 'POST',
		async: false,
		data: {
			yizhuId: yizhulist[0].YIZHUID,
			bingrenId: yizhulist[0].BINGRENID,
			chengzuyz: yizhulist[0].CHENGZUYZ,
			userId: state.account.YONGHUID,
			zhixinglx: yizhulist[0].ZHIXINGLX, //(doType + medicineVal),
			yizhutxm: localStorage.getItem("$yizhutxm"),
			caozuofs: caozuofs,
			zxyizhuid: zxyizhuid,
			danwei: danwei,
			bengtuisd: bengtuisd,
			tizhong: tizhong,
			jisuanz: jisuanz,
			caozuosj: yizhulist[0].CAOZUOSJ,
			zhixingfs: zhixingfs
		},
		success: function (d) {
			utils.closeWaiting();
			var data = JSON.parse(d);
			if (data.code === 0) {
				plus.device.vibrate(500);
				localStorage.removeItem("$yizhulist"); //扫码得出的医嘱列表      
				localStorage.removeItem("$bengtui"); //泵推设置json字符串
				localStorage.removeItem("$caozuofs"); //输液操作方式 接瓶 多路 
				localStorage.removeItem("$wandaitxm"); //腕带条码信息
				localStorage.removeItem("$zxyizhuid"); //选择停止的医嘱ID
				localStorage.removeItem("$AllowYizhizx");
				var h = plus.webview.getTopWebview();
				h.evalJS("app.toast('操作成功！')");
				h.evalJS("refreshData(function () { }, true)"); //调用子界面的方法

			} else {
				//   app.alert(data.message);
				localStorage.removeItem("$yizhulist");
				localStorage.removeItem("$yizhutxm");
				localStorage.removeItem("$AllowYizhizx");
				plus.device.vibrate(1000);
				alert(data.message);
			}
		},
		error: function (xhr, type, errorThrown) {
			localStorage.removeItem("$yizhulist");
			localStorage.removeItem("$yizhutxm");
			localStorage.removeItem("$AllowYizhizx");
			utils.closeWaiting();
			app.alert("请求失败");
		}
	});
	return false;
}
//撤销 摆药 配药操作
function CancleZhix(yizhulist) {
	//   var h = plus.webview.getTopWebview();
	var yizhuitem = "";
	mui.each(yizhulist, function (index) {
		yizhuitem += "<div class='yplist'><div class='yplistItem'>" + yizhulist[index].YAOPINMC +
			"</div><div class='yplistItem'>" + yizhulist[index].YICIJL + yizhulist[index].YICIJLDW + "</div></div>";
		//      yizhuitem += yizhulist[index].YAOPINMC + "(" + yizhulist[index].YICIJL + yizhulist[index].YICIJLDW + ")\</br>"; //
	});
	var title = "";
	var zhixinglx = "";
	if (yizhulist[0].ZHIXINGLX == "2") {
		title = "是否撤销医嘱摆药？";
		zhixinglx = "1";
	} else if (yizhulist[0].ZHIXINGLX == "3") {
		title = "是否撤销医嘱配药？";
		zhixinglx = "2";
		if (yizhulist.length == 1 && yizhulist[0].YIZHUTYPE == "静脉输液") {
			title = "是否撤销医嘱摆药？";
			zhixinglx = "1";
		}
	} else if (yizhulist[0].ZHIXINGLX == "1" && yizhulist[0].ZHIXINGWZ == "1") {
		title = "是否撤销医嘱摆药？";
		zhixinglx = "1";
	}
	scrolltoYZ();
	popover_yizhuxx(
		title,
		yizhuitem,
		function () {
			localStorage.removeItem("$yizhulist");
			popover_hide();
		},
		function () {
			utils.showWaiting();
			server.ajax({
				url: 'Bingren/CancleZhix',
				type: 'POST',
				data: {
					yizhutxm: localStorage.getItem("$yizhutxm"),
					yizhuId: yizhulist[0].YIZHUID,
					zhixinglx: zhixinglx
				},
				success: function (d) {
					utils.closeWaiting();
					var data = JSON.parse(d);
					if (data.code === 0) {
						plus.device.vibrate(500);
						app.toast('操作成功！');
						var h = plus.webview.getTopWebview();
						h.evalJS("refreshData(function () { }, true)"); //调用子界面的方法
						localStorage.removeItem("$yizhulist");
						popover_hide();
					} else {
						plus.device.vibrate(1000);
						// app.toast(data.message);
						app.alert(data.message);

					}
				},
				error: function (xhr, type, errorThrown) {
					utils.closeWaiting();
					app.alert("请求失败");
				}
			});
		});
	//var btnArray = ['确定', '取消'];
	//mui.confirm(yizhuitem, title, btnArray, function (e) {
	//    if (e.index !== 1) {
	//        server.ajax({
	//            url: 'Bingren/CancleZhix',
	//            type: 'POST',
	//            data: {
	//                yizhutxm: localStorage.getItem("$yizhutxm"),
	//                yizhuId: yizhulist[0].YIZHUID,
	//                zhixinglx: zhixinglx
	//            },
	//            success: function (d) {
	//                utils.closeWaiting();
	//                var data = JSON.parse(d);
	//                if (data.code === 0) {
	//                    app.toast('操作成功！');
	//                    localStorage.removeItem("$yizhulist");
	//                    var h = plus.webview.getTopWebview();
	//                    h.evalJS("refreshData(function () { }, true)");//调用子界面的方法
	//                } else {
	//                    // app.toast(data.message);
	//                    mui.alert(data.message);
	//                }
	//            },
	//            error: function (xhr, type, errorThrown) {
	//                utils.closeWaiting();
	//                mui.alert("请求失败");
	//            }
	//        });
	//    }
	//});

}
//根据条形码核对病人信息
function CheckBingRenXX(binganhao) {
	console.log("核对病人信息:" + binganhao)
	server.ajax({
		url: 'Bingren/GetBingrenXx?binganhAo=' + binganhao.trim(),
		type: 'GET',
		success: function (d) {
			utils.closeWaiting();
			var data = JSON.parse(d);
			if (data.code === 0) {
				if (data.result.list.length > 0) {
					if (localStorage.getItem('$bingqu') != data.result.list[0].BINGQUDM) {
						app.alert("该病人不属于当前病区,请先切换");
						return false;
					}
					app.setBingren(data.result.list[0]);
					utils.open("/subPage/menu.html");
				} else {
					var h = plus.webview.getTopWebview();
					h.evalJS("app.alert('找不到病人在院信息')");
				}
			} else {
				var h = plus.webview.getTopWebview();
				h.evalJS("app.alert(data.message)");
				//				app.alert(data.message);
			}
		},
		error: function (xhr, type, errorThrown) {
			console.log(xhr);
			console.log(type);
			console.log(errorThrown);
			utils.closeWaiting();
			app.alert("请求失败");
		}
	});
}

//插入医嘱巡视记录
function SaveXunShijl(yichangbz, yichangyy) {
	var yizhulist = JSON.parse(localStorage.getItem('$yizhulist') || "{}");
	utils.showWaiting();
	server.ajax({
		url: 'Bingren/SaveXunShijl',
		type: 'POST',
		data: {
			yizhuid: localStorage.getItem("$yizhutxm").split('P')[0],
			yizhucode: localStorage.getItem("$yizhutxm").split('P')[1],
			bingrenid: yizhulist[0].BINGRENID,
			xunshir: state.account.YONGHUID,
			yizhufl: yizhulist[0].YIZHUTYPE,
			yichangbz: yichangbz,
			yichangyy: yichangyy
		},
		success: function (d) {
			utils.closeWaiting();
			var data = JSON.parse(d);
			if (data.code === 0) {
				plus.device.vibrate(500);
				app.toast('操作成功！');
				popover_hide();
				localStorage.removeItem("$yizhulist");
				var h = plus.webview.getTopWebview();
				h.evalJS("refreshData(function () { }, false)"); //调用子界面的方法
				//mui.fire(h, "pageflowrefresh");//刷新当前界面 pageflowrefresh方法           
			} else {
				plus.device.vibrate(1000);
				// app.toast(data.message);
				app.alert(data.message);
			}
		},
		error: function (xhr, type, errorThrown) {
			console.log(errorThrown);
			console.log(xhr);
			console.log(type);
			utils.closeWaiting();
			mui.toast("请求失败");
		}
	});
}
//医嘱暂停或停止
function Stoppause(type, yuanying, yuliang) {
	var yizhulist = JSON.parse(localStorage.getItem('$yizhulist') || "{}");
	utils.showWaiting();
	server.ajax({
		url: 'Bingren/YizhuStopPause',
		type: 'POST',
		data: {
			yizhutxm: localStorage.getItem("$yizhutxm"),
			bingrenId: yizhulist[0].BINGRENID,
			userId: state.account.YONGHUID,
			Stoppausebz: type,
			Stoppauseyy: yuanying,
			yuliang: yuliang
		},
		success: function (d) {
			utils.closeWaiting();
			var data = JSON.parse(d);
			if (data.code === 0) {
				plus.device.vibrate(500);
				app.toast('操作成功！');
				popover_hide();
				localStorage.removeItem("$yizhulist");
				var h = plus.webview.getTopWebview();
				h.evalJS("refreshData(function () { }, false)"); //调用子界面的方法
				//mui.fire(h, "pageflowrefresh");//刷新当前界面 pageflowrefresh方法           
			} else {
				plus.device.vibrate(1000);
				// app.toast(data.message);
				app.alert(data.message);
			}
		},
		error: function (xhr, type, errorThrown) {
			utils.closeWaiting();
			app.alert("请求失败");
		}
	});
}
//胰岛素设置
function Saveyidaossz(zongliang, days) {
	var yizhulist = JSON.parse(localStorage.getItem('$yizhulist') || "{}");
	utils.showWaiting();
	server.ajax({
		url: 'Bingren/Saveyidaossz',
		type: 'POST',
		data: {
			yizhuid: localStorage.getItem("$yizhutxm").split('P')[0],
			yizhucode: localStorage.getItem("$yizhutxm").split('P')[1],
			bingrenid: yizhulist[0].BINGRENID,
			bingqudm: yizhulist[0].BINGQUDM,
			userid: state.account.YONGHUID,
			yaopingdm: yizhulist[0].YIZHUXMID,
			yaopingmc: yizhulist[0].YAOPINMC,
			zongliang: zongliang,
			days: days
		},
		success: function (d) {
			utils.closeWaiting();
			var data = JSON.parse(d);
			if (data.code === 0) {
				popover_hide();
				localStorage.setItem("$AllowYizhizx", true);
				app.alert('设置成功,请扫描病人腕带');
				localStorage.setItem('$yidaossz', true);
			} else {
				app.alert(data.message);
			}
		},
		error: function (xhr, type, errorThrown) {
			utils.closeWaiting();
			app.alert("请求失败");
		}
	});
}

//判断是否为摆药
function pdZhiXinglxBY(currentList, nowdate) {
	//  var bingren = JSON.parse(localStorage.getItem('$bingren') || "{}");
	//	var currDay = new Date().getDay() == 0 ? 7 : new Date().getDay(); //今日的星期
	var currDay = new Date(nowdate).getDay() == 0 ? 7 : new Date(nowdate).getDay(); //今日的星期
	//	var currDayT = new Date().getDay() + 1 == 0 ? 7 : new Date().getDay() + 1; //明天的星期
	var o = currentList;
	//配今天开单的临时和今日需要用药的长期医嘱，
	if (o.CHANGQILS == "LS" ||
		(!((o.NOTE || '').indexOf('NEXT') > -1 && o.KAIDANSJ.substring(0, 10) === new Date(nowdate).format('yyyy-MM-dd')) &&
			!(o.INWEEK == 1 && (o.NOTE || '').indexOf(currDay) == -1) && o.CHANGQILS == "CQ")) {
		return true;
	} else {
		return false;
	}

}
//判断是否为配药
function pdZhiXinglxPY(currentList, nowdate) {
	var currDay = new Date(nowdate).getDay() == 0 ? 7 : new Date(nowdate).getDay();
	var o = currentList;
	//配今天的临时和长期医嘱，单组药不配药
	if (o.CHANGQILS == "LS" ||
		(!((o.NOTE || '').indexOf('NEXT') > -1 && o.KAIDANSJ.substring(0, 10) === new Date(nowdate).format('yyyy-MM-dd')) &&
			!(o.INWEEK == 1 && (o.NOTE || '').indexOf(currDay) == -1) && o.CHANGQILS == "CQ")) { //&& !(o.HUOXINHYBZ == 1)
		return true;
	} else {
		return false;
	}
}
//判断是否为执行
function pdZhiXinglxZX(currentList, nowdate) {
	var currDay = new Date(nowdate).getDay() == 0 ? 7 : new Date(nowdate).getDay();
	var o = currentList;
	//	(new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date().format('yyyy-MM-dd') && )
	if (o.CHANGQILS == "LS" ||
		(!((o.NOTE || '').indexOf('NEXT') > -1 && o.KAIDANSJ.substring(0, 10) === new Date(nowdate).format('yyyy-MM-dd')) &&
			!(o.INWEEK == 1 && (o.NOTE || '').indexOf(currDay) == -1) && o.CHANGQILS == "CQ")) {
		return true;
	} else {
		return false;
	}
}

//医嘱（摆药、配药、执行）显示
function showDataType1(currentList, jiluList, type, yizhutype, nowdate) {
	if (yizhutype == "静脉输液") {
		var groupListLength = "0";
	} else {
		groupListLength = "-1";
	}
	document.getElementById("table1").innerHTML = '';
	//  document.getElementById("table1").addClass('dispensing-table-box');

	var tableStr1 = '',
		tableStr2 = '',
		tableStr3 = '';
	var tableStr1wb = '',
		tableStr1yb = '';
	var tableStr2w = '',
		tableStr2y = '';
	var tableStr3w = '',
		tableStr3y = '';
	var tableyhead = '';
	tableyhead = '<div class="dispensing-table-head">已完成</div>';
	var tableStr1wLS = '',
		tableStr1wCQ = '',
		tableStr1wQT = '';
	var tableStr1yLS = '',
		tableStr1yCQ = '',
		tableStr1yQT = '';
	var tableStr2wLS = '',
		tableStr2wCQ = '',
		tableStr2wQT = '';
	var tableStr2yLS = '',
		tableStr2yCQ = '',
		tableStr2yQT = '';
	var tableStr3wLS = '',
		tableStr3wCQ = '',
		tableStr3wQT = '';
	var tableStr3yLS = '',
		tableStr3yCQ = '',
		tableStr3yQT = '';
	var ifFinished;
	var currDay = new Date(nowdate).getDay() == 0 ? 7 : new Date(nowdate).getDay();

	//	function GetDateStr(AddDayCount) {
	//		var dd = new Date();
	//		dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期 
	//		var y = dd.getFullYear();
	//		var m = dd.getMonth() + 1; //获取当前月份的日期 
	//		var d = dd.getDate();
	//		return y + "-" + m + "-" + d;
	//	}
	var chenzhuArr = [];
	var chenzhui = 0;
	for (var index = 0; index < currentList.length; index++) {
		var o = currentList[index];
		var groupLength = 0;
		var currCnt1 = 0,
			currCnt12 = 0,
			currCnt13 = 0,
			currCnt14 = 0,
			currCnt15 = 0,
			currCnt16 = 0;
		var currCnt2 = 0,
			currCnt21 = 0,
			currCnt22 = 0,
			currCnt23 = 0;
		var currCnt3 = 0,
			currCnt31 = 0,
			currCnt32 = 0,
			currCnt33 = 0;
		var groupArr = [];
		var zxjlStrCommon = "";
		var flag = 0;
		var Aflag = 1;
		//最后一个值
		if (index == currentList.length - 1) {
			Aflag = 0;
			for (var f = 0; f < chenzhuArr.length; f++) {
				if (index == chenzhuArr[f]) {
					Aflag = 1;
					break;
				}
			}
		}
		//0~currentList.length-1的值
		for (var j = index + 1; j < currentList.length; j++) {
			Aflag = 0;
			groupArr[0] = index;
			for (var f = 0; f < chenzhuArr.length; f++) {
				if (index == chenzhuArr[f]) {
					//					index = index + 1;
					flag = 1;
					break;
				}
			}
			if (flag == 1) {
				Aflag = 1;
				break;
			}
			if (o.YIZHUID == currentList[j].YIZHUID) {
				groupLength++;
				groupArr[groupLength] = j;
				chenzhuArr[chenzhui] = j;
				chenzhui++;
			}
		}

		if (Aflag != 1) {
			var yizhuLX = o.CHANGQILS;
			//医嘱说明
			var yizhusm = "";
			if (o.YIZHUSM == null) {
				yizhusm = "display-none";
			}
			var tzStatue = "display-none";
			var tzStatueTxt = "";
			//              if(o.YIZHUZT == '0'){
			//              	tzStatue = "display-block";
			//              	tzStatueTxt = "在执行";
			//              }
			if (o.YIZHUZT == '2') {
				tzStatue = "display-block";
				tzStatueTxt = "已停嘱";
			}
			if (o.YIZHUZT == '3') {
				tzStatue = "display-block";
				tzStatueTxt = "已作废";
			}
			//今天开单的临时和今日需要用药的长期医嘱，
			//摆药：医嘱开始时间当天，频次为首日次数，若首日次数为空，则取医嘱中的频次
			var zxlxBY = pdZhiXinglxBY(o, nowdate);
			if (zxlxBY == true) {

				var chengzuID = o;
				var groupStrCommon = "",
					groupStrRight = "",
					groupDiv = "";
				if (groupLength > 0) {
					groupDiv = "groupDiv";
					for (var i = 1; i < groupArr.length; i++) {
						groupStrCommon +=
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + currentList[groupArr[i]].YIZHUID + '" value="' + currentList[groupArr[i]].YIZHUID +
							'"/>' +
							'<div>' +
							currentList[groupArr[i]].YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' +
							(currentList[groupArr[i]].YICIJL + currentList[groupArr[i]].YICIJLDW) +
							'</div>' +
							'</div>';
					}
				}

				//临时医嘱
				if (yizhuLX == "LS") {
					currCnt1 += jiluList.filter(function (a) {
						return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "1" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
							nowdate).format(
							'yyyy-MM-dd')
					}).length;

					var currCntShow = currCnt1,
						allCntShow = (o.FEQUENCYTIMES || 1);
					var ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
					if (ifFinished == "finished") {
						tableStr1yLS +=
							'<div class="dispensing-table-row yizhulx-LS ' + index + ' ' + ifFinished + ' ' + o.YIZHUID + '">' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' +
							o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
							'</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">打印时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</div>';
					} else {
						tableStr1wLS +=
							'<div class="dispensing-table-row yizhulx-LS ' + index + ' ' + ifFinished + ' ' + o.YIZHUID + '" >' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' +
							o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
							'</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">打印时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</div>';
					}
				}
				//今日长期医嘱，医嘱开始时间为今天 ，首日次数不为空，allCntShow为首日次数
				if (yizhuLX == "CQ" && (new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd'))) {
					console.log("index->" + index);
					currCnt12 += jiluList.filter(function (a) {
						return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "1" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
							nowdate).format(
							'yyyy-MM-dd');
					}).length;
					currCntShow = currCnt12;
					if (o.SHOURICS != "") {
						if (o.SHOURICS != 0) {
							allCntShow = o.SHOURICS;

							ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
							if (ifFinished == "finished") {
								tableStr1yCQ +=
									'<div class="dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '" >' +
									'<input type="hidden" class="index" value="' + index + '"/>' +
									'<div class="dispensing-table-box">' +
									'<div class="groupDiv">' +
									'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
									'<div>' +
									o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
									'</div>' +
									'</div>' +
									groupStrCommon +
									'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
									'<div class="mui-text-left">' +
									o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
									'</div>' +
									'<div class="groupTxt mui-text-right">' +
									'<span class="f-left">打印时间：' + nowdate + '</span>' +
									'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
									'/' +
									'<span class="allCount">' + allCntShow + '</span>)</span>' +
									'</div>' +
									'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
									'</div>' +
									'</div>';
							} else {
								tableStr1wCQ +=
									'<div class="dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '" >' +
									'<input type="hidden" class="index" value="' + index + '"/>' +
									'<div class="dispensing-table-box">' +
									'<div class="groupDiv">' +
									'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
									'<div>' +
									o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
									'</div>' +
									'</div>' +
									groupStrCommon +
									'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
									'<div class="mui-text-left">' +
									o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
									'</div>' +
									'<div class="groupTxt mui-text-right">' +
									'<span class="f-left">打印时间：' + nowdate + '</span>' +
									'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
									'/' +
									'<span class="allCount">' + allCntShow + '</span>)</span>' +
									'</div>' +
									'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
									'</div>' +
									'</div>';
							}
						}
					}

				}
				//今日长期医嘱，医嘱开始时间不为今天 
				if (yizhuLX == "CQ" && !(new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd'))) {

					currCnt13 += jiluList.filter(function (a) {
						return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "1" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
							nowdate).format(
							'yyyy-MM-dd');
					}).length;
					var currCntShow = currCnt13,
						allCntShow = (o.FEQUENCYTIMES || 1);
					var ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
					if (ifFinished == "finished") {

						tableStr1yCQ +=
							'<div class="dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '" >' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' +
							o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
							'</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">执行时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</div>';
					} else {
						tableStr1wCQ +=
							'<div class="dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '" >' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' +
							o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
							'</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">打印时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</div>';
					}
				}
				//其他医嘱(yizhuLX == "QT")
				if (yizhuLX == "QT") {
					currCnt14 += jiluList.filter(function (a) {
						return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "1" && (new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
							nowdate).format(
							'yyyy-MM-dd'));
					}).length;

					var currCntShow = currCnt14,
						allCntShow = (o.FEQUENCYTIMES || 1);
					var ifFinished = (currCntShow >= allCntShow) ? "finished" : "";

					if (ifFinished == "finished") {
						tableStr1yQT +=
							'<div class="dispensing-table-row yizhulx-QT ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '">' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' +
							o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
							'</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">打印时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</div>';
					} else {
						tableStr1wQT +=
							'<div class="dispensing-table-row yizhulx-QT ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '">' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' +
							o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
							'</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">打印时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</div>';
					}
				}

			}
			//配药  成组药
			var zxlxPY = pdZhiXinglxPY(o, nowdate);
			if (zxlxPY == true) {
				if (groupLength > groupListLength) {


					//临时医嘱
					if (yizhuLX == "LS") {
						currCnt2 += jiluList.filter(function (a) {
							return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "2" && (new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
								nowdate).format(
								'yyyy-MM-dd'));
						}).length;
						var currCntShow = currCnt2,
							allCntShow = (o.FEQUENCYTIMES || 1);

						if (new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd')) {
							if ((o.SHOURICS || '') != "") {
								allCntShow = o.SHOURICS;
							}
						}
						ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
						if (ifFinished == "finished") {
							tableStr2yLS +=
								'<div class="dispensing-table-row yizhulx-LS ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '">' +
								'<input type="hidden" class="index" value="' + index + '"/>' +
								'<div class="dispensing-table-box">' +
								'<div class="groupDiv">' +
								'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
								'<div>' +
								o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
								'</div>' +
								'</div>' +
								groupStrCommon +
								'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
								'<div class="mui-text-left">' +
								o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
								'</div>' +
								'<div class="groupTxt mui-text-right">' +
								'<span class="f-left">打印时间：' + nowdate + '</span>' +
								'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
								'/' +
								'<span class="allCount">' + allCntShow + '</span>)</span>' +
								'</div>' +
								'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
								'</div>' +
								'</div>';
						} else {
							tableStr2wLS +=
								'<div class="dispensing-table-row yizhulx-LS ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '">' +
								'<input type="hidden" class="index" value="' + index + '"/>' +
								'<div class="dispensing-table-box">' +

								'<div class="groupDiv">' +
								'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
								'<div>' +
								o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
								'</div>' +
								'</div>' +
								groupStrCommon +
								'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
								'<div class="mui-text-left">' +
								o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
								'</div>' +
								'<div class="groupTxt mui-text-right">' +
								'<span class="f-left">打印时间：' + nowdate + '</span>' +
								'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
								'/' +
								'<span class="allCount">' + allCntShow + '</span>)</span>' +
								'</div>' +
								'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
								'</div>' +
								'</div>';
						}
					}
					//今日长期医嘱，开始时间为今日
					if (yizhuLX == "CQ" && new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date().format('yyyy-MM-dd')) {
						currCnt21 += jiluList.filter(function (a) {
							return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "2" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
								nowdate).format(
								'yyyy-MM-dd');
						}).length;
						var currCntShow = currCnt21,
							allCntShow = 0;

						if (o.SHOURICS != "") {
							if (o.SHOURICS != 0) {
								allCntShow = o.SHOURICS;

								ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
								if (ifFinished == "finished") {
									tableStr2yCQ +=
										'<div class="dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '">' +
										'<input type="hidden" class="index" value="' + index + '"/>' +
										'<div class="dispensing-table-box">' +

										'<div class="groupDiv">' +
										'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
										'<div>' +
										o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
										'</div>' +
										'</div>' +
										groupStrCommon +
										'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
										'<div class="mui-text-left">' +
										o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
										'</div>' +
										'<div class="groupTxt mui-text-right">' +
										'<span class="f-left">打印时间：' + nowdate + '</span>' +
										'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
										'/' +
										'<span class="allCount">' + allCntShow + '</span>)</span>' +
										'</div>' +
										'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
										'</div>' +
										'</div>';
								} else {
									tableStr2wCQ +=
										'<div class="dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '" >' +
										'<input type="hidden" class="index" value="' + index + '"/>' +
										'<div class="dispensing-table-box">' +

										'<div class="groupDiv">' +
										'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
										'<div>' +
										o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
										'</div>' +
										'</div>' +
										groupStrCommon +
										'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
										'<div class="mui-text-left">' +
										o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
										'</div>' +
										'<div class="groupTxt mui-text-right">' +
										'<span class="f-left">执行时间：' + nowdate + '</span>' +
										'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
										'/' +
										'<span class="allCount">' + allCntShow + '</span>)</span>' +
										'</div>' +
										'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
										'</div>' +
										'</div>';
								}
							}
						}
					}
					//今日长期医嘱，开始时间不为今日
					if (yizhuLX == "CQ" && !(new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date().format('yyyy-MM-dd'))) {
						currCnt22 += jiluList.filter(function (a) {
							return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "2" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
								nowdate).format(
								'yyyy-MM-dd');
						}).length;
						var currCntShow = currCnt22,
							allCntShow = (o.FEQUENCYTIMES || 1);

						ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
						if (ifFinished == "finished") {
							tableStr2yCQ +=
								'<div class="dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '">' +
								'<input type="hidden" class="index" value="' + index + '"/>' +
								'<div class="dispensing-table-box">' +

								'<div class="groupDiv">' +
								'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
								'<div>' +
								o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
								'</div>' +
								'</div>' +
								groupStrCommon +
								'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
								'<div class="mui-text-left">' +
								o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
								'</div>' +
								'<div class="groupTxt mui-text-right">' +
								'<span class="f-left">打印时间：' + nowdate + '</span>' +
								'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
								'/' +
								'<span class="allCount">' + allCntShow + '</span>)</span>' +
								'</div>' +
								'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
								'</div>' +
								'</div>';
						} else {
							tableStr2wCQ +=
								'<div class="dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '" >' +
								'<input type="hidden" class="index" value="' + index + '"/>' +
								'<div class="dispensing-table-box">' +

								'<div class="groupDiv">' +
								'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
								'<div>' +
								o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
								'</div>' +
								'</div>' +
								groupStrCommon +
								'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
								'<div class="mui-text-left">' +
								o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
								'</div>' +
								'<div class="groupTxt mui-text-right">' +
								'<span class="f-left">打印时间：' + nowdate + '</span>' +
								'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
								'/' +
								'<span class="allCount">' + allCntShow + '</span>)</span>' +
								'</div>' +
								'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
								'</div>' +
								'</div>';
						}
					}
					//其他医嘱if (yizhuLX == "QT")
					if (yizhuLX == "QT") {
						currCnt23 += jiluList.filter(function (a) {
							return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "2" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
								nowdate).format(
								'yyyy-MM-dd');
						}).length;
						var currCntShow = currCnt23,
							allCntShow = (o.FEQUENCYTIMES || 1);

						if (new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date().format('yyyy-MM-dd')) {
							if ((o.SHOURICS || '') != "") {
								allCntShow = o.SHOURICS;
							}
						}
						ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
						if (ifFinished == "finished") {
							tableStr2yQT +=
								'<div class="dispensing-table-row yizhulx-QT ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '">' +
								'<input type="hidden" class="index" value="' + index + '"/>' +
								'<div class="dispensing-table-box">' +

								'<div class="groupDiv">' +
								'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
								'<div>' +
								o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
								'</div>' +
								'</div>' +
								groupStrCommon +
								'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
								'<div class="mui-text-left">' +
								o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
								'</div>' +
								'<div class="groupTxt mui-text-right">' +
								'<span class="f-left">打印时间：' + nowdate + '</span>' +
								'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
								'/' +
								'<span class="allCount">' + allCntShow + '</span>)</span>' +
								'</div>' +
								'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
								'</div>' +
								'</div>';
						} else {
							tableStr2wQT +=
								'<div class="dispensing-table-row yizhulx-QT ' + index + ' ' + ifFinished + ' ' + o.CHENGZUYZ + '">' +
								'<input type="hidden" class="index" value="' + index + '"/>' +
								'<div class="dispensing-table-box">' +

								'<div class="groupDiv">' +
								'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
								'<div>' +
								o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
								'</div>' +
								'</div>' +
								groupStrCommon +
								'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
								'<div class="mui-text-left">' +
								o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
								'</div>' +
								'<div class="groupTxt mui-text-right">' +
								'<span class="f-left">打印时间：' + nowdate + '</span>' +
								'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
								'/' +
								'<span class="allCount">' + allCntShow + '</span>)</span>' +
								'</div>' +
								'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
								'</div>' +
								'</div>';
						}
					}

				}
			}
			//执行  
			var zxlxZX = pdZhiXinglxZX(o, nowdate);
			if (zxlxZX == true) {
				//执行记录部分
				var zhixingList = jiluList.filter(function (a) {
					return a.YIZHUID == o.YIZHUID && (new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd'))
				});
				zhixingList.sort(function (a, b) {
					return b.ZXIXINGSJ - a.ZXIXINGSJ
				});
				zhixingList.sort(function (a, b) {
					return b.ZHIXINGLX - a.ZHIXINGLX
				});
				zhixingList.sort(function (a, b) {
					return b.STOPAUSEBZ - a.STOPAUSEBZ
				});
				var zxgroupList = groupBy(zhixingList, function (item) {
					return [item.YIZHUCODE];
				});

				for (var i = 0; i < zxgroupList.length; i++) {
					zxjlStrCommon += '<div class="zxjl-content">';
					for (var j = 0; j < zxgroupList[i].length; j++) {
						if (zxgroupList[i][j].ZHIXINGLX == '1') {
							zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">摆药：</span><span class="f-left">' + zxgroupList[i][j]
								.YONGHUXM + '/' + zxgroupList[i][j].YONGHUDM + '</span><span class="f-right">' + changeDateFormat(zxgroupList[i]
									[j].ZXIXINGSJ) + '</span></div>';
						}
						if (zxgroupList[i][j].ZHIXINGLX == '2') {
							zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">配药：</span><span class="f-left">' + zxgroupList[i][j]
								.YONGHUXM + '/' + zxgroupList[i][j].YONGHUDM + '</span><span class="f-right">' + changeDateFormat(zxgroupList[i]
									[j].ZXIXINGSJ) + '</span></div>';
						}
						if (zxgroupList[i][j].ZHIXINGLX == '3') {
							//          	        	if(zxgroupList[i][j].STOPPAUSEBZ == '0' ||  zxgroupList[i][j].STOPPAUSEBZ == ''){

							//          	        	}
							if (zxgroupList[i][j].STOPPAUSEBZ == '1') {
								zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">暂停：</span><span class="f-left">' + zxgroupList[i][
									j
								].YONGHUXM + '/' + zxgroupList[i][j].STOPPAUSEDM + '</span><span class="f-right">' + changeDateFormat(zxgroupList[
									i][j].STOPPAUSESJ) + '</span></div>';
							}
							if (zxgroupList[i][j].STOPPAUSEBZ == '2') {
								zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">停止：</span><span class="f-left">' + zxgroupList[i][
									j
								].STOPPAUSEXM + '/' + zxgroupList[i][j].STOPPAUSEDM + '</span><span class="f-right">' + changeDateFormat(zxgroupList[
									i][j].STOPPAUSESJ) + '</span></div>';
							}
							zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">执行：</span><span class="f-left">' + zxgroupList[i][j]
								.STOPPAUSEXM + '/' + zxgroupList[i][j].YONGHUDM + '</span><span class="f-right">' + changeDateFormat(zxgroupList[i]
									[j].ZXIXINGSJ) + '</span></div>';
						}
						if (zxgroupList[i][j].ZHIXINGLX == '4') {
							zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">异常：</span><span class="f-left">' + zxgroupList[i][j]
								.YONGHUXM + '/' + zxgroupList[i][j].YONGHUDM + '</span>&nbsp;&nbsp;&nbsp;&nbsp;(' + zxgroupList[i][j].ZHIXINGNR +
								')<span class="f-right">' + changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) + '</span></div>';
						}
					}
					zxjlStrCommon += '</div>';
				}
				if (zxjlStrCommon == "") {
					zxjlStrCommon = '<div class="zxjl-content" style="font-size:14px;">暂无执行记录</div>';
				}
				//				if (groupLength > 0) {
				//					
				//				}
				//药品 结束
				var isdisplay = "display-none";
				ztlist = jiluList.filter(function (a) {
					return a.ZHIXINGLX == "3" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd') &&
						a.STOPPAUSEBZ ==
						"1"
				});
				ztlist.forEach(function (b, index) {
					if (b.YIZHUID == o.YIZHUID) {
						isdisplay = "display-block";
					}
				});
				//临时医嘱
				if (yizhuLX == "LS") {
					currCnt3 += jiluList.filter(function (a) {
						return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "3" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
							nowdate).format(
							'yyyy-MM-dd');
					}).length;
					var currCntShow = currCnt3,
						allCntShow = (o.FEQUENCYTIMES || 1);

					if (new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd')) {
						if ((o.SHOURICS || '') != "") {
							allCntShow = o.SHOURICS;
						}
					}
					ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
					if (ifFinished == "finished") {
						tableStr3yLS +=
							'<div class="mui-table-view-cell mui-collapse dispensing-table-row yizhulx-LS ' + index + ' ' + ifFinished + ' ' +
							o.CHENGZUYZ + '">' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<a class="mui-navigate-right" href="#">' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' + o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') + '</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">打印时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="zanting ' + isdisplay + '" id="zanting">' +
							'<img src="../images/Orders/zanting.png" />' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</a>' +
							'<div class="mui-collapse-content">' + zxjlStrCommon + '</div>' +
							'</div>';
					} else {
						tableStr3wLS +=
							'<div class="mui-table-view-cell mui-collapse dispensing-table-row yizhulx-LS ' + index + ' ' + ifFinished + ' ' +
							o.CHENGZUYZ + '" >' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<a class="mui-navigate-right" href="#">' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' +
							o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
							'</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">执行时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="zanting ' + isdisplay + '" id="zanting">' +
							'<img src="../images/Orders/zanting.png" />' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</a>' +
							'<div class="mui-collapse-content">' + zxjlStrCommon + '</div>' +
							'</div>';
					}
				}
				//今日长期医嘱  开始时间为今日
				if (yizhuLX == "CQ" && new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd')) {
					currCnt31 += jiluList.filter(function (a) {
						return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "3" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
							nowdate).format(
							'yyyy-MM-dd');
					}).length;
					var currCntShow = currCnt31,
						allCntShow = (o.FEQUENCYTIMES || 1);

					if (o.SHOURICS != "" && !(o.SHOURICS == 0)) {
						allCntShow = o.SHOURICS;
						ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
						if (ifFinished == "finished") {
							tableStr3yCQ +=
								'<div class="mui-table-view-cell mui-collapse dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished +
								' ' + o.CHENGZUYZ + '" >' +
								'<input type="hidden" class="index" value="' + index + '"/>' +
								'<a class="mui-navigate-right" href="#">' +
								'<div class="dispensing-table-box">' +
								'<div class="groupDiv">' +
								'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
								'<div>' +
								o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
								'</div>' +
								'</div>' +
								groupStrCommon +
								'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
								'<div class="mui-text-left">' +
								o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
								'</div>' +
								'<div class="groupTxt mui-text-right">' +
								'<span class="f-left">执行时间：' + nowdate + '</span>' +
								'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
								'/' +
								'<span class="allCount">' + allCntShow + '</span>)</span>' +
								'</div>' +
								'<div class="zanting ' + isdisplay + '" id="zanting">' +
								'<img src="../images/Orders/zanting.png" />' +
								'</div>' +
								'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
								'</div>' +
								'</a>' +
								'<div class="mui-collapse-content">' + zxjlStrCommon + '</div>' +
								'</div>';
						} else {
							tableStr3wCQ +=
								'<div class="mui-table-view-cell mui-collapse dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished +
								' ' + o.CHENGZUYZ + '" >' +
								'<input type="hidden" class="index" value="' + index + '"/>' +
								'<a class="mui-navigate-right" href="#">' +
								'<div class="dispensing-table-box">' +
								'<div class="groupDiv">' +
								'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
								'<div>' +
								o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
								'</div>' +
								'</div>' +
								groupStrCommon +
								'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
								'<div class="mui-text-left">' +
								o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
								'</div>' +
								'<div class="groupTxt mui-text-right">' +
								'<span class="f-left">打印时间：' + nowdate + '</span>' +
								'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
								'/' +
								'<span class="allCount">' + allCntShow + '</span>)</span>' +
								'</div>' +
								'<div class="zanting ' + isdisplay + '" id="zanting">' +
								'<img src="../images/Orders/zanting.png" />' +
								'</div>' +
								'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
								'</div>' +
								'</a>' +
								'<div class="mui-collapse-content">' + zxjlStrCommon + '</div>' +
								'</div>';
						}
					}
				}
				//今日长期医嘱  开始时间不为今日
				if (yizhuLX == "CQ" && !(new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date().format('yyyy-MM-dd'))) {
					currCnt32 += jiluList.filter(function (a) {
						return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "3" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
							nowdate).format(
							'yyyy-MM-dd');
					}).length;
					var currCntShow = currCnt32,
						allCntShow = (o.FEQUENCYTIMES || 1);

					ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
					if (ifFinished == "finished") {
						tableStr3yCQ +=
							'<div class="mui-table-view-cell mui-collapse dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished + ' ' +
							o.CHENGZUYZ + '" >' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<a class="mui-navigate-right" href="#">' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' +
							o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
							'</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">打印时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="zanting ' + isdisplay + '" id="zanting">' +
							'<img src="../images/Orders/zanting.png" />' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</a>' +
							'<div class="mui-collapse-content">' + zxjlStrCommon + '</div>' +
							'</div>';
					} else {
						tableStr3wCQ +=
							'<div class="mui-table-view-cell mui-collapse dispensing-table-row yizhulx-CQ ' + index + ' ' + ifFinished + ' ' +
							o.CHENGZUYZ + '" >' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<a class="mui-navigate-right" href="#">' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' +
							o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
							'</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">打印时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="zanting ' + isdisplay + '" id="zanting">' +
							'<img src="../images/Orders/zanting.png" />' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</a>' +
							'<div class="mui-collapse-content">' + zxjlStrCommon + '</div>' +
							'</div>';
					}
				}
				//其他医嘱if (yizhuLX == "QT")
				if (yizhuLX == "QT") {
					currCnt33 += jiluList.filter(function (a) {
						return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "3" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
							nowdate).format(
							'yyyy-MM-dd');
					}).length;
					var currCntShow = currCnt33,
						allCntShow = (o.FEQUENCYTIMES || 1);

					if (new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd')) {
						if ((o.SHOURICS || '') != "") {
							allCntShow = o.SHOURICS;
						}
					}
					ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
					if (ifFinished == "finished") {
						tableStr3yQT +=
							'<div class="mui-table-view-cell mui-collapse dispensing-table-row yizhulx-QT ' + index + ' ' + ifFinished + ' ' +
							o.CHENGZUYZ + '" >' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<a class="mui-navigate-right" href="#">' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' +
							o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
							'</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">执行时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="zanting ' + isdisplay + '" id="zanting">' +
							'<img src="../images/Orders/zanting.png" />' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</a>' +
							'<div class="mui-collapse-content">' + zxjlStrCommon + '</div>' +
							'</div>';
					} else {
						tableStr3wQT +=
							'<div class="mui-table-view-cell mui-collapse dispensing-table-row yizhulx-QT ' + index + ' ' + ifFinished + ' ' +
							o.CHENGZUYZ + '">' +
							'<input type="hidden" class="index" value="' + index + '"/>' +
							'<a class="mui-navigate-right" href="#">' +
							'<div class="dispensing-table-box">' +
							'<div class="groupDiv">' +
							'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
							'<div>' +
							o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + (o.YICIJL + o.YICIJLDW) +
							'</div>' +
							'</div>' +
							groupStrCommon +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="mui-text-left">' +
							o.PINCI + '&nbsp&nbsp&nbsp' + (o.GEIYAOFSMC || '') +
							'</div>' +
							'<div class="groupTxt mui-text-right">' +
							'<span class="f-left">执行时间：' + nowdate + '</span>' +
							'<span class="f-right">(<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>)</span>' +
							'</div>' +
							'<div class="zanting ' + isdisplay + '" id="zanting">' +
							'<img src="../images/Orders/zanting.png" />' +
							'</div>' +
							'<div class="groupTxt ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</a>' +
							'<div class="mui-collapse-content">' + zxjlStrCommon + '</div>' +
							'</div>';
					}
				}

				//          if (groupLength > 0) {
				//              index += (groupLength);
				//          }

			}

		}

	}

	tableStr1yb = tableStr1yLS + tableStr1yCQ + tableStr1yQT;
	tableStr1wb = tableStr1wLS + tableStr1wCQ + tableStr1wQT;
	tableStr2y = tableStr2yLS + tableStr2yCQ + tableStr2yQT;
	tableStr2w = tableStr2wLS + tableStr2wCQ + tableStr2wQT;
	tableStr3y = tableStr3yLS + tableStr3yCQ + tableStr3yQT;
	tableStr3w = tableStr3wLS + tableStr3wCQ + tableStr3wQT;
	if (tableStr1yb == "") {
		tableStr1 = tableStr1wb;
	} else {
		tableStr1 = tableStr1wb + tableyhead + tableStr1yb;
	}

	if (tableStr2y == "") {
		tableStr2 = tableStr2w;
	} else {
		tableStr2 = tableStr2w + tableyhead + tableStr2y;
	}

	if (tableStr3y == "") {
		tableStr3 = tableStr3w;
	} else {
		tableStr3 = tableStr3w + tableyhead + tableStr3y;
	}
	//	console.log("tableStr1:" + tableStr1);
	//	console.log("tableStr2:" + tableStr2);
	//	console.log("tableStr3:" + tableStr3);
	document.getElementById("table1").innerHTML = tableStr1 === '' ? '<div class="no-data">暂无数据</div>' : tableStr1;
	document.getElementById("table2").innerHTML = tableStr2 === '' ? '<div class="no-data">暂无数据</div>' : tableStr2;
	document.getElementById("table3").innerHTML = tableStr3 === '' ? '<div class="no-data">暂无数据</div>' : tableStr3;

	//    scrolltoYZ();
}
//过敏试验
function showDataType2(list, list2, list3, type, nowdate) {
	document.getElementById("table1").innerHTML = '';

	currentList = list.filter(function (a) {
		return type == 'all' || type == a.CHANGQILS
	});
	pishiList = list2;
	var jiluList = list3;
	//  document.getElementById("yizhuListView").innerHTML =
	//		'<div class="statistic">' +
	//		'<img src="../images/Orders/all.png" style="height:15px;">' +
	//		'总计<span class="allTimes"></span>次' +
	//		'<img src="../images/Orders/remainder.png" style="height:15px;">' +
	//		'剩余<span class="restTimes"></span>次' +
	//		'</div>';
	var index = 0,
		allTimes = 0,
		doTimes = 0;
	var tableOrder1 = "",
		tableOrder1y = "",
		tableOrder1w = "";
	var tableOrder2 = "",
		tableOrder2y = "",
		tableOrder2w = "";
	var tableOrder3 = "",
		tableOrder3y = "",
		tableOrder3w = "";
	var tableyhead = '<div class="dispensing-table-head">已完成</div>';
	var currCnt1, currCnt2;

	var currDay = new Date(nowdate).getDay() == 0 ? 7 : new Date(nowdate).getDay();
	var chenzhuArr = [];
	var chenzhui = 0;

	for (var index = 0; index < currentList.length; index++) {
		var o = currentList[index];
		var groupLength = 0;
		//      if (!((o.NOTE || '').indexOf('NEXT') > -1 && o.KAIDANSJ.substring(0, 10) === new Date().format('yyyy-MM-dd')) &&
		//			!(o.INWEEK == 1 && (o.NOTE || '').indexOf(currDay) == -1)) {(new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date().format('yyyy-MM-dd')
		if (o.CHANGQILS == "LS" ||
			(!((o.NOTE || '').indexOf('NEXT') > -1 && o.KAIDANSJ.substring(0, 10) === new Date(nowdate).format('yyyy-MM-dd')) &&
				!(o.INWEEK == 1 && (o.NOTE || '').indexOf(currDay) == -1) && o.CHANGQILS == "CQ")) {
			//          var currCnt = jiluList.filter(function (a) {
			//              return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == '3' && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date().format('yyyy-MM-dd')
			//          }).length;
			var yizhuID = o.YIZHUID;
			var pishiResult = "未皮试";
			var yizhuLX = "yizhulx-" + o.CHANGQILS;
			var groupArr = [];
			var zxjlStrCommon = "";
			var flag = 0;
			var Aflag = 1;
			if (index == currentList.length - 1) {
				Aflag = 0;
				for (var f = 0; f < chenzhuArr.length; f++) {
					if (index == chenzhuArr[f]) {
						Aflag = 1;
						break;
					}
				}
			}
			for (var j = index + 1; j < currentList.length; j++) {
				Aflag = 0;
				groupArr[0] = index;
				for (var f = 0; f < chenzhuArr.length; f++) {
					if (index == chenzhuArr[f]) {
						//						index = index + 1;
						flag = 1;
						break;
					}
				}
				if (flag == 1) {
					Aflag = 1;
					break;
				}
				if (o.YIZHUID == currentList[j].YIZHUID) {
					groupLength++;
					groupArr[groupLength] = j;
					chenzhuArr[chenzhui] = j;
					chenzhui++;
				}
			}
			if (Aflag != 1) {
				//医嘱说明
				var yizhusm = "";
				if (o.YIZHUSM == null) {
					yizhusm = "display-none";
				}
				//医嘱状态'已停止','2','作废','3','在执行','0','执行完','0','新开','4','已校对','0','已发送','6'
				var tzStatue = "display-none";
				var tzStatueTxt = "";
				if (o.YIZHUZT == '0') {
					tzStatue = "display-block";
					tzStatueTxt = "在执行";
				}
				if (o.YIZHUZT == '2') {
					tzStatue = "display-block";
					tzStatueTxt = "已停嘱";
				}
				if (o.YIZHUZT == '3') {
					tzStatue = "display-block";
					tzStatueTxt = "已作废";
				}
				//执行记录部分
				var zhixingList = jiluList.filter(function (a) {
					return a.YIZHUID == o.YIZHUID && (new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd'))
				});
				zhixingList.sort(function (a, b) {
					return b.ZXIXINGSJ - a.ZXIXINGSJ
				});
				zhixingList.sort(function (a, b) {
					return b.ZHIXINGLX - a.ZHIXINGLX
				});
				zhixingList.sort(function (a, b) {
					return b.STOPAUSEBZ - a.STOPAUSEBZ
				});
				var zxgroupList = groupBy(zhixingList, function (item) {
					return [item.YIZHUCODE];
				});

				for (var i = 0; i < zxgroupList.length; i++) {
					zxjlStrCommon += '<div class="zxjl-content">';
					for (var j = 0; j < zxgroupList[i].length; j++) {
						if (zxgroupList[i][j].ZHIXINGLX == '1') {
							zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">摆药：</span><span class="f-left">' + zxgroupList[i][j]
								.YONGHUXM + '/' + zxgroupList[i][j].YONGHUDM + '</span><span class="f-right">' + changeDateFormat(zxgroupList[i]
									[j].ZXIXINGSJ) + '</span></div>';
						}
						if (zxgroupList[i][j].ZHIXINGLX == '2') {
							zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">配药：</span><span class="f-left">' + zxgroupList[i][j]
								.YONGHUXM + '/' + zxgroupList[i][j].YONGHUDM + '</span><span class="f-right">' + changeDateFormat(zxgroupList[i]
									[j].ZXIXINGSJ) + '</span></div>';
						}
						if (zxgroupList[i][j].ZHIXINGLX == '3') {
							//          	        	if(zxgroupList[i][j].STOPPAUSEBZ == '0' ||  zxgroupList[i][j].STOPPAUSEBZ == ''){

							//          	        	}
							if (zxgroupList[i][j].STOPPAUSEBZ == '1') {
								zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">暂停：</span><span class="f-left">' + zxgroupList[i][
									j
								].YONGHUXM + '/' + zxgroupList[i][j].YONGHUDM + '</span><span class="f-right">' + changeDateFormat(zxgroupList[
									i][j].STOPPAUSESJ) + '</span></div>';
							}
							if (zxgroupList[i][j].STOPPAUSEBZ == '2') {
								zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">停止：</span><span class="f-left">' + zxgroupList[i][
									j
								].YONGHUXM + '/' + zxgroupList[i][j].YONGHUDM + '</span><span class="f-right">' + changeDateFormat(zxgroupList[
									i][j].STOPPAUSESJ) + '</span></div>';
							}
							zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">执行：</span><span class="f-left">' + zxgroupList[i][j]
								.YONGHUXM + '/' + zxgroupList[i][j].YONGHUDM + '</span><span class="f-right">' + changeDateFormat(zxgroupList[i]
									[j].ZXIXINGSJ) + '</span></div>';
						}
						if (zxgroupList[i][j].ZHIXINGLX == '4') {
							zxjlStrCommon += '<div class="zxjl-div"><span class="f-left">异常：</span><span class="f-left">' + zxgroupList[i][j]
								.YONGHUXM + '/' + zxgroupList[i][j].YONGHUDM + '</span>&nbsp;&nbsp;&nbsp;&nbsp;(' + zxgroupList[i][j].ZHIXINGNR +
								')<span class="f-right">' + changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) + '</span></div>';
						}
					}
					zxjlStrCommon += '</div>';
				}
				if (zxjlStrCommon == "") {
					zxjlStrCommon = '<div class="zxjl-content" style="font-size:14px;">暂无执行记录</div>';
				}

				var chengzuID = o;
				var groupStrCommon = "",
					groupStrRight = "",
					groupDiv = "";
				if (groupLength > 0) {
					groupDiv = "groupDiv";
					for (var i = 1; i < groupArr.length; i++) {
						groupStrCommon +=
							'<div class="' + groupDiv + '">' +
							'<input type="hidden" class="' + currentList[groupArr[i]].YIZHUID + '" value="' + currentList[groupArr[i]].YIZHUID +
							'"/>' +
							'<div>' +
							currentList[groupArr[i]].YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' +
							//							(currentList[groupArr[i]].YICIJL + currentList[groupArr[i]].YICIJLDW) +
							'</div>' +
							'</div>';
					}
				}
				//摆药
				var zxlxBY = pdZhiXinglxBY(o);
				if (zxlxBY == true) {
					currCnt1 = jiluList.filter(function (a) {
						return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "1" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
							nowdate).format(
							'yyyy-MM-dd');
					}).length;
					var currCntShow = currCnt1,
						allCntShow = (o.FEQUENCYTIMES || 1);
					var ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
					if (ifFinished == "finished") {
						for (var i = 0; i < pishiList.length; i++) {
							var p = pishiList[i]
							if (p.YIZHUID == o.YIZHUID) { //p.XIANGMUDM == o.YIZHUXMID
								//判断有没有皮试记录，有，在判断皮试状态1皮试中和2皮试完成，若为2，在根据皮试结果进行显示（0阴性、1阳性、2弱阳性、3强阳性）；若无皮试记录，显示未皮试
								//					console.log("PISHIZT:" + p.PSSHIZT);
								if (p.PSSHIZT == 1) {
									pishiResult = "皮试中";
								}
								if (p.PSSHIZT == 2) {
									pishiResult = p.PISHIJG;
								}

							}
						}
						tableOrder1y +=
							'<div class="order ' + index + ' ' + ifFinished + ' ' + yizhuID + ' ' + yizhuLX + ' ">' +
							'<input type="hidden" class="index"/>' +
							'<div class="dispensing-table-box">' +
							'<div class="line1">' + o.YAOPINMC + '</div>' +
							'<div class="line1">' + groupStrCommon + '</div>' +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="line2">' +
							(o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
							(o.PINCI) +
							'<span class="line2-sub">' +
							'<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>' +
							'</span>' +
							'</div>' +
							'<div class="line3">' +
							'<span>打印时间：' + nowdate + '</span>' +
							'<span class="line2-sub fontred">' + pishiResult + '</span>' +
							'</div>' +
							'<div class="line3 ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</div>';

					} else {
						tableOrder1w +=
							'<div class="order ' + index + ' ' + ifFinished + ' ' + yizhuID + ' ' + yizhuLX + '">' +
							'<input type="hidden" class="index"/>' +
							'<div class="dispensing-table-box">' +
							'<div class="line1">' + o.YAOPINMC + '</div>' +
							'<div class="line1">' + groupStrCommon + '</div>' +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="line2">' +
							(o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
							(o.PINCI) +
							'<span class="line2-sub">' +
							'<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>' +
							'</span>' +
							'</div>' +
							'<div class="line3">' +
							'<span>打印时间：' + nowdate + '</span>' +
							'<span class="line2-sub fontred">' + pishiResult + '</span>' +
							'</div>' +
							'<div class="line3 ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</div>';
					}
				}
				//配药
				var zxlxBY = pdZhiXinglxPY(o);
				if (zxlxBY == true) {
					currCnt1 = jiluList.filter(function (a) {
						return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "2" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
							nowdate).format(
							'yyyy-MM-dd');
					}).length;
					var currCntShow = currCnt1,
						allCntShow = (o.FEQUENCYTIMES || 1);
					var ifFinished = (currCntShow >= allCntShow) ? "finished" : "";
					if (ifFinished == "finished") {
						for (var i = 0; i < pishiList.length; i++) {
							var p = pishiList[i]
							if (p.YIZHUID == o.YIZHUID) { //p.XIANGMUDM == o.YIZHUXMID
								//判断有没有皮试记录，有，在判断皮试状态1皮试中和2皮试完成，若为2，在根据皮试结果进行显示（0阴性、1阳性、2弱阳性、3强阳性）；若无皮试记录，显示未皮试
								//					console.log("PISHIZT:" + p.PSSHIZT);
								if (p.PSSHIZT == 1) {
									pishiResult = "皮试中";
								}
								if (p.PSSHIZT == 2) {
									pishiResult = p.PISHIJG;
								}

							}
						}
						tableOrder2y +=
							'<div class="order ' + index + ' ' + ifFinished + ' ' + yizhuID + ' ' + yizhuLX + ' ">' +
							'<input type="hidden" class="index"/>' +
							'<div class="dispensing-table-box">' +
							'<div class="line1">' + o.YAOPINMC + '</div>' +
							'<div class="line1">' + groupStrCommon + '</div>' +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="line2">' +
							(o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
							(o.PINCI) +
							'<span class="line2-sub">' +
							'<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>' +
							'</span>' +
							'</div>' +
							'<div class="line3">' +
							'<span>打印时间：' + nowdate + '</span>' +
							'<span class="line2-sub fontred">' + pishiResult + '</span>' +
							'</div>' +
							'<div class="line3 ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</div>';

					} else {
						tableOrder2w +=
							'<div class="order ' + index + ' ' + ifFinished + ' ' + yizhuID + ' ' + yizhuLX + '">' +
							'<input type="hidden" class="index"/>' +
							'<div class="dispensing-table-box">' +
							'<div class="line1">' + o.YAOPINMC + '</div>' +
							'<div class="line1">' + groupStrCommon + '</div>' +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="line2">' +
							(o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
							(o.PINCI) +
							'<span class="line2-sub">' +
							'<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>' +
							'</span>' +
							'</div>' +
							'<div class="line3">' +
							'<span>打印时间：' + nowdate + '</span>' +
							'<span class="line2-sub fontred">' + pishiResult + '</span>' +
							'</div>' +
							'<div class="line3 ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</div>';
					}
				}

				//执行
				var zxlxZX = pdZhiXinglxZX(o);
				if (zxlxZX == true) {
					currCnt2 = jiluList.filter(function (a) {
						return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "3" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(
							nowdate).format(
							'yyyy-MM-dd');
					}).length;
					var currCntShow = currCnt2,
						allCntShow = (o.FEQUENCYTIMES || 1);
					var ifFinished = (currCntShow >= allCntShow) ? "finished" : "";

					if (ifFinished == "finished") {
						for (var i = 0; i < pishiList.length; i++) {
							var p = pishiList[i];
							if (p.YIZHUID == o.YIZHUID) {
								//判断有没有皮试记录，有，在判断皮试状态1皮试中和2皮试完成，若为2，在根据皮试结果进行显示（0阴性、1阳性、2弱阳性、3强阳性）；若无皮试记录，显示未皮试
								//					console.log("PISHIZT:" + p.PSSHIZT);
								if (p.PSSHIZT == 1) {
									pishiResult = "皮试中";
								}
								if (p.PSSHIZT == 2) {
									pishiResult = p.PISHIJG;
								}
								var pishikssj = changeDateFormat(p.PISHIKSSJ);
							}
						}
						tableOrder3y +=
							'<div class="mui-table-view-cell mui-collapse order ' + index + ' ' + ifFinished + ' ' + yizhuID + ' ' + yizhuLX +
							' ">' +
							'<input type="hidden" class="index"/>' +
							'<a class="mui-navigate-right" href="#">' +
							'<div class="dispensing-table-box">' +
							'<div class="line1">' + o.YAOPINMC + '</div>' +
							'<div class="line1">' + groupStrCommon + '</div>' +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="line2">' +
							(o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
							(o.PINCI) +
							'<span class="line2-sub">' +
							'<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>' +
							'</span>' +
							'</div>' +
							'<div class="line3">' +
							'<span>打印时间：' + nowdate + '</span>' +
							'<span class="line2-sub fontred">' + pishiResult + '</span>' +
							'</div>' +
							'<div class="line3">皮试时间：' + pishikssj + '</div>' +
							'<div class="line3 ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</a>' +
							'<div class="mui-collapse-content">' + zxjlStrCommon + '</div>' +
							'</div>';

					} else {
						tableOrder3w +=
							'<div class="mui-table-view-cell mui-collapse order ' + index + ' ' + ifFinished + ' ' + yizhuID + ' ' + yizhuLX +
							'">' +
							'<input type="hidden" class="' + index + '"/>' +
							'<a class="mui-navigate-right" href="#">' +
							'<div class="dispensing-table-box">' +
							'<div class="line1">' + o.YAOPINMC + '</div>' +
							'<div class="line1">' + groupStrCommon + '</div>' +
							'<div class="line1-right ' + tzStatue + '">' + tzStatueTxt + '</div>' +
							'<div class="line2">' +
							(o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
							(o.PINCI) +
							'<span class="line2-sub">' +
							'<span class="currCount">' + currCntShow + '</span>' +
							'/' +
							'<span class="allCount">' + allCntShow + '</span>' +
							'</span>' +
							'</div>' +
							'<div class="line3">' +
							'<span>打印时间：' + nowdate + '</span>' +
							'<span class="line2-sub fontred">' + pishiResult + '</span>' +
							'</div>' +
							'<div class="line3 ' + yizhusm + '">医嘱说明：' + o.YIZHUSM + '</div>' +
							'</div>' +
							'</a>' +
							'<div class="mui-collapse-content">' + zxjlStrCommon + '</div>' +
							'</div>';
					}
				}
			}
		}

	}
	if (tableOrder1y == "") {
		tableOrder1 = tableOrder1w;
	} else {
		tableOrder1 = tableOrder1w + tableyhead + tableOrder1y;
	}
	if (tableOrder2y == "") {
		tableOrder2 = tableOrder2w;
	} else {
		tableOrder2 = tableOrder2w + tableyhead + tableOrder2y;
	}
	if (tableOrder3y == "") {
		tableOrder3 = tableOrder3w;
	} else {
		tableOrder3 = tableOrder3w + tableyhead + tableOrder3y;
	}
	//  document.getElementById("yizhuListView").innerHTML = tableOrder === '' ? '<div class="no-data">暂无数据</div>' : tableOrder;
	document.getElementById("table1").innerHTML = tableOrder1 === '' ? '<div class="no-data">暂无数据</div>' : tableOrder1;
	document.getElementById("table2").innerHTML = tableOrder2 === '' ? '<div class="no-data">暂无数据</div>' : tableOrder2;
	document.getElementById("table3").innerHTML = tableOrder3 === '' ? '<div class="no-data">暂无数据</div>' : tableOrder3;
	//  if(document.getElementById("yizhuListView").innerHTML = ""){
	//  	document.getElementById("yizhuListView").innerHTML = '<div class="no-data">暂无数据</div>';
	//  }
	//  if (allTimes === 0) {
	//      document.getElementById("yizhuListView").innerHTML = '<div class="no-data">暂无数据</div>';
	//  }
	//  else {
	//      $('.statistic .allTimes').html(allTimes);
	//      $('.statistic .restTimes').html(allTimes - doTimes);
	//  }

}

function showDataType3(list, type) {
	currentList = list;
	var index = 0,
		allTimes = 0,
		doTimes = 0;
	var currDay = new Date().getDay() == 0 ? 7 : new Date().getDay();
	currentList.forEach(function (o) {
		if (!((o.NOTE || '').indexOf('NEXT') > -1 && o.KAIDANSJ.substring(0, 10) === new Date().format('yyyy-MM-dd')) &&
			!(o.INWEEK == 1 && (o.NOTE || '').indexOf(currDay) == -1)) {
			var currCnt = jiluList.filter(function (a) {
				return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "4";
			}).length;
			var currCntShow = currCnt,
				allCntShow = 1;
			var isfinished = currCntShow >= allCntShow ? "finished" : ""
			var item = document.createElement("div");
			var className = 'sample-div ' + index;
			item.setAttribute("class", className);
			item.innerHTML =
				'<input type="hidden" class="index" value="' + index + '"/>' +
				'<input type="hidden" class="' + o.YIZHUID + '" value="' + o.YIZHUID + '"/>' +
				'<div class="sampleTitle">' +
				'<div class="sample-item">' +
				'<span style="color:rgb(153,153,153)">采集医嘱：</span>' +
				'<span style="color:rgb(73,91,211)">' + o.PINCI + "/" + o.CHANGQILS + '</span>' +
				'</div>' +
				'<div class="sample-right">' +
				'<span class="sdoing-status sright-text">未采集</span>' +
				'<img class="sdoing-status" src="../images/Orders/doing.png" style="height:24px;">' +
				'<span class="sfinished-status sright-text">已采集</span>' +
				'<img class="sfinished-status" src="../images/Orders/finish.png" style="height:24px;">' +
				//						
				'</div>' +
				'</div>' +
				'<div class="sample-line">' +
				//					'<div class="sample-item">' +
				//o.YICIJL + o.YICIJLDW+
				o.YIZHUMC +
				//					'</div>' +
				//'<div class="sample-item">' +
				//	//o.PINCI+"/"+o.CHANGQILS+
				//'</div>' +
				//'<div class="sample-item">' +
				//	//'已采集' +
				//'</div>' +
				//					'<div class="sample-itemlast">' +
				//						'<span class="img-btn ' + (currCntShow >= allCntShow ? "finished" : "") + '">' + (currCntShow >= allCntShow ? "已" : "未") + '采集</span>' +
				//					'</div>' +
				'</div>';
			if (isfinished != "") {
				$(".sample-div").addClass('ready');
			}
			document.getElementById("yizhuListView").appendChild(item);
			doTimes += currCntShow;
			allTimes += allCntShow;
		}
		index++;
	});
	if (allTimes === 0) {
		document.getElementById("yizhuListView").innerHTML = '<div class="no-data">暂无数据</div>';
	}
}

function clearReason() {
	if (currentInput) {
		var reason = $(currentInput.parentElement).find('.reason-div');
		if (reason.length > 0) {
			$(reason[0]).text('');
		}
	}
}

Date.prototype.format = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

Date.prototype.addDays = function (counts) {
	var d = this;
	d.setDate(this.getDate() + counts);
	return d;
}

function NavigateBar(yizhutpye) {
	switch (yizhutpye) {
		case "口服药":
			return "/orders/medicine.html"; //口服药医嘱界面
			break;
		case "静脉注射":
			return "/orders/intravenousInjection.html"; //静脉注射
			break;
		case "静脉输液":
			return "/orders/infusion.html"; //静脉输液
			break;
		case "皮下注射":
			return "/orders/InsulinList.html"; //皮下注射
			break;
		case "过敏试验":
			return "/orders/anaphylaxisTest.html"; //过敏试验
			break;
		case "护理执行":
			return "/orders/nursingExecution.html"; //护理执行
			break;
		case "输血":
			return "/orders/bloodTransfusion.html"; //输血
			break;
		case "其他":
			return "/orders/other.html"; //其他
			break;
		default:
			return "";
			break;
	}

}

//皮下注射弹框
function popover_yidaosu(title, yidaosbz, content, fangfa1, fangfa2) {
	localStorage.removeItem("$AllowYizhizx");
	$('.mui-popover').remove();
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('data-disable-auto-close', 'true');
	var innhtml = '<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		'<header>' + title + '</header>' +
		'<div class="mui-scroll-wrapper">' +
		'<div class="mui-scroll">' + content +
		'</div>' +
		'<div class="mui-input-row mui-checkbox mui-left yoryidaos">';
	if (yidaosbz) {
		innhtml += '<input type="checkbox" checked> ';
	} else {
		innhtml += '<input type="checkbox" /> ';
	}
	innhtml += '<lable class="check_lable" >余量与效期管理</lable>' +
		'</div>' +
		'</div>' +
		'<div class="popover_footer">' +
		'<button type="button"  class="mui-btn Fbtn_left"  />取消</button>' +
		'<button type="button" class="mui-btn mui-btn-primary Fbtn_right"  />确定</button>' +
		'</div>' +
		'</div>';
	item2.innerHTML = innhtml;
	document.body.appendChild(item2);
	popover_show(fangfa1, fangfa2);
}
//按钮自定义弹框
function popover_anniu(content, fangfa1, fangfa2, fangfa3) {
	$('.mui-popover').remove();
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover_anniu');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('data-disable-auto-close', 'true');
	item2.innerHTML =
		'<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		'<div class="mui-scroll-wrapper">' +
		'<div class="mui-scroll" style="display:table;">' + content +
		'</div>' +
		'</div>' +
		'<div class="popover_footer">' +
		'<button type="button" class="mui-btn mui-btn-primary btn_1" />巡视</button>' + '&nbsp' +
		'<button type="button" class="mui-btn mui-btn-primary btn_2" style="display:none"/>修改流速</button>' + '&nbsp' +
		'<button type="button" class="mui-btn mui-btn-primary btn_3" />暂停/停止</button>' +
		'<button type="button"  class="mui-btn Fbtn_left margin-r5"  />取消</button>' +
		'</div>' +
		'</div>'
	document.body.appendChild(item2);
	mui("#popover_anniu").popover('toggle');
	mui('.popover_footer').on('tap', '.btn_1', fangfa1);
	mui('.popover_footer').on('tap', '.Fbtn_left', fangfa2);
	mui('.popover_footer').on('tap', '.btn_3', fangfa3);
}
//巡视记录自定义弹框
function popover_xunshijl(title, fangfa1, fangfa2) {
	mui("#popover").popover('toggle');
	$('.mui-popover').remove();
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('data-disable-auto-close', 'true');
	item2.innerHTML =
		'<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		'<header>' + title + '</header>' +
		'<div class="mui-scroll-wrapper">' +
		'<div class="line">' +
		'<div class="mui-input-row mui-checkbox mui-left">' +
		'<div class="sel-div zhengchang">' +
		'<input type="checkbox" value="0" name="yichangbz" checked />' +
		'<lable class="check_lable" >正常</lable>' +
		'</div>' +
		'<div class="sel-div yichang">' +
		'<input type="checkbox" value="1" name="yichangbz" />' +
		'<lable class="check_lable" >异常</lable>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'<div class="mui_textarea">' +
		'<textarea rows="3" placeholder="请输入巡视记录"></textarea>' +
		'</div>' +
		'</div>' +
		'<div class="popover_footer">' +
		'<button type="button"  class="mui-btn Fbtn_left"  />取消</button>' +
		'<button type="button" class="mui-btn mui-btn-primary Fbtn_right"  />确定</button>' +
		'</div>' +
		'</div>';
	document.body.appendChild(item2);
	popover_show(fangfa1, fangfa2);
	//切换单选选项
	$('.line').on('change', 'input[type="checkbox"]', function (e) {
		$('.line input[type="checkbox"]').removeAttr('checked');
		this.checked = true;
		if ($(this).parent().hasClass('zhengchang')) {
			$('.mui_textarea').css('display', 'none');
		} else {
			$('.mui_textarea').css('display', 'block');
		}
	});
	$('textarea').on('touchstart', function () {
		$(this).focus();
	});
	//解决textarea不可滚动问题
	window.addEventListener('touchmove', function (e) {
		var target = e.target;
		if (target && target.tagName === 'TEXTAREA') { //textarea阻止冒泡
			e.stopPropagation();
		}
	}, true);
}
//静脉输液医嘱 暂停或停止
function popover_stoppause(title, fangfa1, fangfa2) {
	$('.mui-popover').remove();
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('data-disable-auto-close', 'true');
	item2.innerHTML =
		'<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		'<header>' + title + '</header>' +
		'<div class="mui-scroll-wrapper">' +
		'<div class="line">' +
		'<div class="mui-input-row mui-checkbox mui-left">' +
		'<div class="sel-div zhengchang">' +
		'<input type="checkbox" value="1" name="stoppause" checked />' +
		'<lable class="check_lable" >暂停</lable>' +
		'</div>' +
		'<div class="sel-div yichang">' +
		'<input type="checkbox" value="2" name="stoppause" />' +
		'<lable class="check_lable" >结束</lable>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'<div class="sel-div margin-r10 mui-text-right divyuliang" style="width:70px; text-align:right;display:none">余量</div>' +
		'<div class="sel-div margin-r5 divyuliang" style="display:none">' +
		'<input class="yuliang" type="number" style="width:120px;" />' +
		'</div>' +
		'<div class="mui_textarea">' +
		'<textarea rows="3" placeholder="请输入原因"></textarea>' +
		'</div>' +
		'</div>' +
		'<div class="popover_footer">' +
		'<button type="button"  class="mui-btn Fbtn_left"  />取消</button>' +
		'<button type="button" class="mui-btn mui-btn-primary Fbtn_right"  />确定</button>' +
		'</div>' +
		'</div>';
	document.body.appendChild(item2);
	$('.mui_textarea').css('display', 'block');
	//切换单选选项
	$('.line').on('change', 'input[type="checkbox"]', function (e) {
		$('.line input[type="checkbox"]').removeAttr('checked');
		this.checked = true;
		//2018年7月17日 11:17:54 停止不再需要输入余量 ID：113 by HU.Q
		//if ($("input:checkbox[name='stoppause']:checked").val() == "1") {
		//    $(".divyuliang").css("display", "none");
		//} else {
		//    $(".divyuliang").css("display", "");
		//}
	});
	$('textarea').on('touchstart', function () {
		$(this).focus();
	});
	//解决textarea不可滚动问题
	window.addEventListener('touchmove', function (e) {
		var target = e.target;
		if (target && target.tagName === 'TEXTAREA') { //textarea阻止冒泡
			e.stopPropagation();
		}
	}, true);

	popover_show(fangfa1, fangfa2);
}
//胰岛素注射液管理
function popover_yidaosuz(title, fangfa1, fangfa2) {
	$('.mui-popover').remove();
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('data-disable-auto-close', 'true');
	item2.innerHTML =
		'<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		'<header class="padding-b">' + title + '</header>' +
		'<div class="mui-scroll-wrapper">' +
		'<div class="line">' +
		'<div class="sel-div margin-r10 mui-text-right" style="width:95px; text-align:right;">总量</div>' +
		'<div class="sel-div margin-r5">' +
		'<input class="zongl" type="number" style="width:120px;" />' +
		'</div>' +
		'<div class="sel-div mui-text-center">μ</div>' +
		'</div>' +
		'<div class="line">' +
		'<div class="sel-div margin-r10 mui-text-right" style="width:95px;">有效天数</div>' +
		'<div class="sel-div margin-r5">' +
		'<div class="mui-numbox" data-numbox-step="1" data-numbox-min="0" data-numbox-max="999">' +
		'<button class="mui-btn mui-numbox-btn-minus" type="button">-</button>' +
		'<input class="mui-numbox-input dayNum" type="number" />' +
		'<button class="mui-btn mui-numbox-btn-plus" type="button">+</button>' +
		'</div>' +
		//				    '<input class="dayNum" type="number" style="width:120px;"  />' +
		'</div>' +
		'<div class="sel-div mui-text-center">天</div>' +
		'</div>' +
		'</div>' +
		'<div class="popover_footer">' +
		'<button type="button"  class="mui-btn Fbtn_left"  />取消</button>' +
		'<button type="button" id="btn_ok" class="mui-btn mui-btn-primary Fbtn_right"  />确定</button>' +
		'</div>' +
		'</div>';
	document.body.appendChild(item2);
	popover_show(fangfa1, fangfa2);
	mui(".mui-numbox").numbox();
}
//胰岛素剩余量统计
function popover_yidaosure(title, value1, value2, value3, fangfa1, fangfa2, fangfa3) {
	$('.mui-popover').remove();
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('data-disable-auto-close', 'true');
	item2.innerHTML =
		'<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		'<header class="padding-b">' + title + '</header>' +
		'<div class="mui-scroll-wrapper">' +
		'<div class="line">' +
		'<div class="sel-div margin-r10 mui-text-right" style="width:50%; text-align:right;">总量:</div>' +
		'<div class="sel-div margin-r5" style="color:red">' +
		value1 +
		'</div>' +
		'<div class="sel-div mui-text-center">μ</div>' +
		'</div>' +
		'<div class="line">' +
		'<div class="sel-div margin-r10 mui-text-right" style="width:50%; text-align:right;">剩余量:</div>' +
		'<div class="sel-div margin-r5" style="color:red">' +
		value2 +
		'</div>' +
		'<div class="sel-div mui-text-center">μ</div>' +
		'</div>' +
		'<div class="line">' +
		'<div class="sel-div margin-r10 mui-text-right" style="width:50%;">有效天数:</div>' +
		'<div class="sel-div margin-r5" style="color:red">' +
		value3 +
		'</div>' +
		'<div class="sel-div mui-text-center">天</div>' +
		'</div>' +
		'</div>' +
		'<div class="popover_footer mui-text-center" style="padding-left:0px!important;padding-right:0px!important;">' +
		'<button type="button"  class="mui-btn Fbtn_left"  />取消</button>' +
		'<button type="button" id="btn_ok" class="mui-btn mui-btn-primary Fbtn_right"  />确定</button>' +
		'<button type="button" id="btn_review" class="mui-btn mui-btn-primary"  />重置</button>' +
		'</div>' +
		'</div>';
	document.body.appendChild(item2);
	popover_show(fangfa1, fangfa2);
	mui('.popover_footer').on('tap', '#btn_review', fangfa3);

}
//静脉输液 操作方式 多路/接瓶
function popover_caozuofs(title) {
	$('.mui-popover').remove();
	var yizhulist = JSON.parse(localStorage.getItem('$yizhulist') || "{}");
	if (yizhulist.length == 0) {
		plus.device.vibrate(1000);
		app.alert('请重新扫描医嘱条形码');
	}
	var yizhuitem = "";
	mui.each(yizhulist, function (index) {
		yizhuitem += "<div class='yplist'><div class='yplistItem'>" + yizhulist[index].YAOPINMC +
			"</div><div class='yplistItem'>" + yizhulist[index].YICIJL + yizhulist[index].YICIJLDW + "</div></div>";
		//      yizhuitem += yizhulist[index].YAOPINMC + "(" + yizhulist[index].YICIJL + yizhulist[index].YICIJLDW + ")\n"; //
	});
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('data-disable-auto-close', 'true');
	var checked = "";
	if (yizhulist[0].JMSYZXCOUNT != "0") {
		checked = "checked";
	}
	var innhtml = '<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		'<header>' + title + '</header>' +
		'<div class="mui-scroll-wrapper" style="max-height:250px;">' +
		'<div class="mui-scroll" style="display:table;">' + yizhuitem +
		'</div>' +
		'</div>' +
		'<div class="popover_footer" style="padding-left:0px; padding-right:0px;width:100%;">' +
		'<div class="mui-input-row  mui-left display-row" style="width:100%; height:40px; overflow:hidden;">' +
		'<div class="mui-radio dispaly-cell" style="float: left;">' +
		'<input name="radio1" value="1" type="radio" class="rds">' +
		'<label>新建通路</label>' +
		'</div>' +
		'<div class="mui-radio dispaly-cell" style="float: left; ">' +
		'<input name="radio1" value="2" type="radio" class="rds" ' + checked + '>' +
		'<label>续瓶</label>' +
		'</div>' +
		'</div>' +
		'<div class=line style="width:100%;height:auto;padding-top:8px;border-top:1px solid #ddd;overflow:hidden;">' +
		'<button type="button"  class="mui-btn Fbtn_left" style="margin-left:30px;"  />取消</button>' +
		'<button type="button" class="mui-btn mui-btn-primary Fbtn_right"  style="margin-right:30px;" />确定</button>' +
		'</div>' +
		'</div>' +
		'</div>';
	item2.innerHTML = innhtml;
	document.body.appendChild(item2);
	popover_show(
		function () {
			localStorage.removeItem("$yizhulist");
			localStorage.removeItem("$AllowYizhizx");
			popover_hide();
		},
		function () {
			var checkVal = getRadioRes('rds');
			if (checkVal == null) {
				app.alert('请选择新建通路或续瓶');
				return;
			}
			localStorage.setItem('$caozuofs', checkVal);
			popover_hide();
			var h = plus.webview.getTopWebview();
			var value = localStorage.getItem("$wandaitxm");
			if (value == "") {
				plus.device.vibrate(1000);
				app.alert('请重新扫描腕带');
			}
			CheckYizhu(yizhulist, value, h.id);
		});
	$('.popover_content').on('change', 'input[type="checkbox"]', function (e) {
		$('.popover_content input[type="checkbox"]').removeAttr('checked');
		this.checked = true;
	});
}
//推注泵类药物 设置推注泵速度 单位 caozufs 1执行 2泵推药 暂停恢复
function popover_tuizhu(title, zhixingfs) {
	$('.mui-popover').remove();
	var bingren = JSON.parse(localStorage.getItem('$bingren') || "{}");
	//console.log("病人列表:"+bingren.l);
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('data-disable-auto-close', 'true');
	item2.innerHTML =
		'<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		//标题
		'<header class="padding-b">' + title + '</header>' +
		//内容
		'<div class="mui-scroll-wrapper">' +
		'<div class="mui-card">' +
		'<form class="mui-input-group">' +
		'<div class="mui-input-row mui-radio mui-left">' +
		'<label>ml/h</label>' +
		'<input name="radio1" type="radio" value="1"  class="rds hxy">' +
		'</div>' +
		'<div class="mui-input-row mui-radio  mui-left">' +
		'<label>ug/min</label>' +
		'<input name="radio1" type="radio" value="2" class="rds hxy">' +
		'</div>' +
		'<div class="mui-input-row mui-radio mui-left">' +
		'<label>ug/kg.min</label>' +
		'<input name="radio1" type="radio" value="3" checked class="rds hxy">' +
		'</div>' +
		'</form>' +
		'</div>' +

		'<div class="sel-div margin-r5" style="width:100%;">' +
		'推注泵:<input class="sudu hxy" type="number" style="width:75px;" />ml/h' +
		'</div>' +

		'<div class="sel-div margin-r5 tizhongdiv" style="width:100%;">' +
		'体&#12288;重:' +
		' <l id="lbtizhong" >' + bingren.TIZHONG + '</l>' +
		' <input class="tizhong hxy" type="number" value="' + bingren.TIZHONG + '" style="width:75px;display:none"/>kg' +
		'<span class="mui-checkbox"><input name="checkbox1" value="Item 1" type="checkbox">校准</span>' +
		'</div>' +

		'<div class="sel-div" style="width:100%;">' +
		'计算值:<lable id="jisuan"></lable><lable id="jisuandw"></lable>' +
		'</div>' +
		'</div>' +
		//操作按钮
		'<div class="popover_footer">' +
		'<button type="button"  class="mui-btn Fbtn_left"  />取消</button>' +
		'<button type="button" id="btn_ok" class="mui-btn mui-btn-primary Fbtn_right"  />确定</button>' +
		'</div>' +
		'</div>';
	document.body.appendChild(item2);
	//$(".tizhongdiv").css('display', 'none');
	//计算公式选择
	$(".hxy").change(function () {
		calculatehxy();
	});
	$(".hxy").bind('input propertychange', function () {
		calculatehxy();
	});
	//校准按钮选择
	$("[name='checkbox1']").change(function () {
		if (this.checked) {
			$("#lbtizhong").css('display', 'none');
			$(".tizhong").css('display', '');
		} else {
			$("#lbtizhong").css('display', '');
			$(".tizhong").css('display', 'none');
			$(".tizhong").val($("#lbtizhong").text());
		}
	});
	popover_show(
		function () {
			popover_hide();
			localStorage.removeItem("$yizhulist");
			localStorage.removeItem("$AllowYizhizx");
		},
		function () {
			var sudu = $(".sudu").val();
			if (sudu == "") {
				app.alert('推注泵速度不允许为空');
				return false;
			}

			var json = '[{"DANWEI": "' + $("#jisuandw").text() + '","BENTUISD": "' + sudu + '","TIZHONG":"' + $(".tizhong").val() +
				'","JISUANZ":"' + $("#jisuan").text() + '" }]';
			localStorage.setItem('$bengtui', json);
			popover_hide();
			var yizhulist = JSON.parse(localStorage.getItem('$yizhulist') || "{}");
			if (yizhulist.length == 0) {
				app.alert('请重新扫描医嘱条形码');
			}
			var h = plus.webview.getTopWebview();
			var value = localStorage.getItem("$wandaitxm");
			if (value == "") {
				app.alert('请重新扫描腕带');
			}
			CheckYizhu(yizhulist, value, h.id, zhixingfs);
		});
}
///计算活性药泵推值
function calculatehxy() {
	var rdsObj = document.getElementsByClassName("rds");
	var checkVal = null;
	for (i = 0; i < rdsObj.length; i++) {
		if (rdsObj[i].checked) {
			checkVal = rdsObj[i].value;
		}
	}
	//Aml 0.9%NS + Bmg某药，推注泵速度为C ml/h,患者体重为D kg
	var yizhulist = JSON.parse(localStorage.getItem('$yizhulist') || "{}");
	var A = 0,
		B = 0;
	for (i = 0; i < yizhulist.length; i++) {
		if (yizhulist[i].YICIJLDW == "ml") {
			A += yizhulist[i].YICIJL;
		} else if (yizhulist[i].YICIJLDW == "mg") {
			B += yizhulist[i].YICIJL;
		} else if (yizhulist[i].YICIJLDW == "g") {
			B += yizhulist[i].YICIJL * 1000;
		}
	}
	C = $(".sudu").val();
	D = $(".tizhong").val();
	console.log("A:" + A);
	console.log("B:" + B);
	console.log("C:" + C);
	console.log("D:" + D);
	// alert("A=" + A + "B=" + B + "C=" + C + "D=" + D);
	if (checkVal == "1") {
		//如果ml/h 不计算，直接就是护士输入的值
		$("#jisuan").text($(".sudu").val());
		$("#jisuandw").text("ml/h");
		$(".tizhongdiv").css('display', 'none');
	} else if (checkVal == "2") {
		//如果ug/min 不用体重的那个公式
		//(B*1000*C)/(50*60)
		var value = (B * 1000 * C) / (50 * 60); //((B / A) * C * 1000) / 60;
		$("#jisuan").text(value.toFixed(2));
		$("#jisuandw").text("ug/min");
		$(".tizhongdiv").css('display', 'none');

	} else if (checkVal == "3") {
		//如果ug/kg.min 根据体重进行计算
		//(B*1000*C)/50*60*D
		var value = (B * 1000 * C) / (50 * 60 * D); //((B / A) * C * 1000) / (60 * D);
		$("#jisuan").text(value.toFixed(2));
		$("#jisuandw").text("ug/kg.min");
		$(".tizhongdiv").css('display', '');

	}
}
//核对医嘱 
function popover_yizhuxx(title, content, fangfa1, fangfa2) {
	localStorage.removeItem("$AllowYizhizx");
	$('.mui-popover').remove();
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('data-disable-auto-close', 'true');
	item2.innerHTML =
		'<div class="popover_content">' +
		'<header class="padding-b">' + title + '</header>' +
		'<div class="mui-scroll-wrapper">' +
		'<div class="mui-scroll" style="display:table;">' + content +
		'</div>' +
		'</div>' +
		'<div class="popover_footer">' +
		'<button type="button"  class="mui-btn Fbtn_left"  />取消</button>' +
		'<button type="button" id="btn_ok" class="mui-btn mui-btn-primary Fbtn_right"  />确定</button>' +
		'</div>' +
		'</div>';
	$('select').on('touchstart', function () {
		$(this).Focus();
	});
	document.body.appendChild(item2);
	popover_show(fangfa1, fangfa2);
}
//选择多路正在执行的医嘱
function popover_duoluyz(title, yizhuitem, fangfa1, fangfa2) {
	$('.mui-popover').remove();
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('data-disable-auto-close', 'true');
	var innhtml = '<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		'<header>' + title + '</header>' +
		'<div class="mui-scroll-wrapper">' +
		'<div class="mui-scroll" style="display:table;">' + yizhuitem +
		'</div>' +
		'</div>' +
		'<div class="popover_footer">' +
		'<button type="button"  class="mui-btn Fbtn_left"  />取消</button>' +
		'<button type="button" class="mui-btn mui-btn-primary Fbtn_right"  />确定</button>' +
		'</div>' +
		'</div>';
	item2.innerHTML = innhtml;
	document.body.appendChild(item2);
	popover_show(fangfa1, fangfa2);
}
//胰岛素部位设置
function popover_buweisz(flag, content, fangfa1, fangfa2, fang3) {
	$('.mui-popover').remove();
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover_anniu');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('data-disable-auto-close', 'true');
	item2.innerHTML =
		'<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		'<header>' + content + '</header>' +
		'<div class="popover_footer">' +
		'<button type="button" class="mui-btn mui-btn-primary Fbtn_left juda" />拒打</button>' + '&nbsp' +
		'<button type="button" class="mui-btn mui-btn-primary Fbtn_left qxjuda" />取消拒打</button>' + '&nbsp' +
		'<button type="button" class="mui-btn mui-btn-primary Fbtn_right jinda" style="margin-left:5px" />禁打</button>' +
		'<button type="button" class="mui-btn mui-btn-primary Fbtn_right qxjinda" style="margin-left:5px" />取消禁打</button>' +
		'<button type="button" class="mui-btn mui-btn-primary Fbtn_qx" style="margin-left:5px" />取消</button>' +
		'</div>' +
		'</div>';
	document.body.appendChild(item2);
	if (flag == 1) {
		$(".qxjuda").hide();
		$(".jinda").hide();
	} else if (flag == 2) {
		$(".juda").hide();
		$(".qxjinda").hide();
	} else {
		$(".qxjuda").hide();
		$(".qxjinda").hide();
	}
	mui("#popover_anniu").popover('toggle');
	mui('.popover_footer').on('tap', '.Fbtn_left', fangfa1);
	mui('.popover_footer').on('tap', '.Fbtn_right', fangfa2);
	mui('.popover_footer').on('tap', '.Fbtn_qx', fangfa3);
}
//皮试结果录入
function popover_pishijg() {

	if (localStorage.getItem("$haspsjl")) {
		return false;
	}
	var pishiList = JSON.parse(localStorage.getItem('$pishilist') || "{}");
	var bingrenxm = "";
	var bingrenid = "";
	var xiangmumc = "";
	var jiluid = "";
	var haspsjl = false;
	var yizhuid = "";
	var yizhucode = "";
//	var GuoMinYPList = "";
	var GuoMinLBList = "";

	var tixingsj = 90000;
	var canshu = localStorage.getItem("$canshu");
	if (canshu) {
		var canshuObj = JSON.parse(canshu);
		var zhengchang = canshuObj.canshu.filter(function (c) {
			return c.CANSHUDM == '皮试提示间隔时间';
		});
		tixingsj = zhengchang[0].CANSHUZ;
	}
	console.log("皮试结果数量" + pishiList.length);
	//	过敏分类
	server.ajax({
		url: 'Bingren/GuoMinYaoPin?fuleidm=GuoMinShiYanPDA',//
		type: 'GET',
//		data: {
//			fuleidm: 'GuoMinShiYanPDA'
//		},
		success: function (d) {
			utils.closeWaiting();
			var data = JSON.parse(d);
			if (data.code === 0) {
				GuoMinLBList = data.result.GuoMinLBList;
//				var GuoMinYPList = data.result.GuoMinYPList;
				localStorage.setItem("$gmflejlt", JSON.stringify(data.result.GuoMinYPList));
//				GuoMinLBList.sort(function(a,b){
//					return a.SHUNXUH - b.SHUNXUH
//				});
//				GuoMinYPList.sort(function(a,b){
//					return b.SHUNXUH - a.SHUNXUH
//				});
				for(var i=0; i<GuoMinLBList.length; i++){
					var o = GuoMinLBList[i];
					$('#guominfl').append("<option value='"+ o.DAIMAMC +"' name='"+ o.DAIMAID +"'>"+ o.DAIMAMC +"</option>");
				}
				
//				app.toast('操作成功');
			} else {
				alert(data.message);
			}
		},
		error: function (xhr, type, errorThrown) {
			app.alert("请求失败");
		}
	});

	//遍历查看哪个皮试到期了
	$.each(pishiList, function (n, value) {
		var date1 = value.pishisj; //开始时间
		var date2 = new Date(); //结束时间
		var date3 = date2.getTime() - new Date(date1).getTime(); //时间差的毫秒数	
		if (date3 >= tixingsj) { //15分钟
			bingrenxm = value.bingrenxm;
			jiluid = value.jiluid;
			xiangmumc = value.xiangmumc;
			yizhuid = value.yizhuid;
			bingrenid = value.bingrenid;
			yizhucode = value.yizhucode;
			var haspsjljson = JSON.parse(
				"[{ \"jiluid\": \"\",\"binganhao\": \"\",\"bingrenxm\": \"\", \"xiangmumc\": \"\",\"pishisj\":\"\",\"yizhuid\":\"\" ,\"yizhucode\":\"\" ,\"wanchengbz\":\"-1\" }]"
			);
			haspsjljson.push(value);
			localStorage.setItem("$haspsjl", JSON.stringify(haspsjljson));
			haspsjl = true;
			return false;
		}
	});
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('name', 'psjgpopover');
	item2.setAttribute('data-disable-auto-close', 'true');
	item2.innerHTML =
		'<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		//标题
		'<header class="padding-b">皮试结果录入</header>' +
		'<div class="mui-scroll-wrapper no-bboder">' +
		'<div class="mui-input-row margin-tb5" style="text-align:center">' +
		'<lable id="bingrenxm" style="font-size:22px">' + bingrenxm + '</lable>' +
		'</div>' +
		'<div class="sel-div margin-r5" style="color:red;text-align:center" id="psjgAttention">' +
		'▲<lable id="tixing">请先扫描病人腕带，再录入结果</lable>' +
		'</div>' +
		'<div class="mui-input-row margin-tb5">' +
		'<lable id="yaoping" style="font-size:22px">' + xiangmumc + '</lable>' +
		'</div>' +
		'<div class="mui-input-row psjgBox">' +
		'过敏分类：' +
		'<div class="sel-div disable">' +
		'<select class="select-div type-select" disabled id="guominfl" >' + //onfocus="this.blur()"
		'<option value="0" selected>请选择</option>' +
		'</select>' +
		'</div>' +
		'</div>' +
		'<div class="mui-input-row psjgBox" style="display:none;">' +
		'<div class="sel-div" style="width:90px;border:none; padding:0px;"></div><div class="sel-div disable">' +
		'<select class="select-div type-select" id="guominflEJ">' + 
//		'<option value="0" selected>请选择</option>' +
		'</select>' +
		'</div>' +
		' </div>' +
		'<div class="mui-input-row psjgBox">' +
		'皮试结果：' +
		'<div class="sel-div disable">' +
		' <select class="select-div type-select" disabled id="pishijg">' +
		'<option value="0" selected>请选择</option>' +
		'<option value="阴性">阴性</option>' +
		'<option value="阳性">阳性</option>' +
		'<option value="++">++</option>' +
		'<option value="+++">+++</option>' +
		'<option value="++++">++++</option>' +
		'<option value="+++++">+++++</option>' +
		'<option value="++++++">++++++</option>' +
		' </select>' +
		' </div>' +
		' </div>' +
		'</div>' +
		//操作按钮
		//		'<div class="alert-footer">' +
		//          '<button type="button" id="btn_psjg" class="mui-btn mui-btn-alert"  style="border-top:none; display: none;" />确定</button>' +
		//      '</div>' +
		'<div class="popover_footer psjg_footer" style="padding:0px;">' +
		'<button type="button" id="btn_psjg" class="mui-btn mui-btn-psjg Fbtn_right" style="border-top:none;float:none; display: none;" />确定</button>' +
		'</div>' +
		'</div>';

	$('.mui-popover').on('touchstart', 'select', function () {
		$(this).Focus();
	});
	
	var state = app.getState();
	
	if (haspsjl) {
		haspsjl = false;
		$('.mui-popover').remove();
		document.body.appendChild(item2);
		
		$('.psjgBox').on('change', '#guominfl', function(){
			$('#guominflEJ').find('option').remove();
		    var GuoMinYPList = JSON.parse(localStorage.getItem('$gmflejlt') || "{}");
		    var fldmid = $('#guominfl option:selected').attr("name");
		    $('#guominflEJ').parent().parent('.psjgBox').show();
		    var gmypList = GuoMinYPList.filter(function(a){
		    	return a.Fuleidmid == fldmid
		    });
            $('#guominflEJ').append("<option value='0'>请选择</option>");
		    for(var i=0; i<gmypList.length; i++){
		    	var o = gmypList[i];
		    	$('#guominflEJ').append("<option value='"+ o.Daimamc +"'>"+ o.Daimamc +"</option>");
		    }
		    
	    });
		popover_show(
			function () {
				popover_hide();
				localStorage.removeItem("$yizhulist");
			},
			function () {
				utils.showWaiting();
				utils.closeWaiting();
				var psjg = $("#pishijg").find("option:selected").val();
				var gmfl = $("#guominfl").find("option:selected").val();
				var gmflej = $("#guominflEJ").find("option:selected").val();
				if (psjg == 0 || gmfl == 0) {
					$("#psjgAttention").show();
					plus.device.vibrate(1000);
					$("#psjgAttention #tixing").html("信息未填选完全，无法保存");
					//					app.alert("信息未填选完全");
					return false;
				}
				if(gmflej == 0){
					gmflej = "";
				}
				console.log(psjg);
				console.log(gmfl);
//				alert(gmflej);
				server.ajax({
					url: 'Bingren/PiShiSave',
					type: 'POST',
					data: {
						bingrenid: bingrenid,
						userid: state.account.YONGHUID,
						jiluid: jiluid,
						yizhuid: yizhuid,
						yizhucode: yizhucode,
						pishijg: psjg,
						guominfl: gmfl,
						guominflej: gmflej
					},
					success: function (d) {
						utils.closeWaiting();
						var data = JSON.parse(d);
						if (data.code === 0) {
							plus.device.vibrate(500);
							app.toast('操作成功');
							localStorage.removeItem("$haspsjl");
							popover_hide();
							var pishiListNew = JSON.parse(
								"[{ \"jiluid\": \"\",\"binganhao\": \"\",\"bingrenxm\": \"\", \"xiangmumc\": \"\",\"pishisj\":\"\",\"yizhuid\":\"\" ,\"yizhucode\":\"\" ,\"wanchengbz\":\"-1\" }]"
							);
							$.each(pishiList, function (n, value) {
								if (value.yizhuid != yizhuid && value.wanchengbz == "0") {
									pishiListNew.push(value);
								}
							});
							localStorage.removeItem("$pishilist");
							localStorage.setItem("$pishilist", JSON.stringify(pishiListNew));
							var wobj = plus.webview.getWebviewById("/orders/anaphylaxisTest.html");
							if (wobj != null) {
								wobj.evalJS("refreshData(function () { }, true)");
							}
						} else {
							plus.device.vibrate(1000);
							alert(data.message);
						}
					},
					error: function (xhr, type, errorThrown) {
						utils.closeWaiting();
						app.alert("请求失败");
					}
				});

			});
		plus.device.vibrate(4000);
	}
}
//function guominsyEJ(){
//	
//}
function pishijgBtn() {
	if ($("[name='psjgpopover']").css("display") == "block") {
		$(".psjgBox select").prop("disabled", false);
		//      $(".psjgBox").on('tap', '.select-div',function(){
		//      	$(this).focus();
		//      });
		$(".psjgBox .sel-div").removeClass("disable");
		$("#btn_psjg").css('display', '');
		$(".mui-scroll-wrapper").removeClass("no-bboder");
		$("#psjgAttention").hide();
		return false;
	}
}
//异常原因录入
function popover_yichang() {
	$('.mui-popover').remove();
	var item2 = document.createElement("div");
	item2.setAttribute('id', 'popover');
	item2.setAttribute('class', 'mui-popover mui-popoverT');
	item2.setAttribute('name', 'psjgpopover');
	item2.setAttribute('data-disable-auto-close', 'true');
	item2.innerHTML =
		'<div class="mui-popover-arrow"></div>' +
		'<div class="popover_content">' +
		'<header class="padding-b">异常</header>' +
		'<div class="mui-scroll-wrapper no-border">' +
		'<div class="mui-line margin-r5 display-none mui-text-center" style="color:red;" id="infoNotice">' +
		'▲<lable id="tixing">信息未填选完全，无法保存</lable>' +
		'</div>' +
		'<div class="mui-line" style="text-align:center;">' +
		'<input class="yichangTxt" type="text" style="width:85%;" placeholder="请输入其他异常原因" />' +
		' </div>' +
		'<form class="mui-line">' +
		'<div class="mui-line mui-radio mui-left" style="padding: 4px 0;">' +
		'<label>抢救</label>' +
		'<input name="radioyc" type="radio" value="抢救" class="ycyy">' +
		'</div>' +
		'<div class="mui-line mui-radio  mui-left" style="padding: 4px 0;">' +
		'<label>因手术暂停</label>' +
		'<input name="radioyc" type="radio" value="因手术暂停" class="ycyy">' +
		'</div>' +
		'<div class="mui-line mui-radio mui-left" style="padding: 4px 0;">' +
		'<label>活性药改频率</label>' +
		'<input name="radioyc" type="radio" value="活性药改频率" class="ycyy">' +
		'</div>' +
		'<div class="mui-line mui-radio mui-left" style="padding: 4px 0;">' +
		'<label>患者拒绝治疗</label>' +
		'<input name="radioyc" type="radio" value="患者拒绝治疗" class="ycyy">' +
		'</div>' +
		'<div class="mui-line mui-radio mui-left" style="padding: 4px 0;">' +
		'<label>术前带药</label>' +
		'<input name="radioyc" type="radio" value="术前带药" class="ycyy">' +
		'</div>' +
		'<div class="mui-line mui-radio mui-left" style="padding: 4px 0;">' +
		'<label>血糖低</label>' +
		'<input name="radioyc" type="radio" value="血糖低" class="ycyy">' +
		'</div>' +
		'</form>' +
		' </div>' +
		'<div class="popover_footer">' +
		'<button type="button"  class="mui-btn Fbtn_left"  />取消</button>' +
		'<button type="button" class="mui-btn mui-btn-primary Fbtn_right"  />确定</button>' +
		'</div>' +
		'</div>';
	$('input').on('touchstart', function () {
		$(this).Focus();
	});
	document.body.appendChild(item2);
	popover_show(
		function () {
			popover_hide();
		},
		function () {
			var yichangyy = "";
			var checkVal = getRadioRes('ycyy');
			var textVal = $(".popover_content .yichangTxt").val();
			if (checkVal == null && textVal == "") {
				$("#infoNotice").removeClass('display-none');
				//              $("#infoNotice").html("信息未填选完全，无法保存");
				return false;
			}
			if (checkVal != null) {
				yichangyy = checkVal;
			} else {
				yichangyy = textVal;
			}
			var lxtype = $('#type-select').val();
			var yizhutype = $('#yizhutype-select').val();
			utils.showWaiting();
			server.ajax({
				url: 'Bingren/YiZhuYC',
				type: 'POST',
				data: {
					yizhutxm: localStorage.getItem('$yizhutxm'),
					bingrenId: bingren.BINGRENID,
					userId: state.account.YONGHUID,
					zhixingNr: yichangyy,
					zhixinglx: 4,
					yichangbz: 0
				},
				success: function (d) {
					utils.closeWaiting();
					var data = JSON.parse(d);
					if (data.code === 0) {
						popover_hide();
						plus.device.vibrate(500);
						app.toast('操作成功！');
						// 						var wobj = plus.webview.currentWebview();
						// 						wobj.reload(true);
						var wobj = plus.webview.getTopWebview();
						wobj.evalJS("refreshData(function () { }, true,lxtype,yizhutype)");
					} else {
						plus.device.vibrate(1000);
						alert(data.message);
					}
				},
				error: function (xhr, type, errorThrown) {
					utils.closeWaiting();
					app.alert("请求失败");
				}
			});

		});
	$('.popover_content').on('change', '.ycyy', function (e) {
		$('.popover_content .ycyy').removeAttr('checked');
		this.checked = true;
		$('.popover_content .yichangTxt').attr("disabled");
		$('.popover_content .yichangTxt').css("color", "#888888");
	});
	$('.popover_content').on('tap', '.yichangTxt', function (e) {
		$('.popover_content .ycyy').removeAttr('checked');
		$('.popover_content .ycyy').attr("disabled");
		$('.popover_content .yichangTxt').css("color", "#333333");
	});
}

function popover_cancleyichang() {
	app.confirm("是否取消异常",
		function () {
			popover_hide();
		},
		function () {
			var lxtype = $('#type-select').val();
			var yizhutype = $('#yizhutype-select').val();
			utils.showWaiting();
			server.ajax({
				url: 'Bingren/YiZhuYC',
				type: 'POST',
				data: {
					yizhutxm: localStorage.getItem('$yizhutxm'),
					bingrenId: bingren.BINGRENID,
					userId: state.account.YONGHUID,
					yichangbz: 1
				},
				success: function (d) {
					utils.closeWaiting();
					popover_hide();
					var data = JSON.parse(d);
					if (data.code === 0) {
						plus.device.vibrate(500);
						app.toast('操作成功！');
						var wobj = plus.webview.getTopWebview();
						wobj.evalJS("refreshData(function () { }, true,lxtype,yizhutype)");
						// 						wobj.reload(true);
					} else {
						plus.device.vibrate(1000);
						app.alert(data.message);
					}
				},
				error: function (xhr, type, errorThrown) {
					utils.closeWaiting();
					app.alert("请求失败");

				}
			});
		}
	);
}
//弹框显示（）
function popover_show(fangfa1, fangfa2) {

	$('.mui-popover').find('*').on('touchstart', function () {
		$(this).focus();
	});
	mui("#popover").popover('toggle');
	mui('.mui-scroll-wrapper').scroll();
	//点击取消
	mui('.popover_footer').on('tap', '.Fbtn_left', fangfa1);
	//点击确定
	mui('.popover_footer').on('tap', '.Fbtn_right', fangfa2);
}

//弹框隐藏（取消）
var popover_hide = function () {
	//$("#popover").remove();
	//$(".mui-backdrop.mui-active").remove();
	mui("#popover").popover('toggle');
}
var popover_remove = function () {
	if ($('.mui-popover').length > 0) {
		mui("#popover").popover('toggle');
		$('.mui-popover')[0].remove();
	}
}
//弹框确定
var popover_ok = function () {
	var a = $(".mui-input-row.mui-checkbox.mui-left>input:checked").length;
	alert(a);
}
//获取单选框值
function getRadioRes(cName) {
	var rdsObj = document.getElementsByClassName(cName);
	var checkVal = null;
	for (i = 0; i < rdsObj.length; i++) {
		if (rdsObj[i].checked) {
			checkVal = rdsObj[i].value;
		}
	}
	return checkVal;
}

//根据扫描到的医嘱条形码定位到相关医嘱
function scrolltoYZ() {
	try {
		//CAOZUOSJ 字段 1是今天 2是明天
		var yizhulist = JSON.parse(localStorage.getItem('$dingwyz') || "{}");
		var chengzuid = yizhulist[0].CHENGZUYZ;
		var caozuosj = yizhulist[0].CAOZUOSJ;
		// localStorage.removeItem("$yizhulist");//扫码得出的医嘱列表
		var yzDiv;
		console.log("caozuosj:" + caozuosj);
		yzDiv = jQuery('.mui-control-content.mui-active .' + chengzuid + '');
		console.log("chengzuid:" + chengzuid);
		var postop = yzDiv.position().top;
		var scrtop = jQuery('.mui-control-content.mui-active .dispensing-table-body').scrollTop();
		//                          console.log(postop);
		//                          console.log(scrtop);
		//                          console.log(scrtop + postop);
		jQuery('.mui-control-content.mui-active .dispensing-table-body').scrollTop(scrtop + postop);
		yzDiv.addClass("saomiao").siblings().removeClass("saomiao");
	} catch (e) {
		console.log(e);
	}
}
//皮试过敏试验页面 根据扫描到的医嘱条形码定位到相关医嘱
function scrolltoPS() {
	try {
		var yizhulist = JSON.parse(localStorage.getItem('$dingwyz') || "{}");
		var yizhuID = yizhulist[0].YIZHUID;
		console.log("yizhuID->" + yizhuID);
		yizhuDiv = jQuery('.mui-control-content.mui-active .' + yizhuID + '');
		var postop = yizhuDiv.position().top;
		//      var scrtop = jQuery('.mui-scroll-wrapper').scrollTop();
		console.log(postop);
		console.log(scrtop);
		console.log(scrtop + postop);
		mui('.mui-scroll-wrapper').scroll().scrollTo(0, -postop, 100);
		//      yizhuDiv.children(".right").addClass("active").siblings().removeClass("active");
		//      jQuery('.mui-scroll-wrapper').scrollTop(500);
		yizhuDiv.addClass("saomiao").siblings().removeClass("saomiao");

	} catch (e) {
		console.log(e);
	}
}
//医嘱查询定位
function scrolltoOrder() {
	try {
		var yizhulist = JSON.parse(localStorage.getItem('$dingwyz') || "{}");
		var yizhuID = yizhulist[0].CHENGZUYZ;
		var caozuosj = yizhulist[0].CAOZUOSJ;
		var yzDiv;
		yzDiv = jQuery('.mui-control-content.mui-active .dispensing-table-body .' + yizhuID + '');
		var postop = yzDiv.position().top;
		var scrtop = jQuery('.mui-control-content.mui-active .dispensing-table-body').scrollTop();
		jQuery('.mui-control-content.mui-active .dispensing-table-body').scrollTop(scrtop + postop);
		yzDiv.addClass("saomiao").siblings().removeClass("saomiao");
	} catch (e) {
		console.log(e);
	}
}
//时间转换
function changeDateFormat(cellval) {
	if (cellval != null) {
		var date = new Date(cellval);
		var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
		var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
		var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
		var min = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
		var second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
		return date.getFullYear() + "-" + month + "-" + currentDate + " " + hours + ":" + min;
	}
}

function groupBy(array, f) {
	var groups = {};
	array.forEach(function (o) {
		var group = JSON.stringify(f(o));
		groups[group] = groups[group] || [];
		groups[group].push(o);
	});
	return Object.keys(groups).map(function (group) {
		return groups[group];
	});
}
