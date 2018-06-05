
/************************还款详情**********************/
app.controller("repayDetailCont",function ($scope,$stateParams,sessionService,$http,$state) {
    (function () {
        $scope.repayParams=sessionService.getObject('repayParams');
        $scope.username=$scope.repayParams.username;
        document.title=$scope.username;
        $scope.type='repay';
        $scope.getData=function () {
            // 请求页面数据
            $.ajax({
                async:false,
                type:"GET",
                url:"/repayment/"+$scope.repayParams.bizid+"/getOrderRepaymentInfo",
                success:function (res) {
                    console.log(res);
                    if(res.success&&res.executed){
                        $scope.goodsInfo=res.commodityInfo;
                        $scope.bindCard=res.bankInfoDTO;
                        $scope.goodsPhoto=res.pickUpPhotos;
                        $scope.creditPhoto=res.imageInfos;
                        $scope.repaymentInfos=res.repaymentInfos;
                        $scope.userInfoDetail=res.userInfo;
                        $scope.isMayRepaymentPublicBtn=res.isMayRepaymentPublic;
                    }else {
                        $scope.goodsInfo='';
                        $scope.bindCard='';
                        $scope.goodsPhoto='';
                        $scope.creditPhoto='';
                        $scope.repaymentInfos='';
                        $scope.userInfo='';
                        $scope.isMayRepaymentPublicBtn=false
                    }
                },
                error:function () {
                    alert("请求失败！")
                }
            });
        }
        $scope.getData();

        // 操作按钮
        $scope.bindcardBtn=true;
        $scope.repayBtn=true;

        //修改商品信息按钮禁用
        $scope.editGoodsBtn=false;
        //操作记录接口
        $scope.userInfo={
            "userCode":$scope.repayParams.userCode,
            "orderCode":$scope.repayParams.orderCode
        };
        console.log( $scope.userInfo)
        console.log($scope.repayParams.page)
    })();


    //返回
    $scope.back=function () {
        $state.go('repaymentList', {page: $scope.repayParams.page,index:$scope.repayParams.index});
        document.title="订单管理系统";
    }
    /*alert弹框*/
    $scope.alertPart=function(o){
        $scope.alertlog=o;
        $scope.showAlert()
    };
    $scope.showAlert=function (){
        $("#mask").show();
        $("#alertlog").show();
    };
    $scope.hideAlert=function(){
        $("#mask").hide();
        $("#alertlog").hide();
        if($scope.alertlog=='操作成功！'){
            $state.go('photosAuditList');
        }
    };
    //离开页面时清除缓存
    $scope.$on("$destroy", function() {
        sessionService.remove("repayParams")
    })
})