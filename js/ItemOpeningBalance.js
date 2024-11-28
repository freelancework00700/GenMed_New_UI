app.controller('ItemOpeningBalanceController', function ($scope, $filter, $compile, $rootScope, $http, $localstorage, $ionicPopup, $ionicModal, $state, $localstorage, $ionicLoading, $ionicScrollDelegate) {

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        ManageRole();
        $scope.ResetModel();
        $rootScope.BackButton = $scope.IsList = true;
        $scope.CurrentCustomerGroup = $localstorage.get('CustomerGroup')
    };

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
        // $scope.GetAllItem();
        $scope.GetAllActiveLocations();

    }

    $scope.GetAllItem = function () {
        $http.get($rootScope.RoutePath + 'item/GetAllItem').then(function (res) {
            $scope.lstItems = res.data.data;
        });
        // $scope.GetAllActiveLocations();

    };

    $scope.GetAllItemSearch = function (o) {
        if (o) {
            var params = {
                ItemName: o,
                CustGroupName: $scope.CurrentCustomerGroup == 'Genmed' ? null : $scope.CurrentCustomerGroup
            }
            $http.get($rootScope.RoutePath + 'item/GetAllItemBySearchText', { params: params }).then(function (res) {
                $scope.lstItemsSearch = res.data.data;

                setTimeout(function () {
                    var li = $('.autosearch');
                    var liSelected;
                    var $container = $('.productul');
                    $(window).keydown(function (e) {
                        if (e.which === 40) {
                            if (liSelected) {
                                liSelected.removeClass('selected');
                                next = liSelected.next();
                                if (next.length > 0) {
                                    liSelected = next.addClass('selected');
                                } else {
                                    liSelected = li.eq(0).addClass('selected');
                                }
                                $container.scrollTop(
                                    liSelected.offset().top - $container.offset().top + $container.scrollTop()
                                );
                            } else {
                                console.log(li.eq(0))
                                liSelected = li.eq(0).addClass('selected');
                                $container.scrollTop(
                                    liSelected.offset().top - $container.offset().top + $container.scrollTop()
                                );
                            }

                        } else if (e.which === 38) {
                            if (liSelected) {
                                liSelected.removeClass('selected');
                                next = liSelected.prev();
                                if (next.length > 0) {
                                    liSelected = next.addClass('selected');
                                } else {
                                    liSelected = li.last().addClass('selected');
                                    $container.scrollTop(
                                        liSelected.offset().top - $container.offset().top + $container.scrollTop()
                                    );
                                }
                            } else {
                                liSelected = li.last().addClass('selected');
                                $container.scrollTop(
                                    liSelected.offset().top - $container.offset().top + $container.scrollTop()
                                );
                            }

                        } else if (e.which === 13) {
                            var find = _.findWhere($scope.lstItemsSearch, { id: parseInt($('.autosearch.selected').attr('id')) });
                            if (find) {
                                $scope.ChangeItemCode(find);
                            }

                        }
                    });
                }, 10)
            });
        } else {
            $scope.lstItemsSearch = [];
        }
    };

    $scope.GetAllActiveLocations = function () {
        var params = {
            idLocations: $scope.IsAdmin || $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations')
        }
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', {
            params: params
        }).then(function (res) {
            $scope.lstLocation = res.data.data;
            setTimeout(function () {
                InitDataTable();
            })
        });
    };


    $scope.ChangeItemCode = function (o, callback) {
        // var obj = _.findWhere($scope.lstItems, { ItemCode: ItemCode });
        // $scope.ListItemUOM = [];
        // $scope.ListItemBatch = [];
        // if (obj) {
        //     $scope.ListItemUOM = obj.itemuoms;
        //     $scope.model.UOM = obj.BaseUOM;
        //     if (obj.isBatch == 1) {
        //         $scope.ListItemBatch = obj.itembatches;
        //     }
        // }
        $scope.model.ItemCode = o.ItemCode;
        $scope.model.ItemName = o.ItemName;
        $scope.lstItemsSearch = [];
        $scope.ListItemUOM = [];
        $scope.ListItemBatch = [];
        $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + o.ItemCode).then(function (res) {
            $scope.lstItems = res.data.data;

            var obj = _.findWhere($scope.lstItems, { ItemCode: o.ItemCode });

            if (obj) {
                $scope.ListItemUOM = obj.itemuoms;
                $scope.model.UOM = obj.BaseUOM;
                $scope.model.ItemName = obj.ItemName;
                if (obj.isBatch == 1) {
                    $scope.ListItemBatch = obj.itembatches;
                }
                if ($scope.ListItemBatch.length > 0) {
                    _.filter($scope.ListItemBatch, function (z) {
                        var objStock = {
                            ItemCode: o.ItemCode,
                            BatchNo: z.BatchNumber,
                            UOM: $scope.model.UOM,
                            Location: $scope.model.idLocations
                        }

                        $http.get($rootScope.RoutePath + 'item/GetAllItemBatchBalQtyByItemCode', { params: objStock }).then(function (res) {

                            var objz = res.data.data;
                            z['Stock'] = objz ? objz.BalQty : 0;
                        });
                        // var objz = _.findWhere(obj.itembatchbalqties, { BatchNo: z.BatchNumber, UOM: o.UOM, Location: o.idLocations });
                        // z['Stock'] = objz ? objz.BalQty : 0;
                    })
                }
            }
        });

        if (callback) {
            return callback();
        }
    }

    $scope.ChangeUOM = function () {
        $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + $scope.model.ItemCode).then(function (res) {
            if ($scope.ListItemBatch.length > 0) {
                _.filter($scope.ListItemBatch, function (z) {
                    var objStock = {
                        ItemCode: $scope.model.ItemCode,
                        BatchNo: z.BatchNumber,
                        UOM: $scope.model.UOM,
                        Location: $scope.model.idLocations
                    }
                    $http.get($rootScope.RoutePath + 'item/GetAllItemBatchBalQtyByItemCode', { params: objStock }).then(function (res) {
                        var objz = res.data.data;
                        z['Stock'] = objz ? objz.BalQty : 0;
                    });
                    // var objz = _.findWhere(obj.itembatchbalqties, { BatchNo: z.BatchNumber, UOM: o.UOM, Location: o.idLocations });
                    // z['Stock'] = objz ? objz.BalQty : 0;
                })
            }
        });
    }

    $scope.FilterData = function () {
        $('#IOBTable').dataTable().api().ajax.reload();

    }

    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#IOBTable')) {
            $('#IOBTable').DataTable().destroy();
        }
        $('#IOBTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [8, 'DESC'],
            "ajax": {
                url: $rootScope.RoutePath + 'itemopeningbalance/GetAllItemOpeningBalanceDynamic',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
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
            "columns": [{
                "data": null,
                "sortable": false
            },
            {
                "data": "item.ItemName",
                "defaultContent": "N/A"
            },
            {
                "data": "UOM",
                "defaultContent": "N/A"
            },
            {
                "data": "BatchNumber",
                "defaultContent": "N/A"
            },
            {
                "data": "location.Name",
                "defaultContent": "N/A"
            },
            {
                "data": "Seq",
                "defaultContent": "N/A"
            },
            {
                "data": "Qty",
                "defaultContent": "N/A"
            },
            {
                "data": "Cost",
                "defaultContent": "N/A"
            },
            {
                "data": "DocDate",
                "defaultContent": "N/A"
            },
            {
                "data": null,
                "sortable": false
            },

            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            },
            {
                "render": function (data, type, row, meta) {
                    if (data == '' || data == null || data == undefined) {
                        return "N/A";
                    }
                    return moment(data).format('DD-MM-YYYY');
                },
                "targets": 8,
            },
            {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>';
                    Action += '<a ng-click="DeleteItemOpeningBalance(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>';
                    Action += '</div>';
                    return Action;
                },
                "targets": 9,
            },
            {
                "render": function (data, type, row, meta) {
                    return $filter('number')(data);
                },
                "targets": [7],
                className: "right-aligned-cell"
            },

            ]
        });
    }

    $scope.formsubmit = false
    $scope.SaveItemOpeningBalance = function (form) {

        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            $scope.formsubmit = false;

            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'itemopeningbalance/SaveItemOpeningBalance', $scope.model)
                .then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $ionicScrollDelegate.scrollTop();
                        $scope.init();
                    }
                    $ionicLoading.show({
                        template: res.data.message
                    });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                })
                .catch(function (err) {
                    $ionicLoading.show({
                        template: 'Unable to save record right now. Please try again later.'
                    });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                });

        }
    };

    // Use more distinguished and understandable naming
    $scope.CopyToModel = function (id) {
        var selectedItem = _.findWhere($scope.lstdata, {
            id: parseInt(id)
        });
        $scope.ChangeItemCode(selectedItem, function () {
            for (var prop in $scope.model) {
                $scope.model[prop] = selectedItem[prop];
            }
            $scope.model.idLocations = $scope.model.idLocations ? $scope.model.idLocations.toString() : '';
            $scope.model.LastBalQty = $scope.model.Qty * -1;
            $scope.model.LastBatchNo = $scope.model.BatchNumber;
            $scope.model.LastLocation = $scope.model.idLocations;
            $scope.model.LastItemCode = $scope.model.ItemCode;
            $scope.model.LastUOM = $scope.model.UOM;
            $rootScope.BackButton = $scope.IsList = false;
        })
    };

    $scope.DeleteItemOpeningBalance = function (id) {
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
                $rootScope.ShowLoader();
                return $http.get($rootScope.RoutePath + 'itemopeningbalance/DeleteItemOpeningBalance', {
                    params: {
                        id: id
                    }
                }).then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $ionicScrollDelegate.scrollTop();
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $scope.Cancel();
                    }
                    $ionicLoading.show({
                        template: res.data.message
                    });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                })
                    .catch(function (err) {
                        $ionicLoading.show({
                            template: 'Unable to save record right now. Please try again later.'
                        });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                    });
            } else {
                $scope.Cancel();
            }
        });
    }


    $scope.ResetModel = function () {
        $scope.model = {
            id: '',
            ItemCode: '',
            ItemName: '',
            UOM: '',
            idLocations: $localstorage.get('DefaultLocation'),
            BatchNumber: null,
            Seq: null,
            Qty: '',
            Cost: '',
            DocDate: new Date(),
            LastBalQty: 0,
            LastBatchNo: null,
            LastLocation: null,
            LastItemCode: null,
            LastUOM: null,
        };

        $scope.Importmodel = {
            idLocations: null
        }

        $scope.Searchmodel = {
            Search: '',
        }

        $scope.ListItemUOM = [];
        $scope.ListItemBatch = [];

    };

    $scope.Add = function () {
        $scope.ResetModel();
        setTimeout(function () {
            $('#docDates').val(moment().format('DD-MM-YYYY'));
        })
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;

    }

    // Alias
    $rootScope.ResetAll = $scope.init;

    $scope.Cancel = function () {
        $scope.ResetModel();
        $rootScope.BackButton = $scope.IsList = true;
        $scope.formsubmit = false;
        $('#IOBTable').dataTable().fnClearTable();
        $('#IOBTable').dataTable().fnDestroy();
        setTimeout(function () {
            InitDataTable();
        })
    }
    //////////

    //****************************Import Item *************** */

    //Import function
    $ionicModal.fromTemplateUrl('ImportItem.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.ImportItemModal = modal;
    });

    $scope.closeModal = function () {
        $scope.ImportItemModal.hide();
    }



    $scope.Import = function () {
        resetFile();
        $scope.removeImportFile();
        $scope.ImportItemModal.show();
    }

    function resetFile() {
        $scope.FileName = '';
        $scope.FormImportSubmit = false;
    }
    resetFile();

    $scope.removeImportFile = function () {
        $('#FilesImport').val("");
    }

    $scope.setFile = function (element) {
        if (element.files.length > 0) {
            $scope.FileName = element.files[0].name;
            $scope.FileType = element.files[0].type;
        }
        $scope.$apply(function () {
            $scope.File = element.files;
            $scope.FileUrl = URL.createObjectURL(event.target.files[0]);;
        })
    }

    $scope.ImportExcel = function (form) {
        if (form.$invalid) {
            $scope.FormImportSubmit = true;
        } else {
            $rootScope.ShowLoader();
            if ($scope.FileName != null) {
                if ($scope.FileType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    var formData = new FormData();
                    formData.append($scope.Importmodel.idLocations, $scope.File[0]);
                    $http.post($rootScope.RoutePathImport + "UploadItemOpeningStockImportExcel", formData, {
                        transformRequest: angular.identity,
                        headers: { 'Content-Type': undefined }
                    }).then(function (data) {
                        $ionicLoading.show({ template: '<div class="text-center">' + data.data.message + '</div>' });
                        if (data.data.success == true) {
                            setTimeout(function () {
                                $ionicLoading.hide();
                                $scope.ImportItemModal.hide();
                                // $scope.init();
                                InitDataTable()
                            }, 1000);
                        } else {
                            setTimeout(function () {
                                $ionicLoading.hide();
                            }, 1000)
                        }
                    });
                } else {
                    $ionicLoading.hide()
                    $ionicLoading.show({ template: '<div class="text-center">Only Excel File Supported</div>' });
                    setTimeout(function () {
                        $ionicLoading.hide();
                    }, 1000)
                }
            } else {
                $ionicLoading.hide()
                $ionicLoading.show({ template: '<div class="text-center">Select atleast one file</div>' });
                setTimeout(function () {
                    $ionicLoading.hide();
                }, 1000)
            }
        }
    }

    //****************************End Import Item *************** */


    ///************************************ */Download Template ****************************************************

    $scope.DownloadExcelTemplateItemBatch = function () {
        window.location = $rootScope.RoutePath + "itemopeningbalance/DownloadTemplateForUploadItemOpeningBalance?isBatch=1";
    }


    $scope.init();
})