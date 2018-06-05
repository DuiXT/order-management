app.controller("mainCont",["$scope","$http", "$rootScope",function($scope,$http,$rootScope){
    function transData(a, idStr, pidStr, childrenStr) {
        var r = [], hash = {}, code = idStr, parentCode = pidStr, children = childrenStr, i = 0, j = 0, len = a.length;
        for (; i < len; i++) {
            hash[a[i][code]] = a[i];
        }
        for (; j < len; j++) {
            var aVal = a[j], hashVP = hash[aVal[parentCode]];
            if (hashVP) {
                !hashVP[children] && (hashVP[children] = []);
                hashVP[children].push(aVal);
            } else {
                r.push(aVal);
            }
        }
        return r;
    }

    function listfo()
    {

        $http({
            method: "GET",
            url: "/userRule/rule",
        }).then(function (res) {
            console.log(res)
            if(res.data.jsonUser.success&&res.data.jsonUser.executed){
                var riskContAuth=res.data.role[0].roleCode=="ROLE00014"||res.data.role[0].roleCode=="ROLE00015"||res.data.role[0].roleCode=="ROLE00016"||res.data.role[0].roleCode=="ROLE00017"||res.data.role[0].roleCode=="ROLE00001"?'hasAuth':'notHasAuth';
                $scope.$broadcast('role',riskContAuth)
                $scope.namettt=res.data.jsonUser.admin.name;
                $scope.leafs = res.data.jsonUser.admin.leafs;
                $scope.jsonDataTree = transData($scope.leafs, 'code', 'parentCode', 'children');
                console.log($scope.jsonDataTree)
                angular.forEach($scope.jsonDataTree, function (d, index) {
                    $scope.namest = $scope.jsonDataTree[index].name;
                    $scope.child = $scope.jsonDataTree[index].children;
                });
            }else {
                console.log(res.data.jsonUser.message);
                $rootScope.alertPart(res.data.jsonUser.message)
            }
        }, function () {
            $rootScope.alertPart("请求失败！")
        })
    }

    listfo();
    $scope.signOut=function(){
        window.location.href=window.location.origin + "/logout"
    }

    $scope.seconds=30;
    $scope.open=true;
    $scope.refreshInter=function () {
        var patern= /^\d*?\.?\d*?$/;
        if(!patern.test($scope.seconds)||$scope.seconds<30){
            $scope.seconds=30;
        };
        var broadcastCt={
            time:$scope.seconds,
            open:$scope.open
        };
        $scope.$broadcast('refreshInter',broadcastCt)

    }


    $scope.refreshInter();
    $scope.$watch('open',function (p1, p2, p3) {
        console.log(p1)
        console.log(p2)
        $scope.refreshInter()
    })

}]);




