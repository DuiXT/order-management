/*Created by chigantingtng on 2017/11/7.*/
app.directive("preliminaryOperation",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/preliminaryOperation.html',
        replace: true,
        scope:{
            data:'=',
            rejectPhoto:'=',
            editPicture:'=',
            parentBizid:'@',
            sureOperations:'&',
            pOrdercode:'@',
            goBack:'&',
            childOperating:'='
        },
        link:function (scope,element,attr) {

            // 返回
            scope.back=function () {
                scope.goBack()
            }

            /*信审确定按钮*/
            scope.sureOperation = function () {
                if (!scope.auditPicRes) {
                    scope.submitted=true;
                } else {
                    var obj = {
                        "creditResult":scope.auditPicRes,  //结果
                        "stateRemark": scope.stateRemark  //审核备注
                    }
                    scope.sureOperations({obj: obj});
                }

            }
        },
        controller:function($scope,$http,$rootScope) {

            /*信审结果*/
            $scope.showCbx = function () {
                $.ajax({
                    async: false,
                    method: "GET",
                    url: "/dictionary/getFirstTrialResult",
                    success: function (res) {
                        console.log(res)
                        if (res.success&&res.executed) {
                            $scope.auditPicResLists = res.enumInfoDTOS;
                        }else {
                            console.log("请求异常！")
                        }
                    },
                    error: function () {
                        console.log("请求失败！")
                    }
                });
            }
            $scope.showCbx();


            /*审核结果选中哪个*/
            $scope.aaaaa = function (auditPicRes) {
               if(auditPicRes=='REJECT')
                {
                    $scope.rejectPhoto = true;
                }
                else
               {
                   $scope.rejectPhoto = false;
               }
            }

        }
    }
})