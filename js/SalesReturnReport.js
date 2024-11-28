app.controller('SalesReturnReportController', function ($scope, $rootScope, $ionicModal, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {
    $rootScope.BackButton = true;
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        ManageOffset();
        ManageRole();
        $scope.InitModel();
        setTimeout(function () {
            InitDataTable();
        })

    };

    function ManageOffset() {
        var x = new Date();
        var offset = -x.getTimezoneOffset();
        var CurrentOffset = (('00' + offset).slice(-2) >= 0 ? "+" : "-") + ('00' + parseInt(offset / 60).toString()).slice(-2) + ":" + offset % 60;
        $scope.CurrentOffset = encodeURIComponent(CurrentOffset);
    }
    $scope.InitModel = function () {
        $scope.Searchmodel = {
            Search: '',
        }
    }

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
    }
    $scope.AdvanceSearchModel = null;
    $scope.FilterAdvanceData = function (model) {
        $scope.AdvanceSearchModel = model;
        $('#SalesReturnReportTable').dataTable().api().ajax.reload();
    }
    $scope.FilterData = function () {
        $('#SalesReturnReportTable').dataTable().api().ajax.reload();
    }
    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#SalesReturnReportTable')) {
            $('#SalesReturnReportTable').DataTable().destroy();
        }
        $('#SalesReturnReportTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [2, 'DESC'],
            "ajax": {
                url: $rootScope.RoutePath + 'report/GetSalesReturnReport',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    d.ObjAdvanceSearch = $scope.AdvanceSearchModel;
                    d.CurrentOffset = $scope.CurrentOffset;
                    d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                    $scope.order = d.order;
                    $scope.columns = d.columns;
                    return d;
                },
                type: "get",
                dataSrc: function (json) {
                    if (json.success != false) {
                        $scope.LstSalesReturnData = json.data;
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
                { "data": "DocNo", "defaultContent": "N/A" },
                { "data": "DisplayInvoiceDate", "defaultContent": "N/A" },
                { "data": "CustomerCode", "defaultContent": "N/A" },
                { "data": "CustomerName", "defaultContent": "N/A" },
                { "data": "Description", "defaultContent": "N/A" },
                { "data": "BranchCode", "defaultContent": "N/A" },
                { "data": "Total", "defaultContent": "N/A" },
                { "data": "Tax", "defaultContent": "N/A" },
                { "data": "FinalTotal", "defaultContent": "N/A" },
            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            }, {
                "render": function (data, type, row) {
                    if (data != null && data != undefined && data != '') {
                        var val = parseFloat(data);
                        return val.toFixed(2);
                    } else {
                        return 0;
                    }
                },

                "targets": [7, 8, 9],
                className: "right-aligned-cell"
            },
            {
                "render": function (data, type, row) {
                    var Action = data;
                    if (data != null && data != undefined && data != '') {
                        Action = (data).toString();
                        if (Action.length > 50) {
                            Action = '<span title="' + Action + '">' + data.substr(0, 50) + '...</span>';
                        }
                    }
                    return Action;
                },
                "targets": 5
            },
            ]
        });
    }

    $scope.EnableFilterOption = function () {
        $(function () {
            $(".CustFilter").slideToggle();
        });
    };
    $scope.Export = function () {
        if ($scope.Searchmodel.Search != undefined) {
            var search = $scope.Searchmodel.Search;
        }
        var ObjAdvanceSearch = $scope.AdvanceSearchModel != null ? JSON.stringify($scope.AdvanceSearchModel) : '';
        var CurrentOffset = $scope.CurrentOffset;
        var idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
        var Param = "?search=" + search + "&ObjAdvanceSearch=" + ObjAdvanceSearch + "&CurrentOffset=" + CurrentOffset + "&idLocations=" + idLocations + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order);
        window.location = $rootScope.RoutePath + "report/ExportSalesReturnReport" + Param;
    }
    $scope.init();

});