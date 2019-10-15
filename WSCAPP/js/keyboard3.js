var currentInput = null;
(function (exports) {
    var KeyBoard = function (input, n, options) {
        currentInput  = input;
        var body = document.getElementsByTagName('body')[0];
        var DIV_ID = options && options.divId || '__w_l_h_v_c_z_e_r_o_divid';
        if (document.getElementById(DIV_ID)) {
            body.removeChild(document.getElementById(DIV_ID));
        }
        this.succ = options && options.succ;
        this.input = input;
        this.el = document.createElement('div');
        var self = this;
        var zIndex = options && options.zIndex || 1000;
        var width = options && options.width || '100%';
        var height = options && options.height || '250px';
        var paddingTop = options && options.paddingTop || '5px';
        var paddingBottom = options && options.paddingBottom || '5px';
        var fontSize = options && options.fontSize || '15px';
        var border = options && options.borderTop || 'solid 1px #ccc;';
        var backgroundColor = options && options.backgroundColor || '#dddddd';
        var TABLE_ID = options && options.table_id || 'table_0909099';
        var mobile = typeof orientation !== 'undefined';
        this.el.id = DIV_ID;
        this.el.style.position = 'fixed';
        this.el.style.left = 0;
        this.el.style.right = 0;
        this.el.style.bottom = 0;
        this.el.style.zIndex = zIndex;
        this.el.style.width = width;
        this.el.style.height = height;
        this.el.style.borderTop = border;
        this.el.style.backgroundColor = backgroundColor;
        //样式
        var cssStr = '<style type="text/css">';
        // 用css控制键盘是否显示
        cssStr += '.nfs-keyboard-header{height:50px;background-color:#eee;font-size: 18px;color: #888;}';
        cssStr += '.nfs-keyboard-body{height:200px;background-color:#eee;}';
        cssStr += '.opacityOut{display:none}';
        cssStr += '.a-bounceinB{bottom:0;border:0;-webkit-animation:bounceinB 0.3s ease-in backwards;-moz-animation:bounceinB 0.3s ease-in backwards;-ms-animation:bounceinB 0.3s ease-in backwards;animation:bounceinB 0.3s ease-in backwards;}';
        cssStr += '.a-bounceoutB{bottom:-250px;border:0;padding:0;-webkit-animation:bounceoutB 0.3s ease-out backwards;-moz-animation:bounceoutB 0.3s ease-out backwards;-ms-animation:bounceoutB 0.3s ease-out backwards;animation:bounceoutB 0.3s ease-out backwards;}';
        cssStr += '@-webkit-keyframes bounceoutB{0%{opacity:1;-webkit-transform:translateY(-250px);}100%{opacity:0;-webkit-transform:translateY(0);}}';
        cssStr += '@-moz-keyframes bounceoutB{0%{opacity:1;-webkit-transform:translateY(-250px);}100%{opacity:0;-webkit-transform:translateY(0);}}';
        cssStr += '@-ms-keyframes bounceoutB{0%{opacity:1;-webkit-transform:translateY(-250px);}100%{opacity:0;-webkit-transform:translateY(0);}}';
        cssStr += '@keyframes bounceoutB{0%{opacity:1;-webkit-transform:translateY(-250px);}100%{opacity:0;-webkit-transform:translateY(0);}}';
        cssStr += '@-webkit-keyframes bounceinB{0%{opacity:0;-webkit-transform:translateY(250px);}100%{opacity:1;-webkit-transform:translateY(0);}}';
        cssStr += '@-moz-keyframes bounceinB{0%{opacity:0;-webkit-transform:translateY(250px);}100%{opacity:1;-webkit-transform:translateY(0);}}';
        cssStr += '@-ms-keyframes bounceinB{0%{opacity:0;-webkit-transform:translateY(250px);}100%{opacity:1;-webkit-transform:translateY(0);}}';
        cssStr += '@keyframes bounceinB{0%{opacity:0;-webkit-transform:translateY(250px);}100%{opacity:1;-webkit-transform:translateY(0);}}';
        //table样式
        cssStr += '#' + TABLE_ID + '{font-size:18px;text-align:center;width:100%;height:200px;border-top:1px solid #CECDCE;background-color:#FFF;}';
        cssStr += '#' + TABLE_ID + ' td{width:33%;border:1px solid #ddd;border-right:0;border-top:0;}';
        if (!mobile) {
            cssStr += '#' + TABLE_ID + ' td:hover{background-color:#1FB9FF;color:#FFF;}';
        }
        cssStr += '</style>';
        //background
        var back = '<div id="background" style="position: fixed;z-index:-1001;top: 0;right: 0;bottom: 0;left: 0;background-color: rgba(0,0,0,.3);font-size:0;">123</div>'
        //nfs-keyboard-header
        var header = '<div class="nfs-keyboard-header">';
        //Button
        var btnCompleteStr = '<div style="width:17%;height:32px;background-color:#1FB9FF;';
        btnCompleteStr += 'float:right;margin-right:2%;text-align:center;color:#fff;';
        btnCompleteStr += 'line-height:32px;font-size: 14px;border-radius:3px;margin-top:8px;;cursor:pointer;display:inline-block;">无法测量</div>';

        btnCompleteStr += '<select id="keyboard-select" style="position:absolute;right:0;width:17%;color:transparent;">' +
			'<option value="0">选择原因</option>' +
			'<option value="102">入睡中</option>' +
			'<option value="103">拒绝</option>' +
			'<option value="105">请假</option>' +
			'<option value="107">禁治疗</option>' +
			'<option value="101">检查中</option>' +
			'<option value="104">哭闹</option>' +
			'<option value="100">测不到</option>' +
			'<option value="qtyy">其他</option>' +
			'</select>';

        btnCompleteStr += '<div style="width:17%;height:32px;background-color:#1FB9FF;';
        btnCompleteStr += 'float:right;margin-right:2%;text-align:center;color:#fff;';
        btnCompleteStr += 'line-height:32px;font-size: 14px;border-radius:3px;margin-top:8px;;cursor:pointer;display:inline-block;">完成</div>';
        //Button
        var btnCancelStr = '<div style="width:15%;height:32px;background-color:#D3D9DF;';
        btnCancelStr += 'float:left;margin-left:2%;text-align:center;color:#000;';
        btnCancelStr += 'line-height:32px;font-size: 14px;border-radius:3px;margin-top:8px;cursor:pointer;">取消</div>';
        //input
        var inputStr = '<input type="text" id="_input" value="" readonly="readonly" placeholder="" unselectable="on" onfocus="this.blur()"';
        inputStr += ' style="width:40%;height:28px;float:left;margin-left:2%;';
        inputStr += 'text-align:right;color:#000;border: 1px solid #ccc;';
        inputStr += 'margin-top:10px;font-size:18px;"><div style="clear:both"></div></div>';
        //nfs-keyboard-body
        //table
        var tableStr = '<div class="nfs-keyboard-body">';
        tableStr += '	<table id="' + TABLE_ID + '" border="0" cellspacing="0" cellpadding="0">';
        tableStr += ' 	<tr><td>1</td><td>2</td><td>3</td></tr>';
        tableStr += ' 	<tr><td>4</td><td>5</td><td>6</td></tr>';
        tableStr += ' 	<tr><td>7</td><td>8</td><td>9</td></tr>';
        tableStr += '	 	<tr><td style="background-color:#D3D9DF;">.</td><td>0</td>';
        tableStr += '	 			<td style="background-color:#D3D9DF;">删除</td></tr>';
        tableStr += '</table>';
        tableStr += '</div>';
        //html的渲染
        this.el.innerHTML = cssStr + back + header + btnCompleteStr + btnCancelStr + inputStr + tableStr;

        //控制输入框中的格式
        function clearNoNum(obj) {
            obj.value = obj.value.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符
            obj.value = obj.value.replace(/^\./g, ""); //验证第一个字符是数字而不是.
            obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的.
            obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
            if (obj.value.indexOf(".") < 0 && obj.value != "") { //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
                obj.value = parseFloat(obj.value);
            }
            if (obj.value.indexOf(".") >= 0) { //判断是否有小数点
                if (obj.value.split(".")[1].length > n) { //控制只能输入小数点后2位
                    obj.value = obj.value.substr(0, obj.value.length - 1);
                }
            }
        }

        function addEvent(e) {
            var ev = e || window.event;
            var _input = document.getElementById("_input");
            var clickEl = ev.element || ev.target;
            var value = clickEl.textContent || clickEl.innerText;
            if (clickEl.tagName.toLocaleLowerCase() === 'td' && value !== "删除") {
                if (input) {
					if (clickEl.tagName.toLocaleLowerCase() === 'td' && value === ".") {
						if (n <= 0) {
							_input.value = _input.value;
						} else {
							_input.value += value;
							clearNoNum(_input);
						}
					} else {
						_input.value += value;
						clearNoNum(_input);
					}
				}
            } else if (clickEl.tagName.toLocaleLowerCase() === 'div' && value === "完成") {
                self.input.value = _input.value.replace(/\.$/g, ""); //最后一位不能是'.';
                if (self.succ) {
                    self.succ(self.input.value);
                }
//              self.el.classList.add('a-bounceoutB');
                self.el.classList.add('opacityOut');
                self.el.style.bottom = '-250px';
                document.getElementById("background").classList.add('opacityOut');
                clearReason();
            } else if (clickEl.tagName.toLocaleLowerCase() === 'div' && value === "无法测量") {
                $('#keyboard-select').trigger('tap');
            } else if (clickEl.tagName.toLocaleLowerCase() === 'div' && value === "取消" || value === "123") {
                self.el.classList.add('a-bounceoutB');
                self.el.style.bottom = '-250px';
                document.getElementById("background").classList.add('opacityOut');
            } else if (clickEl.tagName.toLocaleLowerCase() === 'td' && value === "删除") {
                var num = _input.value;
                if (num) {
                    var newNum = num.substr(0, num.length - 1);
                    _input.value = newNum;
                }
            	
            }
        }

        if (mobile) {
            this.el.ontouchstart = addEvent;
        } else {
            this.el.onclick = addEvent;
        }
        body.appendChild(this.el);
        this.el.classList = 'a-bounceinB';
    }
    exports.KeyBoard = KeyBoard;

})(window);

//$('body').on('change', '#keyboard-select', function () {
//	if (this.value !== '0') {
//		if (currentInput) {
//			var div = document.createElement('div');
//			div.classList.add('reason-div');
//			div.setAttribute("data-attr", $("#keyboard-select option:selected").val());
//			var text = '无法测量，原因：' + $("#keyboard-select option:selected").text();
//			div.innerHTML = text;
//
//			var reason = $(currentInput.parentElement).find('.reason-div');
//			if (reason.length === 0) {
//				currentInput.parentElement.appendChild(div);
//			} else {
//				$(reason[0]).text(text);
//			}
//			currentInput.value = '';
//			$($(currentInput).parent().find('.cuoshi')[0]).html('');
//			$(currentInput).removeClass('red');
//		}
//		document.getElementById("keyboard-select").options.selectedIndex = 0;
//
//		var el = document.getElementById('__w_l_h_v_c_z_e_r_o_divid');
//		el.classList.add('a-bounceoutB');
//		el.style.bottom = '-250px';
//		document.getElementById("background").classList.add('opacityOut');
//
//	}
//});
$('body').on('change', 'input[name="wfclyy"]', function () {
	if (this.value !== '0') {
		if (currentInput) {
			var el = document.getElementById('wfclyySelect');
			var inputText = $(".keyboard-select-box input[type=radio]:checked").prev('label').text();
			var value = $(".keyboard-select-box input[type=radio]:checked").val();
			console.log("text->" + inputText);
			console.log("value ->" + value );
//			$(".mui-line #qtyy").hide();
			// 0--未选择 、qtyy--其他原因
			if(value == "0"){
				$("#keyboard-qtyy").hide();
				$("#keyboard-qtyyText").val("");
				el.classList.add('active');
				document.getElementById("__w_l_h_v_c_z_e_r_o_divid").classList.remove('opacityOut');
				document.getElementById("background").classList.add('opacityOut');
//				return false;
			}else if(value == "qtyy"){
				$("#keyboard-qtyy").show();
				inputText = $("#keyboard-qtyyText").val();
				
			}else{
				$("#keyboard-qtyy").hide();
				$("#keyboard-qtyyText").val("");
				el.classList.add('opacityOut');
			document.getElementById("background").classList.add('opacityOut');
//			div.innerHTML = text;
            $('#wfclyy').parent(".mui-line").show();
//          $('#wfclyy').html(inputText);
//          $('#wfclyy').prop("name",value);
            
			var div = document.createElement('div');
			div.classList.add('reason-div');
			div.setAttribute("data-type", value);
			console.log(value);
			var text = '无法测量，原因：' + inputText;
			div.innerHTML = text;

			var reason = $(currentInput.parentElement).find('.reason-div');
			if (reason.length === 0) {
				currentInput.parentElement.appendChild(div);
			} else {
				$(reason[0]).text(text);
			}
			currentInput.value = '';
			$($(currentInput).parent().find('.cuoshi')[0]).html('');
			$(currentInput).removeClass('red');
			}
		}
		document.getElementById("keyboard-select").options.selectedIndex = 0;
//		el.style.bottom = '500px';
//		console.log($("#keyboard-select").innerHeight());classList.add('opacityOut')
		document.getElementById("background").classList.add('active');
	}
});
//无法测量原因  选择列表弹框  显示
$('body').on('tap', '#keyboard-select', function () {
	document.getElementById("__w_l_h_v_c_z_e_r_o_divid").classList.add('opacityOut');//opacityOut
	setTimeout('showWfclyy()',100);
	;
//	document.getElementById("background").classList.add('opacityOut');
});
//其他原因中的确定按钮
$("body").on('tap','#keyboard-qtyyBtn',function(){
	var inputVal = $("#keyboard-qtyyText").val();
	if(inputVal != ""){
		document.getElementById('wfclyySelect').classList.add('opacityOut');//opacityOut
		document.getElementById("background").classList.add('opacityOut');//.classList.add('opacityOut');
//		$('#wfclyy').html(inputVal);
//      $('#wfclyy').prop("name","qtyy");
//      text = '无法测量，原因：' + inputVal;
//      div.setAttribute("data-attr", "qtyy");
        console.log("text->" + inputVal);
        var div = document.createElement('div');
	    div.classList.add('reason-div');
		div.setAttribute("data-type", "qtyy");
		var text = '无法测量，原因：' + inputVal;
		div.innerHTML = text;

			var reason = $(currentInput.parentElement).find('.reason-div');
			if (reason.length === 0) {
				currentInput.parentElement.appendChild(div);
			} else {
				$(reason[0]).text(text);
			}
			currentInput.value = '';
			$($(currentInput).parent().find('.cuoshi')[0]).html('');
			$(currentInput).removeClass('red');
	}
	document.getElementById("keyboard-select").options.selectedIndex = 0;
	document.getElementById("background").classList.add('active');
});
//无法测量原因  选择列表弹框
function showWfclyy(){
//	body.remove(document.getElementById('__w_l_h_v_c_z_e_r_o_divid'))
	var body = document.getElementsByTagName('body')[0];
    var DIV_ID ='wfclyySelect';// options && options.divId || 
	if (document.getElementById(DIV_ID)) {
		body.removeChild(document.getElementById(DIV_ID));
	}
	var item2 = document.createElement("div");
	item2.id = DIV_ID;
//	item2.style.position = 'fixed';
//      item2.style.left = 0;
//      item2.style.right = 0;
//      item2.style.bottom = 0;
//      item2.style.zIndex = '1002';
//      item2.style.width = '90%';
//      item2.style.height = 'auto';
////      item2.style.borderTop = border;
//      item2.style.backgroundColor = '#ffffff';
	//background
	var background =
		'<div id="background" style="position: fixed;z-index:-1001;top: 0;right: 0;bottom: 0;left: 0;background-color: rgba(0,0,0,.3);font-size:0;">123</div>'
	//keyboard-select-box
//	var header = '<div class="keyboard-select-box">';
	//select-item
	var content =
	'<div class="keyboard-select-box">'+
	    '<div class="mui-input-group">'+
	        '<div class="mui-input-row mui-radio">'+
	            '<label>选择原因</label>'+
	            '<input name="wfclyy" value="0" type="radio" checked>'+
	        '</div>'+
	        '<div class="mui-input-row mui-radio">'+
	            '<label>测不到</label>'+
	            '<input name="wfclyy" value="100" type="radio">'+
	        '</div>'+
	        '<div class="mui-input-row mui-radio">'+
	            '<label>检查中</label>'+
	            '<input name="wfclyy" value="101" type="radio">'+
	        '</div>'+
	        '<div class="mui-input-row mui-radio">'+
	            '<label>入睡中</label>'+
	            '<input name="wfclyy" value="102" type="radio">'+
	        '</div>'+
	        '<div class="mui-input-row mui-radio">'+
	            '<label>拒绝</label>'+
	            '<input name="wfclyy" value="103" type="radio">'+
	        '</div>'+
	        '<div class="mui-input-row mui-radio">'+
	            '<label>哭闹</label>'+
	            '<input name="wfclyy" value="104" type="radio">'+
	        '</div>'+
	        '<div class="mui-input-row mui-radio">'+
	            '<label>请假</label>'+
	            '<input name="wfclyy" value="105" type="radio">'+
	        '</div>'+
	        '<div class="mui-input-row mui-radio">'+
	            '<label>禁治疗</label>'+
	            '<input name="wfclyy" value="107" type="radio">'+
	        '</div>'+
	        '<div class="mui-input-row mui-radio">'+
	            '<label>其他</label>'+
	            '<input name="wfclyy" id="qtyyCheck" value="qtyy" type="radio">'+
	        '</div>'+
	    '</div>'+
	    '<div class="mui-input-group" id="keyboard-qtyy" style="display:none;">'+
	        '<span class="f-left"><input type="text" id="keyboard-qtyyText" placeholder="请输入原因，并确定保存"></span>'+
	        '<span class="f-right"><input type="button" value="确定" class="mui-btn mui-btn-primary" id="keyboard-qtyyBtn" ></span>'+
	    '</div>'+
	'</div>';
	item2.innerHTML = background + content;
	document.body.appendChild(item2);
	item2.classList = 'a-bounceinB';
}