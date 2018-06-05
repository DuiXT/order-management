/**
 * Created by chigantingting on 2017/11/8.
 */
app.directive("auditPicture",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/auditPicture.html',
        replace: true,
        scope:{
            childOperating:'=',
            showCbxx:'&',
            auditPicConfirms:'&',
            userInfo:'@',
            goBack:'&'

        },
        controller:function ($scope,$http) {
            // 审核结果select接口
            $.ajax({
                async: false,
                method: "GET",
                url: "/dictionary/getPickupResult",
                success: function (res) {
                    console.log(res)
                    if (res.success) {
                        $scope.auditPicResList = res.enumInfoDTOS;
                    }
                },
                error: function () {
                    console.log("请求失败！")
                }
            });
            // 审核意见select接口
            $scope.getSuggestion=function (val) {
                $scope.auditSuggestion='';
                $http({
                    method:"GET",
                    url:"/dictionary/getPickupAdvice?pickupResult="+val
                }).then(function (res) {
                    if(res.data.success){
                        $scope.auditResList=res.data.enumInfoDTOS;
                    }else {
                        console.log("请求异常！")
                    }
                },function () {
                    console.log("请求失败！")
                })
            }
            //提货照片审核操作记录
            var userCode=JSON.parse($scope.userInfo).userCode;
            $scope.getRecord=function(){
                $http({
                    method: 'GET',
                    url: "/operatorRecord/"+userCode+"/getPickupResultRecord",
                }).then(function successCallback(response) {
                    if(response.data.executed && response.data.success){
                        $scope.operRecordData=false;
                        $scope.resultList=response.data.resultData;
                    }else {
                        $scope.operRecordData=true;
                    }
                }, function errorCallback(response) {
                    console.log("查询失败！")
                });
            }
            // 保存审核结果
            $scope.auditPicConfirm=function () {
                if($scope.auditPicRes&&$scope.auditSuggestion){
                    var obj={
                        "auditProposal":$scope.auditSuggestion,
                        "creditResult":$scope.auditPicRes,
                        "stateRemark":$scope.auditRemarks
                    }
                    $scope.auditPicConfirms({obj:obj})
                }else {
                    if(!$scope.auditPicRes){
                        $scope.auditPicResChange=true;
                    };
                    if(!$scope.auditSuggestion)
                        $scope.auditSuggestionChange=true;
                }

            }
        },
        link:function (scope,element,attr) {
            //更换照片操作记录
            scope.R_infoReviewOper=function(){
                $('#R_infoReviewOper-data').modal({backdrop: 'static', keyboard: false});
                $("#R_infoReviewOper-data").modal("show");
                scope.getRecord();
            }

            // 照片驳回
            scope.showCbx=function (res) {
                scope.showCbxx({name:res})
            };


            // 返回
            scope.back=function () {
                scope.goBack()
            }
        }
    }
})