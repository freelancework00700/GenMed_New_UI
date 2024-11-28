app.controller('EnquiryController', function($scope, $compile, $rootScope, $http, $localstorage, $ionicPopup, $state, $ionicLoading, $ionicScrollDelegate, $ionicModal) {
    $scope.init = function() {
        $rootScope.BackButton = $scope.IsList = true;
        $scope.ManageModel();
        setTimeout(function() {
            InitDataTable();
        })
    };

    $scope.ManageModel = function() {
        $scope.Searchmodel = {
            Search: '',
            Search1: '',
            StartDate: '',
            EndDate: '',
        }

        $scope.EmailModel = {
            IdEnquiry: '',
            EmailSubject: '',
            EmailText: '',
            Email: '',

        }
    }

    $scope.EnableFilterOption = function() {
        $(function() {
            $(".CustFilter").slideToggle();
        });
    };
    $scope.FilterData = function() {
        $('#EnquiryTable').dataTable().api().ajax.reload();
    }

    $scope.ResetFilterData = function() {
        $scope.Searchmodel.StartDate = '';
        $scope.Searchmodel.EndDate = '';
        $scope.FilterData();
    }

    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#EnquiryTable')) {
            $('#EnquiryTable').DataTable().destroy();
        }
        $('#EnquiryTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [5, 'DESC'],
            "ajax": {
                url: $rootScope.RoutePath + 'enquiry/GetAllDynamicEnquiry',
                data: function(d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    d.StartDate = $scope.Searchmodel.StartDate;
                    d.EndDate = $scope.Searchmodel.EndDate;
                    return d;
                },
                type: "get",
                dataSrc: function(json) {
                    if (json.success != false) {
                        $scope.lstdata = json.data;
                        return json.data;
                    } else {
                        return [];
                    }
                },
            },
            "createdRow": function(row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            },
            "columns": [{
                    "data": null,
                    "sortable": false
                },
                {
                    "data": "name",
                    "defaultContent": ""
                },
                {
                    "data": "email",
                    "defaultContent": ""
                },
                {
                    "data": "Message",
                    "defaultContent": ""
                },
                {
                    "data": "status",
                    "defaultContent": ""
                },
                {
                    "data": "CreatedOn",
                    "defaultContent": ""
                },
                {
                    "data": null,
                    "sortable": false,
                },

            ],
            "columnDefs": [{
                    "render": function(data, type, row, meta) {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    },
                    "targets": 0,
                }, {
                    "width": "40%",
                    "targets": 3,
                },
                {
                    "render": function(data, type, row) {

                        if (data == 1) {
                            return '<span style="padding: 5px 8px 5px 8px;background:#5cb75c;color: #fff;">Completed</span>';

                        }
                        return '<span style="padding: 5px 8px 5px 8px;background: #D3D3D3;color: #00000;">Pending</span>';

                    },
                    "targets": 4,
                },
                {
                    "render": function(data, type, row) {
                        if (data == undefined || data == null || data == '') {
                            return "";
                        }
                        return moment(data).format('DD-MM-YYYY');

                    },
                    "targets": 5,
                },
                {
                    "render": function(data, type, row) {
                        var Action = '<div layout="row" layout-align="center center">';
                        Action += '<a ng-click="Replayviaemail(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-reply-all" title="Replay Via Email"></i></a><div Style="padding:2px"></div>';
                        Action += '<a ng-click="GotoEnquiryLog(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-email" title="Enquiry Log"></i></a>';
                        Action += '</div>';
                        return Action;
                    },
                    "width": "5%",
                    "targets": 6,
                }
            ]
        });
    }




    $scope.Replayviaemail = function(id) {
        $ionicModal.fromTemplateUrl('ReplayViaEmail-modal.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.Modal = modal;
            var objEmail = _.findWhere($scope.lstdata, { id: parseInt(id) });
            $scope.EmailModel = {
                IdEnquiry: '',
                EmailSubject: '',
                EmailText: '',
                Email: '',
            }
            $scope.EmailModel.IdEnquiry = objEmail.id;
            $scope.EmailModel.Email = objEmail.email;
            $scope.Modal.show();
        });



    }
    $scope.FormSubmit = false;
    $scope.SendEmail = function(form) {
        if (form.$invalid) {
            $scope.FormSubmit = true;
            return
        }
        $ionicLoading.show({ template: "Wait... Email are sending..." });
        $http.post($rootScope.RoutePath + "enquiry/Replyviaenail",
            $scope.EmailModel
        ).then(function(data) {
            $ionicLoading.hide();
            if (data.data.success == true) {
                $ionicLoading.show({ template: data.data.message });
                setTimeout(function() {
                    $ionicLoading.hide()
                }, 1000);
                $scope.init();
                $scope.closeModal();
            } else {
                if (data.data.data == 'TOKEN') {
                    $rootScope.logout();
                } else {
                    $ionicLoading.show({ template: data.data.message });
                    setTimeout(function() {
                        $ionicLoading.hide()
                    }, 1000);
                }
            }
        });
    }

    $scope.GotoEnquiryLog = function(IdEnquiry) {
        $ionicModal.fromTemplateUrl('EnquiryLog-modal.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function(modal) {
            $scope.Modal1 = modal;
            $scope.GetEnquiryLog(IdEnquiry, function() {
                $scope.Modal1.show();
            })
        });
    }
    $scope.GetEnquiryLog = function(IdEnquiry, GoBack) {
        var params = {
            IdEnquiry: IdEnquiry
        }

        $http.get($rootScope.RoutePath + 'enquiry/GetEnquiryLogByIdEnquiry', { params: params }).then(function(res) {
            $scope.lstLog = res.data.data;
            $(document).ready(function() {
                $('#LogTbl').dataTable().fnClearTable();
                $('#LogTbl').dataTable().fnDestroy();
                setTimeout(function() {
                    $('#LogTbl').DataTable({
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
            GoBack();
        });
    }
    $scope.FilterDataLog = function() {
        if ($scope.Searchmodel.Search1 != '' && $scope.Searchmodel.Search1 != null && $scope.Searchmodel.Search1 != undefined) {
            $('#LogTbl').dataTable().fnFilter($scope.Searchmodel.Search1);
        } else {
            $('#LogTbl').dataTable().fnFilter("");
        }
    }

    $scope.closeModal = function() {
        if ($scope.Modal) {
            $scope.Modal.remove();
        }
        if ($scope.Modal1) {
            $scope.Modal1.remove();
        }

    }
    $scope.init();

})