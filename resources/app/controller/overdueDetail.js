/*
 Created by chigantingting on 2017/11/8.
*/
app.controller("overdueDetailCont",function ($scope,$stateParams,sessionService,$http,$state) {
    (function () {
        $scope.overdueParams=sessionService.getObject('overdueParams');
        $scope.subTitle=$scope.overdueParams.state;
        $scope.username=$scope.overdueParams.username;
        document.title=$scope.username;
        $.ajax({
            type: "GET",
            url: "/repayment/"+$scope.overdueParams.bizid+"/getOrderOverdueInfo",
            async:false,
            success: function (data) {
                console.log(data)
                if(data.executed && data.success ){
                    //客户信息
                    $scope.orderDetail=data.userInfo;
                    //信审照片
                    $scope.auditphotosDetail=data.imageInfos;
                    //单位信息
                    $scope.companyDetail=data.unitInfo;
                    //商品信息
                    $scope.goodsDetail=data.commodityInfo;
                    //抽查联系人信息
                    $scope.telreschDetail=data.contactInfos;
                    //绑卡信息
                    $scope.bindcardDetail=data.bankInfoDTO;
                    //合同信息
                    $scope.contractDetail=data.agreementInfos;
                    //还款信息
                    $scope.repayDetail=data.repaymentInfos;
                    //提货照片
                    $scope.goodsphotosDetail=data.pickUpPhotos;
                }
            },
            dataType: "json",
            error: function(data){
                console.log("获取逾期订单详情失败！")
            }
        });

        //客户编号和电话号码
        $scope.userInfo={
            "userCode":$scope.overdueParams.userCode,
            "userPhone":$scope.overdueParams.userPhone,
            "orderCode":$scope.overdueParams.orderCode
        };
        // 通过传参判断按钮显示/隐藏
        if($scope.overdueParams.type==='orderView'){
            $scope.viewBtn=false;
        }else {
            $scope.viewBtn=true;
        }
        // 通过传参判断逾期状态显示/隐藏
        if($scope.overdueParams.day==='overDay'){
            $scope.dueView=true;
        }else {
            $scope.dueView=false;
        }
        //返回列表
        $scope.back=function () {
            $state.go('overdueList', {page: $scope.overdueParams.page,index:$scope.overdueParams.index});
            document.title="订单管理系统";
        };

    })()
    //离开页面时清除缓存
    $scope.$on("$destroy", function() {
        sessionService.remove("overdueParams")
    })
})