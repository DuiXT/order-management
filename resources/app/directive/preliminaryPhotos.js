/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("preliminaryPhotos",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/preliminaryPhotos.html',
        replace: true,
        scope:{
            data:'=',
            btn:'=',
            rejectPhoto:'=',
            userInfo:'@',
            listImg:'='
        },
        controller:function($scope,$http,$rootScope,uploadUrl){
            console.log($scope.data);
            //替换图片路径
            if($scope.data.identityJ!==null&&$scope.data.identityJ.imgUrl!==null){
                $scope.identityJOrigion=$scope.data.identityJ.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN");
            }
            if($scope.data.identityB!==null&&$scope.data.identityB.imgUrl!==null){
                $scope.identityBOrigion=$scope.data.identityB.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN");
            }
            if($scope.data.holdIdentity!==null&&$scope.data.holdIdentity.imgUrl!==null){
                $scope.holdIdentityOrigion=$scope.data.holdIdentity.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN");
            }
            if($scope.data.confim!==null&&$scope.data.confim.imgUrl!==null){
                $scope.confimOrigion=$scope.data.confim.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN");
            }
            if($scope.data.informCard!==null&&$scope.data.informCard.imgUrl!==null){
                $scope.informOrigion=$scope.data.informCard.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN");
            }
            if($scope.data.bankcard!==null&&$scope.data.bankcard.imgUrl!==null){
                $scope.bankcardOrigion=$scope.data.bankcard.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN");
            }


            //判断客户信息是否存在
            $scope.panel=true;
            if(JSON.stringify($scope.data) === "{}"||$scope.data===null||$scope.data.length===0||$scope.data===undefined||$scope.data===""){
                $scope.panel=false;
            }else{
                var props = 0;
                for(var p in $scope.data){
                    if($scope.data[p]===""||$scope.data[p]===null||$scope.data[p]===undefined||$scope.data[p].length===0||JSON.stringify($scope.data[p]) === "{}"){
                        props=props+0;
                    }else{
                        props=props+1;
                    }
                }
                if(props===0){
                    $scope.panel=false;
                }else{
                    $scope.panel=true;
                }
            }

            function addOtherPic() {
                $scope.noElse=false;
                // 动态插入其他照片，ng-repeat和viewer.js冲突
                var pDiv=$("#lalalamove");
                angular.forEach($scope.data.others,function (item,idx) {
                    var imgUrl=item.imgUrl?item.imgUrl:'../../resources/img/none.png';
                    var imgOrigin=item.imgUrl?item.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN"):'../../resources/img/none.png';
                    var template="<img src='"+imgUrl+"' alt='图片"+(idx+1)+"' data-original='"+imgOrigin+"'>";
                    pDiv.append(template);
                });
                // 只显示第一张
                angular.forEach(pDiv.children(),function (item) {
                    if(item.alt==="图片1"){
                        item.style.display="block";
                    }else {
                        item.style.display="none";
                    }

                })
            }
            if($scope.data&&$scope.data.others){
                if($scope.data.others.length>0) {
                    addOtherPic()
                    $scope.othersCount=$scope.data.others.length
                }else {
                    $scope.noElse=true;
                    $scope.othersCount=0
                }
            }else {
                $scope.noElse=true;
                $scope.othersCount=0
            }

        },
        link:function (scope,element,attr) {
            var viewer1 = new Viewer(document.getElementById('dowebok1'), {
                imgUrl: 'data-original'
            });
            var viewer2 = new Viewer(document.getElementById('dowebok2'), {
                imgUrl: 'data-original'
            });
            var viewer3 = new Viewer(document.getElementById('dowebok3'), {
                imgUrl: 'data-original'
            });
            var viewer4 = new Viewer(document.getElementById('dowebok4'), {
                imgUrl: 'data-original'
            });
            var viewer5 = new Viewer(document.getElementById('dowebok5'), {
                imgUrl: 'data-original'
            });
            var viewer6 = new Viewer(document.getElementById('lalalamove'), {
                imgUrl: 'data-original'
            });
            var viewer7 = new Viewer(document.getElementById('dowebok6'), {
                imgUrl: 'data-original'
            });

            //更换照片操作记录
            scope.replaceImgOper=function(){
                $('#replaceImgOper-data').modal({backdrop: 'static', keyboard: false});
                $("#replaceImgOper-data").modal("show");
                scope.getRecord();
            }
            scope.Modifyphotos=function () {
                scope.editPicture=!scope.editPicture;//显示更换图片的按钮
                if(scope.data&&scope.data.others){//如果其他照片为空的话不显示更换照片的按钮
                    if(scope.data.others.length>0){
                        scope.editOtherPicture=!scope.editOtherPicture;
                    }else {
                        scope.editOtherPicture=false;
                    }
                }else {
                    scope.editOtherPicture=false;
                }
            }
        }

    }
})