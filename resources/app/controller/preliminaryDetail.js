/************************预审详情**********************/
app.controller("preliminaryDetailCont",function ($scope,$http,$state,$rootScope,sessionService,toastr, $timeout) {
    $scope.preliminaryParams=sessionService.getObject('preliminaryParams');
    console.log($scope.preliminaryParams)
    $scope.puserCode=$scope.preliminaryParams.userCode;
    $scope.listType=$scope.preliminaryParams.type;
    $scope.pBizid=$scope.preliminaryParams.bizid;
    $scope.subTitle=$scope.preliminaryParams.state.displayName;
    $scope.pOrdercode=$scope.preliminaryParams.orderCode;
    $scope.username=$scope.preliminaryParams.username;
    // 修改title标签
    document.title=$scope.username;
    $scope.operating=false;
    $scope.bindcardBtn=false;//隐藏按钮
    $scope.listType='preliminary'

    if($scope.listType==='view')
    {
        $scope.previewbtn=false;
        $scope.viewBtn=false;
    }else {
        $scope.viewBtn=true;
        $scope.previewbtn=true
    }

    /*初审详情*/
    $scope.Company=function () {
        $.ajax({
            async: false,
            type: "GET",
            url: "/firsttrial/" + $scope.pBizid + "/queryOrderFirstTrialInfo",
            success: function (res) {
                console.log(res)
                if(res.success&& res.executed)
                {
                    $scope.custominfo = res.userInfo; /*客户信息*/
                    $scope.bindCard=res.bankInfoDTO;
                    $scope.imageInfo = res.imageInfo; /*信审照片*/
                }
            },
            error: function (res) {
                console.log("查询失败")
            }
        });
    }
    $scope.Company();
    $scope.userInfo={
        "userCode":$scope.preliminaryParams.userCode,
        "userPhone":$scope.preliminaryParams.userPhone,
        "orderCode":$scope.preliminaryParams.orderCode,
        "authCode":$scope.authCode
    };

    $scope.rejectListImgArr=[];//提交驳回照片的数组
    /*信审确定按钮*/
    $scope.sureOperationsList=function(obj)
    {
        $scope.operating=true;//按钮禁用
        var data;
        if(obj.creditResult==="REJECT")
        {
            angular.forEach($("#auditPhotos").find("input[type='checkbox']"),function (obj) {
                if(obj.checked){
                    var arrObj={
                        "imgTypeCode": obj.attributes['img-type-code'].nodeValue,
                        "listImg": [
                            {
                                "imgTypeno": obj.attributes['img-sid'].nodeValue,
                                "imgUrl": obj.attributes['url'].nodeValue
                            }
                        ]
                    };
                    $scope.rejectListImgArr.push(arrObj);
                }
            });
            if($scope.rejectListImgArr.length>0){
                data={
                    "creditResult":obj.creditResult,
                    "listImg":$scope.rejectListImgArr,
                    "stateRemark":obj.stateRemark
                }
            }else {
                toastr.error("请选择需要驳回的照片！");
                $scope.operating=false;
                return;
            }
        } else {
            data={
                "creditResult": obj.creditResult,
                "listImg":[],
                "stateRemark": obj.stateRemark
            }
        }
        console.log(data)
        $http({
            method: "PUT",
            url: "/firsttrial/" +$scope.pBizid+ "/updateFirstTrialResultByBid",
            data:data
        }).then(function (res) {
            if(res.data.success&&res.data.executed){
                toastr.success('操作成功');
                $timeout(function () {
                    window.close();
                    $scope.operating=false;//确定按钮禁用
                },500);
            }else {
                $scope.operating=false;//确定按钮禁用
                toastr.warning(res.data.message);
                console.log(res.data)
            }
        }, function () {
            $scope.operating=false;
            toastr.error('请求失败!');
            console.log("请求失败!")
        })
    }
    $rootScope.hideAlert=function(){
        $("#mask").hide();
        $("#alertlog").hide();
    }

    $scope.back=function () {
        window.close();
    };
    //离开页面时清除缓存
    $scope.$on("$destroy", function() {
        sessionService.remove("preliminaryParams");
    })
})