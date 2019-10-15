//护理执行\\静脉注射//静脉输液//皮下注射
function showDatabox1(list,list2,list3,yztype,yztypeName, nowdate){
	currentList = list;
	jiluList = list2;
	ycjiluList = list3;
	var tableStr = "",
	    tableStry = "",
	    tableStryLS = "",
	    tableStryCQ = "",
	    tableStryQT = "",
	    tableStrw = "",
	    tableStrwLS = "",
	    tableStrwCQ = "",
	    tableStrwQT = "";
	var index = 0, allTimes = 0, doTimes = 0;
	var currDay = new Date(nowdate).getDay() == 0 ? 7 : new Date(nowdate).getDay();
	var chenzhuArr = [];
    var chenzhui = 0;
    
    var ycStatue = "";
    var ycCancelStatue = "";
	for (var index = 0; index < currentList.length; index++) {
        var o = currentList[index];
//  currentList.forEach(function(o){
		
	    if (o.CHANGQILS == "LS" ||
		    (!((o.NOTE || '').indexOf('NEXT') > -1 && o.KAIDANSJ.substring(0, 10) === new Date(nowdate).format('yyyy-MM-dd')) &&
			!(o.INWEEK == 1 && (o.NOTE || '').indexOf(currDay) == -1) && o.CHANGQILS == "CQ")) {
			        	
//			var currCnt = jiluList.filter(function(a){
//				return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == '3' && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd')
//			}).length;
//			var ifFinished = (currCntShow >= allCntShow) ? "finished" : "nofinished";
            var ifFinished = "";
            var yizhuLX = "yizhulx-" + o.CHANGQILS;
            var yizhuID = o.YIZHUID;
            var currCnt1 = 0, currCnt2=0 , currCnt3=0 , currCnt4=0;
            var groupLength = 0;        
            var groupArr = [];
            var zxjlStrCommon = "";
            var flag = 0;
            var Aflag =1;
            var yizhutype = yztype;   
            var yizhutypeName = yztypeName;  
            
            
            //最后一个值
        if(index == currentList.length-1){
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
//                      index = index + 1;
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
                if(o.YIZHUSM == null){
            	   yizhusm = "display-none";
                }
                //医嘱状态'已停止','2','作废','3','在执行','0','执行完','0','新开','4','已校对','0','已发送','6'
                var tzStatue = "display-none";
                var tzStatueTxt = "";
//              if(o.YIZHUZT == '0'){
//              	tzStatue = "display-block";
//              	tzStatueTxt = "在执行";
//              }
                if(o.YIZHUZT == '2'){
                	tzStatue = "display-block";
                	tzStatueTxt = "已停嘱";
                }
                if(o.YIZHUZT == '3'){
                	tzStatue = "display-block";
                	tzStatueTxt = "已作废";
                }
		    //执行记录
			var	zhixingList = jiluList.filter(function(a){
            	return a.YIZHUID == o.YIZHUID && (new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd'))
           });
           zhixingList.sort(function(a,b){
            	return b.ZXIXINGSJ - a.ZXIXINGSJ
            });
            zhixingList.sort(function(a,b){
            	return b.ZHIXINGLX - a.ZHIXINGLX
            });
            zhixingList.sort(function(a,b){
            	return b.STOPAUSEBZ - a.STOPAUSEBZ
            });
           var zxgroupList = groupBy(zhixingList, function(item){
                return [item.YIZHUCODE];
           });
           
            for(var i=0; i<zxgroupList.length; i++){
            	zxjlStrCommon += '<div class="zxjl-content">';
            	for(var j=0; j<zxgroupList[i].length; j++){
            		if(zxgroupList[i][j].ZHIXINGLX == '1'){
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">摆药：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>'
            	    }
            	    if(zxgroupList[i][j].ZHIXINGLX == '2'){
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">配药：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>'
            	    }
            	    if(zxgroupList[i][j].ZHIXINGLX == '3'){
//          		    if(zxgroupList[i][j].STOPPAUSEBZ == '0' ||  zxgroupList[i][j].STOPPAUSEBZ == ''){
            	        	
//          	        }
            	        if(zxgroupList[i][j].STOPPAUSEBZ == '1'){
            	        	zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">暂停：</span><span class="f-left">'+ zxgroupList[i][j].STOPPAUSEXM +'/'+ zxgroupList[i][j].STOPPAUSEDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].STOPPAUSESJ) +'</span></div>';
            	        }
            		    if(zxgroupList[i][j].STOPPAUSEBZ == '2'){
            	        	zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">停止：</span><span class="f-left">'+ zxgroupList[i][j].STOPPAUSEXM +'/'+ zxgroupList[i][j].STOPPAUSEDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].STOPPAUSESJ) +'</span></div>';
            	        }
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">执行：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>';
            	    }
            	    if(zxgroupList[i][j].ZHIXINGLX == '4'){
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">异常：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span>&nbsp;&nbsp;&nbsp;&nbsp;('+ zxgroupList[i][j].ZHIXINGNR +')<span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>'
            	    }
            	    
            	}
            	zxjlStrCommon +='</div>';
            }
            if(zxjlStrCommon == ""){
                	zxjlStrCommon ='<div class="zxjl-content" style="font-size:14px;">暂无执行记录</div>';
                }
//				var chengzuID = o;
                var groupStrCommon = "",
					groupStrRight = "",
					groupDiv = "";
					        
					if (groupLength > 0) {
                        roupDiv = "groupDiv";
                        for (var i = 1; i < groupArr.length; i++) {
                            groupStrCommon +=
//							'<div class="' + groupDiv + '">' +
							'<div class="orderIline1">' +
							    '<input type="hidden" class="' + currentList[groupArr[i]].YIZHUID + '" value="' + currentList[groupArr[i]].YIZHUID + '"/>' +
							    '<div>' +
							        currentList[groupArr[i]].YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' +
							        (currentList[groupArr[i]].YICIJL + currentList[groupArr[i]].YICIJLDW) +
							    '</div>' +
							'</div>';
                        }
                   }
                var yclength = 0;
			    for(var y=0; y< ycjiluList.length ; y++){
			    	if(ycjiluList[y].YIZHUID == o.YIZHUID){
			    		yclength = 1;
			    		break;
			    	}
			    }
			    //取消异常
			    if(yclength == 1){
			    	ycStatue = "";
			    	ycCancelStatue = "display-none";
			    }else{
			    	ycStatue = "display-none";
			    	ycCancelStatue = "display-none";
			    }
				//临时医嘱
                if (o.CHANGQILS == "LS") {
                    currCnt1 = jiluList.filter(function (a) {
                        return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "3" && (new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd'))
                    }).length;

                    currCntShow = currCnt1,
					allCntShow = (o.FEQUENCYTIMES || 1);
						
                    ifFinished = (currCntShow >= allCntShow) ? "finished" : "nofinished";
                    if (ifFinished == "finished") {
                        tableStryLS +=
                        '<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					       '<a class="mui-navigate-right" href="#">'+
					           '<input type="hidden" class="index"/>' +
					       '<div class="orderInfo">' +
					          '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					          groupStrCommon +
					          '<div class="orderIline2">' +
					              '<span class="f-left">'  + (o.GEIYAOFSMC || '') + '</span>' +
						          '<span class="f-right">' + (o.PINCI) + '</span>' +
//							    '<span class="f-right">' +
//							        '(<span class="currCount">' + currCntShow + '</span>' +
//							        '/' +
//							        '<span class="allCount">' + allCntShow + '</span>)' +
//							    '</span>' +
					          '</div>' +
					          '<div class="orderIline2"><span>打印时间：' + nowdate +'</span></div>' +
					          '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					    '</div>' +
					    '<div class="orderRight">' +
					        '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">' + yizhutypeName + '</span>' +
					        '</div>' +
					        '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					        '</div>' +
					        '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					        '</div>' +
					    '</div>' +
					       '</a>'+
					        '<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				        '</div>';
                    } else {
                        tableStrwLS +=
						'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					    '<a class="mui-navigate-right" href="#">'+
					    '<input type="hidden" class="index"/>' +
					    '<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     groupStrCommon +
					     '<div class="orderIline2">' +
					     '<span class="f-left">'  + (o.GEIYAOFSMC || '') + '</span>' +
						  '<span class="f-right">' + (o.PINCI) + '</span>' +
//							    '<span class="f-right">' +
//							        '(<span class="currCount">' + currCntShow + '</span>' +
//							        '/' +
//							        '<span class="allCount">' + allCntShow + '</span>)' +
//							    '</span>' +
					    '</div>' +
					    '<div class="orderIline2"><span>打印时间：' + nowdate +'</span></div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					    '</div>' +
					    '<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">' + yizhutypeName + '</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
					     '<div class="orderRline orderRbtn ' + ycStatue + '" name="btnyic">' +
					        '<span class="Rline-text">异常</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycCancelStatue + '" name="btncancleyic">' +
					        '<span class="Rline-text">取消异常</span>' +
					    '</div>' +
					    '</div>' +
					    '</a>'+
					    '<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				        '</div>';
                    }
                }
                //今日长期医嘱，医嘱开始时间为今天 ，首日次数不为空，allCntShow为首日次数
                if (o.CHANGQILS == "CQ" && new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd')) {
                    currCnt2 = jiluList.filter(function (a) {
                        return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "3" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd');
                    }).length;
                    currCntShow = currCnt2;
                    if ((o.SHOURICS || '') != "") {
                        if (o.SHOURICS != 0) {
                            allCntShow = o.SHOURICS;
                            ifFinished = (currCntShow >= allCntShow) ? "finished" : "nofinished";
                            if (ifFinished == "finished") {
                                tableStryCQ +=
									'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					    '<input type="hidden" class="index"/>' +
					    '<a class="mui-navigate-right" href="#">'+
					    '<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     groupStrCommon +
					     '<div class="orderIline2">' +
					     '<span class="f-left">'  + (o.GEIYAOFSMC || '') + '</span>' +
						 '<span class="f-right">' + (o.PINCI) + '</span>' +
//							    '<span class="f-right">' +
//							        '(<span class="currCount">' + currCntShow + '</span>' +
//							        '/' +
//							        '<span class="allCount">' + allCntShow + '</span>)' +
//							    '</span>' +
					    '</div>' +
					    '<div class="orderIline2"><span>打印时间：' + nowdate +'</span></div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					    '</div>' +
					    '<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">' + yizhutypeName + '</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
					    '</div>' +
					    '</a>'+
					    '<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				        '</div>';
                            } else {
                                tableStrwCQ +=
									'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + '" name="' + yizhuID + '">' +
					    '<input type="hidden" class="index"/>' +
					    '<a class="mui-navigate-right" href="#">'+
					    '<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     groupStrCommon +
					     '<div class="orderIline2">' +
					     '<span class="f-left">' + (o.GEIYAOFSMC || '') +'</span>' +
					     '<span class="f-right">' + (o.PINCI) + '</span>' +
//							    '<span class="f-right">' +
//							        '(<span class="currCount">' + currCntShow + '</span>' +
//							        '/' +
//							        '<span class="allCount">' + allCntShow + '</span>)' +
//							    '</span>' +
					    '</div>' +
					    '<div class="orderIline2"><span>打印时间：' + nowdate +'</span></div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					    '</div>' +
					    '<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">' + yizhutypeName + '</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
					     '<div class="orderRline orderRbtn ' + ycStatue + '" name="btnyic">' +
					        '<span class="Rline-text">异常</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycCancelStatue + '" name="btncancleyic">' +
					        '<span class="Rline-text">取消异常</span>' +
					    '</div>' +
					    '</div>' +
					    '</a>'+
					    '<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				        '</div>';
                            }
                        }
                    }
                }
                //今日长期医嘱，医嘱开始时间不为今天 
                if (o.CHANGQILS == "CQ" && !(new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd'))) {
                    currCnt3 = jiluList.filter(function (a) {
                        return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "3" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd');
                    }).length;
                    var currCntShow = currCnt3,
						allCntShow = (o.FEQUENCYTIMES || 1);
                    var ifFinished = (currCntShow >= allCntShow) ? "finished" : "nofinished";
//                  console.log("currCntShow" + currCntShow);
//                  console.log("allCntShow" + allCntShow);
                    if (ifFinished == "finished") {
                        tableStryCQ +=
							'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + '" name="' + yizhuID + '">' +
					    '<input type="hidden" class="index"/>' +
					    '<a class="mui-navigate-right" href="#">'+
					    '<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     groupStrCommon +
					     '<div class="orderIline2">' +
					     '<span class="f-left">' + (o.GEIYAOFSMC || '') +'</span>' +
					     '<span class="f-right">' + (o.PINCI) + '</span>' +
//							    '<span class="f-right">' +
//							        '(<span class="currCount">' + currCntShow + '</span>' +
//							        '/' +
//							        '<span class="allCount">' + allCntShow + '</span>)' +
//							    '</span>' +
					    '</div>' +
					    '<div class="orderIline2"><span>打印时间：' + nowdate +'</span></div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					    '</div>' +
					    '<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">' + yizhutypeName + '</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
					    '</div>' +
					    '</a>'+
					    '<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				        '</div>';
                    } else {
                        tableStrwCQ +=
							'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + '" name="' + yizhuID + '">' +
					    '<input type="hidden" class="index"/>' +
					    '<a class="mui-navigate-right" href="#">'+
					    '<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     groupStrCommon +
					     '<div class="orderIline2">' +
					     '<span class="f-left">' + (o.GEIYAOFSMC || '') +'</span>' +
					     '<span class="f-right">' + (o.PINCI) + '</span>' +
//							    '<span class="f-right">' +
//							        '(<span class="currCount">' + currCntShow + '</span>' +
//							        '/' +
//							        '<span class="allCount">' + allCntShow + '</span>)' +
//							    '</span>' +
					    '</div>' +
					    '<div class="orderIline2"><span>打印时间：' + nowdate +'</span></div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					    '</div>' +
					    '<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">' + yizhutypeName + '</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow )? '已' : '未') + '执行</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycStatue + '" name="btnyic">' +
					        '<span class="Rline-text">异常</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycCancelStatue + '" name="btncancleyic">' +
					        '<span class="Rline-text">取消异常</span>' +
					    '</div>' +
					    '</div>' +
					    '</a>'+
					    '<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				        '</div>';
                    }
                }
                //其他医嘱(yizhuLX == "QT")
                if (o.CHANGQILS == "QT") {
                    currCnt4 = jiluList.filter(function (a) {
                        return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == "3" && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd')
                    }).length;

                    var currCntShow = currCnt4,
						allCntShow = (o.FEQUENCYTIMES || 1);
                    ifFinished = (currCntShow >= allCntShow) ? "finished" : "nofinished";

                    if (ifFinished == "finished") {
                        tableStryQT +=
							'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + '" name="' + yizhuID + '">' +
					    '<input type="hidden" class="index"/>' +
					    '<a class="mui-navigate-right" href="#">'+
					    '<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     groupStrCommon +
					     '<div class="orderIline2">' +
					     '<span class="f-left">' + (o.GEIYAOFSMC || '') +'</span>' +
					     '<span class="f-right">' + (o.PINCI) + '</span>' +
//							    '<span class="f-right">' +
//							        '(<span class="currCount">' + currCntShow + '</span>' +
//							        '/' +
//							        '<span class="allCount">' + allCntShow + '</span>)' +
//							    '</span>' +
					    '</div>' +
					    '<div class="orderIline2"><span>打印时间：' + nowdate +'</span></div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					    '</div>' +
					    '<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">' + yizhutypeName + '</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
                        '<div class="orderRline orderRbtn ' + ycStatue + '" name="btnyic">' +
					        '<span class="Rline-text">异常</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycCancelStatue + '" name="btncancleyic">' +
					        '<span class="Rline-text">取消异常</span>' +
					    '</div>' +
					    '</div>' +
					    '</a>'+
					    '<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				        '</div>';
                    } else {
                        tableStrwQT +=
							'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + '" name="' + yizhuID + '">' +
					    '<input type="hidden" class="index"/>' +
					    '<a class="mui-navigate-right" href="#">'+
					    '<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     groupStrCommon +
					     '<div class="orderIline2">' +
					     '<span class="f-left">' + (o.GEIYAOFSMC || '') +'</span>' +
					     '<span class="f-right">' + (o.PINCI) + '</span>' +
//							    '<span class="f-right">' +
//							        '(<span class="currCount">' + currCntShow + '</span>' +
//							        '/' +
//							        '<span class="allCount">' + allCntShow + '</span>)' +
//							    '</span>' +
					    '</div>' +
					    '<div class="orderIline2"><span>打印时间：' + nowdate +'</span></div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					    '</div>' +
					    '<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">' + yizhutypeName + '</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
					     '<div class="orderRline orderRbtn ' + ycStatue + '" name="btnyic">' +
					        '<span class="Rline-text">异常</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycCancelStatue + '" name="btncancleyic">' +
					        '<span class="Rline-text">取消异常</span>' +
					    '</div>' +
					    '</div>' +
					    '</a>'+
					    '<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				        '</div>';
							
                    }
                }

                
            }
//		    doTimes += currCntShow;
//		    allTimes += allCntShow;
		}
//		index++;
   }
   tableStrw = tableStrwLS + tableStrwCQ + tableStrwQT;
   tableStry = tableStryLS + tableStryCQ + tableStryQT;
   tableStr = tableStrw + tableStry;
   return tableStr;
}

//过敏试验
function showDatabox2(list,list2,list3,list4,yztype, nowdate){
	currentList = list;
	jiluList = list2;
	ycjiluList = list3;
	pishiList = list4;
	
	var tableStr = "",
	    tableStry = "",
	    tableStryLS = "",
	    tableStryCQ = "",
	    tableStryQT = "",
	    tableStrwLS = "",
	    tableStrwCQ = "",
	    tableStrwQT = "",
	    tableStrw = "";
	var index = 0, allTimes = 0, doTimes = 0;
	var currDay = new Date(nowdate).getDay() == 0 ? 7 : new Date(nowdate).getDay();
	var chenzhuArr = [];
    var chenzhui = 0;
    var currCnt1 = 0, currCnt2=0 , currCnt3=0 , currCnt4=0;
    var ycStatue = "";
    var ycCancelStatue = "";
    
	for (var index = 0; index < currentList.length; index++) {
        var o = currentList[index];
		var groupLength = 0;
		
        
	    if ( o.CHANGQILS == "LS" ||
		    (!((o.NOTE || '').indexOf('NEXT') > -1 && o.KAIDANSJ.substring(0, 10) === new Date(nowdate).format('yyyy-MM-dd')) &&
			!(o.INWEEK == 1 && (o.NOTE || '').indexOf(currDay) == -1) && o.CHANGQILS == "CQ")) {
			        	
			var currCnt = jiluList.filter(function(a){
				return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == '3' && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd')
			}).length;
			var currCntShow = currCnt,
				allCntShow = (o.FEQUENCYTIMES||1);
			var ifFinished = (currCntShow >= allCntShow) ? "finished" : "nofinished";
			var groupLength = 0;        
            var groupArr = [];
            var zxjlStrCommon = "";
            var flag = 0;
            var Aflag =1;
            var yizhuLX = "yizhulx-" + o.CHANGQILS;
            var yizhuID = o.YIZHUID;
            var yizhutype = yztype; 
            var pishiResult = "未皮试";
            //最后一个值
        if(index == currentList.length-1){
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
//                      index = index + 1;
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
                if(o.YIZHUSM == null){
            	   yizhusm = "display-none";
                }
                //医嘱状态'已停止','2','作废','3','在执行','0','执行完','0','新开','4','已校对','0','已发送','6'
                var tzStatue = "display-none";
                var tzStatueTxt = "";
//              if(o.YIZHUZT == '0'){
//              	tzStatue = "display-block";
//              	tzStatueTxt = "在执行";
//              }
                if(o.YIZHUZT == '2'){
                	tzStatue = "display-block";
                	tzStatueTxt = "已停嘱";
                }
                if(o.YIZHUZT == '3'){
                	tzStatue = "display-block";
                	tzStatueTxt = "已作废";
                }
			//执行记录部分	
				var	zhixingList = jiluList.filter(function(a){
            	return a.YIZHUID == o.YIZHUID && (new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd'))
           });
           zhixingList.sort(function(a,b){
            	return b.ZXIXINGSJ - a.ZXIXINGSJ
            });
            zhixingList.sort(function(a,b){
            	return b.ZHIXINGLX - a.ZHIXINGLX
            });
            zhixingList.sort(function(a,b){
            	return b.STOPAUSEBZ - a.STOPAUSEBZ
            });
           var zxgroupList = groupBy(zhixingList, function(item){
                return [item.YIZHUCODE];
           });
           
            for(var i=0; i<zxgroupList.length; i++){
            	zxjlStrCommon += '<div class="zxjl-content">';
            	for(var j=0; j<zxgroupList[i].length; j++){
            		if(zxgroupList[i][j].ZHIXINGLX == '1'){
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">摆药：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>'
            	    }
            	    if(zxgroupList[i][j].ZHIXINGLX == '2'){
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">配药：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>'
            	    }
            	    if(zxgroupList[i][j].ZHIXINGLX == '3'){
//          		    if(zxgroupList[i][j].STOPPAUSEBZ == '0' ||  zxgroupList[i][j].STOPPAUSEBZ == ''){
            	        	
//          	        }
            	        if(zxgroupList[i][j].STOPPAUSEBZ == '1'){
            	        	zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">暂停：</span><span class="f-left">'+ zxgroupList[i][j].STOPPAUSEXM +'/'+ zxgroupList[i][j].STOPPAUSEDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].STOPPAUSESJ) +'</span></div>';
            	        }
            		    if(zxgroupList[i][j].STOPPAUSEBZ == '2'){
            	        	zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">停止：</span><span class="f-left">'+ zxgroupList[i][j].STOPPAUSEXM +'/'+ zxgroupList[i][j].STOPPAUSEDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].STOPPAUSESJ) +'</span></div>';
            	        }
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">执行：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>';
            	    }
            	    if(zxgroupList[i][j].ZHIXINGLX == '4'){
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">异常：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span>&nbsp;&nbsp;&nbsp;&nbsp;('+ zxgroupList[i][j].ZHIXINGNR +')<span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>';
            	    }
            	}
            	zxjlStrCommon +='</div>';
            }
			if(zxjlStrCommon == ""){
                	zxjlStrCommon ='<div class="zxjl-content" style="font-size:14px;">暂无执行记录</div>';
            }	
				var chengzuID = o;
                var groupStrCommon = "",
					groupStrRight = "",
					groupDiv = "";
					        
					if (groupLength > 0) {
                        roupDiv = "groupDiv";
                        for (var i = 1; i < groupArr.length; i++) {
                            groupStrCommon +=
							'<div class="orderIline1">' +
							    '<input type="hidden" class="' + currentList[groupArr[i]].YIZHUID + '" value="' + currentList[groupArr[i]].YIZHUID + '"/>' +
							    '<div>' +
							        currentList[groupArr[i]].YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' +
							        (currentList[groupArr[i]].YICIJL + currentList[groupArr[i]].YICIJLDW) +
							    '</div>' +
							'</div>';
                        }
                    }
				var yclength = 0;
			    for(var y = 0; y < ycjiluList.length; y++){
			    	if(ycjiluList[y].YIZHUID == o.YIZHUID){
			    		yclength = 1;
			    		break;
			    	}
			    }
			    //取消异常
			    if(yclength == 1){
			    	ycStatue = "";
			    	ycCancelStatue = "display-none";
			    }else{
			    	ycStatue = "display-none";
			    	ycCancelStatue = "display-none";
			    }
	        if(ifFinished == "finished"){
	        	for (var i = 0; i < pishiList.length; i++) {
                    var p = pishiList[i];
                    if (p.YIZHUID == o.YIZHUID) {
                     //判断有没有皮试记录，有，在判断皮试状态1皮试中和2皮试完成，若为2，在根据皮试结果进行显示（0阴性、1阳性、2弱阳性、3强阳性）；若无皮试记录，显示未皮试
                        if (p.PSSHIZT == 1) {
                            pishiResult = "皮试中";
                        }
                        if (p.PSSHIZT == 2) {
                            if(p.PISHIJG == "阴性"){
								pishiResult = "";
							}else{
								pishiResult = p.PISHIJG;
							}
                        }
                     }
              }
	            if(o.CHANGQILS == "LS"){
	            	tableStryLS +=
                    '<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
						 groupStrCommon +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2">' +
					    '<span>打印时间：' + nowdate +'</span>' +
					    '<span class="f-right fontred">' +pishiResult +'</span>' +
					    '</div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">过敏试验</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + (currCntShow == 0 ? '未' : '已') + '执行</span>' +
					    '</div>' +
					'</div>' +
					'</a>'+
					    '<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
//				
	            }else if(o.CHANGQILS == "CQ"){
	            	tableStryCQ +=
				'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
							groupStrCommon +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2">' +
					    '<span>打印时间：' + nowdate +'</span>' +
					    '<span class="f-right fontred">' +pishiResult +'</span>' +
					    '</div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">过敏试验</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + (currCntShow == 0 ? '未' : '已') + '执行</span>' +
					    '</div>' +
					'</div>' +
					'</a>'+
					'<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
	            }else{
	            	tableStryQT +=
				'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
							groupStrCommon +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2">' +
					    '<span>打印时间：' + nowdate +'</span>' +
					    '<span class="f-right fontred">' +pishiResult +'</span>' +
					    '</div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">过敏试验</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + (currCntShow == 0 ? '未' : '已') + '执行</span>' +
					    '</div>' +
					'</div>' +
					'</a>'+
					'<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
	            }
				
			}else{
				if(o.CHANGQILS == "LS"){
					tableStrwLS +=
				'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
							groupStrCommon +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2">' +
					    '<span>打印时间：' + nowdate +'</span>' +
					    '<span class="f-right fontred">' +pishiResult +'</span>' +
					    '</div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">过敏试验</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + (currCntShow == 0 ? '未' : '已') + '执行</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycStatue + '" name="btnyic">' +
					        '<span class="Rline-text">异常登记</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycCancelStatue + '" name="btncancleyic">' +
					        '<span class="Rline-text">取消异常</span>' +
					    '</div>' +
					'</div>' +
					'</a>'+
					'<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
				}else if(o.CHANGQILS == "CQ"){
					tableStrwCQ +=
				'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
							groupStrCommon +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2">' +
					    '<span>打印时间：' + nowdate +'</span>' +
					    '<span class="f-right fontred">' +pishiResult +'</span>' +
					    '</div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">过敏试验</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + (currCntShow == 0 ? '未' : '已') + '执行</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycStatue + '" name="btnyic">' +
					        '<span class="Rline-text">异常登记</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycCancelStatue + '" name="btncancleyic">' +
					        '<span class="Rline-text">取消异常</span>' +
					    '</div>' +
					'</div>' +
					'</a>'+
					'<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
				}else{
					tableStrwQT +=
				'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
							groupStrCommon +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2">' +
					    '<span>打印时间：' + nowdate +'</span>' +
					    '<span class="f-right fontred">' +pishiResult +'</span>' +
					    '</div>' +
					    '<div class="orderIline2 '+ yizhusm +'">医嘱说明：' + o.YIZHUSM + '</div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">过敏试验</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + (currCntShow == 0 ? '未' : '已') + '执行</span>' +
					    '</div>' +
                        '<div class="orderRline orderRbtn ' + ycStatue + '" name="btnyic">' +
					        '<span class="Rline-text">异常登记</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycCancelStatue + '" name="btncancleyic">' +
					        '<span class="Rline-text">取消异常</span>' +
					    '</div>' +
					'</div>' +
					'</a>'+
					'<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
				}
				
			}
//		    doTimes += currCntShow;
//		    allTimes += allCntShow;
           }
		}
   }
   tableStrw = tableStrwLS + tableStrwCQ + tableStrwQT;
   tableStry = tableStryLS + tableStryCQ + tableStryQT;
   tableStr = tableStrw + tableStry;
   return tableStr;
}
//其他
function showDatabox6(list,list2,list3,yztype, nowdate){
	currentList = list;
	jiluList = list2;
	ycjiluList = list3;
	
	var tableStr = "",
	    tableStry = "",
	    tableStryLS = "",
	    tableStryCQ = "",
	    tableStryQT = "",
	    tableStrwLS = "",
	    tableStrwCQ = "",
	    tableStrwQT = "",
	    tableStrw = "";
	var index = 0, allTimes = 0, doTimes = 0;
	var currDay = new Date(nowdate).getDay() == 0 ? 7 : new Date(nowdate).getDay();
	var chenzhuArr = [];
    var chenzhui = 0;
    
    var ycStatue = "";
    var ycCancelStatue = "";
    
	for (var index = 0; index < currentList.length; index++) {
        var o = currentList[index];
		var groupLength = 0;
		
	    if ((new Date(o.KAISHISJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd') && o.CHANGQILS == "LS") ||
		    (!((o.NOTE || '').indexOf('NEXT') > -1 && o.KAIDANSJ.substring(0, 10) === new Date(nowdate).format('yyyy-MM-dd')) &&
			!(o.INWEEK == 1 && (o.NOTE || '').indexOf(currDay) == -1) && o.CHANGQILS == "CQ")) {
			        	
			var currCnt = jiluList.filter(function(a){
				return a.YIZHUID == o.YIZHUID && a.ZHIXINGLX == '3' && new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd')
			}).length;
			var currCntShow = currCnt,
				allCntShow = (o.FEQUENCYTIMES||1);
			var ifFinished = (currCntShow >= allCntShow) ? "finished" : "nofinished";
            var yizhuLX = "yizhulx-" + o.CHANGQILS;
            var yizhuID = o.YIZHUID;
            var yizhutype = yztype;   
            var groupLength = 0;        
            var groupArr = [];
            var zxjlStrCommon = "";
            var flag = 0;
            var Aflag =1;
//          console.log("o.YIZHUTYPE-" + o.YIZHUTYPE);
//          console.log("ifFinished->" + ifFinished);
            //最后一个值
        if(index == currentList.length-1){
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
//                      index = index + 1;
                        flag = 1;
                        break;
                    }
                }
                if (flag == 1) {
                    Aflag = 1;
                    break;
                }
                if (o.YIZHUID == currentList[j].YIZHUID) {
//              	console.log("YIZHUID 成组药->" + o.YIZHUID);
                    groupLength++;
                    groupArr[groupLength] = j;
                    chenzhuArr[chenzhui] = j;
                    chenzhui++;
                    console.log("j->" + j);
//                  console.log("chenzhui 全->" + chenzhui);
                }
            }
			if (Aflag != 1) {
				//医嘱状态'已停止','2','作废','3','在执行','0','执行完','0','新开','4','已校对','0','已发送','6'
                var tzStatue = "display-none";
                var tzStatueTxt = "";
//              if(o.YIZHUZT == '0'){
//              	tzStatue = "display-block";
//              	tzStatueTxt = "在执行";
//              }
                if(o.YIZHUZT == '2'){
                	tzStatue = "display-block";
                	tzStatueTxt = "已停嘱";
                }
                if(o.YIZHUZT == '3'){
                	tzStatue = "display-block";
                	tzStatueTxt = "已作废";
                }
				//执行记录部分	
				var	zhixingList = jiluList.filter(function(a){
            	return a.YIZHUID == o.YIZHUID && (new Date(a.KSSJ).format('yyyy-MM-dd') == new Date(nowdate).format('yyyy-MM-dd'))
           });
            zhixingList.sort(function(a,b){
            	return b.ZHIXINGLX - a.ZHIXINGLX
            });
            zhixingList.sort(function(a,b){
            	return b.STOPAUSEBZ - a.STOPAUSEBZ
            });
           var zxgroupList = groupBy(zhixingList, function(item){
                return [item.YIZHUCODE];
           });
           
            for(var i=0; i<zxgroupList.length; i++){
            	zxjlStrCommon += '<div class="zxjl-content">';
            	for(var j=0; j<zxgroupList[i].length; j++){
            		if(zxgroupList[i][j].ZHIXINGLX == '1'){
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">摆药：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>'
            	    }
            	    if(zxgroupList[i][j].ZHIXINGLX == '2'){
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">配药：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>'
            	    }
            	    if(zxgroupList[i][j].ZHIXINGLX == '3'){
//          		    if(zxgroupList[i][j].STOPPAUSEBZ == '0' ||  zxgroupList[i][j].STOPPAUSEBZ == ''){
            	        	
//          	        }
            	        if(zxgroupList[i][j].STOPPAUSEBZ == '1'){
            	        	zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">暂停：</span><span class="f-left">'+ zxgroupList[i][j].STOPPAUSEXM +'/'+ zxgroupList[i][j].STOPPAUSEDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].STOPPAUSESJ) +'</span></div>';
            	        }
            		    if(zxgroupList[i][j].STOPPAUSEBZ == '2'){
            	        	zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">停止：</span><span class="f-left">'+ zxgroupList[i][j].STOPPAUSEXM +'/'+ zxgroupList[i][j].STOPPAUSEDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].STOPPAUSESJ) +'</span></div>';
            	        }
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">执行：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>';
            	    }
            	    if(zxgroupList[i][j].ZHIXINGLX == '4'){
            		    zxjlStrCommon +='<div class="zxjl-div"><span class="f-left">异常：</span><span class="f-left">'+ zxgroupList[i][j].YONGHUXM +'/'+ zxgroupList[i][j].YONGHUDM +'</span><span class="f-right">'+ changeDateFormat(zxgroupList[i][j].ZXIXINGSJ) +'</span></div>';
            	    }
            	}
            	zxjlStrCommon +='</div>';
            }
            if(zxjlStrCommon == ""){
                	zxjlStrCommon ='<div class="zxjl-content" style="font-size:14px;">暂无执行记录</div>';
                }
//				var chengzuID = o;
                var groupStrCommon = "",
					groupStrRight = "",
					groupDiv = "";
					        
					if (groupLength > 0) {
                        roupDiv = "groupDiv";
                        for (var i = 1; i < groupArr.length; i++) {
//                      	console.log("0=" + groupArr.length);
//                          console.log("=" + groupArr[i]);
//                          console.log("=" + currentList[groupArr[i]].YIZHUID);
                            groupStrCommon +=
//							'<div class="' + groupDiv + '">' +
							'<div class="orderIline1">' +
							    '<input type="hidden" class="' + currentList[groupArr[i]].YIZHUID + '" value="' + currentList[groupArr[i]].YIZHUID + '"/>' +
							    '<div>' +
							        currentList[groupArr[i]].YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' +
							        (currentList[groupArr[i]].YICIJL + currentList[groupArr[i]].YICIJLDW) +
							    '</div>' +
							'</div>';
                        }
                    }
                var yclength = 0;
			    for(var y=0; y<ycjiluList.length ; y++){
			    	if(ycjiluList[y].YIZHUID == o.YIZHUID){
			    		yclength = 1;
			    		break;
			    	}
			    }
			    //取消异常
			    if(yclength == 1){
			    	ycStatue = "";
			    	ycCancelStatue = "display-none";
			    }else{
			    	ycStatue = "display-none";
			    	ycCancelStatue = "display-none";
			    }
			    
	        if(ifFinished == "finished"){
	            if(o.CHANGQILS == "LS"){
	            	tableStryLS +=
				'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '其他&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2">打印时间：<span>' + nowdate +'</span></div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">其他</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
//					    '<div class="orderRline orderRbtn">' +
//					        '<span class="Rline-text">异常</span>' +
//					    '</div>' +
					'</div>' +
					'</a>'+
					'<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
	            }else if(o.CHANGQILS == "CQ"){
	            	tableStryCQ +=
				'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '其他&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2"><span>' + nowdate +'</span></div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">其他</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
					'</div>' +
					'</a>'+
					'<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
	            }else{
	            	tableStryQT +=
				'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '其他&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2">打印时间：<span>' + nowdate +'</span></div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">其他</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
					'</div>' +
					'</a>'+
					'<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
	            }
				
			}else{
//				console.log("qiya->>" + o.CHANGQILS);
				if(o.CHANGQILS == "LS"){
					tableStrwLS +=
				'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '其他&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2">打印时间：<span>' + nowdate +'</span></div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">其他</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycStatue + '" name="btnyic">' +
					        '<span class="Rline-text">异常登记</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycCancelStatue + '" name="btncancleyic">' +
					        '<span class="Rline-text">取消异常</span>' +
					    '</div>' +
					'</div>' +
					'</a>'+
					'<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
				}else if(o.CHANGQILS == "CQ"){
					tableStrwCQ +=
				'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '其他&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2">打印时间：<span>' + nowdate +'</span></div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">其他</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycStatue + '" name="btnyic">' +
					        '<span class="Rline-text">异常登记</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycCancelStatue + '" name="btncancleyic">' +
					        '<span class="Rline-text">取消异常</span>' +
					    '</div>' +
					'</div>' +
					'</a>'+
					'<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
				}else{
					tableStrwQT +=
				'<div class="mui-table-view-cell mui-collapse orderlist ' + index + ' ' + yizhuID + ' ' + yizhuLX + ' " name="' + yizhuID + '">' +
					'<a class="mui-navigate-right" href="#">'+
					'<input type="hidden" class="index"/>' +
					'<div class="orderInfo">' +
					    '<div class="orderIline1">' +o.YAOPINMC + '&nbsp&nbsp&nbsp&nbsp' + o.YICIJL + o.YICIJLDW + '</div>' +
					     '<div class="orderIline2">' +
					    (o.GEIYAOFSMC ? (o.GEIYAOFSMC + '其他&nbsp;&nbsp;&nbsp;&nbsp;') : '') +
//					    '<span class="currCount">' + currCntShow + '</span>' +
//					    '/' +
//					    '<span class="allCount">' + allCntShow + '</span>' +
					    '<span class="f-right">' +
					    (o.PINCI) +
					    '</span>' +
					    '</div>' +
					    '<div class="orderIline2">打印时间：<span>' + nowdate +'</span></div>' +
					'</div>' +
					'<div class="orderRight">' +
					    '<div class="orderRline ' + yizhutype + '">' +
					        '<span class="Rline-text">其他</span>' +
					    '</div>' +
					    '<div class="orderRline ' + tzStatue + '">' +
					        '<span class="Rline-text">'+ tzStatueTxt +'</span>' +
					    '</div>' +
					    '<div class="orderRline ' + ifFinished + '">' +
					        '<span class="Rline-text">' + ((currCntShow >= allCntShow) ? '已' : '未') + '执行</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycStatue + '" name="btnyic">' +
					        '<span class="Rline-text">异常登记</span>' +
					    '</div>' +
					    '<div class="orderRline orderRbtn ' + ycCancelStatue + '" name="btncancleyic">' +
					        '<span class="Rline-text">取消异常</span>' +
					    '</div>' +
					'</div>' +
					'</a>'+
					'<div class="mui-collapse-content">'+ zxjlStrCommon +'</div>'+
				'</div>';
				}
				
			}
//		    doTimes += currCntShow;
//		    allTimes += allCntShow;
           }
		}
   }
   tableStrw = tableStrwLS + tableStrwCQ + tableStrwQT;
   tableStry = tableStryLS + tableStryCQ + tableStryQT;
   tableStr = tableStrw + tableStry;
   return tableStr;
}

function showData(list, list2, list3, list4,type, yizhutype, nowdate){//
//	currentList = list.filter(function(a){
//		return type == 'all' || type == a.CHANGQILS
//	});
    
    if(type != "all" || yizhutype != "all"){
    	if(type == "all" ){
    		currentList = list.filter(function(a){
    			return a.YIZHUTYPE == yizhutype
    		});
    	}else if(yizhutype == "all"){
    		currentList = list.filter(function(a){
    			return a.CHANGQILS == type
    		});
    	}else{
    		currentList = list.filter(function(a){
    			return a.CHANGQILS == type
    		}).filter(function(b){
    			return b.YIZHUTYPE == yizhutype
    		});
    	}
    }else{
    	currentList = list;
    }
	jiluList = list2;
	ycjiluList = list3;
	pishiList = list4;
	hlzxList = currentList.filter(function(a){
		return a.YIZHUTYPE == "护理执行"
	});
	jmzsList = currentList.filter(function(a){
		return a.YIZHUTYPE == "静脉注射"
	});
	jmsyList = currentList.filter(function(a){
		return a.YIZHUTYPE == "静脉输液"
	});
	pxzsList = currentList.filter(function(a){
		return a.YIZHUTYPE == "皮下注射"
	});
	gmsyList = currentList.filter(function(a){
		return a.YIZHUTYPE == "过敏试验"
	});
	qtList = currentList.filter(function(a){
		return a.YIZHUTYPE == "其他"
	});
	var tableHlzx = showDatabox1(hlzxList, jiluList, ycjiluList, "type-hlzx", "护理执行", nowdate);
	var tableJmzs = showDatabox1(jmzsList, jiluList, ycjiluList, "type-jmzs", "静注肌注", nowdate);
	var tableJmsy = showDatabox1(jmsyList, jiluList, ycjiluList, "type-jmsy", "静脉输液", nowdate);
	var tablePxzs = showDatabox1(pxzsList, jiluList, ycjiluList, "type-pxzs", "皮下注射", nowdate);
	var tableGmsy = showDatabox2(gmsyList, jiluList, ycjiluList, pishiList, "type-gmsy", nowdate);
	var tableQt = showDatabox6(qtList, jiluList, ycjiluList, "type-qt", nowdate);
            tableOrder = tableHlzx + tableJmzs + tableJmsy + tablePxzs + tableGmsy + tableQt;
            document.getElementById("yizhuListView").innerHTML = tableOrder === '' ? '<div class="no-data">暂无数据</div>' : tableOrder;
//          scrolltoOrder();
}
//数组分类方法
//Array.prototype.groupBy = function (keyName) {
//  var result = {};
//  this.forEach(function (item) {
//      if (!result[item[keyName]])
//          result[item[keyName]] = new Array();
//      result[item[keyName]].push(item);
//  });
//  return result;
//}
function groupBy( array , f ) {
    var groups = {};
    array.forEach( function( o ) {
        var  group = JSON.stringify( f(o) );
        groups[group] = groups[group] || [];
        groups[group].push( o );
    });
    return Object.keys(groups).map( function( group ) {
        return groups[group];
    });
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