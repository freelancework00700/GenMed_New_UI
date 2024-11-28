app.controller('ItemStockMovementReportController', function ($scope, $rootScope, $ionicModal, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {
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
        $('#ISOMReportTable').dataTable().api().ajax.reload();
    }
    $scope.FilterData = function () {
        $('#ISOMReportTable').dataTable().api().ajax.reload();
    }
    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#ISOMReportTable')) {
            $('#ISOMReportTable').DataTable().destroy();
        }
        $('#ISOMReportTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [0, 'DESC'],
            "ajax": {
                url: $rootScope.RoutePath + 'report/GetItemStockMovementReport',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    d.ObjAdvanceSearch = $scope.AdvanceSearchModel;
                    d.CurrentOffset = $scope.CurrentOffset;
                    d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations');
                    $scope.order = d.order;
                    $scope.columns = d.columns;
                    return d;
                },
                type: "get",
                dataSrc: function (json) {
                    if (json.success != false) {
                        $scope.LstData = json.data;
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
                { "data": 'id', "sortable": false },
                { "data": "Customer", "defaultContent": "N/A" },
                { "data": "StockType", "defaultContent": "N/A" },
                { "data": "ItemCode", "defaultContent": "N/A" },
                { "data": "UOM", "defaultContent": "N/A" },
                { "data": "BatchNumber", "defaultContent": "N/A" },
                { "data": "Location", "defaultContent": "N/A" },
                { "data": "Qty", "defaultContent": "N/A" },
                { "data": "Cost", "defaultContent": "N/A" },
                { "data": "TotalCost", "defaultContent": "N/A" },


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

                "targets": [8, 9],
                className: "right-aligned-cell"
            },
            {
                "render": function (data, type, row, meta) {
                    return Math.abs(data);
                },
                "targets": 7,
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
        var idLocations = $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations');
        var Param = "?search=" + search + "&ObjAdvanceSearch=" + ObjAdvanceSearch + "&CurrentOffset=" + CurrentOffset + "&idLocations=" + idLocations + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order);
        window.location = $rootScope.RoutePath + "report/ExportItemStockMovementReport" + Param;
    }

    $scope.init();

});