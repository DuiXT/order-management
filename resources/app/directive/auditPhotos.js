/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("auditPhotos",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/auditPhotos.html',
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
            if($scope.data.identityJ!==null&&$scope.data.identityJ.url!==null){
                $scope.identityJOrigion=$scope.data.identityJ.url.replace(/SMALL|MEDIUM/, "ORIGIN")
            }
            if($scope.data.identityB!==null&&$scope.data.identityB.url!==null){
                $scope.identityBOrigion=$scope.data.identityB.url.replace(/SMALL|MEDIUM/, "ORIGIN")
            }
            if($scope.data.holdIdentity!==null&&$scope.data.holdIdentity.url!==null){
                $scope.holdIdentityOrigion=$scope.data.holdIdentity.url.replace(/SMALL|MEDIUM/, "ORIGIN")
            }
            if($scope.data.confim!==null&&$scope.data.confim.url!==null){
                $scope.confimOrigion=$scope.data.confim.url.replace(/SMALL|MEDIUM/, "ORIGIN")
            }
            if($scope.data.informCard!==null&&$scope.data.informCard.url!==null){
                $scope.informOrigion=$scope.data.informCard.url.replace(/SMALL|MEDIUM/, "ORIGIN")
            }
            if($scope.data.others!==null){
                if($scope.data.others.length>0){
                    angular.forEach($scope.data.others,function (obj) {
                        obj.urlOrigin=obj.url.replace(/SMALL|MEDIUM/, "ORIGIN");
                    })
                }
            }

            //判断客户信息是否存在
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

            function addOtherPic() {
                $scope.noElse=false;
                // 动态插入其他照片，ng-repeat和viewer.js冲突
                var pDiv=$("#lalalamove");
                angular.forEach($scope.data.others,function (item,idx) {
                    var imgUrl=item.url?item.urlOrigin:'../../resources/img/none.png';
                    var template="<img src='"+imgUrl+"' alt='图片"+(idx+1)+"' data-original='"+imgUrl+"'>";
                    pDiv.append(template);
                });
                // 只显示第一张
                angular.forEach(pDiv.children(),function (item) {
                    if(item.alt=="图片1"){
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

            //上传图片
            var insert = true;
            var otherInsert = true;
            $scope.single=[];  /*单张*/
            var tempArr=[];//对照数组  多张
            var targetAlt;
            $scope.mainimg_upload = function(files,obj,aa) {//单次提交图片的函数
                var postfix = files[0].name.substring(files[0].name.lastIndexOf(".") + 1).toLowerCase();
                if (postfix != "jpg" && postfix != "png") {
                    $rootScope.alertPart("图片仅支持png、jpg类型的文件");
                    $scope.$apply()
                    return false;
                }
                var progress = $(obj).parent().parent().parent().children('img');
                progress.show()
                $scope.guid = (new Date()).valueOf();   //通过时间戳创建一个随机数，作为键名使用
                var data = new FormData();      //以下为像后台提交图片数据
                data.append('file', files[0]);
                data.append('guid',$scope.guid);
                $http({
                    method: 'POST',
                    url: uploadUrl.url+'/attachment',
                    data:data,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }).then(function(res) {
                    console.log(res)
                    $scope.picBox=res.data.data.filePath;
                    if (res.data.success) {
                        //后台返回的图片地址
                        $(obj).parent().prev().attr("src",res.data.data.filePath)
                        $(obj).parent().prev().attr("data-original", res.data.data.filePath);
                        var targetAlt=$(obj).parent().prev().attr("alt");
                        if(aa=='doubleList')
                        {
                            var isExist=true;
                            //判断是否为二次修改，如果是仅替换路径，不进行插入操作
                            for(var i=0;i<$scope.listImg.length;i++){
                                if($scope.listImg[i].imgTypeCode == 'OTHERS'){
                                    for(var j=0;j<tempArr.length;j++){
                                        if(tempArr[j].type==targetAlt){
                                            $scope.listImg[i].listImg[j].imgUrl=res.data.data.filePath;
                                            isExist=false;
                                            break;
                                        }
                                    }
                                    otherInsert=false;
                                    if(isExist){
                                        var listImgUrlObj={
                                            "imgTypeno": obj.attributes['img-type-number'].nodeValue,
                                            "imgUrl":res.data.data.filePath
                                        };
                                        $scope.listImg[i].listImg.push(listImgUrlObj);
                                    }
                                    break;
                                }else {
                                    otherInsert=true;
                                }
                            };
                            // 首次更换图片
                            if(otherInsert){
                                var picObj = {
                                    "imgTypeCode": obj.attributes['img-type-code'].nodeValue,
                                    "listImg": [
                                        {
                                            "imgTypeno":obj.attributes['img-type-number'].nodeValue,
                                            "imgUrl": res.data.data.filePath
                                        }
                                    ]
                                };
                                $scope.listImg.push(picObj);
                            };
                            //新建一个对照数组，判断是否二次修改【其他照片】里的同一张图片
                            var tempObj={
                                "type":targetAlt,
                                "src":res.data.data.filePath
                            };
                            var tempInsert=true;
                            if(tempArr.length==0){
                                tempArr.push(tempObj);
                            }else {
                                for(var i=0;i<tempArr.length;i++){
                                    if(tempArr[i].type==targetAlt){
                                        tempArr[i].src=res.data.data.filePath;
                                        tempInsert=false;
                                        break;
                                    }
                                }
                                if(tempInsert){
                                    tempArr.push(tempObj);

                                }
                            };
                            console.log($scope.listImg)
                        }
                        else
                        {

                            //判断是否为二次修改，如果是仅替换路径，不进行插入操作
                            for(var i=0;i<$scope.listImg.length;i++){
                                if($scope.listImg[i].imgTypeCode == obj.attributes['img-type-code'].nodeValue){
                                    insert = false;
                                    $scope.listImg[i].listImg[0].imgUrl= res.data.data.filePath;
                                    break;
                                }else {
                                    insert = true;
                                }
                            }
                            if (insert) {
                                var picObj = {
                                    "imgTypeCode": obj.attributes['img-type-code'].nodeValue,
                                    "listImg": [
                                        {
                                            "imgTypeno": obj.attributes['img-sid'].nodeValue,
                                            "imgUrl": res.data.data.filePath
                                        }
                                    ]
                                };
                                $scope.listImg.push(picObj);
                                $scope.single.push($scope.listImg);

                            }
                            //console.log($scope.listImg)
                            console.log($scope.single)
                        }
                    }else {
                        progress.hide()
                        $rootScope.alertPart("上传失败！")
                    }
                    if(res.status=="200"){
                        $(".quan").hide()
                        progress.hide()
                    }

                },function () {
                    progress.hide()
                    $rootScope.alertPart("上传失败！")
                })

            };


            /*点击上传多张图片确定*/
            $scope.sureImgs=function()
            {
                console.log(tempArr)
                var showOtherPic=$("#lalalamove").children();
                // 修改展示照片中的src
                for(var i=0;i<tempArr.length;i++){
                    for(var j=0;j<showOtherPic.length;j++){
                        if(tempArr[i].type==showOtherPic[j].alt){
                            showOtherPic[j].src=tempArr[i].src;
                            showOtherPic[j].attributes["data-original"].nodeValue=tempArr[i].src;
                            break;
                        }
                    }
                }
                $("#change_others_pic").modal("hide");

            }



            //信审照片操作记录
            var orderCode=JSON.parse($scope.userInfo).orderCode;
            $scope.operRecordData=false;
            $scope.getRecord=function(){
                $http({
                    method: 'GET',
                    url: "/operatorRecord/"+orderCode+"/getCreditImgRecord",
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

        },
        link:function (scope,element,attr) {
            var viewer1 = new Viewer(document.getElementById('dowebok1'), {
                url: 'data-original'
            });
            var viewer2 = new Viewer(document.getElementById('dowebok2'), {
                url: 'data-original'
            });
            var viewer3 = new Viewer(document.getElementById('dowebok3'), {
                url: 'data-original'
            });
            var viewer4 = new Viewer(document.getElementById('dowebok4'), {
                url: 'data-original'
            });
            var viewer5 = new Viewer(document.getElementById('dowebok5'), {
                url: 'data-original'
            });
            var viewer6 = new Viewer(document.getElementById('lalalamove'), {
                url: 'data-original'
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