//自动更新程序
(function ($, upd) {

	upd.UpdateVerson = function () {
		server.ajax({
			url: 'App/Version',
			type: 'GET',
			success: function (d) {
				var data = JSON.parse(d);
				if (data.code === 0) {
					var versionmess = JSON.parse(data.result);
					console.log(versionmess);
					upd.update_ksd(versionmess);
				} else {
					mui.toast(data.message);
				}
			},
			error: function (xhr, type, errorThrown) {
				mui.toast("版本检查失败");
			}
		});
	};
	upd.update_ksd = function (data) //跨域请求后的回调函数
	{
		var new_json = data.version;
		console.log(new_json.rollbackstate);
		console.log(new_json.updateNR);
		console.log(new_json.url);
		if(new_json.rollbackstate == 'true'){//如果是回滚，则判断版本号是否一直
			$.ajax({
				type: "get",
				url: "manifest.json",
				async: true,
				success: function (res) {
					var data = JSON.parse(res);
					var version = data.version.name;
					console.log(version);
					var hgContent = "回滚至版本号V" + new_json.rollbackversion;
					var new_version = new_json.rollbackversion.replace(/\./g, '');
					version = version.replace(/\./g, '');
					if (new_version != version){ //比对版本号
						upd.updatePopover('程序回滚', hgContent, new_json.rollbackurl, new_json.rollbackapkname);
					}
				}
			});
	    }else{
		    if (new_json.state == 'yes') //如果是自动更新，则判断版本号
		    {
			$.ajax({
				type: "get",
				url: "manifest.json",
				async: true,
				success: function (res) {
					var data = JSON.parse(res);
					var version = data.version.name;
					var new_version = new_json.version.replace(/\./g, '');
					version = version.replace(/\./g, '');
					if (new_version > version) //比对版本号
					{
						//                      plus.nativeUI.confirm("应用有新版本，请立即下载更新！", function (event) {
						//                          if (event.index == 1) {
						//plus.nativeUI.showWaiting();
						//                              upd.update(new_json.url, new_json.apkname);//更新函数,在下面
						//                          }
						//                      }, '更新提示',  [" ","确定"]);
						upd.updatePopover('更新提示', new_json.updateNR, new_json.url, new_json.apkname);
//						upd.updatePopover("应用有新版本，请立即下载更新！", new_json.url, new_json.apkname); //,  ["确定"," "]
					} else {
						var h = plus.webview.getTopWebview();
						if (h.id != "main.html") {
							mui.toast("已经是最新版本");
						}
					}
				}
			});

		    }
	    }
		
	}
	upd.update = function (url, apkname) {		
		//创建下载管理对象
		var dtask = plus.downloader.createDownload(url, {}, function (d, status) {
			// 下载完成
			if (status == 200) { //下载成功后的回调函数
				plus.nativeUI.toast("下载成功，准备安装" + d.filename);
				//安装程序，第一个参数是路径，默认的下载路径在_downloads里面
				plus.runtime.install('_downloads/' + apkname, {}, function () {
					plus.nativeUI.toast('安装成功');
				}, function () {
					plus.nativeUI.toast('安装失败');
				});
				plus.nativeUI.closeWaiting();
			} else {
				alert("下载失败 " + status);

			}
		});
		dtask.start(); //开始下载任务
	}
	upd.updatePopover = function (title,content, url,apkname) {
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
			'<div class="alert-head">'+ title +'</div>' +
			'<div class="mui-scroll-wrapper alert-wrapper">' +
			'<div class="mui-scroll"  align="left" id="content">' + content +
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
		mui('.alert-footer').on('tap', '.mui-btn-alert', function(){
			plus.nativeUI.showWaiting();
			popover_hide();
			upd.update(url,apkname);
		});

	}
	
}(mui, window.update = {}));
