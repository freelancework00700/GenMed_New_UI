app.controller('ItemCategoryCtrl', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {

    var vm = this;

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        $scope.GetAllItemCategory();
        $rootScope.BackButton = $scope.IsList = true;
    };

    //Get All ItemCategory Listing
    $scope.GetAllItemCategory = function () {
        $http.get($rootScope.RoutePath + "itemcategory/GetAllItemCategory").then(function (data) {
            console.log(data)
            $scope.lstItemCategory = data.data.data;
            $(document).ready(function () {
                $('#ItemCategoryTable').dataTable().fnClearTable();
                $('#ItemCategoryTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#ItemCategoryTable').DataTable({
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
            $scope.GetAllParentItemCategory();
        });
    }

    //ParentItemCategory Drop Down
    $scope.GetAllParentItemCategory = function () {
        $http.get($rootScope.RoutePath + "itemcategory/GetAllParentItemCategory").then(function (data) {
            $scope.lstParentItemCategory = data.data.data;
        });
    }

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#ItemCategoryTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#ItemCategoryTable').dataTable().fnFilter("");
        }
    }
    $scope.formsubmit = false;
    $scope.SaveItemCategory = function (form) {

        if (form.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }

            console.log($scope.model)
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'itemcategory/SaveItemCategory', $scope.model)
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


    // Use more distinguished and understandable naming
    $scope.CopyToModel = function (selectedItem) {
        $rootScope.BackButton = $scope.IsList = false;
        // Loop model, because selectedItem might have MORE properties than the defined model
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }
    };

    $scope.DeleteItemCategory = function (id) {

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
                $http.get($rootScope.RoutePath + 'itemcategory/DeleteItemCategory', {
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
            Parent: null,
            Name: '',
        };
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.formsubmit = false;

    };

    $scope.Add = function () {
        $rootScope.BackButton = $scope.IsList = false;
    }
    $rootScope.ResetAll = $scope.init;
    $scope.init();
})