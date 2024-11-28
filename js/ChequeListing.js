app.controller('ChequeListingController', function ($scope, $http, $rootScope, $ionicLoading, $ionicPopup, $localstorage, $compile, $ionicScrollDelegate) {

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $rootScope.BackButton = true;

        $scope.Searchmodel = {
            Search: '',
        }
        $scope.GetAllRemainCheque();
    }

    $scope.GetAllRemainCheque = function () {
        $http.get($rootScope.RoutePath + 'invoicepayment/GetAllRemainCheque').then(function (data) {
            data.data.data = _.sortBy(data.data.data, function (date) {
                return date.ar_payment.DocDate;
            }).reverse();
            $scope.ListCheque = _.filter(data.data.data, function (p) {
                p.IsSelected = false;
                p.ar_payment.DocDate = moment(p.ar_payment.DocDate).format('DD-MM-YYYY');
                return p;
            });


            $(document).ready(function () {
                $('#ChequeListingTable').dataTable().fnClearTable();
                $('#ChequeListingTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#ChequeListingTable').DataTable({
                        "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
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
    }

    $scope.UpdatePayment = function () {
        var List = [];
        _.filter($scope.ListCheque, function (q) {
            if (q.IsSelected == true) {
                var obj = {
                    PaymentId: q.ar_payment.id,
                    PaymentDetailId: q.id,
                    Amount: parseFloat(q.ar_payment.LocalUnappliedAmount) - parseFloat(q.PaymentAmount)
                }

                List.push(obj);
            }
        });
        if (List == '') {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'Select at least one item',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            return;
        } else {
            $http.post($rootScope.RoutePath + 'invoicepayment/UpdatePayment', List).then(function (res) {
                if (res.data.success) {
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                    $scope.init();
                } else {
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                }
            }).catch(function (err) {
                $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
            });
        }
    }

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#ChequeListingTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#ChequeListingTable').dataTable().fnFilter("");
        }
    }

    // Alias
    $rootScope.ResetAll = $scope.init;

    $scope.init();
})