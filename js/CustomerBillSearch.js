app.controller('CustomerBillSearchController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

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
            })
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
                  SaleRate: true,
                  PurRate: true,
                  Pack: true,
                  SubCompany: true,
                  ItemCode: false,
                  BatchNo: false,
                  ExpiryDate: false,
                  Qty: false,
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
            $('#CustomerBillSearchTable').dataTable().api().ajax.reload();
      }

      // $scope.EnableFilterOption = function () {
      //     $(function () {
      //         $(".CustFilter").slideToggle();
      //     });
      // };

      // $scope.FilterAdvanceData = function (o) {
      //     $scope.modelAdvanceSearch = o;
      //     InitDataTable()
      //     // $('#CustomerBillSearchTable').dataTable().api().ajax.reload();
      // }

      $scope.FilterTableData = function (o) {
            InitDataTable()
      }

      //Set Table
      function InitDataTable() {
            if ($.fn.DataTable.isDataTable('#CustomerBillSearchTable')) {
                  $('#CustomerBillSearchTable').DataTable().destroy();
            }
            $('#CustomerBillSearchTable').DataTable({
                  "processing": true,
                  "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                  "serverSide": true,
                  "responsive": true,
                  "aaSorting": [0, 'DESC'],
                  "ajax": {
                        url: $rootScope.RoutePath + 'report/GetAllCustomerBillSearchDynamic',
                        data: function (d) {
                              if ($scope.Searchmodel.Search != undefined) {
                                    d.search = $scope.Searchmodel.Search;
                              }

                              d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                              $scope.order = d.order;
                              $scope.columns = d.columns;
                              d.StartDate = $scope.Filtermodel.StartDate
                              d.EndDate = $scope.Filtermodel.EndDate
                              console.log(d)
                              return d;
                        },
                        type: "get",
                        dataSrc: function (json) {

                              if (json.success != false) {
                                    $scope.lstdata = json.data;
                                    console.log(json);
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
                              "data": "CustomerName",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "PhoneNumber",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Address1",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "DocNo",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "NetTotal",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "DocDate",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Ref",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Description",
                              "defaultContent": "N/A"
                        },


                  ],
                  "columnDefs": [{
                        "render": function (data, type, row, meta) {
                              return meta.row + meta.settings._iDisplayStart + 1;
                        },
                        "targets": 0,
                  }, ]
            });

      }

      $scope.ShowHideCol = function () {
            // $('#CustomerBillSearchTable').dataTable().api().ajax.reload();
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
            var Param = "?search=" + search + "&ObjAdvanceSearch=" + ObjAdvanceSearch + "&idLocations=" + idLocations + "&Batch=" + Batch + "&CustomerGroup=" + CustomerGroup + "&StartDate=" + moment($scope.Filtermodel.StartDate).format('YYYY-MM-DD') + "&EndDate=" + moment($scope.Filtermodel.EndDate).format('YYYY-MM-DD') + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order);

            window.location = $rootScope.RoutePath + "report/ExportCustomerBillSearchReport" + Param;
      }

      $rootScope.ResetAll = $scope.init;

      $scope.init();

});