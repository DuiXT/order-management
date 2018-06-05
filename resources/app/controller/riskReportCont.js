/**
 * Created by Administrator on 2017/11/17.
 */
app.controller("riskReportCont",function ($scope,sessionService,$rootScope,$http) {

    $scope.riskParams=sessionService.getObject('riskParams');
    console.log($scope.riskParams)
    $scope.eleData=$scope.riskParams.reportEleData!==""&&typeof $scope.riskParams.reportEleData==="string"?JSON.parse($scope.riskParams.reportEleData):$scope.riskParams.reportEleData;
    $scope.reportYysData=$scope.riskParams.reportYysData!==""&&typeof $scope.riskParams.reportYysData==="string"?JSON.parse($scope.riskParams.reportYysData):$scope.riskParams.reportYysData;
    console.log($scope.eleData);
    $scope.listName=$scope.riskParams.listNames;
    $scope.isAuth=$scope.riskParams.isAuth;
    // 判断运营商数据是否授权
    if($scope.isAuth==0){
        $scope.isAuth=false;
    }else {
        $scope.isAuth=true;
    }
    if($scope.listName=='订单'){
        $scope.riskUrl1='orderList';
        $scope.riskUrl2='orderDetails';
    }else {
        $scope.riskUrl1='creditAuditList';
        $scope.riskUrl2='auditDetails';
    }

    if(judgeEmpty($scope.eleData)){
        if($scope.eleData.carrierOperatorReturnIdcertImg){//判断返照是否存在
            $scope.backImg=true;
        }else {
            $scope.backImg=false;
        };
        if($scope.eleData.tdBlackListInfo){
            // 同盾黑名单
            if(judgeEmpty(JSON.parse($scope.eleData.tdBlackListInfo))){
                $scope.blackList=JSON.parse($scope.eleData.tdBlackListInfo);
                $scope.blackListScore=0;
                $scope.blackListTxt='';
                angular.forEach($scope.blackList,function (item) {
                    $scope.blackListScore+=parseInt(item.score);
                    $scope.blackListTxt+='命中规则：'+item.name+' score:'+item.score+' 风险状态：'+item.decision+',';
                });
            }else {
                $scope.blackListScore=0;
                $scope.blackListTxt='暂无数据'
            }
        }
    }else {
        $scope.backImg=false;
        $scope.blackListScore=0;
        $scope.blackListTxt='暂无数据'
    }

    $scope.back=function () {
        window.close()
    }


    // 判断json对象是否全部为空
    function judgeEmpty(json) {
        var sum=0;
        for(key in json){
            if(!json[key]){
                sum+=sum;
            }else {
                sum+=1;
            }
        };
        return sum;
    };

    // 显示返照
    var viewer1 = new Viewer(document.getElementById('backPhoto'), {
        url: 'data-original'
    });

    // 获取运营商数据
    $scope.getYysData=function () {
        $http({
            method:"GET",
            url:"/carrier/findByAuthCode/"+$scope.riskParams.userCode+"/"+$scope.riskParams.orderCode+"/query?authCode="+$scope.riskParams.authCode
        }).then(function (res) {
            console.log(res)
            if(res.data.success&&res.data.executed){
                $scope.reportYysData=res.data;
            }else {
                $rootScope.alertPart("正在生成风控报告，请稍后重试！");
                $scope.reportYysData=res.data;
                console.log(res)
            }
        },function (res) {
            console.log(res);
            $rootScope.alertPart("数据请求失败，请稍后重试！")
            $('#carrieroperatorContent').unmask();
        })
    }

    // 如果前一个页面拿不到运营商数据，就再次调接口
    if($scope.reportYysData===""){
        $scope.getYysData();
        $scope.$watch('reportYysData',function (p1, p2, p3) {
            console.log(p1)
            if(JSON.stringify(p1) != "{}"){
                $scope.reportYysData=p1;
                if($scope.reportYysData){
                    $scope.riskPacraMarkDTO=judgeEmpty($scope.reportYysData.riskPacraMarkDTO)===0?false:true;
                }else {
                    $scope.riskPacraMarkDTO=false;
                }
                $('#carrieroperatorContent').unmask();
                $scope.riskParams.reportYysData=$scope.reportYysData;
                sessionService.setObject('riskParams',$scope.riskParams);//异步请求到运营商数据之后存储
            }else {
                $('#carrieroperatorContent').mask('数据加载中...')
            }
        })
    }else {
        // 如果染黑信息全部为空则显示暂无数据
        $scope.riskPacraMarkDTO=judgeEmpty($scope.reportYysData.riskPacraMarkDTO)===0?false:true;
    }
    // 运营商数据--刷新
    $scope.refresh=function () {
        $scope.refreshes=true;
        $('#carrieroperatorContent').mask('数据加载中...')
        $http({
            method:"GET",
            url:"/carrier/findByAuthCode/"+$scope.riskParams.userCode+"/"+$scope.riskParams.orderCode+"/query?authCode="+$scope.riskParams.authCode
        }).then(function (res) {
            console.log(res)
            if(res.data.success&&res.data.executed){
                $('#carrieroperatorContent').unmask();
                $scope.refreshes=false;
                $scope.reportYysData=res.data;
                $scope.riskPacraMarkDTO=judgeEmpty($scope.reportYysData.riskPacraMarkDTO)===0?false:true;
            }else {
                $('#carrieroperatorContent').unmask();
                $rootScope.alertPart("正在生成风控报告，请稍后重试！");
                $scope.reportYysData=res.data;
                $scope.refreshes=false;
                console.log(res)
            }
        },function (res) {
            $scope.refreshes=false;
            console.log(res);
            $('#carrieroperatorContent').unmask();
            $rootScope.alertPart("获取运营商数据失败，请稍后重试！")

        })
    }

    // 前20联系人排序
    $scope.sort20=function(type,item) {
        $scope.edgeSelected=type;
        var DAtype=type.indexOf('A')===-1?'DESC':'ASC';
        if(!$scope.eleData||!$scope.eleData.reportCode){
            $rootScope.alertPart("无法获取风控报告编号，请稍后重试!");
            return
        }
        $http({
            method:"GET",
            url:"/carrier/getContactTwenty/"+$scope.eleData.reportCode+"/query?orderColumn="+item+"&orderMode="+DAtype
        }).then(function (res) {
            if(res.data.executed&&res.data.success){
                $scope.reportYysData.riskTop20Linker=res.data.riskTop20Linker;
            }else {
                $rootScope.alertPart(res.data.message)
            }
        },function (res) {
            console.log(res)
            $rootScope.alertPart("获取数据失败！")
        })

    }
})