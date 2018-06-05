/************************订单列表**********************/
app.controller("orderListCont",function($scope,$http,$stateParams,sessionService,$state,toastr){

    $scope.$on('role',function (p1, p2) {//接收登录人角色
        console.log(p2)
        $scope.riskContAuth=p2;
        sessionService.setObject('riskContAuth',$scope.riskContAuth);
    })
    if(!$scope.riskContAuth) $scope.riskContAuth=sessionService.getObject('riskContAuth');
    $scope.showAreaTreeview=false;//
    $scope.showAreaTreeviewResult=false;
    $('.select2').select2()
    $scope.ordlist = {
        clientName: "",
        clientId: "",
        clientPhone: "",
        employeeNumber: "",
        orderState: "",
        orderNumber: "",
        applyStartTime:"",
        applyEndTime: "",
        fundingChannels:"",
        level1Code:"",
        level2Code:"",
        level3Code:"",
        area:"",
        orgCode:"",
        stores:"",
        creditCode:"",
        pickupCode:"",
        pageSize:"15"
    };
    $scope.showUp=false;
    $scope.showDown=true;
    // 列表是否暂无数据
    $scope.none=false;
    $scope.messages="暂无数据";
    //订单状态
    $http({
        method: 'GET',
        url: '/dictionary/getOrderStatus',
    }).then(function successCallback(response) {
        if(response.data.executed && response.data.success){
            $scope.orderStates=response.data.enumInfoDTOS;
        }else{
            console.log(response.data.message)
        }
    }, function errorCallback(response) {
        console.log("获取失败！")
    });
   //资金渠道
     $http({
     method: 'GET',
     url: '/dictionary/getmoneyresource',
     }).then(function successCallback(response) {
         if(response.data.executed && response.data.success){
             $scope.fundingChannels=response.data.enumInfoDTOS;
         }else{
             console.log(response.data.message)
         }
     }, function errorCallback(response) {
         console.log("获取失败！")
     });
    //订单类型三级联动
    var dataCode;
    var select={
        name:"",
        displayName:"-请选择-"
    }
    $scope.getlevel1Name=function(){
        $http({
            method: 'GET',
            url: '/dictionary/getpruducttypes',
        }).then(function successCallback(response) {
            if(response.data.executed && response.data.success){
                $scope.level1List=response.data.productEnumModels;
                response.data.productEnumModels.unshift(select);
            }else{
                console.log(response.data.message)
            }
        }, function errorCallback(response) {
            console.log("获取失败！")
        });
    }
    $scope.getlevel1Name();
    $scope.getlevel2Name=function(){
        $scope.ordlist.level2Code='';
        $scope.ordlist.level3Code='';
        $http({
            method: 'GET',
            url: '/dictionary/getpruducttypes?typeCode='+$scope.ordlist.level1Code,
        }).then(function successCallback(response) {
            if(response.data.executed && response.data.success){
                $scope.level2List=response.data.productEnumModels;
                response.data.productEnumModels.unshift(select);
            }else{
                console.log(response.data.message)
            }
        }, function errorCallback(response) {
            console.log("获取失败！")
        });
    }
    $scope.getlevel3Name=function(){
        $scope.ordlist.level3Code='';
        $http({
            method: 'GET',
            url: '/dictionary/getpruducttypes?typeCode='+$scope.ordlist.level2Code,
        }).then(function successCallback(response) {
            if(response.data.executed && response.data.success){
                $scope.level3List=response.data.productEnumModels;
                response.data.productEnumModels.unshift(select);
            }else{
                console.log(response.data.message)
            }
        }, function errorCallback(response) {
            console.log("获取失败！")
        });
    }

    var selectNone={
        name:"",
        displayName:"-暂无门店-"
    }
    var $searchableTree;
    //所属区域
    $scope.getDept=function(){
        if($scope.showAreaTreeviewResult&&$scope.ordlist.area)return
        $scope.ordlist.stores="";
        var myJson=[];
        var data = [];
        //避免收起div时再次调用接口
        if($scope.showAreaTreeview){
            $scope.showAreaTreeview=!$scope.showAreaTreeview;
            return
        }else {
            $scope.showAreaTreeview=!$scope.showAreaTreeview;
        }

        function walk(nodes,parcode) {
            if (!nodes) {
                return;
            }
            $.each(nodes, function (id, node) {
                var obj = {
                    id: id,
                    text: node.name,
                    code:node.id,
                    tags: [node.nodes.length > 0 ? node.nodes.length + ' child elements' : '']
                };
                if (node.nodes.length > 0) {
                    obj.nodes = [];
                    walk(node.nodes,obj.nodes);
                }
                parcode.push(obj);
            });
        }

        $http({
            method: 'GET',
            url: '/order/getOrderAreaTree',
        }).then(function successCallback(response) {
            if(response.data.executed && response.data.success){
                myJson.push(response.data.data);
                walk(myJson,data);
                var options = {
                    bootstrap2: false,
                    showTags: true,
                    levels: 5,
                    showCheckbox: false,
                    checkedIcon: "glyphicon glyphicon-check",
                    data: data,
                    onNodeSelected : function (event, data) {
                        $scope.ordlist.area=data.text;
                        $scope.ordlist.orgCode=data.code;
                        $scope.getStores(data.code);
                        $scope.showAreaTreeview=false;
                        $scope.$apply();

                    }
                };

                $searchableTree=$('#treeview').treeview(options);
                $('#treeview').treeview('collapseAll');

            }
        }, function errorCallback(response) {
           console.log("获取失败");
        });
    };

     //input 区域树搜索
    var search = function(e) {
        if($scope.ordlist.area===''){
            $scope.showAreaTreeviewResult=false;
            $scope.$apply();
            return;
        }
        if($scope.showAreaTreeview)$scope.showAreaTreeview=false;
        var pattern = $('#area-input').val();
        var results = $searchableTree.treeview('search', [ pattern, {ignoreCase:true} ]);
        console.log(results);
        $scope.treeviewrResult=results;
        $scope.showAreaTreeviewResult=true;
        $scope.$apply();
    };
    $scope.selectArea=function (code,text) {
        $scope.getStores(code);
        $scope.ordlist.area=text;
        $scope.ordlist.orgCode=code;
        $scope.showAreaTreeviewResult=false;

    }
    $('#area-input').on('keyup', search);
    //所属门店
    $scope.getStores=function(orgCode){
        $scope.storesList=[];
        $.ajax({
            method: 'GET',
            async:false,
            url: '/order/getMerchantStoreList?orgCode=' + orgCode,
            success: function (response) {
                if (response.executed&&response.success) {
                    response.stores.unshift(select);
                    $scope.storesList=response.stores;
                }else {
                    $scope.storesList.unshift(selectNone);
                    console.log("获取门店失败！")
                }
            },
            error: function errorCallback(response) {
                console.log("获取门店失败！")
            }
        })
    }
    $scope.getStores(select.name);
    /*------------列表-------------*/
   function list(page) {
       $scope.page=page;
        $.ajax({
            type: 'GET',
            async:false,
            url: "/order/getOrderList?userName="+$scope.ordlist.clientName+"&userNationalid="+$scope.ordlist.clientId+"&userPhone="+$scope.ordlist.clientPhone+"&empNameCode="+$scope.ordlist.employeeNumber+"&state="+$scope.ordlist.orderState+"&orderCode="+$scope.ordlist.orderNumber+"&applyStartTime="+$scope.ordlist.applyStartTime+"&applyEndTime="+$scope.ordlist.applyEndTime+"&moneyResource="+$scope.ordlist.fundingChannels+"&level1Code="+$scope.ordlist.level1Code+"&level2Code="+$scope.ordlist.level2Code+"&level3Code="+$scope.ordlist.level3Code+"&orgCode="+$scope.ordlist.orgCode+"&storeCode="+$scope.ordlist.stores+"&page="+page+"&size="+$scope.ordlist.pageSize+"&creditCode="+$scope.ordlist.creditCode+"&pickupCode="+$scope.ordlist.pickupCode,
        success:function successCallback(res) {
            console.log(res)
            if(!res.executed){
                toastr.error(res.message)
                $scope.totalData=0;
                $scope.none=false;
                $scope.PageCount=1;
            }else {
                $scope.none = true;
                $scope.rowsList = res.orderListInfoList;
                $scope.totalData = res.total;
                $scope.PageCount = Math.ceil($scope.totalData / $scope.ordlist.pageSize)==0?1:Math.ceil($scope.totalData / $scope.ordlist.pageSize);
                if ($scope.totalData === 0)$scope.none = false;
            }
            //设置分页的参数
            $scope.option = {
                curr: page,  //当前页数
                all: $scope.PageCount,  //总页数
                count: $scope.PageCount > 10 ? 10 : $scope.PageCount,  //最多显示的页数，默认为10
                items: $scope.totalData,//总条数
                size:$scope.ordlist.pageSize,

                //点击页数的回调函数，参数page为点击的页数
                click: function (page) {
                    list(page);
                },
                changeSize:function (page,size) {
                    $scope.ordlist.pageSize=size;
                    list(page);
                }
            }
        },
            error:function errorCallback(response) {
                toastr.error("请求列表失败！")
        }
   })
    }
    $scope.myAlert=function () {
        toastr.warning("请输入有效页码！")
    }
    //清空选中内容方法
    var clearSlct= "getSelection" in window ? function(){
        window.getSelection().removeAllRanges();
    } : function(){
        document.selection.empty();
    };
    $scope.copyctn=function (e) {
        clearSlct();//清空选中内容
        var ctn=e.target.attributes['data-original'].nodeValue;
        var hideArea=document.createElement('div');
        hideArea.innerHTML=ctn;
        hideArea.width=0;
        hideArea.height=0;
        document.body.appendChild(hideArea)
        if(document.selection){
            var range = document.body.createTextRange();
            range.moveToElementText(hideArea)
            range.select();
        }else if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(hideArea);
            window.getSelection().addRange(range);
        }
        var tag = document.execCommand("Copy"); //执行浏览器复制命令
        if(tag){
            if (!!window.ActiveXObject || "ActiveXObject" in window){//兼容IE
                hideArea.removeNode(true);
            }else {
                hideArea.remove();
            }
            clearSlct();//清空选中内容
            toastr.success('已复制');
        }else {
            toastr.error('复制失败');
        };
    }

    /*查询*/
    $scope.lookup=function(){
        $scope.go='';
        list(1);
    };
    //点击重置
    $scope.reset=function(){
        $scope.go='';
        $scope.ordlist = {
            clientName: "",
            clientId: "",
            clientPhone: "",
            employeeNumber: "",
            orderState: "",
            orderNumber: "",
            applyStartTime:"",
            applyEndTime: "",
            fundingChannels:"",
            level1Code:"",
            level2Code:"",
            level3Code:"",
            area:"",
            orgCode:"",
            stores:"",
            creditCode:"",
            pickupCode:"",
            pageSize:$scope.ordlist.pageSize
        }
        list(1);
        $scope.getStores(select.name)
    };
    //判断返回的页数
    if(typeof $stateParams.page=="object"){
        list(1)
    }else {
        list($stateParams.page)
    }

    //判断返回索引
    if(typeof $stateParams.index=="number"){
        $scope.currentIdx=$stateParams.index;
    }
    //列表点击标亮
    $scope.removeHl=function () {
        for(var i=1;i<$("tr").length;i++){
            if($("tr")[i].getAttribute("class").indexOf("highLight")!=-1){
                $("tr").eq(i).removeClass("highLight")
            }
        }
        $scope.currentIdx=''
    };
    //跳转新页面
    $scope.openNewPage=function (bizid,type,state,userPhone,userCode,orderCode,page,idx,riskContAuth,isAuth,username) {
        //下一个页面要用的数据
        $scope.orderParams={
            bizid:bizid,
            type:type,
            state:state,
            userPhone:userPhone,
            userCode:userCode,
            orderCode:orderCode,
            page:page,
            index:idx,
            riskContAuth:riskContAuth,
            isAuth:isAuth,
            username:username
        };
        sessionService.setObject("orderParams",$scope.orderParams);
        window.open($state.href('orderDetails'),'_blank')
    }
});
