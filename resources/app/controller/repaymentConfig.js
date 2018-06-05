/**
 * Created by Administrator on 2018/1/19.
 */
app.controller('repaymentConfig',function ($rootScope,$scope,$http) {
    var vm = this;
    var rootNode;//获取登录人组织根节点
    $scope.nodename='';
    /*树状图*/
    $scope.getTree=function()
    {
        /*点击打印节点*/
        vm.itemClicked = function ($item) {
            $scope.getRepaymentDictionary();
            $scope.editRepayMode=true;
            $scope.ckDisabled=true
            vm.selectedItem = $item;
            console.log($item);
            $scope.nodename=$item.name
            $http({    //获取当前节点的禁用还款方式
                method:"GET",
                url:"/repaymentTypeOrgDisable/findByOrgCode/"+$item.id
            }).then(function (res) {
                console.log(res)
                if(res.data.executed&&res.data.success){
                    $scope.disabledMode=res.data.data;
                    angular.forEach($scope.repayTypeList,function (obj1) {
                        angular.forEach($scope.disabledMode,function (obj2) {
                            if(obj1.name==obj2){
                                obj1.value=false;
                            }
                        })
                    })
                    angular.forEach($scope.repayTypeList,function (obj3) {
                        if(obj3.value===null){
                            obj3.value=true;
                        }
                    })
                }else {
                    $rootScope.alertPart(res.data.message);
                }
            },function (err) {
                console.log(err);
                $rootScope.alertPart("获取该区域支持还款方式失败！")
            })
        };
       $http({ //获取当前登录人的权限树
           method:'GET',
           url:"/order/getOrderAreaTree"
       }).then(function (res) {
           console.log(res.data.data)
           if(res.data.success&&res.data.executed){
               rootNode=res.data.data.id;
               $scope.nodename=res.data.data.name;
               var obj={};
               obj.data=res.data.data;
               vm.tree=obj;
               vm.itemClicked(vm.tree.data)
           }
       },function (err) {
           console.log(err)
       })
        return vm;
    };
    $scope.getTree();
    /*树形菜单下拉*/
    $("body").on('mousedown','#box li a', function (e) {
        $('.mtree-active').not($(this).parent()).removeClass('mtree-active');
        $(this).parent().addClass('mtree-active');
    });
    //查询还款方式接口
    $scope.getRepaymentDictionary=function () {
        $.ajax({
            type:"GET",
            async:false,
            url:"/dictionary/getRepaymentDictionary",
       success:function (res) {
            console.log(res)
            if(res.executed&&res.success){
                $scope.repayTypeList=res.enumInfoDTOS;
            }else {
                $rootScope.alertPart(res.message)
            }
        },error:function (err) {
            console.log(err)
        }
        })
    }

    $scope.editRepayMode=true;//编辑按钮默认为显示
    $scope.ckDisabled=true;//checkbox状态初始化为禁用
    $scope.editOper=function () {//编辑操作
        $scope.editRepayMode=!$scope.editRepayMode;
        $scope.ckDisabled=false;
    }


    //控制代扣方自动代扣&策略性代扣必选一个
    $scope.controlSelection = function (item) {
        item.value=!item.value
        if(item.name=='REPAYMENT_AUTO'){
           angular.forEach($scope.repayTypeList,function (obj) {
               if(obj.name=='REPAYMENT_STRATEGY'){
                   obj.value=!item.value
               }
           })
        };
        if(item.name=='REPAYMENT_STRATEGY'){
            angular.forEach($scope.repayTypeList,function (obj) {
                if(obj.name=='REPAYMENT_AUTO'){
                    obj.value=!item.value
                }
            })
        };
    }
    //取消编辑
    $scope.cancelOper=function () {
        vm.itemClicked(vm.selectedItem);
    }
    //确定
    $scope.opering=false;
    $scope.confirmText='确定'
    $scope.confirmOper=function () {
        console.log($scope.repayTypeList)
        $scope.disableSelect=[];
        angular.forEach($scope.repayTypeList,function (obj) {
            if(!obj.value){
                $scope.disableSelect.push(obj.name)
            }
        })
        if($scope.disableSelect.length!=$scope.repayTypeList.length){
            $scope.confirmText='修改中，请稍等...';
            $scope.opering=true;
            $http({
                method:"POST",
                url:"/repaymentTypeOrgDisable/save/"+vm.selectedItem.id,
                data:$scope.disableSelect
            }).then(function (res) {
                console.log($scope.disableSelect)
                console.log(res)
                $scope.opering=false;
                $scope.confirmText='确定'
                if(res.data.executed&&res.data.success){
                    $rootScope.alertPart("操作成功！")
                    vm.itemClicked(vm.selectedItem);
                }else {
                    $rootScope.alertPart(res.data.message)
                }
            },function (err) {
                console.log(err);
                $rootScope.alertPart("操作失败！");
                $scope.opering=false;
                $scope.confirmText='确定'
            })
        }else {
            $rootScope.alertPart("请选择至少一种还款方式！")
        }
    }
})