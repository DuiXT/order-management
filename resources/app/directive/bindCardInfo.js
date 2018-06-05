/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("bindCardInfo",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/bindCardInfo.html',
        replace: true,
        scope:{
            data:'=',
            btn:'=',
            userInfo:'@',
            getData:'&',
            bindcardBtns:'=',//预审false，提货照片审true
            type:'@'
        },
        controller:function ($scope,$http,$rootScope,uploadUrl) {
            console.log($scope.bindcardBtns)
            $scope.userInfo=JSON.parse($scope.userInfo)
            $scope.user=$scope.userInfo;
            var userCode=$scope.user.userCode;
            var orderCode=$scope.user.orderCode;
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
            $scope.cloneData=cloneObj($scope.data);
            console.log($scope.cloneData)
            //判断银行卡信息是否存在
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
            //打开更换银行卡模态窗
            $scope.replaceBankInfo11=function () {
                $('#replaceBankInfo-data').modal({backdrop: 'static', keyboard: false});
                $("#replaceBankInfo-data").modal("show");
                $scope.getBankList();
                $scope.cloneData.bizid=$scope.data.bizid;
            };

            var viewer = new myviewer(document.getElementById('bankCardPhoto'), {
                url: 'data-original'
            });

            $scope.closeModal=function () {
                $("#replaceBankInfo-data").modal("hide");
                $scope.accountHolderChange=false;
                $scope.cardBankChange=false;
                $scope.bankInformationChange=false;
                $scope.bankNumberChange=false;
                $scope.reservedPhoneChange=false;
            }
            //获取银行字典
            $scope.getBankList=function () {
                $http({
                    method:"GET",
                    url:"/dictionary/getBankDictionary"
                }).then(function (res) {
                    console.log(res)
                    if(res.data.success){
                        $scope.bankList=res.data.enumInfoDTOS;
                    }else {
                        console.log("接口请求异常！");
                    }
                },function () {
                    console.log("接口请求失败!");
                });
            };

            $scope.confirm=function () {
                if(!$scope.cloneData.bankCode){
                    $scope.cardBankChange=true;
                }
                if(!$scope.cloneData.bankInformation){
                    $scope.bankInformationChange=true;
                }
                if(!$scope.cloneData.bankNumber){
                    $scope.bankNumberChange=true;
                }
                if($scope.replaceBankInfo.reservedPhone.$invalid){
                    $scope.reservedPhoneChange=true;
                }
                if($scope.replaceBankInfo.$valid){

                    var data={
                        "bankCardImgUrl": $scope.cloneData.bankImgUrl,
                        "bankPhone": $scope.cloneData.reservedPhone,
                        "cardBranch": $scope.cloneData.bankInformation,
                        "cardMaker": $scope.cloneData.bankCode,
                        "cardNumber": $scope.cloneData.bankNumber,
                        "userName": $scope.cloneData.accountHolder,
                        "bizid": $scope.cloneData.bizid
                    };
                    console.log(data)
                    $http({
                        method:"PUT",
                        url:($scope.type==='repay'?"/repayment/":"/order/")+userCode+"/"+orderCode+"/updateUserBankInfo",
                        data:data
                    }).then(function (res) {
                        console.log(res)
                        if(res.data.success&&res.data.executed){
                            if($scope.type==='repay'&&res.data.data){
                                window.open(res.data.data,'_blank');
                            }
                                $scope.getData();
                                $scope.closeModal();


                        }else {
                            if(res.data.data==1){//卡号错误
                                $scope.bankNumberChange=true;
                            }else if (res.data.data==2){//卡行错误
                                $scope.cardTypeError=true;
                                $scope.cardBankChange=true;
                            }else {
                                $rootScope.alertPart(res.data.message)
                            }
                        }
                    },function (res) {
                        console.log(res)
                    })
                }
            }


            //绑卡信息操作记录
            $scope.operRecordData=false;
            $scope.getRecord=function(){
                $http({
                    method: 'GET',
                    url: "/operatorRecord/"+userCode+"/getBankCardRecord",
                }).then(function successCallback(response) {
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
                        $rootScope.alertPart(res.data.message);
                        $scope.operRecordData=true;
                    }
                }, function errorCallback(response) {
                    console.log(response)
                    $rootScope.alertPart("获取操作记录失败！")
                });
            };

            //上传银行卡照片
            $scope.bankCardPhoto_upload=function (files,obj) {
                var postfix = files[0].name.substring(files[0].name.lastIndexOf(".") + 1).toLowerCase();
                if (postfix != "jpg" && postfix != "png") {
                    $rootScope.alertPart("图片仅支持png、jpg类型的文件");
                    $scope.$apply();
                    return false;
                }
                $scope.uploadBankCardPhoto=false;
                $scope.guid = (new Date()).valueOf();   //通过时间戳创建一个随机数，作为键名使用
                var data = new FormData();      //以下为像后台提交图片数据
                data.append('file', files[0]);
                data.append('guid', $scope.guid);
                $http({
                    method: 'POST',
                    url: uploadUrl.url+'/attachment',
                    data: data,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }).then(function (res) {
                    if(res.data.success){
                        $scope.cloneData.bankImgUrl=res.data.data.filePath;
                        $scope.uploadBankCardPhoto=true;
                    }else {
                        $scope.uploadBankCardPhoto=true;
                        $rootScope.alertPart("上传失败！")
                    }
                }, function () {
                    $scope.uploadBankCardPhoto=true;
                    $rootScope.alertPart("上传失败！")

                })
            }
        },
        link:function (scope,element,attr) {
            //更换银行卡操作记录
            scope.replaceBankInfoOper=function(){
                $('#replaceBankInfoOper-data').modal({backdrop: 'static', keyboard: false});
                $("#replaceBankInfoOper-data").modal("show");
                scope.getRecord();
            }

        }
    }
})