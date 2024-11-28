app.controller('ItemController', function ($scope, $rootScope, $stateParams, $http, $ionicPopup, $ionicLoading, $compile, $localstorage, $state, $ionicModal, $ionicScrollDelegate) {
      $scope.init = function () {
            setTimeout(() => {
                  $("#mytext").focus();
            }, 1000);
            ManageRole();
            $scope.isGenmedCustomer = false;
            $scope.isshopCustomer = false;
            customers();
            $scope.ResetModel();
            if ($scope.TempSearch == '' || $scope.TempSearch == null || $scope.TempSearch == undefined) {
                  $scope.ReserSearch()
            } else {}
            // $scope.GetAllItem();
            $scope.GetAllParentItemCategory();
            // $scope.GetAlltaxcode();
            // $scope.GetAllItemtype(() => {});
            // $scope.GetAllPopupNote(() => {});
            $scope.GetAllUOM(() => {});
            $scope.GetAllTaxCode(() => {});
            // $scope.AddBatchItemInList();
            // $scope.AddUOMItemInList();
            // $scope.GetAllSubBrand();
            $scope.GetAllMainCompnay();
            // $scope.GetAllLocation();
            // $scope.GetAllCustomer();
            $scope.GetAllActiveCustomerGroup();
            $scope.GetAllContain();
            // $scope.AddItemMargin();
            // $scope.AddQtyPrice();
            $scope.ItemId = 0;
            $scope.lstcontainSearch = []
            $scope.GetAllItemCategoryItemWise(function () {
                  ItemCategoryDataTable();
            });
            $scope.EditFlg = false;
            $scope.tab = {
                  selectedIndex: 0
            };
            $rootScope.BackButton = $scope.IsList = true;
            $ionicScrollDelegate.scrollTop();
            $scope.CustomerGroupName = $localstorage.get('CustomerGroup');
            $scope.isShop = $scope.CustomerGroupName != 'Shop' ? true : false
            $scope.NewUOMList = [];
            if ($stateParams.itemcode != null && $stateParams.itemcode != "" && $stateParams.itemcode != undefined) {
                  $scope.IsList = false;
                  $scope.CopyToModel($stateParams.itemcode)
            }
            setTimeout(function () {
                  InitDataTable();
            }, 1000)
      };

      function ManageRole() {
            var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
                  return Role == "Admin";
            })
            $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
      }

      $scope.GetAllItem = function () {
            $http.get($rootScope.RoutePath + 'item/GetAllItemSale').then(function (res) {
                  $scope.lstItems = res.data.data;
                  // $scope.TotalRecord = $scope.lstItems.length;
                  // $(document).ready(function() {
                  //     setTimeout(function() {
                  //         $('#ItemTable').DataTable({
                  //             responsive: true,
                  //             "oLanguage": {
                  //                 "sEmptyTable": "No Data Found!"
                  //             }
                  //         });
                  //     })
                  // })
            });
      };

      $scope.GetAllContianBySearchText = function (Descriptions) {
            $http.get($rootScope.RoutePath + 'item/GetAllContianBySearchText?Descriptions=' + Descriptions).then(function (res) {
                  if (res.data.success) {
                        $scope.lstcontainSearch = res.data.data;
                        // $scope.lstcontainSearch = _.sortBy($scope.lstcontainSearch, 'Descriptions')
                  } else {
                        $scope.lstcontainSearch = [];
                  }
            });
      };

      $scope.CloseContain = function (Descriptions) {
            $scope.model.Descriptions = Descriptions
            $scope.lstcontainSearch = [];
      }

      $scope.SelectUOM = function (o, t) {
            $scope.NewUOMList = [];
            if (t == 'Sale') {
                  $scope.model.PurchaseUOM = $scope.model.SalesUOM;
                  $scope.model.ReportUOM = $scope.model.SalesUOM;
            }


            var objBase = _.findWhere($scope.lstUOM, {
                  UOM: o
            });

            if (objBase) {
                  if ($scope.lstSelectedUOM.length > 0 && $scope.lstSelectedUOM[$scope.lstSelectedUOM.length - 1].UOM == null) {
                        $scope.lstSelectedUOM[$scope.lstSelectedUOM.length - 1].UOM = objBase.UOM
                  } else {
                        var t1 = _.findWhere($scope.lstSelectedUOM, {
                              UOM: objBase.UOM
                        });
                        if (!t1) {
                              $scope.UOMModel = {
                                    id: null,
                                    ItemCode: '',
                                    UOM: objBase.UOM,
                                    Rate: 0,
                                    Price: 0,
                                    MinSalePrice: 0.00,
                                    MaxSalePrice: 0.00,
                                    MinPurchasePrice: 0.00,
                                    MaxPurchasePrice: 0.00,
                                    MinQty: 0.00,
                                    MaxQty: 0.00,
                                    BalQty: 0.00,
                                    MRP: 0.00,
                                    RewardPoint: 0,
                                    ReferralRewardPoint: 0,
                                    IsEdit: false,
                              }

                              $scope.lstSelectedUOM.push($scope.UOMModel);
                        }
                  }
            }
      }

      $scope.SelectTaxCode = function (t) {
            $scope.model.PurchaseTaxCode = t;
      }


      $scope.GetAllItemtype = function (ReturnCall) {
            $http.get($rootScope.RoutePath + 'itemtype/GetAllItemtype').then(function (res) {
                  $scope.lstItemtype = res.data.data;
                  setTimeout(function () {
                        InitDataTable();
                  })
                  return ReturnCall();
            });
      };
      //subbrand
      $scope.GetallSubBrandbyName = function (name) {
            var Brandlistid = _.findWhere($scope.lstcompany, {
                  Brand: name
            })
            if (Brandlistid) {
                  $http.get($rootScope.RoutePath + 'brand/GetSubBrandByMainBrandId?id=' + parseInt(Brandlistid.id)).then(function (res) {
                        $scope.lstSubBrandbyId = res.data.data;
                  });
            }

      }

      $scope.GetAllSubBrand = function () {
            $http.get($rootScope.RoutePath + 'brand/GetAllSubBrand').then(function (res) {
                  $scope.lstSubBrand = res.data.data;
                  $scope.TotalRecord = $scope.lstSubBrand.length;

                  $(document).ready(function () {
                        $('#UOMTable').dataTable().fnClearTable();
                        $('#UOMTable').dataTable().fnDestroy();
                        setTimeout(function () {
                              $('#UOMTable').DataTable({
                                    responsive: true,
                                    "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                                    retrieve: true,
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

      //main compnay

      $scope.GetAllMainCompnay = function () {
            $http.get($rootScope.RoutePath + 'brand/GetAllBrand').then(function (res) {
                  $scope.lstcompany = res.data.data;

                  $scope.TotalRecord = $scope.lstcompany.length;

                  $(document).ready(function () {
                        $('#UOMTable').dataTable().fnClearTable();
                        $('#UOMTable').dataTable().fnDestroy();
                        setTimeout(function () {
                              $('#UOMTable').DataTable({
                                    responsive: true,
                                    "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                                    retrieve: true,
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
      //contain
      $scope.GetAllContain = function () {

            $http.get($rootScope.RoutePath + 'item/GetAllContian').then(function (res) {
                  $scope.lstcontain = res.data.data;

            });
      };

      $scope.GetAllPopupNote = function (ReturnCall) {
            $http.get($rootScope.RoutePath + 'popupnote/GetAllPopupNote').then(function (res) {
                  $scope.lstPopupNote = res.data.data;
                  setTimeout(function () {
                        InitDataTable();
                  })
                  return ReturnCall();
            });
      };

      $scope.GetAllTaxCode = function (ReturnCall) {
            $http.get($rootScope.RoutePath + 'taxcode/GetAllActiveTaxcode').then(function (res) {
                  $scope.lstTax = res.data.data;
                  return ReturnCall();
            });
      }

      //UOM start
      $scope.GetAllUOM = function (ReturnCall) {
            $http.get($rootScope.RoutePath + 'uom/GetAllActiveUom').then(function (res) {
                  $scope.lstUOM = res.data.data;
                  return ReturnCall();
            });
      };

      $scope.GetAllLocation = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
            }
            $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', {
                  params: params
            }).then(function (res) {
                  $scope.lstLocations = res.data.data;
            });
      };

      $scope.GetSubLocationByLocationId = function (o) {
            $http.get($rootScope.RoutePath + 'location/GetSubLocationByLocationId?IdLocation=' + o.idLocation).then(function (res) {
                  o.lstSubLocation = res.data.data;
            })
      }

      function AssignClickEvent() {
            setTimeout(function () {
                  $("#tblUOM tr").unbind("click");

                  $("#tblUOM tr").click(function () {

                        if ($(this)[0].accessKey != "") {
                              for (var k = 0; k < $scope.lstSelectedUOM.length; k++) {
                                    $scope.lstSelectedUOM[k].IsEdit = false;
                              }

                              $("#tblUOM tr").removeClass("highlight");
                              $(this).addClass("highlight");

                              $scope.WorkingUOM = $scope.lstSelectedUOM[$(this)[0].accessKey];
                              if ($scope.AllBatchQty.length > 0) {
                                    $scope.lstSelectedBatchQty = _.where($scope.AllBatchQty, {
                                          UOM: $scope.lstSelectedUOM[$(this)[0].accessKey].UOM
                                    });
                              }
                              $scope.WorkingUOM.IsEdit = true;
                              $scope.$apply();
                        }
                  });
            })
      }

      $scope.AddUOMItemInList = function () {
            // if ($scope.WorkingUOM != undefined && $scope.WorkingUOM.UOM == null) {
            if ($scope.lstSelectedUOM.length > 0 && $scope.lstSelectedUOM[$scope.lstSelectedUOM.length - 1].UOM == null) {
                  $ionicLoading.show({
                        template: "Select UOM"
                  });
                  setTimeout(function () {
                        $ionicLoading.hide()
                  }, 1000);
                  return;
            } else {
                  _.filter($scope.lstSelectedUOM, function (item) {
                        item.IsEdit = false;
                  });
                  $scope.UOMModel = {
                        id: null,
                        ItemCode: '',
                        UOM: null,
                        Rate: 0,
                        Price: 0,
                        MinSalePrice: 0.00,
                        MaxSalePrice: 0.00,
                        MinPurchasePrice: 0.00,
                        MaxPurchasePrice: 0.00,
                        MinQty: 0.00,
                        MaxQty: 0.00,
                        BalQty: 0.00,
                        MRP: 0.00,
                        RewardPoint: 0,
                        ReferralRewardPoint: 0,
                        IsEdit: true,
                  }

                  $scope.lstSelectedUOM.push($scope.UOMModel);
                  $scope.WorkingUOM = $scope.UOMModel;
                  // AssignClickEvent();

                  // setTimeout(function() {
                  //     $scope.SelectRaw($scope.lstSelectedUOM.length - 1);
                  // })



            }
      }


      $scope.ChangeUOMModel = function (obj) {
            for (var k = 0; k < $scope.lstSelectedUOM.length; k++) {
                  $scope.lstSelectedUOM[k].IsEdit = false;
            }
            obj.IsEdit = true;
            if ($scope.AllBatchQty.length > 0) {
                  $scope.lstSelectedBatchQty = _.where($scope.AllBatchQty, {
                        UOM: obj.UOM
                  });
            }
            $scope.WorkingUOM = obj;
      }

      $scope.ChangeUOMRate = function (obj) {

            if (obj.UOM != $scope.model.BaseUOM) {
                  var FindBaseUom = _.findWhere($scope.lstSelectedUOM, {
                        UOM: $scope.model.BaseUOM
                  });
                  if (FindBaseUom) {
                        if (FindBaseUom.Price != '' && FindBaseUom.Price != null) {
                              obj.Price = Math.round(parseFloat(FindBaseUom.Price) * parseFloat(obj.Rate) * 100) / 100;
                              $scope.WorkingUOM.Price = obj.Price;
                        }
                        if (FindBaseUom.MinSalePrice != '' && FindBaseUom.MinSalePrice != null) {
                              obj.MinSalePrice = Math.round(parseFloat(FindBaseUom.MinSalePrice) * parseFloat(obj.Rate) * 100) / 100;
                              $scope.WorkingUOM.Price = obj.MinSalePrice;
                        }
                        if (FindBaseUom.MaxSalePrice != '' && FindBaseUom.MaxSalePrice != null) {

                              obj.MaxSalePrice = Math.round(parseFloat(FindBaseUom.MaxSalePrice) * parseFloat(obj.Rate) * 100) / 100;
                              $scope.WorkingUOM.MaxSalePrice = obj.MaxSalePrice;
                        }
                        if (FindBaseUom.MinPurchasePrice != '' && FindBaseUom.MinPurchasePrice != null) {

                              obj.MinPurchasePrice = Math.round(parseFloat(FindBaseUom.MinPurchasePrice) * parseFloat(obj.Rate) * 100) / 100;
                              $scope.WorkingUOM.MinPurchasePrice = obj.MinPurchasePrice;
                        }
                        if (FindBaseUom.MaxPurchasePrice != '' && FindBaseUom.MaxPurchasePrice != null) {
                              obj.MaxPurchasePrice = Math.round(parseFloat(FindBaseUom.MaxPurchasePrice) * parseFloat(obj.Rate) * 100) / 100;
                              $scope.WorkingUOM.MaxPurchasePrice = obj.MaxPurchasePrice;
                        }
                  }
            }

      }

      $scope.RemoveUOMItemInList = function (index) {
            CheckUOMRef($scope.WorkingUOM, function (response) {
                  if (!response) {
                        $ionicLoading.show({
                              template: "Sorry! Current UOM " + $scope.WorkingUOM.UOM + " already have transactions.Therefore, is not allow to delete "
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);
                        return;
                  }
                  $scope.lstSelectedUOM.splice(index, 1);
                  if ($scope.lstSelectedUOM.length == 0) {
                        $scope.AddUOMItemInList();
                  } else {
                        for (var k = 0; k < $scope.lstSelectedUOM.length; k++) {
                              $scope.lstSelectedUOM[k].IsEdit = false;
                        }
                        $scope.lstSelectedUOM[0].IsEdit = true;
                        $scope.WorkingUOM = $scope.lstSelectedUOM[0];
                  }
                  // AssignClickEvent();

                  // setTimeout(function() {
                  //     $scope.SelectRaw(0);
                  // })
            })
      }

      function CheckUOMRef(obj, ReturnCallBack) {
            if (obj.id == null || obj.id == '') {
                  return ReturnCallBack(true);
            }

            var params = {
                  UOM: obj.UOM,
                  ItemCode: obj.ItemCode
            }
            $http.get($rootScope.RoutePath + "item/CheckUOMRef", {
                  params: params
            }).success(function (response) {
                  return ReturnCallBack(response);
            })
      }

      $scope.SelectRaw = function (index) {
            $("#tblUOM tr[accessKey='" + index + "']").trigger("click");
      }

      $scope.CheckUOMExist = function (o) {
            var count = _.countBy($scope.lstSelectedUOM, function (item) {
                  return item.UOM == o.UOM ? 'true' : 'false';
            });
            if (count.true > 1) {
                  $ionicLoading.show({
                        template: "UOM already exist."
                  });
                  setTimeout(function () {
                        o.UOM = null;
                        $ionicLoading.hide()
                  }, 1000);
                  return;
            }

            CheckUOMRef(o, function (response) {
                  if (!response) {
                        $ionicLoading.show({
                              template: "Sorry! Current UOM " + o.UOM + " already have transactions.Therefore, is not allow to delete "
                        });
                        setTimeout(function () {
                              o.UOM = null;
                              $ionicLoading.hide()
                        }, 1000);
                        return;
                  } else {
                        if ($scope.AllBatchQty.length > 0) {
                              $scope.lstSelectedBatchQty = _.where($scope.AllBatchQty, {
                                    UOM: o.UOM
                              });
                        }
                  }
            })
      }

      //UOM End

      //Batch Start
      function AssignClickEventBatch() {

            setTimeout(function () {
                  $("#tblBatch tr").unbind("click");

                  $("#tblBatch tr").click(function () {
                        if ($(this)[0].accessKey != "") {
                              for (var k = 0; k < $scope.lstSelectedBatch.length; k++) {
                                    $scope.lstSelectedBatch[k].IsEdit = false;
                                    $scope.lstSelectedBatch[k].isDefaultPrice = false;
                              }

                              $("#tblBatch tr").removeClass("highlight");
                              $(this).addClass("highlight");

                              $scope.WorkingBatch = $scope.lstSelectedBatch[$(this)[0].accessKey];
                              $scope.WorkingBatch.IsEdit = true;
                              $scope.$apply();
                        }
                  });
            })
      }

      $scope.AddBatchItemInList = function () {

            if ($scope.lstSelectedBatch.length > 0 && $scope.lstSelectedBatch[$scope.lstSelectedBatch.length - 1].BatchNumber == null) {
                  $ionicLoading.show({
                        template: "Add Batch Number"
                  });
                  setTimeout(function () {
                        $ionicLoading.hide()
                  }, 1000);
                  return;
            } else {
                  _.filter($scope.lstSelectedBatch, function (item) {
                        item.IsEdit = false;
                  });
                  $scope.BatchModel = {
                        id: null,
                        ItemCode: '',
                        BatchNumber: null,
                        Barcode: null,
                        Descriptions: null,
                        ManuDate: null,
                        ExpiryDate: null,
                        LastSaleDate: null,
                        BalQty: null,
                        idLocation: null,
                        idSubLocation: null,
                        IsEdit: true,
                        isDefaultPrice: false,
                        SalesRate: null,
                        PurchaseRate: null,
                        MRP: null
                  }

                  $scope.lstSelectedBatch.push($scope.BatchModel);
                  $scope.WorkingBatch = $scope.BatchModel;
                  // InitTable1()

                  // AssignClickEventBatch();

                  // setTimeout(function() {
                  //     $scope.SelectBatchRaw($scope.lstSelectedBatch.length - 1);
                  // })
            }
      }

      $scope.flgBatchStatus = true;
      $scope.DisplayBatchStatus = "ON";
      $scope.ChangeBatchStatus = function () {
            $scope.lstSelectedBatch = [];
            if ($scope.flgBatchStatus) {
                  $scope.flgBatchStatus = false;
                  $scope.DisplayBatchStatus = "OFF";
                  $scope.model.isBatch = false;
            } else {
                  $scope.AddBatchItemInList();
                  $scope.flgBatchStatus = true;
                  $scope.DisplayBatchStatus = "ON";
                  $scope.model.isBatch = true;
            }
      }

      $scope.SelectBatchRaw = function (index) {
            $("#tblBatch tr[accessKey='" + index + "']").trigger("click");
      }

      $scope.RemoveBatchItemInList = function (index) {
            $scope.lstSelectedBatch.splice(index, 1);
            if ($scope.lstSelectedBatch.length == 0) {
                  $scope.AddBatchItemInList();
            } else {
                  for (var k = 0; k < $scope.lstSelectedBatch.length; k++) {
                        $scope.lstSelectedBatch[k].IsEdit = false;
                  }
                  $scope.lstSelectedBatch[0].IsEdit = true;
                  $scope.WorkingBatch = $scope.lstSelectedBatch[0];
                  InitTable1()
            }

            // AssignClickEventBatch();

            // setTimeout(function() {
            //     $scope.SelectBatchRaw(0);
            // })
      }

      $scope.ChangeBatchModel = function (obj) {
            for (var k = 0; k < $scope.lstSelectedBatch.length; k++) {
                  $scope.lstSelectedBatch[k].IsEdit = false;
            }
            obj.IsEdit = true;
            $scope.WorkingBatch = obj;
      }

      $scope.CheckBatchExist = function (o) {
            var count = _.countBy($scope.lstSelectedBatch, function (item) {
                  return item.BatchNumber == o.BatchNumber ? 'true' : 'false';
            });
            if (count.true > 1) {
                  $ionicLoading.show({
                        template: "Batch Number already exist."
                  });
                  setTimeout(function () {
                        o.BatchNumber = null;
                        $ionicLoading.hide()
                  }, 1000);
                  return;
            }
      }

      //Batch End
      $scope.formsubmit = false;
      $scope.SaveItem = function (form) {
            $rootScope.ShowLoader();
            if (form.$invalid) {
                  $scope.formsubmit = true;
            } else {
                  var NoUOM = _.findWhere($scope.lstSelectedUOM, {
                        UOM: null
                  });
                  if (NoUOM) {
                        var alertPopup = $ionicPopup.alert({
                              title: '',
                              template: 'UOM missing.First select UOM for all items in list.',
                              cssClass: 'custPop',
                              okText: 'Ok',
                              okType: 'btn btn-green',
                        });
                  } else {
                        var List = [];
                        if ($scope.model.IsCombo) {
                              List = _.uniq([$scope.model.BaseUOM, $scope.model.SalesUOM]);
                        } else {
                              List = _.uniq([$scope.model.BaseUOM, $scope.model.SalesUOM, $scope.model.PurchaseUOM, $scope.model.ReportUOM]);
                        }

                        var flgSave = true;
                        var NoUOMRate = [];
                        _.filter(List, function (p) {
                              var contain = _.contains(_.pluck($scope.lstSelectedUOM, 'UOM'), p);
                              if (!contain) {
                                    NoUOMRate.push(p);
                                    flgSave = false;
                              }
                        })

                        if (flgSave == true) {
                              var objBase = _.findWhere($scope.lstSelectedUOM, {
                                    UOM: $scope.model.BaseUOM
                              });
                              if (objBase.Rate == 1) {
                                    if ($scope.lstSelectedUOM.length > 0) {
                                          $scope.model.lstUOM = _.filter($scope.lstSelectedUOM, function (item) {
                                                return item.ItemCode = $scope.model.ItemCode;
                                          });
                                    } else {
                                          $scope.model.lstUOM = $scope.lstSelectedUOM;
                                    }

                                    if ($scope.lstSelectedBatch.length > 0) {
                                          $scope.model.lstBatch = _.filter($scope.lstSelectedBatch, function (item) {
                                                item.ManuDate = item.ManuDate != '' && item.ManuDate != null ? moment(item.ManuDate).format('YYYY-MM-DD') : null;
                                                item.ExpiryDate = item.ExpiryDate != '' && item.ExpiryDate != null ? moment(item.ExpiryDate).format('YYYY-MM-DD') : null;
                                                item.LastSaleDate = item.LastSaleDate != '' && item.LastSaleDate != null ? moment(item.LastSaleDate).format('YYYY-MM-DD') : null;
                                                return item.ItemCode = $scope.model.ItemCode;
                                          });
                                    } else {
                                          $scope.model.lstBatch = $scope.lstSelectedBatch;
                                    }
                                    var SaveImage = _.filter($scope.Mediafiles, function (item) {
                                          if (item[0].id == 0) {
                                                return item;
                                          }
                                    })
                                    $scope.model.RemoveItemImage = $scope.TempRemoveArr;
                                    var lstMargin = [];
                                    for (var index = 0; index < $scope.LstItemMargin.length; index++) {
                                          if ($scope.LstItemMargin[index].idCustGroup != '' && $scope.LstItemMargin[index].idCustGroup != null && $scope.LstItemMargin[index].Percentage != '' && $scope.LstItemMargin[index].Percentage != null) {
                                                lstMargin.push($scope.LstItemMargin[index]);
                                          }
                                    }
                                    $scope.model.LstItemMargin = lstMargin;

                                    $scope.model.IdCustomer = $scope.model.IdCustomer == '' ? null : $scope.model.IdCustomer;
                                    $scope.model.lstItemsCategory = _.filter($scope.lstitemCategory, {
                                          checked: 1
                                    });

                                    var lstQtyprice = [];
                                    for (var index = 0; index < $scope.LstItemQtyPrice.length; index++) {
                                          if ($scope.LstItemQtyPrice[index].MinQty != '' &&
                                                $scope.LstItemQtyPrice[index].MinQty != null &&
                                                $scope.LstItemQtyPrice[index].MaxQty != '' &&
                                                $scope.LstItemQtyPrice[index].MaxQty != null &&
                                                $scope.LstItemQtyPrice[index].SalePrice != '' &&
                                                $scope.LstItemQtyPrice[index].SalePrice != null &&
                                                $scope.LstItemQtyPrice[index].PurchasePrice != '' &&
                                                $scope.LstItemQtyPrice[index].PurchasePrice != null
                                          ) {
                                                lstQtyprice.push($scope.LstItemQtyPrice[index]);
                                          }
                                    }

                                    $scope.model.LstItemQtyPrice = lstQtyprice;
                                    $scope.model.idPopupNote = parseInt($scope.model.idPopupNote);
                                    $http.post($rootScope.RoutePath + 'item/SaveItem', $scope.model)
                                          .then(function (res) {
                                                if (SaveImage.length == 0) {
                                                      if (res.data.success) {
                                                            $scope.init();
                                                      }
                                                      $ionicLoading.show({
                                                            template: res.data.message
                                                      });
                                                      setTimeout(function () {
                                                            $ionicLoading.hide()
                                                      }, 1000);
                                                      return
                                                }
                                                var id;
                                                if ($scope.model.id != 0) {
                                                      id = $scope.model.id;
                                                } else {
                                                      id = res.data.data.id;
                                                }
                                                var formData = new FormData();
                                                angular.forEach(SaveImage, function (obj) {
                                                      formData.append(id, obj[0]);
                                                });
                                                $http.post($rootScope.RoutePath + "item/UploadImage", formData, {
                                                      transformRequest: angular.identity,
                                                      headers: {
                                                            'Content-Type': undefined
                                                      },
                                                }).then(function (data) {
                                                      if (res.data.success) {
                                                            $scope.init();
                                                      }
                                                      $ionicLoading.show({
                                                            template: res.data.message
                                                      });
                                                      setTimeout(function () {
                                                            $ionicLoading.hide()
                                                      }, 1000);

                                                }, function (err) {
                                                      $ionicLoading.show({
                                                            template: res.data.message
                                                      });
                                                      setTimeout(function () {
                                                            $ionicLoading.hide()
                                                      }, 1000);
                                                });

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
                                    $ionicLoading.show({
                                          template: "Base UOM's rate must be 1"
                                    });
                                    setTimeout(function () {
                                          $ionicLoading.hide()
                                    }, 1000);
                              }
                        } else {
                              var template = 'Set  UOM rate for following UOM <br/>' + NoUOMRate.toString();
                              var alertPopup = $ionicPopup.alert({
                                    title: '',
                                    template: template,
                                    cssClass: 'custPop',
                                    okText: 'Ok',
                                    okType: 'btn btn-green',
                              });
                        }
                  }
            }
      };

      function InitTable1() {
            $(document).ready(function () {
                  $('#BatchTable').dataTable().fnClearTable();
                  $('#BatchTable').dataTable().fnDestroy();
                  setTimeout(function () {
                        $('#BatchTable').DataTable({
                              responsive: true,
                              "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                              retrieve: true,
                              "lengthMenu": [
                                    [3, 9, 15, 20 - 1],
                                    [3, 9, 15, 20, "All"]
                              ],
                              "pageLength": 9,
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
      }

      // Use more distinguished and understandable naming
      $scope.CopyToModel = function (id) {
            if ($stateParams.itemcode != null && $stateParams.itemcode != "" && $stateParams.itemcode != undefined) {
                  var selectedItem1 = {
                        ItemCode: id
                  }
            } else {
                  var selectedItem1 = _.findWhere($scope.lstdata, {
                        id: parseInt(id)
                  });
            }
            $scope.EditFlg = true;
            $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCodeEdit?ItemCode=' + selectedItem1.ItemCode).then(function (res) {
                  var selectedItem = res.data.data[0];
                  InitTable1();
                  $scope.tab.selectedIndex = 1;

                  $scope.lstSelectedBatch = [];
                  $scope.ItemId = selectedItem.id;
                  $scope.GetAllItemCategoryItemWise(function () {
                        if ($stateParams.itemcode != null && $stateParams.itemcode != "" && $stateParams.itemcode != undefined) {
                              // $scope.IsList = false;
                        } else {
                              $rootScope.BackButton = $scope.IsList = false;
                              ItemCategoryDataTable();
                        }


                        // Loop model, because selectedItem might have MORE properties than the defined model
                        for (var prop in $scope.model) {
                              // if (prop == 'idItemType') {
                              //     $scope.model[prop] = (selectedItem[prop]).toString();
                              // } 
                              if (prop == 'IdCustomer') {
                                    $scope.model[prop] = selectedItem[prop] != null ? (selectedItem[prop]).toString() : '';
                              } else if (prop == 'isActive') {
                                    if (selectedItem[prop] == 1) {
                                          $scope.model[prop] = true;
                                    } else {
                                          $scope.model[prop] = false;
                                    }
                              } else if (prop == 'IsGenmedMedicine') {
                                    if (selectedItem[prop] == 1) {
                                          $scope.model[prop] = true;
                                    } else {
                                          $scope.model[prop] = false;
                                    }
                              } else if (prop == 'IsGenmedWelness') {
                                    if (selectedItem[prop] == 1) {
                                          $scope.model[prop] = true;
                                    } else {
                                          $scope.model[prop] = false;
                                    }
                              } else if (prop == 'IsGenmedOnline') {
                                    if (selectedItem[prop] == 1) {
                                          $scope.model[prop] = true;
                                    } else {
                                          $scope.model[prop] = false;
                                    }
                              } else if (prop == 'isBatch') {
                                    if (selectedItem[prop] == 1) {
                                          $scope.model[prop] = true;
                                    } else {
                                          $scope.model[prop] = false;
                                    }
                              } else if (prop == 'Descriptions2') {
                                    $scope.model[prop] = selectedItem[prop];
                                    $scope.GetallSubBrandbyName($scope.model.Descriptions2);
                              } else if (prop == 'IdSubBrand') {
                                    $scope.model[prop] = (selectedItem[prop]).toString();
                              } else {
                                    $scope.model[prop] = selectedItem[prop];
                              }
                        }
                        if (selectedItem.itembatches.length > 0) {
                              $scope.lstSelectedBatch = selectedItem.itembatches;

                              $scope.WorkingBatch = null;
                              $scope.lstSelectedBatch[0].IsEdit = true;
                              $scope.WorkingBatch = $scope.lstSelectedBatch[0];
                              for (var i = 0; i < $scope.lstSelectedBatch.length; i++) {
                                    $scope.lstSelectedBatch[i].isDefaultPrice = false;
                                    if ($scope.lstSelectedBatch[i].idLocation) {
                                          $scope.lstSelectedBatch[i].idLocation = $scope.lstSelectedBatch[i].idLocation != null ? ($scope.lstSelectedBatch[i].idLocation).toString() : '';
                                          if ($scope.lstSelectedBatch[i].idSubLocation) {
                                                $scope.GetSubLocationByLocationId($scope.lstSelectedBatch[i]);
                                                $scope.lstSelectedBatch[i].idSubLocation = $scope.lstSelectedBatch[i].idSubLocation != null ? ($scope.lstSelectedBatch[i].idSubLocation).toString() : '';
                                          }
                                    }
                                    var LocationUser = $localstorage.get('idLocations')
                                    var objBatchBal = _.where(selectedItem1.itembatchbalqties, {
                                          UOM: selectedItem1.SalesUOM,
                                          Location: LocationUser
                                    });
                                    console.log(objBatchBal, objBatchBal.length)
                                    for (var j = 0; j < objBatchBal.length; j++) {
                                          console.log($scope.lstSelectedBatch[i].BatchNumber, objBatchBal[j].BatchNo)
                                          if ($scope.lstSelectedBatch[i].BatchNumber == objBatchBal[j].BatchNo) {
                                                $scope.lstSelectedBatch[i].BalQty = objBatchBal[j].BalQty;
                                                console.log($scope.lstSelectedBatch[i].BalQty, objBatchBal[j].BalQty);
                                                break;
                                          } else {
                                                $scope.lstSelectedBatch[i].BalQty = 0
                                          }

                                    }

                              }

                        }

                        if (selectedItem.itemuoms.length > 0) {
                              $scope.lstSelectedUOM = selectedItem.itemuoms;
                              $scope.WorkingUOM = null;
                              $scope.lstSelectedUOM[0].IsEdit = true;
                              $scope.WorkingUOM = $scope.lstSelectedUOM[0];
                              // AssignClickEvent();

                              // setTimeout(function() {
                              //     $scope.SelectRaw(0);
                              // })

                              $http.get($rootScope.RoutePath + 'item/GetAllItemBatchBalQtyByItemCodeMany?ItemCode=' + selectedItem1.ItemCode).then(function (res1) {
                                    selectedItem['itembatchbalqties'] = res1.data.data;
                                    if (selectedItem.itembatchbalqties.length > 0) {
                                          $scope.AllBatchQty = selectedItem.itembatchbalqties;
                                          $scope.lstSelectedBatchQty = _.where($scope.AllBatchQty, {
                                                UOM: $scope.lstSelectedUOM[0].UOM
                                          });

                                    }
                              });


                        }

                        //image
                        $scope.Mediafiles = [];
                        $scope.TempRemoveArr = [];
                        // if (selectedItem.itemimages.length && selectedItem.itemimages.length > 0) {

                        //     var objImage = selectedItem.itemimages;
                        //     $scope.ImageToFile(objImage);
                        // }

                        if ($scope.model.isBatch == true && $scope.lstSelectedBatch.length == 0) {
                              $scope.flgBatchStatus = true;
                              $scope.DisplayBatchStatus = "ON";
                        } else if ($scope.model.isBatch == true && $scope.lstSelectedBatch.length > 0) {
                              $scope.flgBatchStatus = true;
                              $scope.DisplayBatchStatus = "ON";
                        } else {
                              $scope.flgBatchStatus = false;
                              $scope.DisplayBatchStatus = "OFF";
                              $scope.model.isBatch = false;
                        }

                        // if (selectedItem.itemqtyprices.length > 0) {
                        //     $scope.LstItemQtyPrice = selectedItem.itemqtyprices;
                        // }
                        if (selectedItem.itemmargins.length > 0) {
                              $scope.LstItemMargin = [];
                              $scope.LstItemMarginExtra = [];
                              for (var index = 0; index < $scope.LstCustGroup.length; index++) {
                                    var objcus = _.findWhere(selectedItem.itemmargins, {
                                          idCustGroup: $scope.LstCustGroup[index].id
                                    });
                                    if ($scope.LstCustGroup[index].Name == 'Shop' || $scope.LstCustGroup[index].Name == 'Stock Holder') {
                                          if (objcus) {
                                                objcus.idCustGroup = $scope.LstCustGroup[index].id;
                                                objcus.CustGroupName = $scope.LstCustGroup[index].Name;
                                                objcus['saleprice'] = 0;
                                                objcus['purchaseprice'] = 0;
                                                objcus['mainsaleprice'] = 0;
                                                objcus['marginamount'] = 0;
                                                objcus['Tax'] = 0;
                                                objcus['isShow'] = $scope.LstCustGroup[index].Name == 'Stock Holder' ? $scope.IsAdmin || $scope.isGenmedCustomer ? true : false : true;

                                                $scope.LstItemMargin.push(objcus);

                                          } else {
                                                var ModelItemMargin = {
                                                      ItemCode: selectedItem.ItemCode,
                                                      idCustGroup: $scope.LstCustGroup[index].id,
                                                      CustGroupName: $scope.LstCustGroup[index].Name,
                                                      Amount: '',
                                                      Percentage: 0,
                                                      percentagePrice: '',
                                                      TotalPrice: '',
                                                      saleprice: 0,
                                                      purchaseprice: 0,
                                                      MRP: 0,
                                                      mainsaleprice: 0,
                                                      Tax: 0,
                                                      TaxPrice: 0,
                                                      Profit: 0,
                                                      isShow: $scope.LstCustGroup[index].Name == 'Stock Holder' ? $scope.IsAdmin || $scope.isGenmedCustomer ? true : false : true
                                                      // isShow: $localstorage.get('CustomerGroup') == 'Stock Holder' && listExtra[i] == 'Genmed' ? false : true
                                                }
                                                $scope.LstItemMargin.push(ModelItemMargin);
                                          }
                                    }

                              }

                              // for (var index = 0; index < selectedItem.itemmargins.length; index++) {
                              //     var objcus = _.findWhere($scope.LstCustGroup, { id: selectedItem.itemmargins[index].idCustGroup });

                              //     if (objcus.Name == 'Shop' || objcus.Name == 'Stock Holder') {
                              //         selectedItem.itemmargins[index].idCustGroup = selectedItem.itemmargins[index].idCustGroup;
                              //         selectedItem.itemmargins[index].CustGroupName = objcus.Name;
                              //         selectedItem.itemmargins[index]['saleprice'] = 0;
                              //         selectedItem.itemmargins[index]['purchaseprice'] = 0;
                              //         selectedItem.itemmargins[index]['mainsaleprice'] = 0;
                              //         selectedItem.itemmargins[index]['marginamount'] = 0;
                              //         selectedItem.itemmargins[index]['Tax'] = 0;
                              //         selectedItem.itemmargins[index]['isShow'] = objcus.Name == 'Stock Holder' ? $scope.IsAdmin || $scope.isGenmedCustomer ? true : false : true;

                              //         $scope.LstItemMargin.push(selectedItem.itemmargins[index]);
                              //     }
                              // }

                              var listExtra = ['Genmed', 'Customer'];


                              for (var i = 0; i < listExtra.length; i++) {

                                    var objcus1 = _.findWhere($scope.LstCustGroup, {
                                          Name: listExtra[i]
                                    });
                                    var ModelItemMargin = {
                                          ItemCode: null,
                                          idCustGroup: objcus1.id,
                                          CustGroupName: objcus1.Name,
                                          Amount: '',
                                          Percentage: 0,
                                          percentagePrice: '',
                                          TotalPrice: '',
                                          saleprice: 0,
                                          purchaseprice: 0,
                                          MRP: 0,
                                          mainsaleprice: 0,
                                          Tax: 0,
                                          TaxPrice: 0,
                                          Profit: 0,
                                          isShow: listExtra[i] == 'Genmed' ? $localstorage.get('CustomerGroup') == 'Genmed' || $scope.IsAdmin ? true : false : true,
                                          // isShow: $localstorage.get('CustomerGroup') == 'Stock Holder' && listExtra[i] == 'Genmed' ? false : true
                                    }

                                    $scope.LstItemMarginExtra.push(ModelItemMargin);
                              }

                        }

                        $scope.model.idPopupNote = $scope.model.idPopupNote != '' && $scope.model.idPopupNote != undefined && $scope.model.idPopupNote != null ? ($scope.model.idPopupNote).toString() : '';
                        $scope.getSalesPurchaseRate();
                  });
            })


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
                        $http.get($rootScope.RoutePath + 'item/DeleteItem', {
                              params: params
                        }).success(function (data) {
                              if (data.success == true) {
                                    $scope.init();
                              }
                              $ionicLoading.show({
                                    template: data.message
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 1000);
                        }).catch(function (err) {
                              $ionicLoading.show({
                                    template: 'Unable to delete record right now. Please try again later.'
                              });
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
                  id: null,
                  ItemName: '',
                  ItemCode: '',
                  Descriptions: '',
                  Descriptions2: '',
                  idItemType: null,
                  idPopupNote: null,
                  idPurchaseTax: '',
                  idSupplyTax: '',
                  BaseUOM: '',
                  SalesUOM: '',
                  PurchaseUOM: '',
                  ReportUOM: '',
                  isActive: true,
                  isBatch: true,
                  SupplyTaxCode: '',
                  PurchaseTaxCode: '',
                  IdCustomer: null,
                  IsCombo: 0,
                  IsGenmedMedicine: 0,
                  IsGenmedWelness: 0,
                  IsGenmedOnline: 0,
                  IdSubBrand: null,
                  SubBrandName: '',
                  isActive: 0,
                  Weight: null,
                  WeightAmount: null,
                  Freight: null,
                  FreightAmount: null,
                  RemoveItemImage: [],
                  LstItemMargin: [],
                  SafeLevel: 0,
                  MinLevel: 0,
                  ReOrder: 0,
                  MinReOrder: 0,
                  LeadTime: 0,
                  LstItemQtyPrice: 0,
                  Barcode: '',
                  Brand: ''
            };

            $scope.Filtermodel = {
                  MainCompany: "",
                  SubCompany: "",
                  ProductGroup: "",
                  Tax: "",
                  IsGenmedMedicine: false,
                  IsGenmedWelness: false,
                  IsGenmedOnline: false,
                  isActive: true,
            }

            $scope.SelectedTab = 1;
            $scope.lstSelectedUOM = [];
            $scope.lstSelectedBatch = [];
            $scope.AllBatchQty = [];
            $scope.lstSelectedBatchQty = [];
            $scope.WorkingUOM = null;
            $scope.WorkingBatch = null;
            $scope.LstItemMargin = [];
            $scope.LstItemQtyPrice = [];
            $scope.LstItemMarginExtra = [];
      };

      $scope.ReserSearch = function () {
            $scope.Searchmodel = {
                  Search: '',
                  SearchItemCategory: '',
            }
      }

      $scope.GetSubCompanyByMainCompany = function (id) {
            var params = {
                  id: id ? id : null
            }
            $http.get($rootScope.RoutePath + 'brand/GetSubBrandByMainBrandId', {
                  params: params
            }).then(function (res) {
                  $scope.lstSubcompany = res.data.data;
            });
      }

      $scope.GetAllParentItemCategory = function () {
            $http.get($rootScope.RoutePath + 'itemcategory/GetAllItemCategory').then(function (res) {
                  $scope.lstParentItemCategory = res.data.data;
            });
      }
      $scope.GetAlltaxcode = function () {
            $http.get($rootScope.RoutePath + 'taxcode/GetAllActiveTaxcode').then(function (res) {
                  $scope.lstTaxcode = res.data.data;
            });
      }

      //Change Tab
      $scope.ChangeTab = function (Tab) {
            if (Tab == 'Details') {
                  AssignClickEvent();

                  setTimeout(function () {
                        $scope.SelectRaw(0);
                  })
            } else {
                  AssignClickEventBatch();

                  setTimeout(function () {
                        $scope.SelectBatchRaw(0);
                  })
            }
            $scope.SelectedTab = Tab;
      }

      $scope.FilterData = function () {
            $scope.TempSearch = $scope.Searchmodel.Search
            $('#ItemTable').dataTable().api().ajax.reload();

      }

      function InitDataTable() {
            if ($.fn.DataTable.isDataTable('#ItemTable')) {
                  $('#ItemTable').DataTable().destroy();
            }
            $('#ItemTable').DataTable({
                  "processing": true,
                  "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                  "serverSide": true,
                  "responsive": true,
                  "autoWidth": true,
                  "aaSorting": [
                        [1, 'ASC'],
                        // [12, 'DESC']
                  ],
                  "ajax": {
                        url: $rootScope.RoutePath + 'item/GetAllItemDynamic',
                        data: function (d) {
                              if ($scope.Searchmodel.Search != undefined) {
                                    d.search = $scope.Searchmodel.Search;
                              }
                              $scope.order = d.order;
                              $scope.columns = d.columns;
                              d.MainCompany = $scope.Filtermodel.MainCompany ? $scope.Filtermodel.MainCompany : null;
                              d.SubCompany = $scope.Filtermodel.SubCompany ? $scope.Filtermodel.SubCompany : null;
                              d.ProductGroup = $scope.Filtermodel.ProductGroup ? $scope.Filtermodel.ProductGroup : null;
                              d.Tax = $scope.Filtermodel.Tax ? $scope.Filtermodel.Tax : null;
                              d.IsGenmedMedicine = $scope.Filtermodel.IsGenmedMedicine ? $scope.Filtermodel.IsGenmedMedicine : null;
                              d.IsGenmedWelness = $scope.Filtermodel.IsGenmedWelness ? $scope.Filtermodel.IsGenmedWelness : null;
                              d.IsGenmedOnline = $scope.Filtermodel.IsGenmedOnline ? $scope.Filtermodel.IsGenmedOnline : null;
                              d.isActive = $scope.Filtermodel.isActive;
                              d.CustGroupName = $scope.CustomerGroupName == 'Genmed' ? null : $scope.CustomerGroupName;
                              console.log(d)
                              return d;
                        },
                        type: "get",
                        dataSrc: function (json) {
                              if (json.success != false) {
                                    $scope.lstdata = json.data;
                                    console.log(json.data)
                                    return _.filter(json.data, function (l) {
                                          l = getSalesPurchaseRateList(l);
                                          return l;
                                    });
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
                              "data": "ItemName",
                              "defaultContent": "N/A",
                        },
                        // { "data": "ItemCode", "defaultContent": "N/A" },
                        {
                              "data": "Descriptions2",
                              "defaultContent": "N/A",
                        },
                        {
                              "data": "Descriptions",
                              "defaultContent": "N/A",
                        },
                        // { "data": "subbrand.SubBrandName", "defaultContent": "N/A" },
                        // { "data": null, "sortable": false, },
                        // { "data": "BaseUOM", "defaultContent": "N/A" },
                        // { "data": "SalesUOM", "defaultContent": "N/A" },
                        // { "data": "PurchaseUOM", "defaultContent": "N/A" },
                        // { "data": "ReportUOM", "defaultContent": "N/A" },
                        // { "data": "itemtype.Type", "defaultContent": "N/A", "sortable": false, },

                        {
                              "data": "MRP",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "SalePrice",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "GenmedMargin",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "StockHolderMargin",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "ShopMargin",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "CustDiscount",
                              "defaultContent": "N/A"
                        },

                        {
                              "data": null,
                              "sortable": false
                        },
                        {
                              "data": null,
                              "sortable": false
                        },
                        {
                              "data": null,
                              "sortable": false
                        },
                        {
                              "data": null,
                              "sortable": false
                        },
                        {
                              "data": null,
                              "sortable": false
                        },
                        // { "data": "CreatedDate" },
                        // { "data": "ModifiedDate" },
                        {
                              "data": null,
                              "sortable": false,
                        },
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
                                          Action = (data).toString();
                                          if (Action.length > 50) {
                                                Action = '<span title="' + Action + '">' + data.substr(0, 50) + '...</span>';
                                          }
                                          return Action;
                                    } else {
                                          return "N/A";
                                    }

                              },
                              "targets": 1,
                              "targets": 2,
                              "targets": 3,
                              // "targets": 3,
                        },
                        {
                              "render": function (data, type, row) {
                                    if (data != null && data != undefined && data != '') {
                                          if (data.itemuoms.length > 0) {
                                                Action = _.pluck(data.itemuoms, 'UOM').toString();
                                                return Action;
                                          } else {
                                                return "N/A";
                                          }

                                    } else {
                                          return "N/A"
                                    }

                              },
                              // "targets": 3,

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
                              "targets": [4, 5, 8, 9],
                              className: "right-aligned-cell"
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
                              "targets": [6, 7],
                              "visible": $scope.isShop,
                              className: "right-aligned-cell"
                        },
                        {
                              "render": function (data, type, row) {
                                    var Action = '<div layout="row" layout-align="center center">';
                                    if (data.isActive == 1) {
                                          Action += '<span style="font-size: 20px;color: green" ng-click="isActiveItem(' + data.id + ',' + data.isActive + ')">✔</span>';
                                    } else {
                                          Action += ' <span style="font-size: 20px;color: red"  ng-click="isActiveItem(' + data.id + ',' + data.isActive + ')">✖</span>';
                                    }
                                    Action += '</div>';
                                    return Action;
                              },
                              "targets": 10,
                              className: "center-aligned-cell"
                        },

                        {
                              "render": function (data, type, row) {
                                    var Action = '<div layout="row" layout-align="center center">';
                                    if (data.IsGenmedMedicine == 1) {
                                          Action += '<span style="font-size: 20px;color: green">✔</span>';
                                    } else {
                                          Action += ' <span style="font-size: 20px;color: red">✖</span>';
                                    }
                                    Action += '</div>';
                                    return Action;
                              },
                              "targets": 11,
                              className: "center-aligned-cell"

                        },


                        {
                              "render": function (data, type, row) {
                                    var Action = '<div layout="row" layout-align="center center">';
                                    if (data.IsGenmedWelness == 1) {
                                          Action += '<span style="font-size: 20px;color: green">✔</span>';
                                    } else {
                                          Action += ' <span style="font-size: 20px;color: red">✖</span>';
                                    }
                                    Action += '</div>';
                                    return Action;
                              },
                              "targets": 12,
                              className: "center-aligned-cell"

                        },

                        {
                              "render": function (data, type, row) {
                                    var Action = '<div layout="row" layout-align="center center">';
                                    if (data.IsGenmedOnline == 1) {
                                          Action += '<span style="font-size: 20px;color: green">✔</span>';
                                    } else {
                                          Action += ' <span style="font-size: 20px;color: red">✖</span>';
                                    }
                                    Action += '</div>';
                                    return Action;
                              },
                              "targets": 13,
                              className: "center-aligned-cell"

                        },

                        {
                              "render": function (data, type, row) {
                                    if (data != null && data != undefined && data != '') {
                                          if (data.itembatchbalqties.length > 0) {
                                                var countQty = 0;
                                                _.filter(data.itembatchbalqties, function (t) {
                                                      if (t.Location == $localstorage.get('DefaultLocation')) {
                                                            countQty = countQty + t.BalQty;
                                                      }
                                                });
                                                // for (var i = 0; i < data.itembatchbalqties.length; i++) {
                                                //     var objRate = _.findWhere(data.itemuoms, { UOM: data.itembatchbalqties[i].UOM });
                                                //     if (objRate) {
                                                //         var uomRate = objRate.Rate;
                                                //         var qty = uomRate * data.itembatchbalqties[i].BalQty;
                                                //         countQty = countQty + qty;
                                                //     }
                                                // }
                                                return countQty;
                                          } else {
                                                return 0
                                          }
                                    } else {
                                          return 0;
                                    }

                              },
                              "targets": 14,
                              className: "center-aligned-cell"
                        },
                        {
                              "render": function (data, type, row) {
                                    if (row.CreatedDate != '' && row.CreatedDate != null) {
                                          return moment(row.CreatedDate).format('DD-MM-YYYY');
                                    } else {
                                          return "";
                                    }
                              },
                              // "targets": 8,
                        },
                        {
                              "render": function (data, type, row) {
                                    if (row.ModifiedDate != '' && row.ModifiedDate != null) {
                                          return moment(row.ModifiedDate).format('DD-MM-YYYY');
                                    } else {
                                          return "";
                                    }
                              },
                              // "targets": 9,
                        },
                        {
                              "render": function (data, type, row) {
                                    var Action = '<div layout="row" layout-align="center center">';
                                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                                    Action += '<a ng-click="DeleteItem(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>&nbsp;';
                                    //Action += '<a ng-click="OpenModalItemCategory(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-plus" title="Item Category"></i></a>';
                                    Action += '</div>';
                                    return Action;
                              },
                              "targets": 15,
                        },


                  ]
            });
      }

      $scope.formsubmit_taxcode = false;
      $scope.SaveTaxCode = function (FormTaxCode) {
            $rootScope.ShowLoader();
            if (FormTaxCode.$valid) {
                  $scope.formsubmit_taxcode = false;
                  $http.post($rootScope.RoutePath + 'taxcode/SaveTaxcode', $scope.TaxCodeModel)
                        .then(function (res) {
                              if (res.data.data == 'TOKEN') {
                                    $rootScope.logout();
                              }
                              $ionicLoading.show({
                                    template: res.data.message
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 500);

                              if (res.data.success) {
                                    $scope.modal.hide();
                                    $scope.TaxCodeModel = {
                                          id: 0,
                                          TaxType: '',
                                          Description: '',
                                          TaxRate: null,
                                          Inclusive: false,
                                          IsActive: true,
                                    };

                                    $scope.GetAllTaxCode(function () {
                                          if ($scope.modelNumber == 1) {
                                                // Supply code
                                                $scope.model.SupplyTaxCode = res.data.data.TaxType;
                                          } else if ($scope.modelNumber == 2) {
                                                // Purchase code
                                                $scope.model.PurchaseTaxCode = res.data.data.TaxType;
                                          }
                                    });

                              }
                        })
                        .catch(function (err) {

                              $ionicLoading.show({
                                    template: 'Unable to save record right now. Please try again later.'
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 500);

                        });
            } else {
                  $scope.formsubmit_taxcode = true;
            }
      };

      $ionicModal.fromTemplateUrl('TaxCode.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {

            $scope.modal = modal;
      });

      $scope.OpenModelTaxCode = function (num) {
            // $scope.idUser = idUser;
            $scope.TaxCodeModel = {
                  id: 0,
                  TaxType: '',
                  Description: '',
                  TaxRate: null,
                  Inclusive: false,
                  IsActive: true,
            };
            $scope.modelNumber = num;
            $scope.modal.show();
      };

      $scope.closeModal = function () {
            $scope.ItemId = null;
            $scope.modal.hide();
            $scope.AddContainmodal.hide();
            $scope.EditContainmodal.hide();
            $scope.ItemTypemodal.hide();
            $scope.PopupNotemodal.hide();
            $scope.UOM_Model.hide();
            $scope.ImportItemModal.hide();
            $scope.ImportItemBatchModal.hide();
            $scope.ItemCategorymodal.hide();
            if ($scope.SupplierModal) {
                  $scope.SupplierModal.remove();
            }
      };


      $ionicModal.fromTemplateUrl('AddContain.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {
            $scope.AddContainmodal = modal;

      });

      $scope.OpenModelAddContain = function (num) {
            $scope.model.Descriptions = ''
            $scope.AddContainmodal.show();
      };

      $scope.formsubmit_AddContain = false;
      $scope.SaveAddContain = function (FormAddContain) {
            if (FormAddContain.$valid) {
                  var Item = {
                        Descriptions: $scope.model.Descriptions
                  }
                  $scope.lstcontain.push(Item)
                  $scope.formsubmit_AddContain = false;
                  $scope.AddContainmodal.hide();
            } else {
                  $scope.formsubmit_AddContain = true;
            }
      };

      $ionicModal.fromTemplateUrl('EditContain.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {
            $scope.EditContainmodal = modal;

      });

      $scope.OpenModelEditContain = function (num) {
            $scope.TempContain = $scope.model.Descriptions
            $scope.EditContainmodal.show();
      };

      $scope.formsubmit_EditContain = false;
      $scope.SaveEditContain = function (FormEditContain) {
            if (FormEditContain.$valid) {
                  $scope.lstcontain.forEach(function (item, i) {
                        if (item.Descriptions == $scope.TempContain) {
                              $scope.lstcontain[i].Descriptions = $scope.model.Descriptions;
                        }
                  });
                  var params = {
                        Descriptions: $scope.model.Descriptions,
                        OldDescriptions: $scope.TempContain
                  }
                  $http.get($rootScope.RoutePath + 'item/UpdateContain', {
                        params: params
                  }).then(function (res) {});
                  $scope.formsubmit_EditContain = false;
                  $scope.EditContainmodal.hide();
            } else {
                  $scope.formsubmit_EditContain = true;
            }
      };

      $scope.$on('$destroy', function () {
            $scope.ItemId = null;
            $scope.modal.remove();
            $scope.ItemTypemodal.remove();
            $scope.PopupNotemodal.remove();
            $scope.UOM_Model.remove();
            $scope.ImportItemModal.remove();
            $scope.ImportItemBatchModal.remove();
            $scope.ItemCategorymodal.remove();
      })


      $scope.ItemTypeformsubmit = false;
      $scope.SaveItemType = function (form) {
            $rootScope.ShowLoader();
            if (form.$valid) {
                  $scope.ItemTypeformsubmit = false;
                  $http.post($rootScope.RoutePath + 'itemtype/SaveItemtype', $scope.ItemTypeModel)
                        .then(function (res) {
                              if (res.data.data == 'TOKEN') {
                                    $rootScope.logout();
                              }
                              if (res.data.success) {
                                    $scope.ItemTypemodal.hide();
                                    $scope.ItemTypeModel = {
                                          id: 0,
                                          Type: '',
                                          Descriptions: '',
                                          ShortCode: '',
                                          Note: ''
                                    };
                                    $scope.GetAllItemtype(function () {
                                          $scope.model.idItemType = res.data.data.id.toString();
                                    });
                              }
                              $ionicLoading.show({
                                    template: res.data.message
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 500);
                        })
                        .catch(function (err) {

                              $ionicLoading.show({
                                    template: 'Unable to save record right now. Please try again later.'
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 500);

                        });
            } else {
                  $scope.ItemTypeformsubmit = true;
            }
      };

      $ionicModal.fromTemplateUrl('ItemType.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {

            $scope.ItemTypemodal = modal;
      });

      $scope.OpenModelItemType = function () {
            $scope.ItemTypeModel = {
                  id: 0,
                  Type: '',
                  Descriptions: '',
                  ShortCode: '',
                  Note: ''
            };
            $scope.ItemTypemodal.show();
      };


      // popup note model

      $scope.PopupNoteformsubmit = false;
      $scope.SavePopupNote = function (form) {
            $rootScope.ShowLoader();
            if (form.$valid) {
                  $scope.PopupNoteformsubmit = false;
                  $http.post($rootScope.RoutePath + 'popupnote/SavePopupNote', $scope.PopupNoteModel)
                        .then(function (res) {
                              if (res.data.data == 'TOKEN') {
                                    $rootScope.logout();
                              }
                              if (res.data.success) {
                                    $scope.PopupNotemodal.hide();
                                    $scope.PopupNoteModel = {
                                          id: 0,
                                          Type: '',
                                          Descriptions: '',
                                          ShortCode: '',
                                          Note: ''
                                    };
                                    $scope.GetAllPopupNote(function () {
                                          $scope.model.idPopupNote = res.data.data.id.toString();
                                    });
                              }
                              $ionicLoading.show({
                                    template: res.data.message
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 500);
                        })
                        .catch(function (err) {

                              $ionicLoading.show({
                                    template: 'Unable to save record right now. Please try again later.'
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 500);

                        });
            } else {
                  $scope.PopupNoteformsubmit = true;
            }
      };

      $ionicModal.fromTemplateUrl('PopupNote.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {

            $scope.PopupNotemodal = modal;
      });

      $scope.OpenModelPopupNote = function () {
            $scope.PopupNoteModel = {
                  id: 0,
                  name: '',
                  message: '',
                  showoncepertransaction: 0
            };
            $scope.PopupNotemodal.show();
      };

      // popup note model end

      $scope.UOMformsubmit = false;
      $scope.SaveUOM = function (FormUOM) {
            $rootScope.ShowLoader();
            if (FormUOM.$valid) {
                  $scope.UOMformsubmit = false;
                  $http.post($rootScope.RoutePath + 'uom/SaveUom', $scope.ADDUOMModel)
                        .then(function (res) {
                              if (res.data.data == 'TOKEN') {
                                    $rootScope.logout();
                              }
                              if (res.data.success) {
                                    $scope.GetAllUOM(function () {});
                              }
                              $scope.UOM_Model.hide();
                              $scope.ADDUOMModel = {
                                    id: 0,
                                    UOM: '',
                                    Description: '',
                                    IsActive: true,
                              };
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
                  $scope.UOMformsubmit = true;
            }
      };

      $ionicModal.fromTemplateUrl('AddUOM.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {

            $scope.UOM_Model = modal;
      });

      $scope.OpenModelUOM = function () {
            $scope.ADDUOMModel = {
                  id: 0,
                  UOM: '',
                  Description: '',
                  IsActive: true,
            };
            $scope.UOM_Model.show();
      };

      $scope.isActiveItem = function (id, isActive) {
            var confirmPopup = $ionicPopup.confirm({
                  title: "",
                  template: '<i class="ion-alert-circled"></i><h3>Status Confirmation</h3><div>Are you sure you want to change status?</div>',
                  cssClass: 'custPop',
                  cancelText: 'Cancel',
                  okText: 'Ok',
                  okType: 'btn btn-green',
                  cancelType: 'btn btn-red',
            })
            confirmPopup.then(function (res) {
                  if (res) {
                        var params = {
                              id: id,
                              isActive: isActive == 0 ? 1 : 0,
                        }
                        $http.get($rootScope.RoutePath + "item/ChangeItemStatus", {
                              params: params
                        }).success(function (data) {
                              if (data.success == true) {
                                    setTimeout(function () {
                                          InitDataTable();
                                    })
                                    $ionicLoading.show({
                                          template: data.message
                                    });
                                    setTimeout(function () {
                                          $ionicLoading.hide()
                                    }, 1000);
                              } else {
                                    $ionicLoading.show({
                                          template: 'Unable to update status right now. Please try again later.'
                                    });
                                    setTimeout(function () {
                                          $ionicLoading.hide()
                                    }, 1000);
                              }
                        })
                  } else {
                        return true;
                  }
            });
      }

      $scope.ChangeBatchControll = function (isBatch) {

            $scope.lstSelectedBatch = [];
      }

      // Alias
      $rootScope.ResetAll = $scope.init;

      $scope.Add = function () {
            $scope.formsubmit = false;
            $rootScope.BackButton = $scope.IsList = false;
            $scope.ItemId = 0;
            InitTable1();
            ItemCategoryDataTable();
            $http.get($rootScope.RoutePath + "item/GetItemCode").success(function (data) {
                  $scope.model.ItemCode = data;
            })
      }

      $scope.Export = function () {
            var x = new Date();
            var offset = -x.getTimezoneOffset();
            var CurrentOffset = encodeURIComponent((('00' + offset).slice(-2) >= 0 ? "+" : "-") + ('00' + parseInt(offset / 60).toString()).slice(-2) + ":" + offset % 60);
            var Param = "?search=" + $scope.Searchmodel.Search + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order) + "&CurrentOffset=" + CurrentOffset;
            window.location = $rootScope.RoutePath + "item/ExportItem" + Param;
      }

      $scope.ChangeBatchPriceToDefault = function (o) {
            if (o.isDefaultPrice) {
                  var UOMPrice = _.findWhere($scope.lstSelectedUOM, {
                        UOM: $scope.model.SalesUOM
                  });
                  if (UOMPrice) {
                        o.SalesRate = UOMPrice.MinSalePrice;
                        o.PurchaseRate = UOMPrice.MinPurchasePrice;
                        o.MRP = UOMPrice.MRP;
                  }
            }
      }

      //****************************Import Item *************** */
      $scope.DownloadExcelTemplate = function () {
            window.location = $rootScope.RoutePath + "item/DownloadTemplateForUploadItem";
      }

      //Import function
      $ionicModal.fromTemplateUrl('ImportItem.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {
            $scope.ImportItemModal = modal;
      });


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
                              formData.append(0, $scope.File[0]);
                              $http.post($rootScope.RoutePath + "item/UploadItemImportExcel", formData, {
                                    transformRequest: angular.identity,
                                    headers: {
                                          'Content-Type': undefined
                                    }
                              }).then(function (data) {
                                    $ionicLoading.show({
                                          template: '<div class="text-center">' + data.data.message + '</div>'
                                    });
                                    if (data.data.success == true) {
                                          setTimeout(function () {
                                                $ionicLoading.hide();
                                                $scope.ImportItemModal.hide();
                                                $scope.init();
                                          }, 1000);
                                    } else {
                                          setTimeout(function () {
                                                $ionicLoading.hide();
                                          }, 1000)
                                    }
                              });
                        } else {
                              $ionicLoading.hide()
                              $ionicLoading.show({
                                    template: '<div class="text-center">Only Excel File Supported</div>'
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide();
                              }, 1000)
                        }
                  } else {
                        $ionicLoading.hide()
                        $ionicLoading.show({
                              template: '<div class="text-center">Select atleast one file</div>'
                        });
                        setTimeout(function () {
                              $ionicLoading.hide();
                        }, 1000)
                  }
            }
      }

      //****************************End Import Item *************** */


      ///************************************ */Import ItemBatch****************************************************

      $scope.DownloadExcelTemplateItemBatch = function () {
            window.location = $rootScope.RoutePath + "item/DownloadTemplateForUploadItemBatch";
      }

      $ionicModal.fromTemplateUrl('ImportItemBatch.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {
            $scope.ImportItemBatchModal = modal;
      });

      $scope.ImportItemBatch = function () {
            resetBatchFile();
            $scope.removeImportBatchFile();
            $scope.ImportItemBatchModal.show();
      }

      function resetBatchFile() {
            $scope.ItemBatchFileName = '';
            $scope.ItemBatchFileType = '';
            $scope.FormImportItemBatchSubmit = false;
      }
      resetBatchFile();

      $scope.removeImportBatchFile = function () {
            $('#FilesImportBatch').val("");
      }

      $scope.setItemBatchFile = function (element) {
            if (element.files.length > 0) {
                  $scope.ItemBatchFileName = element.files[0].name;
                  $scope.ItemBatchFileType = element.files[0].type;
            }
            $scope.$apply(function () {
                  $scope.FileItemBatch = element.files;
                  $scope.FileUrlItemBatch = URL.createObjectURL(event.target.files[0]);;
            })
      }

      $scope.ImportExcelItemBatch = function (form) {
            if (form.$invalid) {
                  $scope.FormImportItemBatchSubmit = true;
            } else {
                  $rootScope.ShowLoader();
                  if ($scope.ItemBatchFileName != null) {
                        if ($scope.ItemBatchFileType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                              var formData = new FormData();
                              formData.append(0, $scope.FileItemBatch[0], $rootScope.Us);
                              $http.post($rootScope.RoutePath + "item/UploadItemBatchImportExcel", formData, {
                                    transformRequest: angular.identity,
                                    headers: {
                                          'Content-Type': undefined
                                    }
                              }).then(function (data) {
                                    $ionicLoading.show({
                                          template: '<div class="text-center">' + data.data.message + '</div>'
                                    });
                                    if (data.data.success == true) {
                                          setTimeout(function () {
                                                $ionicLoading.hide();
                                                $scope.ImportItemBatchModal.hide();
                                                $scope.init();
                                          }, 1000);
                                    } else {
                                          setTimeout(function () {
                                                $ionicLoading.hide();
                                          }, 1000)
                                    }
                              });
                        } else {
                              $ionicLoading.hide()
                              $ionicLoading.show({
                                    template: '<div class="text-center">Only Excel File Supported</div>'
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide();
                              }, 1000)
                        }
                  } else {
                        $ionicLoading.hide()
                        $ionicLoading.show({
                              template: '<div class="text-center">Select atleast one file</div>'
                        });
                        setTimeout(function () {
                              $ionicLoading.hide();
                        }, 1000)
                  }
            }
      }

      ///************************************ */end Import ItemBatch****************************************************

      $scope.ExportItemBatch = function () {
            var x = new Date();
            var offset = -x.getTimezoneOffset();
            var CurrentOffset = encodeURIComponent((('00' + offset).slice(-2) >= 0 ? "+" : "-") + ('00' + parseInt(offset / 60).toString()).slice(-2) + ":" + offset % 60);
            window.location = $rootScope.RoutePath + "item/ExportItemBatch?CurrentOffset=" + CurrentOffset;
      }



      $scope.GetAllCustomer = function () {
            $http.get($rootScope.RoutePath + 'customer/GetAllSupplier').then(function (res) {
                  $scope.lstCustomer = res.data.data;
            });
      };

      //*****************************************Item Image Upload**************************************************** */
      $scope.Mediafiles = [];
      $scope.readFile = function (input) {
            if (input.files.length > 0) {
                  //read file

                  counter = input.files.length;
                  for (x = 0; x < counter; x++) {
                        if (input.files && input.files[x]) {
                              var reader = new FileReader();
                              reader.onload = function (e) {
                                    input.files[0].image = e.target.result;
                                    input.files[0].id = 0;
                                    setTimeout(function () {
                                          $scope.$apply(function () {
                                                $scope.Mediafiles.push(input.files);
                                          })
                                    })
                              };
                              reader.readAsDataURL(input.files[x]);
                        }
                  }


            }
      }
      $scope.ImageToFile = function (arrImage) {
            function CreateMediaObj(i) {
                  if (i < arrImage.length) {
                        var url = $rootScope.RoutePath + "/MediaUploads/ItemUpload/" + arrImage[i].FileName;
                        arrImage[i].image = url;
                        var arr = [];
                        arr.push(arrImage[i]);
                        $scope.Mediafiles.push(arr);
                        CreateMediaObj(i + 1);
                  }
            }
            CreateMediaObj(0);
      }

      $scope.TempRemoveArr = [];
      $scope.RemoveImage = function (index, id) {
            $scope.Mediafiles.splice(index, 1);
            if (id != 0) {
                  $scope.TempRemoveArr.push(id);
            }
      }
      //End File


      //Manage Category
      // $scope.ItemId = null;
      $ionicModal.fromTemplateUrl('ItemCategory.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {
            $scope.ItemCategorymodal = modal;
      });
      $scope.OpenModalItemCategory = function (ItemId) {
            $('#ItemCategoryTable').dataTable().fnClearTable();
            $('#ItemCategoryTable').dataTable().fnDestroy();
            $scope.ItemId = ItemId;
            $scope.GetAllItemCategoryItemWise(function () {
                  ItemCategoryDataTable();
            });
            $scope.ItemCategorymodal.show();
      };


      $scope.GetAllItemCategoryItemWise = function (returncall) {
            var params = {
                  ItemId: $scope.ItemId
            }
            $http.get($rootScope.RoutePath + 'itemcategory/GetAllItemCategoryItemWise', {
                  params: params
            }).then(function (res) {
                  $scope.lstitemCategory = res.data;
                  returncall();
            });
      };

      function ItemCategoryDataTable() {
            setTimeout(function () {
                  $('#ItemCategoryTable').DataTable({
                        "responsive": true,
                        "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                        "lengthMenu": [
                              [10, 15, 25, 50, -1],
                              [10, 15, 25, 50, "All"]
                        ],
                        "pageLength": 15,
                        language: {
                              "emptyTable": "No Data Found"
                        },
                        columnDefs: [{
                              bSortable: false,
                              aTargets: [-1]
                        }, {
                              "width": "10%",
                              "targets": 0
                        }]
                  });
            }, 100)
      }
      $scope.FilterDataItemCategory = function () {
            if ($scope.Searchmodel.SearchItemCategory != '' && $scope.Searchmodel.SearchItemCategory != null && $scope.Searchmodel.SearchItemCategory != undefined) {
                  $('#ItemCategoryTable').dataTable().fnFilter($scope.Searchmodel.SearchItemCategory);
            } else {
                  $('#ItemCategoryTable').dataTable().fnFilter("");
            }
      }

      $scope.SaveItemCategory = function () {
            $rootScope.ShowLoader();
            var objItemCategory = _.where($scope.lstitemCategory, {
                  checked: 1
            });

            var objItemCategory = {
                  ItemId: $scope.ItemId,
                  lstItems: objItemCategory,
            }
            $http.post($rootScope.RoutePath + 'itemcategory/SaveItemCategoryItemWise', objItemCategory)
                  .then(function (res) {
                        if (res.data.data == 'TOKEN') {
                              $rootScope.logout();
                        }
                        if (res.data.success) {
                              $scope.closeModal();
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

      $scope.GetAllActiveCustomerGroup = function () {
            $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomergroup').then(function (res) {
                  $scope.LstCustGroup = res.data.data;
                  for (var i = 0; i < $scope.LstCustGroup.length; i++) {
                        if ($scope.LstCustGroup[i].Name == 'Stock Holder' || $scope.LstCustGroup[i].Name == 'Shop') {
                              var ModelItemMargin = {
                                    ItemCode: null,
                                    idCustGroup: $scope.LstCustGroup[i].id,
                                    CustGroupName: $scope.LstCustGroup[i].Name,
                                    Amount: 0,
                                    Percentage: 0,
                                    percentagePrice: '',
                                    TotalPrice: '',
                                    saleprice: 0,
                                    purchaseprice: 0,
                                    mainsaleprice: 0,
                                    marginamount: 0,
                                    Tax: 0,
                                    isShow: $scope.LstCustGroup[i].Name == 'Stock Holder' ? $scope.IsAdmin || $scope.isGenmedCustomer ? true : false : true
                              }
                              $scope.LstItemMargin.push(ModelItemMargin);
                        } else {
                              var ModelItemMargin = {
                                    ItemCode: null,
                                    idCustGroup: $scope.LstCustGroup[i].id,
                                    CustGroupName: $scope.LstCustGroup[i].Name,
                                    Amount: 0,
                                    Percentage: 0,
                                    percentagePrice: '',
                                    TotalPrice: '',
                                    saleprice: 0,
                                    purchaseprice: 0,
                                    MRP: 0,
                                    mainsaleprice: 0,
                                    Tax: 0,
                                    TaxPrice: 0,
                                    Profit: 0,
                                    isShow: $scope.LstCustGroup[i].Name == 'Genmed' ? $localstorage.get('CustomerGroup') == 'Genmed' || $scope.IsAdmin ? true : false : true,
                              }
                              $scope.LstItemMarginExtra.push(ModelItemMargin);
                        }
                  }
            });

      };

      //Item Margin


      $scope.ChangeAmount = function (l) {

            var FindSalesUom = _.findWhere($scope.lstSelectedUOM, {
                  UOM: $scope.model.SalesUOM
            });
            if (FindSalesUom) {
                  if (FindSalesUom.MRP != '' && FindSalesUom.MRP != null) {
                        l.Amount = Math.round((parseFloat(l.Percentage) / 100) * parseFloat(FindSalesUom.MRP)) + parseFloat(FindSalesUom.MRP);

                  }
            }
      }



      $scope.AddItemMargin = function () {
            if ($scope.LstItemMargin.length > 0) {
                  if ($scope.LstItemMargin[$scope.LstItemMargin.length - 1].idCustGroup == '' || $scope.LstItemMargin[$scope.LstItemMargin.length - 1].idCustGroup == null) {
                        $ionicLoading.show({
                              template: "Select Customer Group"
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);
                        return;
                  }
            }
            $scope.ModelItemMargin = {
                  ItemCode: null,
                  idCustGroup: null,
                  Amount: 0,
                  Percentage: '',
                  percentagePrice: '',
                  TotalPrice: '',
            }
            $scope.LstItemMargin.push($scope.ModelItemMargin);
      }

      $scope.RemoveItemMargin = function (index) {
            $scope.LstItemMargin.splice(index, 1);
            if ($scope.LstItemMargin.length == 0) {
                  $scope.AddItemMargin();
            }
      }

      $scope.ChangeCustGroup = function (obj) {

            if ($scope.LstItemMargin.length > 1) {
                  var exist = _.filter($scope.LstItemMargin, function (item) {
                        if (item.idCustGroup == obj.idCustGroup) {
                              return item;
                        }
                  })
                  if (exist.length > 1) {
                        obj.idCustGroup = '';
                        $ionicLoading.show({
                              template: "Customer Group Exist!"
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);
                        return;

                  }
            }

      }



      //////////////////Supplier POPUP OPEN


      $scope.Supplierinit = function () {
            ManageRole();
            GetLastCustomerCode().then(function (LastCustomerCode) {
                  $scope.isValidMobile = false;
                  $scope.ModelSupplier = {
                        id: '',
                        AccountNumbder: LastCustomerCode,
                        Name: '',
                        RegistrationNo: '',
                        BillingAddress1: null,
                        BillingAddress2: null,
                        BillingAddress3: null,
                        EmailAddress: '',
                        PhoneNumber: '',
                        Website: null,
                        BiilingPostCode: null,
                        DeliveryAddress1: null,
                        DeliveryAddress2: null,
                        DeliveryAddress3: null,
                        DeliveryPostCode: null,
                        Attentions: null,
                        Note: null,
                        PhoneNumbder2: null,
                        Currency: null,
                        isActive: true,
                        idGroup: null,
                        idBranch: null,
                        idPriceCategory: null,
                        idLocations: null,
                        CreditTerm: null,
                        idCreditTerm: null,
                        ReferenceByCode: null,
                        idReferenceBy: null,
                        idCustomer: null,
                        CreditLimit: null,
                        ExceedLimitType: null,
                        AdminPassword: null,
                        SuspendReason: null,
                        Remark: null,
                        Status: null,
                        StatusRemark: null,
                        FoundusOn: null,
                        isAllowLogin: false,
                        password: null,
                        ConfirmPassword: null,
                        IsDPCommission: 0,
                        Type: 'Supplier'
                  }

            });
      };

      function GetLastCustomerCode() {
            return new Promise(function (resolve, reject) {
                  var LastCustomerCode = '';
                  $http.get($rootScope.RoutePath + 'customer/LastCustomerCode').then(function (resCode) {

                        if (resCode.data.success) {
                              LastCustomerCode = resCode.data.LastNumber;
                        }
                        resolve(LastCustomerCode);
                  }).catch(function (err) {
                        resolve(LastCustomerCode);
                  })
            })
      }

      function ManageRole() {
            var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
                  return Role == "Admin";
            })
            $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
            var CustomerUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
                  return Role == "Customer";
            })
            $scope.IsCustomer = CustomerUser.length && CustomerUser.length > 0 ? true : false;

      }

      function customers() {
            if ($localstorage.get('CustomerGroup') == "Genmed" || $localstorage.get('CustomerGroup') == "Stock Holder") {
                  $scope.isGenmedCustomer = true;
            } else {
                  $scope.isGenmedCustomer = false;
            }
            if ($localstorage.get('CustomerGroup') == "Shop") {
                  $scope.isshopCustomer = true;
            } else {
                  $scope.isshopCustomer = false;
            }
      }

      $scope.ValidateMobileNumber = function () {
            if (!$("#PhoneNumber").intlTelInput("isValidNumber")) {
                  $scope.isValidMobile = true
            } else {
                  $scope.isValidMobile = false
            }
      }

      $scope.formsuppliersubmit = false
      $scope.SaveCustomer = function (form) {
            $rootScope.ShowLoader();
            if (form.$invalid) {
                  $scope.formsuppliersubmit = true;
            } else {
                  // if (!$scope.model.id && $scope.model.isAllowLogin == true && $scope.model.password != $scope.model.ConfirmPassword) {
                  //     $ionicLoading.show({
                  //         template: "Password and Confrim Password Not Same."
                  //     });
                  //     setTimeout(function () {
                  //         $ionicLoading.hide()
                  //     }, 1000);
                  //     return;
                  // }
                  $scope.formsuppliersubmit = false;
                  // if ($scope.model.PhoneNumber == $scope.model.PhoneNumbder2) {
                  //     $ionicLoading.show({
                  //         template: "phone number and alternate phone number are same. "
                  //     });
                  //     setTimeout(function () {
                  //         $ionicLoading.hide()
                  //     }, 1000);
                  //     return;
                  // }
                  if (!$scope.ModelSupplier.id) {
                        $scope.ModelSupplier.id = 0;
                  }
                  if (!$scope.ModelSupplier.idBranch) {
                        $scope.ModelSupplier.idBranch = null;
                  }
                  if (!$scope.ModelSupplier.idGroup) {
                        $scope.ModelSupplier.idGroup = null;
                  }
                  if (!$scope.ModelSupplier.idPriceCategory) {
                        $scope.ModelSupplier.idPriceCategory = null;
                  }
                  if (!$scope.ModelSupplier.idLocations) {
                        $scope.ModelSupplier.idLocations = null;
                  }


                  $http.post($rootScope.RoutePath + 'customer/SaveCustomer', $scope.ModelSupplier)
                        .then(function (res) {
                              if (res.data.data == 'TOKEN') {
                                    $rootScope.logout();
                              }
                              if (res.data.success) {
                                    if ($scope.ReferenceBy == 1) {
                                          if ($scope.model.id == '' && $scope.model.ReferenceByCode != '' && $scope.model.ReferenceByCode != null) {
                                                $scope.GetAllCustomer();
                                                $scope.model.IdCustomer = res.data.data.id.toString();
                                                var objSend = {
                                                      id: '',
                                                      CustomerCode: $scope.model.AccountNumbder,
                                                      idCustomer: null,
                                                      idReferenceBy: null,
                                                      ReferenceByCode: $scope.model.ReferenceByCode,
                                                      ReferenceLevel: $scope.ReferenceLevel,
                                                      level: null
                                                }

                                                $http.post($rootScope.RoutePath + 'customer/SaveReferenceLevel', objSend)
                                                      .then(function (res1) {
                                                            if (res1.data.data == 'TOKEN') {
                                                                  $rootScope.logout();
                                                            }
                                                            if (res1.data.success) {
                                                                  // $ionicScrollDelegate.scrollTop();
                                                                  $scope.closeModal();

                                                                  $ionicLoading.show({
                                                                        template: res.data.message
                                                                  });
                                                                  setTimeout(function () {
                                                                        $ionicLoading.hide()
                                                                  }, 1000);
                                                            } else {
                                                                  // $ionicScrollDelegate.scrollTop();
                                                                  $scope.closeModal();
                                                                  $ionicLoading.show({
                                                                        template: res1.data.message
                                                                  });
                                                                  setTimeout(function () {
                                                                        $ionicLoading.hide()
                                                                  }, 1000);
                                                            }
                                                      })
                                          } else {
                                                // $ionicScrollDelegate.scrollTop();
                                                $scope.GetAllCustomer();
                                                $scope.model.IdCustomer = res.data.data.id.toString();
                                                $scope.closeModal();

                                                $ionicLoading.show({
                                                      template: res.data.message
                                                });
                                                setTimeout(function () {
                                                      $ionicLoading.hide()
                                                }, 1000);
                                          }
                                    } else {
                                          // $ionicScrollDelegate.scrollTop();
                                          $scope.closeModal();
                                          $scope.GetAllCustomer();
                                          $scope.model.IdCustomer = res.data.data.id.toString();
                                          $ionicLoading.show({
                                                template: res.data.message
                                          });
                                          setTimeout(function () {
                                                $ionicLoading.hide()
                                          }, 1000);
                                    }
                              } else {
                                    $ionicLoading.show({
                                          template: res.data.message
                                    });
                                    setTimeout(function () {
                                          $ionicLoading.hide()
                                    }, 1000);
                              }
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

      $scope.AddSupplier = function () {
            $ionicModal.fromTemplateUrl('Supplier.html', {
                  scope: $scope,
                  animation: 'slide-in-up'
            }).then(function (modal) {
                  $scope.SupplierModal = modal;
                  $scope.SupplierModal.show();
                  $scope.Supplierinit();
                  $scope.formsuppliersubmit = false;
                  setTimeout(function () {
                        $("#PhoneNumber").intlTelInput({
                              utilsScript: "lib/intl/js/utils.js"
                        });
                  }, 500);
            });


      }



      //Qty Wise Price
      $scope.AddQtyPrice = function () {
            if ($scope.LstItemQtyPrice.length > 0) {
                  if ($scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].MinQty == '' || $scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].MinQty == null) {
                        $ionicLoading.show({
                              template: "Select Min Qty"
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);
                        return;
                  } else if ($scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].MaxQty == '' || $scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].MaxQty == null) {
                        $ionicLoading.show({
                              template: "Select Max Qty"
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);
                        return;
                  } else if ($scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].SalePrice == '' || $scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].SalePrice == null) {
                        $ionicLoading.show({
                              template: "Select Sale Price"
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);
                        return;
                  } else if ($scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].PurchasePrice == '' || $scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].PurchasePrice == null) {
                        $ionicLoading.show({
                              template: "Select Purchase Price"
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);
                        return;
                  }
                  if ($scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].MinQty > $scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].MaxQty) {
                        $ionicLoading.show({
                              template: "Max qty must be grater then min qty."
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);
                        return;
                  }
                  if ($scope.LstItemQtyPrice.length != 1) {
                        var Filter = _.filter($scope.LstItemQtyPrice, function (l) {
                              if (l.MinQty >= $scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].MinQty ||
                                    l.MinQty <= $scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].MinQty ||
                                    l.MaxQty >= $scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].MaxQty ||
                                    l.MaxQty <= $scope.LstItemQtyPrice[$scope.LstItemQtyPrice.length - 1].MaxQty) {
                                    return l;
                              }
                        })
                        if (Filter.length && Filter.length > 0) {
                              $ionicLoading.show({
                                    template: "Qty Already Exist Between Min Qty And Max Qty"
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 1000);
                              return;
                        }
                  }
            }

            $scope.ModelQtyPrice = {
                  MinQty: '',
                  MaxQty: '',
                  SalePrice: '',
                  PurchasePrice: '',
            }
            $scope.LstItemQtyPrice.push($scope.ModelQtyPrice);
      }

      $scope.RemoveQtryPrice = function (index) {
            $scope.LstItemQtyPrice.splice(index, 1);
            if ($scope.LstItemQtyPrice.length == 0) {
                  $scope.AddQtyPrice();
            }
      }



      $scope.getSalesPurchaseRate = function () {
            var ShopId = _.findWhere($scope.LstCustGroup, {
                  Name: 'Shop'
            });
            var StockHolderId = _.findWhere($scope.LstCustGroup, {
                  Name: 'Stock Holder'
            });
            var GenmedId = _.findWhere($scope.LstCustGroup, {
                  Name: 'Genmed'
            });
            var CustomerId = _.findWhere($scope.LstCustGroup, {
                  Name: 'Customer'
            });

            var Shop = _.findWhere($scope.LstItemMargin, {
                  idCustGroup: ShopId.id
            });
            var StockHolder = _.findWhere($scope.LstItemMargin, {
                  idCustGroup: StockHolderId.id
            });
            var Genmed = _.findWhere($scope.LstItemMarginExtra, {
                  idCustGroup: GenmedId.id
            });
            var Customer = _.findWhere($scope.LstItemMarginExtra, {
                  idCustGroup: CustomerId.id
            });

            var UOMPrice = _.findWhere($scope.lstSelectedUOM, {
                  UOM: $scope.model.SalesUOM
            });
            var purchaseprice = 0;
            if (UOMPrice) {
                  purchaseprice = UOMPrice.MinSalePrice;
            }

            var TaxObj = _.findWhere($scope.lstTax, {
                  TaxType: $scope.model.SupplyTaxCode
            });
            if (TaxObj) {
                  purchaseprice = purchaseprice / ((TaxObj.TaxRate / 100) + 1);
            }

            Shop.saleprice = purchaseprice;
            Shop.purchaseprice = purchaseprice - ((purchaseprice * Shop.Percentage) / 100);
            Shop.mainsaleprice = UOMPrice ? UOMPrice.MinSalePrice : purchaseprice;
            Shop.marginamount = (purchaseprice * Shop.Percentage) / 100;
            Shop.Tax = TaxObj.TaxRate;
            Shop.TaxPrice = UOMPrice ? UOMPrice.MinSalePrice - purchaseprice : 0;

            StockHolder.saleprice = Shop.purchaseprice;
            StockHolder.purchaseprice = parseFloat(Shop.purchaseprice) - ((parseFloat(Shop.purchaseprice) * StockHolder.Percentage) / 100);
            // StockHolder.mainsaleprice = Shop.purchaseprice;
            StockHolder.mainsaleprice = UOMPrice ? UOMPrice.MinSalePrice : purchaseprice;
            StockHolder.marginamount = (parseFloat(Shop.purchaseprice) * StockHolder.Percentage) / 100;
            StockHolder.Tax = TaxObj.TaxRate;

            Genmed.saleprice = purchaseprice;
            Genmed.purchaseprice = UOMPrice ? UOMPrice.MinPurchasePrice : 0;
            Genmed.Percentage = UOMPrice ? ((StockHolder.purchaseprice - UOMPrice.MinPurchasePrice) * 100) / StockHolder.purchaseprice : 0;
            Genmed.MRP = UOMPrice ? UOMPrice.MRP : 0;
            Genmed.mainsaleprice = UOMPrice ? UOMPrice.MinSalePrice : 0;
            Genmed.Tax = TaxObj.TaxRate;
            Genmed.TaxPrice = UOMPrice ? UOMPrice.MRP - purchaseprice : 0;
            Genmed.Profit = StockHolder.purchaseprice - Genmed.purchaseprice;

            Customer.Percentage = UOMPrice ? ((UOMPrice.MRP - UOMPrice.MinSalePrice) * 100) / UOMPrice.MRP : 0;
            Customer.saleprice = UOMPrice ? UOMPrice.MRP : 0;
            Customer.purchaseprice = purchaseprice;
            Customer.MRP = UOMPrice ? UOMPrice.MRP : 0;
            Customer.mainsaleprice = UOMPrice ? UOMPrice.MinSalePrice : 0;
            Customer.Tax = TaxObj.TaxRate;
            Customer.TaxPrice = UOMPrice ? UOMPrice.MinSalePrice - purchaseprice : 0;
            Customer.Profit = UOMPrice ? UOMPrice.MRP - UOMPrice.MinSalePrice : 0;
      }

      function getSalesPurchaseRateList(o) {
            var ShopId = _.findWhere($scope.LstCustGroup, {
                  Name: 'Shop'
            });
            var StockHolderId = _.findWhere($scope.LstCustGroup, {
                  Name: 'Stock Holder'
            });
            var Shop = _.findWhere(o.itemmargins, {
                  idCustGroup: ShopId.id
            });
            var StockHolder = _.findWhere(o.itemmargins, {
                  idCustGroup: StockHolderId.id
            });

            var UOMPrice = _.findWhere(o.itemuoms, {
                  UOM: o.SalesUOM
            });



            var purchaseprice = 0;
            if (UOMPrice) {
                  purchaseprice = UOMPrice.MinSalePrice;
            }

            var TaxObj = _.findWhere($scope.lstTax, {
                  TaxType: o.SupplyTaxCode
            });
            if (TaxObj) {
                  purchaseprice = purchaseprice / ((TaxObj.TaxRate / 100) + 1);
            }

            var purchaseprice1 = purchaseprice - ((purchaseprice * (Shop ? Shop.Percentage : 0)) / 100);
            var purchaseprice2 = parseFloat(purchaseprice1) - ((parseFloat(purchaseprice1) * (StockHolder ? StockHolder.Percentage : 0)) / 100);
            var Percentage = UOMPrice ? ((purchaseprice2 - UOMPrice.MinPurchasePrice) * 100) / purchaseprice2 : 0;
            o.SalePrice = UOMPrice ? UOMPrice.MinSalePrice : 0;
            o.MRP = UOMPrice ? UOMPrice.MRP : 0;
            o.GenmedMargin = Percentage.toFixed(2);
            o.StockHolderMargin = StockHolder ? StockHolder.Percentage : 0;
            o.ShopMargin = Shop ? Shop.Percentage : 0;
            // o.CustDiscount = UOMPrice ? UOMPrice.MRP - UOMPrice.MinSalePrice : 0;
            o.CustDiscount = UOMPrice ? ((UOMPrice.MRP - UOMPrice.MinSalePrice) * 100) / UOMPrice.MRP : 0;

            return o;
      }
      $(document).keyup(function (e) {
            if (e.key === 'Escape') {
                  $scope.closeModal();
            }
      });

      $scope.init();

});