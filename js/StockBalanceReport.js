app.controller('StockBalanceReportController', function ($scope, $rootScope, $http, $ionicPopup, $ionicModal, $ionicLoading, $localstorage, $state, $compile) {

      $rootScope.BackButton = true;
      $scope.init = function () {
            $scope.GenmedFlag = false
            $scope.CustomerGroup = $localstorage.get('CustomerGroup')
            console.log($scope.CustomerGroup)
            if ($scope.CustomerGroup == 'Genmed') {
                  $scope.GenmedFlag = true
            }
            setTimeout(() => {
                  $("#mytext").focus();
            }, 1000);
            $scope.modelAdvanceSearch = null;
            ManageRole();
            $scope.GetAllBrand();
            $scope.GetAllSubBrand();
            $scope.GetAllParentItemCategory();
            $scope.ResetModel();
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

      $scope.GetAllBrand = function () {
            $http.get($rootScope.RoutePath + 'brand/GetAllBrand').then(function (res) {
                  $scope.lstBrand = res.data.data;
                  $scope.Filtermodel.MainCompany = $scope.lstBrand.length > 0 ? $scope.lstBrand[0].Brand : '';
                  console.log("**************", $scope.Filtermodel);
            });
      }

      $scope.GetAllSubBrand = function () {
            $http.get($rootScope.RoutePath + 'brand/GetAllSubBrand').then(function (res) {
                  $scope.lstSubBrand = res.data.data;
            });
      }

      $scope.GetAllParentItemCategory = function () {
            $http.get($rootScope.RoutePath + 'itemcategory/GetAllItemCategory').then(function (res) {
                  $scope.lstParentItemCategory = res.data.data;
            });
      }

      $scope.GetAllSubItemCategory = function (id) {
            $http.get($rootScope.RoutePath + 'itemcategory/GetAllSubItemCategory?id=' + id).then(function (res) {
                  $scope.lstSubItemCategory = res.data.data;
            });
      }

      //Table function End
      $scope.ResetModel = function () {
            $scope.Searchmodel = {
                  Search: '',
            }
            $scope.checkboxmodel = {
                  SaleRate: true,
                  PurRate: true,
                  StockP: true,
                  StockM: true,
                  SubGroup: false,
                  Pack: true,
                  BoxPack: false,
                  SubCompany: true,
                  PurParty: true,
                  DrugMaster: $scope.GenmedFlag ? true : false,
                  PurGSTRate: true,
                  Batch: false,
            }

            $scope.Filtermodel = {
                  MainCompany: '',
                  SubCompany: '',
                  StartDate: moment().format(),
                  EndDate: moment().format(),
                  ProductGroup: '',
                  // ProductSubGroup: ''
            }

            $scope.FinalTotalmodel = {
                  PurCount: 0,
                  PurAmount: 0.0,
                  SaleCount: 0,
                  SaleAmount: 0.0,
                  ClosingCount: 0,
                  ClosingAmount: 0.0,
            }
      };

      $scope.FilterData = function () {
            $('#StockBalanceReportTable').dataTable().api().ajax.reload();
      }

      // $scope.EnableFilterOption = function () {
      //     $(function () {
      //         $(".CustFilter").slideToggle();
      //     });
      // };

      // $scope.FilterAdvanceData = function (o) {
      //     $scope.modelAdvanceSearch = o;
      //     InitDataTable()
      //     // $('#StockBalanceReportTable').dataTable().api().ajax.reload();
      // }

      $scope.FilterTableData = function (o) {
            InitDataTable()
      }

      //Set Table
      function InitDataTable() {
            if ($.fn.DataTable.isDataTable('#StockBalanceReportTable')) {
                  $('#StockBalanceReportTable').DataTable().destroy();
            }
            $('#StockBalanceReportTable').DataTable({
                  "processing": true,
                  "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                  "serverSide": true,
                  "responsive": true,
                  "aaSorting": [1, 'ASC'],
                  "ajax": {
                        url: $rootScope.RoutePath + 'report/GetAllStockBalanceDynamicNew',
                        data: function (d) {
                              if ($scope.Searchmodel.Search != undefined) {
                                    d.search = $scope.Searchmodel.Search;
                              }

                              d.CustomerGroup = $localstorage.get('CustomerGroup')
                              d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                              // d.modelAdvanceSearch = $scope.modelAdvanceSearch;
                              $scope.order = d.order;
                              $scope.columns = d.columns;
                              if (($scope.checkboxmodel.StockP == true && $scope.checkboxmodel.StockM == true) || ($scope.checkboxmodel.StockP == false && $scope.checkboxmodel.StockM == false)) {
                                    d.Stock = null
                              } else if ($scope.checkboxmodel.StockP == true) {
                                    d.Stock = "Plus"
                              } else if ($scope.checkboxmodel.StockM == true) {
                                    d.Stock = "Minus"
                              }
                              d.MainCompany = $scope.Filtermodel.MainCompany
                              d.SubCompany = $scope.Filtermodel.SubCompany
                              d.StartDate = $scope.Filtermodel.StartDate
                              d.EndDate = $scope.Filtermodel.EndDate
                              d.ProductGroup = $scope.Filtermodel.ProductGroup
                              d.Batch = $scope.checkboxmodel.Batch
                              // d.ProductSubGroup = $scope.Filtermodel.ProductSubGroup
                              console.log(d)
                              return d;
                        },
                        type: "get",
                        dataSrc: function (json) {

                              if (json.success != false) {
                                    $scope.lstdata = json.data;
                                    console.log(json)
                                    $scope.$apply(function () {
                                          $scope.FinalTotalmodel.PurCount = parseFloat(json.TotalPurchaseQty).toFixed(2);
                                          $scope.FinalTotalmodel.PurAmount = parseFloat(json.TotalPurchaseAmount).toFixed(2);
                                          $scope.FinalTotalmodel.SaleCount = parseFloat(json.TotalSaleQty).toFixed(2);
                                          $scope.FinalTotalmodel.SaleAmount = parseFloat(json.TotalSaleAmount).toFixed(2);
                                          $scope.FinalTotalmodel.ClosingCount = parseFloat(json.TotalStock).toFixed(2);
                                          $scope.FinalTotalmodel.ClosingAmount = parseFloat(json.TotalAmount).toFixed(2);
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
                              "data": null,
                              "sortable": false
                        }, //0        //0
                        {
                              "data": "ItemCode",
                              "defaultContent": "N/A"
                        }, //1        //1
                        {
                              "data": "ItemName",
                              "defaultContent": "N/A"
                        }, //2        //2
                        {
                              "data": null,
                              "defaultContent": "N/A"
                        }, //Drug                                      //3        //3
                        {
                              "data": "BatchNumber",
                              "defaultContent": "N/A"
                        }, //Drug                              //4        //4

                        {
                              "data": "Groupname",
                              "defaultContent": "N/A"
                        }, //5        //5
                        // { "data": "", "defaultContent": "N/A" }, //SubGroup                                   //6
                        {
                              "data": "CompanyName",
                              "defaultContent": "N/A"
                        }, //7        //6
                        {
                              "data": "SubComapny",
                              "defaultContent": "N/A"
                        }, //Subcompany                                   //8         //7

                        {
                              "data": "PurchaseParty",
                              "defaultContent": "N/A"
                        }, //9        //8
                        {
                              "data": "Pack",
                              "defaultContent": "N/A"
                        }, //10        //9
                        // { "data": "BoxPack", "defaultContent": "N/A" }, //BoxPack                              //11

                        // { "data": "", "defaultContent": "N/A" }, //Opening                                    //12

                        {
                              "data": "PurchaseQty",
                              "defaultContent": "N/A"
                        }, //13       //10
                        {
                              "data": "PurchaseRate",
                              "defaultContent": "N/A"
                        }, //14       //11
                        {
                              "data": "PurchaseRateGST",
                              "defaultContent": "N/A"
                        }, //PurGSTRate                      //15       //12
                        {
                              "data": "PurchaseAmount",
                              "defaultContent": "N/A"
                        }, //16       //13

                        {
                              "data": "SalesQty",
                              "defaultContent": "N/A"
                        }, //17       //14
                        {
                              "data": "SaleRate",
                              "defaultContent": "N/A"
                        }, //SaleRate                           //18          //15
                        {
                              "data": "SalesAmount",
                              "defaultContent": "N/A"
                        }, //19       //16

                        {
                              "data": "OpeningStock",
                              "defaultContent": "N/A"
                        },

                        {
                              "data": "Stock",
                              "defaultContent": "N/A"
                        }, //Closing                                 //20       //17
                        {
                              "data": "Amount",
                              "defaultContent": "N/A"
                        }, //Amount                                   //21         //18
                  ],
                  "columnDefs": [{
                              "render": function (data, type, row, meta) {
                                    return meta.row + meta.settings._iDisplayStart + 1;
                              },
                              "targets": 0,
                        },
                        {
                              "render": function (data, type, row) {
                                    var Action = '<div layout="row" layout-align="center center">';
                                    Action += '<a ng-click="GotoDrug(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-information" title="Go To Drug"></i></a>&nbsp;';
                                    Action += '</div>';
                                    return Action;
                              },
                              "visible": $scope.checkboxmodel.DrugMaster,
                              "targets": 3,
                        },
                        // {
                        //     "visible": $scope.checkboxmodel.SubGroup,
                        //     "targets": 5,
                        // },
                        // {
                        //     "visible": $scope.checkboxmodel.SubCompany,
                        //     "targets": 7,
                        // },
                        {
                              "visible": $scope.checkboxmodel.PurParty,
                              "targets": 8,
                        },
                        {
                              "visible": $scope.checkboxmodel.Pack,
                              "targets": 9,
                        },
                        {
                              "visible": $scope.checkboxmodel.Batch,
                              "targets": 4,
                        },
                        {
                              "visible": $scope.checkboxmodel.PurRate,
                              "targets": 11,
                        },
                        {
                              "visible": $scope.checkboxmodel.PurGSTRate,
                              "targets": 12,
                        },
                        {
                              "visible": $scope.checkboxmodel.SaleRate,
                              "targets": 13,
                        },
                  ]
            });

      }

      $scope.ShowHideCol = function () {
            // $('#StockBalanceReportTable').dataTable().api().ajax.reload();
            InitDataTable()
      }
      //Drug Master Model
      $ionicModal.fromTemplateUrl('DrugMaster.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {
            $scope.modal1 = modal;
      });
      $scope.CloseModal = function (id) {
            $scope.modal1.hide();
      }

      $scope.GotoDrug = function (id) {
            var SelectedItem = _.findWhere($scope.lstdata, {
                  id: id
            });
            $rootScope.SelectedDrug = SelectedItem.Drug;
            $scope.GetAllActiveCustomerGroup();
            $scope.GetAllTaxCode();
            $scope.modal1.show();
            if ($rootScope.SelectedDrug != undefined) {
                  $scope.GetAllItemByDrug($rootScope.SelectedDrug)
            }

            // $state.go('app.DrugMaster')
      }
      $scope.GetAllItemByDrug = function (o) {
            $scope.lstItembyDrug = []
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
            $rootScope.ShowLoader();
            $http.get($rootScope.RoutePath + 'item/GetAllItemByDrug', {
                  params: params
            }).then(function (resCode) {
                  $scope.lstItembyDrug = resCode.data.data;
                  console.log($scope.lstItembyDrug)
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
                  $ionicLoading.hide()
                  console.log($scope.lstItembyDrug);
                  $(document).ready(function () {
                        $('#DrugMasterTable').dataTable().fnClearTable();
                        $('#DrugMasterTable').dataTable().fnDestroy();
                        setTimeout(function () {
                              $('#DrugMasterTable').DataTable({
                                    responsive: true,
                                    "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                                    retrieve: true,
                                    "aaSorting": [0, 'ASC'],
                                    "lengthMenu": [
                                          [10, 25, 50, -1],
                                          [10, 25, 50, "All"]
                                    ],
                                    "pageLength": 25,
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

      $scope.FilterdrugData = function () {
            if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
                  $('#DrugMasterTable').dataTable().fnFilter($scope.Searchmodel.Search);
            } else {
                  $('#DrugMasterTable').dataTable().fnFilter("");
            }
      }


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
      $scope.Export = function () {
            if ($scope.Searchmodel.Search != undefined) {
                  var search = $scope.Searchmodel.Search;
            }
            var ObjAdvanceSearch = $scope.modelAdvanceSearch != null ? JSON.stringify($scope.modelAdvanceSearch) : '';
            var CurrentOffset = $scope.CurrentOffset;
            var idLocations = $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations');
            var CustomerGroup = $localstorage.get('CustomerGroup');
            if (($scope.checkboxmodel.StockP == true && $scope.checkboxmodel.StockM == true) || ($scope.checkboxmodel.StockP == false && $scope.checkboxmodel.StockM == false)) {
                  var Stock = ""
            } else if ($scope.checkboxmodel.StockP == true) {
                  var Stock = "Plus"
            } else if ($scope.checkboxmodel.StockM == true) {
                  var Stock = "Minus";
            }


            var Param = "?Stock=" + Stock + "&MainCompany=" + $scope.Filtermodel.MainCompany + "&SubCompany=" + $scope.Filtermodel.SubCompany + "&ProductGroup=" + $scope.Filtermodel.ProductGroup + "&search=" + search + "&ObjAdvanceSearch=" + ObjAdvanceSearch + "&idLocations=" + idLocations + "&CustomerGroup=" + CustomerGroup + "&StartDate=" + moment($scope.Filtermodel.StartDate).format('YYYY-MM-DD') + "&EndDate=" + moment($scope.Filtermodel.EndDate).format('YYYY-MM-DD') + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order);
            console.log(Param)
            window.location = $rootScope.RoutePath + "report/ExportStockBalanceReport" + Param;
      }
      // Alias
      $rootScope.ResetAll = $scope.init;

      $scope.init();

});