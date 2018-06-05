/**
 * Created by Administrator on 2017/11/1.
 */
app.controller("photosAuditDetailCont",function ($scope,$stateParams,sessionService,$http,$state,toastr,$timeout) {
        $scope.auditParams=sessionService.getObject('photoParams');
        $scope.operating=false;
        $scope.type='photoAudit';
        $scope.subTitle= $scope.auditParams.state.displayName;
        $scope.pBizid= $scope.auditParams.bizid;
        $scope.username= $scope.auditParams.username;
        document.title=$scope.username;
        $scope.bindcardBtn=true;//绑卡按钮
        $scope.getData=function () {
            // 请求页面数据
            $.ajax({
                async:false,
                type:"GET",
                url:"/order/"+ $scope.auditParams.bizid+"/queryOrderPickUpGoodsInfo",
                success:function (res) {
                    console.log(res);
                    if(res.success){
                        $scope.goodsInfo=res.commodityInfo;
                        console.log($scope.goodsInfo)
                        $scope.bindCard=res.bankInfoDTO;
                        $scope.goodsPhoto=res.pickUpPhotos;
                    }else {
                        $scope.goodsInfo='';
                        $scope.bindCard='';
                        $scope.goodsPhoto='';
                    }
                },
                error:function () {
                    alert("请求失败！")
                }
            });
        }
        $scope.getData();

        // 通过传参判断按钮显示/隐藏
        if($scope.auditParams.type==='view'){
            $scope.viewBtn=false;
        }else {
            $scope.viewBtn=true;
        }
        //修改商品信息按钮禁用(只有信审可以修改商品信息）
        $scope.editGoodsBtn=false;
        //操作记录接口
        $scope.userInfo={
            "userCode": $scope.auditParams.userCode,
            "orderCode": $scope.auditParams.orderCode
        };
    // 照片驳回
    $scope.showCbx=function (a) {
        if(a==="REJECT"){
            $scope.rejectPhoto=true;
        }else {
            $scope.rejectPhoto=false;
        }
    };
    //修改的照片数组
    $scope.modifyListImgArr=[];//提交修改照片的数组
    $scope.rejectListImgArr=[];//提交驳回照片的数组


    // 保存提货照片审核结果
    $scope.auditConfirm=function (obj) {
        $scope.operating=true;
        var data;
        if(obj.creditResult=="DECLINE"||obj.creditResult=="CANCEL"){//审核结果为拒绝或取消的时候
            data={
                "pickupOpinionEnum": obj.auditProposal,
                "pickupResult": obj.creditResult,
                "listImg":[],
                "shotCode": $scope.goodsPhoto.shotCode,
                "stateRemark": obj.stateRemark
            };
            console.log(data);
            $http({
                method:"PUT",
                url:"/order/"+ $scope.auditParams.bizid+"/saveOrderAuditImg",
                data:data
            }).then(function (res) {
                console.log(res);
                if(res.data.success&&res.data.executed){
                    $scope.alertPart("操作成功！")
                }else {
                    console.log(res.data.message)
                }
                $scope.operating=false;
            },function (res) {
                console.log(res)
                $scope.alertPart("请求接口失败！")
                $scope.operating=false;
            });
            return;
        }

        if(!$scope.goodsPhoto.shotCode&&$scope.goodsPhoto.shotCodeInfo.isNeedShotCode===1){
            $scope.alertPart("无法识别串码特写照片，请重新上传！");
            $scope.operating=false;
            return;
        }
        console.log(obj)

        if(obj.creditResult=="REJECT" &&$scope.modifyListImgArr.length>0){
            $scope.alertPart("您已经修改过提货照片，无法进行驳回操作，请刷新页面重试！");
            $scope.operating=false;
            return;
        }else if(obj.creditResult=="REJECT"){//审核结果为驳回的时候
            if($scope.goodsPhoto.shotCodeInfo.isNeedShotCode===1){ //需要串码特写照片
                angular.forEach($("#goodsPhoto").find("input[type='checkbox']"),function (obj) {
                    if(obj.checked){
                        var arrObj={
                            "pickupImageType": obj.attributes['img-type-code'].nodeValue,
                            "listImg": [
                                {
                                    "imgTypeno":  parseInt(obj.attributes['img-sid'].nodeValue),
                                    "imgUrl":obj.attributes['url'].nodeValue
                                }
                            ]
                        };
                        $scope.rejectListImgArr.push(arrObj);
                    }
                });
            }else {  //不需要串码特写照片
                angular.forEach($("#goodsPhoto").find("input[type='checkbox']"),function (obj) {
                    if(obj.checked && obj.attributes['img-type-code'].nodeValue!="STRINGCODE_SHOT"){
                        var arrObj={
                            "pickupImageType": obj.attributes['img-type-code'].nodeValue,
                            "listImg": [
                                {
                                    "imgTypeno":  parseInt(obj.attributes['img-sid'].nodeValue),
                                    "imgUrl":obj.attributes['url'].nodeValue
                                }
                            ]
                        };
                        $scope.rejectListImgArr.push(arrObj);
                    }
                });
            }
            if($scope.rejectListImgArr.length>0){
                data={
                    "pickupOpinionEnum": obj.auditProposal,
                    "pickupResult": obj.creditResult,
                    "listImg": $scope.rejectListImgArr,
                    "shotCode": $scope.goodsPhoto.shotCode,
                    "stateRemark": obj.stateRemark
                }
            }else {
                console.log($scope.operating)
                $scope.operating=false;
                toastr.error("请选择需要驳回的照片！")
                return;
            }

        }else {//审核结果为通过的时候
            data={
                "pickupOpinionEnum": obj.auditProposal,
                "pickupResult": obj.creditResult,
                "listImg": $scope.modifyListImgArr,
                "shotCode": $scope.goodsPhoto.shotCode,
                "stateRemark": obj.stateRemark
             }
        }
        console.log(data)
        $http({
            method:"PUT",
            url:"/order/"+$scope.auditParams.bizid+"/saveOrderAuditImg",
            data:data
        }).then(function (res) {
            console.log(res)
            if(res.data.success&&res.data.executed){
                toastr.success("操作成功！")
                $timeout(function () {
                   window.close();
                    $scope.operating=false;
                },500)
            }else {
                $scope.operating=false;
                toastr.error(res.data.message)
                console.log(res.data.message)
            }

        },function (res) {
            console.log(res)
            $scope.alertPart("请求接口失败！")
            $scope.operating=false;
        })
    };

    //返回
    $scope.back=function () {
        window.close();
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
            document.title="订单管理系统";
            $state.go('photosAuditList');

        }
    }
    //离开页面时清除缓存
    $scope.$on("$destroy", function() {
        sessionService.remove("photoParams")
    })
})