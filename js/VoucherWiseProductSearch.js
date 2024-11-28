app.controller('VoucherWiseProductSearchController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

      $rootScope.BackButton = true;
      $scope.init = function () {
            setTimeout(() => {
                  $("#mytext").focus();
            }, 1000);
            $scope.modelAdvanceSearch = null;
            ManageRole();
            $scope.GetAllCustomer();
            $scope.GetAllParentItemCategory();
            $scope.ResetModel();
            setTimeout(function () {
                  InitDataTable();
            })
      };

      function ManageRole() {
            var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
                  return Role == "Admin";
            })
            $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
      }

      $scope.GetAllCustomer = function () {
            var params = {
                  CustomerGroup: $localstorage.get('CustomerGroup'),
                  CreatedBy: $scope.IsAdmin ? '' : parseInt($localstorage.get('UserId')),
                  LoginUserCode: $localstorage.get('UserCode'),
            }
            $http.get($rootScope.RoutePath + 'customer/GetAllCustomerAdvance', {
                  params: params
            }).then(function (res) {
                  $scope.lstCustomer = res.data.data;
            });
      }

      $scope.GetAllParentItemCategory = function () {
            $http.get($rootScope.RoutePath + 'itemcategory/GetAllItemCategory').then(function (res) {
                  $scope.lstParentItemCategory = res.data.data;

            });
      }

      $scope.GetAllItemSearch = function (ItemName) {
            if ($scope.Searchmodel.Search == '') {
                  $scope.Filtermodel.ItemCode = ''
                  $scope.Filtermodel.ItemName = ''
                  $scope.FilterTableData()
            }
            if (ItemName) {
                  var params = {
                        ItemName: ItemName,
                        CustGroupName: $scope.CurrentCustomerGroup == 'Genmed' ? null : $scope.CurrentCustomerGroup
                  }
                  $http.get($rootScope.RoutePath + 'item/GetAllItemBySearchText', {
                        params: params
                  }).then(function (res) {
                        $scope.lstItemsSearch = res.data.data;
                  });
            } else {
                  $scope.lstItemsSearch = [];
            }

      };

      $scope.SelectItem = function (i) {
            if (i) {
                  $scope.Filtermodel.ItemCode = i.ItemCode;
                  $scope.Filtermodel.ItemName = i.ItemName;
                  $scope.Searchmodel.Search = i.ItemName
            }
            $scope.lstItemsSearch = [];
            $scope.FilterTableData()
      }

      //Table function End
      $scope.ResetModel = function () {
            $scope.Searchmodel = {
                  Search: '',
            }

            $scope.Filtermodel = {
                  DocType: '',
                  StartDate: moment().format(),
                  EndDate: moment().format(),
                  ProductGroup: '',
                  ItemName: '',
                  ItemCode: '',
                  PartyName: ''
            }

            $scope.FinalTotalmodel = {
                  InwardQty: 0,
                  OutwardQty: 0.0,
                  Stock: 0,
            }
      };

      $scope.FilterData = function () {
            $('#VoucherWiseProductSearchTable').dataTable().api().ajax.reload();
      }

      // $scope.EnableFilterOption = function () {
      //     $(function () {
      //         $(".CustFilter").slideToggle();
      //     });
      // };

      // $scope.FilterAdvanceData = function (o) {
      //     $scope.modelAdvanceSearch = o;
      //     InitDataTable()
      //     // $('#VoucherWiseProductSearchTable').dataTable().api().ajax.reload();
      // }

      $scope.FilterTableData = function (o) {
            InitDataTable()
      }

      //Set Table
      function InitDataTable() {
            if ($.fn.DataTable.isDataTable('#VoucherWiseProductSearchTable')) {
                  $('#VoucherWiseProductSearchTable').DataTable().destroy();
            }
            $('#VoucherWiseProductSearchTable').DataTable({
                  "processing": true,
                  "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                  "serverSide": true,
                  "responsive": true,
                  "aaSorting": [4, 'DESC'],
                  "ajax": {
                        url: $rootScope.RoutePath + 'item/GetAllVoucherWiseProductSearchDynamic',
                        data: function (d) {
                              $scope.order = d.order;
                              $scope.columns = d.columns;
                              if ($scope.Filtermodel.ItemName != undefined) {
                                    d.ItemCode = $scope.Filtermodel.ItemCode;
                              }
                              // d.CustomerGroup = $localstorage.get('CustomerGroup')
                              d.idLocations = $localstorage.get('idLocations');
                              // d.modelAdvanceSearch = $scope.modelAdvanceSearch;
                              d.UserCode = $localstorage.get('UserCode')

                              d.DocType = $scope.Filtermodel.DocType
                              d.StartDate = $scope.Filtermodel.StartDate
                              d.EndDate = $scope.Filtermodel.EndDate
                              d.ProductGroup = $scope.Filtermodel.ProductGroup
                              d.PartyName = $scope.Filtermodel.PartyName
                              return d;
                        },
                        type: "get",
                        dataSrc: function (json) {
                              console.log(json)
                              if (json.success != false) {
                                    $scope.lstdata = json.data;
                                    $scope.$apply(function () {
                                          $scope.FinalTotalmodel.InwardQty = parseFloat(json.TotalPurchase).toFixed(2);
                                          $scope.FinalTotalmodel.OutwardQty = parseFloat(json.TotalSale).toFixed(2);
                                          $scope.FinalTotalmodel.Stock = parseFloat(json.Stock).toFixed(2);
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
                        },
                        {
                              "data": "CustomerName",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "ItemName",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "BillType",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "DocNo",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "DocDate",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Purchase",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Sales",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Rate",
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
                                    return moment(data).format('DD-MM-YYYY');
                              },
                              "targets": 5
                        },
                        {
                              "render": function (data, type, row) {
                                    if (data != null && data != undefined && data != '') {
                                          var val = parseFloat(data);
                                          return val.toFixed(0);
                                    } else {
                                          return 0;
                                    }
                              },
                              "targets": [6, 7],
                              className: "right-aligned-cell"
                        },
                        {
                              "render": function (data, type, row) {
                                    if (data != null && data != undefined && data != '') {
                                          if (row.Sales > 0) {
                                                if ($localstorage.get('CustomerGroup') == 'Shop') {
                                                      var val = parseFloat(row.Rate) + parseFloat(row.Tax / row.Sales);
                                                      return val.toFixed(2);
                                                } else {
                                                      var val = parseFloat(data);
                                                      return val.toFixed(2);
                                                }
                                          } else {
                                                var val = parseFloat(data);
                                                return val.toFixed(2);
                                          }
                                    } else {
                                          return 0;
                                    }
                              },
                              "targets": [8],
                              className: "right-aligned-cell"
                        },
                  ]
            });

      }



      $scope.Export = function () {
            if ($scope.Searchmodel.Search != undefined) {
                  var search = $scope.Searchmodel.Search;
            }
            var ObjAdvanceSearch = $scope.modelAdvanceSearch != null ? JSON.stringify($scope.modelAdvanceSearch) : '';
            var CurrentOffset = $scope.CurrentOffset;
            var idLocations = $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations');
            var CustomerGroup = $localstorage.get('CustomerGroup')
            var Param = "?search=" + search + "&ObjAdvanceSearch=" + ObjAdvanceSearch + "&idLocations=" + idLocations + "&CustomerGroup=" + CustomerGroup + "&StartDate=" + moment($scope.Filtermodel.StartDate).format('YYYY-MM-DD') + "&EndDate=" + moment($scope.Filtermodel.EndDate).format('YYYY-MM-DD') + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order);

            window.location = $rootScope.RoutePath + "report/ExportStockBalanceReport" + Param;
      }
      // Alias
      $rootScope.ResetAll = $scope.init;

      $scope.init();

});