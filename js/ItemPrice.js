app.controller('ItemPriceController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        $scope.GetAllItemPrice();
        $scope.GetAllItem();
        $scope.GetAllPriceCategory();
        $scope.GetAllUOM();
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllItemPrice = function () {
        $http.get($rootScope.RoutePath + 'itemprice/GetAllItemprice').then(function (res) {
            $scope.lstItemPrice = res.data.data;
            $(document).ready(function () {
                $('#ItemPriceTable').dataTable().fnClearTable();
                $('#ItemPriceTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#ItemPriceTable').DataTable({
                        responsive: true,
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
    };
    $scope.GetAllPriceCategory = function () {
        $http.get($rootScope.RoutePath + 'pricecategory/GetAllPricecategory').then(function (res) {
            $scope.lstPriceCategory = res.data.data;
        });
    };

    $scope.GetAllItem = function () {
        $http.get($rootScope.RoutePath + 'item/GetAllItem').then(function (res) {
            $scope.lstItems = res.data.data;
        });
    };

    $scope.GetAllUOM = function () {
        $http.get($rootScope.RoutePath + 'uom/GetAllActiveUom').then(function (res) {
            $scope.lstUOM = res.data.data;
        });
    };

    $scope.AddItemPriceInMainList = function () {
        // if ($scope.WorkingItemPriceMain != undefined && $scope.WorkingItemPriceMain.ItemCode == '') {
        //     $ionicLoading.show({ template: "Fill Data" });
        //     setTimeout(function () {
        //         $ionicLoading.hide()
        //     }, 1000);
        //     return;
        // }
        if ($scope.lstSelectedItemPriceMain.length > 0 && $scope.lstSelectedItemPriceMain[$scope.lstSelectedItemPriceMain.length - 1].ItemCode == '') {
            $ionicLoading.show({ template: "Fill Data" });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return;
        } else {
            _.filter($scope.lstSelectedItemPriceMain, function (item) {
                item.IsEdit = false;
            });

            $scope.ItemPriceMainModel = {
                id: null,
                // IdPriceCategory: $scope.model.ItemCode,
                ItemCode: '',
                UOM: null,
                FixedPrice: 0,
                FixedDetailsDiscount: 0,
                IsEdit: true,
                listUOM: [],
                isPrice: false,
                BatchList: [],
                isBatch: false
            }
            // $scope.BatchList = [];

            $scope.lstSelectedItemPriceMain.push($scope.ItemPriceMainModel);
            $scope.WorkingItemPriceMain = $scope.ItemPriceMainModel;

            // AssignPurchaseMainClickEvent();

            // setTimeout(function () {
            //     $scope.SelectPurchaseMainRaw($scope.lstSelectedItemPriceMain.length - 1);
            // })
        }
    }

    function AssignPurchaseMainClickEvent() {
        setTimeout(function () {
            $("#tblItemPriceMainTable tr").unbind("click");

            $("#tblItemPriceMainTable tr").click(function () {
                if ($(this)[0].accessKey != "") {
                    for (var k = 0; k < $scope.lstSelectedItemPriceMain.length; k++) {
                        $scope.lstSelectedItemPriceMain[k].IsEdit = false;
                    }

                    $("#tblItemPriceMainTable tr").removeClass("highlight");
                    $(this).addClass("highlight");

                    $scope.WorkingItemPriceMain = $scope.lstSelectedItemPriceMain[$(this)[0].accessKey];
                    $scope.WorkingItemPriceMain.IsEdit = true;
                    var obj = _.findWhere($scope.lstItems, { ItemCode: $scope.WorkingItemPriceMain.ItemCode });
                    if (obj) {
                        if (obj.isBatch == 1) {
                            $scope.BatchList = obj.itembatches;
                            $scope.WorkingItemPriceMain.isBatch = true;
                        } else {
                            $scope.BatchList = [];
                            $scope.WorkingItemPriceMain.isBatch = false;
                        }
                    }
                    $scope.$apply();
                }
            });
        })
    }

    $scope.RemoveItemPriceFromMainList = function (index) {
        // $scope.lstSelectedItemPriceMain = _.filter($scope.lstSelectedItemPriceMain, function (item) {
        //     return item.UOM != $scope.WorkingItemPriceMain.UOM || item.ItemCode != $scope.WorkingItemPriceMain.ItemCode;
        // });
        $scope.lstSelectedItemPriceMain.splice(index, 1);
        if ($scope.lstSelectedItemPriceMain.length == 0) {
            $scope.AddItemPriceInMainList();
        }

        $scope.WorkingItemPriceMain = null;

        // AssignPurchaseMainClickEvent();

        // setTimeout(function () {
        //     $scope.SelectPurchaseMainRaw(0);
        // })
    }

    $scope.SelectPurchaseMainRaw = function (index) {
        $("#tblItemPriceMainTable tr[accessKey='" + index + "']").trigger("click");
    }

    $scope.AddItemCode = function (o) {
        var obj = _.findWhere($scope.lstItems, { ItemCode: o.ItemCode });
        o.Descriptions = obj.Descriptions;
        o.UOM = (obj.PurchaseUOM).toString();
        // o.IdPriceCategory = $scope.model.IdPriceCategory
        o.listUOM = obj.itemuoms;
        if (obj.isBatch == 1) {
            $scope.BatchList = obj.itembatches;
            o.isBatch = true;
        } else {
            $scope.BatchList = [];
            o.isBatch = false;
        }
    }

    function checkDuplicateInObject(propertyName, inputArray) {
        var seenDuplicate = false,
            testObject = {};

        inputArray.map(function (item) {
            var itemPropertyName = item[propertyName];
            if (itemPropertyName in testObject) {
                testObject[itemPropertyName].duplicate = true;
                item.duplicate = true;
                seenDuplicate = true;
            } else {
                testObject[itemPropertyName] = item;
                delete item.duplicate;
            }
        });

        return seenDuplicate;
    }

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#ItemPriceTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#ItemPriceTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveItemPrice = function (form) {

        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            var NoItemCode = _.findWhere($scope.lstSelectedItemPriceMain, { ItemCode: '' });
            if (NoItemCode) {
                var alertPopup = $ionicPopup.alert({
                    title: '',
                    template: 'Item code missing.First select Item code for all items in list.',
                    cssClass: 'custPop',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                });
            } else {
                var BatchList = $scope.lstSelectedItemPriceMain;
                var ListNoBatchNumber = [];

                if (BatchList.length == 0) {
                    $ionicLoading.show({ template: 'Please Add at least One Item Price' });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                    return
                }

                if (BatchList.length > 0) {
                    var ListNoBatchNumber = [];

                    var isFirst = false;
                    _.filter(BatchList, function (p) {
                        isFirst = false;
                        _.filter(BatchList, function (p1) {
                            if (p.ItemCode == p1.ItemCode && p.UOM == p1.UOM && isFirst == true) {
                                ListNoBatchNumber.push(p.ItemCode);
                            } else if (p.ItemCode == p1.ItemCode && p.UOM == p1.UOM) {
                                isFirst = true;
                            }
                        })
                    })

                    ListNoBatchNumber = _.uniq(ListNoBatchNumber);

                    if (ListNoBatchNumber.length > 0) {
                        var alertPopup = $ionicPopup.alert({
                            title: '',
                            template: '<p>The following items are duplicate. Update It.</p>' +
                                '<br>' +
                                '<p><b>' + ListNoBatchNumber.join() + '</b></p>',
                            cssClass: 'custPop',
                            okText: 'Ok',
                            okType: 'btn btn-green',
                        });
                        return;
                    }
                }

                if (!$scope.model.id) {
                    $scope.model.id = 0;
                }
                $scope.model.lstPurchaseDetail = $scope.lstSelectedItemPriceMain;
                $rootScope.ShowLoader();
                $http.post($rootScope.RoutePath + 'itemprice/SaveItemprice', $scope.model)
                    .then(function (res) {
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
    };


    // Use more distinguished and understandable naming
    $scope.CopyToModel = function (o) {
        $rootScope.BackButton = $scope.IsList = false;
        $scope.lstSelectedItemPriceMain = [];
        $scope.model.IdPriceCategory = o.IdPriceCategory.toString();
        var obj = _.findWhere($scope.lstItems, { ItemCode: o.ItemCode });
        $scope.ItemPriceMainModel = {
            id: o.id,
            //IdPriceCategory: $scope.model.ItemCode,
            ItemCode: o.ItemCode,
            UOM: o.UOM,
            FixedPrice: o.FixedPrice,
            FixedDetailsDiscount: o.FixedDetailsDiscount,
            IsEdit: true,
            listUOM: obj.itemuoms,
            isPrice: o.isPrice,
            isBatch: false
        }

        $scope.lstSelectedItemPriceMain.push($scope.ItemPriceMainModel);
    };

    $scope.DeleteItem = function (id) {
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
                $http.get($rootScope.RoutePath + 'itemprice/DeleteItemprice', {
                    params: params
                }).success(function (data) {
                    if (data.success == true) {
                        $scope.init();
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

    //Table function End
    $scope.ResetModel = function () {
        $scope.model = {
            id: 0,
            itemcode: '',
            IdPriceCategory: '',
            UOM: '',
            Fixedprice: 0,
            FixedDetailsDiscount: 0,
            isPrice: false
        };
        $scope.Searchmodel = {
            Search: '',
        }

        $scope.lstSelectedItemPriceMain = [];
        $scope.AddItemPriceInMainList();
    };

    $rootScope.ResetAll = $scope.init;

    $scope.Add = function () {
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;
    }
    $scope.init();

});