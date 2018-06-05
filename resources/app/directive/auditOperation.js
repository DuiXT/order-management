/*Created by chigantingtng on 2017/11/7.*/
app.directive("auditOperation",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/auditOperation.html',
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
            //审核操作记录
            scope.infoReviewOper=function(){
                $('#infoReviewOper-data').modal({backdrop: 'static', keyboard: false});
                $("#infoReviewOper-data").modal("show");
                scope.getRecord();
            }
            // 返回
            scope.back=function () {
                scope.goBack()
            }

            /*信审确定按钮*/
            scope.sureOperation = function () {
                if (!scope.auditSuggestionssst || !scope.auditPicRes) {
                    scope.submitted=true;
                } else {


                    var obj = {
                        "auditProposal": scope.auditSuggestionssst,  //意见
                        "creditResult":scope.auditPicRes,  //结果
                        "stateRemark": scope.stateRemark  //审核备注
                    }
                    scope.sureOperations({obj: obj})
                }

            }
        },
        controller:function($scope,$http,$rootScope) {
            //获取信审操作记录
            $scope.operRecordData=false;
            $scope.getRecord=function(){
                $http({
                    method: 'GET',
                    url: "/operatorRecord/"+$scope.pOrdercode+"/getCreditResultRecord",
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
            /*信审结果*/
            $scope.showCbx = function () {
                $.ajax({
                    async: false,
                    method: "GET",
                    url: "/dictionary/getCreditResult",
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


            /*信审意见*/
            $scope.getSuggestion = function (val) {
                $scope.auditSuggestionssst=''
                $http({
                    method: "GET",
                    url: "/dictionary/getCreditAdvice?creditResult="+val
                }).then(function (res) {
                    console.log(res);
                    if (res.data.success&&res.data.executed) {
                        $scope.auditResList = res.data.enumInfoDTOS;
                    } else {
                        console.log("请求异常！")
                    }
                }, function () {
                    console.log("请求失败！")
                })

            }


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