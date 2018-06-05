/**
 * Created by Administrator on 2018/5/18.
 */
app.controller('merchantOrderQueryListCont',function ($scope,$http,toastr) {
    $scope.showUp=false;
    $scope.showDown=true;
    $scope.merchantlist={
        page:1,
        size:"15",
        orderCode:"",
        bankName:'',
        userName:"",
        empCode:'',
        storeName:'',
        storeCode:'',
        orderState:'',
        createStartDate:'',
        createEndDate:'',
        lendingStartDate:'',
        lendingEndDate:'',
        commodityName:''
    }

        $http({
            method:"GET",
            url:"/merchantStore/getOrderState"
        }).then(function (res) {
            console.log(res)
            if(res.data.success&&res.data.executed){
                $scope.orderStates= JSON.parse(res.data.data);
            }else {
                toastr.error(res.data.message);
            }
        },function (res) {
            toastr.error("获取订单状态失败");
        })

    /*------------列表-------------*/
    function list(page) {
        $scope.merchantlist.page=page;
        $.ajax({
            type: 'GET',
            async:false,
            url: "/merchantStore/getStoreOrderInfo?page="+$scope.merchantlist.page+"&size="+$scope.merchantlist.size+"&orderCode="+$scope.merchantlist.orderCode+"&bankName="+$scope.merchantlist.bankName+"&userName="+$scope.merchantlist.userName+"&empCode="+$scope.merchantlist.empCode+"&storeName="+$scope.merchantlist.storeName+"&storeCode="+$scope.merchantlist.storeCode+"&orderState="+$scope.merchantlist.orderState+"&createStartDate="+$scope.merchantlist.createStartDate+"&createEndDate="+$scope.merchantlist.createEndDate+"&lendingStartDate="+$scope.merchantlist.lendingStartDate+"&lendingEndDate="+$scope.merchantlist.lendingEndDate+"&commodityName="+$scope.merchantlist.commodityName,
            success:function successCallback(res) {
                console.log(res)
                if(!res.executed){
                    toastr.error(res.message)
                    $scope.totalData=0;
                    $scope.none=false;
                    $scope.PageCount=1;
                }else {
                    $scope.none = true;
                    $scope.rowsList = res.data;
                    $scope.totalData = res.totalCount;
                    $scope.PageCount = Math.ceil($scope.totalData / $scope.merchantlist.size)==0?1:Math.ceil($scope.totalData / $scope.merchantlist.size);
                    if ($scope.totalData === 0)$scope.none = false;
                }
                //设置分页的参数
                $scope.option = {
                    curr: page,  //当前页数
                    all: $scope.PageCount,  //总页数
                    count: $scope.PageCount > 10 ? 10 : $scope.PageCount,  //最多显示的页数，默认为10
                    items: $scope.totalData,//总条数
                    size:$scope.merchantlist.size,

                    //点击页数的回调函数，参数page为点击的页数
                    click: function (page) {
                        list(page);
                    },
                    changeSize:function (page,size) {
                        $scope.merchantlist.size=size;
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
        toastr.warning("请输入有效页码！");
    };
    /*查询*/
    $scope.lookup=function(){
        $scope.go='';
        list(1);
    };
    //点击重置
    $scope.reset=function(){
        $scope.go='';
        $scope.merchantlist = {
            page:1,
            orderCode:"",
            bankName:'',
            userName:"",
            empCode:'',
            storeName:'',
            storeCode:'',
            orderState:'',
            createStartDate:'',
            createEndDate:'',
            lendingStartDate:'',
            lendingEndDate:'',
            size:$scope.merchantlist.size,
            commodityName:''
        }
        list(1);
    };
    list(1);
    //导出数据
    $scope.exportData=function () {
        $http({
            method:'GET',
            url:"/merchantStore/listToExcel?page="+$scope.merchantlist.page+"&size="+$scope.merchantlist.size+"&orderCode="+$scope.merchantlist.orderCode+"&bankName="+$scope.merchantlist.bankName+"&userName="+$scope.merchantlist.userName+"&empCode="+$scope.merchantlist.empCode+"&storeName="+$scope.merchantlist.storeName+"&storeCode="+$scope.merchantlist.storeCode+"&orderState="+$scope.merchantlist.orderState+"&createStartDate="+$scope.merchantlist.createStartDate+"&createEndDate="+$scope.merchantlist.createEndDate+"&lendingStartDate="+$scope.merchantlist.lendingStartDate+"&lendingEndDate="+$scope.merchantlist.lendingEndDate+"&commodityName="+$scope.merchantlist.commodityName,
            responseType: 'arraybuffer'
        }).then(function (data) {
            console.log(data)
            var blob = new Blob([data.data], {type: "application/vnd.ms-excel"});
            var objectUrl = URL.createObjectURL(blob);
            var a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display:none');
            a.setAttribute('href', objectUrl);
            var filename="商户订单.xls";
            a.setAttribute('download', filename);
            a.click();
            URL.revokeObjectURL(objectUrl);
        },function (res) {
            console.log(res);
            toastr.error("请求失败！")
        })
    }
})