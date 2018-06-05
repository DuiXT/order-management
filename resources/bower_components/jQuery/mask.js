(function(){
        $.extend($.fn,{
            mask: function(msg,maskDivClass){
                this.unmask();
                // 参数
                var op = {
                    opacity: 1,
                    z: 10000,
                    bgcolor: '#0A0A0A'
                };
                var original=$(document.body);
                var position={top:0,left:0};
                if(this[0] && this[0]!==window.document){
                    original=this;
                    position=original.position();
                }
                // 创建一个 Mask 层，追加到对象中
                var maskDiv=$('<div class="maskdivgen">&nbsp;</div>');
                maskDiv.appendTo(original);
                var maskWidth=original.innerWidth();
                if(!maskWidth){
                    maskWidth=original.width();
                }
                var maskHeight=original.innerHeight();
                if(!maskHeight){
                    maskHeight=original.height();
                }
                maskDiv.css({
                    position: 'absolute',
                    top: position.top,
                    left: position.left,
                    'z-index': op.z,
                    'width': maskWidth,
                    'height':maskHeight,
                    backgroundColor: 'rgba(10,10,10,0.44)',
                    cursor:'wait'
                });
                if(maskDivClass){
                    maskDiv.addClass(maskDivClass);
                }
                if(msg){
                    var msgDiv=$('<div style="position:absolute;border:#6593cf 1px solid; padding:2px;background:#ccca;width: 360px;opacity: 1;z-index: 999999"><div style="line-height:24px;border:#a3bad9 1px solid;background:white;padding:2px 10px 2px 10px;color: #555">'+msg+'</div></div>');
                    msgDiv.appendTo(maskDiv);
                    var widthspace=(maskDiv.width()-msgDiv.width());
                    var heightspace=(maskDiv.height()-msgDiv.height());
                    msgDiv.css({
                        cursor:'wait',
                        top:(200),
                        left:(widthspace/2-2)
                    });
                }
                maskDiv.fadeIn('fast', function(){
                    // 淡入淡出效果
                    $(this).fadeTo('slow', op.opacity);
                })
                return maskDiv;
            },
            unmask: function(){
                var original=$(document.body);
                if(this[0] && this[0]!==window.document){
                    original=$(this[0]);
                }
                original.find("> div.maskdivgen").fadeOut('slow',0,function(){
                    $(this).remove();
                });
            }
        });
    })();