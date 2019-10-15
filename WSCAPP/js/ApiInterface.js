var Api = function () { };
//async true=异步  false=同步  默认同步
Api.DELETE = function (url, param, async) {
    if (async == undefined) {
        async = false;
    }
    if (async) {
        return Api.async("DELETE", url, param);
    } else {
        return Api.synch("DELETE", url, param);
    }
};
Api.GET = function (url, param, async) {
    if (async == undefined) {
        async = false;
    }
    if (async) {
        return Api.async("GET", url, param);
    } else {
        return Api.synch("GET", url, param);
    }
  
};
Api.POST = function (url, param, async) {
    if (async == undefined) {
        async = false;
    }
    if (async) {
        return Api.async("POST", url, param);
    } else {
        return Api.synch("POST", url, param);
    }
};
Api.PUT = function (url, param, async) {
    if (async == undefined) {
        async = false;
    }
    if (async) {
        return Api.async("PUT", url, param);
    } else {
        return Api.synch("PUT", url, param);
    }
};
//异步调用AJAX
Api.async = function (type, url, param) {
	url="http://localhost:9081/"+url;
   // var ip = $.cookie('Ticket');
//     if (ip == undefined) {
//         swal("错误", "系统内部错误,请重新登录", "error");
//         return false;
//     }
    var res = "";
  //  Loading();
    var defer = $.Deferred();
    $.ajax({
        cache: true,
        type: type,
        url: url,
        data: param,
        dataType: "json",
//         beforeSend: function (XHR) {
//             //发送ajax请求之前向http的head里面加入验证信息
//             XHR.setRequestHeader('Authorization', 'BasicAuth ' + $.cookie('Ticket'));
//         },
        error: function (request) {
            res = {
                code: "-1",
                message: "连接错误"
            };
        },
        success: function (data) {
            defer.resolve(data);
        }
    });
    return defer.promise();

}
//同步调用AjAX
Api.synch = function (type, url, param) {
	url="http://localhost:9081/"+url;
//     var ip = $.cookie('Ticket');
//     if (ip == undefined) {
//         swal("错误", "系统内部错误,请重新登录", "error");
//         return false;
//     }
    var res = "";
    $.ajax({
        cache: true,
        type: type,
        url: url,
        data: param,
        dataType: "json",
        async: false, //同步执行
//         beforeSend: function(XHR) {
//             //发送ajax请求之前向http的head里面加入验证信息
//             XHR.setRequestHeader('Authorization', 'BasicAuth ' + $.cookie('Ticket'));
//         },
        error: function(request) {
            res = {
                code: "-1",
                message: "连接错误"
            };
        },
        success: function(data) {
            res = data;

        }
    });
    return res;
};

Api.login = function (param) {
	url=url = "http://localhost:9081/api/Login";
    var res = "";
    $.ajax({
        cache: true,
        type: "POST",
        url: url,
        data: param,
        dataType: "json",
        async: false, //同步执行
        error: function(request) {
            res = {
                code: "-1",
                message: request.message
            };
        },
        success: function(data) {
            res = data;
        }
    });
    return res;
};