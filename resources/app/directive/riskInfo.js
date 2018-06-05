/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("riskInfo",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/riskInfo.html',
        replace: true,
        scope:{
            userInfo:'@',
            reportEleData:'@',
            reportYysData:'@',
            listType:'@',//用来判断是哪个列表进入
            isAuth:'@'
        },
        controller:function($scope,$http,$rootScope,$state,sessionService){
            //将信审进来的运营商数据转化为json
            if($scope.listType!=='orderView'){
                $scope.reportEleData=$scope.reportEleData===""?$scope.reportEleData:JSON.parse($scope.reportEleData);
                $scope.reportYysData=$scope.reportYysData===""?$scope.reportYysData:JSON.parse($scope.reportYysData);
            }
            console.log($scope.reportEleData)
            console.log($scope.reportYysData)
            if($scope.listType=='orderView'){
                $scope.listName='订单';
            }else {
                $scope.listName='信审';
            }
            // //判断风控信息是否存在
            $scope.panel=true;
            if(JSON.stringify($scope.data) == "{}"||$scope.data==null||$scope.data.length==0||$scope.data==undefined||$scope.data==""){
                $scope.panel=false;
            }else{
                var props = 0;
                for(var p in $scope.data){
                    if($scope.data[p]==""||$scope.data[p]==null||$scope.data[p]==undefined||$scope.data[p].length==0||JSON.stringify($scope.data[p]) == "{}"){
                        props=props+0;
                    }else{
                        props=props+1;
                    }
                }
                if(props==0){
                    $scope.panel=false;
                }else{
                    $scope.panel=true;
                }
            }
            // 查看风控报告
            $scope.viewReport=function () {
                if(typeof $scope.userInfo=='string'){
                    $scope.userInfo=JSON.parse($scope.userInfo);
                }
                if($scope.listType=='orderView'){
                    // 基本信息接口
                    $.ajax({
                        type: 'GET',
                        async:false,
                        url: "/carrier/addUserInfo/" + $scope.userInfo.userCode + "/" + $scope.userInfo.orderCode + "/query",
                        success: function (res) {
                            console.log(res);
                            $scope.reportEleData = res.riskBase;
                            if (!res.success ||!res.executed) {
                                $rootScope.alertPart("获取风控报告基本信息失败!")
                            }
                        },
                        error: function (res) {
                            console.log(res)
                        }
                    });
                }
                //下一个页面要用的数据
                $scope.riskParams={
                    userCode:$scope.userInfo.userCode,
                    orderCode:$scope.userInfo.orderCode,
                    authCode:$scope.userInfo.authCode,
                    reportEleData:$scope.reportEleData===undefined?"":$scope.reportEleData,
                    reportYysData:$scope.reportYysData===undefined?"":$scope.reportYysData,
                    listNames:$scope.listName,
                    isAuth:$scope.isAuth
                };
                sessionService.setObject("riskParams",$scope.riskParams);

                window.open($state.href('riskContReprot'),'_blank')
            }
        }
    }
})