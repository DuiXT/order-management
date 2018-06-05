/**
 * Created by Administrator on 2018/1/19.
 */
app.directive('treeView',[function(){

    return {
        restrict: 'E',
        templateUrl: '/treeView.html',
        scope: {
            treeData: '=',
            canChecked: '=',
            textField: '@',
            itemClicked: '&',
            itemCheckedChanged: '&'
        },
        controller:['$scope', function($scope){
            /*点击展开或者收起*/
            $scope.itemExpended = function(item, $event){
                item.$$isExpend = ! item.$$isExpend;
                $event.stopPropagation();
            };
            // 判断展开节点样式
            $scope.getItemIcon = function(item){
                var isLeaf = $scope.isLeaf(item);
                if(!isLeaf){
                    return item.$$isExpend ? 'icon expand-icon glyphicon glyphicon-unchecked': 'icon expand-icon glyphicon glyphicon-stop';
                }

            };
            // 判断箭头方向
            $scope.getItemArrow=function (item) {
                var isLeaf = $scope.isLeaf(item);
                if(!isLeaf){
                    return item.$$isExpend ? 'glyphicon glyphicon-chevron-down': 'glyphicon glyphicon-chevron-right';
                }

            }

            $scope.isLeaf = function(item){
                return !item.nodes || !item.nodes.length;
            };

            /*点击获取节点*/
            $scope.warpCallback = function(callback, item, $event){
                ($scope[callback] || angular.noop)({
                    $item:item,
                    $event:$event
                });
            };
        }]
    };
}])