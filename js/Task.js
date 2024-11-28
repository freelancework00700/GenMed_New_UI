app.controller('TaskController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $ionicModal, $ionicScrollDelegate) {

    var vm = this;

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.MonthList = [{ value: 1, month: 'January' }, { value: 2, month: 'February' }, { value: 3, month: 'March' }, { value: 4, month: 'April' }, { value: 5, month: 'May' }, { value: 6, month: 'June' }, { value: 7, month: 'July' }, { value: 8, month: 'August' }, { value: 9, month: 'September' }, { value: 10, month: 'October' }, { value: 11, month: 'November' }, { value: 12, month: 'December' }];
        $scope.ResetModel();
        $scope.GetAllUser();
        $scope.GetAllTaskType();
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
        $scope.GetAllTask();
    }

    $scope.GetAllTaskType = function () {
        $http.get($rootScope.RoutePath + 'task/GetAllTaskType').then(function (res) {
            $scope.lstTaskType = res.data.data;
        })
    };

    $scope.GetAllTask = function () {
        var UserId = '';
        if (!$scope.IsAdmin) {
            UserId = parseInt($localstorage.get('UserId'));
        }
        $http.get($rootScope.RoutePath + 'task/GetAllTask?UserId=' + UserId).then(function (res) {
            $scope.lstTask = res.data.data;

            $(document).ready(function () {
                $('#TaskTable').dataTable().fnClearTable();
                $('#TaskTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#TaskTable').DataTable({
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

    $scope.GetAllUser = function () {
        $http.get($rootScope.RoutePath + 'task/GetAllUser').then(function (res) {
            $scope.lstUser = res.data.data;
        });
    };

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#TaskTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#TaskTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveTask = function (form) {

        if (form.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'task/SaveTask', $scope.model)
                .then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $scope.init();
                    }
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
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
    };

    $scope.DeleteTask = function (id) {
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
                $http.get($rootScope.RoutePath + 'task/DeleteTask', {
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

                $http.get($rootScope.RoutePath + 'task/ChangeStatus', {
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

    $scope.ResetModel = function () {
        $scope.model = {
            id: null,
            idUser: null,
            idTaskAssign: null,
            idTaskType: null,
            Description: null,
            Status: 'Pending',
            CreatedDate: null,
            ModifiedDate: null,
            CompleteDate: null,
            CompleteBy: null
        };

        $scope.modelComment = {
            id: null,
            idUser: parseInt($localstorage.get('UserId')),
            idTask: null,
            Comment: null,
            CreatedDate: null,
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
        $scope.GetAllCommentByTaskId(id);
        $scope.comment.show();
        setTimeout(function () {
            $ionicScrollDelegate.$getByHandle('modalContent').scrollBottom(true);
        }, 100);
    }

    $scope.closeModal = function () {
        $scope.comment.hide();
        $scope.lstComment = [];
        $scope.init();
    }

    $scope.GetAllCommentByTaskId = function (id) {
        $scope.modelComment.idTask = id;
        $http.get($rootScope.RoutePath + 'task/GetAllCommentByTaskId?id=' + id).then(function (res) {
            $scope.lstComment = res.data.data;
        });
    };

    $scope.SaveComment = function (form) {

        if (!$scope.model.id) {
            $scope.model.id = 0;
        }
        $rootScope.ShowLoader();
        $http.post($rootScope.RoutePath + 'task/SaveComment', $scope.modelComment)
            .then(function (res) {
                if (res.data.data == 'TOKEN') {
                    $rootScope.logout();
                }
                if (res.data.success) {
                    $scope.modelComment.id = null;
                    $scope.modelComment.Comment = null;
                    $scope.modelComment.CreatedDate = null;
                    $scope.GetAllCommentByTaskId($scope.modelComment.idTask);
                    setTimeout(function () {
                        $ionicScrollDelegate.$getByHandle('modalContent').scrollBottom(true);
                    }, 100);
                }
                $ionicLoading.show({ template: res.data.message });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
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
})