app.controller('DrugMasterController', function ($scope, $ionicModal, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {

      var vm = this;

      $scope.init = function () {
            $scope.ResetModel();
            $rootScope.BackButton = $scope.IsList = true;
            $scope.CurrentCustomerGroup = $localstorage.get('CustomerGroup');
            $scope.LstItemMargin = [];
            $scope.lstItemsSearch = [];
            $scope.lstcontainSearch = []
            $scope.MyColor = -1
            $scope.GetAllContian();
            $scope.GetAllActiveCustomerGroup();
            $scope.GetAllTaxCode();
            if ($rootScope.SelectedDrug != undefined) {
                  $scope.GetAllItemByDrug($rootScope.SelectedDrug)
            }
      };

      $scope.GetAllContian = function () {
            $http.get($rootScope.RoutePath + 'item/GetAllContian').then(function (res) {
                  $scope.lstcontain = res.data.data;
                  $scope.lstcontain = _.sortBy($scope.lstcontain, 'Descriptions')
                  // Commented Code Start
                  // $(document).ready(function () {
                  //     $('#DrugMasterTable').dataTable().fnClearTable();
                  //     $('#DrugMasterTable').dataTable().fnDestroy();
                  //     setTimeout(function () {
                  //         $('#DrugMasterTable').DataTable({
                  //             responsive: true,
                  //             "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                  //             retrieve: true,
                  //             "lengthMenu": [
                  //                 [10, 25, 50, -1],
                  //                 [10, 25, 50, "All"]
                  //             ],
                  //             "pageLength": 10,
                  //             language: {
                  //                 "emptyTable": "No Data Found"
                  //             },
                  //             columnDefs: [{
                  //                 bSortable: false,
                  //                 aTargets: [-1]
                  //             }]
                  //         });
                  //     })
                  // })
                  // Commented Code End

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

      $scope.GetAllItemSearch = function (ItemName) {
            var params = {
                  ItemName: ItemName,
                  CustGroupName: $scope.CurrentCustomerGroup == 'Genmed' ? null : $scope.CurrentCustomerGroup
            }
            $http.get($rootScope.RoutePath + 'item/GetAllItemBySearchText', {
                  params: params
            }).then(function (res) {
                  if (res.data.success) {
                        $scope.lstItemsSearch = res.data.data;
                        // $scope.lstItemsSearch = _.sortBy($scope.lstItemsSearch, 'ItemName')
                  } else {
                        $scope.lstItemsSearch = [];
                  }
            });


      };



      // $scope.FilterData = function () {
      //     if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
      //         $('#DrugMasterTable').dataTable().fnFilter($scope.Searchmodel.Search);
      //     } else {
      //         $('#DrugMasterTable').dataTable().fnFilter("");
      //     }
      // }

      // $scope.formsubmit = false;


      // $scope.CopyToModel = function (selectedItem) {
      //     $rootScope.BackButton = $scope.IsList = false;
      //     // Loop model, because selectedItem might have MORE properties than the defined model
      //     for (var prop in $scope.model) {
      //         $scope.model[prop] = selectedItem[prop];
      //     }
      //     $scope.model.IsActive = $scope.model.IsActive == 1 ? true : false;
      // };


      $scope.ResetModel = function () {
            $scope.model = {
                  id: 0,
                  Descriptions: '',
            };
            $scope.Searchmodel = {
                  Search: '',
            }
            $scope.EditModel = {
                  ItemName: '',
                  Descriptions: ''
            }
            $scope.formsubmit = false;
      };


      // $scope.Add = function () {
      //     $rootScope.BackButton = $scope.IsList = false;
      // }

      $scope.AddItemToTable = function (o) {
            $scope.EditModel.ItemName = o.ItemName
            $scope.EditModel.Descriptions = o.Descriptions
            $scope.TempContain = o.Descriptions
      }

      $scope.SelectItem = function (o) {
            $scope.lstItemsSearch = [];
            $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + o.ItemCode).then(function (res) {
                  $scope.lstItems = res.data.data;
                  setTimeout(function () {
                        $scope.$apply(function () {
                              $scope.lstItems = _.sortBy($scope.lstItems, 'ItemName')
                        })
                  }, 50)
                  var obj = _.findWhere($scope.lstItems, {
                        ItemCode: o.ItemCode
                  });
                  $scope.TempContain = obj.Descriptions
                  $scope.EditModel.ItemName = obj.ItemName
                  $scope.EditModel.Descriptions = obj.Descriptions
                  $scope.GetAllItemByDrug($scope.EditModel.Descriptions)
            });
      }

      $scope.SaveContainName = function () {
            $scope.lstcontain.forEach(function (item, i) {
                  if (item.Descriptions == $scope.TempContain) {
                        $scope.lstcontain[i].Descriptions = $scope.EditModel.Descriptions;
                  }
            });
            var params = {
                  Descriptions: $scope.EditModel.Descriptions,
                  OldDescriptions: $scope.TempContain
            }
            $http.get($rootScope.RoutePath + 'item/UpdateContain', {
                  params: params
            }).then(function (res) {
                  if (res.data.success) {
                        $ionicLoading.show({
                              template: "Contain Updated successfully"
                        });
                        setTimeout(function () {
                              $scope.EditModel = {
                                    ItemName: '',
                                    Descriptions: ''
                              }
                              $ionicLoading.hide()
                        }, 1000);
                        $scope.lstItembyDrug = []
                        $scope.modelContainSearch.Search = ''
                  }
            });

      }

      // $rootScope.ResetAll = $scope.init;

      // $ionicModal.fromTemplateUrl('DrugMasterpopup.html', {
      //     scope: $scope,
      //     animation: 'slide-in-up'
      // }).then(function (modal) {
      //     $scope.DeliveryModal = modal;
      // });

      $scope.GetAllItemByDrug = function (o) {
            $scope.lstcontainSearch = []
            var params = {
                  Descriptions: ''
            }
            if ($rootScope.SelectedDrug != undefined) {
                  params.Descriptions = o
                  $rootScope.SelectedDrug = null
            } else {
                  // var objDoc = _.findWhere($scope.lstcontain, { Descriptions: o.Descriptions });
                  // params.Descriptions = objDoc.Descriptions
                  params.Descriptions = o
            }
            $http.get($rootScope.RoutePath + 'item/GetAllItemByDrug', {
                  params: params
            }).then(function (resCode) {
                  $scope.lstItembyDrug = resCode.data.data
                  setTimeout(function () {
                        $scope.$apply(function () {
                              $scope.lstItembyDrug = _.sortBy($scope.lstItembyDrug, 'ItemName')
                        })
                  }, 50)
                  $scope.lstItembyDrug = _.filter(resCode.data.data, function (t) {
                        $scope.LstItemMargin = [];
                        for (var index = 0; index < t.itemmargins.length; index++) {
                              var objcus = _.findWhere($scope.LstCustGroup, {
                                    id: t.itemmargins[index].idCustGroup
                              });

                              if (objcus.Name == 'Shop' || objcus.Name == 'Stock Holder') {
                                    t.itemmargins[index].idCustGroup = t.itemmargins[index].idCustGroup;
                                    t.itemmargins[index].CustGroupName = objcus.Name;
                                    t.itemmargins[index]['SaleRate'] = 0;
                                    t.itemmargins[index]['PurchaseRate'] = 0;
                                    t.itemmargins[index]['MRP'] = 0;

                                    $scope.LstItemMargin.push(t.itemmargins[index]);
                              }
                        }

                        var listExtra = ['Genmed', 'Customer'];
                        for (var i = 0; i < listExtra.length; i++) {
                              var objcus1 = _.findWhere($scope.LstCustGroup, {
                                    Name: listExtra[i]
                              });
                              var ModelItemMargin = {
                                    idCustGroup: objcus1.id,
                                    CustGroupName: objcus1.Name,
                                    Amount: '',
                                    Percentage: 0,
                                    SaleRate: 0,
                                    PurchaseRate: 0,
                                    MRP: 0,
                              }
                              $scope.LstItemMargin.push(ModelItemMargin);
                        }
                        t = getSalesPurchaseRate(t);
                        return t;
                  });
                  console.log($scope.lstItembyDrug)

                  // $scope.DeliveryModal.show();
                  // $(document).ready(function () {
                  //     $('#DMTable').dataTable().fnClearTable();
                  //     $('#DMTable').dataTable().fnDestroy();
                  //     setTimeout(function () {
                  //         $('#DMTable').DataTable({
                  //             responsive: true,
                  //             "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                  //             retrieve: true,
                  //             "lengthMenu": [
                  //                 [10, 25, 50, -1],
                  //                 [10, 25, 50, "All"]
                  //             ],
                  //             "pageLength": 10,
                  //             language: {
                  //                 "emptyTable": "No Data Found"
                  //             },
                  //             columnDefs: [{
                  //                 bSortable: false,
                  //                 aTargets: [-1]
                  //             }]
                  //         });
                  //     })
                  // })
            });
      };

      $scope.closeDeliveryPackingSlipModal = function () {
            $scope.DeliveryModal.hide();
      };

      $scope.GetAllActiveCustomerGroup = function () {
            $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomergroup').then(function (res) {
                  $scope.LstCustGroup = res.data.data;
            })
      }

      $scope.GetAllTaxCode = function () {
            $http.get($rootScope.RoutePath + 'taxcode/GetAllActiveTaxcode').then(function (res) {
                  $scope.lstTax = res.data.data;
            });
      }

      $scope.SetColor = function (index) {
            $scope.MyColor = index
      }

      function getSalesPurchaseRate(o) {
            var LocationUser = $localstorage.get('idLocations')

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
            var Genmed = _.findWhere($scope.LstItemMargin, {
                  idCustGroup: GenmedId.id
            });
            var Customer = _.findWhere($scope.LstItemMargin, {
                  idCustGroup: CustomerId.id
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

            var objStock = _.findWhere(o.itembatchbalqties, {
                  UOM: o.SalesUOM,
                  Location: LocationUser
            });

            Shop.SaleRate = UOMPrice ? UOMPrice.MinSalePrice : 0;
            Shop.PurchaseRate = purchaseprice - ((purchaseprice * Shop.Percentage) / 100);
            Shop.MRP = UOMPrice ? UOMPrice.MRP : 0;

            StockHolder.SaleRate = UOMPrice ? UOMPrice.MinSalePrice : 0;
            StockHolder.PurchaseRate = parseFloat(Shop.PurchaseRate) - ((parseFloat(Shop.PurchaseRate) * StockHolder.Percentage) / 100);
            StockHolder.MRP = UOMPrice ? UOMPrice.MRP : 0;

            Genmed.SaleRate = UOMPrice ? UOMPrice.MinSalePrice : 0;
            Genmed.PurchaseRate = UOMPrice.MinPurchasePrice;
            Genmed.MRP = UOMPrice ? UOMPrice.MRP : 0;
            Genmed.Percentage = ((StockHolder.PurchaseRate - UOMPrice.MinPurchasePrice) * 100) / StockHolder.PurchaseRate;

            Customer.SaleRate = UOMPrice ? UOMPrice.MinSalePrice : 0;
            Customer.PurchaseRate = purchaseprice;
            Customer.MRP = UOMPrice ? UOMPrice.MRP : 0;
            Customer.Percentage = ((UOMPrice.MRP - UOMPrice.MinSalePrice) * 100) / UOMPrice.MRP;

            o['MarginGenmed'] = parseFloat(Genmed.Percentage).toFixed(2);
            o['MarginStockHolder'] = parseFloat(StockHolder.Percentage).toFixed(2);
            o['MarginShop'] = parseFloat(Shop.Percentage).toFixed(2);

            if ($localstorage.get('CustomerGroup') == 'Shop') {
                  o['SaleRate'] = Shop.SaleRate;
                  o['MRP'] = Shop.MRP;
                  o['PurchaseRate'] = Shop.PurchaseRate;
                  o['Stock'] = objStock ? objStock.BalQty : 0;
            } else if ($localstorage.get('CustomerGroup') == 'Stock Holder') {
                  o['SaleRate'] = StockHolder.SaleRate;
                  o['MRP'] = StockHolder.MRP;
                  o['PurchaseRate'] = StockHolder.PurchaseRate;
                  o['Stock'] = objStock ? objStock.BalQty : 0;
            } else if ($localstorage.get('CustomerGroup') == 'Genmed') {
                  o['SaleRate'] = Genmed.SaleRate;
                  o['MRP'] = Genmed.MRP;
                  o['PurchaseRate'] = Genmed.PurchaseRate;
                  o['Stock'] = objStock ? objStock.BalQty : 0;
            } else {
                  o['SaleRate'] = Genmed.SaleRate;
                  o['MRP'] = Genmed.MRP;
                  o['PurchaseRate'] = Genmed.PurchaseRate;
                  o['Stock'] = objStock ? objStock.BalQty : 0;
            }
            return o;
      }

      $scope.init();
})