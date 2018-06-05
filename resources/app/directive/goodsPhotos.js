/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("goodsPhotos", function () {
    return {
        restrict: 'A',
        templateUrl: 'template/goodsPhotos.html',
        replace: true,
        scope: {
            data: '=',
            rejectPhoto: '=',
            btn: '=',
            listImg: '=',
            rejectListImg: '=',
            userInfo: '@'
        },
        controller: function ($scope, $http, $rootScope,uploadUrl) {
            console.log($scope.data);
            //替换图片路径
            if($scope.data.bankcard!==null&&$scope.data.bankcard.imgUrl!==null){
                $scope.bankcardOrigion=$scope.data.bankcard.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN")
            }
            if($scope.data.group!==null&&$scope.data.group.imgUrl!==null){
                $scope.groupOrigion=$scope.data.group.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN")
            }
            if($scope.data.stringCode!==null&&$scope.data.stringCode.imgUrl!==null){
                $scope.stringCodeOrigion=$scope.data.stringCode.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN")
            }
            if($scope.data.stringCodeShot!==null&&$scope.data.stringCodeShot.imgUrl!==null){
                $scope.stringCodeShotOrigion=$scope.data.stringCodeShot.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN")
            }
            if($scope.data.self!==null&&$scope.data.self.imgUrl!==null){
                $scope.selfOrigion=$scope.data.self.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN")
            }
            if($scope.data.others!==null){
                if($scope.data.others.length>0){
                    angular.forEach($scope.data.others,function (obj) {
                        obj.urlOrigin=obj.imgUrl.replace(/SMALL|MEDIUM/, "ORIGIN");
                    })
                }
            }
            var viewer1 = new Viewer(document.getElementById('dowebok11'), {
                url: 'data-original'
            });
            var viewer2 = new Viewer(document.getElementById('dowebok22'), {
                url: 'data-original'
            });
            var viewer3 = new Viewer(document.getElementById('dowebok33'), {
                url: 'data-original'
            });
            var viewer33 = new Viewer(document.getElementById('dowebok333'), {
                url: 'data-original'
            });
            var viewer4 = new Viewer(document.getElementById('dowebok44'), {
                url: 'data-original'
            });

            //判断提货照片信息是否存在
            $scope.panel = true;
            if (JSON.stringify($scope.data) == "{}" || $scope.data == null || $scope.data.length == 0 || $scope.data == undefined || $scope.data == "") {
                $scope.panel = false;
            } else {
                var props = 0;
                for (var p in $scope.data) {
                    if ($scope.data[p] == "" || $scope.data[p] == null || $scope.data[p] == undefined || $scope.data[p].length == 0 || JSON.stringify($scope.data[p]) == "{}") {
                        props = props + 0;
                    } else {
                        props = props + 1;
                    }
                }
                if (props == 0) {
                    $scope.panel = false;
                } else {
                    $scope.panel = true;
                }
            }
            function addOtherPic() {
                    $scope.noElse=false;
                    // 动态插入其他照片，ng-repeat和viewer.js冲突
                    var pDiv = $("#dowebok6555");
                    angular.forEach($scope.data.others, function (item, idx) {
                        var imgUrl=item.imgUrl?item.urlOrigin:'../../resources/img/none.png';
                        var template = "<img src='" + imgUrl + "' alt='图片" + (idx + 1) + "' data-original='" + imgUrl + "'>";
                        pDiv.append(template);
                    });
                    // 只显示第一张
                    angular.forEach(pDiv.children(), function (item) {
                        if (item.alt == "图片1") {
                            item.style.display = "block";
                        } else {
                            item.style.display = "none";
                        }
                    })
                var viewer6 = new Viewer(document.getElementById('dowebok6555'), {
                    url: 'data-original'
                });
            }
            if($scope.data&&$scope.data.others){
                if($scope.data.others.length>0){
                    $scope.othersCount=$scope.data.others.length;
                    addOtherPic();
                }else {
                    $scope.noElse=true;
                    $scope.othersCount=0;
                }
            }else {
                $scope.noElse=true;
                $scope.othersCount=0;
            }

            var insert = true;
            var otherInsert = true;
            var tempArr = [];//对照数组
            //上传单张照片
            $scope.mainimg_upload = function (files, obj) {
                console.log(obj)
                console.log(files)
                var postfix = files[0].name.substring(files[0].name.lastIndexOf(".") + 1).toLowerCase();
                if (postfix != "jpg" && postfix != "png") {
                    alert("图片仅支持png、jpg类型的文件");
                    return false;
                }
                var progress = $(obj).parent().parent().parent().children('img');
                progress.show();
                $scope.guid = (new Date()).valueOf();   //通过时间戳创建一个随机数，作为键名使用
                var data = new FormData();      //以下为像后台提交图片数据
                data.append('file', files[0]);
                data.append('guid', $scope.guid);
                $http({
                    method: 'POST',
                    url: uploadUrl.url+'/attachment',
                    data: data,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }).then(function (res) {
                    if (res.data.success){
                    //后台返回的图片地址
                    $(obj).parent().prev().attr("src", res.data.data.filePath);
                    $(obj).parent().prev().attr("data-original", res.data.data.filePath);
                    //判断是否为二次修改，如果是仅替换路径，不进行插入操作
                    for (var i = 0; i < $scope.listImg.length; i++) {
                        if ($scope.listImg[i].pickupImageType == obj.attributes['img-type-code'].nodeValue) {
                            insert = false;
                            $scope.listImg[i].listImg[0].imgUrl = res.data.data.filePath;
                            break;
                        } else {
                            insert = true;
                        }
                    }
                    if (insert) {
                        var picObj = {
                            "pickupImageType": obj.attributes['img-type-code'].nodeValue,
                            "listImg": [
                                {
                                    "imgTypeno": obj.attributes['img-sid'].nodeValue,
                                    "imgUrl": res.data.data.filePath
                                }
                            ]
                        };
                        $scope.listImg.push(picObj);
                    }
                        console.log($scope.listImg)
                    if (res.status === 200) {
                        progress.hide();
                    }

                    if (obj.attributes['img-type-code'].nodeValue == 'STRINGCODE_SHOT') {
                        $scope.data.shotCode = '';
                        $http({
                            method: 'GET',
                            url: "/order/getImgStringCode?imgUrl=" + res.data.data.filePath
                        }).then(function (res) {
                            console.log(res)
                            if (res.data.executed && res.data.success) {
                                $scope.data.shotCode = res.data.stringCode;
                            } else {
                                $rootScope.alertPart("无法识别串码特写照片，请重新上传！");
                            }
                        }, function (err) {
                            $rootScope.alertPart("无法识别串码特写照片，请重新上传！");
                            console.log(err);
                        })
                    }
                    }else {
                        progress.hide();
                        alert("上传失败！");
                    }
                }, function () {
                    progress.hide();
                    alert("上传失败！");
                })
            };

            //上传其他照片
            $scope.other_upload = function (files, obj) {
                var postfix = files[0].name.substring(files[0].name.lastIndexOf(".") + 1).toLowerCase();
                if (postfix != "jpg" && postfix != "png") {
                    alert("图片仅支持png、jpg类型的文件");
                    return false;
                }
                var progress = $(obj).parent().parent().next();
                progress.show();
                $scope.guid = (new Date()).valueOf();   //通过时间戳创建一个随机数，作为键名使用
                var data = new FormData();      //以下为像后台提交图片数据
                data.append('file', files[0]);
                data.append('guid', $scope.guid);
                $http({
                    method: 'POST',
                    url: uploadUrl.url+'/attachment',
                    data: data,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }).then(function (res) {
                    //后台返回的图片地址
                    $(obj).parent().prev().attr("src", res.data.data.filePath);
                    $(obj).parent().prev().attr("data-original", res.data.data.filePath);
                    var targetAlt = $(obj).parent().prev().attr("alt");
                    var isExist = true;
                    //判断是否为二次修改，如果是仅替换路径，不进行插入操作
                    for (var i = 0; i < $scope.listImg.length; i++) {
                        if ($scope.listImg[i].pickupImageType == 'OTHERS') {
                            for (var j = 0; j < tempArr.length; j++) {
                                if (tempArr[j].type == targetAlt) {
                                    $scope.listImg[i].listImg[j].imgUrl = res.data.data.filePath;
                                    isExist = false;
                                    break;
                                }
                            }
                            otherInsert = false;
                            if (isExist) {
                                var listImgUrlObj = {
                                    "imgTypeno": obj.attributes['img-type-number'].nodeValue,
                                    "imgUrl": res.data.data.filePath
                                };
                                $scope.listImg[i].listImg.push(listImgUrlObj);
                            }
                            break;
                        } else {
                            otherInsert = true;
                        }
                    }
                    ;
                    // 首次更换图片
                    if (otherInsert) {

                        var picObj = {
                            "pickupImageType": obj.attributes['img-type-code'].nodeValue,
                            "listImg": [
                                {
                                    "imgTypeno": obj.attributes['img-type-number'].nodeValue,
                                    "imgUrl": res.data.data.filePath
                                }

                            ]
                        };
                        $scope.listImg.push(picObj);
                    }
                    ;
                    //新建一个对照数组，判断是否二次修改【其他照片】里的同一张图片
                    var tempObj = {
                        "type": targetAlt,
                        "src": res.data.data.filePath
                    };
                    var tempInsert = true;
                    if (tempArr.length == 0) {
                        tempArr.push(tempObj);
                    } else {
                        for (var i = 0; i < tempArr.length; i++) {
                            if (tempArr[i].type == targetAlt) {
                                tempArr[i].src = res.data.data.filePath;
                                tempInsert = false;
                                break;
                            }
                        }
                        if (tempInsert) {
                            tempArr.push(tempObj);
                        }
                    }
                    ;
                    console.log($scope.listImg);
                    if (res.status == 200) {
                        progress.hide();
                    }
                }, function () {
                    alert("提交失败！");
                })
            };

            //打开修改其他照片模态窗
            $scope.modifyOtherPic = function () {
                $('#change_others_pic').modal({backdrop: 'static', keyboard: false});
                $("#change_others_pic").modal("show");
            }
            //------确定
            $scope.otherPicConfirm = function () {
                $("#change_others_pic").modal("hide");
                console.log($scope.listImg);
                var showOtherPic = $("#dowebok6555").children();
                // 修改展示照片中的src
                for (var i = 0; i < tempArr.length; i++) {
                    for (var j = 0; j < showOtherPic.length; j++) {
                        if (tempArr[i].type == showOtherPic[j].alt) {
                            showOtherPic[j].src = tempArr[i].src;
                            showOtherPic[j].attributes["data-original"].nodeValue = tempArr[i].src;
                            break;
                        }
                    }
                }
            };
            //提货照片操作记录
            $scope.operRecordData = false;
            var orderCode = JSON.parse($scope.userInfo).orderCode;
            $scope.getRecord = function () {
                $http({
                    method: 'GET',
                    url: "/operatorRecord/" + orderCode + "/getPicupImgRecord",
                }).then(function successCallback(response) {
                    if (response.data.executed && response.data.success) {
                        $scope.resultList = response.data.resultData;
                        if($scope.resultList){
                            if($scope.resultList.length>0){
                                $scope.operRecordData = false;
                            }else {
                                $scope.operRecordData = true;
                            }
                        }else {
                            $scope.operRecordData = true;
                        }
                    } else {
                        $scope.operRecordData = true;
                    }
                }, function errorCallback(response) {
                    console.log("查询失败！")
                });
            }
        },
        link: function (scope, element, attr) {

            //更换提货照片操作记录
            scope.A_replaceGoodsImgOper = function () {
                $('#A_replaceGoodsImgOper-data').modal({backdrop: 'static', keyboard: false});
                $("#A_replaceGoodsImgOper-data").modal("show");
                scope.getRecord();
            };
            scope.editPic = function () {
                scope.editPicture = !scope.editPicture;//显示更换图片的按钮
                if(scope.data&&scope.data.others){//如果其他照片为空的话不显示更换照片的按钮
                    if(scope.data.others.length>0){
                        scope.editOtherPicture=!scope.editOtherPicture
                    }else {
                        scope.editOtherPicture=false;
                    }
                }else {
                    scope.editOtherPicture=false;
                }
            };
            scope.changePhoto = "更换照片";

        }
    }
})