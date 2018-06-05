/**
 * Created by chigantingting on 2017/12/4.
 */
app.directive("backList",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/backList.html',
        replace: true,
        scope:{
            goBack:'&'
        },
        link:function (scope,element,attr) {
            // 返回
            scope.back=function () {
                scope.goBack()
            }
        }
    }
})