/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("contractInfo",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/contractInfo.html',
        replace: true,
        scope:{
            data:'=',
            btn:'=',
        },
        controller:function($scope,$http){
            //判断合同信息是否存在
            $scope.panel=true;
            if(JSON.stringify($scope.data) == "{}"||$scope.data==null||$scope.data.length==0||$scope.data==undefined||$scope.data==""){
                $scope.panel=false;
            }else{
                var props = 0;
                //下面使用each进行遍历
                $.each($scope.data,function(n,value) {
                    if(value.name==""||value.name==null||value.name==undefined||JSON.stringify(value.name) == "{}"||value.name.length==0){
                        props=props+0;
                    }else{
                        props=props+1;
                    }
                });
                if(props==0){
                    $scope.panel=false;
                }else{
                    $scope.panel=true;
                }
            }
        },
        link:function (scope,element,attr) {
        }
    }
})