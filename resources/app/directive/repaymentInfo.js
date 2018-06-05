/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("repaymentInfo",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/repaymentInfo.html',
        replace: true,
        scope:{
            data:'=',
            btn:'=',
            userInfo:'@',
            getData:'&',
            userName:'@',
            rpbtn:"=",
            due:'='
        },
        controller:function($scope,$http,uploadUrl,$rootScope){
            console.log($scope.data)
            console.log($scope.btn);
            //判断还款信息是否存在
            $scope.panel=true;
            if(JSON.stringify($scope.data) == "{}"||$scope.data==null||$scope.data.length==0||$scope.data==undefined||$scope.data==""){
                $scope.panel=false;
            }else{
                var props = 0;
                $.each($scope.data,function(n,value) {
                    if((value.payTime==""||value.payTime==null||value.payTime==undefined||value.payTime.length==0||JSON.stringify(value.payTime) == "{}")&&
                        (value.totalAmount==""||value.totalAmount==null||value.totalAmount==undefined||value.totalAmount.length==0||JSON.stringify(value.totalAmount) == "{}")&&
                        (value.capitalAmount==""||value.capitalAmount==null||value.capitalAmount==undefined||value.capitalAmount.length==0||JSON.stringify(value.capitalAmount) == "{}")&&
                        (value.interesAmount==""||value.interesAmount==null||value.interesAmount==undefined||value.interesAmount.length==0||JSON.stringify(value.interesAmount) == "{}")&&
                        (value.otheAmount==""||value.otheAmount==null||value.otheAmount==undefined||value.otheAmount.length==0||JSON.stringify(value.otheAmount) == "{}")&&
                        (value.overduefineAmount==""||value.overduefineAmount==null||value.overduefineAmount==undefined||value.overduefineAmount.length==0||JSON.stringify(value.overduefineAmount) == "{}")&&
                        (value.shouldTotalAmount==""||value.shouldTotalAmount==null||value.shouldTotalAmount==undefined||value.shouldTotalAmount.length==0||JSON.stringify(value.shouldTotalAmount) == "{}")&&
                        (value.expectedRepayDate==""||value.expectedRepayDate==null||value.expectedRepayDate==undefined||value.expectedRepayDate.length==0||JSON.stringify(value.expectedRepayDate) == "{}")&&
                        (value.realRepayTime==""||value.realRepayTime==null||value.realRepayTime==undefined||value.realRepayTime.length==0||JSON.stringify(value.realRepayTime) == "{}")&&
                        (value.payType==""||value.payType==null||value.payType==undefined||value.payType.length==0||JSON.stringify(value.payType) == "{}")&&
                        (value.payState==""||value.payState==null||value.payState==undefined||value.payState.length==0||JSON.stringify(value.payState) == "{}")
                    ){
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
            //还款信息操作记录
            $scope.getRecord=function(){
                var orderCode=JSON.parse($scope.userInfo).orderCode;
                console.log($scope.userInfo)
                $http({
                    method: 'GET',
                    url: "/operatorRecord/"+orderCode+"/getRepaymentRecord"
                }).then(function successCallback(response) {
                    if(response.data.executed && response.data.success){
                        $scope.resultList=response.data.resultData;
                        if($scope.resultList.length>0){
                            $scope.operRecordDatas=false;
                        }else {
                            $scope.operRecordDatas=true;
                        }
                    }else{
                        $scope.operRecordDatas=true;
                    }
                }, function errorCallback(response) {
                    $rootScope.alertPart("获取还款信息操作记录失败！");
                    $scope.operRecordDatas=true;
                    console.log(response)
                });
            }
            //获取当前年月日
            var currDate;
            $scope.getCurrDate=function () {
                $scope.errDate=false;
                var date=new Date();
                var year=date.getFullYear();
                var month=date.getMonth()+1>9?date.getMonth()+1:'0'+(date.getMonth()+1);
                var day=date.getDate()>9?date.getDate():'0'+date.getDate();
                var mydate=year+'-'+month+'-'+day;
                currDate=mydate;
                $scope.actualTransDate=mydate;
            };
            //失去焦点时写入数据
            $scope.getDate=function () {
                $("#actualTransDate").val($scope.actualTransDate)
            }
            //判断实际转账日期
            $scope.judgeDate=function () {
                $scope.emptyDate=false;
                if($scope.actualTransDate&&$scope.actualTransDate>currDate){
                    $scope.errDate=true;
                }else {
                    $scope.errDate=false;
                }
            };
            //主动还款操作记录
            $scope.getActiveRecord=function (paytime) {
                var orderCode=JSON.parse($scope.userInfo).orderCode;
                $http({
                    method:'GET',
                    url:"/operatorRecord/"+orderCode+"/"+paytime+"/getRepayRecord"
                }).then(function (res) {
                    console.log(res);
                    if(res.data.success&&res.data.executed){
                        $scope.activeRecordList=res.data.resultData;
                        if($scope.activeRecordList.length>0){
                            $scope.activeRecordData=false;
                            angular.forEach($scope.activeRecordList,function (obj) {
                                if(obj.operatorImg&&obj.operatorImg.length>0){
                                    angular.forEach(obj,function (objj) {
                                        objj=objj.replace(/SMALL|MEDIUM/, "ORIGIN")
                                    })
                                }
                            })
                        }else {
                            $scope.activeRecordData=true;
                        }
                    }else {
                        $scope.activeRecordData=true;
                    }
                },function (res) {
                    $rootScope.alertPart("获取还款操作记录失败！");
                    $scope.activeRecordData=true;
                    console.log(res)
                })
            }
            //查询线下一次结清预计金额
            $scope.getRepaymentSettledOffline=function () {
                var orderCode=JSON.parse($scope.userInfo).orderCode;
                $http({
                    method:'GET',
                    url:"/repayment/"+orderCode+"/getRepaymentSettledOffline"
                }).then(function (res) {
                    console.log(res);
                    if(res.data.success&&res.data.executed){
                        $('#A_lineOffOper-data').modal({backdrop: 'static', keyboard: false});
                        $("#A_lineOffOper-data").modal("show");
                        $scope.monthPay=res.data.monthPay;
                        $scope.surplusCapital =res.data.surplusCapital;
                        $scope.overdueMoney=res.data.overdueMoney;
                        $scope.breakContractMoney=res.data.breakContractMoney;
                        $scope.expectedMoney =res.data.expectedMoney;
                    }else {
                        $rootScope.alertPart(res.data.message);
                        $scope.monthPay=null;
                        $scope.surplusCapital=null;
                        $scope.overdueMoney=null;
                        $scope.breakContractMoney=null;
                        $scope.expectedMoney=null;
                    }
                },function (res) {
                    $rootScope.alertPart("查询线下一次结清预计金额失败！")
                    console.log(res)
                })
            };
            //查询线上一次结清预计金额
            $scope.getRepaymentSettledOnline=function () {
                var orderCode=JSON.parse($scope.userInfo).orderCode;
                $http({
                    method:'GET',
                    url:"/repayment/"+orderCode+"/getRepaymentSettledOnline"
                }).then(function (res) {
                    console.log(res);
                    if(res.data.success&&res.data.executed){
                        $('#A_onlineOffOper-data').modal({backdrop: 'static', keyboard: false});
                        $("#A_onlineOffOper-data").modal("show");
                        $scope.onBreakContractMoney=res.data.breakContractMoney;
                        $scope.onExpectedMoney=res.data.expectedMoney;
                        $scope.onMonthPay=res.data.monthPay;
                        $scope.onOverdueMoney=res.data.overdueMoney;
                        $scope.onSurplusCapital=res.data.surplusCapital;
                    }else {

                    }
                },function (res) {
                    console.log(res)
                })
            };
            // 上传转账凭证--一次性结清
            $scope.transVoucher_upload=function (files,e) {
                var postfix = files[0].name.substring(files[0].name.lastIndexOf(".") + 1).toLowerCase();
                if (postfix != "jpg" && postfix != "png") {
                    $rootScope.alertPart("图片仅支持png、jpg类型的文件");
                    return false;
                }
                $scope.uploading=true;
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
                    e.target.value='';
                    if(res.data.success){
                        $scope.translist.push(res.data.data.filePath);
                        $scope.uploading=false;
                    }else {
                        $scope.uploading=false;
                        $rootScope.alertPart("上传失败！");
                    }
                }, function () {
                    $scope.uploading=false;
                    $rootScope.alertPart("上传接口请求失败！");
                })
            }
            // 上传转账凭证--单次
            $scope.transVoucher_upload_single=function (files,e) {
                var postfix = files[0].name.substring(files[0].name.lastIndexOf(".") + 1).toLowerCase();
                if (postfix != "jpg" && postfix != "png") {
                    $rootScope.alertPart("图片仅支持png、jpg类型的文件");
                    return false;
                }
                $scope.uploadings=true;
                $scope.guids = (new Date()).valueOf();   //通过时间戳创建一个随机数，作为键名使用
                var data = new FormData();      //以下为像后台提交图片数据
                data.append('file', files[0]);
                data.append('guid', $scope.guids);
                $http({
                    method: 'POST',
                    url: uploadUrl.url+'/attachment',
                    data: data,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }).then(function (res) {
                    e.target.value='';
                    if(res.data.success){
                        $scope.translist_single.push(res.data.data.filePath);
                        $scope.uploadings=false;
                    }else {
                        $scope.uploadings=false;
                        $rootScope.alertPart("上传失败！");
                    }
                }, function () {
                    $scope.uploadings=false;
                    $rootScope.alertPart("上传接口请求失败！");
                })
            }
            //删除图片
            $scope.delElsePic = function (idx) {
                $scope.translist.splice(idx, 1);
            };
            //删除图片--单次
            $scope.delElsePic_single = function (idx) {
                $scope.translist_single.splice(idx, 1);
            };
            //线下一次结清确认
            $scope.offlineConfirm=function () {
                if(!$scope.offCutPrice){//减免金额
                    $scope.offCutPriceChange=true;
                    $scope.emptyOffCutPrice=true;
                };
                if($scope.translist.length==0){//转账凭证
                    $scope.translistNone=true
                }
                if(!$scope.offMarkInfo){//备注信息
                    $scope.offMarkInfoChange=true;
                }
                if(!$scope.errDate&&($scope.offCutPrice&&!$scope.offCutPriceChange)&&$scope.translist.length>0&&$scope.offMarkInfo){
                    var data={
                        "derateMoney": $scope.offCutPrice,
                        "imgUrls": $scope.translist,
                        "remark": $scope.offMarkInfo,
                        "repaymentDate": $scope.actualTransDate
                    };
                    var orderCode=JSON.parse($scope.userInfo).orderCode;
                    $http({
                        method:"GET",
                        url:"/repayment/"+orderCode+"/updateRepaymentSettledOfflinePaying"
                    }).then(function (res) {
                        if(res.data.success){
                            $http({
                                method:"PUT",
                                url:"/repayment/"+orderCode+"/updateRepaymentSettledOffline",
                                data:data
                            }).then(function (res) {
                                console.log(res)
                                if(res.data.success&&res.data.executed){
                                    $("#A_lineOffOper-data").modal("hide");
                                    $scope.getData();
                                }else {
                                    $rootScope.alertPart(res.data.message)
                                }
                            },function (err) {
                                console.log(err);
                                $rootScope.alertPart("操作失败！")
                            })
                        }else {
                            $rootScope.alertPart(res.data.message)
                        }
                    },function (err) {
                        console.log(err);
                        $rootScope.alertPart("操作失败！")
                    })

                }
            }
            //线上一次结清确认
            $scope.onlineConfirm=function () {
                if(!$scope.onCutPrice){//减免金额
                    $scope.onCutPriceChange=true;
                    $scope.emptyOnCutPrice=true;
                };
                if(!$scope.onMarkInfo){//备注信息
                    $scope.onMarkInfoChange=true;
                }
                if(($scope.onCutPrice&&!$scope.onCutPriceChange)&&$scope.onMarkInfo){
                    var data={
                        "derateMoney": $scope.onCutPrice,
                        "remark": $scope.onMarkInfo,
                    };
                    var orderCode=JSON.parse($scope.userInfo).orderCode;
                    $http({
                        method:"GET",
                        url:"/repayment/"+orderCode+"/updateRepaymentSettledOnlinePaying"
                    }).then(function (res) {
                       if(res.data.success){
                           $http({
                               method:"PUT",
                               url:"/repayment/"+orderCode+"/updateRepaymentSettledOnline",
                               data:data
                           }).then(function (res) {
                               console.log(res)
                               if(res.data.success&&res.data.executed){
                                   $("#A_onlineOffOper-data").modal("hide");
                                   $scope.getData();
                               }else {
                                   $rootScope.alertPart(res.data.message)
                               }
                           },function (err) {
                               console.log(err);
                               $rootScope.alertPart("操作失败！")
                           })
                       }else {
                           $rootScope.alertPart(res.data.message)
                       }
                    },function (err) {
                        console.log(err);
                        $rootScope.alertPart("操作失败！")
                    })

                }
            }
            //发起代扣
            $scope.InitiateDeduction=function (payTime) {
                var orderCode=JSON.parse($scope.userInfo).orderCode;
                $http({
                    method:"PUT",
                    url:"/repayment/"+orderCode+"/"+payTime+"/updateRepaymentWithhold",
                }).then(function (res) {
                    console.log(res)
                    if(res.data.success&&res.data.executed){
                        $rootScope.alertPart("发起代扣成功");
                        $scope.getData();
                    }else {
                        $rootScope.alertPart(res.data.message)
                    }
                },function (err) {
                    console.log(err);
                    $rootScope.alertPart("操作失败！")
                })
            }
            //代扣记录
            // $scope.getWithholdRecord=function (payTime) {
            //     var orderCode=JSON.parse($scope.userInfo).orderCode;
            //     $http({
            //         method:"GET",
            //         url:"/operatorRecord/"+orderCode+"/"+payTime+"/getWithholdRecord",
            //     }).then(function (res) {
            //         console.log(res)
            //         if(res.data.success&&res.data.executed){
            //             $scope.withholdRecordList=res.data.resultData;
            //             if($scope.withholdRecordList.length>0){
            //                 $scope.withholdRecordData=false;
            //             }else {
            //                 $scope.withholdRecordData=true;
            //             }
            //         }else {
            //             $rootScope.alertPart(res.data.message);
            //             $scope.withholdRecordData=true;
            //         }
            //     },function (err) {
            //         console.log(err);
            //         $scope.withholdRecordData=true;
            //         $rootScope.alertPart("获取代扣记录失败！")
            //     })
            // }
            //查询线下还款预计金额
            $scope.getRepaymentOffline=function (payTime) {
                var orderCode=JSON.parse($scope.userInfo).orderCode;
                $http({
                    method:'GET',
                    url:"/repayment/"+orderCode+"/"+payTime+"/getRepaymentOffline"
                }).then(function (res) {
                    console.log(res);
                    if(res.data.success&&res.data.executed){
                        $('#A_lineOffRepayOper-data').modal({backdrop: 'static', keyboard: false});
                        $("#A_lineOffRepayOper-data").modal("show");
                        $scope.monthPays=res.data.monthPay;
                        $scope.surplusCapitals =res.data.surplusCapital;
                        $scope.overdueMoneys=res.data.overdueMoney;
                        $scope.breakContractMoneys=res.data.breakContractMoney;
                        $scope.expectedMoneys =res.data.expectedMoney;
                    }else {
                        $rootScope.alertPart(res.data.message);
                        $scope.monthPays=null;
                        $scope.surplusCapitals=null;
                        $scope.overdueMoneys=null;
                        $scope.breakContractMoneys=null;
                        $scope.expectedMoneys=null;
                    }
                },function (res) {
                    $rootScope.alertPart("查询线下还款预计金额失败！")
                    console.log(res)
                })
            }
            //线下还款确认
            $scope.offlineConfirms=function (payTime) {
                if(!$scope.offCutPrices){//减免金额
                    $scope.offCutPricesChange=true;
                    $scope.emptyOffCutPrices=true;
                };
                if($scope.translist_single.length==0){//转账凭证
                    $scope.translistNones=true
                }
                if(!$scope.offMarkInfos){//备注信息
                    $scope.offMarkInfosChange=true;
                }
                if(($scope.offCutPrices&&!$scope.offCutPricesChange)&&$scope.translist_single.length>0&&$scope.offMarkInfos) {
                    var data={
                        "derateMoney": $scope.offCutPrices,
                        "imgUrls": $scope.translist_single,
                        "remark": $scope.offMarkInfos
                    };
                    var orderCode=JSON.parse($scope.userInfo).orderCode;
                    $http({
                        method:"GET",
                        url:"/repayment/"+orderCode+"/"+payTime+"/updateRepaymentOfflinePaying"
                    }).then(function (res) {
                        if(res.data.success){
                            $http({
                                method:"PUT",
                                url:"/repayment/"+orderCode+"/"+payTime+"/updateRepaymentOffline",
                                data:data
                            }).then(function (res) {
                                if(res.data.success&&res.data.executed){
                                    $("#A_lineOffRepayOper-data").modal("hide");
                                    $scope.getData();
                                }else {
                                    $rootScope.alertPart(res.data.message)
                                }
                            },function (err) {
                                console.log(err);
                                $rootScope.alertPart("操作失败！")
                            })
                        }else {
                            $rootScope.alertPart(res.data.message)
                        }
                    })
                }
            }
            //取消还款
            $scope.cancelRepayFn=function (data) {
                $scope.proposerChange=false;
                $scope.cancelReasonChange=false;
                $scope.cancelReasons='';
                $scope.proposer='';
                if (data.length>0){
                    var i=data.length-1;
                    var success=false;
                    for(i;i>=0;i--){
                        if(data[i].payState.name=='SUCCESSFUL'){
                            success=true;
                            if($scope.userName){
                                var userName=JSON.parse($scope.userName);
                                $scope.user_name=userName.userName;
                                $scope.user_phone=userName.userPhone;
                            }else {
                                $scope.user_name=null;
                                $scope.user_phone=null;
                            }
                            $scope.pay_time=data[i].payTime;
                            $scope.pay_type=data[i].payType.displayName;
                            $scope.pay_actual=data[i].realTotalAmount;
                            $('#cancelRepayOper-data').modal({backdrop: 'static', keyboard: false});
                            $("#cancelRepayOper-data").modal("show");
                            return
                        }
                    };
                    if(!success){
                        $rootScope.alertPart("暂时没有可取消的还款")
                    }
                }else {
                    $rootScope.alertPart("暂时没有还款信息")
                }
            };
            //取消还款确认
            $scope.cancelConfirm=function (payTime) {
                if(!$scope.proposer){
                    $scope.proposerChange=true;
                };
                if(!$scope.cancelReasons){
                    $scope.cancelReasonChange=true;
                };
                if($scope.proposer&&$scope.cancelReasons){
                    var orderCode=JSON.parse($scope.userInfo).orderCode;
                    var data={
                        "applicationer": $scope.proposer,
                        "payTime": payTime,
                        "reasonOfCancel": $scope.cancelReasons
                    }
                    $http({
                        method:'PUT',
                        url:"/repayment/"+orderCode+"/updateRepaymentCancel",
                        data:data
                    }).then(function (res) {
                        console.log(res);
                        if(res.data.executed&&res.data.success){
                            $("#cancelRepayOper-data").modal("hide");
                            $rootScope.alertPart("操作成功！")
                            $scope.getData();
                        }else {
                            $rootScope.alertPart(res.data.message)
                        }
                    },function (err) {
                        console.log(err);
                        $rootScope.alertPart("取消还款失败！")
                    })
                }
            }

        },
        link:function (scope) {
            //还款信息操作记录
            // scope.repaymentInfoOper=function(){
            //     $('#repaymentInfoOper-data').modal({backdrop: 'static', keyboard: false});
            //     $("#repaymentInfoOper-data").modal("show");
            //     scope.getRecord();
            // }
            //线下结清
            scope.A_lineOffOper=function(){
                scope.getCurrDate();
                scope.getRepaymentSettledOffline()
                scope.offCutPrice='';
                scope.translist=[];
                scope.offMarkInfo='';
                scope.emptyOffCutPrice=false;
                scope.translistNone=false;
                scope.errDate=false;
                scope.offCutPriceChange=false;
                scope.offMarkInfoChange=false;
            }
            //线上结清
            scope.A_onlineOffOper=function(){
                scope.getRepaymentSettledOnline();
                scope.onCutPrice='';
                scope.onMarkInfo='';
                scope.emptyOnCutPrice=false;
                scope.onCutPriceChange=false;
                scope.onMarkInfoChange=false;
            }
            //代扣记录
            // scope.withholdRecord=function(payTime){
            //     $('#A_withHoldingOper-data').modal({backdrop: 'static', keyboard: false});
            //     $("#A_withHoldingOper-data").modal("show");
            //     scope.getWithholdRecord(payTime)
            // }
            //主动还款信息操作记录
            scope.A_selfRepayInfoOper=function(paytime){
                $('#A_selfRepayInfoOper-data').modal({backdrop: 'static', keyboard: false});
                $("#A_selfRepayInfoOper-data").modal("show");
                scope.getActiveRecord(paytime)
            }
            //线下还款
            scope.repayOffline=function(payTime){
                scope.getRepaymentOffline(payTime)
                scope.translist_single=[];
                scope.translistNones=false;
                scope.emptyOffCutPrices=false;
                scope.offCutPrices='';
                scope.offMarkInfos='';
                scope.offCutPricesChange=false;
                scope.offMarkInfosChange=false;
                scope.repayOfflinePaytime=payTime
            }

            //线下结清减免金额
            scope.judgeGoodsPrice=function () {
                scope.offCutPriceChange=false;
                scope.errOffCutPrice=false;
                var patern=/^(\-|\+)?\d+(\.\d+)?$/;
                if(!patern.test(scope.offCutPrice)){
                    scope.offCutPrice='';
                };
                if(scope.offCutPrice>scope.expectedMoney-scope.surplusCapital){
                    scope.offCutPriceChange=true;
                    scope.errOffCutPrice=true;
                }
            }

            //线上结清减免金额
            scope.judgeGoodsPrice_online=function () {
                scope.onCutPriceChange=false;
                scope.errOnCutPrice=false;
                var patern= /^(\-|\+)?\d+(\.\d+)?$/;
                if(!patern.test(scope.onCutPrice)){
                    scope.onCutPrice='';
                };
                if(scope.onCutPrice>scope.onExpectedMoney-scope.onSurplusCapital){
                    scope.onCutPriceChange=true;
                    scope.errOnCutPrice=true;
                }
            }
            //线下还款减免金额
            scope.judgeGoodsPrices=function () {
                scope.offCutPricesChange=false;
                scope.errOffCutPrices=false;
                var patern=/^(\-|\+)?\d+(\.\d+)?$/;
                if(!patern.test(scope.offCutPrices)){
                    scope.offCutPrices='';
                };
                if(scope.offCutPrices>scope.expectedMoneys-scope.surplusCapitals){
                    scope.offCutPricesChange=true;
                    scope.errOffCutPrices=true;
                }
            }
        }
    }
})