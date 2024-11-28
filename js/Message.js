app.controller('MessageController', function ($scope, $rootScope, $http, $sce, $localstorage, $ionicPopup, $state, $ionicLoading, $ionicScrollDelegate, $ionicModal, $filter, $timeout) {
    $rootScope.BackButton = true;
    $scope.init = function () {
        $scope.CurrentUserId = $localstorage.get('UserId');
        $scope.UserName = $localstorage.get('UserName');
        $scope.ManageModel();
        $scope.lstChats = [];
        $scope.GelAllUser();
    };
    $ionicScrollDelegate.$getByHandle('main-list').resize();
    $scope.ManageModel = function () {
        $scope.model = {
            SenderId: '',
            ReceiverId: '',
            Message: '',
        }

        $scope.modelSearch = {
            Search: ''
        }
        $scope.IsChatDetail = false;
        $scope.Step = 0;
        $scope.GetAllMessageByUserId();

    }

    $scope.GoToStep = function (Step) {
        if (Step == 0) {
            $scope.GetAllMessageByUserId();
        }
        $scope.Step = Step;
    }

    $scope.GelAllUser = function () {
        var params = {
            UserId: $localstorage.get('UserId'),

        }
        $http.get($rootScope.RoutePath + 'message/GetAllUser', { params: params }).success(function (data) {
            for (var index = 0; index < data.length; index++) {
                data[index]['ReceiverId'] = "";
                data[index]['UserId'] = data[index]['id'];
            }
            $scope.lstUser = data;

            var classindex = 1;
            for (var index = 0; index < $scope.lstUser.length; index++) {
                if (classindex <= 3) {
                    $scope.lstUser[index].classname = "userType0" + classindex;
                    classindex++;
                } else {
                    $scope.lstUser[index].classname = "userType04";
                    classindex = 1;
                }
            }
            removeActiveClass();
        })
    }

    function removeActiveClass() {
        for (var index = 0; index < $scope.lstUser.length; index++) {
            $scope.lstUser[index].active = false;
        }
    }


    //Get All Sender Meassage
    $scope.GetAllMessageByUserId = function () {
        var params = {
            UserId: $localstorage.get('UserId'),

        }
        $http.get($rootScope.RoutePath + "message/GetAllMessageFromLoginUser", {
            params: params
        }).success(function (data) {

            if (data.length > 0) {
                for (var index = 0; index < data.length; index++) {
                    var objMsg = data[index];
                    objMsg.MessageDate = objMsg.SendDate;
                    objMsg.SendDate = moment(objMsg.SendDate).format('DD-MM-YYYY hh:mm A');
                    if (objMsg.ReceiverId == $localstorage.get('UserId')) {
                        objMsg.Name = objMsg.SenderName;
                    } else {
                        objMsg.Name = objMsg.ReceiverName;
                    }
                }
                data = _.uniq(data, function (item, key, a) {
                    return item.SenderId + item.ReceiverId;
                });
                var UnreadObj = _.filter(data, function (item) {
                    if (item.UnreadMsg > 0) {
                        return item;
                    }
                });
                UnreadObj = _.sortBy(UnreadObj, function (item) {
                    return item.SendDate;
                }).reverse();
                var ReadObj = _.filter(data, function (item) {
                    if (item.UnreadMsg == 0) {
                        return item;
                    }
                });
                ReadObj = _.sortBy(ReadObj, function (item) {
                    return item.SendDate;
                }).reverse();
                $scope.lstChats = data;

                var classindex = 1;
                for (var index = 0; index < $scope.lstChats.length; index++) {
                    if (classindex <= 3) {
                        $scope.lstChats[index].classname = "userType0" + classindex;
                        classindex++;
                    } else {
                        $scope.lstChats[index].classname = "userType04";
                        classindex = 1;
                    }
                }
                removeCommentActiveClass();
            }
        })
    }

    function removeCommentActiveClass() {
        for (var index = 0; index < $scope.lstChats.length; index++) {
            $scope.lstChats[index].active = false;
        }
    }

    //Ipen Chat Detail
    $scope.OpenChatDetail = function (o) {
        $scope.model.SenderId = $localstorage.get('UserId');
        if (o.ReceiverId == '' || o.ReceiverId == null) {
            $scope.model.ReceiverId = o.UserId;
            $scope.DisplayName = o.username;
        } else {
            if (o.ReceiverId == $localstorage.get('UserId')) {
                $scope.model.ReceiverId = o.SenderId;
                $scope.DisplayName = o.SenderName;
            } else {
                $scope.model.ReceiverId = o.ReceiverId;
                $scope.DisplayName = o.ReceiverName;
            }
        }
        $scope.ReadMsg();

    }

    //Read Msg
    $scope.ReadMsg = function () {
        var params = {
            SenderId: $scope.model.ReceiverId,
            ReceiverId: $scope.model.SenderId
        }
        $http.get($rootScope.RoutePath + "message/GetMessageRead", {
            params: params
        }).then(function (data) {
            $scope.GetMessage();
            setTimeout(function () {
                $ionicScrollDelegate.scrollBottom(true);
            }, 10)
        });
    }



    //Get All Message Sender & Reciever 
    $scope.GetMessage = function () {
        var params = {
            SenderId: $scope.model.SenderId,
            ReceiverId: $scope.model.ReceiverId
        }
        $http.get($rootScope.RoutePath + "message/GetMessage", {
            params: params
        }).then(function (data) {
            for (var i = 0; i < data.data.length; i++) {
                // data.data[i].SendDate = $filter('date')(data.data[i].SendDate, "hh:mm a");
                if (data.data[i].IsFile) {
                    var url = $rootScope.RoutePath + "MediaUploads/MessageUpload/" + data.data[i].Message;
                    data.data[i].FileUrl = url;
                }
            }
            $scope.lstmessage = data.data;
            $scope.IsChatDetail = true;
        });
    }

    //Send Message 
    $scope.SendMessage = function (o) {
        console.log($scope.model.Message)
        if ($scope.model.Message == null || $scope.model.Message == '' || $scope.model.Message == undefined) {
            return
        } else {
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + "message/CreateMessage", $scope.model).success(function (data) {
                if (data.success == true) {
                    $ionicLoading.hide();
                    $scope.model.Message = null;
                    $scope.GetMessage();
                } else {
                    $ionicLoading.hide();
                    if (data.data == "TOKEN") {
                        $rootScope.logout();
                    } else {
                        var alertPopup = $ionicPopup.alert({
                            template: data.message,
                            title: '',
                            cssClass: 'custPop',
                            okText: 'Ok',
                            okType: 'btn btn-green',
                        });
                    }
                };
            }).error(function (error) {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: '',
                    template: error ? error.message : "Message not send..",
                    cssClass: 'custPop',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                });
            })
        }
    }


    $scope.Download = function (message) {
        window.location.href = message.FileUrl;
    }
    $scope.inputUp = function () {
        $timeout(function () {
            $ionicScrollDelegate.scrollBottom(true);
        }, 300);

    };

    $scope.inputDown = function () {
        $ionicScrollDelegate.resize();
    };
    $ionicModal.fromTemplateUrl('FilePreview.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.FileModal = modal;
    });
    $scope.File = null;
    $scope.FileName = "";
    $scope.File = "";
    $scope.ReadFile = function (input) {
        var flg = false;
        if (input.files.length > 0) {
            console.log(input.files[0].type)
            if (input.files[0].type == "image/jpeg") {
                $scope.FileIcon = "img/Filejpg.png";
                flg = true;
            } else if (input.files[0].type == "image/png") {
                $scope.FileIcon = "img/Filepng.png";
                flg = true;
            } else if (input.files[0].type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                $scope.FileIcon = "img/doc.png";
                flg = true;
            } else if (input.files[0].type == "application/vnd.openxmlformats-officedocument" || input.files[0].type == "application/vnd.ms-excel" || input.files[0].type == "application/vnd.ms-excel") {
                $scope.FileIcon = "img/xls.png";
                flg = true;
            } else if (input.files[0].type == "text/plain") {
                $scope.FileIcon = "img/text.png";
                flg = true;
            } else if (input.files[0].type == "application/pdf") {
                $scope.FileIcon = "img/pdf.png";
                flg = true;
            }
            if (flg) {
                $scope.FileName = input.files[0].name;
                $scope.File = input.files[0];
                $scope.FileModal.show();
            } else {
                var alertPopup = $ionicPopup.alert({
                    template: "This extension is not allow to send",
                    title: '',
                    cssClass: 'custPop',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                });
                return
            }
        }
    }
    $scope.OpenUpload = function () {
        $("#FUpload").trigger('click');
    }
    $scope.CloseModel = function () {
        $scope.File = null;
        $scope.FileName = "";
        $scope.File = "";
        $('#FUpload').val('');
        $scope.FileModal.hide();

    }
    $scope.SendFileMessage = function () {
        var formData = new FormData();
        var SendderReceiverId = $scope.model.SenderId + "," + $scope.model.ReceiverId;
        formData.append(SendderReceiverId, $scope.File);
        $http.post($rootScope.RoutePath + "message/UploadfileMessage", formData, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            },
        }).then(function (res) {
            if (res.data.success) {
                $ionicLoading.hide();
                $scope.CloseModel();
                $scope.GetMessage();
            } else {
                var alertPopup = $ionicPopup.alert({
                    template: res.data.message,
                    title: '',
                    cssClass: 'custPop',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                });
            }

        }, function (err) {
            var alertPopup = $ionicPopup.alert({
                template: "File Not Send!",
                title: '',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
        });


    }

    $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
    }

    $scope.init();

});