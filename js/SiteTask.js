app.controller('SiteTaskController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $ionicModal, $ionicScrollDelegate) {

    var vm = this;

    $scope.init = function () {
        $scope.MonthList = [{ value: 1, month: 'January' }, { value: 2, month: 'February' }, { value: 3, month: 'March' }, { value: 4, month: 'April' }, { value: 5, month: 'May' }, { value: 6, month: 'June' }, { value: 7, month: 'July' }, { value: 8, month: 'August' }, { value: 9, month: 'September' }, { value: 10, month: 'October' }, { value: 11, month: 'November' }, { value: 12, month: 'December' }];
        $scope.ResetModel();
        $scope.GetAllSite();
        $rootScope.BackButton = $scope.IsList = true;
        $scope.IsEdit = false;
        ManageRole();
    };

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;

        if ($scope.IsAdmin) {
            $scope.model.idTaskAssign = parseInt($localstorage.get('UserId'));
        }
        $scope.GetAllSiteTask();
    }

    $scope.GetAllSite = function () {
        $http.get($rootScope.RoutePath + 'sitetask/GetAllSite').then(function (res) {
            $scope.lstSite = res.data.data;
        })
    };

    $scope.GetAllSiteTask = function () {
        var UserId = '';
        if (!$scope.IsAdmin) {
            UserId = parseInt($localstorage.get('UserId'));
        }
        $http.get($rootScope.RoutePath + 'sitetask/GetAllSiteTask?UserId=' + UserId).then(function (res) {
            $scope.lstTask = res.data.data;

            $(document).ready(function () {
                $('#SiteTaskTable').dataTable().fnClearTable();
                $('#SiteTaskTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#SiteTaskTable').DataTable({
                        responsive: true,
                        "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                        retrieve: true,
                        "lengthMenu": [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ],
                        "pageLength": 10,
                        language: {
                            "emptyTable": "No Data Found"
                        },
                        columnDefs: [{
                            bSortable: false,
                            aTargets: [-1]
                        }]
                    });
                })
            })
        });
    };

    $scope.GetAllUserBySiteId = function (o) {
        $http.get($rootScope.RoutePath + 'sitetask/GetAllUserBySiteId?idSite=' + o).then(function (res) {
            $scope.lstUser = res.data.data;
        });
    };

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#SiteTaskTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#SiteTaskTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveSiteTask = function (form, e) {
        if (form.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $ionicLoading.show({ template: "Loading..." });
            $http.post($rootScope.RoutePath + 'sitetask/SaveSiteTask', $scope.model)
                .then(function (res) {
                    $ionicLoading.hide();
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        if (!myDropzone.files.length || myDropzone.files.length == 0) {
                            $scope.init();
                            $ionicLoading.show({ template: res.data.message });
                            setTimeout(function () {
                                $ionicLoading.hide()
                            }, 1000);
                            return
                        }
                        e.preventDefault();
                        if (!$scope.model.id) {
                            var paramName = res.data.data.id;
                        } else {
                            var paramName = $scope.model.id;
                        }
                        myDropzone.options.paramName = paramName;
                        myDropzone.options.url = $rootScope.RoutePath + myDropzone.options.url;
                        myDropzone.processQueue();
                        myDropzone.on('success', function (response) {
                            $scope.init();
                            $ionicLoading.show({ template: res.data.message });
                            setTimeout(function () {
                                $ionicLoading.hide()
                            }, 1000);
                            return
                        })
                        myDropzone.on('error', function (error) {
                            $ionicLoading.show({ template: "Failed to uplaod Image..Task Save successfully" });
                            setTimeout(function () {
                                $ionicLoading.hide();
                            }, 1500)
                            return
                        })
                        myDropzone.on("complete", function (file) {
                            myDropzone.removeFile(file);
                        });
                    } else {
                        $ionicLoading.show({ template: res.data.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                    }

                })
                .catch(function (err) {

                    $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);

                });
        } else {
            $scope.formsubmit = true;
        }
    };

    $scope.CopyToModel = function (selectedItem) {
        $rootScope.BackButton = $scope.IsList = false;
        $scope.IsEdit = true;
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }
        $scope.model.DisplayImageUrl = $rootScope.RoutePath + "MediaUploads/SiteUpload/" + $scope.model.id + "/" + $scope.model.ImageUrl;
        $scope.GetAllUserBySiteId($scope.model.idSite);
    };

    $scope.DeleteSiteTask = function (id) {
        var confirmPopup = $ionicPopup.confirm({
            title: "",
            template: 'Are you sure you want to delete this record?',
            cssClass: 'custPop',
            cancelText: 'Cancel',
            okText: 'Ok',
            okType: 'btn btn-green',
            cancelType: 'btn btn-red',
        })
        confirmPopup.then(function (res) {
            if (res) {
                var params = {
                    id: id
                };
                $rootScope.ShowLoader();
                $http.get($rootScope.RoutePath + 'sitetask/DeleteSiteTask', {
                    params: params
                }).success(function (data) {
                    if (data.success == true) { $scope.init(); }

                    $ionicLoading.show({ template: data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);

                }).catch(function (err) {
                    $ionicLoading.show({ template: 'Unable to delete record right now. Please try again later.' });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                });
            }
        });
    };

    $scope.ChangeStatus = function (id, status) {
        var confirmPopup = $ionicPopup.confirm({
            title: "",
            template: 'Are you sure you want to change status to ' + status + ' ?',
            cssClass: 'custPop',
            cancelText: 'Cancel',
            okText: 'Ok',
            okType: 'btn btn-green',
            cancelType: 'btn btn-red',
        })
        confirmPopup.then(function (res) {
            if (res) {
                if (status == 'Complete') {
                    var params = {
                        id: id,
                        status: status,
                        CompleteBy: $localstorage.get('UserName'),
                        CompleteDate: null
                    };
                } else {
                    var params = {
                        id: id,
                        status: status,
                        CompleteBy: null,
                        CompleteDate: null
                    };
                }

                $http.get($rootScope.RoutePath + 'sitetask/ChangeStatus', {
                    params: params
                }).success(function (data) {
                    if (data.success == true) { $scope.init(); }

                    $ionicLoading.show({ template: data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);

                }).catch(function (err) {
                    $ionicLoading.show({ template: 'Unable to update status right now. Please try again later.' });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                });
            }
        });
    };

    $scope.RemoveImage = function () {
        $scope.model.ImageUrl = null;
        $scope.model.DisplayImageUrl = null;
    }
    $scope.ResetModel = function () {
        $scope.model = {
            id: null,
            idUser: null,
            idTaskAssign: null,
            idSite: null,
            Description: null,
            Status: 'Pending',
            CreatedDate: null,
            ModifiedDate: null,
            CompleteDate: null,
            CompleteBy: null,
            ImageUrl: null,
            DisplayImageUrl: null,
        };

        $scope.modelComment = {
            id: null,
            idUser: parseInt($localstorage.get('UserId')),
            idSiteTask: null,
            Comment: null,
            CreatedDate: null,
            ImageUrl: null,
        };

        $scope.Searchmodel = {
            Search: '',
        }
        $scope.formsubmit = false;
    };

    $scope.Add = function () {
        $rootScope.BackButton = $scope.IsList = false;
    }

    $ionicModal.fromTemplateUrl('comment-modal.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function (modal) {
        $scope.comment = modal;
    });

    $scope.openCommentModal = function (id) {
        myDropzone.removeAllFiles();
        $scope.GetAllCommentBySiteTaskId(id);
        $scope.comment.show();
        setTimeout(function () {
            $ionicScrollDelegate.$getByHandle('modalContent').scrollBottom(true);
        }, 100);
    }

    $scope.closeModal = function () {
        myDropzone.removeAllFiles();
        $scope.comment.hide();
        $scope.lstComment = [];
        $scope.init();
    }

    $scope.GetAllCommentBySiteTaskId = function (id) {
        $scope.modelComment.idSiteTask = id;
        $http.get($rootScope.RoutePath + 'sitetask/GetAllCommentBySiteTaskId?id=' + id).then(function (res) {
            for (var index = 0; index < res.data.data.length; index++) {
                res.data.data[index].DisplayImage = $rootScope.RoutePath + "MediaUploads/SiteUpload/" + res.data.data[index].idSiteTask + "/" + res.data.data[index].ImageUrl;
            }
            $scope.lstComment = res.data.data;
        });
    };

    $scope.SaveComment = function (form, e) {
        if (!$scope.model.id) {
            $scope.model.id = 0;
        }

        $http.post($rootScope.RoutePath + 'sitetask/SaveComment', $scope.modelComment)
            .then(function (res) {
                if (res.data.data == 'TOKEN') {
                    $rootScope.logout();
                }
                if (res.data.success) {
                    if (!myDropzone.files.length || myDropzone.files.length == 0) {
                        $scope.modelComment.id = null;
                        $scope.modelComment.Comment = null;
                        $scope.modelComment.CreatedDate = null;
                        $scope.GetAllCommentBySiteTaskId($scope.modelComment.idSiteTask);
                        setTimeout(function () {
                            $ionicScrollDelegate.$getByHandle('modalContent').scrollBottom(true);
                        }, 1000);
                        return
                    }
                    e.preventDefault();
                    myDropzone.options.paramName = res.data.data.id + ',' + res.data.data.idSiteTask;
                    myDropzone.options.url = $rootScope.RoutePath + "sitetask/SiteCommentUploadImage";
                    myDropzone.processQueue();
                    myDropzone.on('success', function (response) {
                        $ionicLoading.show({ template: res.data.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                        $scope.modelComment.id = null;
                        $scope.modelComment.Comment = null;
                        $scope.modelComment.CreatedDate = null;
                        $scope.GetAllCommentBySiteTaskId($scope.modelComment.idSiteTask);
                        setTimeout(function () {
                            $ionicScrollDelegate.$getByHandle('modalContent').scrollBottom(true);
                        }, 100);
                        return
                    })
                    myDropzone.on('error', function (error) {
                        $ionicLoading.show({ template: "Failed to uplaod Image..Task Save successfully" });
                        setTimeout(function () {
                            $ionicLoading.hide();
                        }, 1500)
                        return
                    })
                    myDropzone.on("complete", function (file) {
                        myDropzone.removeFile(file);
                    });
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                } else {
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                }
            })
            .catch(function (err) {
                $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
            });
    };

    $rootScope.ResetAll = $scope.init;
    $scope.init();
}).config(function (dropzoneOpsProvider) {
    dropzoneOpsProvider.setOptions({
        url: 'sitetask/SiteUploadImage',
        acceptedFiles: 'image/jpeg, images/jpg, image/png',
        addRemoveLinks: true,
        autoProcessQueue: false,
        maxFiles: 1,
        dictDefaultMessage: 'Click to add or drop Image',
        dictRemoveFile: 'Remove Document',
        dictResponseError: 'Could not upload this Image',
        init: function () {
            myDropzone = this;
            this.on("addedfile", function (file) {
                if (this.files.length) {
                    var _i, _len;
                    for (_i = 0, _len = this.files.length; _i < _len - 1; _i++) {
                        if (this.files[_i].name === file.name) {
                            this.removeFile(file);
                        }
                    }
                }
            });

        },
    });
});