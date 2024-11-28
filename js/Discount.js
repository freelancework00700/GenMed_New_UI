app.controller('DiscountController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {

    var vm = this;

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        $scope.GetAllDiscount();
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllDiscount = function () {
        $http.get($rootScope.RoutePath + 'discount/GetAllDiscount').then(function (res) {
            $scope.lstDiscount = res.data.data;
            $scope.TotalRecord = $scope.lstDiscount.length;
            $(document).ready(function () {
                $('#DiscountTable').dataTable().fnClearTable();
                $('#DiscountTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#DiscountTable').DataTable({
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
            $('#DiscountTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#DiscountTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveDiscount = function (FormDiscount) {
        if (FormDiscount.$valid) {
            if ($scope.model.StartDateUtc.getTime() > $scope.model.EndDateUtc.getTime()) {
                $ionicLoading.show({ template: "End date must be greater  then start date" });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
                return
            }
            if (!$scope.model.Id) {
                $scope.model.Id = 0;
            }

            if ($scope.model.UsePercentage == 1) {
                $scope.model.DiscountAmount = 0;
            } else {
                $scope.model.UsePercentage = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'discount/SaveDiscount', $scope.model)
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
        console.log($scope.model)

        $scope.model.IsActive = $scope.model.IsActive == 1 ? true : false;
    };

    $scope.DeleteDiscount = function (id) {
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
                $http.get($rootScope.RoutePath + 'discount/DeleteDiscount', {
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
            Id: 0,
            Name: '',
            DiscountTypeId: 0,
            UsePercentage: 0,
            DiscountPercentage: 0,
            DiscountAmount: 0,
            StartDateUtc: null,
            EndDateUtc: null,
            RequiresCouponCode: 0,
            CouponCode: null,
            DiscountLimitationId: 1,
            LimitationTimes: 0,
            MaximumDiscountedQuantity: null
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