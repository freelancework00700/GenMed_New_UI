app.controller('CreditorOutstandReportController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile, $ionicModal) {

    $rootScope.BackButton = true;
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.modelAdvanceSearch = null;
        // ManageOffset();
        // ManageRole();
        $scope.ResetModel();
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

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
    }

    //Table function End
    $scope.ResetModel = function () {
        $scope.Searchmodel = {
            Search: '',
        }
    };

    $scope.FilterData = function () {
        $('#CreditorOutstandReportTable').dataTable().api().ajax.reload();
    }

    $scope.EnableFilterOption = function () {
        $(function () {
            $(".CustFilter").slideToggle();
        });
    };

    $scope.FilterAdvanceData = function (o) {
        $scope.modelAdvanceSearch = o;
        $('#CreditorOutstandReportTable').dataTable().api().ajax.reload();
    }

    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#CreditorOutstandReportTable')) {
            $('#CreditorOutstandReportTable').DataTable().destroy();
        }
        $('#CreditorOutstandReportTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [1, 'ASC'],
            "ajax": {
                url: $rootScope.RoutePath + 'report/GetCreditorOutstandReport',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    // d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                    d.modelAdvanceSearch = $scope.modelAdvanceSearch;
                    $scope.order = d.order;
                    $scope.columns = d.columns;
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
                { "data": "CustomerCode", "defaultContent": "N/A" },
                { "data": "CustomerName", "defaultContent": "N/A" },
                { "data": "TotalAmount", "defaultContent": "N/A", "sortable": false },
                { "data": "OutstandAmount", "defaultContent": "N/A", "sortable": false },
                { "data": "PaymentAmount", "defaultContent": "N/A", "sortable": false },
                { "data": null, "sortable": false },
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

                "targets": [3, 4, 5],
                className: "right-aligned-cell"
            }, {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    Action += '<a ng-click="openDetailModal(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-information"  title="Detail"></i></a>&nbsp;';
                    Action += '</div>';
                    return Action;
                },
                "targets": 6
            }]
        });
    }

    $ionicModal.fromTemplateUrl('detail-modal.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function (modal) {
        $scope.detail = modal;
    });

    $scope.openDetailModal = function (id) {
        var obj = _.findWhere($scope.lstdata, { id: parseInt(id) });
        $scope.CustomerName = obj.CustomerName;
        $scope.GetAllAPInvoiceByCustomerCode(obj.CustomerCode);
        $scope.detail.show();
    }

    $scope.closeModal = function () {
        $scope.CustomerName = null;
        $scope.detail.hide();
    }

    $scope.GetAllAPInvoiceByCustomerCode = function (o) {
        $http.get($rootScope.RoutePath + 'report/GetAPInvoiceDetailByCustomerCode?CustomerCode=' + o).then(function (res) {

            res.data.data = _.sortBy(res.data.data, function (dates) {
                return dates.APInvoiceDate;
            }).reverse();

            $scope.lstDetails = res.data.data;

            $(document).ready(function () {
                $('#CreditorDetailTable').dataTable().fnClearTable();
                $('#CreditorDetailTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#CreditorDetailTable').DataTable({
                        "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                        "lengthMenu": [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ],
                        "pageLength": 10,
                        "responsive": true,
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

    $scope.Export = function () {
        if ($scope.Searchmodel.Search != undefined) {
            var search = $scope.Searchmodel.Search;
        }
        var ObjAdvanceSearch = $scope.modelAdvanceSearch != null ? JSON.stringify($scope.modelAdvanceSearch) : '';
        // var CurrentOffset = $scope.CurrentOffset;
        // var idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
        var Param = "?search=" + search + "&ObjAdvanceSearch=" + ObjAdvanceSearch + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order);
        window.location = $rootScope.RoutePath + "report/ExportCreditorOutstandReport" + Param;
    }
    // Alias
    $rootScope.ResetAll = $scope.init;

    $scope.init();

});