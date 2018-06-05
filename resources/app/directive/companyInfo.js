/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("companyInfo",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/companyInfo.html',
        replace: true,
        scope:{
            data:'=',
            btn:'=',
            puserCode:'@',
            userInfo:'@',
            customSures:'&',
        },
        link:function (scope,element,attr) {
            //单位信息操作记录
            scope.unitInfoOper=function(){
                $('#unitInfoOper-data').modal({backdrop: 'static', keyboard: false});
                $("#unitInfoOper-data").modal("show");
                scope.getRecord();
            }

        },
        controller:function($scope,$http){
            //判断单位信息是否存在
            $scope.panel=true;
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

            //单位信息操作记录
            $scope.getRecord=function(){
                $scope.user=JSON.parse($scope.userInfo);
                $scope.operRecordData=false;
                var userCode=$scope.user.userCode;
                $http({
                    method: 'GET',
                    url: "/operatorRecord/"+userCode+"/getUnitRecord",
                }).then(function successCallback(response) {
                    if(response.data.executed && response.data.success){
                        $scope.operRecordData=false;
                        $scope.resultList=response.data.resultData;
                    }else{
                        $scope.operRecordData=true;
                    }
                }, function errorCallback(response) {
                    console.log("查询失败！")
                });
            }
            //修改单位信息
            $scope.RmodifyUnitInfo=function(){
                $('#R_modifyUnitInfo-data').modal({backdrop: 'static', keyboard: false});
                $("#R_modifyUnitInfo-data").modal("show");

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
            };
            $scope.cloneData=cloneObj($scope.data)
            console.log($scope.cloneData)

            $scope.sureCompany=function()
            {
                if ($scope.editCompany.$valid) {
                    var data={
                        "wAddressCompanyName": $scope.cloneData.unitName,
                        "wAddressDetail": $scope.cloneData.unitAddress,
                        "wAddressMobile": $scope.cloneData.workPhone,
                        "workPost": $scope.cloneData.position
                    }
                    $http({
                        method: 'PUT',
                        url:'/order/'+$scope.puserCode+'/updateUserUnitInfo',
                        data:data
                    }).then(function (res) {
                        console.log(res)
                        if(res.data.success && res.data.executed==true){
                            $("#R_modifyUnitInfo-data").modal("hide");
                              $scope.customSures();
                        }
                    }, function (res) {
                        console.log("查询失败！")
                    });
                }
                else
                {
                    $scope.submitted=true;
                }

            }


            $scope.closeCompsny=function()
            {
                $scope.submitted = false;
                $scope.editCompany.$setPristine();
                $scope.editCompany.$setUntouched();
                $scope.cloneData=cloneObj($scope.data);
                $("#R_modifyUnitInfo-data").modal("hide");
            }
        }
    }
})

