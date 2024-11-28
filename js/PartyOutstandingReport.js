app.controller('PartyOutstandingReportController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

    $rootScope.BackButton = true;
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.modelAdvanceSearch = null;
        $scope.GetAllCustomer();
        ManageRole();
        $scope.ResetModel();
        setTimeout(function () {
            InitDataTable();
        })
    };

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
    }

    $scope.GetAllCustomer = function () {
        var params = {
            CustomerGroup: $localstorage.get('CustomerGroup'),
            CreatedBy: $scope.IsAdmin ? '' : parseInt($localstorage.get('UserId')),
            LoginUserCode: $localstorage.get('UserCode'),
        }
        $http.get($rootScope.RoutePath + 'customer/GetAllCustomerAdvance', { params: params }).then(function (res) {
            $scope.lstCustomer = res.data.data;
        });
    }



    //Table function End
    $scope.ResetModel = function () {
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.Filtermodel = {
            DocType: '',
            StartDate: moment().format(),
            EndDate: moment().format(),
            PartyName: ''
        }
        $scope.FinalTotalmodel = {
            TotalDebit: 0,
            TotalCredit: 0,
            TotalOutstanding: 0,
        }
    };

    $scope.FilterData = function () {
        $('#StockBalanceReportTable').dataTable().api().ajax.reload();
    }

    // $scope.EnableFilterOption = function () {
    //     $(function () {
    //         $(".CustFilter").slideToggle();
    //     });
    // };

    // $scope.FilterAdvanceData = function (o) {
    //     $scope.modelAdvanceSearch = o;
    //     InitDataTable()
    //     // $('#StockBalanceReportTable').dataTable().api().ajax.reload();
    // }

    $scope.FilterTableData = function (o) {
        InitDataTable()
    }

    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#StockBalanceReportTable')) {
            $('#StockBalanceReportTable').DataTable().destroy();
        }
        $('#StockBalanceReportTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [1, 'ASC'],
            "ajax": {
                url: $rootScope.RoutePath + 'report/GetAllPartyOutstandingReportNew',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    $scope.order = d.order;
                    $scope.columns = d.columns;
                    d.StartDate = $scope.Filtermodel.StartDate;
                    d.EndDate = $scope.Filtermodel.EndDate;
                    d.PartyName = $scope.Filtermodel.PartyName;
                    d.DocType = $scope.Filtermodel.DocType;
                    d.CustomerGroup = $localstorage.get('CustomerGroup');
                    d.CreatedBy = $scope.IsAdmin ? '' : parseInt($localstorage.get('UserId'));
                    return d;
                },
                type: "get",
                dataSrc: function (json) {

                    if (json.success != false) {
                        $scope.lstdata = json.data;
                        console.log(json)
                        $scope.$apply(function () {
                            $scope.FinalTotalmodel.TotalDebit = parseFloat(json.TotalDebit).toFixed(2);
                            $scope.FinalTotalmodel.TotalCredit = parseFloat(json.TotalCredit).toFixed(2);
                            $scope.FinalTotalmodel.TotalOutstanding = parseFloat(json.TotalOutstanding).toFixed(2);
                        })
                        return json.data;
                    } else {
                        return [];

                    }
                },
            },

            "createdRow": function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            },
            "columns": [
                { "data": null, "sortable": false },
                { "data": 'DocNo', "defaultContent": "N/A" },
                { "data": 'DocDate', "defaultContent": "N/A" },
                { "data": 'BillType', "defaultContent": "N/A" },
                { "data": 'CustomerName', "defaultContent": "N/A" },
                { "data": 'DocType', "defaultContent": "N/A" },
                { "data": 'Debit', "defaultContent": "N/A" }, //Drug                       
                { "data": 'Credit', "defaultContent": "N/A" }, //Drug                      
                { "data": 'outstanding', "defaultContent": "N/A" },
            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            },
            {
                "render": function (data, type, row) {
                    if (data != null && data != undefined && data != '') {
                        var val = parseFloat(data);
                        return val.toFixed(2);
                    } else {
                        return 0;
                    }
                },
                "targets": [6, 7, 8],
                className: "right-aligned-cell"
            },
            ]
        });

    }

    $scope.ShowHideCol = function () {
        // $('#StockBalanceReportTable').dataTable().api().ajax.reload();
        InitDataTable()
    }

    $scope.GotoDrug = function (id) {
        var SelectedItem = _.findWhere($scope.lstdata, { id: id });
        $rootScope.SelectedDrug = SelectedItem.Drug
        $state.go('app.DrugMaster')
    }

    $scope.Export = function () {
        if ($scope.Searchmodel.Search != undefined) {
            var search = $scope.Searchmodel.Search;
        }
        var CustomerGroup = $localstorage.get('CustomerGroup');
        var CreatedBy = $scope.IsAdmin ? '' : parseInt($localstorage.get('UserId'));
        var PartyName = $scope.Filtermodel.PartyName;
        var DocType = $scope.Filtermodel.DocType;
        var CurrentOffset = $scope.CurrentOffset;
        var Param = "?search=" + search + "&PartyName=" + PartyName + "&CustomerGroup=" + CustomerGroup + "&CreatedBy=" + CreatedBy + "&DocType=" + DocType + "&StartDate=" + moment($scope.Filtermodel.StartDate).format('YYYY-MM-DD') + "&EndDate=" + moment($scope.Filtermodel.EndDate).format('YYYY-MM-DD') + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order);
        window.location = $rootScope.RoutePath + "report/ExportPartyOutstandingReport" + Param;
    }
    // Alias
    $rootScope.ResetAll = $scope.init;

    $scope.init();

});