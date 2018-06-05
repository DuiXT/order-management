/************************信审详情**********************/
app.controller("auditDetailCont",function ($scope,$http,$state,$rootScope,sessionService,toastr,$timeout) {
    $scope.auditParams=sessionService.getObject('auditParams');
    $scope.puserCode=$scope.auditParams.userCode;
    $scope.listType=$scope.auditParams.type;//信审列表进入
    $scope.pBizid=$scope.auditParams.bizid;
    $scope.subTitle=$scope.auditParams.state.displayName;
    $scope.pOrdercode=$scope.auditParams.orderCode;
    $scope.isAuth=$scope.auditParams.isAuth;
    $scope.username=$scope.auditParams.username;
    // 修改title标签
    document.title=$scope.username;
    $scope.operating=false;
    $scope.listType='audit';

    if($scope.listType=='view')
    {
        $scope.viewBtn=false;
        $scope.previewbtn=false//预审进来有修改客户信息的权限
    }else {
        $scope.viewBtn=true;
        $scope.previewbtn=true
    }

    /*信审详情*/
    $scope.Company=function () {
        $.ajax({
            async: false,
            type: "GET",
            url: "/order/" + $scope.auditParams.bizid + "/queryOrderCreditInfo",
            success: function (res) {
                console.log(res)
                if(res.success&& res.executed)
                {
                    $scope.custominfot = res.userInfo; /*客户信息*/
                    $scope.unitInfoList = res.unitInfo; /*单位信息*/
                    $scope.goodsInfo = res.commodityInfo; /*商品信息*/
                    $scope.riskinfo = res.windControlInfo; /*风控信息*/
                    $scope.telresch = res.contactInfo; /*抽查联系人*/
                    $scope.imageInfo = res.imageInfo; /*信审照片*/
                    $scope.authCode=res.authCode;
                    $scope.remarkInfo=res.remark;
                }
            },
            error: function (res) {
                console.log("查询失败")
            }
        });
    }
    $scope.Company();
    $scope.userInfo={
        "userCode":$scope.auditParams.userCode,
        "userPhone":$scope.auditParams.userPhone,
        "orderCode":$scope.auditParams.orderCode,
        "authCode":$scope.authCode
    };
    console.log($scope.userInfo)
    // 风控报告基本信息接口
    $.ajax({
        type: 'GET',
        async:false,
        url: "/carrier/addUserInfo/" + $scope.userInfo.userCode + "/" + $scope.userInfo.orderCode + "/query",
        success: function (res) {
            console.log(res);
            if (res.success && res.executed) {
                $scope.eleData = res.riskBase;
                // 运营商数据
                $http({
                    method:"GET",
                    url:"/carrier/findByAuthCode/"+$scope.userInfo.userCode+"/"+$scope.userInfo.orderCode+"/query?authCode="+$scope.userInfo.authCode
                }).then(function (res2) {
                    console.log(res2)
                    if(res2.data.success&&res2.data.executed){
                        $scope.yysData=res2.data;
                    }else {
                        $scope.yysData=res2.data;
                        console.log("操作失败，请稍后重试！")
                    }
                },function (res2) {
                    console.log(res2);
                })
            } else {
                $scope.eleData = res.riskBase;//如果基本信息调用失败，避免风控报告页面显示上一个人的信息
                console.log("操作失败，请稍后重试！")
            }
        },
        error: function (res) {
            console.log(res)
        }
    });

    //修改的照片数组
    $scope.modifyListImgArr=[];//提交修改照片的数组
    $scope.rejectListImgArr=[];//提交驳回照片的数组

    /*信审确定按钮*/
    $scope.sureOperationsList=function(obj)
    {
        $scope.operating=true;
        var data;
        if(obj.creditResult=="REJECT" && $scope.modifyListImgArr.length>0 )
        {
            toastr.warning("您已经修改过信审照片，无法进行驳回操作，请刷新页面重试！")
            $scope.operating=false;
            return;
        }
        else if(obj.creditResult=="REJECT")
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
                    "auditProposal":obj.auditProposal,
                    "creditResult":obj.creditResult,
                    "listImg":$scope.rejectListImgArr,
                    "stateRemark":obj.stateRemark
                }
            }else {
                toastr.error("请选择需要驳回的照片！");
                $scope.operating=false;
                return;
            }
            console.log(data)
        }
        else if(obj.creditResult=="DECLINE"||obj.creditResult=="CANCEL")
        {
            data={
                "auditProposal": obj.auditProposal,
                "creditResult": obj.creditResult,
                "listImg":[],
                "stateRemark": obj.stateRemark
            }
        }
        else
        {
             data={
                "auditProposal": obj.auditProposal,
                "creditResult": obj.creditResult,
                "listImg":$scope.modifyListImgArr,
                "stateRemark": obj.stateRemark
            }
        }
console.log(data)
            $http({
                method: "PUT",
                url: "/order/" +$scope.auditParams.bizid+ "/saveOrderAudit",
                data:data
            }).then(function (res) {
                if(res.data.success&&res.data.executed){
                    toastr.success('操作成功');
                    $timeout(function () {
                        window.close();
                        $scope.operating=false;//确定按钮禁用
                    },500)
                }else {
                    $scope.operating=false;//确定按钮禁用
                    toastr.error(res.data.message);
                    console.log(res.data.message)
                }
            }, function (rew) {
                $scope.operating=false;
                toastr.error("请求失败！");
                console.log(res);
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
        sessionService.remove("auditParams")
    })
})