app.controller('ProfitProgressReportController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

      $rootScope.BackButton = true;
      $scope.init = function () {
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
                  bill: true,
                  product: false,
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
                  GST: 0,
                  GrossAmt: 0.0,
                  Profit: 0,
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
                        url: $rootScope.RoutePath + 'report/GetAllProfitProgressReportDynamic',
                        data: function (d) {
                              if ($scope.Searchmodel.Search != undefined) {
                                    d.search = $scope.Searchmodel.Search;
                              }
                              d.CustomerGroup = $localstorage.get('CustomerGroup')
                              d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                              $scope.order = d.order;
                              $scope.columns = d.columns;
                              d.StartDate = $scope.Filtermodel.StartDate
                              d.EndDate = $scope.Filtermodel.EndDate
                              d.MainCompany = $scope.Filtermodel.MainCompany
                              d.SubCompany = $scope.Filtermodel.SubCompany
                              d.GroupByItem = $scope.checkboxmodel.product
                              console.log(d)
                              return d;
                        },
                        type: "get",
                        dataSrc: function (json) {

                              if (json.success != false) {
                                    $scope.lstdata = json.data;
                                    console.log(json);
                                    $scope.$apply(function () {
                                          $scope.FinalTotalmodel.GST = parseFloat(json.GST).toFixed(2);
                                          $scope.FinalTotalmodel.GrossAmt = parseFloat(json.GrossAmt).toFixed(2);
                                          $scope.FinalTotalmodel.Profit = parseFloat(json.Profit).toFixed(2);
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
                              "data": "DocDate",
                              "defaultContent": "N/A"
                        }, //1        //1
                        {
                              "data": "docno",
                              "defaultContent": "N/A"
                        }, //2        //2
                        {
                              "data": "ItemName",
                              "defaultContent": "N/A"
                        }, //Drug                              //4        //4
                        {
                              "data": "BatchNo",
                              "defaultContent": "N/A"
                        }, //5        //5
                        {
                              "data": "qty",
                              "defaultContent": "N/A"
                        }, //7        //6
                        {
                              "data": "Margin",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Profit",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "GST",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "GrossAmt",
                              "defaultContent": "N/A"
                        }, //13       //10
                  ],
                  "columnDefs": [{
                        "render": function (data, type, row, meta) {
                              return meta.row + meta.settings._iDisplayStart + 1;
                        },
                        "targets": 0,
                  }, {
                        "render": function (data, type, row, meta) {
                              return data.toFixed(2)
                        },
                        "targets": [6, 7, 8, 9, ],
                        className: "right-aligned-cell"
                  }, {
                        "visible": $scope.checkboxmodel.bill,
                        "targets": [1, 2],
                  }]
            });

      }

      $scope.ShowHideCol = function (o) {
            if (o == 'product') {
                  $scope.checkboxmodel.bill = !$scope.checkboxmodel.bill

            } else {
                  $scope.checkboxmodel.product = !$scope.checkboxmodel.product
            }
            InitDataTable()
      }

      $scope.GotoDrug = function (id) {
            var SelectedItem = _.findWhere($scope.lstdata, {
                  id: id
            });
            $rootScope.SelectedDrug = SelectedItem.Drug
            $state.go('app.DrugMaster')
      }

      $scope.Export = function () {
            if ($scope.Searchmodel.Search != undefined) {
                  var search = $scope.Searchmodel.Search;
            }
            var Batch = $scope.checkboxmodel.Batch
            var ObjAdvanceSearch = $scope.modelAdvanceSearch != null ? JSON.stringify($scope.modelAdvanceSearch) : '';
            var CurrentOffset = $scope.CurrentOffset;
            var idLocations = $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations');
            var CustomerGroup = $localstorage.get('CustomerGroup')

            var Param = "?search=" + search + "&GroupByItem=" + $scope.checkboxmodel.product + "&ObjAdvanceSearch=" + ObjAdvanceSearch + "&idLocations=" + idLocations + "&Batch=" + Batch + "&CustomerGroup=" + CustomerGroup + "&StartDate=" + moment($scope.Filtermodel.StartDate).format('YYYY-MM-DD') + "&EndDate=" + moment($scope.Filtermodel.EndDate).format('YYYY-MM-DD') + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order);

            window.location = $rootScope.RoutePath + "report/ExportProfitProgressReport" + Param;
      }

      $scope.ExportWithQty = function () {
            console.log($scope.lstdata)
      }
      // Alias
      $rootScope.ResetAll = $scope.init;

      $scope.init();

});