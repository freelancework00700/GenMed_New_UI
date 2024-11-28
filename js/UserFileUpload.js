app.controller('UserFileUploadController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

    $scope.init = function () {
        $rootScope.BackButton = $scope.IsList = true;
        $scope.model = {
            UserId: "",
            FileName: "",
            Remark: "",
        }

        $scope.GelAllUser(true);
        ManageRole();
        $scope.Searchmodel = { Search: '' };
        setTimeout(function () {
            InitDataTable()
        })
    }

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
        if (!$scope.IsAdmin) {
            $scope.model.UserId = $localstorage.get('UserId').toString();
        }
    }


    $scope.GelAllUser = function () {

        $http.get($rootScope.RoutePath + 'user/GetAllUserinformations').success(function (data) {

            data.data = _.sortBy(data.data, function (d) {
                return d.username;
            })
            $scope.lstUser = data.data;
        })
    }

    $scope.dzCallbacks = {
        'addedfile': function (file) {
            // console.info('File added from dropzone 1.', file);
        }
    };

    $scope.FilterData = function () {
        $('#DocTable').dataTable().api().ajax.reload();

    }
    $rootScope.ResetAll = $scope.init;

    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#DocTable')) {
            $('#DocTable').DataTable().destroy();
        }
        $('#DocTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [4, 'DESC'],
            "ajax": {
                url: $rootScope.RoutePath + 'uploaddocument/GetAllUserDocument',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    d.UserId = $scope.IsAdmin == false ? $localstorage.get('UserId') : '';
                },
                type: "get",
                dataSrc: function (json) {
                    if (json.success != false) {
                        $scope.lstdata = json.data;
                        return json.data;
                    } else {
                        return [];
                    }
                },
            },
            "createdRow": function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            },
            "columns": [{
                "data": null,
                "sortable": false
            },
            {
                "data": "tbluserinformation.username",
                "defaultContent": "N/A"
            },
            {
                "data": "FileName",
                "defaultContent": "N/A"
            },
            {
                "data": "Remark",
                "defaultContent": "N/A"
            },
            {
                "data": "CreatedDate",
                "defaultContent": "N/A"
            },
            {
                "data": null,
                "sortable": false,
            },
            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            },
            {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    Action += '<a ng-click="DeleteDocument(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>';
                    Action += '</div>';
                    return Action;
                },
                "targets": 5
            },
            {
                "render": function (data, type, row) {
                    if (data == undefined || data == null || data == '') {
                        return "";
                    }
                    return moment(data).format('DD-MM-YYYY');

                },
                "targets": 4,
            },
            ]
        });
    }

    $scope.formsubmit = false;
    $scope.Upload = function (e, Form) {
        if (!Form.$valid) {
            $scope.formsubmit = true;
            return
        }
        if (!myDropzone.files.length || myDropzone.files.length == 0) {
            $ionicLoading.show({ template: "Please Select atleast One Document..." });
            setTimeout(function () {
                $ionicLoading.hide();
            }, 1500)
            return
        }
        $ionicLoading.show({ template: "Wait... Document are uploading..." });
        e.preventDefault();
        var paramName = $scope.model.UserId + ',' + $scope.model.FileName + "," + $scope.model.Remark;
        myDropzone.options.paramName = paramName;
        myDropzone.options.url = $rootScope.RoutePath + myDropzone.options.url;
        myDropzone.processQueue();
        myDropzone.on('success', function (response) {
            $ionicLoading.show({ template: "Document Upload Successfully.." });
            setTimeout(function () {
                $ionicLoading.hide();
                $scope.init();
            }, 1500)
            return
        })
        myDropzone.on('error', function (error) {
            $ionicLoading.show({ template: "Failed to uplaod document.." });
            setTimeout(function () {
                $ionicLoading.hide();
            }, 1500)
            return
        })
        myDropzone.on("complete", function (file) {
            myDropzone.removeFile(file);
        });


    }



    $scope.Add = function () {
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;
    }

    $scope.DeleteDocument = function (id) {
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
                $rootScope.ShowLoader();
                return $http.get($rootScope.RoutePath + 'uploaddocument/DeleteDocument', {
                    params: {
                        id: id
                    }
                }).then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $ionicScrollDelegate.scrollTop();
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $scope.init();
                    }
                    $ionicLoading.show({
                        template: res.data.message
                    });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                })
                    .catch(function (err) {
                        $ionicLoading.show({
                            template: 'Unable to save record right now. Please try again later.'
                        });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                    });
            }
        });
    }

    $scope.init();
}).config(function (dropzoneOpsProvider) {
    dropzoneOpsProvider.setOptions({
        url: 'uploaddocument/UploadDocument',
        acceptedFiles: 'image/jpeg, images/jpg, image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument,application/vnd.ms-excel,application/vnd.ms-excel,text/plain,application/pdf',
        addRemoveLinks: true,
        autoProcessQueue: false,
        maxFiles: 3,
        parallelUploads: 3,
        dictDefaultMessage: 'Click to add or drop Document',
        dictRemoveFile: 'Remove Document',
        dictResponseError: 'Could not upload this Document',
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