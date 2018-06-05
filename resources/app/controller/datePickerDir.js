/**
 * Created by Administrator on 2017/10/24.
 */
app.directive('bsDatepicker',function(){
    return {
        restrict : 'EA',
        scope:{
            model:"=ngModel",
            type:"@"
        },
        link : function(scope,element,attrs,ctrl){
            var obj={
                autoclose: true,
                todayBtn: 'linked',
                language: 'zh-CN'
            }
            if(scope.type==='idcardLimit'){
                obj['startDate']=new Date();
            }else if (scope.type==='applyTime'){

            }else {
                obj['endDate']=new Date();
            }
            var datepicker1 = $(element).datepicker(obj)
                .on('changeDate',function (ev){
                    var newDate = new Date(ev.date)
                    datepicker1.hide();
                })
                .data('datepicker');
        }
    };
})
