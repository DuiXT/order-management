
app.controller("creditAuditListCont",["$scope","$http","$rootScope","sessionService","$stateParams","$state","$interval","toastr",function($scope,$http,$rootScope,sessionService,$stateParams,$state,$interval,toastr){
    $scope.showUp=false;
    $scope.showDown=true;
    $scope.auditlist = {
        clientName: "",
        clientId: "",
        clientPhone: "",
        orderNumber: "",
        orgCode:"",
        creditCode:"",
        pageSize:"15"
    };
    // $scope.showAreaTreeview=false;//
    // $scope.showAreaTreeviewResult=false;
    // $('.select2').select2();
    // var $searchableTree;
    //所属区域
    $scope.getDept=function(){
        if($scope.showAreaTreeviewResult&&$scope.auditlist.area)return
        $scope.storesList=[];
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
            myJson.push(response.data.data);
            console.log(response)
            walk(myJson,data);
            var options = {
                bootstrap2: false,
                showTags: true,
                levels: 5,
                checkedIcon: "glyphicon glyphicon-check",
                data: data,
                onNodeSelected : function (event, data) {
                    $scope.auditlist.area=data.text;
                    $scope.auditlist.orgCode=data.code;
                    $scope.showAreaTreeview=false;
                    $scope.$apply();
                }
            };
            $searchableTree=$('#treeview').treeview(options);
            $('#treeview').treeview('collapseAll', { silent: true });
        }, function errorCallback(response) {
            console.log("接口请求失败！");
    });
    };
    //input 区域树搜索
    var search = function(e) {
        if($scope.auditlist.area===''){
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
        $scope.auditlist.area=text;
        $scope.auditlist.orgCode=code;
        $scope.showAreaTreeviewResult=false;

    }
    $('#area-input').on('keyup', search);


    /*------------列表-------------*/
   function list(page) {
       $scope.page = page
       $scope.none=false;
        $.ajax({
            type: 'GET',
            async:false,
            url: "/order/getOrderCreditList?orgCode="+$scope.auditlist.orgCode+"&userName="+$scope.auditlist.clientName+"&userNationalid="+$scope.auditlist.clientId+"&userPhone="+$scope.auditlist.clientPhone+"&orderCode="+$scope.auditlist.orderNumber+"&page="+page+"&size="+$scope.auditlist.pageSize+"&creditCode="+$scope.auditlist.creditCode,
            success:function (res) {
            console.log(res)
            if(res.success&&res.executed)
            {
                $scope.none=false;
                $scope.rowsList=res.orderCreditListInfoList;
                $scope.totalData=res.total;
                $scope.PageCount = Math.ceil($scope.totalData / $scope.auditlist.pageSize)==0?1:Math.ceil($scope.totalData / $scope.auditlist.pageSize);
                if($scope.totalData=="0")
                {
                    $scope.none=true;
                }
            }else {
                $scope.totalData=0;
                $scope.none=true;
                $scope.PageCount=1;
                toastr.error(res.message);
            }
            //设置分页的参数
            $scope.option = {
                curr: page,  //当前页数
                all: $scope.PageCount,  //总页数
                count: $scope.PageCount > 10 ? 10 : $scope.PageCount,  //最多显示的页数，默认为10
                items: $scope.totalData,//总条数
                size:$scope.auditlist.pageSize,

                //点击页数的回调函数，参数page为点击的页数
                click: function (page) {
                    list(page);
                },
                changeSize:function (page,size) {
                    $scope.auditlist.pageSize=size;
                    list(page);
                }
            }
        }, error:function (res) {
            $rootScope.alertPart("获取列表失败！")
        }
   })
    }

    /*查询*/
    $scope.lookup=function(){
        $scope.go='';
        list(1);
    };
    $scope.myAlert=function () {
        toastr.warning("请输入有效页码！");
    };
    //点击重置
    $scope.reset=function(){
        $scope.go='';
        $scope.none=false;
        $scope.auditlist = {
            clientName: "",
            clientId: "",
            clientPhone: "",
            orderNumber: "",
            orgCode:"",
            creditCode:"",
            pageSize: $scope.auditlist.pageSize
        }
        list(1);
    };
    //新窗口打开页面
    $scope.openNewPage=function (bizid,type,userPhone,userCode,state,orderCode,page,index,isAuth,username) {
        //下一个页面要用的数据
        $scope.auditParams={
            bizid:bizid,
            type:type,
            userPhone:userPhone,
            userCode:userCode,
            state:state,
            orderCode:orderCode,
            page:page,
            index:index,
            isAuth:isAuth,
            username:username
        };
        sessionService.setObject("auditParams",$scope.auditParams);
        window.open($state.href('auditDetails'),'_blank')
    };
    $scope.ischeckXinshen=function(bizid,type,userPhone,userCode,state,orderCode,page,index,isAuth,username)
    {
        $http({
            method:"PUT",
            url:"/order/"+bizid+"/orderStateAudit",
        }).then(function (res) {
            console.log(res)
            if(res.data.success && res.data.executed )
            {
                $scope.openNewPage(bizid,type,userPhone,userCode,state,orderCode,page,index,isAuth,username)
            }
            else
            {
                $scope.alertPart(res.data.message)
            }

        },function (res) {
            console.log("查询失败")
        })
    };


    if(typeof $stateParams.page=="object"){
        list(1);
    }else {
        list($stateParams.page);
    }


    if(typeof $stateParams.index=="number"){
        console.log($stateParams.index)
        $scope.currentIdx=$stateParams.index;
    }
    // 去除高亮
    $scope.removeHl=function () {
        for(var i=1;i<$("tr").length;i++){
            if($("tr")[i].getAttribute("class").indexOf("highLight")!=-1){
                $("tr").eq(i).removeClass("highLight")
            }
        }
        $scope.currentIdx=''
    }


    $scope.$on('refreshInter',function (p1, p2) {//接收定时刷新
        console.log(p2)
        $scope.refreshTime=p2;
        refreshList()

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
                    list($scope.page)
                },$scope.$parent.seconds*1000);
            }
        }else {
            if($scope.refreshTime.time&&$scope.refreshTime.open){
                timer=$interval(function(){
                    list($scope.page)
                },$scope.refreshTime.time*1000);
            }
        };
    }
    refreshList()

    $scope.$on("$destroy", function() {//离开页面时，清除定时器
        $interval.cancel(timer);
    })
}]);