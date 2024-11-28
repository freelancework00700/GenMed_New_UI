app.controller('QuotationController', function ($scope, $rootScope, $ionicModal, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

      $scope.init = function () {
            setTimeout(() => {
                  $("#mytext").focus();
            }, 1000);
            $scope.modelAdvanceSearch = null;
            ManageRole();
            $scope.CustomerGroupId = $localstorage.get('CustomerGroupId')
            $scope.CustomerGroupName = $localstorage.get('CustomerGroup')
            $scope.CustomerName = $localstorage.get('CustomerGroup');
            $scope.GetAllLocation();
            // $scope.getAllUserLoaction();
            $scope.ResetModel();
            $scope.GetAllBranch();
            $scope.GetAllActiveCustomerGroup();
            $scope.GetAllContain();

            // $scope.GetAllUOM();
            $scope.GetAllTaxCode();
            $scope.GetAllCurrency();
            $scope.GetAllCurrencyRate();
            $scope.GetAllCustomer();
            // $scope.GetAllItem();
            $scope.LstItemMargin = [];
            $scope.lstItemsSearch = [];
            $scope.tab = {
                  selectedIndex: 0
            };
            $rootScope.BackButton = $scope.IsList = true;
            $scope.SelectedTab = 0;
            $scope.IsSave = false;
            setTimeout(function () {
                  InitDataTable();
            })
            $scope.isValidMobile = false
            $scope.isValidMobile2 = false

      }

      function ManageRole() {
            var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
                  return Role == "Admin";
            })
            $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
      }
      $scope.ChangeTab = function (number) {
            $scope.SelectedTab = number;
            if ($scope.SelectedTab == 3) {
                  setTimeout(function () {
                        $("#PhoneNumber").intlTelInput({
                              utilsScript: "lib/intl/js/utils.js"
                        });
                        $("#DeliverPhoneNumber").intlTelInput({
                              utilsScript: "lib/intl/js/utils.js"
                        });
                  }, 500)
            } else if ($scope.SelectedTab == 2) {
                  $scope.GetAllItemSaleQty();
            }
      }


      $scope.GetAllCustomer = function () {
            var params = {
                  CreatedBy: $scope.IsAdmin ? '' : '',
                  // CreatedBy: $scope.IsAdmin ? '' : parseInt($localstorage.get('UserId')),
            }
            $http.get($rootScope.RoutePath + 'customer/GetAllCustomer', {
                  params: params
            }).then(function (res) {
                  $scope.lstCustomer = res.data.data;
                  console.log($scope.lstCustomer)
                  var LoginCustomer = _.findWhere($scope.lstCustomer, {
                        id: parseInt($scope.CustomerGroupId)
                  });
                  if (LoginCustomer) {
                        $scope.model.CustomerCode = LoginCustomer.AccountNumbder;
                        $scope.SelectCustomer($scope.model.CustomerCode)
                  }
            });
      };

      $scope.GetAllBranch = function () {
            $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomerbranch').then(function (res) {
                  $scope.lstBranch = res.data.data;
            });
      };

      //contain
      $scope.GetAllContain = function () {
            $http.get($rootScope.RoutePath + 'item/GetAllContian').then(function (res) {
                  $scope.lstcontain = res.data.data;
            });
      };

      $scope.GetAllItemByDrug = function (drug) {
            var params = {
                  Descriptions: drug
            }

            $http.get($rootScope.RoutePath + 'item/GetAllItemByDrug', {
                  params: params
            }).then(function (resCode) {
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
                        t = getSalesPurchaseRate1(t);
                        return t;
                  });
            });
      };

      $scope.GetAllItemSaleQty = function () {
            var params = {
                  idLocation: $localstorage.get('CustomerGroupLocatio'),
                  StartDate: moment($scope.modelProductSearch.StartDate).format('YYYY-MM-DD'),
                  EndDate: moment($scope.modelProductSearch.EndDate).format('YYYY-MM-DD'),
            }
            $rootScope.ShowLoader();
            $http.get($rootScope.RoutePath + 'item/GetAllItemSaleQty', {
                  params: params
            }).then(function (res) {
                  $scope.lstItemSaleQty = res.data.data;
                  $ionicLoading.hide();
            });
      };

      $scope.GetAllItem = function () {
            $http.get($rootScope.RoutePath + 'item/GetAllItem').then(function (res) {
                  $scope.lstItems = res.data.data;
            });
      };

      $scope.GetAllItemSearch = function (o) {
            _.filter($scope.lstSelectedQuotationMain, function (item) {
                  item.IsEdit = false;
            });
            o.IsEdit = true;
            if (o.ItemName) {
                  var params = {
                        ItemName: o.ItemName,
                        CustGroupName: $scope.CustomerGroupName == 'Genmed' ? null : $scope.CustomerGroupName
                  }
                  $http.get($rootScope.RoutePath + 'item/GetAllItemBySearchText', {
                        params: params
                  }).then(function (res) {
                        $scope.lstItemsSearch = res.data.data;
                        console.log($scope.lstItemsSearch)
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
                                          } else {
                                                liSelected = li.eq(0).addClass('selected');
                                          }
                                          $container.scrollTop(
                                                liSelected.offset().top - $container.offset().top + $container.scrollTop()
                                          );
                                    } else if (e.which === 38) {
                                          if (liSelected) {
                                                liSelected.removeClass('selected');
                                                next = liSelected.prev();
                                                if (next.length > 0) {
                                                      liSelected = next.addClass('selected');
                                                } else {
                                                      liSelected = li.last().addClass('selected');
                                                }
                                          } else {
                                                liSelected = li.last().addClass('selected');
                                          }
                                          $container.scrollTop(
                                                liSelected.offset().top - $container.offset().top + $container.scrollTop()
                                          );
                                    } else if (e.which === 13) {
                                          var find = _.findWhere($scope.lstItemsSearch, {
                                                id: parseInt($('.autosearch.selected').attr('id'))
                                          });
                                          //console.log($scope.lstSelectedSaleMain.indexOf(find.ItemCode), $scope.lstSelectedSaleMain);
                                          if (find) {
                                                $scope.AddItemCode($scope.lstSelectedQuotationMain[$scope.lstSelectedQuotationMain.length - 1], find);
                                          }
                                    }
                              });
                        }, 10)
                  });
            } else {
                  $scope.lstItemsSearch = [];
            }
      };

      $scope.GetAllLocation = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : "",
                  // idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
            }
            $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', {
                  params: params
            }).then(function (res) {
                  $scope.lstLocations = res.data.data;
                  var obj = _.findWhere($scope.lstLocations, {
                        id: parseInt($localstorage.get('DefaultLocation'))
                  });
                  if (obj) {
                        $scope.model.DefaultLocation = obj.Name;
                  }
                  // if ($scope.CustomerGroupName == "Shop") {
                  //     $scope.model.idLocations = "38"
                  // }
            });
      };

      $scope.GetAllUOM = function () {
            $http.get($rootScope.RoutePath + 'uom/GetAllActiveUom').then(function (res) {
                  $scope.lstUOM = res.data.data;
            });
      };

      $scope.GetAllTaxCode = function () {
            $http.get($rootScope.RoutePath + 'taxcode/GetAllActiveTaxcode').then(function (res) {
                  $scope.lstTaxCode = res.data.data;
            });
      };

      $scope.GetAllCurrency = function () {
            $http.get($rootScope.RoutePath + 'currency/GetAllCurrency').then(function (res) {
                  $scope.lstCurrency = res.data.data;
                  $scope.TotalRecord = $scope.lstCurrency.length;
            })
      }

      $scope.GetAllCurrencyRate = function () {
            $http.get($rootScope.RoutePath + 'currency/GetAllCurrencyRate').then(function (res) {
                  $scope.lstCurrencyRate = res.data.data;
                  $scope.TotalRecord1 = $scope.lstCurrencyRate.length;
            })
      }

      $scope.changeRateByCurrency = function (CurrencyCode) {
            if (CurrencyCode != '' && CurrencyCode != undefined && CurrencyCode != null) {
                  $scope.checkCurrencyRate(CurrencyCode);
            } else {
                  $scope.model.CurrencyRate = ''
            }
      }

      $scope.GetAllActiveCustomerGroup = function () {
            $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomergroup').then(function (res) {
                  $scope.LstCustGroup = res.data.data;
            });
      };


      $scope.SelectCustomer = function (o) {
            var obj = _.findWhere($scope.lstCustomer, {
                  AccountNumbder: o
            });
            if (obj) {
                  $scope.model.CustomerName = obj.Name;
                  $scope.model.Address1 = obj.BillingAddress1;
                  $scope.model.Address2 = obj.BillingAddress2;
                  $scope.model.Address3 = obj.BillingAddress3;
                  $scope.model.BranchCode = obj.customerbranch ? obj.customerbranch.Name : null;
                  if (obj.Currency != undefined && obj.Currency != null && obj.Currency != '') {
                        $scope.checkCurrencyRate(obj.Currency);
                  } else {
                        //for default currency
                        $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, {
                              isDefault: 1
                        }).CurrencyCode;
                        $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, {
                              CurrencyCode: $scope.model.CurrencyCode
                        }).SellRate;
                  }

                  if (obj.idGroup) {
                        $scope.CustomerGroup = obj.customergroup;
                  } else {
                        $scope.CustomerGroup = null;
                  }
            } else {
                  $scope.model.CustomerName = "";
                  $scope.model.Address1 = "";
                  $scope.model.Address2 = "";
                  $scope.model.Address3 = "";
                  $scope.model.BranchCode = "";
                  $scope.model.CurrencyCode = "";
                  $scope.model.CurrencyRate = "";
            }
      }

      $scope.checkCurrencyRate = function (CurrencyCode) {
            var obj = _.findWhere($scope.lstCurrencyRate, {
                  CurrencyCode: CurrencyCode
            });
            if (obj != null && obj != '' && obj != undefined) {
                  var FromDate = new Date(obj.FromDate);
                  var ToDate = new Date(obj.ToDate);
                  var CurrentDate = new Date();
                  if (CurrentDate >= FromDate && CurrentDate <= ToDate) {
                        $scope.model.CurrencyCode = obj.CurrencyCode;
                        $scope.model.CurrencyRate = obj.SellRate;
                  } else {
                        var obj = _.findWhere($scope.lstCurrency, {
                              CurrencyCode: CurrencyCode
                        });
                        if (obj != null && obj != '' && obj != undefined) {
                              $scope.model.CurrencyCode = obj.CurrencyCode;
                              $scope.model.CurrencyRate = obj.SellRate;
                        } else {
                              //for default currency
                              $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, {
                                    isDefault: 1
                              }).CurrencyCode;
                              $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, {
                                    CurrencyCode: $scope.model.CurrencyCode
                              }).SellRate;
                        }
                  }
            } else {
                  var obj = _.findWhere($scope.lstCurrency, {
                        CurrencyCode: CurrencyCode
                  });
                  if (obj != null && obj != '' && obj != undefined) {
                        $scope.model.CurrencyCode = obj.CurrencyCode;
                        $scope.model.CurrencyRate = obj.SellRate;
                  } else {
                        //for default currency
                        $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, {
                              isDefault: 1
                        }).CurrencyCode;
                        $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, {
                              CurrencyCode: $scope.model.CurrencyCode
                        }).SellRate;
                  }
            }
      }

      $scope.ChangeLocation = function () {
            if ($scope.lstSelectedQuotationMain.length > 0) {
                  var confirmPopup = $ionicPopup.confirm({
                        title: "",
                        template: 'Are you sure you want to change locations of all quotation?',
                        cssClass: 'custPop',
                        cancelText: 'Cancel',
                        okText: 'Ok',
                        okType: 'btn btn-green',
                        cancelType: 'btn btn-red',
                  })
                  confirmPopup.then(function (res) {
                        if (res) {
                              if ($scope.lstSelectedQuotationMain.length > 0) {
                                    for (var i = 0; i < $scope.lstSelectedQuotationMain.length; i++) {
                                          $scope.lstSelectedQuotationMain[i].idLocations = parseInt($scope.model.idLocations);
                                          $scope.lstSelectedQuotationMain[i].DisplayLocation = _.findWhere($scope.lstLocations, {
                                                id: parseInt($scope.model.idLocations)
                                          }).Name;
                                    }
                              }
                              $scope.QuotationMainModel.idLocations = $scope.model.idLocations;
                              $scope.model.DefaultLocation = _.findWhere($scope.lstLocations, {
                                    id: parseInt($scope.model.idLocations)
                              }).Name;
                        } else {
                              $scope.model.idLocations = $localstorage.get('DefaultLocation');
                              $scope.model.DefaultLocation = _.findWhere($scope.lstLocations, {
                                    id: parseInt($localstorage.get('DefaultLocation'))
                              }).Name;
                        }
                  })
            } else {
                  $scope.model.DefaultLocation = _.findWhere($scope.lstLocations, {
                        id: parseInt($scope.model.idLocations)
                  }).Name;
            }
      }

      //Start Main Quotation Tab

      //add Quotation main item in list
      $scope.AddQuotationMainItemInList = function () {
            // if ($scope.lstSelectedQuotationMain.length >= 1 && $scope.WorkingQuotationMain.ItemCode == '') {
            //     $ionicLoading.show({ template: "Fill data" });
            //     setTimeout(function () {
            //         $ionicLoading.hide()
            //     }, 1000);
            //     return;
            // } 
            if ($scope.lstSelectedQuotationMain.length > 0 && $scope.lstSelectedQuotationMain[$scope.lstSelectedQuotationMain.length - 1].ItemCode == '') {
                  $ionicLoading.show({
                        template: "Fill Data"
                  });
                  setTimeout(function () {
                        $ionicLoading.hide()
                  }, 1000);
                  return;
            } else {
                  _.filter($scope.lstSelectedQuotationMain, function (item) {
                        item.IsEdit = false;
                  });

                  $scope.QuotationMainModel = {
                        id: null,
                        Total: 0,
                        CurrencyCode: null,
                        CurrencyRate: 0,
                        NetTotal: 0.00,
                        LocalNetTotal: 0.00,
                        Tax: 0.00,
                        LocalTax: 0.00,
                        FinalTotal: 0.00,
                        RoundAdj: 0.00,
                        idQuotation: null,
                        ItemCode: '',
                        idLocations: $scope.model.idLocations != '' && $scope.model.idLocations != null ? $scope.model.idLocations : "",
                        DisplayLocation: $scope.model.DefaultLocation,
                        BatchNo: null,
                        Descriptions: null,
                        UOM: null,
                        UserUOM: null,
                        Qty: 0,
                        Price: 0.00,
                        DiscountAmount: 0,
                        isDiscount: 0,
                        TaxCode: null,
                        TaxRate: 0,
                        IsEdit: true,
                        LastBalQty: 0,
                        LastBatchNo: null,
                        LastLocation: null,
                        LastItemCode: null,
                        LastUOM: null,
                        listUOM: [],
                        BatchList: [],
                        isBatch: false,
                        ItemId: null,
                        Barcode: null,
                        SaleUOM: null,
                        ItemName: null,
                        Stock: 0,
                        listBalQty: [],
                        sequence: $scope.lstSelectedQuotationMain.length + 1
                  }
                  // $scope.BatchList = [];

                  $scope.lstSelectedQuotationMain.push($scope.QuotationMainModel);
                  $scope.WorkingQuotationMain = $scope.QuotationMainModel;

                  // AssignQuotationMainClickEvent();

                  // setTimeout(function() {
                  //     $scope.SelectQuotationMainRaw($scope.lstSelectedQuotationMain.length - 1);
                  // })
            }
      }

      $scope.AddQuotationMainItemInListNew = function () {
            $scope.QuotationMainModel = {
                  id: null,
                  Total: 0,
                  CurrencyCode: null,
                  CurrencyRate: 0,
                  NetTotal: 0.00,
                  LocalNetTotal: 0.00,
                  Tax: 0.00,
                  LocalTax: 0.00,
                  FinalTotal: 0.00,
                  RoundAdj: 0.00,
                  idQuotation: null,
                  ItemCode: '',
                  idLocations: $scope.model.idLocations != '' && $scope.model.idLocations != null ? $scope.model.idLocations : "",
                  DisplayLocation: $scope.model.DefaultLocation,
                  BatchNo: null,
                  Descriptions: null,
                  UOM: null,
                  UserUOM: null,
                  Qty: 0,
                  Price: 0.00,
                  DiscountAmount: 0,
                  isDiscount: 0,
                  TaxCode: null,
                  TaxRate: 0,
                  IsEdit: false,
                  LastBalQty: 0,
                  LastBatchNo: null,
                  LastLocation: null,
                  LastItemCode: null,
                  LastUOM: null,
                  listUOM: [],
                  BatchList: [],
                  isBatch: false,
                  ItemId: null,
                  Barcode: null,
                  SaleUOM: null,
                  ItemName: null,
                  Stock: 0,
                  listBalQty: [],
                  sequence: $scope.lstSelectedQuotationMain.length + 1
            }
            $scope.lstSelectedQuotationMain.push($scope.QuotationMainModel);
      }

      function AssignQuotationMainClickEvent() {
            setTimeout(function () {
                  $("#tblQuotationMainTable tr").unbind("click");

                  $("#tblQuotationMainTable tr").click(function () {
                        if ($(this)[0].accessKey != "") {
                              for (var k = 0; k < $scope.lstSelectedQuotationMain.length; k++) {
                                    $scope.lstSelectedQuotationMain[k].IsEdit = false;
                              }

                              $("#tblQuotationMainTable tr").removeClass("highlight");
                              $(this).addClass("highlight");

                              $scope.WorkingQuotationMain = $scope.lstSelectedQuotationMain[$(this)[0].accessKey];
                              $scope.WorkingQuotationMain.IsEdit = true;
                              var obj = _.findWhere($scope.lstItems, {
                                    ItemCode: $scope.WorkingQuotationMain.ItemCode
                              });
                              if (obj) {
                                    if (obj.isBatch == 1) {
                                          $scope.BatchList = obj.itembatches;
                                          $scope.WorkingQuotationMain.isBatch = true;
                                    } else {
                                          $scope.BatchList = [];
                                          $scope.WorkingQuotationMain.isBatch = false;
                                    }
                              }
                              $scope.$apply();
                        }
                  });
            })
      }

      $scope.RemoveQuotationMainItemInList = function (index) {
            var SelectedSeq = $scope.lstSelectedQuotationMain[index].sequence
            $scope.lstSelectedQuotationMain.splice(index, 1);
            _.filter($scope.lstSelectedQuotationMain, function (item) {
                  if (item.sequence > SelectedSeq) {
                        item.sequence = item.sequence - 1
                  }
            });
            if ($scope.lstSelectedQuotationMain.length == 0) {
                  $scope.model.Total = 0.00;
                  $scope.model.NetTotal = 0.00;
                  $scope.model.LocalNetTotal = 0.00;
                  $scope.model.FinalTotal = 0.00;
                  $scope.model.Tax = 0.00;
                  $scope.model.LocalTax = 0.00;
                  $scope.AddQuotationMainItemInList();
            } else {
                  AdjustFinalQuotationTotal();
                  $scope.WorkingQuotationMain = $scope.lstSelectedQuotationMain[$scope.lstSelectedQuotationMain.length - 1];
            }

            // AssignQuotationMainClickEvent();

            // setTimeout(function() {
            //     $scope.SelectQuotationMainRaw(0);
            // })
      }

      $scope.AddtoPendingList = function (index, o) {

            var ObjPending = {
                  ItemCode: o.ItemCode,
                  BranchCode: $scope.model.BranchCode,
                  Qty: o.Qty,
                  UOM: o.UOM,
                  idLocations: o.idLocations,
                  Date: $scope.model.QuotationDate
            }


            $http.post($rootScope.RoutePath + 'pendinglist/SavePendingList', ObjPending).then(function (res) {
                  if (res.data.success) {
                        $ionicLoading.show({
                              template: 'Item added in pending list successfully'
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);
                  }
            });

      }

      $scope.SelectQuotationMainRaw = function (index) {
            $("#tblQuotationMainTable tr[accessKey='" + index + "']").trigger("click");
      }

      $scope.GetAllItemUOM = function (o) {
            var params = {
                  ItemCode: o.ItemCode,
                  UOM: o.UOM
            }
            $http.get($rootScope.RoutePath + 'itemuom/GetItemUOMByItemCodeAndUOM', {
                  params: params
            }).then(function (res) {
                  $scope.ItemUOM = res.data.data;
                  if ($scope.ItemUOM && o.Qty != null) {
                        o.Price = $scope.ItemUOM.Price;
                        o.Total = (o.Qty * o.Price) - o.DiscountAmount;
                        o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
                        o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
                  } else {
                        o.Price = 0.00;
                        o.Total = 0.00;
                        o.FinalTotal = o.NetTotal = o.LocalNetTotal = 0.00;
                  }

                  AdjustFinalQuotationTotal();
            });
      };

      $scope.AddPrice = function (o) {
            if (o.Qty != 0 && o.Qty != '') {
                  o.Total = (o.Qty * parseFloat(o.Price)) - o.DiscountAmount;
                  o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
                  o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
            } else {
                  o.Total = 0.00;
                  o.FinalTotal = o.NetTotal = o.LocalNetTotal = 0.00;
            }
            AdjustFinalQuotationTotal();
      }

      $scope.AddItemCode = function (o, t, m) {

            if (t) {
                  o.ItemCode = t.ItemCode;
                  o.ItemName = t.ItemName;
            }
            $scope.lstItemsSearch = [];
            var LocationUser = $localstorage.get('idLocations')
            $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + o.ItemCode).then(function (res) {
                  $scope.lstItems = res.data.data;
                  var obj = _.findWhere($scope.lstItems, {
                        ItemCode: o.ItemCode
                  });
                  o.Descriptions = obj.Descriptions;
                  o.ItemName = obj.ItemName;
                  o.UOM = (obj.SalesUOM).toString();
                  o.TaxCode = obj.SupplyTaxCode;
                  o.listUOM = obj.itemuoms;
                  o.ItemId = obj.id;
                  o.itemmargins = obj.itemmargins;
                  o.SaleUOM = obj.SalesUOM;
                  // o.listBalQty = obj.itembalqties
                  if (obj.isBatch == 1) {
                        o.BatchList = obj.itembatches;
                        o.isBatch = true;
                  } else {
                        o.BatchList = [];
                        o.isBatch = false;
                  }

                  // if (obj.itembalqties.length > 0) {
                  var objStock = {
                        ItemCode: o.ItemCode,
                        UOM: o.UOM,
                        Location: LocationUser
                  }

                  $http.get($rootScope.RoutePath + 'item/GetAllItemBalQtyByItemCode', {
                        params: objStock
                  }).then(function (res) {
                        var objz = res.data.data;
                        o.Stock = objz ? objz.BalQty : 0;
                  });

                  // var obj1 = _.findWhere(obj.itembalqties, { Location: LocationUser, UOM: o.UOM })
                  // if (obj1) {
                  //     o.Stock = obj1.BalQty
                  // }

                  // }
                  setTimeout(() => {
                        $("#Qty_" + o.sequence).focus();
                  }, 1000);
                  $scope.FillItemUnitPrice(o);
                  if (!m) {
                        try {
                              if ($scope.lstSelectedQuotationMain[$scope.lstSelectedQuotationMain.length - 1].ItemCode != '') {
                                    $scope.AddQuotationMainItemInListNew();
                              }
                        } catch (ex) {
                              $scope.AddQuotationMainItemInListNew();
                        }
                  }
            })
      }

      $scope.FocusToNext = function (o) {
            console.log(o)
            setTimeout(() => {
                  $("#shivam_" + (o.sequence + 1)).focus();
            }, );
      }


      $scope.AddItemToList = function (o) {
            var obj = $scope.lstSelectedQuotationMain[$scope.lstSelectedQuotationMain.length - 1].ItemCode;
            if (obj) {
                  $scope.QuotationMainModel = {
                        id: null,
                        Total: 0,
                        CurrencyCode: null,
                        CurrencyRate: 0,
                        NetTotal: 0.00,
                        LocalNetTotal: 0.00,
                        Tax: 0.00,
                        LocalTax: 0.00,
                        FinalTotal: 0.00,
                        RoundAdj: 0.00,
                        idQuotation: null,
                        ItemCode: o.ItemCode,
                        idLocations: $scope.model.idLocations != '' && $scope.model.idLocations != null ? $scope.model.idLocations : "",
                        DisplayLocation: $scope.model.DefaultLocation,
                        BatchNo: null,
                        Descriptions: null,
                        UOM: null,
                        UserUOM: null,
                        Qty: 0,
                        Price: 0.00,
                        DiscountAmount: 0,
                        isDiscount: 0,
                        TaxCode: null,
                        TaxRate: 0,
                        IsEdit: false,
                        LastBalQty: 0,
                        LastBatchNo: null,
                        LastLocation: null,
                        LastItemCode: null,
                        LastUOM: null,
                        listUOM: [],
                        BatchList: [],
                        isBatch: false,
                        ItemId: null,
                        Barcode: null,
                        SaleUOM: null,
                        ItemName: null,
                        Stock: 0,
                        listBalQty: [],
                        sequence: $scope.lstSelectedQuotationMain.length + 1
                  }
                  $scope.lstSelectedQuotationMain.push($scope.QuotationMainModel);
                  $scope.AddItemCode($scope.QuotationMainModel, false, true);
            } else {
                  $scope.lstSelectedQuotationMain[$scope.lstSelectedQuotationMain.length - 1].ItemCode = o.ItemCode;
                  $scope.AddItemCode($scope.lstSelectedQuotationMain[$scope.lstSelectedQuotationMain.length - 1], false, true)
            }
      }

      $scope.FillItemUnitPrice = function (o) {
            var objUOM = _.findWhere(o.listUOM, {
                  UOM: o.UOM
            })
            if (objUOM) {
                  o.Price = objUOM.Price;
                  $scope.AddTaxCode(o, 1);

                  // if (o.listBalQty && o.listBalQty.length > 0) {
                  var objStock = {
                        ItemCode: o.ItemCode,
                        UOM: o.UOM,
                        Location: $localstorage.get('idLocations')
                  }
                  $http.get($rootScope.RoutePath + 'item/GetAllItemBalQtyByItemCode', {
                        params: objStock
                  }).then(function (res) {
                        var objz = res.data.data;
                        o.Stock = objz ? objz.BalQty : 0;
                  });
                  // var obj1 = _.findWhere(o.listBalQty, { Location: $localstorage.get('idLocations'), UOM: o.UOM })
                  // if (obj1) {
                  //     o.Stock = obj1.BalQty
                  // }
                  // }
            }
      }

      $scope.AddLocation = function (o) {
            var obj = _.findWhere($scope.lstLocations, {
                  id: parseInt(o.idLocations)
            });
            o.DisplayLocation = obj.Name;
            // if (o.listBalQty.length > 0) {
            //     var obj1 = _.findWhere(o.listBalQty, { Location: o.idLocations, UOM: o.UOM })
            //     if (obj1) {
            //         o.Stock = obj1.BalQty
            //     }
            // }
      }

      $scope.AddDiscountAmount = function (o) {
            o.Total = (o.Qty * parseFloat(o.Price)) - parseFloat(o.DiscountAmount);
            o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
            if (o.DiscountAmount != null && o.DiscountAmount != 0 && o.DiscountAmount != '' && o.DiscountAmount != undefined) {
                  o.isDiscount = 1;
            } else {
                  o.isDiscount = 0;
            }

            AdjustFinalQuotationTotal();
      }

      $scope.AddTaxCode = function (o, status) {
            if (o.TaxCode) {
                  var obj = _.findWhere($scope.lstTaxCode, {
                        TaxType: o.TaxCode
                  });
                  if (obj) {
                        o.TaxRate = obj.TaxRate;
                        o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
                        if (status == 1) {
                              if ($scope.model.IsInclusive) {
                                    o.Price = parseFloat(o.Price) / ((o.TaxRate / 100) + 1);
                              }
                        }
                  } else {
                        o.TaxRate = 0;
                        o.Tax = 0.00;
                  }
            } else {
                  o.TaxRate = 0;
                  o.Tax = 0.00;
            }

            // if (status != 2) {
            //     $scope.MangeMargin(o);
            // } else {
            $scope.AddPrice(o);
            // }
      }

      $scope.MangeMargin = function (o) {
            if (o.itemmargins && o.itemmargins.length > 0) {
                  var List = getSalesPurchaseRate(o);

                  if ($scope.CustomerGroup.Name == 'Shop') {
                        o.Price = List.ShopSalesRate;
                        o.DiscountAmount = List.ShopPercentage;
                  } else if ($scope.CustomerGroup.Name == 'Stock Holder') {
                        o.Price = List.StockHolderSalesRate;
                        o.DiscountAmount = List.StockHolderPercentage;
                  } else if ($scope.CustomerGroup.Name == 'Genmed') {
                        o.Price = List.GenmedSalesRate;
                  } else if ($scope.CustomerGroup.Name == 'Customer') {
                        o.Price = List.CustomerSalePrice;
                        $scope.model.IsInclusive = true;
                  }

            }
            $scope.AddPrice(o);
      }

      function AdjustFinalQuotationTotal() {
            if ($scope.lstSelectedQuotationMain.length > 0) {
                  $scope.model.Total = 0.00;
                  $scope.model.NetTotal = 0.00;
                  $scope.model.LocalNetTotal = 0.00;
                  $scope.model.FinalTotal = 0.00;
                  $scope.model.Tax = 0.00;
                  $scope.model.LocalTax = 0.00;

                  for (var i = 0; i < $scope.lstSelectedQuotationMain.length; i++) {
                        $scope.model.Total = $scope.model.Total + $scope.lstSelectedQuotationMain[i].Total;
                        $scope.model.NetTotal = $scope.model.LocalNetTotal = $scope.model.FinalTotal = Math.round($scope.model.NetTotal + $scope.lstSelectedQuotationMain[i].NetTotal);
                        $scope.model.Tax = $scope.model.LocalTax = $scope.model.Tax + $scope.lstSelectedQuotationMain[i].Tax;
                  }
            }
      }

      //End Main Quotation Tab
      $scope.formsubmit = false;
      $scope.SaveQuotation = function (form) {
            var NoItemCode = _.findWhere($scope.lstSelectedQuotationMain, {
                  ItemCode: ''
            });
            if (NoItemCode) {
                  $ionicLoading.hide();
                  $scope.lstSelectedQuotationMain.pop()
                  // var alertPopup = $ionicPopup.alert({
                  //     title: '',
                  //     template: 'Item code missing.First select Item code for all items in list.',
                  //     cssClass: 'custPop',
                  //     okText: 'Ok',
                  //     okType: 'btn btn-green',
                  // });
            }
            // else {
            var NoQty = _.filter($scope.lstSelectedQuotationMain, function (item) {
                  if (item.Qty == 0 || item.Qty == '' || item.Qty == undefined) {
                        return item;
                  }
            });

            if (NoQty != '') {
                  $ionicLoading.hide();
                  var alertPopup = $ionicPopup.alert({
                        title: '',
                        template: 'Quantity must be grater than zero for all items in list.',
                        cssClass: 'custPop',
                        okText: 'Ok',
                        okType: 'btn btn-green',
                  });
            } else {
                  if (form.$invalid) {
                        $scope.formsubmit = true;
                        return
                  }
                  var BatchList = _.where($scope.lstSelectedQuotationMain, {
                        isBatch: true
                  });

                  if (BatchList.length > 0) {
                        var ListNoBatchNumber = [];
                        _.filter(BatchList, function (p) {
                              if (p.BatchNo == null) {
                                    ListNoBatchNumber.push(p.ItemCode);
                              }
                        })

                        if (ListNoBatchNumber.length > 0) {
                              var confirmPopup = $ionicPopup.confirm({
                                    title: "",
                                    template: '<p>The following items are missing Item Batch No.Do you still want to save?</p>' +
                                          '<br>' +
                                          '<p><b>' + ListNoBatchNumber.toString() + '</b></p>',
                                    cssClass: 'custPop',
                                    cancelText: 'Cancel',
                                    okText: 'Ok',
                                    okType: 'btn btn-green',
                                    cancelType: 'btn btn-red',
                              })
                              confirmPopup.then(function (res) {
                                    if (res) {
                                          Save();
                                    } else {
                                          $ionicLoading.hide();
                                    }
                              })
                        } else {
                              Save();
                        }
                  } else {
                        Save();
                  }
            }

            // }

            function Save() {
                  // if (!$("#PhoneNumber").intlTelInput("isValidNumber")) {
                  //     $scope.isValidMobile = true
                  //     if ($scope.model.PhoneNumber.toString().length <= 2) {
                  //         $scope.isValidMobile = false
                  //         $scope.model.PhoneNumber = '';
                  //     } else {
                  //         return;
                  //     }

                  // }
                  // if (!$("#DeliverPhoneNumber").intlTelInput("isValidNumber")) {
                  //     $scope.isValidMobile2 = true
                  //     if ($scope.model.DeliverPhoneNumber.toString().length <= 2) {
                  //         $scope.isValidMobile2 = false
                  //         $scope.model.DeliverPhoneNumber = '';
                  //     } else {
                  //         return;
                  //     }

                  // }
                  // $scope.isValidMobile = false
                  // $scope.isValidMobile2 = false
                  if (!$scope.model.id) {
                        $scope.model.id = 0;
                  }
                  $scope.model.lstQuotationDetail = $scope.lstSelectedQuotationMain;
                  if (new Date($scope.model.QuotationDate) == 'Invalid Date') {
                        $scope.model.QuotationDate = moment().set({
                              'date': $scope.model.QuotationDate.split('-')[0],
                              'month': $scope.model.QuotationDate.split('-')[1] - 1,
                              'year': $scope.model.QuotationDate.split('-')[2]
                        }).format('YYYY-MM-DD');
                  } else {
                        if (moment($scope.model.QuotationDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                              $scope.model.QuotationDate = moment($scope.model.QuotationDate).format('YYYY-MM-DD');
                        } else {
                              $scope.model.QuotationDate = moment($scope.model.QuotationDate).format('YYYY-MM-DD');
                        }
                  }
                  $http.post($rootScope.RoutePath + 'quotation/SaveQuotation', $scope.model)
                        .then(function (res) {

                              var ResponseQuotation = res.data;
                              if (ResponseQuotation.success) {
                                    $ionicLoading.show({
                                          template: ResponseQuotation.message
                                    });
                                    setTimeout(function () {
                                          $ionicLoading.hide()
                                    }, 1000);
                                    $scope.init();
                              } else {
                                    $ionicLoading.show({
                                          template: ResponseQuotation.message
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

      // Use more distinguished and understandable naming
      $scope.CopyToModel = function (id) {
            var selectedItem = _.findWhere($scope.lstdata, {
                  id: parseInt(id)
            });
            $scope.tab.selectedIndex = 1;
            $rootScope.BackButton = $scope.IsList = false;

            for (var prop in $scope.model) {
                  $scope.model[prop] = selectedItem[prop];
                  if (prop == 'idLocations') {
                        $scope.model['idLocations'] = selectedItem[prop].toString()
                  }
                  if (prop == 'QuotationDate') {
                        $scope.model['QuotationDate'] = moment(selectedItem[prop]).format('YYYY-MM-DD');
                  }
                  if (prop == 'ModifiedBy') {
                        $scope.model['ModifiedBy'] = parseInt($localstorage.get('UserId'));
                  }

                  if (prop == "LoginUserCode") {
                        $scope.model['LoginUserCode'] = $localstorage.get('UserCode')
                  }

                  if (prop == 'CustomerCode') {
                        var obj = _.findWhere($scope.lstCustomer, {
                              AccountNumbder: $scope.model[prop]
                        });
                        if (obj) {
                              if (obj.idGroup) {
                                    $scope.CustomerGroup = obj.customergroup;
                              } else {
                                    $scope.CustomerGroup = null;
                              }
                        }
                  }
            }
            $scope.lstSelectedQuotationMain = selectedItem.quotationdetails;
            $scope.lstSelectedQuotationMain = _.sortBy($scope.lstSelectedQuotationMain, 'sequence');

            if ($scope.lstSelectedQuotationMain.length > 0) {
                  for (let i = 0; i < $scope.lstSelectedQuotationMain.length; i++) {
                        $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + $scope.lstSelectedQuotationMain[i].ItemCode).then(function (res) {
                              $scope.lstItems = res.data.data;
                              $scope.lstSelectedQuotationMain[i].IsEdit = false;
                              $scope.lstSelectedQuotationMain[i].ItemName = $scope.lstItems[0].ItemName;
                              if ($scope.lstSelectedQuotationMain[i].TaxCode) {
                                    var obj = _.findWhere($scope.lstTaxCode, {
                                          TaxType: $scope.lstSelectedQuotationMain[i].TaxCode
                                    });
                                    if (obj) {
                                          $scope.lstSelectedQuotationMain[i].TaxRate = obj.TaxRate;
                                    }
                              }

                              if ($scope.lstSelectedQuotationMain[i].sequence == null) {
                                    $scope.lstSelectedQuotationMain[i].sequence = i + 1
                              }

                              if ($scope.lstSelectedQuotationMain[i].idLocations) {
                                    var obj1 = _.findWhere($scope.lstLocations, {
                                          id: parseInt($scope.lstSelectedQuotationMain[i].idLocations)
                                    });
                                    $scope.lstSelectedQuotationMain[i].idLocations = ($scope.lstSelectedQuotationMain[i].idLocations).toString();
                                    if (obj1) {
                                          $scope.lstSelectedQuotationMain[i].DisplayLocation = obj1.Name;
                                    }
                              }

                              var LocationUser = $localstorage.get('idLocations')
                              // if ($scope.lstItems[0].itembalqties.length > 0) {

                              var objStock = {
                                    ItemCode: $scope.lstSelectedQuotationMain[i].ItemCode,
                                    UOM: $scope.lstSelectedQuotationMain[i].UOM,
                                    Location: LocationUser
                              }
                              $http.get($rootScope.RoutePath + 'item/GetAllItemBalQtyByItemCode', {
                                    params: objStock
                              }).then(function (res) {
                                    var objz = res.data.data;

                                    $scope.lstSelectedQuotationMain[i].Stock = objz ? objz.BalQty : 0;

                              });

                              // var obj1 = _.findWhere($scope.lstItems[0].itembalqties, { Location: LocationUser, UOM: $scope.lstSelectedQuotationMain[i].UOM })
                              // if (obj1) {
                              //     $scope.lstSelectedQuotationMain[i].Stock = obj1.BalQty
                              // }

                              // }

                              var objItem1 = _.findWhere($scope.lstItems, {
                                    ItemCode: $scope.lstSelectedQuotationMain[i].ItemCode
                              });
                              if (objItem1) {
                                    $scope.lstSelectedQuotationMain[i].listUOM = objItem1.itemuoms;
                                    $scope.lstSelectedQuotationMain[i].SaleUOM = objItem1.SalesUOM;
                                    $scope.lstSelectedQuotationMain[i].ItemId = objItem1.id;
                                    if (objItem1.isBatch == 1) {
                                          $scope.lstSelectedQuotationMain[i].isBatch = true;
                                          $scope.lstSelectedQuotationMain[i].BatchList = objItem1.itembatches;
                                    } else {
                                          $scope.lstSelectedQuotationMain[i].isBatch = false;
                                          $scope.lstSelectedQuotationMain[i].BatchList = objItem1.itembatches;
                                    }
                              } else {
                                    $scope.lstSelectedQuotationMain[i].listUOM = [];
                                    $scope.lstSelectedQuotationMain[i].ItemId = null;
                              }

                              $scope.lstSelectedQuotationMain[i].LastBalQty = $scope.lstSelectedQuotationMain[i].Qty;
                              $scope.lstSelectedQuotationMain[i].LastBatchNo = $scope.lstSelectedQuotationMain[i].BatchNo;
                              $scope.lstSelectedQuotationMain[i].LastLocation = $scope.lstSelectedQuotationMain[i].idLocations;
                              $scope.lstSelectedQuotationMain[i].LastItemCode = $scope.lstSelectedQuotationMain[i].ItemCode;
                              $scope.lstSelectedQuotationMain[i].LastUOM = $scope.lstSelectedQuotationMain[i].UOM;
                        })
                  }



                  // var objItem = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedQuotationMain[0].ItemCode });
                  // if (objItem) {
                  //     if (objItem.isBatch == 1) {
                  //         $scope.BatchList = objItem.itembatches;
                  //     } else {
                  //         $scope.BatchList = [];
                  //     }
                  // }

                  $scope.WorkingQuotationMain = $scope.lstSelectedQuotationMain[$scope.lstSelectedQuotationMain.length - 1];

                  // AssignQuotationMainClickEvent();

                  // setTimeout(function () {
                  //     $scope.SelectQuotationMainRaw(0);
                  // })
            }

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
                        $http.get($rootScope.RoutePath + 'quotation/DeleteQuotation', {
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
                  id: 0,
                  DocNo: '',
                  QuotationDate: moment().format('YYYY-MM-DD'),
                  CustomerCode: '',
                  CustomerName: '',
                  Ref: null,
                  Description: null,
                  UserCode: $localstorage.get('CustomerGroupId'),
                  Address1: null,
                  Address2: null,
                  Address3: null,
                  PhoneNumber: null,
                  Fax: null,
                  Attentions: null,
                  BranchCode: null,
                  DeliverAddress1: null,
                  DeliverAddress2: null,
                  DeliverAddress3: null,
                  DeliverFax: null,
                  DeliverPhoneNumber: null,
                  Total: 0.00,
                  CurrencyCode: null,
                  CurrencyRate: null,
                  NetTotal: 0.00,
                  LocalNetTotal: 0.00,
                  Tax: 0.00,
                  LocalTax: 0.00,
                  FinalTotal: 0.00,
                  RoundAdj: 0.00,
                  idStatus: 1,
                  idLocations: $scope.CustomerGroupName == "Shop" ? '38' : $localstorage.get('DefaultLocation'),
                  DefaultLocation: '',
                  flgUOMConversation: false,
                  UOMConversationId: null,
                  IsInclusive: 0,
                  CreatedBy: parseInt($localstorage.get('UserId')),
                  CreatedDate: null,
                  ModifiedBy: null,
                  ModifiedDate: null,
                  LoginUserCode: $localstorage.get('UserCode'),
            };
            $scope.Searchmodel = {
                  Search: '',
            }
            $scope.Searchmodel1 = {
                  Search: '',
            }
            $scope.modelContainSearch = {
                  Search: ''
            }
            $scope.modelProductSearch = {
                  Search: '',
                  StartDate: moment().startOf('month').format('YYYY-MM-DD'),
                  EndDate: moment().format('YYYY-MM-DD'),
            }
            $scope.lstSelectedQuotationMain = [];
            $scope.AddQuotationMainItemInList();
            $scope.IsSave = false;
      };

      $scope.DisplayCustomerCode = function (o) {
            $scope.model.CustomerCode = DisplayCustomerCode(o.CustomerCode);
            $scope.SelectCustomer($scope.model.CustomerCode)
      }

      function DisplayCustomerCode(CustomerCode) {
            var obj = _.findWhere($scope.lstCustomer, {
                  id: parseInt(CustomerCode)
            });
            if (obj) {
                  return obj.AccountNumbder;
            } else {
                  return "";
            }
      }

      $scope.FilterData = function () {
            $('#QuotationTable').dataTable().api().ajax.reload();
      }

      $scope.EnableFilterOption = function () {
            $(function () {
                  $(".CustFilter").slideToggle();
            });
      };

      $scope.FilterAdvanceData = function (o) {
            $scope.modelAdvanceSearch = o;
            $('#QuotationTable').dataTable().api().ajax.reload();
      }

      //Set Table
      function InitDataTable() {
            if ($.fn.DataTable.isDataTable('#QuotationTable')) {
                  $('#QuotationTable').DataTable().destroy();
            }
            $('#QuotationTable').DataTable({
                  "processing": true,
                  "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                  "serverSide": true,
                  "responsive": true,
                  "aaSorting": [1, 'DESC'],
                  "ajax": {
                        url: $rootScope.RoutePath + 'quotation/GetAllQuotationDynamic',
                        data: function (d) {
                              if ($scope.Searchmodel.Search != undefined) {
                                    d.search = $scope.Searchmodel.Search;
                              }
                              d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                              d.UserCode = $scope.model.UserCode;
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
                  "columns": [{
                              "data": null,
                              "sortable": false
                        },
                        {
                              "data": "DocNo",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "QuotationDate",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "CustomerCode",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "CustomerName",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Description",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "BranchCode",
                              "defaultContent": "N/A"
                        },
                        // { "data": "Total", "defaultContent": "N/A" },
                        // { "data": "Tax", "defaultContent": "N/A" },
                        // { "data": "FinalTotal", "defaultContent": "N/A" },
                        {
                              "data": "tblstatus.Status",
                              "defaultContent": "N/A",
                              "sortable": false
                        },
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
                        }, {
                              "render": function (data, type, row) {
                                    if (data != null && data != undefined && data != '') {
                                          var val = parseFloat(data);
                                          return val.toFixed(2);
                                    } else {
                                          return 0;
                                    }
                              },

                              // "targets": [7, 8, 9],
                              className: "right-aligned-cell"
                        },
                        {
                              "render": function (data, type, row) {
                                    return moment(data).format('DD-MM-YYYY');
                              },
                              "targets": 2
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

                              "targets": 5
                        },
                        {
                              "render": function (data, type, row) {
                                    row.CustomerCode = row.CustomerCode ? row.CustomerCode : null;
                                    var Action = '<div layout="row" layout-align="center center">';
                                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                                    Action += '<a ng-click="DeleteItem(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>&nbsp;';
                                    //Action += '<a ng-click="GeneratePdf(' + row.id + ')" class="btnAction btnAction-info" style="cursor:pointer"><i class="ion-document-text" title="PDF"></i></a>&nbsp;';
                                    Action += '<a ng-click="GenerateReport(' + row.id + ')" class="btnAction btnAction-info" style="cursor:pointer"><i class="ion-document-text" title="Document"></i></a>&nbsp;';
                                    Action += '<a ng-click="SendquotationEmail(' + row.id + ',' + row.CustomerCode + ')" class="btnAction btnAction-info" style="cursor:pointer"><i class="ion-email" title="Email"></i></a>&nbsp;';
                                    if (row.idStatus == 1 && row.UserCode != $localstorage.get('CustomerGroupId')) {
                                          Action += '<button ng-click="SaveSale(' + row.id + ')"  class="cBtn cBtn-green" style="cursor:pointer">Create Sale</button>&nbsp;';

                                    }
                                    if (row.idStatus != 4 && row.UserCode != $localstorage.get('CustomerGroupId')) {
                                          Action += '<button ng-click="ChangeStatusReject(' + row.id + ')" class="cBtn cBtn-skyblue" style="cursor:pointer">Reject</button>&nbsp;';
                                    }
                                    Action += '</div>';
                                    return Action;
                              },
                              "targets": 8
                        }
                  ]
            });
      }


      $scope.GenerateReport = function (Id) {
            window.open($rootScope.RoutePath + "invoice/GenerateInvoice?Id=" + Id, '_blank');
      }

      // Alias
      $rootScope.ResetAll = $scope.init;
      $scope.ValidateMobileNumber = function () {
            if (!$("#PhoneNumber").intlTelInput("isValidNumber")) {
                  $scope.isValidMobile = true
                  if ($scope.model.PhoneNumber.toString().length <= 2) {
                        $scope.isValidMobile = false
                  }
            } else {
                  $scope.isValidMobile = false
            }
      }

      $scope.ValidateMobileNumber2 = function () {
            if (!$("#DeliverPhoneNumber").intlTelInput("isValidNumber")) {
                  $scope.isValidMobile2 = true
                  if ($scope.model.DeliverPhoneNumber.toString().length <= 2) {
                        $scope.isValidMobile2 = false
                  }
            } else {
                  $scope.isValidMobile2 = false
            }
      }

      //Save Sales
      $scope.SaveSale = function (id) {
            $rootScope.QuationId = id;
            $state.go('app.Sales')
            // if (id != null) {
            //     var ObjQuotation = _.findWhere($scope.lstdata, { id: id });
            //     for (var prop in $scope.model) {
            //         $scope.model[prop] = ObjQuotation[prop];
            //         if (prop == 'id' || prop == 'DocNo') {
            //             $scope.model[prop] = 0;
            //         }
            //         if (prop == 'idLocations') {
            //             $scope.model['idLocations'] = $localstorage.get('DefaultLocation');
            //         }
            //         if (prop == 'InvoiceDate') {
            //             $scope.model['InvoiceDate'] = moment(ObjQuotation[prop]).format('YYYY-MM-DD');
            //         }
            //         if (prop == 'CreatedBy') {
            //             $scope.model['CreatedBy'] = parseInt($localstorage.get('UserId'));
            //         }
            //         if (prop == 'CreatedDate' || prop == 'ModifiedBy' || prop == 'ModifiedDate') {
            //             $scope.model[prop] = null;
            //         }
            //     }
            //     var Obj = angular.copy(ObjQuotation);

            //     $scope.model.idQuotation = id;
            //     _.filter(Obj.quotationdetails, function (p) {
            //         p.id = null;
            //         p.idInvoice = null;
            //         p.LastBalQty = 0;
            //         p.LastBatchNo = null;
            //         p.LastLocation = null;
            //         p.LastItemCode = null;
            //         p.LastUOM = null;
            //     })

            //     $scope.model.quotationdetails = Obj.quotationdetails;
            // }

            // $http.post($rootScope.RoutePath + 'quotation/SaveInvoice', $scope.model)
            //     .then(function (res) {
            //         var ResponseSales = res.data;
            //         if (ResponseSales.success) {
            //             $ionicLoading.show({ template: ResponseSales.message });
            //             $scope.UpdateId = null;
            //             setTimeout(function () {
            //                 $ionicLoading.hide()
            //             }, 1000);
            //             $scope.init();
            //         } else {
            //             if (ResponseSales.CanConvert) {
            //                 var confirmPopup = $ionicPopup.confirm({
            //                     title: "",
            //                     template: 'Some of the item(s) in back order leval,do you want to do UOM conversion for thoes item(s)?',
            //                     cssClass: 'custPop',
            //                     cancelText: 'Cancel',
            //                     okText: 'Ok',
            //                     okType: 'btn btn-green',
            //                     cancelType: 'btn btn-red',
            //                 })
            //                 confirmPopup.then(function (resmodal) {
            //                     if (resmodal) {
            //                         $scope.UpdateId = ObjQuotation.id;
            //                         var objUOM = _.findWhere(Obj.quotationdetails, { ItemCode: ResponseSales.data.ItemCode });
            //                         objUOM.FromQty = ResponseSales.data.FromQty;
            //                         objUOM.FromRate = ResponseSales.data.FromRate;
            //                         objUOM.FromUOM = ResponseSales.data.FromUOM;
            //                         objUOM.ToUOM = ResponseSales.data.ToUOM;
            //                         objUOM.ToRate = ResponseSales.data.ToRate;
            //                         $scope.InitUOMFunction(objUOM);
            //                     }
            //                 });
            //             } else {
            //                 $ionicLoading.show({ template: ResponseSales.message });
            //                 setTimeout(function () {
            //                     $ionicLoading.hide()
            //                 }, 1000);
            //             }
            //         }

            //     })
            //     .catch(function (err) {
            //         $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
            //         setTimeout(function () {
            //             $ionicLoading.hide()
            //         }, 1000);
            //     });
      };

      //Change status to Reject
      $scope.ChangeStatusReject = function (id) {
            var Obj = {
                  id: id,
                  Status: 4
            }
            $http.post($rootScope.RoutePath + 'quotation/UpdateStatus', Obj)
                  .then(function (res) {
                        var Response = res.data;
                        if (Response.success) {
                              $ionicLoading.show({
                                    template: Response.message
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 1000);
                              $scope.init();
                        } else {
                              $ionicLoading.show({
                                    template: Response.message
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

      //Generate Pdf
      $scope.GeneratePdf = function (id) {
            var Param = "?id=" + id
            window.open($rootScope.RoutePath + "quotation/GeneratePdf" + Param);
      }

      $scope.SendquotationEmail = function (id, customercode) {
            var customerobj = _.findWhere($scope.lstCustomer, {
                  AccountNumbder: customercode.toString()
            })
            var params = {
                  id: id,
                  email: customerobj.EmailAddress
            }
            $http.get($rootScope.RoutePath + 'quotation/SendquotationEmail', {
                  params: params
            }).then(function (res) {
                  $ionicLoading.show({
                        template: res.data.message
                  });
                  setTimeout(function () {
                        $ionicLoading.hide()
                  }, 1000);
            });
      }

      $scope.ChangeInclusivePrice = function () {
            if ($scope.lstSelectedQuotationMain.length > 0) {
                  if ($scope.model.IsInclusive) {
                        for (var i = 0; i < $scope.lstSelectedQuotationMain.length; i++) {
                              if ($scope.lstSelectedQuotationMain[i].TaxRate != 0) {
                                    $scope.lstSelectedQuotationMain[i].Price = parseFloat($scope.lstSelectedQuotationMain[i].Price) / (($scope.lstSelectedQuotationMain[i].TaxRate / 100) + 1);
                                    if ($scope.lstSelectedQuotationMain[i].Qty != null) {
                                          $scope.lstSelectedQuotationMain[i].Total = ($scope.lstSelectedQuotationMain[i].Qty * parseFloat($scope.lstSelectedQuotationMain[i].Price)) - $scope.lstSelectedQuotationMain[i].DiscountAmount;
                                          $scope.lstSelectedQuotationMain[i].Tax = $scope.lstSelectedQuotationMain[i].LocalTax = ($scope.lstSelectedQuotationMain[i].Total * $scope.lstSelectedQuotationMain[i].TaxRate) / 100;
                                          $scope.lstSelectedQuotationMain[i].FinalTotal = $scope.lstSelectedQuotationMain[i].NetTotal = $scope.lstSelectedQuotationMain[i].LocalNetTotal = $scope.lstSelectedQuotationMain[i].Total + $scope.lstSelectedQuotationMain[i].Tax;
                                    } else {
                                          $scope.lstSelectedQuotationMain[i].Price = 0.00;
                                          $scope.lstSelectedQuotationMain[i].Total = 0.00;
                                          $scope.lstSelectedQuotationMain[i].FinalTotal = $scope.lstSelectedQuotationMain[i].NetTotal = $scope.lstSelectedQuotationMain[i].LocalNetTotal = 0.00;
                                    }
                                    AdjustFinalQuotationTotal();
                              }
                        }
                  } else {
                        for (var i = 0; i < $scope.lstSelectedQuotationMain.length; i++) {
                              if ($scope.lstSelectedQuotationMain[i].TaxRate != 0) {
                                    $scope.lstSelectedQuotationMain[i].Price = parseFloat($scope.lstSelectedQuotationMain[i].Price) * (($scope.lstSelectedQuotationMain[i].TaxRate / 100) + 1);
                                    if ($scope.lstSelectedQuotationMain[i].Qty != null) {
                                          $scope.lstSelectedQuotationMain[i].Total = ($scope.lstSelectedQuotationMain[i].Qty * parseFloat($scope.lstSelectedQuotationMain[i].Price)) - $scope.lstSelectedQuotationMain[i].DiscountAmount;
                                          $scope.lstSelectedQuotationMain[i].Tax = $scope.lstSelectedQuotationMain[i].LocalTax = ($scope.lstSelectedQuotationMain[i].Total * $scope.lstSelectedQuotationMain[i].TaxRate) / 100;
                                          $scope.lstSelectedQuotationMain[i].FinalTotal = $scope.lstSelectedQuotationMain[i].NetTotal = $scope.lstSelectedQuotationMain[i].LocalNetTotal = $scope.lstSelectedQuotationMain[i].Total + $scope.lstSelectedQuotationMain[i].Tax;
                                    } else {
                                          $scope.lstSelectedQuotationMain[i].Price = 0.00;
                                          $scope.lstSelectedQuotationMain[i].Total = 0.00;
                                          $scope.lstSelectedQuotationMain[i].FinalTotal = $scope.lstSelectedQuotationMain[i].NetTotal = $scope.lstSelectedQuotationMain[i].LocalNetTotal = 0.00;
                                    }
                                    AdjustFinalQuotationTotal();
                              }
                        }
                  }
            }
      }


      //  *******************************************************UOM Converstion********************************************************
      //UOM Converstion Model
      $ionicModal.fromTemplateUrl('UomConverstionModel.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {
            $scope.modal = modal;
      });

      $scope.OpenUOMModal = function () {
            $scope.modal.show();
      };

      $scope.closeModal = function () {
            $scope.modal.hide();
      }; // Cleanup the modal when we're done with it!

      $scope.$on('$destroy', function () {
            $scope.modal.remove();
      })


      $scope.getAllUserLoaction = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
            }
            $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', {
                  params: params
            }).then(function (res) {
                  $scope.lstLocation = res.data.data;

            });
      };

      $scope.InitUOMFunction = function (objUOM) {
            $scope.MainUOM = {
                  id: null,
                  DocDate: moment().format('DD-MM-YYYY'),
                  Description: 'UOM Conversion Generated From',
                  Note: '',
                  FromDocType: 'SI',
                  FromDocKey: null,
                  FromDocNo: '',
            }
            $scope.SelectedTabUOM = 1;
            $scope.lstSelectedUOM = [];
            $scope.UOMModel = {
                  id: null,
                  ItemCode: objUOM.ItemCode,
                  description: '',
                  Location: (objUOM.idLocations).toString(),
                  BatchNo: objUOM.BatchNo,
                  ProjNo: null,
                  FromQty: objUOM.FromQty,
                  ToQty: null,
                  FromUOM: objUOM.FromUOM,
                  ToUom: objUOM.ToUOM,
                  IsEdit: true,
                  LastBalQty: 0,
                  LastBatchNo: null,
                  LastLocation: null,
                  LastItemCode: null,
                  LastUOM: null,
                  lstUOM: [],
                  lstBatch: [],
            }
            $scope.GetAllItemBachNo($scope.UOMModel, true);
            $scope.UOMModel.ToQty = parseInt((parseFloat(objUOM.FromQty) * parseFloat(objUOM.FromRate)) / parseFloat(objUOM.ToRate));
            $scope.lstSelectedUOM.push($scope.UOMModel);
            $scope.WorkingUOM = $scope.UOMModel;

            // AssignClickEventBatch();
            // setTimeout(function () {
            //     $scope.SelectRaw($scope.lstSelectedUOM.length - 1);
            // })

            $scope.OpenUOMModal();
      }

      $scope.ChangeTabUOM = function (number) {
            $scope.SelectedTabUOM = number;
      }

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
                              $ionicLoading.show({
                                    template: "Please select another FromUOM ,this FromUOM already selected"
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 1000);
                        }
                  }
                  if (item.ToUom != null && item.FromUOM != null && item.FromQty != null) {
                        $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + item.ItemCode).then(function (res) {
                              $scope.lstItems = res.data.data;
                              var obj = _.findWhere($scope.lstItems, {
                                    ItemCode: item.ItemCode
                              });
                              var FromPrice = _.findWhere(obj.itemuoms, {
                                    UOM: item.FromUOM
                              }).Rate;
                              var ToPrice = _.findWhere(obj.itemuoms, {
                                    UOM: item.ToUom
                              }).Rate;
                              item.ToQty = parseInt((parseFloat(item.FromQty) * parseFloat(FromPrice)) / parseFloat(ToPrice));
                        })
                  }
                  if (item.FromQty == null) {
                        item.ToQty = null;
                  }
            }
      }

      $scope.AddUOMItemInList = function () {
            if ($scope.lstSelectedUOM.length > 0 && $scope.lstSelectedUOM[$scope.lstSelectedUOM.length - 1].ItemCode == null) {
                  $ionicLoading.show({
                        template: "Select Item Code"
                  });
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
            $scope.GetAllItemBachNo($scope.WorkingUOM, true);

            // AssignClickEventBatch();

            // setTimeout(function () {
            //     $scope.SelectRaw($scope.lstSelectedUOM.length - 1);
            // })
      }

      $scope.formUOMsubmit = false;
      $scope.SaveItem = function (form) {
            if (form.$invalid) {
                  $scope.formUOMsubmit = true;
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
                        var obj = {
                              objconv: $scope.MainUOM,
                              objitem: $scope.lstSelectedUOM
                        }
                        if (new Date($scope.MainUOM.DocDate) == 'Invalid Date') {
                              obj.objconv.DocDate = moment().set({
                                    'date': $scope.MainUOM.DocDate.split('-')[0],
                                    'month': $scope.MainUOM.DocDate.split('-')[1] - 1,
                                    'year': $scope.MainUOM.DocDate.split('-')[2]
                              }).format('YYYY-MM-DD');
                        } else {
                              if (moment(obj.objconv.DocDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                                    obj.objconv.DocDate = moment(new Date($scope.MainUOM.DocDate)).format('YYYY-MM-DD');
                              } else {
                                    obj.objconv.DocDate = moment($scope.MainUOM.DocDate).format('YYYY-MM-DD');
                              }
                        }
                        $rootScope.ShowLoader();
                        $http.post($rootScope.RoutePath + 'uomconv/SaveUomconv', obj).then(function (res) {
                              $scope.formUOMsubmit = false;
                              if (res.data.success) {
                                    $scope.closeModal();
                              }
                              $scope.model.flgUOMConversation = true;
                              $scope.model.UOMConversationId = res.data.data;
                              $scope.SaveSale(null);

                        }).catch(function (err) {
                              $ionicLoading.show({
                                    template: 'Unable to save record right now. Please try again later.'
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 1000);
                        });
                  }
            }
      }

      $scope.RemoveUOMItemInList = function (index) {
            // $scope.lstSelectedUOM = _.filter($scope.lstSelectedUOM, function (item) {
            //     return (item.ItemCode != o.ItemCode || item.FromUOM != o.FromUOM);
            // });
            $scope.lstSelectedUOM.splice(index, 1);
            if ($scope.lstSelectedUOM.length == 0) {
                  $scope.AddUOMItemInList();
            }
            $scope.WorkingUOM = null;

            // AssignClickEventBatch();

            // setTimeout(function () {
            //     $scope.SelectRaw(0);
            // })
      }


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


      $scope.SelectRaw = function (index) {
            $("#tblUOMConv tr[accessKey='" + index + "']").trigger("click");
      }


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
            $scope.lstBatch = [];
            if (o.ItemCode != '' && o.ItemCode != null && o.ItemCode != undefined) {
                  $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + o.ItemCode).then(function (res) {
                        $scope.lstItems = res.data.data;
                        var obj = _.findWhere($scope.lstItems, {
                              ItemCode: (o.ItemCode).toString()
                        });
                        // $scope.lstBatch = obj.itembatches;
                        // $scope.lstUOM = obj.itemuoms;

                        o.lstBatch = obj.itembatches;
                        o.lstUOM = obj.itemuoms;
                  })
            }
      }

      //  *******************************************************End UOM Converstion********************************************************

      $scope.Add = function () {
            $scope.GetInvoiceDocNo();
            $scope.formsubmit = false;
            $rootScope.BackButton = $scope.IsList = false;
      }

      $scope.GetInvoiceDocNo = function () {
            $http.get($rootScope.RoutePath + 'quotation/GetQuotationDocNo?LoginUserCode=' + $localstorage.get('UserCode')).then(function (res) {
                  $scope.model.DocNo = res.data;
            });
      }

      // Anil Start
      $ionicModal.fromTemplateUrl('ItemCode.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {

            $scope.modal = modal;
      });

      $scope.OpenModelItemCode = function (ItemIndex) {
            $localstorage.set('ItemIndex', ItemIndex)
            $scope.modal.show();
            setTimeout(function () {
                  InitDataTable1();
            })
      };

      $scope.closeModal = function () {
            $scope.modal.hide();
      };

      $scope.FilterData1 = function () {
            $('#ItemTable').dataTable().api().ajax.reload();

      }

      $scope.SelectItemCode = function (id) {
            $scope.modal.hide();
            var SelectedItemCode = $scope.lstdata.find(function (item) {
                  return item.id == id;
            });
            $scope.lstSelectedQuotationMain[$localstorage.get('ItemIndex')].ItemCode = SelectedItemCode.ItemCode;
            $scope.AddItemCode($scope.lstSelectedQuotationMain[$localstorage.get('ItemIndex')])
      }

      function InitDataTable1() {
            if ($.fn.DataTable.isDataTable('#ItemTable')) {
                  $('#ItemTable').DataTable().destroy();
            }
            $('#ItemTable').DataTable({
                  "processing": true,
                  "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                  "serverSide": true,
                  "responsive": true,
                  "aaSorting": [
                        [1, 'DESC'],
                  ],
                  "ajax": {
                        // url: $rootScope.RoutePath + 'item/GetAllItemDynamic',
                        url: $rootScope.RoutePath + 'item/GetAllItemDynamicFilter',
                        data: function (d) {
                              if ($scope.Searchmodel1.Search != undefined) {
                                    d.search = $scope.Searchmodel1.Search;
                              }
                              $scope.order = d.order;
                              $scope.columns = d.columns;
                              d.CustGroupName = $scope.CustomerGroupName == 'Genmed' ? null : $scope.CustomerGroupName

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
                              "data": "ItemName",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "ItemCode",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Descriptions",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "subbrand.SubBrandName",
                              "defaultContent": "N/A"
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
                              "targets": 3,
                              "targets": 4,
                        },
                        {
                              "render": function (data, type, row) {
                                    var Action = '<div layout="row" layout-align="center center">';
                                    Action += '<a ng-click="SelectItemCode(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                                    Action += '</div>';
                                    return Action;
                              },
                              "targets": 5,
                        },
                  ]
            });
      }

      // Anil end



      function getSalesPurchaseRate(o) {
            var SaleUOM = _.findWhere(o.listUOM, {
                  UOM: o.SaleUOM
            });
            var uomqun = SaleUOM.UOM == o.UOM ? 1 : SaleUOM.Rate
            var purchaseprice = 0;
            var batch = null;
            if (o.BatchNo) {
                  batch = _.findWhere(o.BatchList, {
                        BatchNumber: o.BatchNo
                  });
                  purchaseprice = batch.SalesRate / ((o.TaxRate / 100) + 1);
            } else {
                  purchaseprice = parseFloat(o.Price) / ((o.TaxRate / 100) + 1);
            }

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

            var ShopSalesRate = purchaseprice;
            var ShopPurchaseRate = purchaseprice - ((purchaseprice * Shop.Percentage) / 100);
            var ShopPercentage = (purchaseprice * Shop.Percentage) / 100;

            var StockHolderSalesRate = ShopPurchaseRate;
            var StockHolderPurchaseRate = parseFloat(ShopPurchaseRate) - ((parseFloat(ShopPurchaseRate) * StockHolder.Percentage) / 100);
            var StockHolderPercentage = (parseFloat(ShopPurchaseRate) * StockHolder.Percentage) / 100;

            var GenmedSalesRate = StockHolderPurchaseRate;
            var GenmedPurchaseRate = o.BatchNo ? batch.SalesRate : parseFloat(o.Price);

            var CustomerSalePrice = o.BatchNo ? (batch.SalesRate / uomqun) / ((o.TaxRate / 100) + 1) : purchaseprice


            var obj = {
                  ShopSalesRate: ShopSalesRate,
                  ShopPurchaseRate: ShopPurchaseRate,
                  ShopPercentage: o.BatchNo ? ShopPercentage : 0,
                  StockHolderSalesRate: StockHolderSalesRate,
                  StockHolderPurchaseRate: StockHolderPurchaseRate,
                  StockHolderPercentage: o.BatchNo ? StockHolderPercentage : 0,
                  GenmedSalesRate: GenmedSalesRate,
                  GenmedPurchaseRate: GenmedPurchaseRate,
                  CustomerSalePrice: CustomerSalePrice
            }
            return obj;

      }

      function getSalesPurchaseRate1(o) {
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

            var TaxObj = _.findWhere($scope.lstTaxCode, {
                  TaxType: o.SupplyTaxCode
            });
            if (TaxObj) {
                  purchaseprice = purchaseprice / ((TaxObj.TaxRate / 100) + 1);
            }
            console.log(o)
            var objStock = _.findWhere(o.itembatchbalqties, {
                  UOM: o.SalesUOM,
                  Location: LocationUser
            });

            Shop.SaleRate = UOMPrice ? UOMPrice.MinSalePrice : purchaseprice;;
            Shop.PurchaseRate = purchaseprice - ((purchaseprice * Shop.Percentage) / 100);
            Shop.MRP = UOMPrice ? UOMPrice.MRP : purchaseprice;

            StockHolder.SaleRate = Shop.PurchaseRate;
            StockHolder.PurchaseRate = parseFloat(Shop.PurchaseRate) - ((parseFloat(Shop.PurchaseRate) * StockHolder.Percentage) / 100);
            StockHolder.MRP = Shop.PurchaseRate;

            Genmed.SaleRate = purchaseprice;
            Genmed.PurchaseRate = UOMPrice.MinPurchasePrice;
            Genmed.MRP = UOMPrice.MRP;
            Genmed.Percentage = ((StockHolder.PurchaseRate - UOMPrice.MinPurchasePrice) * 100) / StockHolder.PurchaseRate;

            Customer.SaleRate = UOMPrice.MRP;
            Customer.PurchaseRate = purchaseprice;
            Customer.MRP = UOMPrice.MRP;
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

      $scope.GetItem = function (o) {
            $http.get($rootScope.RoutePath + 'item/GetItemByBatch?Barcode=' + o.Barcode).then(function (res) {
                  let BatchGet = res.data;
                  if (BatchGet) {
                        o.BatchNo = BatchGet.BatchNumber;
                        o.isBatch = true;
                        o.ItemCode = BatchGet.ItemCode;
                        o.Qty = 1;
                        $scope.AddItemCode(o);
                  }
            });
      }
      $(document).keyup(function (e) {
            if (e.key === "Escape") {
                  $scope.closeModal();
            }
      });

      $scope.init();

});