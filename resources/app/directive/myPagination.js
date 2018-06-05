/**
 * Created by Administrator on 2018/1/9.
 */
app.directive('myPagination', function () {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            pageOption: '=',
            go: '=',
            alert:'&'
        },
        templateUrl:'template/myPagination.html',
        link: function ($scope) {
            //容错处理
            if (!$scope.pageOption.curr || isNaN($scope.pageOption.curr) || $scope.pageOption.curr < 1) $scope.pageOption.curr = 1;
            if (!$scope.pageOption.all || isNaN($scope.pageOption.all) || $scope.pageOption.all < 1) $scope.pageOption.all = 1;
            if ($scope.pageOption.curr > $scope.pageOption.all) $scope.pageOption.curr = $scope.pageOption.all;
            if (!$scope.pageOption.count || isNaN($scope.pageOption.count) || $scope.pageOption.count < 1) $scope.pageOption.count = 10;
            //得到显示页数的数组
            $scope.$watch('pageOption',function (p1,p2) {
                $scope.page = getRange($scope.pageOption.curr, $scope.pageOption.all, $scope.pageOption.count);
            })
            //绑定点击事件
            $scope.pageClick = function (page,size) {
                if (page === '上一页') {
                    page = parseInt($scope.pageOption.curr) - 1;
                } else if (page === '下一页') {
                    page = parseInt($scope.pageOption.curr) + 1;
                }else if(page === '首页'){
                    page=1;
                }else if(page === '尾页'){
                    page=$scope.pageOption.all;
                }
                if (page < 1) page = 1;
                else if (page > $scope.pageOption.all) page = $scope.pageOption.all;
                //点击相同的页数 不执行点击事件
                if (page == $scope.pageOption.curr) return;
                if ($scope.pageOption.click && typeof $scope.pageOption.click === 'function') {
                    $scope.pageOption.click(page,size);
                    $scope.pageOption.curr = page;
                    $scope.page = getRange($scope.pageOption.curr, $scope.pageOption.all, $scope.pageOption.count);
                }
            };

            $scope.jump=function (nmb) {
                if(nmb>=1&&nmb<=$scope.pageOption.all){
                    $scope.pageClick(nmb);
                }else{
                    $scope.alert();
                    $scope.go=""
                }
            };
            $scope.changeSize=function (page,size) {
                $scope.pageOption.changeSize(page,size);
            }

            //返回页数范围（用来遍历）
            function getRange(curr, all, count) {
                //计算显示的页数
                curr = parseInt(curr);
                all = parseInt(all);
                count = parseInt(count);
                var from = curr - parseInt(count / 2);
                var to = curr + parseInt(count / 2) + (count % 2) - 1;
                //显示的页数容处理
                if (from <= 0) {
                    from = 1;
                    to = from + count - 1;
                    if (to > all) {
                        to = all;
                    }
                }
                if (to > all) {
                    to = all;
                    from = to - count + 1;
                    if (from <= 0) {
                        from = 1;
                    }
                }
                var range = [];
                for (var i = from; i <= to; i++) {
                    range.push(i);
                }
                range.push('下一页');
                range.unshift('上一页');
                range.push('尾页');
                range.unshift('首页');
                return range;
            }

        }
    }
});