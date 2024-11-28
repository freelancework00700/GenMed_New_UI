app.controller('ItemComboController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {

    var vm = this;

    $scope.init = function () {
        $scope.ResetModel();
        $scope.GetAllItem();
        $scope.GetAllItemCombo();
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllItem = function () {
        $http.get($rootScope.RoutePath + 'itemcombo/GetAllItem').then(function (res) {
            _.filter(res.data.data, function (p) {
                p.DisplayData = p.ItemCode + '-' + p.ItemName;
            });
            $scope.lstCombo = _.where(res.data.data, { IsCombo: 1 });
            $scope.lstItem = _.where(res.data.data, { IsCombo: 0 });
        });
    };

    $scope.GetAllItemCombo = function () {
        $http.get($rootScope.RoutePath + 'itemcombo/GetAllItemCombo').then(function (res) {
            $scope.lstItemCombo = res.data.data;
            $scope.TotalRecord = $scope.lstItemCombo.length;
            $(document).ready(function () {
                $('#ItemComboTable').dataTable().fnClearTable();
                $('#ItemComboTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#ItemComboTable').DataTable({
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

    $scope.SelectItem = function (o) {
        var obj = _.findWhere($scope.lstItem, { id: o });
        $scope.model.ItemCode = obj.ItemCode;
        $scope.ListUOM = obj.itemuoms;
        $scope.ListBatch = obj.itembatches;
    }

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#ItemComboTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#ItemComboTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveItemCombo = function (FormItemCombo) {

        if (FormItemCombo.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'itemcombo/SaveItemCombo', $scope.model)
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
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }

        var obj = _.findWhere($scope.lstItem, { id: $scope.model.IdItem });
        $scope.ListUOM = obj.itemuoms;
        $scope.ListBatch = obj.itembatches;
        $scope.model.IsActive = $scope.model.IsActive == 1 ? true : false;
    };

    $scope.DeleteItemCombo = function (id) {
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
                $http.get($rootScope.RoutePath + 'itemcombo/DeleteItemCombo', {
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
            IdCombo: '',
            IdItem: '',
            ItemCode: null,
            Qty: 0,
            UOM: null,
            BatchNo: null
        };

        $scope.Searchmodel = {
            Search: '',
        }

        $scope.ListUOM = [];
        $scope.ListBatch = [];
        $scope.formsubmit = false;
    };

    $scope.Add = function () {
        $rootScope.BackButton = $scope.IsList = false;
    }

    $rootScope.ResetAll = $scope.init;

    $scope.init();
})