/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("auditRes",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/auditRes.html',
        replace: true,
        scope:{
            data:'=',
            userInfo:'@'
        },
        controller:function($scope,$http){
            //判断信审信息是否存在
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
            //获取信审操作记录
            $scope.operRecordData=false;
            var orderCode=JSON.parse($scope.userInfo).orderCode;
            $scope.getRecord=function(){
                $http({
                    method: 'GET',
                    url: "/operatorRecord/"+orderCode+"/getCreditResultRecord",
                }).then(function successCallback(response) {
                    if(response.data.executed && response.data.success ){
                        $scope.operRecordData=false;
                        $scope.resultList=response.data.resultData;
                    }else{
                        $scope.operRecordData=true;
                    }
                }, function errorCallback(response) {
                    console.log("查询失败！")
                });
            }
        },
        link:function (scope,element,attr) {
            //信审操作记录
            scope.infoReviewOper=function(){
                $('#infoReviewOper-data').modal({backdrop: 'static', keyboard: false});
                $("#infoReviewOper-data").modal("show");
                scope.getRecord();
            }
        }
    }
})