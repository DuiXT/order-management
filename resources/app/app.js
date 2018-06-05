var app = angular.module('orderManagement', ['ui.router','toastr'])
app.config(function ($stateProvider,$urlRouterProvider,$locationProvider,$httpProvider,toastrConfig){
    angular.extend(toastrConfig, {
        autoDismiss: false,
        containerId: 'toast-container',
        maxOpened: 0,
        newestOnTop: true,
        positionClass: 'toast-top-center',
        preventDuplicates: false,
        preventOpenDuplicates: false,
        target: 'body',
        timeOut: 1500,
    });
    var defaultRoute;
//设置默认路由
    function listfo()
    {
        $.ajax({
            type: "GET",
            url: "/userRule/rule",
            async:false,
        success:function (res) {
            console.log(res)
            if(res.jsonUser.success&&res.jsonUser.executed){
                for(var i=0;i<res.jsonUser.admin.leafs.length;i++ ){
                    if(res.jsonUser.admin.leafs[i].parentCode){
                        defaultRoute=res.jsonUser.admin.leafs[i].url;
                        break;
                    }
                }
            }else {
                alert(res.data.jsonUser.message);
                console.log(res.data.jsonUser.message)
            }
        }, error:function () {
            console.log("请求失败！")
        }})
    }
    listfo();

    $urlRouterProvider.otherwise('/'+defaultRoute);
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    $stateProvider.
    state('orderList',{
        url: '/orderList',
        templateUrl:'../pages/orderList.html',
        params:{'page':{},'index':{}}
    }).
    state('creditAuditList',{
        url: '/creditAuditList',
        templateUrl:'../pages/creditAuditList.html',
        params:{'page':{},'index':{}}
    }).
    state('photosAuditList',{
        url: '/photosAuditList',
        templateUrl:'../pages/photosAuditList.html',
        params:{'page':{},'index':{}}
    }).
    state('repaymentList',{
        url: '/repaymentList',
        templateUrl:'../pages/repaymentList.html',
        params:{'bizid':{},'page':{},'index':{}}
    }).
    state('overdueList',{
        url: '/overdueList',
        templateUrl:'../pages/overdueList.html',
        params:{'page':{},'index':{}}
    }).
    state('orderDetails',{
        url: '/orderDetails',
        templateUrl:'../pages/orderDetails.html',
        params:{'bizid':{},'type':{},'state':{},'userPhone':{},'userCode':{},'orderCode':{},'page':{},'index':{},'riskContAuth':{},'isAuth':{}}
    }).
    state('auditDetails',{
        url: '/auditDetails/?targetId',
        templateUrl:'../pages/auditDetails.html',
        params:{'bizid':{},'type':{},'userName':{},'userPhone':{},'userCode':{},'state':{},'orderCode':{},'page':{},'index':{},'isAuth':{}}
    }).
    state('photosAuditDetails',{
        url: '/photosAuditDetails',
        templateUrl:'../pages/photosAuditDetails.html',
        params:{'bizid':{},'type':{},'state':{},'userCode':{},'page':{},'index':{},'orderCode':{}}
    }).
    state('repayDetails',{
        url: '/repayDetails',
        templateUrl:'../pages/repayDetails.html',
        params:{'bizid':{},'page':{},'index':{},'userCode':{},'orderCode':{},}
    }).
    state('overdueDetails',{
        url: '/overdueDetails',
        templateUrl:'../pages/overdueDetails.html',
        params:{'bizid':{},'type':{},'day':{},'state':{},'userPhone':{},'userCode':{},'orderCode':{},'page':{},'index':{}}
    }).
    state('riskContReprot',{
        url: '/riskContReprot',
        templateUrl:'../pages/riskContReprot.html',
        params:{'userCode':{},'orderCode':{},'authCode':{},'reportEleData':{},'reportYysData':{},'listNames':{},'isAuth':{}}
    }).
    state('main',{
        url: '/main',
        templateUrl:'../pages/main.html'
    }).
    state('repaymentConfig',{
        url:'/repaymentConfig',
        templateUrl:'../pages/repaymentConfig.html'
    }).
    state('preliminaryList',{
        url:'/preliminaryList',
        templateUrl:'../pages/preliminaryList.html',
        params:{'page':{},'index':{}}
    }).
    state('preliminaryDetails',{
        url:'/preliminaryDetails',
        templateUrl:'../pages/preliminaryDetails.html',
        params:{'page':{},'index':{}}
    }).
    state('merchantOrderQueryList',{
        url: '/merchantOrderQueryList',
        templateUrl:'../pages/merchantOrderQueryList.html',
    })
})

app.filter('textLengthSet', function() {
    return function(value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');//'...'可以换成其它文字
    };
})
// 隐藏手机号中间四位
app.filter('starHide',function () {
    return function (input) {
        if (!input||input=='-') return '-';
        return input.substring(0,3)+"*****"+input.substring(8,11)
    }
});



app.value('uploadUrl',{'url':'http://fileserver.api.aishangjinrong.com'});

app.service('sessionService', sessionService);
function sessionService($window) {

    return {
        set: set,
        get: get,
        setObject: setObject,
        getObject: getObject,
        remove: remove,
        clear: clear
    };

    function set(key, value) {
        $window.sessionStorage[key] = value;
    }

    function get(key) {
        return $window.sessionStorage[key] || '';
    }

    function setObject(key, value) {
        $window.sessionStorage[key] = JSON.stringify(value);
    }

    function getObject(key) {
        return JSON.parse($window.sessionStorage[key] || '{}');
    }

    function remove(key) {
        $window.sessionStorage.removeItem[key];
    }

    function clear() {
        $window.sessionStorage.clear();
    }

}



app.run(["$rootScope",gorun]);
function gorun($rootScope){

    /*alert弹框*/
    $rootScope.alertPart=function(o){
        $rootScope.alertlog=o
        $rootScope.showAlert()
    }
    $rootScope.showAlert=function (){
        $("#mask").show()
        $("#alertlog").show()
    }

    $rootScope.hideAlert=function(){
        $("#mask").hide();
        $("#alertlog").hide();
    }


}

