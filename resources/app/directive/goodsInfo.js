/**
 * Created by duixintong on 2017/11/2.
 */
app.directive("goodsInfo",function () {
    return{
        restrict: 'A',
        templateUrl: 'template/goodsInfo.html',
        replace: true,
        scope:{
            data:'=',
            btn:'=',
            parentBizid:'@',
            userInfo:'@',
            getData:'&'
        },
        controller:function ($scope,$http,$rootScope) {
            var orderCode=JSON.parse($scope.userInfo).orderCode;
            //判断商品信息是否存在
            $scope.panel=true;
            if(JSON.stringify($scope.data) == "{}"||$scope.data==null||$scope.data.length==0||$scope.data==undefined||$scope.data==""){
                $scope.panel=false;
            }else{
                var props = 0;
                for(var p in $scope.data){
                    if(($scope.data.commodityName==""||$scope.data.commodityName==null||$scope.data.commodityName==undefined||$scope.data.commodityName.length==0||JSON.stringify($scope.data.commodityName) == "{}")&&
                        ($scope.data.commodityPrice==""||$scope.data.commodityPrice==null||$scope.data.commodityPrice==undefined||$scope.data.commodityPrice.length==0||JSON.stringify($scope.data.commodityPrice) == "{}")&&
                        ($scope.data.firstPayMoney==""||$scope.data.firstPayMoney==null||$scope.data.firstPayMoney==undefined||$scope.data.firstPayMoney.length==0||JSON.stringify($scope.data.firstPayMoney) == "{}")&&
                        ($scope.data.loanMoney==""||$scope.data.loanMoney==null||$scope.data.loanMoney==undefined||$scope.data.loanMoney.length==0||JSON.stringify($scope.data.loanMoney) == "{}")&&
                        ($scope.data.payTime==""||$scope.data.payTime==null||$scope.data.payTime==undefined||$scope.data.payTime.length==0||JSON.stringify($scope.data.payTime) == "{}")&&
                        ($scope.data.payRate==""||$scope.data.payRate==null||$scope.data.payRate==undefined||$scope.data.payRate.length==0||JSON.stringify($scope.data.payRate) == "{}")&&
                        ($scope.data.monthMyone==""||$scope.data.monthMyone==null||$scope.data.monthMyone==undefined||$scope.data.monthMyone.length==0||JSON.stringify($scope.data.monthMyone) == "{}")&&
                        ($scope.data.payDay==""||$scope.data.payDay==null||$scope.data.payDay==undefined||$scope.data.payDay.length==0||JSON.stringify($scope.data.payDay) == "{}")){
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
            //解决无法加载期数的问题
            if($scope.data.payTime){
                $scope.data.payTime=$scope.data.payTime.toString();
                console.log(typeof $scope.data.payTime)
            }
            // 深度拷贝
            function cloneObj(obj){
                var str, newobj = obj.constructor === Array ? [] : {};
                if(typeof obj !== 'object'){
                    return;
                } else if(window.JSON){
                    str = JSON.stringify(obj), //系列化对象
                        newobj = JSON.parse(str); //还原
                } else {
                    for(var i in obj){
                        newobj[i] = typeof obj[i] === 'object' ?
                            cloneObj(obj[i]) : obj[i];
                    }
                }
                return newobj;
            };
            $scope.cloneData=cloneObj($scope.data);



            $scope.levelName={
                "level1Name":"",
                "level2Name":"",
                "leve13Name":""
            };

            var jPayTime,jInterestType;
            var _payRate,_payTimeUnit,_productCode,_productName,_commodityName;
            //关闭修改商品模态窗
            $scope.closeModifyGoods=function () {
                $("#R_modifyProductInfo-data").modal("hide");
                console.log($scope.data)
                $scope.showmodifyProductInfo=false;
                $scope.goodsNameChange=false;
                $scope.interestTypeChange=false;
                $scope.payTimeChange=false;
                $scope.cloneData=cloneObj($scope.data)
                $scope.editGoodsInfo.$setPristine();
                $scope.editGoodsInfo.$setUntouched();
            };
            //打开修改商品信息模态窗
            $scope.R_modifyProductInfo=function(data){
                console.log(data);
                $scope.cloneData=cloneObj(data)
                $('#R_modifyProductInfo-data').modal({backdrop: 'static', keyboard: false});
                $("#R_modifyProductInfo-data").modal("show");
                // 订单类型1
                $.ajax({
                    async:false,
                    type: "GET",
                    url: "/dictionary/getpruducttypes",
                    success:function (res) {
                        if(res.success){
                            $scope.level1List=res.productEnumModels;
                        }else {
                            console.log("获取订单类型失败！")
                        }
                    },
                    error:function () {
                        console.log("请求订单类型失败！")
                    }
                });
                // 订单类型2
                $.ajax({
                    async:false,
                    type: "GET",
                    url: "/dictionary/getpruducttypes",
                    data:{"typeCode":data.level1Code},
                    success:function (res) {
                        if(res.success){
                            $scope.level2List=res.productEnumModels;
                        }else {
                            console.log("获取订单类型2失败！")
                        }
                    },
                    error:function () {
                        console.log("请求订单类型2失败！")
                    }
                });
                // 订单类型3
                $.ajax({
                    async:false,
                    type: "GET",
                    url: "/dictionary/getpruducttypes",
                    data:{"typeCode":data.level2Code},
                    success:function (res) {
                        if(res.success){
                            console.log(res)
                            $scope.level3List=res.productEnumModels;
                        }else {
                            console.log("获取订单类型3失败！")
                        }
                    },
                    error:function () {
                        console.log("请求订单类型3失败！")
                    }
                });

                $scope.getGoodsName(data.level1Code,data.level2Code,data.level3Code);
                $scope.getStagePlan(data.level1Code,data.level2Code,data.level3Code);
                $scope.getSupportTimes(data.productCode);
                $scope.cloneData.payTime=data.payTime.toString();

                _payRate=data.payRate;
                _payTimeUnit=data.payTimeUnit.name;
                _productCode=data.productCode;
                _productName=data.productName;
                _commodityName=data.commodityName
                $scope.showmodifyProductInfo=true;
            };
            // 获取商品价格
            $scope.getGoodsPrice=function () {
                var obj=$("#goodsName")[0];
                for(var i=0;i<obj.length;i++){
                    if(obj[i].selected){
                        if(obj[i].attributes["data"].value){//判断是否选择了“请选择”
                            var text=JSON.parse(obj[i].attributes["data"].value);
                            $scope.cloneData.commodityPrice=text.commodityPriceStore;
                            _commodityName=text.commodityName;
                            return;
                        }else {
                            $scope.cloneData.commodityPrice='';
                            $scope.cloneData.monthMyone=0
                        }
                    }
                }
            };
            $scope.resetForm=function () {
                $scope.cloneData.level3Code='';
                $scope.cloneData.commodityCode='';//商品名称置空
                $scope.cloneData.commodityPrice='';//商品价格置空
                $scope.cloneData.firstPayMoney='';//首付价格置空
                $scope.cloneData.productCode='';//分期方案置空
                $scope.cloneData.payTime='';//期数置空
                $scope.cloneData.monthMyone=0;
            }
            //商品名称select接口
            $scope.getGoodsName=function (level1Name,level2Name,level3Name) {
                // $scope.cloneData.commodityCode='';
                $http({
                    method:"GET",
                    url:"/order/getGoodsInfos?level1Name="+level1Name+"&level2Name="+level2Name+"&level3Name="+level3Name+"&storeCode="+$scope.cloneData.storeCode,
                }).then(function (res) {
                    console.log(res)
                    if(res.data.success){
                        $scope.goodsNameList=res.data.data;
                    }else {
                        console.log(res)
                    }
                },function () {
                    console.log("请求失败！")
                })
            };
            // 获取分期方案接口
            $scope.getStagePlan=function (level1Name,level2Name,level3Name) {
                $http({
                    method:"GET",
                    url:"/order/"+orderCode+"/getProductInfos?level1Name="+level1Name+"&level2Name="+level2Name+"&level3Name="+level3Name+"&storeCode="+$scope.cloneData.storeCode,
                }).then(function (res) {
                    console.log(res)
                    if(res.data.success){
                        $scope.stagingPlanList=res.data.data;
                    }else {
                        console.log(res);
                    }
                },function () {
                    console.log("请求失败！");
                })
            };
            // 获取支持期数
            $scope.getSupportTimes=function (val) {
                // $scope.cloneData.payTime='';
                if(val){
                    $http({
                        method:"GET",
                        url:"/order/"+val+"/getProductSupportTimes"
                    }).then(function (res) {
                        if(res.data.success){
                            $scope.supportTimesList=res.data.supportTimes;
                        }else {
                            console.log(res);
                        }
                    },function () {
                        console.log("请求失败！");
                    })
                }else {
                    $scope.cloneData.monthMyone=0;
                }

            };
            // 订单类型2
            $scope.getlevel2Name=function (code) {
                $scope.resetForm();
                $scope.cloneData.level2Code='';
                $scope.getGoodsName(code,$scope.levelName.level2Name,$scope.levelName.leve13Name);
                $scope.getStagePlan(code,$scope.levelName.level2Name,$scope.levelName.leve13Name);

                var data={"typeCode":code};
                $.ajax({
                    async:false,
                    type: "GET",
                    url: "/dictionary/getpruducttypes",
                    data:data,
                    success:function (res) {
                        if(res.success){
                            $scope.level2List=res.productEnumModels;
                        }else {
                            console.log("获取订单类型2失败！")
                        }
                    },
                    error:function () {
                        console.log("请求订单类型2失败！")
                    }
                });
            };
            // 订单类型3
            $scope.getlevel3Name=function (code1,code2) {
                $scope.resetForm()
                $scope.getGoodsName(code1,code2,$scope.levelName.leve13Name);
                $scope.getStagePlan(code1,code2,$scope.levelName.leve13Name);
                var data={"typeCode":code2};
                $.ajax({
                    async:false,
                    type: "GET",
                    url: "/dictionary/getpruducttypes",
                    data:data,
                    success:function (res) {
                        if(res.success){
                            console.log(res)
                            $scope.level3List=res.productEnumModels;
                        }else {
                            console.log("获取订单类型3失败！")
                        }
                    },
                    error:function () {
                        console.log("请求订单类型3失败！")
                    }
                });
            };

            // // 将商品价格转化为数字
            // if($scope.cloneData.commodityPrice){
            //     $scope.cloneData.commodityPrice=parseFloat($scope.cloneData.commodityPrice);
            // }

            //获取月付金额
            $scope.getMonthPay=function (loanMoney,payTime,interestType) {

                if(loanMoney<0){
                    return;
                }
                if(loanMoney&&payTime&&interestType){
                    for(var i=0;i<$("#interestType")[0].length;i++){
                        if($("#interestType")[0][i].selected){
                            jInterestType=$("#interestType")[0][i].attributes["data"].nodeValue;
                            break;
                        }
                    };
                    for(var i=0;i<$("#payTime")[0].length;i++){
                        if($("#payTime")[0][i].selected){
                            jPayTime=$("#payTime")[0][i].attributes["data"].nodeValue;
                            break;
                        }
                    };
                    jPayTime=JSON.parse(jPayTime);
                    jInterestType=JSON.parse(jInterestType);
                    console.log(jPayTime)
                    console.log(jInterestType)
                    _payRate=jInterestType.totalRate;
                    _payTimeUnit=jPayTime.paytimeUnit.name;
                    _productCode=jInterestType.productCode;
                    _productName=jInterestType.productName;
                    $.ajax({
                        method: "GET",
                        url: "/order/" + jInterestType.productCode + "/getMonthPay?loanMoney="+loanMoney+"&payTime="+jPayTime.payTime+"&payTimeUnit="+_payTimeUnit+"&interestType="+jInterestType.interestType.name+"&totalRate="+_payRate+"&isPrePay="+jInterestType.isPrePay,
                        success: function (res) {
                            console.log(res)
                            if (res.success) {
                                $scope.cloneData.monthMyone = res.monthPay;
                                $scope.$apply()
                            } else {
                                console.log(res)
                            }
                        },
                        error: function () {
                            console.log("请求失败！");
                        }
                    })
                }else {
                    $scope.cloneData.monthMyone=0;
                    return;
                }

            };
            //监控贷款金额变化
            $scope.$watch("cloneData.commodityPrice-cloneData.firstPayMoney",function (newVal, oldVal, p3) {
                if($scope.cloneData.commodityPrice-$scope.cloneData.firstPayMoney>=0){
                    $scope.goodsPriceChange=false;
                    $scope.goodsFirstChange=false;
                    $scope.loanRange=false;
                }
                if($scope.showmodifyProductInfo){//避免加载页面的时候就调用方法
                    $scope.getMonthPay(newVal,$scope.cloneData.payTime,$scope.cloneData.productCode)
                }else {
                    return
                }
            });
            //修改商品信息弹窗---确定
            $scope.confirm=function () {
                var nodeData,data;
                if(!$scope.cloneData.commodityCode){
                    $scope.goodsNameChange=true;
                }else {
                    $("#goodsName").children().each(function (idx,item) {
                        if(item.selected){
                            nodeData=JSON.parse(item.attributes["data"].nodeValue);
                            return false;
                        }
                    })
                    //判断贷款金额是否在规定范围之内
                    if($scope.cloneData.commodityPrice-$scope.cloneData.firstPayMoney>nodeData.loanAmountMax||$scope.cloneData.commodityPrice-$scope.cloneData.firstPayMoney<nodeData.loanAmountMin){
                        $scope.goodsPriceChange=true;
                        $scope.goodsFirstChange=true;
                        $scope.loanRange=true;
                        $scope.loanAmountMin=nodeData.loanAmountMin;
                        $scope.loanAmountMax=nodeData.loanAmountMax;
                    }else {
                        $scope.loanRange=false;
                    }
                }
                if(!$scope.cloneData.productCode){
                    $scope.interestTypeChange=true;
                }
                if(!$scope.cloneData.payTime){
                    $scope.payTimeChange=true;
                }
                if($scope.cloneData.commodityPrice-$scope.cloneData.firstPayMoney<0){
                    $scope.goodsPriceChange=true;
                    $scope.goodsFirstChange=true;
                }
                if($scope.editGoodsInfo.$valid&&$scope.cloneData.commodityPrice-$scope.cloneData.firstPayMoney>=0&&!$scope.loanRange){
                    data={
                        "commodityCode": $scope.cloneData.commodityCode,
                        "commodityName": _commodityName,
                        "commodityPrice": $scope.cloneData.commodityPrice,
                        "firstPayMoney": $scope.cloneData.firstPayMoney,
                        "level1Code": $scope.cloneData.level1Code,
                        "level2Code": $scope.cloneData.level2Code,
                        "level3Code": $scope.cloneData.level3Code,
                        "loanMoney":$scope.cloneData.commodityPrice-$scope.cloneData.firstPayMoney,
                        "payRate":_payRate,
                        "payTime":  parseInt($scope.cloneData.payTime),
                        "payTimeUnit": _payTimeUnit,
                        "productCode": _productCode,
                        "productName": _productName
                    };
                    console.log(data)
                    $http({
                        method:"PUT",
                        url:"/order/"+$scope.parentBizid+"/updateOrderGoodsByBid",
                        data:data
                    }).then(function (res) {
                        if(res.data.success&&res.data.executed){
                            $scope.getData();
                            $scope.closeModifyGoods();
                        }else {
                            $rootScope.alertPart(res.data.message)

                        }
                    },function (res) {
                        console.log(res)
                    })
                }else {
                    return;
                }

            };
            //商品信息操作记录
            $scope.operRecordData=false;

            $scope.getRecord=function(){
                $http({
                    method: 'GET',
                    url: "/operatorRecord/"+orderCode+"/getGoodsRecord",
                }).then(function successCallback(response) {
                    console.log(response)
                    if(response.data.executed&&response.data.success){
                        $scope.resultList=response.data.resultData;
                        if($scope.resultList){
                            if($scope.resultList.length>0){
                                $scope.operRecordData=false;
                            }else {
                                $scope.operRecordData=true;
                            }
                        }else {
                            $scope.operRecordData=true;
                        }
                    }else{
                        $scope.operRecordData=true;
                    }
                }, function errorCallback(response) {
                    console.log("查询失败！")
                });
            }

        },
        link:function (scope,element,attr) {
            //商品信息操作记录
            scope.commodityInfoOper=function(){
                $('#commodityInfoOper-data').modal({backdrop: 'static', keyboard: false});
                $("#commodityInfoOper-data").modal("show");
                scope.getRecord();
            };
            //校验首付金额不能大于商品金额
            scope.judgeGoodsFirstPay=function () {
                var patern= /^\d*?\.?\d*?$/;
                if((parseFloat(scope.cloneData.firstPayMoney)>parseFloat(scope.cloneData.commodityPrice))||!patern.test(scope.cloneData.firstPayMoney)){
                    scope.cloneData.firstPayMoney='';
                }
            }
            //校验商品金额
            scope.judgeGoodsPrice=function () {
                var patern= /^\d*?\.?\d*?$/;
                if(!patern.test(scope.cloneData.commodityPrice)){
                    scope.cloneData.commodityPrice='';
                }
            }

        }
    }
})