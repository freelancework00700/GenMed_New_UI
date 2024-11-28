app.controller('UOMConversionController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $compile, $localstorage, $state) {

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        ManageRole();
        $scope.tab = { selectedIndex: 0 };
        $scope.model = {
            id: null,
            DocNo: '',
            DocDate: moment().format('DD-MM-YYYY'),
            Description: '',
            Note: '',
            FromDocType: null,
            FromDocKey: null,
            FromDocNo: '',
        }
        $scope.Searchmodel = {
            Search: '',
        }
        $rootScope.BackButton = $scope.IsList = true;
        $scope.lstSelectedUOM = [];
        $scope.lstBatch = [];
        $scope.getAllUserLoaction();
        $scope.GetAllItem();
        $scope.GetAllUOM();
        $scope.AddUOMItemInList();
        $scope.tab = { selectedIndex: 0 };
        setTimeout(function () {
            InitDataTable()
        })
    }

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
    }

    //Batch Start
    function AssignClickEventBatch() {

        setTimeout(function () {
            $("#tblUOMConv tr").unbind("click");

            $("#tblUOMConv tr").click(function () {

                if ($(this)[0].accessKey != "") {
                    for (var k = 0; k < $scope.lstSelectedUOM.length; k++) {
                        $scope.lstSelectedUOM[k].IsEdit = false;
                    }

                    $("#tblUOMConv tr").removeClass("highlight");
                    $(this).addClass("highlight");

                    $scope.WorkingUOM = $scope.lstSelectedUOM[$(this)[0].accessKey];
                    $scope.WorkingUOM.IsEdit = true;
                    // var BatchNo = $scope.WorkingUOM.BatchNo;
                    $scope.GetAllItemBachNo($scope.WorkingUOM, true);
                    // $scope.WorkingUOM.BatchNo = BatchNo;
                    $scope.UOMModel = $scope.WorkingUOM;
                    $scope.$apply();
                }
            });
        })
    }

    $scope.getAllUserLoaction = function () {
        var params = {
            idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
        }
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', { params: params }).then(function (res) {
            $scope.lstLocation = res.data.data;

        });
    };

    $scope.GetAllItem = function () {
        $http.get($rootScope.RoutePath + 'item/GetAllItem').then(function (res) {
            $scope.lstItems = res.data.data;
        });
    };

    $scope.GetAllItemBachNo = function (o, flg) {
        if (!flg) {
            o.BatchNo = null;
            o.FromQty = null;
            o.ToQty = null;
            o.FromUOM = null;
            o.ToUom = null;
            o.lstUOM = [];
            o.lstBatch = [];
        }
        // $scope.UOMModel.BatchNo = null;
        $scope.lstBatch = [];
        if (o.ItemCode != '' && o.ItemCode != null && o.ItemCode != undefined) {
            var obj = _.findWhere($scope.lstItems, { ItemCode: (o.ItemCode).toString() });
            // $scope.lstBatch = obj.itembatches;
            // $scope.lstUOM = obj.itemuoms
            o.lstBatch = obj.itembatches;
            o.lstUOM = obj.itemuoms;
        }
    }

    //UOM start
    $scope.GetAllUOM = function () {
        $http.get($rootScope.RoutePath + 'uom/GetAllActiveUom').then(function (res) {
            // $scope.lstUOM = res.data.data;
        });
    };

    $scope.CalculateToQty = function (item, status, index) {
        if (item.FromUOM != null && item.ToUom != null && item.FromUOM == item.ToUom) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'From UOM and To UOM must be different.',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            })
            alertPopup.then(function (res) {
                if (status == 'FromUOM') {
                    item.FromUOM = null;
                } else if (status == 'ToUom') {
                    item.ToUom = null;
                }
            })
        } else {
            var list = angular.copy($scope.lstSelectedUOM);
            list.splice(index, 1);
            if (item.FromUOM != null && item.FromUOM != undefined && item.FromUOM != '') {
                var obj = _.filter(list, function (o) {
                    if (o.ItemCode == item.ItemCode && o.FromUOM == item.FromUOM && o.Location == item.Location) {
                        return o;
                    }
                })[0];
                if (obj != null && obj != undefined && obj != '') {
                    item.FromUOM = null;
                    $ionicLoading.show({ template: "Please select another FromUOM ,this FromUOM already selected" });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                }
            }


            if (item.ToUom != null && item.FromUOM != null && item.FromQty != null) {
                var obj = _.findWhere($scope.lstItems, { ItemCode: item.ItemCode });
                var FromPrice = _.findWhere(obj.itemuoms, { UOM: item.FromUOM }).Rate;
                var ToPrice = _.findWhere(obj.itemuoms, { UOM: item.ToUom }).Rate;
                item.ToQty = parseInt((parseFloat(item.FromQty) * parseFloat(FromPrice)) / parseFloat(ToPrice));
            }
            if (item.FromQty == null) {
                item.ToQty = null;
            }
        }
    }


    $scope.AddUOMItemInList = function () {
        // if ($scope.WorkingUOM != undefined && $scope.WorkingUOM.ItemCode == null) {
        //     $ionicLoading.show({ template: "Select Item Code" });
        //     setTimeout(function () {
        //         $ionicLoading.hide()
        //     }, 1000);
        //     return;
        // }

        if ($scope.lstSelectedUOM.length > 0 && $scope.lstSelectedUOM[$scope.lstSelectedUOM.length - 1].ItemCode == null) {
            $ionicLoading.show({ template: "Select Item Code" });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return;
        }
        _.filter($scope.lstSelectedUOM, function (item) {
            item.IsEdit = false;
        });
        $scope.UOMModel = {
            id: null,
            ItemCode: null,
            description: null,
            Location: null,
            BatchNo: null,
            ProjNo: null,
            FromQty: null,
            ToQty: null,
            FromUOM: null,
            ToUom: null,
            IsEdit: true,
            LastBalQty: 0,
            LastBatchNo: null,
            LastLocation: null,
            LastItemCode: null,
            LastUOM: null,
            lstUOM: [],
            lstBatch: [],
        }

        $scope.lstSelectedUOM.push($scope.UOMModel);
        $scope.WorkingUOM = $scope.UOMModel;
        $scope.WorkingUOM.IsEdit = true;
        // var BatchNo = $scope.WorkingUOM.BatchNo;
        // $scope.GetAllItemBachNo($scope.WorkingUOM, true);
        // $scope.WorkingUOM.BatchNo = BatchNo;
        // AssignClickEventBatch();

        // setTimeout(function() {
        //     $scope.SelectRaw($scope.lstSelectedUOM.length - 1);
        // })
    }

    $scope.formsubmit = false;
    $scope.SaveItem = function (form) {

        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            var NoValidData = _.filter($scope.lstSelectedUOM, function (item) {
                if (item.ItemCode == null || item.FromUOM == null || item.ToUom == null || item.Location == null || item.FromQty == null || item.ToQty == null || (item.FromQty).toString() == '' || (item.ToQty).toString() == '') {
                    return item;
                }
            });

            if (NoValidData != '') {
                var alertPopup = $ionicPopup.alert({
                    title: '',
                    template: 'Fill all compulsory filed in list.',
                    cssClass: 'custPop',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                });
            } else {
                $scope.ListMaxFromQty = [];
                $scope.ListMinFromQty = [];

                $scope.ListMaxToQty = [];
                $scope.ListMinToQty = [];


                _.filter($scope.lstSelectedUOM, function (p) {
                    var obj = _.findWhere(p.lstUOM, { UOM: p.FromUOM });
                    if (obj) {
                        if ((parseInt(p.FromQty) + parseInt(obj.BalQty)) > obj.MaxQty) {
                            $scope.ListMaxFromQty.push(p);
                        }
                        if ((parseInt(p.FromQty) + parseInt(obj.BalQty)) < obj.MinQty) {
                            $scope.ListMinFromQty.push(p);
                        }
                    }
                })

                //return;
                if ($scope.ListMaxFromQty.length > 0 || $scope.ListMinFromQty.length > 0) {
                    var confirmPopup = $ionicPopup.confirm({
                        title: "",
                        template: '<p ng-if="ListMaxFromQty.length > 0"><b>From Qty for ' + _.pluck($scope.ListMaxFromQty, 'ItemCode').toString() + ' is too high base on maximum Qty.</b></p>' +
                            '<p ng-if="ListMinFromQty.length > 0"><b>And</b></p>' +
                            '<p ng-if="ListMinFromQty.length > 0"><b>From Qty for ' + _.pluck($scope.ListMinFromQty, 'ItemCode').toString() + ' is too low base on minimum Qty.</b></p>' +
                            '<p>Are you sure you want to continue ?</p>',
                        cssClass: 'custPop',
                        cancelText: 'Cancel',
                        okText: 'Ok',
                        okType: 'btn btn-green',
                        cancelType: 'btn btn-red',
                        scope: $scope,
                    })

                    confirmPopup.then(function (res) {
                        if (res) {
                            var obj = {
                                objconv: angular.copy($scope.model),
                                objitem: angular.copy($scope.lstSelectedUOM)
                            }
                            if (new Date($scope.model.DocDate) == 'Invalid Date') {
                                obj.objconv.DocDate = moment().set({ 'date': $scope.model.DocDate.split('-')[0], 'month': $scope.model.DocDate.split('-')[1] - 1, 'year': $scope.model.DocDate.split('-')[2] }).format('YYYY-MM-DD');
                            } else {
                                if (moment(obj.objconv.DocDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                                    obj.objconv.DocDate = moment(new Date($scope.model.DocDate)).format('YYYY-MM-DD');
                                } else {
                                    obj.objconv.DocDate = moment($scope.model.DocDate, "DD-MM-YYYY").format('YYYY-MM-DD');
                                }
                            }
                            $rootScope.ShowLoader();
                            $http.post($rootScope.RoutePath + 'uomconv/SaveUomconv', obj).then(function (res) {
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
                        }
                    })
                } else {
                    var obj = {
                        objconv: $scope.model,
                        objitem: $scope.lstSelectedUOM
                    }
                    if (new Date($scope.model.DocDate) == 'Invalid Date') {
                        obj.objconv.DocDate = moment().set({ 'date': $scope.model.DocDate.split('-')[0], 'month': $scope.model.DocDate.split('-')[1] - 1, 'year': $scope.model.DocDate.split('-')[2] }).format('YYYY-MM-DD');
                    } else {
                        obj.objconv.DocDate = moment(new Date($scope.model.DocDate)).format('YYYY-MM-DD');
                    }
                    $rootScope.ShowLoader();
                    $http.post($rootScope.RoutePath + 'uomconv/SaveUomconv', obj).then(function (res) {
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
                }
            }
        }
    }

    $scope.RemoveUOMItemInList = function (index) {
        $scope.lstSelectedUOM.splice(index, 1);
        if ($scope.lstSelectedUOM.length == 0) {
            $scope.AddUOMItemInList();
        }
        $scope.WorkingUOM = null;
        // if ($scope.lstSelectedUOM.length > 1) {
        //     $scope.lstSelectedUOM = _.filter($scope.lstSelectedUOM, function (item) {
        //         return (item.ItemCode != o.ItemCode || item.FromUOM != o.FromUOM);
        //     });
        //     _.filter($scope.lstSelectedUOM, function (item) {
        //         item.IsEdit = false;
        //     });
        //     $scope.lstSelectedUOM[0].IsEdit = true;
        //     $scope.WorkingUOM = null;
        //     $scope.WorkingUOM = $scope.lstSelectedUOM[0];
        //     $scope.GetAllItemBachNo($scope.WorkingUOM, true);
        //     // AssignClickEventBatch();

        //     // setTimeout(function() {
        //     //     $scope.SelectRaw(0);
        //     // })
        // } else {
        //     $scope.UOMModel = {
        //         id: null,
        //         ItemCode: null,
        //         description: null,
        //         Location: null,
        //         BatchNo: null,
        //         ProjNo: null,
        //         FromQty: null,
        //         ToQty: null,
        //         FromUOM: null,
        //         ToUom: null,
        //         IsEdit: true,
        //         LastBalQty: 0,
        //         LastBatchNo: null,
        //         LastLocation: null,
        //         LastItemCode: null,
        //         LastUOM: null,
        //         lstUOM: [],
        //         lstBatch: [],
        //     }
        //     $scope.lstSelectedUOM = [];
        //     $scope.lstSelectedUOM.push($scope.UOMModel);
        //     $scope.WorkingUOM = $scope.UOMModel;
        //     $scope.WorkingUOM.IsEdit = true;
        //     // var BatchNo = $scope.WorkingUOM.BatchNo;
        //     $scope.GetAllItemBachNo($scope.WorkingUOM, true);
        // }
    }

    $scope.SelectRaw = function (index) {
        $("#tblUOMConv tr[accessKey='" + index + "']").trigger("click");
    }

    //Table function End
    $scope.ResetModel = function () {
        $scope.model = {
            id: null,
            DocNo: '',
            DocDate: moment().format('DD-MM-YYYY'),
            Description: '',
            Note: '',
            FromDocType: null,
            FromDocKey: null,
            FromDocNo: '',
        }
        // $scope.model = {
        //     id: null,
        //     ItemCode: '',
        //     Note: '',
        //     Descriptions: '',
        //     Descriptions2: '',
        //     idItemType: '',
        //     idPurchaseTax: '',
        //     idSupplyTax: '',
        //     BaseUOM: '',
        //     SalesUOM: '',
        //     PurchaseUOM: '',
        //     ReportUOM: '',
        //     isActive: true,
        //     isBatch: false,
        //     SupplyTaxCode: '',
        //     PurchaseTaxCode: ''
        // };
        $scope.SelectedTab = 'Details';
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.lstSelectedUOM = [];
        $scope.lstSelectedBatch = [];
        $scope.WorkingUOM = null;
        $scope.WorkingBatch = null;
        $('#UOMTable').dataTable().fnClearTable();
        $('#UOMTable').dataTable().fnDestroy();
        setTimeout(function () {
            InitDataTable();
        })
    };

    $rootScope.ResetAll = $scope.init;

    $scope.Add = function () {
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;
    }

    $scope.FilterData = function () {
        $('#UOMTable').dataTable().api().ajax.reload();
    }

    function InitDataTable() {
        $('#UOMTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [2, 'desc'],
            "ajax": {
                url: $rootScope.RoutePath + 'uomconv/GetAllUOMConverDynamic',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
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
                { "data": "DocDate", "defaultContent": "N/A" },
                { "data": "Description", "defaultContent": "N/A" },
                { "data": "FromDocType", "defaultContent": "N/A" },
                { "data": "FromDocKey", "defaultContent": "N/A" },
                { "data": "FromDocNo", "defaultContent": "N/A" },
                // { "data": null },
                { "data": null, "sortable": false, },
            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            },
            {
                "render": function (data, type, row, meta) {
                    if (data == '' || data == null) {
                        return 'N/A';
                    }
                    return data;
                },
                "targets": 6,
            },
            {
                "render": function (data, type, row) {
                    var Action = data;
                    if (data != null && data != undefined && data != '') {
                        Action = (data).toString();
                        if (Action.length > 50) {
                            Action = '<span title="' + Action + '">' + data.substr(0, 50) + '...</span>';
                        }
                    } else {
                        Action = "N/A";
                    }
                    return Action;
                },

                "targets": 3
            }, {
                "render": function (data, type, row) {
                    var date = '';
                    if (data != null && data != '' && data != undefined) {
                        date = moment.utc(new Date(data)).format('DD-MM-YYYY');
                    } else {
                        date = 'N/A';
                    }

                    return date;
                },
                "targets": 2
            }, {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                    Action += '<a ng-click="DeleteUOMConv(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>';
                    Action += '</div>';
                    return Action;
                },
                "targets": 7
            }
            ]
        });
    }

    $scope.CopyToModel = function (id) {
        var o = _.findWhere($scope.lstdata, { id: id })
        $scope.model.id = o.id;
        $scope.model.DocNo = o.DocNo;
        $scope.model.DocDate = moment(new Date(o.DocDate)).format('DD-MM-YYYY');
        $scope.model.Description = o.Description;
        $scope.model.Note = o.Note;
        $scope.model.FromDocType = o.FromDocType;
        $scope.model.FromDocKey = o.FromDocKey;
        $scope.model.FromDocNo = o.FromDocNo;
        $scope.lstSelectedUOM = [];
        $rootScope.BackButton = $scope.IsList = false;
        for (var i = 0; i < o.uomconvdtlables.length; i++) {
            var obj = {
                id: o.uomconvdtlables[i].id,
                ItemCode: o.uomconvdtlables[i].ItemCode,
                description: o.uomconvdtlables[i].description,
                Location: o.uomconvdtlables[i].idLocation != null && o.uomconvdtlables[i].idLocation != undefined ? (o.uomconvdtlables[i].idLocation).toString() : '',
                BatchNo: o.uomconvdtlables[i].BatchNo,
                ProjNo: o.uomconvdtlables[i].ProjNo,
                FromQty: o.uomconvdtlables[i].FromQty,
                ToQty: o.uomconvdtlables[i].ToQty,
                FromUOM: o.uomconvdtlables[i].FromUOM,
                ToUom: o.uomconvdtlables[i].ToUom,
                IsEdit: false,
                LastBalFromQty: o.uomconvdtlables[i].FromQty,
                LastBalToQty: o.uomconvdtlables[i].ToQty,
                LastBatchNo: o.uomconvdtlables[i].BatchNo,
                LastLocation: o.uomconvdtlables[i].idLocation,
                LastItemCode: o.uomconvdtlables[i].ItemCode,
                LastFromUOM: o.uomconvdtlables[i].FromUOM,
                LastToUOM: o.uomconvdtlables[i].ToUom,
            }
            if (obj.ItemCode != '' && obj.ItemCode != null && obj.ItemCode != undefined) {
                var obj1 = _.findWhere($scope.lstItems, { ItemCode: (obj.ItemCode).toString() });
                // $scope.lstBatch = obj.itembatches;
                // $scope.lstUOM = obj.itemuoms
                obj.lstBatch = obj1.itembatches;
                obj.lstUOM = obj1.itemuoms;
            }
            $scope.lstSelectedUOM.push(obj)

        }


        // AssignClickEventBatch();

        // setTimeout(function() {
        //     $scope.SelectRaw(0);
        //     var BatchNo = $scope.WorkingUOM.BatchNo;

        // })
        $scope.WorkingUOM = null;

        //$scope.lstSelectedUOM[0].IsEdit = true;
        $scope.WorkingUOM = $scope.lstSelectedUOM[0];
        // $scope.GetAllItemBachNo($scope.WorkingUOM, true);
    }

    $scope.DeleteUOMConv = function (id) {
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
                $http.get($rootScope.RoutePath + 'uomconv/DeleteUOMConve', {
                    params: params
                }).success(function (data) {
                    if (data.success == true) {
                        $scope.ResetModel();
                    }
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
    }

    $scope.init();
})