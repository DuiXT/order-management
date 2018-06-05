/************************逾期列表**********************/
app.controller("overdueListCont",["$scope","$http",  "$rootScope","$stateParams","sessionService","$state","toastr",function($scope,$http,$rootScope,$stateParams,sessionService,$state,toastr){
    $scope.overdue = {
        area: "",
        stores:"",
        orgCode: "",
        orderCode: "",
        userName: "",
        userNationalid: "",
        userPhone: "",
        overdueDayStart:"",
        overdueDayEnd:"",
        overdueTime: "",
        applyStartTime:"",
        applyEndTime:"",
        pageSize:"15"
    };
    $scope.datepickerType='applyTime'
    $scope.showUp=false;
    $scope.showDown=true;
    $scope.showAreaTreeview=false;//
    $scope.showAreaTreeviewResult=false;
    $('.select2').select2()
    // 列表是否暂无数据
    $scope.none=false;
    $scope.messages="暂无数据";
    var $searchableTree;
    //所属区域
    $scope.getDept=function(){
        if($scope.showAreaTreeviewResult&&$scope.overdue.area)return
        $scope.overdue.stores="";
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
                        $scope.overdue.area=data.text;
                        $scope.overdue.orgCode=data.code;
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
        if($scope.overdue.area===''){
            $scope.showAreaTreeviewResult=false;
            $scope.$apply();
            return;
        }
        if($scope.showAreaTreeview)$scope.showAreaTreeview=false;
        var pattern = $('#area-input').val();
        var results = $searchableTree.treeview('search', [ pattern, {ignoreCase:true} ]);
        $scope.treeviewrResult=results;
        $scope.showAreaTreeviewResult=true;
        $scope.$apply();
    };
    $scope.selectArea=function (code,text) {
        $scope.getStores(code);
        $scope.overdue.area=text;
        $scope.overdue.orgCode=code;
        $scope.showAreaTreeviewResult=false;

    }
    $('#area-input').on('keyup', search);
    var select={
        name:"",
        displayName:"-请选择-"
    }
    var selectNone={
        name:"",
        displayName:"-暂无门店-"
    }
    //所属门店
    $scope.getStores=function(orgCode){
        $scope.storesList=[];
        $.ajax({
            method: 'GET',
            async:false,
            url: '/order/getMerchantStoreList?orgCode=' + orgCode,
            success: function (response) {
                if (response.executed && response.success) {
                    response.stores.unshift(select);
                    $scope.storesList=response.stores;
                }else {
                    $scope.storesList.unshift(selectNone);
                }
            },
            error: function errorCallback(response) {
                console.log("获取门店失败！")
            }
        })
    } ;
    $scope.getStores('')
    //逾期天数
    $scope.overdueDay1s=[
        {
            displayName:"0"
        },
        {
            displayName:"4"
        },
        {
            displayName:"11"
        },
        {
            displayName:"31"
        }
    ]
    $scope.getOverDueDay2=function(){
        if($scope.overdue.overdueDayStart=="0"){
           $scope.overdueDay2s=[
                {
                    displayName:"3"
                }
            ]
        }else if($scope.overdue.overdueDayStart=="4"){
            $scope.overdueDay2s=[
                {
                    displayName:"10"
                }
            ]
        }else if($scope.overdue.overdueDayStart=="11"){
            $scope.overdueDay2s=[
                {
                    displayName:"30"
                }
            ]
        }else if($scope.overdue.overdueDayStart=="31"){
            $scope.overdueDay2s=[
                {
                    displayName:"90"
                }
            ]
        }else{
            $scope.overdueDay2s=[];
        }
    }
    //逾期期数
    $scope.overdueTimes=[
        {
            displayName:"M0",
            name:"0"
        },
        {
            displayName:"M1",
            name:"1"
        },
        {
            displayName:"M2",
            name:"2"

        },
        {
            displayName:"M3",
            name:"3"
        },
        {
            displayName:"M3+",
            name:"4"
        }
    ]
    /*------------列表-------------*/
    function list(page) {
        $scope.page=page;
        $.ajax({
            type: 'GET',
            async:false,
            url: "/repayment/getOrderOverdueList?orgCode="+$scope.overdue.orgCode+"&storeCode="+$scope.overdue.stores+"&orderCode="+$scope.overdue.orderCode+"&userName="+$scope.overdue.userName+"&userNationalid="+$scope.overdue.userNationalid+"&userPhone="+$scope.overdue.userPhone+"&overdueDayStart="+$scope.overdue.overdueDayStart+"&overdueDayEnd="+$scope.overdue.overdueDayEnd+"&overdueTime="+$scope.overdue.overdueTime+"&applyStartTime="+$scope.overdue.applyStartTime+"&applyEndTime="+$scope.overdue.applyEndTime+"&page="+page+"&size="+$scope.overdue.pageSize,
            success:function successCallback(res) {
                console.log(res)
                if(!res.executed){
                    toastr.error(res.message);
                    $scope.totalData=0;
                    $scope.PageCount=1;
                    $scope.none=false;
                }else {
                    $scope.none = true;
                    $scope.rowsList = res.resultData;
                    $scope.totalData = res.total;
                    $scope.PageCount = Math.ceil($scope.totalData / $scope.overdue.pageSize);
                    if ($scope.totalData === 0) {
                        $scope.none = false;
                    }
                }
                //设置分页的参数
                $scope.option = {
                    curr: page,  //当前页数
                    all: $scope.PageCount,  //总页数
                    count: $scope.PageCount > 10 ? 10 : $scope.PageCount,  //最多显示的页数，默认为10
                    items: $scope.totalData,//总条数
                    size:$scope.overdue.pageSize,
                    //点击页数的回调函数，参数page为点击的页数
                    click: function (page) {
                        list(page);
                    },
                    changeSize:function (page,size) {
                        $scope.overdue.pageSize=size;
                        list(page);
                    }
                }
            },
            error:function errorCallback(response) {
                $rootScope.alertPart("获取列表失败！")
            }
        })
    }
    $scope.myAlert=function () {
        toastr.warning("请输入有效页码！")
    };
    //查询
    $scope.lookup=function(){
        $scope.go='';
        list(1);
    };
    //点击重置
    $scope.reset=function(){
        $scope.go='';
        $scope.overdue = {
            area: "",
            stores:"",
            orgCode: "",
            orderCode: "",
            userName: "",
            userNationalid: "",
            userPhone: "",
            overdueDayStart:"",
            overdueDayEnd:"",
            overdueTime: "",
            applyStartTime:"",
            applyEndTime:"",
            pageSize:$scope.overdue.pageSize
        };
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
    }
    //打开新页面
    $scope.openNewPage=function (bizid,type,day,state,userPhone,userCode,orderCode,page,idx,riskContAuth,isAuth,username) {
        //下一个页面要用的数据
        $scope.overdueParams={
            bizid:bizid,
            type:type,
            day:day,
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
        sessionService.setObject("overdueParams",$scope.overdueParams);
        window.open($state.href('overdueDetails'),'_blank')
    }
}]);

