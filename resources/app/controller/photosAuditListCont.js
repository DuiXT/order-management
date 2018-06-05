/**
 * 照片审核列表
 */
app.controller("photosAuditListCont",["$scope","$http","$state","$stateParams","$interval","sessionService","toastr",function($scope,$http,$state,$stateParams,$interval,sessionService,toastr){
    //折叠筛选项
    $scope.showUp=false;
    $scope.showDown=true;
    // 列表是否暂无数据
    $scope.none=false;

    $scope.photo={
        "userName":"",
        "userPhone":"",
        "userNationalid":"",
        "empNameCode":"",
        "state":"",
        "orderCode":"",
        "applyStartTime":"",
        "applyEndTime":"",
        "moneyResource":"",
        "level1Code":"",
        "level2Code":"",
        "level3Code":"",
        "orgCode":"",
        "storeCode":"",
        "page":"",
        "size":"",
        "area":"",
        "creditCode":"",
        "pickupCode":"",
        pageSize:"15"
    };
    // $scope.showAreaTreeview=false;//
    // $scope.showAreaTreeviewResult=false;
    // $('.select2').select2();
    $scope.$on('refreshInter',function (p1, p2) {//接收定时刷新
        $scope.refreshTime=p2;
    })
    console.log($scope.refreshTime);
    /*-------字典接口调用--------*/
    function jiekou() {
        // 订单状态
        $.ajax({
            type: "GET",
            url: "/dictionary/getImgAuditState",
            success:function (res) {
                if(res.success){
                    $scope.orderStates=res.enumInfoDTOS;
                }else {
                    console.log("获取订单状态失败！");
                }
            },
            error:function () {
                console.log("请求订单状态失败！");
            }
        });
        // 资金渠道
        $.ajax({
            type: "GET",
            url: "/dictionary/getmoneyresource",
            success:function (res) {
                if(res.success){
                    $scope.fundingChannels=res.enumInfoDTOS;
                }else {
                    console.log("获取资金渠道失败！");
                }
            },
            error:function () {
                console.log("请求资金渠道失败！");
            }
        });
        // 订单类型1
        $.ajax({
            type: "GET",
            url: "/dictionary/getpruducttypes",
            success:function (res) {
                console.log(res)
                if(res.success){
                    $scope.level1List=res.productEnumModels;
                }else {
                    console.log("获取订单类型失败！");
                }
            },
            error:function () {
                console.log("请求订单类型失败！");
            }
        });
    }
    jiekou()
    $scope.getlevel2Name=function (code) {
        $scope.photo.level2Code='';//避免select为空白
        $scope.photo.level3Code='';
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
    }
    $scope.getlevel3Name=function (code) {
        $scope.photo.level3Code='';//避免select为空白
        var data={"typeCode":code};
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
    }
    // var $searchableTree;
    // //所属区域
    // $scope.getDept=function(){
    //     if($scope.showAreaTreeviewResult&&$scope.photo.area)return
    //     $scope.photo.storeCode='';
    //     var myJson=[];
    //     var data = [];
    //     //避免收起div时再次调用接口
    //     if($scope.showAreaTreeview){
    //         $scope.showAreaTreeview=!$scope.showAreaTreeview;
    //         return
    //     }else {
    //         $scope.showAreaTreeview=!$scope.showAreaTreeview;
    //     }
    //     function walk(nodes,parcode) {
    //         if (!nodes) {
    //             return;
    //         }
    //         $.each(nodes, function (id, node) {
    //             var obj = {
    //                 id: id,
    //                 text: node.name,
    //                 code:node.id,
    //                 tags: [node.nodes.length > 0 ? node.nodes.length + ' child elements' : '']
    //             };
    //             if (node.nodes.length > 0) {
    //                 obj.nodes = [];
    //                 walk(node.nodes,obj.nodes);
    //             }
    //             parcode.push(obj);
    //         });
    //     }
    //     $http({
    //         method: 'GET',
    //         url: '/order/getOrderAreaTree',
    //     }).then(function successCallback(response) {
    //         myJson.push(response.data.data);
    //         walk(myJson,data);
    //         var options = {
    //             bootstrap2: false,
    //             showTags: true,
    //             levels: 5,
    //             checkedIcon: "glyphicon glyphicon-check",
    //             data: data,
    //             onNodeSelected : function (event, data) {
    //                 $scope.photo.area=data.text;
    //                 $scope.photo.orgCode=data.code;
    //                 $scope.getStores(data.code);
    //                 $scope.showAreaTreeview=false;
    //                 $scope.$apply();
    //             }
    //         };
    //
    //         $searchableTree=$('#treeview').treeview(options);
    //         $('#treeview').treeview('collapseAll', { silent: true });
    //     }, function errorCallback(response) {
    //         toastr.error("请求区域数据失败！");
    //     });
    // };
    // //input 区域树搜索
    // var search = function(e) {
    //     if($scope.photo.area===''){
    //         $scope.showAreaTreeviewResult=false;
    //         $scope.$apply();
    //         return;
    //     }
    //     if($scope.showAreaTreeview)$scope.showAreaTreeview=false;
    //     var pattern = $('#area-input').val();
    //     var results = $searchableTree.treeview('search', [ pattern, {ignoreCase:true} ]);
    //     $scope.treeviewrResult=results;
    //     $scope.showAreaTreeviewResult=true;
    //     $scope.$apply();
    // };
    // $scope.selectArea=function (code,text) {
    //     $scope.getStores(code);
    //     $scope.photo.area=text;
    //     $scope.photo.orgCode=code;
    //     $scope.showAreaTreeviewResult=false;
    //
    // }
    // $('#area-input').on('keyup', search);
    // var select={
    //     name:"",
    //     displayName:"-请选择-"
    // }
    // var selectNone={
    //     name:"",
    //     displayName:"-暂无门店-"
    // }
    //所属门店
    // $scope.getStores = function (orgCode) {
    //     $scope.storesList=[];
    //     $.ajax({
    //         method: 'GET',
    //         async:false,
    //         url: '/order/getMerchantStoreList?orgCode=' + orgCode,
    //         success: function (response) {
    //             console.log(response)
    //             if (response.executed&&response.success) {
    //                 response.stores.unshift(select);
    //                 $scope.storesList = response.stores;
    //                 console.log($scope.storesList);
    //             }else {
    //                 $scope.storesList.unshift(selectNone);
    //             }
    //         },
    //         error: function errorCallback(response) {
    //             toastr.error("请求门店数据失败！");
    //             console.log(response)
    //         }
    //     });
    // }
    // $scope.getStores(select.name)



    /*------------列表-------------*/
    function list(page) {
        $scope.page=page;
     $.ajax({
       type: 'GET',
       async:false,
       url: "/order/getOrderImgList?userName="+$scope.photo.userName+"&userPhone="+$scope.photo.userPhone+"&userNationalid="+$scope.photo.userNationalid+"&empNameCode="+$scope.photo.empNameCode+"&state="+$scope.photo.state+"&orderCode="+$scope.photo.orderCode+"&applyStartTime="+$scope.photo.applyStartTime+"&applyEndTime="+$scope.photo.applyEndTime+"&moneyResource="+$scope.photo.moneyResource+"&level1Code="+$scope.photo.level1Code+"&level2Code="+$scope.photo.level2Code+"&level3Code="+$scope.photo.level3Code+"&orgCode="+$scope.photo.orgCode+"&storeCode="+$scope.photo.storeCode+"&page="+page+"&size="+$scope.photo.pageSize+"&creditCode="+$scope.photo.creditCode+"&pickupCode="+$scope.photo.pickupCode,
     success:function successCallback(res) {
         console.log(res)
         if(!res.executed){
             toastr.error(res.message)
             $scope.none=false;
             $scope.totalData=0;
             $scope.PageCount=1;
         }else{
             $scope.none=true;
             $scope.rowsList=res.orderImgListInfoList;
             $scope.totalData=res.total;
             $scope.PageCount =Math.ceil($scope.totalData / $scope.photo.pageSize)==0?1:Math.ceil($scope.totalData / $scope.photo.pageSize);;
             if($scope.totalData===0)$scope.none=false;
         }
         //设置分页的参数
         $scope.option = {
             curr: page,  //当前页数
             all: $scope.PageCount,  //总页数
             count: $scope.PageCount > 10 ? 10 : $scope.PageCount,  //最多显示的页数，默认为10
             items: $scope.totalData,//总条数
             size:$scope.photo.pageSize,

             //点击页数的回调函数，参数page为点击的页数
             click: function (page) {
                 list(page);
             },
             changeSize:function (page,size) {
                 $scope.photo.pageSize=size;
                 list(page);
             }
         };
     },
         error:function errorCallback(response) {
             toastr.error("请求列表数据失败！")
     }
     })
     }

    /*查询*/
    $scope.lookup=function()
    {
        $scope.go='';
        list(1);
    };
     //点击重置
     $scope.reset=function(){
     $scope.go='';
         $scope.photo={
             "userName":"",
             "userPhone":"",
             "userNationalid":"",
             "empNameCode":"",
             "state":"",
             "orderCode":"",
             "applyStartTime":"",
             "applyEndTime":"",
             "moneyResource":"",
             "level1Code":"",
             "level2Code":"",
             "level3Code":"",
             "orgCode":"",
             "storeCode":"",
             "page":"",
             "size":"",
             "creditCode":"",
             "pickupCode":"",
             pageSize:$scope.photo.pageSize
         }
         list(1);
         $scope.getStores(select.name);
     };
    $scope.openNewPage=function (bizid,type,state,userCode,page,idx,orderCode,username) {
        //下一个页面要用的数据
        $scope.photoParams={
            bizid:bizid,
            type:type,
            state:state,
            userCode:userCode,
            orderCode:orderCode,
            page:page,
            index:idx,
            username:username
        };
        sessionService.setObject("photoParams",$scope.photoParams);
        window.open($state.href('photosAuditDetails'),'_blank')
    }
    $scope.myAlert=function () {
        toastr.warning("请输入有效页码！")
    };
    //判断审核状态是否正确
    $scope.ischeckXinshen=function(bizid,type,state,userCode,page,idx,orderCode,username)
    {
        $http({
            method:"PUT",
            url:"/order/"+bizid+"/orderStateAuditImg"
        }).then(function (res) {
            console.log(res)
            if (res.data.success && res.data.executed) {
                $scope.openNewPage(bizid,type,state,userCode,page,idx,orderCode,username);
            } else {
                toastr.error(res.data.message);
            }
        },function (res) {
            toastr.error("请求数据失败！");
            console.log("查询失败");
        });
    }

    if(typeof $stateParams.page==="object"){
        $scope.page=1;
    }else {
        $scope.page=$stateParams.page;
    }
    list($scope.page);

    if(typeof $stateParams.index==="number"){
        console.log($stateParams.index)
        $scope.currentIdx=$stateParams.index;
    }
    // 取消高亮
    $scope.removeHl=function () {
        for(var i=1;i<$("tr").length;i++){
            if($("tr")[i].getAttribute("class").indexOf("highLight")!==-1){
                $("tr").eq(i).removeClass("highLight");
            }
        }
        $scope.currentIdx='';
    }


    $scope.$on('refreshInter',function (p1, p2) {//接收定时刷新
        console.log(p2);
        $scope.refreshTime=p2;
        refreshList();

    })
    console.log($scope.refreshTime);

    var timer;//定时器
    function refreshList() {
        if(timer){//如果有定时器，清除之前的定时器
            $interval.cancel(timer);
        };
        if(!$scope.refreshTime){//如果返回undefined，则给默认刷新/30s
            if($scope.$parent.open){
                timer=$interval(function(){
                    list($scope.page);
                },$scope.$parent.seconds*1000);
            }
        }else {
            if($scope.refreshTime.time&&$scope.refreshTime.open){
                timer=$interval(function(){
                    list($scope.page);
                },$scope.refreshTime.time*1000);
            }
        };
    }
    refreshList()

    $scope.$on("$destroy", function() {//离开页面时，清除定时器
        $interval.cancel(timer);
    });
}]);