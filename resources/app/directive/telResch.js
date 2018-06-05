/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("telResch",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/telResch.html',
        replace: true,
        scope:{
            data:'=',
            userInfo:'@',
            btn:'=',
            getData:'&'
        },
        controller:function($scope,$http,$rootScope){

            console.log($scope.userInfo)
            //数据深度拷贝
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
            //判断联系人信息是否存在
            $scope.panel=true;
            if(JSON.stringify($scope.data) == "{}"||$scope.data==null||$scope.data.length==0||$scope.data==undefined||$scope.data==""){
                $scope.panel=false;
            }else{
                var props = 0;
                //下面使用each进行遍历
                $.each($scope.data,function(n,value) {
                    if((value.linkerName==""||value.linkerName==null||value.linkerName==undefined||value.linkerName.length==0||JSON.stringify(value.linkerName) == "{}")&&
                        (value.linkRelation==""||value.linkRelation==null||value.linkRelation==undefined||value.linkRelation.length==0||JSON.stringify(value.linkRelation) == "{}")&&
                        (value.callFrequency==""||value.callFrequency==null||value.callFrequency==undefined||value.callFrequency.length==0||JSON.stringify(value.callFrequency) == "{}")&&
                        (value.linkPhone==""||value.linkPhone==null||value.linkPhone==undefined||value.linkPhone.length==0||JSON.stringify(value.linkPhone) == "{}")&&
                        (value.phoneReviewResult==""||value.phoneReviewResult==null||value.phoneReviewResult==undefined||value.phoneReviewResult.length==0||JSON.stringify(value.phoneReviewResult) == "{}")
                    ){
                        props=props+0;
                    }else{
                        props=props+1;
                    }
                });
                if(props==0){
                    $scope.panel=false;
                }else{
                    $scope.panel=true;
                }
            }
            //电核下一组

            $scope.getNextInfo=function(){
                if(typeof $scope.userInfo=='string'){
                    $scope.userInfo=JSON.parse($scope.userInfo)
                };
                $http({
                    method: 'GET',
                    url: "/order/"+$scope.userInfo.orderCode+"/"+$scope.userInfo.userCode+"/"+$scope.userInfo.userPhone+"/getNexGroupContacts",
                }).then(function successCallback(response) {
                    console.log(response)
                    if(response.data.executed && response.data.success){
                        if(response.data.contactInfoDTOList.length>1){
                            $scope.data=response.data.contactInfoDTOList;
                        }else {
                            $rootScope.alertPart("暂无联系人数据！")
                        }
                    }else{
                        $rootScope.alertPart(response.data.message)
                        console.log(response.data.message)
                    }
                }, function errorCallback(response) {
                    console.log("查询失败！")
                });
            }
            //电核记录
            $scope.operRecordData=false;
            $scope.getRecord=function(){
                if(typeof $scope.userInfo=='string'){
                    $scope.userInfo=JSON.parse($scope.userInfo);
                }
                $http({
                    method: 'GET',
                    url: "/operatorRecord/"+$scope.userInfo.orderCode+"/getTelCheckRecord",
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
            // 获取电核结果
            function getTelResult() {
                $http({
                    method:'GET',
                    url:'/dictionary/getTelResult'
                }).then(function (res) {
                    console.log(res)
                    if(res.data.success&&res.data.executed){
                        $scope.telResList=res.data.enumInfoDTOS;
                    }else {
                        console.log(res)
                    }
                },function () {
                    console.log("接口请求失败！")
                })
            }
            // 获取联系人关系
            function getRelation() {
                $http({
                    method:'GET',
                    url:'/dictionary/getRelationDictionary'
                }).then(function (res) {
                    console.log(res)
                    if(res.data.success&&res.data.executed){
                        $scope.relationList=res.data.enumInfoDTOS;
                    }else {
                        console.log(res)
                    }
                },function () {
                    console.log("接口请求失败！")
                })
            }
            //电核
            $scope.R_phoneVerifyOper=function(idx,state){
                if($scope.btn&&state.target.innerText=='待电核'){
                    $scope.telResearch.$setPristine()
                    $scope.linkerNameChange=false;
                    $scope.linkerRelationChange=false;
                    $scope.telResChange=false;
                    $scope.telAdviceChange=false;
                    $('#R_phoneVerifyOper-data').modal({backdrop: 'static', keyboard: false});
                    $("#R_phoneVerifyOper-data").modal("show");
                    getRelation();
                    getTelResult();
                    $scope.cloneData=cloneObj($scope.data[idx]);
                    console.log($scope.cloneData);
                    if($scope.cloneData.phoneReviewResult){
                        $scope.getTelAdvice($scope.cloneData.phoneReviewResult.name);
                    }
                }else {
                    return
                }

            }
            // 获取电核意见
            $scope.getTelAdvice=function (val) {
                $http({
                    method:'GET',
                    url:"/dictionary/getTelAdvice?telResult="+val
                }).then(function (res) {
                    console.log(res)
                    if(res.data.success&&res.data.executed){
                        $scope.telAdvList=res.data.enumInfoDTOS;
                    }else {
                        console.log(res)
                    }
                },function () {
                    console.log("请求接口失败")
                })
            };
            // 保存电核结果
            $scope.confirm=function () {
                if(typeof $scope.userInfo=='string'){
                    $scope.userInfo=JSON.parse($scope.userInfo)
                };
                if(!$scope.cloneData.linkerName){//联系人姓名
                    $scope.linkerNameChange=true;
                }
                if(!$scope.cloneData.linkRelation.name){//联系人关系
                    $scope.linkerRelationChange=true;
                }
                if($scope.cloneData.phoneReviewResult){
                    if(!$scope.cloneData.phoneReviewResult.name){//审核结果
                        $scope.telResChange=true;
                    }
                }else {
                    $scope.telResChange=true;
                }

                if($scope.cloneData.phoneReviewAdvice){
                    if(!$scope.cloneData.phoneReviewAdvice.name){//审核意见
                        $scope.telAdviceChange=true;
                    }
                }else {
                    $scope.telAdviceChange=true;
                }

                if($scope.telResearch.$valid){
                    var data={
                        "auditMemoCode": $scope.cloneData.phoneReviewAdvice.name,
                        "auditOpinion": $scope.cloneData.remark,
                        "auditResult": $scope.cloneData.phoneReviewResult.name,
                        "linkerLinkCode": $scope.cloneData.linkRelation.name,
                        "linkerName": $scope.cloneData.linkerName,
                        "linkerPhone": $scope.cloneData.linkPhone
                    };
                    $http({
                        method:"POST",
                        url:"/order/"+$scope.userInfo.orderCode+"/addTelAudit",
                        data:data
                    }).then(function (res) {
                        console.log(res)
                        if(res.data.success&&res.data.executed){
                            $("#R_phoneVerifyOper-data").modal("hide");
                            $scope.getData()
                            initForm()
                        }else {
                            console.log(res)
                            $rootScope.alertPart(res.data.message)
                        }
                    },function () {
                        $rootScope.alertPart("操作失败！")
                    })
                }
            };
            // 清除校验痕迹
            function initForm() {
                $scope.linkerNameChange=false;
                $scope.linkerRelationChange=false;
                $scope.telResChange=false;
                $scope.telAdviceChange=false;
            }
        },
        link:function (scope,element,attr) {
            //电核记录
            scope.phoneVerifyInfoOper=function(){
                $('#phoneVerifyInfoOper-data').modal({backdrop: 'static', keyboard: false});
                $("#phoneVerifyInfoOper-data").modal("show");
                scope.getRecord();
            }

        }
    }

})