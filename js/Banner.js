app.controller('BannerController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {

    var vm = this;

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        $scope.GetAllBanner();
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllBanner = function () {
        $http.get($rootScope.RoutePath + 'banner/GetAllBanner').then(function (res) {
            $scope.lstBanner = res.data.data;
            console.log($scope.lstBanner)

            $scope.TotalRecord = $scope.lstBanner.length;
            $(document).ready(function () {
                $('#BannerTable').dataTable().fnClearTable();
                $('#BannerTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#BannerTable').DataTable({
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

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#BannerTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#BannerTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveBanner = function (FormUOM) {

        if (FormUOM.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'banner/SaveBanner', $scope.model)
                .then(function (res) {
                    var SaveImage = _.filter($scope.Mediafiles, function (item) {
                        if (item[0].id == 0) {
                            return item;
                        }
                    })
                    if (SaveImage.length == 0) {
                        if (res.data.success) {
                            $scope.init();
                        }
                        $ionicLoading.show({ template: res.data.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                        return
                    }
                    var id;
                    if ($scope.model.id != 0) {
                        id = $scope.model.id;
                    } else {
                        id = res.data.data[0].id;
                    }
                    console.log(res)
                    console.log(SaveImage, id)
                    var formData = new FormData();
                    angular.forEach(SaveImage, function (obj) {
                        formData.append(id, obj[0]);
                    });

                    $http.post($rootScope.RoutePath + 'banner/UploadImage', formData, {
                        transformRequest: angular.identity,
                        headers: {
                            'Content-Type': undefined
                        },
                    }).then(function (data) {
                        console.log(data)
                        if (res.data.success) {
                            $scope.init();
                        }
                        $ionicLoading.show({ template: res.data.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);

                    }, function (err) {
                        $ionicLoading.show({ template: res.data.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                    });

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
        // Loop model, because selectedItem might have MORE properties than the defined model
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }

        $scope.Mediafiles = [];
        $scope.TempRemoveArr = [];
        if (selectedItem.Image != '' || selectedItem.Image != null || selectedItem.Image != undefined) {
            var arr = [];
            arr.push({
                image: $rootScope.RoutePath + 'MediaUploads/ImageUpload/' + selectedItem.Image
            })
            $scope.Mediafiles.push(arr);
        }
        $scope.model.isPublish = $scope.model.isPublish == 1 ? true : false;
    };

    $scope.DeleteUOM = function (id) {

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
                $http.get($rootScope.RoutePath + 'banner/DeleteBanner', {
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

    $scope.ResetModel = function () {
        $scope.model = {
            id: 0,
            Name: '',
            Type: 'Web',
            UrlLink: '',

        };
        $scope.Searchmodel = {
            Search: '',
            Name: '',
            Type: '',
            UrlLink: '',
        }
        $scope.formsubmit = false;
    };

    $scope.Add = function () {
        $scope.Mediafiles = [];
        $rootScope.BackButton = $scope.IsList = false;
    }

    //#region Image Upload 
    $scope.Mediafiles = [];
    $scope.readFile = function (input) {
        $scope.Mediafiles = [];
        if (input.files.length > 0) {
            //read file
            counter = input.files.length;
            for (x = 0; x < counter; x++) {
                if (input.files && input.files[x]) {
                    console.log(input.files)
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        input.files[0].image = e.target.result;
                        input.files[0].id = 0;
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $scope.Mediafiles.push(input.files);
                                console.log($scope.Mediafiles)
                            })
                        })
                    };
                    reader.readAsDataURL(input.files[x]);
                }
            }
        }
    }

    $scope.TempRemoveArr = [];
    $scope.RemoveImage = function (index, id) {
        $scope.Mediafiles.splice(index, 1);
        if (id != 0) {
            $scope.TempRemoveArr.push(id);
        }
    }
    //#endregion

    $rootScope.ResetAll = $scope.init;

    $scope.init();
})