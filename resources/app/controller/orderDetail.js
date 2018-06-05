/**
 * Created by Administrator on 2017/11/1.
 */
app.controller("orderDetailCont",function ($rootScope,$scope,$stateParams,sessionService,$http,$state) {
    // 路由传参
    (function () {
        $scope.oderParams=sessionService.getObject('orderParams');
        $scope.subTitle=$scope.oderParams.state;
        $scope.listType=$scope.oderParams.type;
        $scope.isAuth=$scope.oderParams.isAuth;
        $scope.username=$scope.oderParams.username;
        // 修改页面title标签
        document.title=$scope.username?$scope.username:document.title;

        $.ajax({
            type: "GET",
            url: "/order/"+$scope.oderParams.bizid+"/queryOrderInfo",
            async:false,
            success: function (data) {
                console.log(data)
                if(data.executed && data.success ){
                    $scope.authCode=data.authCode;
                    //客户信息
                    $scope.orderDetail=data.userInfo;
                    //信审照片
                    $scope.auditphotosDetail=data.imageInfos;
                    //单位信息
                    $scope.companyDetail=data.unitInfo;
                    //商品信息
                    $scope.goodsDetail=data.commodityInfo;
                    //风控信息
                    // $scope.riskDetail=data.windControlInfo;
                    //抽查联系人信息
                    $scope.telreschDetail=data.contactInfos;
                    //绑卡信息
                    $scope.bindcardDetail=data.bankInfoDTO;
                    //备注信息
                    $scope.remarkInfoDetail=data.remark;
                    //合同信息
                    $scope.contractDetail=data.agreementInfos;
                    //提货照片
                    $scope.goodsphotosDetail=data.pickUpPhotos;
                    //还款信息
                    $scope.repayDetail=data.repaymentInfos;
                    //信审结果
                    $scope.creditResult=data.creditResultInfo;
                    //提货照片审核结果
                    $scope.goodsPhotosAuditResult=data.imgResultInfo;
                    //打款结果
                    $scope.remitRes=data.signPayResultInfo;
                }
            },
            dataType: "json",
            error: function(data){
                console.log("获取订单详情失败！")
            }
        });

        //客户编号和电话号码
        $scope.userInfo={
            "userCode":$scope.oderParams.userCode,
            "userPhone":$scope.oderParams.userPhone,
            "orderCode":$scope.oderParams.orderCode,
            "authCode":$scope.authCode
        };

        // 通过传参判断按钮显示/隐藏
        if($scope.oderParams.type==='orderView'){
            $scope.viewBtn=false;
        }else {
            $scope.viewBtn=true;
        }
        //通过传参判断查看风控报告显示/隐藏
        $scope.riskPanel=($scope.oderParams.riskContAuth==='hasAuth'&&$scope.oderParams.state!=='资料填写中')||$scope.oderParams.state==='待信审'||$scope.oderParams.state==='信审中'?true:false;
        //返回列表
        $scope.back=function () {
            window.close();
        };

    })()
    //离开页面时清除缓存
    $scope.$on("$destroy", function() {
        sessionService.remove("orderParams")
    })

})