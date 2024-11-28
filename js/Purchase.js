app.controller('PurchaseController', function ($scope, $rootScope, $http, $ionicModal, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

      $scope.init = function () {
            setTimeout(() => {
                  $("#mytext").focus();
            }, 1000);
            $scope.modelAdvanceSearch = null;
            ManageRole();
            $scope.ResetModel();
            $scope.GetAllBranch();
            // $scope.GetAllItem();
            $scope.GetAllLocation();
            //   $scope.GetAllUOM();
            $scope.GetAllTaxCode();
            $scope.GetAllCurrency();
            $scope.GetAllCurrencyRate();
            $scope.GetAllActiveCustomerGroup();
            $scope.CurrentCustomerGroup = $localstorage.get('CustomerGroup')
            $scope.GenmedFlag = false;
            if ($scope.CurrentCustomerGroup == "Genmed") {
                  $scope.Type = "Supplier"
                  $scope.FlagLocation = true
                  $scope.FlagDisc = true
                  $scope.FlagTax = true;
                  $scope.GenmedFlag = true;
            } else {
                  $scope.Type = ''
            }
            $scope.GetAllCustomer();
            $scope.tab = {
                  selectedIndex: 0
            };
            $rootScope.BackButton = $scope.IsList = true;
            $scope.SelectedTab = 1;
            setTimeout(function () {
                  InitDataTable();
            })
            $scope.isValidMobile = false
            $scope.isValidMobile2 = false;
            $scope.lstFilteredCustomerbyName = [];
            $scope.lstFilteredCustomerbyMob = [];
      };

      function ManageRole() {
            var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
                  return Role == "Admin";
            })
            $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
      }

      $scope.ChangeTab = function (number) {
            $scope.SelectedTab = number;
            if ($scope.SelectedTab == 2) {
                  setTimeout(function () {
                        $("#PhoneNumber").intlTelInput({
                              utilsScript: "lib/intl/js/utils.js"
                        });
                        $("#DeliverPhoneNumber").intlTelInput({
                              utilsScript: "lib/intl/js/utils.js"
                        });
                  }, 500)
            }
            // else {
            //     AssignPurchaseMainClickEvent();

            //     setTimeout(function () {
            //         $scope.SelectPurchaseMainRaw(0);
            //     })
            // }
      }
      $scope.GetAllCustomer = function () {
            $http.get($rootScope.RoutePath + 'customer/GetAllSupplierNew?Type=' + $scope.Type).then(function (res) {
                  $scope.lstCustomer = res.data.data;
            });
      };

      $scope.GetAllBranch = function () {
            $http.get($rootScope.RoutePath + 'customerBranch/GetAllCustomerbranch').then(function (res) {
                  $scope.lstBranch = res.data.data;
            });
      };

      $scope.FilteredCustomerbyName = function () {
            if ($scope.model.CustomerName != '' && $scope.model.CustomerName != null && $scope.model.CustomerName != undefined) {
                  $scope.lstFilteredCustomerbyName = _.filter($scope.lstCustomer, function (item) {
                        if (item.Name.toLowerCase().indexOf($scope.model.CustomerName.toLowerCase()) !== -1) {
                              return item
                        }
                  })
            } else {
                  $scope.lstFilteredCustomerbyName = []
            }
      }

      $scope.FilteredCustomerbyMob = function () {
            $scope.lstFilteredCustomerbyMob = _.filter($scope.lstCustomer, function (item) {
                  if (item.PhoneNumber.indexOf($scope.model.PhoneNumber) !== -1) {
                        return item
                  }
            })
      }

      $scope.GetAllItem = function () {
            $http.get($rootScope.RoutePath + 'item/GetAllItem').then(function (res) {
                  $scope.lstItems = res.data.data;
                  console.log($scope.lstItems);

            });
      };

      $scope.GetAllItemSearch = function (o) {
            _.filter($scope.lstSelectedPurchaseMain, function (item) {
                  item.IsEdit = false;
            });
            o.IsEdit = true;
            if (o.ItemName) {
                  var params = {
                        ItemName: o.ItemName,
                        CustGroupName: $scope.CurrentCustomerGroup == 'Genmed' ? null : $scope.CurrentCustomerGroup
                  }
                  console.log(params);
                  $http.get($rootScope.RoutePath + 'item/GetAllItemBySearchText', {
                        params: params
                  }).then(function (res) {
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
                                          } else {
                                                console.log(li.eq(0))
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
                                          console.log(parseInt($('.autosearch.selected').attr('id')), $scope.lstItemsSearch)
                                          var find = _.findWhere($scope.lstItemsSearch, {
                                                id: parseInt($('.autosearch.selected').attr('id'))
                                          });
                                          console.log(find)
                                          if (find) {
                                                $scope.AddItemCode($scope.lstSelectedPurchaseMain[$scope.lstSelectedPurchaseMain.length - 1], find);
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
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
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

      // $scope.PreventMobileNumber = function() {
      //     if ($scope.model.PhoneNumber.toString().length > 15) {
      //         $scope.model.PhoneNumber = parseInt($scope.model.PhoneNumber.toString().substring(0, 15));
      //     }
      // }

      $scope.PreventMobileNumber2 = function () {
            if ($scope.model.DeliverPhoneNumber.toString().length > 15) {
                  $scope.model.DeliverPhoneNumber = parseInt($scope.model.DeliverPhoneNumber.toString().substring(0, 15));
            }
      }

      $scope.GetAllCurrency = function () {
            $http.get($rootScope.RoutePath + 'currency/GetAllCurrency').then(function (res) {
                  $scope.lstCurrency = res.data.data;
                  $scope.model.CurrencyCode = $scope.lstCurrency[0].CurrencyCode
                  $scope.TotalRecord = $scope.lstCurrency.length;
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

      $scope.SelectCustomer = function (o, type) {
            var obj = ''
            if (type == "phone") {
                  obj = _.findWhere($scope.lstCustomer, {
                        PhoneNumber: o.PhoneNumber
                  });
                  $scope.lstFilteredCustomerbyMob = []
                  if (obj) {
                        $scope.model.CustomerCode = obj.AccountNumbder
                  }
            } else if (type == "name") {
                  obj = _.findWhere($scope.lstCustomer, {
                        Name: o.Name
                  });
                  $scope.lstFilteredCustomerbyName = []
                  if (obj) {
                        $scope.model.CustomerCode = obj.AccountNumbder
                  }
            } else {
                  obj = _.findWhere($scope.lstCustomer, {
                        AccountNumbder: o
                  });
            }
            if (obj) {
                  console.log(obj)
                  $scope.model.CustomerName = obj.Name;
                  $scope.model.PhoneNumber = obj.PhoneNumber
                  $scope.model.Address1 = obj.BillingAddress1;
                  $scope.model.Address2 = obj.BillingAddress2;
                  $scope.model.DrugLicNo = obj.DrugLicNo;
                  if (obj.customerbranch) {
                        $scope.model.BranchCode = obj.customerbranch.Name;
                  }
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

                  if (obj.IsIGST == 1 || obj.IsIGST == true) {
                        $scope.GetIGSTInvoiceDocNo();
                  } else {
                        $scope.GetInvoiceDocNo();
                  }
            } else {
                  $scope.model.CurrencyCode = "";
                  $scope.model.CurrencyRate = "";
            }
      }


      function move(arr, old_index, new_index) {
            while (old_index < 0) {
                  old_index += arr.length;
            }
            while (new_index < 0) {
                  new_index += arr.length;
            }
            if (new_index >= arr.length) {
                  var k = new_index - arr.length;
                  while ((k--) + 1) {
                        arr.push(undefined);
                  }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr;
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
                        $scope.model.CurrencyRate = obj.BuyRate;
                  } else {
                        var obj = _.findWhere($scope.lstCurrency, {
                              CurrencyCode: CurrencyCode
                        });
                        if (obj != null && obj != '' && obj != undefined) {
                              $scope.model.CurrencyCode = obj.CurrencyCode;
                              $scope.model.CurrencyRate = obj.BuyRate;
                        } else {
                              //for default currency
                              $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, {
                                    isDefault: 1
                              }).CurrencyCode;
                              $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, {
                                    CurrencyCode: $scope.model.CurrencyCode
                              }).BuyRate;
                        }
                  }
            } else {
                  var obj = _.findWhere($scope.lstCurrency, {
                        CurrencyCode: CurrencyCode
                  });
                  if (obj != null && obj != '' && obj != undefined) {
                        $scope.model.CurrencyCode = obj.CurrencyCode;
                        $scope.model.CurrencyRate = obj.BuyRate;
                  } else {
                        //for default currency
                        $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, {
                              isDefault: 1
                        }).CurrencyCode;
                        $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, {
                              CurrencyCode: $scope.model.CurrencyCode
                        }).BuyRate;
                  }
            }
      }


      $scope.ChangeLocation = function () {
            if ($scope.lstSelectedPurchaseMain.length > 0) {
                  var confirmPopup = $ionicPopup.confirm({
                        title: "",
                        template: 'Are you sure you want to change locations of all purchase?',
                        cssClass: 'custPop',
                        cancelText: 'Cancel',
                        okText: 'Ok',
                        okType: 'btn btn-green',
                        cancelType: 'btn btn-red',
                  })
                  confirmPopup.then(function (res) {
                        if (res) {
                              if ($scope.lstSelectedPurchaseMain.length > 0) {
                                    for (var i = 0; i < $scope.lstSelectedPurchaseMain.length; i++) {
                                          $scope.lstSelectedPurchaseMain[i].idLocations = parseInt($scope.model.idLocations);
                                          $scope.lstSelectedPurchaseMain[i].DisplayLocation = _.findWhere($scope.lstLocations, {
                                                id: parseInt($scope.model.idLocations)
                                          }).Name;
                                    }
                              }
                              $scope.PurchaseMainModel.idLocations = $scope.model.idLocations;
                              var obj = _.findWhere($scope.lstLocations, {
                                    id: parseInt($scope.model.idLocations)
                              });
                              if (obj) {
                                    $scope.model.DefaultLocation = obj.Name;
                              }

                        } else {
                              $scope.model.idLocations = $localstorage.get('DefaultLocation');
                              var obj = _.findWhere($scope.lstLocations, {
                                    id: parseInt($scope.model.idLocations)
                              });
                              if (obj) {
                                    $scope.model.DefaultLocation = obj.Name;
                              }
                        }
                  })
            } else {
                  var obj = _.findWhere($scope.lstLocations, {
                        id: parseInt($scope.model.idLocations)
                  });
                  if (obj) {
                        $scope.model.DefaultLocation = obj.Name;
                  }
            }
      }

      //Start Main Purchase Tab

      //add Purchase main item in list
      $scope.AddPurchaseMainItemInList = function () {
            // if ($scope.WorkingPurchaseMain != undefined && $scope.WorkingPurchaseMain.ItemCode == '') {
            //     $ionicLoading.show({ template: "Fill Data" });
            //     setTimeout(function () {
            //         $ionicLoading.hide()
            //     }, 1000);
            //     return;
            // }
            if ($scope.lstSelectedPurchaseMain.length > 0 && $scope.lstSelectedPurchaseMain[$scope.lstSelectedPurchaseMain.length - 1].ItemCode == '') {
                  $ionicLoading.show({
                        template: "Fill Data"
                  });
                  setTimeout(function () {
                        $ionicLoading.hide()
                  }, 1000);
                  return;
            } else {
                  _.filter($scope.lstSelectedPurchaseMain, function (item) {
                        item.IsEdit = false;
                  });

                  $scope.PurchaseMainModel = {
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
                        idPurchase: null,
                        ItemCode: '',
                        idLocations: $scope.model.idLocations,
                        DisplayLocation: $scope.model.DefaultLocation,
                        BatchNo: null,
                        Descriptions: null,
                        UOM: null,
                        UserUOM: null,
                        Qty: 0,
                        FreeQty: 0,
                        Price: 0.00,
                        MRP: 0.0,
                        SaleRate: 0.0,
                        DiscountAmount: 0,
                        DiscountPercentage: 0,
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
                        ExpiryDate: null,
                        Barcode: null,
                        PurchaseUOM: null,
                        ItemName: null,
                        Descriptions2: null, //Main Company Name
                        HSNCode: null,
                        sequence: $scope.lstSelectedPurchaseMain.length + 1
                  }
                  // $scope.BatchList = [];

                  $scope.lstSelectedPurchaseMain.push($scope.PurchaseMainModel);

                  $scope.WorkingPurchaseMain = $scope.PurchaseMainModel;

                  // AssignPurchaseMainClickEvent();
                  if ($scope.GenmedFlag) {
                        setTimeout(() => {
                              $("#ItemName").focus();
                        });
                  } else {
                        setTimeout(() => {
                              $("#Barcode").focus();
                        });
                  }
                  // setTimeout(function () {
                  //     $scope.SelectPurchaseMainRaw($scope.lstSelectedPurchaseMain.length - 1);
                  // })

            }
      }

      $scope.AddPurchaseMainItemInListNew = function () {
            $scope.PurchaseMainModel = {
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
                  idPurchase: null,
                  ItemCode: '',
                  idLocations: $scope.model.idLocations,
                  DisplayLocation: $scope.model.DefaultLocation,
                  BatchNo: null,
                  Descriptions: null,
                  UOM: null,
                  UserUOM: null,
                  Qty: 0,
                  FreeQty: 0,
                  Price: 0.00,
                  MRP: 0.0,
                  SaleRate: 0.0,
                  DiscountAmount: 0,
                  DiscountPercentage: 0,
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
                  ExpiryDate: null,
                  Barcode: null,
                  PurchaseUOM: null,
                  ItemName: null,
                  Descriptions2: null, //Main Company Name
                  HSNCode: null,
                  sequence: $scope.lstSelectedPurchaseMain.length + 1
            }

            $scope.lstSelectedPurchaseMain.push($scope.PurchaseMainModel);
      }

      function AssignPurchaseMainClickEvent() {
            setTimeout(function () {
                  $("#tblPurchaseMainTable tr").unbind("click");

                  $("#tblPurchaseMainTable tr").click(function () {
                        if ($(this)[0].accessKey != "") {
                              for (var k = 0; k < $scope.lstSelectedPurchaseMain.length; k++) {
                                    $scope.lstSelectedPurchaseMain[k].IsEdit = false;
                              }

                              $("#tblPurchaseMainTable tr").removeClass("highlight");
                              $(this).addClass("highlight");

                              $scope.WorkingPurchaseMain = $scope.lstSelectedPurchaseMain[$(this)[0].accessKey];
                              $scope.WorkingPurchaseMain.IsEdit = true;
                              var obj = _.findWhere($scope.lstItems, {
                                    ItemCode: $scope.WorkingPurchaseMain.ItemCode
                              });
                              if (obj) {
                                    if (obj.isBatch == 1) {
                                          $scope.BatchList = obj.itembatches;
                                          $scope.WorkingPurchaseMain.isBatch = true;
                                    } else {
                                          $scope.BatchList = [];
                                          $scope.WorkingPurchaseMain.isBatch = false;
                                    }
                              }
                              $scope.$apply();
                        }
                  });
            })
      }

      $scope.RemovePurchaseMainItemInList = function (index) {
            // $scope.lstSelectedPurchaseMain = _.filter($scope.lstSelectedPurchaseMain, function (item) {
            //     return item.UOM != $scope.WorkingPurchaseMain.UOM || item.ItemCode != $scope.WorkingPurchaseMain.ItemCode;
            // });
            var SelectedSeq = $scope.lstSelectedPurchaseMain[index].sequence
            $scope.lstSelectedPurchaseMain.splice(index, 1);
            _.filter($scope.lstSelectedPurchaseMain, function (item) {
                  if (item.sequence > SelectedSeq) {
                        item.sequence = item.sequence - 1
                  }
            });
            if ($scope.lstSelectedPurchaseMain.length == 0) {
                  $scope.model.Total = 0.00;
                  $scope.model.NetTotal = 0.00;
                  $scope.model.LocalNetTotal = 0.00;
                  $scope.model.FinalTotal = 0.00;
                  $scope.model.Tax = 0.00;
                  $scope.model.LocalTax = 0.00;
                  $scope.AddPurchaseMainItemInList();
            } else {
                  AdjustFinalPurchaseTotal();
                  $scope.WorkingPurchaseMain = $scope.lstSelectedPurchaseMain[$scope.lstSelectedPurchaseMain.length - 1];
            }

            // $scope.WorkingPurchaseMain = null;

            // AssignPurchaseMainClickEvent();

            // setTimeout(function () {
            //     $scope.SelectPurchaseMainRaw(0);
            // })
      }

      $scope.SelectPurchaseMainRaw = function (index) {
            $("#tblPurchaseMainTable tr[accessKey='" + index + "']").trigger("click");
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

                  AdjustFinalPurchaseTotal();
            });
      };

      $scope.OpenEditItem = function (itemcode) {
            var url = $state.href("app.ProductList", {
                  itemcode: itemcode
            });
            window.open(url, '_blank');
      }
      $scope.AddPrice = function (o) {
            $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + o.ItemCode).then(function (res) {
                  $scope.lstItems = res.data.data;
                  // var obj = _.findWhere($scope.lstItems, { ItemCode: o.ItemCode });
                  // if (obj) {
                  //     if (obj.itemqtyprices.length && obj.itemqtyprices.length > 0) {
                  //         var objQtyPrice = _.filter(obj.itemqtyprices, function (i) {
                  //             if (o.Qty >= i.MinQty && o.Qty <= i.MaxQty) {
                  //                 return i;
                  //             }
                  //         })
                  //         if (objQtyPrice.length > 0) {
                  //             o.Price = objQtyPrice[0].SalePrice;
                  //         }
                  //     }
                  // }
                  if (o.Qty != 0 && o.Qty != "") {
                        o.Total = (o.Qty * parseFloat(o.Price)) - o.DiscountAmount;
                        o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
                        o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
                  } else {
                        o.Total = 0.00;
                        o.FinalTotal = o.NetTotal = o.LocalNetTotal = 0.00;
                  }
                  AdjustFinalPurchaseTotal();
            })
      }

      $scope.AddItemCode = function (o, t) {
            if (t) {
                  o.ItemCode = t.ItemCode;
                  o.ItemName = t.ItemName;
            }
            $scope.lstItemsSearch = [];

            $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + o.ItemCode).then(function (res) {
                  $scope.lstItems = res.data.data;
                  var obj = _.findWhere($scope.lstItems, {
                        ItemCode: o.ItemCode
                  });

                  o.Descriptions2 = obj.Descriptions2 //Main Company
                  o.HSNCode = obj.HSNCode
                  o.Descriptions = obj.Descriptions; //contain
                  o.ItemName = obj.ItemName;
                  o.UOM = (obj.PurchaseUOM).toString();
                  o.TaxCode = obj.PurchaseTaxCode;
                  o.listUOM = obj.itemuoms;
                  o.itemmargins = obj.itemmargins;
                  o.PurchaseUOM = obj.PurchaseUOM;
                  if (obj.isBatch == 1) {
                        o.BatchList = obj.itembatches;
                        o.isBatch = true;
                        if (o.BatchList.length > 0) {
                              _.filter(o.BatchList, function (z) {
                                    var objStock = {
                                          ItemCode: o.ItemCode,
                                          BatchNo: z.BatchNumber,
                                          UOM: o.UOM,
                                          Location: o.idLocations
                                    }

                                    $http.get($rootScope.RoutePath + 'item/GetAllItemBatchBalQtyByItemCode', {
                                          params: objStock
                                    }).then(function (res) {
                                          var objz = res.data.data;
                                          z['Stock'] = objz ? objz.BalQty : 0;

                                    });
                                    // var objz = _.findWhere(obj.itembatchbalqties, { BatchNo: z.BatchNumber, UOM: o.UOM, Location: o.idLocations });
                                    // z['Stock'] = objz ? objz.BalQty : 0;
                              })
                        }
                  } else {
                        o.BatchList = [];
                        o.isBatch = false;
                  }
                  setTimeout(() => {
                        $("#Batch" + o.ItemCode).focus();
                  });
                  $scope.FillItemUnitPrice(o);
                  // $scope.AddPurchaseMainItemInListNew();
            })
      }

      $scope.FillItemUnitPrice = function (o) {
            var objUOM = _.findWhere(o.listUOM, {
                  UOM: o.UOM
            });
            if (objUOM) {
                  o.Price = objUOM.Price;
                  o.MRP = objUOM.MRP
                  $scope.AddTaxCode(o, 1);
            }
      }

      $scope.AddLocation = function (o) {
            var obj = _.findWhere($scope.lstLocations, {
                  id: parseInt(o.idLocations)
            });
            o.DisplayLocation = obj.Name;
      }

      $scope.AddDiscountAmount = function (o, value) {
            if (value == 'Amount') {
                  if (o.DiscountAmount != null && o.DiscountAmount != '' && o.DiscountAmount != undefined) {
                        o.DiscountPercentage = (o.DiscountAmount / (o.Qty * o.Price)) * 100
                        o.Total = (o.Qty * parseFloat(o.Price)) - parseFloat(o.DiscountAmount);
                        o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
                        o.isDiscount = 1;
                  } else {
                        o.DiscountPercentage = 0;
                        o.Total = (o.Qty * o.Price) - 0;
                        o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
                        o.isDiscount = 0;

                  }
            } else if (value == 'Percentage') {
                  if (o.DiscountPercentage != null && o.DiscountPercentage != '' && o.DiscountPercentage != undefined) {
                        o.DiscountAmount = ((o.Qty * o.Price) * o.DiscountPercentage) / 100
                        o.Total = (o.Qty * parseFloat(o.Price)) - parseFloat(o.DiscountAmount);
                        o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
                        o.isDiscount = 1;
                  } else {
                        o.DiscountAmount = 0;
                        o.Total = (o.Qty * o.Price) - 0;
                        o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
                        o.isDiscount = 0;

                  }
            }






            $scope.AddTaxCode(o, 2);
            // AdjustFinalPurchaseTotal();
      }

      $scope.AddTaxCode = function (o, status) {
            if (o.TaxCode) {
                  var obj = _.findWhere($scope.lstTaxCode, {
                        TaxType: o.TaxCode
                  });
                  if (obj) {
                        o.TaxRate = obj.TaxRate;
                        o.Tax = o.LocalTax = (o.Total * obj.TaxRate) / 100;
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

            if (status != 2) {
                  $scope.MangeMargin(o);
            } else {
                  $scope.AddPrice(o);
            }
      }
      $scope.CursorPass = function (o) {
            setTimeout(() => {
                  $("#Qty" + o.ItemCode).focus();
            });
      }
      $scope.MangeMargin = function (o) {
            var lstexpirydate = _.findWhere(o.BatchList, {
                  BatchNumber: o.BatchNo
            });
            if (lstexpirydate != null) {
                  o.ExpiryDate = lstexpirydate.ExpiryDate
            }
            if (o.itemmargins && o.itemmargins.length > 0) {
                  var List = getSalesPurchaseRate(o);
                  o.MRP = List.MRP
                  if ($scope.CustomerGroup) {
                        if ($scope.CustomerGroup.Name == 'Shop') {
                              o.Price = List.ShopPurchaseRate;
                        } else if ($scope.CustomerGroup.Name == 'Stock Holder') {
                              o.Price = List.StockHolderPurchaseRate;
                        } else {
                              o.Price = List.GenmedPurchaseRate;

                        }
                  } else {
                        o.Price = List.GenmedPurchaseRate;
                        o.SaleRate = List.GenmedSalesRate
                  }
            }
            // setTimeout(() => {
            //     $("#Qty" + o.ItemCode).focus();
            // });
            $scope.AddPrice(o);
      }

      function AdjustFinalPurchaseTotal() {

            if ($scope.lstSelectedPurchaseMain.length > 0) {
                  $scope.model.Total = 0.00;
                  $scope.model.NetTotal = 0.00;
                  $scope.model.LocalNetTotal = 0.00;
                  $scope.model.FinalTotal = 0.00;
                  $scope.model.Tax = 0.00;
                  $scope.model.LocalTax = 0.00;
                  for (var i = 0; i < $scope.lstSelectedPurchaseMain.length; i++) {
                        $scope.model.Total = $scope.model.Total + $scope.lstSelectedPurchaseMain[i].Total;
                        $scope.model.LocalNetTotal = $scope.model.LocalNetTotal + $scope.lstSelectedPurchaseMain[i].Total;
                        $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.NetTotal + $scope.lstSelectedPurchaseMain[i].NetTotal;
                        $scope.model.Tax = $scope.model.LocalTax = $scope.model.Tax + $scope.lstSelectedPurchaseMain[i].Tax;
                  }
                  if ($scope.model.DiscountRate != null && $scope.model.DiscountRate != '' && $scope.model.DiscountRate != undefined) {
                        $scope.model.Total = ($scope.model.Total - ($scope.model.Total * $scope.model.DiscountRate) / 100);
                        $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.Total + $scope.model.Tax;
                  } else if ($scope.model.RoundAdj != null && $scope.model.RoundAdj != '' && $scope.model.RoundAdj != undefined) {
                        var DiscountAmount = $scope.model.NetTotal - parseInt($scope.model.RoundAdj);
                        $scope.model.NetTotal = $scope.model.FinalTotal = DiscountAmount;
                  }
            }
      }

      $scope.ManageDiscount = function () {
            AdjustFinalPurchaseTotal();
      }


      //End Main Purchase Tab

      $scope.formsubmit = false;
      $scope.SavePurchase = function (form) {
            if (form.$invalid) {
                  $scope.formsubmit = true;
            } else {
                  var NoItemCode = _.findWhere($scope.lstSelectedPurchaseMain, {
                        ItemCode: ''
                  });
                  if (NoItemCode) {
                        $scope.lstSelectedPurchaseMain.pop()
                        // var alertPopup = $ionicPopup.alert({
                        //     title: '',
                        //     template: 'Item code missing.First select Item code for all items in list.',
                        //     cssClass: 'custPop',
                        //     okText: 'Ok',
                        //     okType: 'btn btn-green',
                        // });
                  }
                  // else {
                  var NoQty = _.filter($scope.lstSelectedPurchaseMain, function (item) {
                        if (item.Qty == 0 || item.Qty == '' || item.Qty == undefined) {
                              return item;
                        }
                  });

                  if (NoQty != '') {
                        var alertPopup = $ionicPopup.alert({
                              title: '',
                              template: 'Quantity must be grater than zero for all items in list.',
                              cssClass: 'custPop',
                              okText: 'Ok',
                              okType: 'btn btn-green',
                        });
                  } else {
                        var BatchList = _.where($scope.lstSelectedPurchaseMain, {
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
            }

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
                  $scope.model.lstPurchaseDetail = $scope.lstSelectedPurchaseMain;
                  if (new Date($scope.model.PurchaseDate) == 'Invalid Date') {
                        $scope.model.PurchaseDate = moment().set({
                              'date': $scope.model.PurchaseDate.split('-')[0],
                              'month': $scope.model.PurchaseDate.split('-')[1] - 1,
                              'year': $scope.model.PurchaseDate.split('-')[2]
                        }).format('YYYY-MM-DD');
                  } else {
                        if (moment($scope.model.PurchaseDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                              $scope.model.PurchaseDate = moment($scope.model.PurchaseDate).format('YYYY-MM-DD');
                        } else {
                              $scope.model.PurchaseDate = moment($scope.model.PurchaseDate).format('YYYY-MM-DD');
                        }
                  }

                  // $scope.ListMaxPurchasePrice = [];
                  // $scope.ListMinPurchasePrice = [];

                  // $scope.ListMaxPurchaseQty = [];
                  // $scope.ListMinPurchaseQty = [];
                  // _.filter($scope.lstSelectedPurchaseMain, function (p) {
                  //     var obj = _.findWhere(p.listUOM, { UOM: p.UOM });
                  //     if (obj) {
                  //         if (p.Price > obj.MaxPurchasePrice) {
                  //             $scope.ListMaxPurchasePrice.push(p);
                  //         }
                  //         if (p.Price < obj.MinPurchasePrice) {
                  //             $scope.ListMinPurchasePrice.push(p);
                  //         }

                  //         if ((parseInt(p.Qty) + parseInt(obj.BalQty)) > obj.MaxQty) {
                  //             $scope.ListMaxPurchaseQty.push(p);
                  //         }
                  //         if ((parseInt(p.Qty) + parseInt(obj.BalQty)) < obj.MinQty) {
                  //             $scope.ListMinPurchaseQty.push(p);
                  //         }
                  //     }
                  // })

                  //return
                  // if ($scope.ListMaxPurchasePrice.length > 0 || $scope.ListMinPurchasePrice.length > 0) {
                  //     var confirmPopup = $ionicPopup.confirm({
                  //         title: "",
                  //         template: '<p ng-if="ListMaxPurchasePrice.length > 0"><b>Purchase Price for ' + _.pluck($scope.ListMaxPurchasePrice, 'ItemCode').toString() + ' is too high base on maximum Purchase price.</b></p>' +
                  //             '<p ng-if="ListMinPurchasePrice.length > 0"><b>And</b></p>' +
                  //             '<p ng-if="ListMinPurchasePrice.length > 0"><b>Purchase Price for ' + _.pluck($scope.ListMinPurchasePrice, 'ItemCode').toString() + ' is too low base on minimum Purchase price.</b></p>' +
                  //             '<p>Are you sure you want to continue ?</p>',
                  //         cssClass: 'custPop',
                  //         cancelText: 'Cancel',
                  //         okText: 'Ok',
                  //         okType: 'btn btn-green',
                  //         cancelType: 'btn btn-red',
                  //         scope: $scope,
                  //     })
                  //     confirmPopup.then(function (res) {
                  //         if (res) {
                  //             checkminmaxqty();
                  //         }
                  //     })
                  // } else {
                  //     checkminmaxqty();
                  // }

                  // function checkminmaxqty() {
                  //     if ($scope.ListMaxPurchaseQty.length > 0 || $scope.ListMinPurchaseQty.length > 0) {
                  //         var confirmPopup = $ionicPopup.confirm({
                  //             title: "",
                  //             template: '<p ng-if="ListMaxPurchaseQty.length > 0"><b>Purchase Qty for ' + _.pluck($scope.ListMaxPurchaseQty, 'ItemCode').toString() + ' is too high base on maximum Purchase Qty.</b></p>' +
                  //                 '<p ng-if="ListMinPurchaseQty.length > 0"><b>And</b></p>' +
                  //                 '<p ng-if="ListMinPurchaseQty.length > 0"><b>Purchase Qty for ' + _.pluck($scope.ListMinPurchaseQty, 'ItemCode').toString() + ' is too low base on minimum Purchase Qty.</b></p>' +
                  //                 '<p>Are you sure you want to continue ?</p>',
                  //             cssClass: 'custPop',
                  //             cancelText: 'Cancel',
                  //             okText: 'Ok',
                  //             okType: 'btn btn-green',
                  //             cancelType: 'btn btn-red',
                  //             scope: $scope,
                  //         })
                  //         confirmPopup.then(function (res) {
                  //             if (res) {
                  //                 $http.post($rootScope.RoutePath + 'purchase/SavePurchase', $scope.model).then(function (res) {
                  //                     if (res.data.success) {
                  //                         $scope.init();
                  //                     }
                  //                     $ionicLoading.show({ template: res.data.message });
                  //                     setTimeout(function () {
                  //                         $ionicLoading.hide()
                  //                     }, 1000);
                  //                 }).catch(function (err) {
                  //                     $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                  //                     setTimeout(function () {
                  //                         $ionicLoading.hide()
                  //                     }, 1000);

                  //                 });
                  //             }
                  //         })
                  //     } else {
                  $rootScope.ShowLoader();
                  $http.post($rootScope.RoutePath + 'purchase/SavePurchase', $scope.model).then(function (res) {
                        if (res.data.success) {
                              $scope.init();
                              console.log(res.data.data)
                              $scope.GenerateReport(res.data.data)
                        }
                        $ionicLoading.show({
                              template: res.data.message
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);
                  }).catch(function (err) {
                        $ionicLoading.show({
                              template: 'Unable to save record right now. Please try again later.'
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);

                  });
                  //     }
                  // }
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
                        $scope.model['idLocations'] = $localstorage.get('DefaultLocation');
                  }
                  if (prop == 'PurchaseDate') {
                        $scope.model['PurchaseDate'] = moment(selectedItem[prop]).format('YYYY-MM-DD');
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

            $scope.lstSelectedPurchaseMain = selectedItem.purchasedetails;

            $scope.lstSelectedPurchaseMain = _.sortBy($scope.lstSelectedPurchaseMain, 'sequence');

            if ($scope.lstSelectedPurchaseMain.length > 0) {
                  for (let i = 0; i < $scope.lstSelectedPurchaseMain.length; i++) {
                        $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + $scope.lstSelectedPurchaseMain[i].ItemCode).then(function (res) {
                              $scope.lstItems = res.data.data;
                              $scope.lstSelectedPurchaseMain[i].IsEdit = false;
                              $scope.lstSelectedPurchaseMain[i].ItemName = $scope.lstItems[0].ItemName;
                              $scope.lstSelectedPurchaseMain[i].HSNCode = $scope.lstItems[0].HSNCode;
                              $scope.lstSelectedPurchaseMain[i].Descriptions2 = $scope.lstItems[0].Descriptions2;

                              if ($scope.lstSelectedPurchaseMain[i].TaxCode) {
                                    var obj = _.findWhere($scope.lstTaxCode, {
                                          TaxType: $scope.lstSelectedPurchaseMain[i].TaxCode
                                    });
                                    if (obj) {
                                          $scope.lstSelectedPurchaseMain[i].TaxRate = obj.TaxRate;
                                    }
                              }

                              if ($scope.lstSelectedPurchaseMain[i].sequence == null) {
                                    $scope.lstSelectedPurchaseMain[i].sequence = i + 1
                              }

                              if ($scope.lstSelectedPurchaseMain[i].idLocations) {
                                    var obj1 = _.findWhere($scope.lstLocations, {
                                          id: parseInt($scope.lstSelectedPurchaseMain[i].idLocations)
                                    });
                                    $scope.lstSelectedPurchaseMain[i].idLocations = ($scope.lstSelectedPurchaseMain[i].idLocations).toString();
                                    if (obj1) {
                                          $scope.lstSelectedPurchaseMain[i].DisplayLocation = obj1.Name;
                                    }
                              }
                              $scope.lstSelectedPurchaseMain[i].DiscountPercentage = ($scope.lstSelectedPurchaseMain[i].DiscountAmount / ($scope.lstSelectedPurchaseMain[i].Qty * $scope.lstSelectedPurchaseMain[i].Price)) * 100
                              var objItem1 = _.findWhere($scope.lstItems, {
                                    ItemCode: $scope.lstSelectedPurchaseMain[i].ItemCode
                              });
                              if (objItem1) {
                                    $scope.lstSelectedPurchaseMain[i].listUOM = objItem1.itemuoms;
                                    $scope.lstSelectedPurchaseMain[i].PurchaseUOM = objItem1.PurchaseUOM;
                                    if (objItem1.isBatch == 1) {
                                          $scope.lstSelectedPurchaseMain[i].isBatch = true;
                                          $scope.lstSelectedPurchaseMain[i].BatchList = objItem1.itembatches;
                                    } else {
                                          $scope.lstSelectedPurchaseMain[i].isBatch = false;
                                          $scope.lstSelectedPurchaseMain[i].BatchList = objItem1.itembatches;
                                    }

                                    if ($scope.lstSelectedPurchaseMain[i].BatchList.length > 0) {
                                          var selectedBatch = _.findWhere($scope.lstSelectedPurchaseMain[i].BatchList, {
                                                BatchNumber: $scope.lstSelectedPurchaseMain[i].BatchNo
                                          })
                                          if (selectedBatch) {
                                                $scope.lstSelectedPurchaseMain[i].ExpiryDate = selectedBatch.ExpiryDate
                                          }
                                          _.filter($scope.lstSelectedPurchaseMain[i].BatchList, function (z) {
                                                var objStock = {
                                                      ItemCode: $scope.lstSelectedPurchaseMain[i].ItemCode,
                                                      BatchNo: z.BatchNumber,
                                                      UOM: $scope.lstSelectedPurchaseMain[i].UOM,
                                                      Location: $scope.lstSelectedPurchaseMain[i].idLocations
                                                }

                                                $http.get($rootScope.RoutePath + 'item/GetAllItemBatchBalQtyByItemCode', {
                                                      params: objStock
                                                }).then(function (res) {
                                                      var objz = res.data.data;
                                                      z['Stock'] = objz ? objz.BalQty : 0;

                                                });
                                                // var objz = _.findWhere(objItem1.itembatchbalqties, { BatchNo: z.BatchNumber, UOM: $scope.lstSelectedPurchaseMain[i].UOM, Location: $scope.lstSelectedPurchaseMain[i].idLocations });
                                                // z['Stock'] = objz ? objz.BalQty : 0;
                                          })
                                    }


                                    if ($scope.lstSelectedPurchaseMain[i].BatchNo) {
                                          var Rate = 1;
                                          if (objItem1.SalesUOM != $scope.lstSelectedPurchaseMain[i].UOM) {
                                                Rate = 1 * _.findWhere(objItem1.itemuoms, {
                                                      UOM: objItem1.SalesUOM
                                                }).Rate;
                                          }
                                          var Batch = _.findWhere(objItem1.itembatches, {
                                                BatchNumber: $scope.lstSelectedPurchaseMain[i].BatchNo
                                          }).MRP

                                          $scope.lstSelectedPurchaseMain[i]['MRP'] = Batch / Rate;
                                    } else {
                                          $scope.lstSelectedPurchaseMain[i]['MRP'] = _.findWhere(objItem1.itemuoms, {
                                                UOM: $scope.lstSelectedPurchaseMain[i].UOM
                                          }).MRP;
                                    }
                              } else {
                                    $scope.lstSelectedPurchaseMain[i].listUOM = [];
                                    if ($scope.lstSelectedPurchaseMain[i].BatchNo) {
                                          var Rate = _.findWhere(objItem1.itemuoms, {
                                                UOM: $scope.lstSelectedPurchaseMain[i].UOM
                                          });
                                          if (objItem1.SalesUOM != $scope.lstSelectedPurchaseMain[i].UOM) {
                                                Rate = 1 * _.findWhere(objItem1.itemuoms, {
                                                      UOM: objItem1.SalesUOM
                                                });
                                          }
                                          var Batch = _.findWhere($scope.lstSelectedPurchaseMain[i].BatchList, {
                                                BatchNumber: $scope.lstSelectedPurchaseMain[i].BatchNo
                                          }).MRP
                                          if (Rate) {
                                                $scope.lstSelectedPurchaseMain[i]['MRP'] = Batch / Rate.Rate;
                                          } else {
                                                $scope.lstSelectedPurchaseMain[i]['MRP'] = Batch;
                                          }
                                    } else {
                                          $scope.lstSelectedPurchaseMain[i]['MRP'] = 0;
                                    }
                              }

                              $scope.lstSelectedPurchaseMain[i].LastBalQty = $scope.lstSelectedPurchaseMain[i].Qty * -1;
                              $scope.lstSelectedPurchaseMain[i].LastBatchNo = $scope.lstSelectedPurchaseMain[i].BatchNo;
                              $scope.lstSelectedPurchaseMain[i].LastLocation = $scope.lstSelectedPurchaseMain[i].idLocations;
                              $scope.lstSelectedPurchaseMain[i].LastItemCode = $scope.lstSelectedPurchaseMain[i].ItemCode;
                              $scope.lstSelectedPurchaseMain[i].LastUOM = $scope.lstSelectedPurchaseMain[i].UOM;
                        })
                  }

                  // var objItem = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedPurchaseMain[0].ItemCode });
                  // if (objItem) {
                  //     if (objItem.isBatch == 1) {
                  //         $scope.BatchList = objItem.itembatches;
                  //     } else {
                  //         $scope.BatchList = [];
                  //     }
                  // }

                  $scope.WorkingPurchaseMain = $scope.lstSelectedPurchaseMain[$scope.lstSelectedPurchaseMain.length - 1];

                  // AssignPurchaseMainClickEvent();

                  // setTimeout(function () {
                  //     $scope.SelectPurchaseMainRaw(0);
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
                        $http.get($rootScope.RoutePath + 'purchase/DeletePurchase', {
                              params: params
                        }).success(function (data) {
                              $ionicLoading.show({
                                    template: data.message
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                                    InitDataTable()
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
                  PurchaseDate: moment().format('YYYY-MM-DD'),
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
                  idLocations: $localstorage.get('DefaultLocation'),
                  DefaultLocation: '',
                  IsInclusive: 0,
                  DiscountRate: null,
                  CreatedBy: parseInt($localstorage.get('UserId')),
                  CreatedDate: null,
                  ModifiedBy: null,
                  ModifiedDate: null,
                  LoginUserCode: $localstorage.get('UserCode'),
                  DrugLicNo: null,
            };
            $scope.Searchmodel = {
                  Search: '',
            }
            $scope.Searchmodel1 = {
                  Search: '',
            }
            $scope.modelSearch = {
                  StartDate: moment().subtract('1', 'd').format(),
                  EndDate: moment().format(),
                  CustomerCode: '',
                  idLocations: $localstorage.get('DefaultLocation'),
            }
            $scope.modelAdvanceSearch = $scope.modelSearch
            $scope.lstSelectedPurchaseMain = [];
            $scope.AddPurchaseMainItemInList();
      };

      // $scope.GetAllCustomer = function () {
      //     var params = {
      //         CustomerGroup: $localstorage.get('CustomerGroup'),
      //         CreatedBy: $scope.IsAdmin ? '' : parseInt($localstorage.get('UserId')),
      //         LoginUserCode: $localstorage.get('UserCode'),
      //     }
      //     $http.get($rootScope.RoutePath + 'customer/GetAllCustomerAdvance', { params: params }).then(function (res) {
      //         $scope.lstCustomer = res.data.data;
      //     });
      // }

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
            $('#PurchaseTable').dataTable().api().ajax.reload();
      }

      $scope.EnableFilterOption = function () {
            $(function () {
                  $(".CustFilter").slideToggle();
            });
      };

      $scope.FilterAdvanceData = function (o) {
            console.log(o)
            $scope.modelAdvanceSearch = o;
            // $('#PurchaseTable').dataTable().api().ajax.reload();
            InitDataTable()
      }

      //Set Table
      function InitDataTable() {

            if ($.fn.DataTable.isDataTable('#PurchaseTable')) {
                  $('#PurchaseTable').DataTable().destroy();
            }
            $('#PurchaseTable').DataTable({
                  "processing": true,
                  "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                  "serverSide": true,
                  "responsive": true,
                  "aaSorting": [0, 'DESC'],
                  "ajax": {
                        url: $rootScope.RoutePath + 'purchase/GetAllPurchaseDynamic',
                        data: function (d) {
                              if ($scope.Searchmodel.Search != undefined) {
                                    d.search = $scope.Searchmodel.Search;
                              }
                              // d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations');
                              d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                              d.modelAdvanceSearch = $scope.modelAdvanceSearch;
                              console.log(d)
                              return d;
                        },
                        type: "get",
                        dataSrc: function (json) {

                              if (json.success != false) {
                                    console.log(json)
                                    $scope.lstdata = json.data;
                                    $scope.$apply(function () {
                                          $scope.TotalPurchaseAmount = json.TotalAmount
                                    })
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
                              "data": "id",
                              "sortable": false
                        },
                        {
                              "data": "DocNo",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "PurchaseDate",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "DeliverAddress2",
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
                        // { "data": "Description", "defaultContent": "N/A" },
                        {
                              "data": "BranchCode",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Total",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Tax",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "FinalTotal",
                              "defaultContent": "N/A"
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
                        },
                        {
                              "render": function (data, type, row) {
                                    return moment(data).format('DD-MM-YYYY');
                              },
                              "targets": 2
                        },
                        {
                              "visible": !$scope.GenmedFlag,
                              "targets": 4,
                        },
                        {
                              "visible": !$scope.GenmedFlag,
                              "targets": 6,
                        },
                        {
                              "visible": $scope.GenmedFlag,
                              "targets": 3,
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

                              "targets": [7, 8, 9],
                              className: "right-aligned-cell"
                        }, {
                              "render": function (data, type, row) {
                                    var Action = '<div layout="row" layout-align="center center">';
                                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                                    Action += '<a ng-click="DeleteItem(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>&nbsp;';
                                    if ($scope.CurrentCustomerGroup != 'Shop') {
                                          Action += '<a ng-click="GenerateReport(' + row.id + ')" class="btnAction btnAction-info" style="cursor:pointer"><i class="ion-document-text" title="Document"></i></a>&nbsp;';
                                          Action += '<a ng-click="StockTransfer(' + row.id + ')" class="btnAction btnAction-alert" style="cursor:pointer"><i class="ion-arrow-swap" title="Convert Sale"></i></a>&nbsp;';
                                    }
                                    Action += '</div>';
                                    return Action;
                              },
                              "targets": 10
                        }
                  ]
            });

      }

      // Alias
      $rootScope.ResetAll = $scope.init;

      $scope.Add = function () {
            $scope.GetInvoiceDocNo();
            $scope.formsubmit = false;
            $rootScope.BackButton = $scope.IsList = false;
      }

      $scope.GetInvoiceDocNo = function () {
            $http.get($rootScope.RoutePath + 'purchase/GetPurchaseDocNo?LoginUserCode=' + $localstorage.get('UserCode')).then(function (res) {
                  $scope.model.DocNo = res.data;
            });
      }
      $scope.GetIGSTInvoiceDocNo = function () {
            $http.get($rootScope.RoutePath + 'purchase/GetIGSTPurchaseDocNo?LoginUserCode=' + $localstorage.get('UserCode')).then(function (res) {
                  $scope.model.DocNo = res.data;
                  console.log(res.data)
            });
      }

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

      // $scope.GenerateReport = function (Id) {
      //     window.open($rootScope.RoutePath + "purchase/GenerateInvoice?Id=" + Id, '_blank');
      // }

      $scope.GenerateReport = function (Id) {
            if ($localstorage.get('CustomerGroup') == 'Shop') {
                  window.open($rootScope.RoutePath + "purchase/GenerateInvoiceShopNEW?Id=" + Id, '_blank');
            } else {
                  window.open($rootScope.RoutePath + "purchase/GenerateInvoiceNEW?Id=" + Id, '_blank');
            }
      }

      //*********************************************************Stock Transfer Start*****************************************************/

      $scope.StockTransfer = function (id) {
            $rootScope.PurchaseId = id;
            $state.go('app.Sales')
      }

      //*********************************************************Stock Transfer End ******************************************************/


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
            $scope.Searchmodel1 = {
                  Search: '',
            }
      };

      $scope.FilterData1 = function () {
            $('#ItemTable').dataTable().api().ajax.reload();

      }

      $scope.SelectItemCode = function (id) {

            $scope.modal.hide();
            $scope.Searchmodel1 = {
                  Search: '',
            }
            var SelectedItemCode = $scope.lstdata.find(function (item) {
                  return item.id == id;
            });
            $scope.lstSelectedPurchaseMain[$localstorage.get('ItemIndex')].ItemCode = SelectedItemCode.ItemCode;
            $scope.AddItemCode($scope.lstSelectedPurchaseMain[$localstorage.get('ItemIndex')])
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
                              d.CustGroupName = $scope.CurrentCustomerGroup == 'Genmed' ? null : $scope.CurrentCustomerGroup
                              console.log(d);
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
                        // { "data": null, "sortable": false, },
                        // { "data": "BaseUOM", "defaultContent": "N/A" },
                        // { "data": "SalesUOM", "defaultContent": "N/A" },
                        // { "data": "PurchaseUOM", "defaultContent": "N/A" },
                        // { "data": "ReportUOM", "defaultContent": "N/A" },
                        // { "data": "itemtype.Type", "defaultContent": "N/A", "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": "CreatedDate" },
                        // { "data": "ModifiedDate" },
                        // { "data": null, "sortable": false, },
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
                        // {
                        //     "render": function (data, type, row) {
                        //         if (data != null && data != undefined && data != '') {
                        //             if (data.itemuoms.length > 0) {
                        //                 Action = _.pluck(data.itemuoms, 'UOM').toString();
                        //                 return Action;
                        //             } else {
                        //                 return "N/A";
                        //             }

                        //         } else {
                        //             return "N/A"
                        //         }

                        //     },
                        //     "targets": 5,

                        // },
                        //  {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.isActive == 1) {
                        //             Action += '<span style="font-size: 20px;color: green" ng-click="isActiveItem(' + data.id + ',' + data.isActive + ')">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red"  ng-click="isActiveItem(' + data.id + ',' + data.isActive + ')">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 11
                        // },

                        // {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.IsGenmedMedicine == 1) {
                        //             Action += '<span style="font-size: 20px;color: green">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 12
                        // },


                        // {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.IsGenmedWelness == 1) {
                        //             Action += '<span style="font-size: 20px;color: green">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 13
                        // },

                        // {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.IsGenmedOnline == 1) {
                        //             Action += '<span style="font-size: 20px;color: green">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 14
                        // },

                        // {
                        //     "render": function (data, type, row) {
                        //         if (data != null && data != undefined && data != '') {
                        //             if (data.itembatchbalqties.length > 0) {
                        //                 var countQty = 0;
                        //                 for (var i = 0; i < data.itembatchbalqties.length; i++) {
                        //                     var objRate = _.findWhere(data.itemuoms, { UOM: data.itembatchbalqties[i].UOM });
                        //                     if (objRate) {
                        //                         var uomRate = objRate.Rate;
                        //                         var qty = uomRate * data.itembatchbalqties[i].BalQty;
                        //                         countQty = countQty + qty;
                        //                     }
                        //                 }
                        //                 return countQty;
                        //             } else {
                        //                 return 0
                        //             }
                        //         } else {
                        //             return 0;
                        //         }

                        //     },
                        //     "targets": 15,

                        // },
                        // {
                        //     "render": function (data, type, row) {
                        //         if (row.CreatedDate != '' && row.CreatedDate != null) {
                        //             return moment(row.CreatedDate).format('DD-MM-YYYY');
                        //         } else {
                        //             return "";
                        //         }
                        //     },
                        //     "targets": 16,
                        // },
                        // {
                        //     "render": function (data, type, row) {
                        //         if (row.ModifiedDate != '' && row.ModifiedDate != null) {
                        //             return moment(row.ModifiedDate).format('DD-MM-YYYY');
                        //         } else {
                        //             return "";
                        //         }
                        //     },
                        //     "targets": 17,
                        // },



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

      $scope.ChangeInclusivePrice = function () {
            if ($scope.lstSelectedPurchaseMain.length > 0) {
                  if ($scope.model.IsInclusive) {
                        for (var i = 0; i < $scope.lstSelectedPurchaseMain.length; i++) {
                              if ($scope.lstSelectedPurchaseMain[i].TaxRate != 0) {
                                    $scope.lstSelectedPurchaseMain[i].Price = parseFloat($scope.lstSelectedPurchaseMain[i].Price) / (($scope.lstSelectedPurchaseMain[i].TaxRate / 100) + 1);
                                    if ($scope.lstSelectedPurchaseMain[i].Qty != null) {
                                          $scope.lstSelectedPurchaseMain[i].Total = ($scope.lstSelectedPurchaseMain[i].Qty * parseFloat($scope.lstSelectedPurchaseMain[i].Price)) - $scope.lstSelectedPurchaseMain[i].DiscountAmount;
                                          $scope.lstSelectedPurchaseMain[i].Tax = $scope.lstSelectedPurchaseMain[i].LocalTax = ($scope.lstSelectedPurchaseMain[i].Total * $scope.lstSelectedPurchaseMain[i].TaxRate) / 100;
                                          $scope.lstSelectedPurchaseMain[i].FinalTotal = $scope.lstSelectedPurchaseMain[i].NetTotal = $scope.lstSelectedPurchaseMain[i].LocalNetTotal = $scope.lstSelectedPurchaseMain[i].Total + $scope.lstSelectedPurchaseMain[i].Tax;
                                    } else {
                                          $scope.lstSelectedPurchaseMain[i].Price = 0.00;
                                          $scope.lstSelectedPurchaseMain[i].Total = 0.00;
                                          $scope.lstSelectedPurchaseMain[i].FinalTotal = $scope.lstSelectedPurchaseMain[i].NetTotal = $scope.lstSelectedPurchaseMain[i].LocalNetTotal = 0.00;
                                    }
                                    AdjustFinalPurchaseTotal();
                              }
                        }
                  } else {
                        for (var i = 0; i < $scope.lstSelectedPurchaseMain.length; i++) {
                              if ($scope.lstSelectedPurchaseMain[i].TaxRate != 0) {
                                    $scope.lstSelectedPurchaseMain[i].Price = parseFloat($scope.lstSelectedPurchaseMain[i].Price) * (($scope.lstSelectedPurchaseMain[i].TaxRate / 100) + 1);
                                    if ($scope.lstSelectedPurchaseMain[i].Qty != null) {
                                          $scope.lstSelectedPurchaseMain[i].Total = ($scope.lstSelectedPurchaseMain[i].Qty * parseFloat($scope.lstSelectedPurchaseMain[i].Price)) - $scope.lstSelectedPurchaseMain[i].DiscountAmount;
                                          $scope.lstSelectedPurchaseMain[i].Tax = $scope.lstSelectedPurchaseMain[i].LocalTax = ($scope.lstSelectedPurchaseMain[i].Total * $scope.lstSelectedPurchaseMain[i].TaxRate) / 100;
                                          $scope.lstSelectedPurchaseMain[i].FinalTotal = $scope.lstSelectedPurchaseMain[i].NetTotal = $scope.lstSelectedPurchaseMain[i].LocalNetTotal = $scope.lstSelectedPurchaseMain[i].Total + $scope.lstSelectedPurchaseMain[i].Tax;
                                    } else {
                                          $scope.lstSelectedPurchaseMain[i].Price = 0.00;
                                          $scope.lstSelectedPurchaseMain[i].Total = 0.00;
                                          $scope.lstSelectedPurchaseMain[i].FinalTotal = $scope.lstSelectedPurchaseMain[i].NetTotal = $scope.lstSelectedPurchaseMain[i].LocalNetTotal = 0.00;
                                    }
                                    AdjustFinalPurchaseTotal();
                              }
                        }
                  }
            }
      }

      function getSalesPurchaseRate(o) {
            var PurchaseUOM = _.findWhere(o.listUOM, {
                  UOM: o.PurchaseUOM
            });
            var uomqun = PurchaseUOM.UOM == o.UOM ? 1 : PurchaseUOM.Rate;

            var purchaseprice = 0;
            var batch = null;
            var MRP = 0.0;

            if (o.BatchNo) {
                  batch = _.findWhere(o.BatchList, {
                        BatchNumber: o.BatchNo
                  });
                  purchaseprice = batch.SalesRate / ((o.TaxRate / 100) + 1);
                  MRP = batch.MRP / uomqun
            } else {
                  purchaseprice = parseFloat(o.Price) / ((o.TaxRate / 100) + 1);
                  MRP = PurchaseUOM.MRP / uomqun
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

            var StockHolderSalesRate = ShopPurchaseRate;
            var StockHolderPurchaseRate = parseFloat(ShopPurchaseRate) - ((parseFloat(ShopPurchaseRate) * StockHolder.Percentage) / 100);

            // var GenmedSalesRate = StockHolderPurchaseRate;
            var GenmedSalesRate = o.BatchNo ? batch.SalesRate : parseFloat(o.Price);;
            var GenmedPurchaseRate = o.BatchNo ? batch.PurchaseRate : parseFloat(o.Price);


            var obj = {
                  ShopSalesRate: ShopSalesRate,
                  ShopPurchaseRate: ShopPurchaseRate,
                  StockHolderSalesRate: StockHolderSalesRate,
                  StockHolderPurchaseRate: StockHolderPurchaseRate,
                  GenmedSalesRate: GenmedSalesRate,
                  GenmedPurchaseRate: GenmedPurchaseRate,
                  MRP: MRP
            }
            return obj;

      }

      $scope.GetItem = function (o) {
            setTimeout(() => {
                  $("#Qty" + o.ItemCode).focus();
            });
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


      $scope.init();

});