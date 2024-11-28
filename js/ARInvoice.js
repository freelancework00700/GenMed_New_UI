app.controller('ARInvoiceController', function ($scope, $rootScope, $localstorage, $compile) {

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.modelAdvanceSearch = null;
        ManageRole();

        $scope.Searchmodel = {
            Search: '',
        }
        $rootScope.BackButton = true;

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

    $scope.FilterData = function () {
        $('#ARInvoiceTable').dataTable().api().ajax.reload();
    }

    $scope.EnableFilterOption = function () {
        $(function () {
            $(".CustFilter").slideToggle();
        });
    };

    $scope.FilterAdvanceData = function (o) {
        $scope.modelAdvanceSearch = o;
        $('#ARInvoiceTable').dataTable().api().ajax.reload();
    }

    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#ARInvoiceTable')) {
            $('#ARInvoiceTable').DataTable().destroy();
        }
        $('#ARInvoiceTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [2, 'DESC'],
            "ajax": {
                url: $rootScope.RoutePath + 'arinvoice/GetAllARInvoiceDynamic',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    // d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                    d.modelAdvanceSearch = $scope.modelAdvanceSearch;
                    return d;
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
            "columns": [
                { "data": null, "sortable": false },
                { "data": "DocNo", "defaultContent": "N/A" },
                { "data": "ARInvoiceDate", "defaultContent": "N/A" },
                { "data": "CustomerCode", "defaultContent": "N/A" },
                { "data": "Description", "defaultContent": "N/A" },
                { "data": "BranchCode", "defaultContent": "N/A" },
                { "data": "Total", "defaultContent": "N/A" },
                { "data": "Tax", "defaultContent": "N/A" },
                { "data": "FinalTotal", "defaultContent": "N/A" },
                { "data": "Outstanding", "defaultContent": "N/A" },
            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            },
            {
                "render": function (data, type, row) {
                    return moment(data).format('DD-MM-YYYY');
                },
                "targets": 2
            }, {
                "render": function (data, type, row) {
                    if (data != null && data != undefined && data != '') {
                        var val = parseFloat(data);
                        return val.toFixed(2);
                    } else {
                        return 0;
                    }
                },
                "targets": [6, 7, 8, 9],
                className: "right-aligned-cell"
            }, {
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

                "targets": 4
            }
            ]
        });
    }

    $scope.init();

});