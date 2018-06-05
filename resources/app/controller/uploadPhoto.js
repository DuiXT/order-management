app.directive("uploadImg", function () {
    return {
        restrict: 'AE',
        scope: false,
        link: function (scope, elem, attrs) {
            elem.bind('click', function () {
                $(this).val('');
            });
            elem.change(function () {
                var file = this.files[0];
                if (file.size > 52428800) {
                    alert("图片大小不大于50M");
                    file = null;
                    return false;
                }
                var fileName = file.name;
                var postfix = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
                if (postfix != "jpg" && postfix != "png") {
                    alert("图片仅支持png、jpg类型的文件");
                    fileName = "";
                    file = null;
                    return false;
                }

                var fileUrl = $(this).val();
                $(this).parent().children(".sp-upload-photo").attr("data-url", fileUrl);
                var getimg = $(this).parent().children(".sp-upload-photo");

                var filereader = new FileReader();
                filereader.readAsDataURL(file);
                $(filereader).load(function () {
                    getimg.attr("src", this.result);
                });
            });
           
        }
    }
});
