/**
 * Created by Administrator on 2017/11/2.
 */
app.directive("customInfo",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/customInfo.html',
        replace: true,
        scope:{
            data:'=',
            btn:'=',
            parentBizid:'@',
            customSures:'&',
            userInfo:'@',
            customDetail:'=',
            btnPre:'=',
            type:'@'
        },
        controller:function($scope,$http,$rootScope,toastr){
            console.log($scope.data)
            //判断客户信息是否存在
            $scope.panel=true;
            if(JSON.stringify($scope.data) == "{}"||$scope.data==null||$scope.data.length==0||$scope.data==undefined||$scope.data==""){
                $scope.panel=false;
            }else{
                var props = 0;
                for(var p in $scope.data){
                    if($scope.data[p]==""||$scope.data[p]==null||$scope.data[p]==undefined||JSON.stringify($scope.data[p]) == "{}"||$scope.data[p].length==0){
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
            //客户信息操作记录
            var userCode=JSON.parse($scope.userInfo).userCode;
            $scope.operRecordData=false;
            $scope.getRecord=function(){
                $http({
                    method: 'GET',
                    url: "/operatorRecord/"+userCode+"/getCustomRecord",
                }).then(function successCallback(response) {
                    console.log(response.data)
                    if(response.data.executed && response.data.success){
                        $scope.resultList=response.data.resultData;
                        if($scope.resultList){
                            if($scope.resultList.length>0){
                                $scope.operRecordData=false;
                            }else {
                                $scope.operRecordData=true;
                            }
                        }else {
                            $scope.operRecordData=true;
                        }
                    }else{
                        toastr.warning(response.data.message)
                        $scope.operRecordData=true;
                    }
                }, function errorCallback(response) {
                    console.log(response);
                    $rootScope.alertPart("获取操作记录失败！")
                });
            }

            // 深度拷贝
            function cloneObj(obj){
                var str, newobj = obj.constructor === Array ? [] : {};
                if(typeof obj !== 'object'){
                    return;
                } else if(window.JSON){
                    str = JSON.stringify(obj), //系列化对象
                        newobj = JSON.parse(str); //还原
                } else {
                    for(var i in obj){
                        newobj[i] = typeof obj[i] === 'object' ?
                            cloneObj(obj[i]) : obj[i];
                    }
                }
                return newobj;
            }
            $scope.cloneData=cloneObj($scope.data)
            console.log($scope.cloneData)

            /*修改客户资料*/
            $scope.RmodifyCustomerInfo=function(){
                $('#R_modifyCustomerInfo-data').modal({backdrop: 'static', keyboard: false});
                $("#R_modifyCustomerInfo-data").modal("show");
                $scope.submittedsttt = false;
                $scope.editCustom.$setPristine();
                $scope.editCustom.$setUntouched();
            }
            /*修改客户点击确定*/
            $scope.customSure=function()
            {
                if ($scope.editCustom.$valid) {
                    var data={}
                    if($scope.type==='preliminary'){
                        data={
                            "familyAddress":$scope.cloneData.familyAddress,
                            "userAddress": $scope.cloneData.userHomeaddress,
                            "userPhone": $scope.cloneData.userPhone,
                            "userValiddaterange": $scope.cloneData.userValiddaterange,
                            "userPhone2": $scope.cloneData.userPhone2
                        };
                    }else {
                        data={
                            "userAddress": $scope.cloneData.userHomeaddress,
                            "userPhone": $scope.cloneData.userPhone,
                            "userPhone2": $scope.cloneData.userPhone2
                        };
                    }

                $http({
                    method:"PUT",
                    url:($scope.type==='preliminary'?"/firsttrial/":"/order/")+$scope.parentBizid+"/updateOrderUserInfo",
                    data:data
                }).then(function (res) {
                    console.log(res)
                    if(res.data.success)
                    {
                        $scope.customSures();
                        $("#R_modifyCustomerInfo-data").modal("hide");
                    }else {
                        toastr.warning(res.data.message)
                    }
                },function (res) {
                    toastr.error("请求失败！")
                })
                }
                else {
                    $scope.submittedsttt = true;
                }

            }


            $scope.closeBiao=function()
            {
                $("#R_modifyCustomerInfo-data").modal("hide");
                $scope.submittedsttt = false;
                $scope.cloneData=cloneObj($scope.data)
               // $(".help-blocks").hide();
                $scope.editCustom.$setPristine();
                $scope.editCustom.$setUntouched();
            }

        },
        link:function (scope,element,attr) {
            //客户信息操作记录
            scope.customerInfoOper=function(){
                $('#customerInfoOper-data').modal({backdrop: 'static', keyboard: false});
                $("#customerInfoOper-data").modal("show");
                scope.getRecord();
            }
            scope.datepickerType='idcardLimit';
            scope.refreshIDcardLimit=function ($event) {
               $("#IDcardLimit").val(scope.cloneData.userValiddaterange)
            }
            //scope.customSure=function()
            //{
            //    var data={
            //        "userAddress": scope.data.userHomeaddress,
            //        "userPhone": scope.data.userPhone
            //    }
            //    scope.customSures({data:data});
            //
            //}

        }
    }
})