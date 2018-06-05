/**
 * Created by Administrator on 2018/4/9.
 */
/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("remarkInfo",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/remarkInfo.html',
        replace: true,
        scope:{
            data:'='
        },
        controller:function($scope){
            console.log($scope.data);
            if($scope.data){
                $scope.panel=true
            }else {
                $scope.panel=false
            }
        }
    }
})