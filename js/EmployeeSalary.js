app.controller('EmployeeSalaryController', function ($scope, $rootScope, $http, $localstorage, $ionicPopup, $state, $ionicLoading, $ionicScrollDelegate, $ionicModal, $compile, $filter) {

    $scope.init = function () {
        var now = new Date();
        $scope.lstyear = [{ id: 2017, Year: "2017" }, { id: 2018, Year: "2018" }, { id: 2019, Year: "2019" }, { id: 2020, Year: "2020" }, { id: 2021, Year: "2021" }, { id: 2022, Year: "2022" }, { id: 2023, Year: "2023" }, { id: 2024, Year: "2024" }, { id: 2025, Year: "2025" }];
        $scope.lstMonth = [
            { id: "0", Month: "January" }, { id: "1", Month: "February" }, { id: "2", Month: "March" }, { id: "3", Month: "April" },
            { id: "4", Month: "May" }, { id: "5", Month: "June" }, { id: "6", Month: "July" }, { id: "7", Month: "August" },
            { id: "8", Month: "September" }, { id: "9", Month: "October" }, { id: "10", Month: "November" }, { id: "11", Month: "December" }
        ];

        var exists = $filter('filter')($scope.lstyear, { Year: new Date().getFullYear() })
        if (exists == null) {
            $scope.lstyear.push({ id: new Date().getFullYear(), Year: new Date().getFullYear() });
        }
        $scope.initModel();
        $scope.GetAllEmployee();
        $scope.GetAllEmployeeSalary();
        $scope.flag = false;
        $rootScope.BackButton = true;
    }
    $rootScope.ResetAll = function () {
        $scope.init();
    }

    $scope.GetAllEmployeeSalary = function () {
        $http.get($rootScope.RoutePath + "employee/GetAllEmployeeSalary").then(function (data) {
            $scope.lstSalary = data.data;
            setTimeout(function () {
                InitDataTable();
            }, 10)
        })
    }

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#EMPSALARY').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#EMPSALARY').dataTable().fnFilter("");
        }
    }

    //Reload DataTable
    function InitDataTable() {
        $(document).ready(function () {
            setTimeout(function () {
                $('#EMPSALARY').DataTable({
                    "responsive": true,
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
            });
        })
    }

    $scope.initModel = function () {
        $scope.TotalDays = 0;
        $scope.AbsentDays = 0;
        $scope.PresentDays = 0;
        $scope.HalfDays = 0;
        $scope.model = {
            id: 0,
            idUser: "",
            Amount: '',
            TobePaidAmount: "",
            SalaryMonth: "",
            SalaryYear: "",
        }
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.FormEMPSubmit = false;
    }

    $scope.GetAllEmployee = function () {
        $http.get($rootScope.RoutePath + "employee/GetAllEmployee").then(function (data) {
            $scope.lstEmployee = data.data;
        })
    }

    $scope.EditEmpSalary = function (o) {
        $scope.model.id = o.id;
        $scope.model.idUser = o.idUser;
        $scope.model.Amount = o.Amount;
        $scope.model.TobePaidAmount = o.TobePaidAmount;
        $scope.model.SalaryMonth = (o.SalaryMonth).toString();
        $scope.model.SalaryYear = (o.SalaryYear).toString();
        $scope.CalculateSalary();
        $rootScope.BackButton = false;
        $scope.flag = true;
    }


    $scope.CalculateSalary = function () {
        if ($scope.model.idUser != "" && $scope.model.SalaryMonth != undefined && $scope.model.SalaryMonth != "" && $scope.model.SalaryMonth != null && $scope.model.SalaryYear != undefined && $scope.model.SalaryYear != '' && $scope.model.SalaryYear != null) {
            var startDate = $rootScope.convertdate(new Date(parseInt($scope.model.SalaryYear), parseInt($scope.model.SalaryMonth), 1), "sdt");
            var endDate = $rootScope.convertdate(new Date(parseInt($scope.model.SalaryYear), parseInt($scope.model.SalaryMonth) + 1, 0), "edt");
            var param = {
                idUser: parseInt($scope.model.idUser),
                Month: $scope.model.SalaryMonth,
                Year: $scope.model.SalaryYear,
                startdate: new Date(startDate),
                enddate: new Date(endDate)
            };

            $http.get($rootScope.RoutePath + "employee/GetEmployeeAttendenceByIdEmployee", { params: param }).then(function (data) {
                $scope.lstEmpAtten = data.data;
                $scope.TotalDays = data.data.length;
                $scope.AbsentDays = $filter('filter')(data.data, { IsPresent: 0 }).length;
                $scope.PresentDays = $filter('filter')(data.data, { IsPresent: 1 }).length;
                $scope.HalfDays = $filter('filter')(data.data, { IsHalfDay: 1 }).length;
                CountSalary($scope.TotalDays, $scope.PresentDays, $scope.HalfDays);
            });
        }
    }

    function CountSalary(TotalDays, prasentDays, TotalHalfDays) {
        if ($scope.model.Amount != '' && $scope.model.Amount != 0) {
            var perdayval = 0;
            perdayval = parseFloat((parseFloat($scope.model.Amount) / parseInt(TotalDays))).toFixed(2);
            var TotalHalfAMT = parseFloat((perdayval / 2) * parseInt(TotalHalfDays)).toFixed(2);
            var TobeAMT = parseFloat((parseInt(prasentDays) * parseFloat(perdayval)) - parseFloat(TotalHalfAMT));
            $scope.model.TobePaidAmount = Math.round(TobeAMT);
        }
    }

    $scope.SaveEmployeeSalary = function (form) {

        if (form.$invalid) {
            $scope.FormEMPSubmit = true;
            return;
        }
        $scope.FormEMPSubmit = false;
        $rootScope.ShowLoader();
        $http.post($rootScope.RoutePath + "employee/SaveEmployeeSalary", $scope.model).then(function (res) {
            if (res.data.data == 'TOKEN') {
                $rootScope.logout();
            }
            if (res.data.success) {
                $ionicScrollDelegate.scrollTop();
                $scope.init();
            }
            $ionicLoading.show({
                template: res.data.message
            });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
        }).catch(function (err) {
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
        });
    }


    $scope.Reset = function () {
        $scope.flag = true;
        $scope.initModel();
        $rootScope.BackButton = false;
    }

    $scope.gotoList = function () {
        $scope.init();
    }

    $rootScope.convertdate = function (date1, flg) {
        var date = new Date(date1);
        var firstdayMonth = date.getMonth() + 1;
        var firstdayDay = date.getDate();
        var firstdayYear = date.getFullYear();
        var firstdayHours = date.getHours();
        var firstdayMinutes = date.getMinutes();
        var firstdaySeconds = date.getSeconds();
        if (flg == 1) {
            return ("00" + firstdayHours.toString()).slice(-2) + ":" + ("00" + firstdayMinutes.toString()).slice(-2) + ":" + ("00" + firstdaySeconds.toString()).slice(-2);
        } else if (flg == 2) {
            return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
        } else if (flg == "sdt") {
            return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00").toString().slice(-2) + ':' + ("00").toString().slice(-2) + ':' + ("00").toString().slice(-2);
        } else if (flg == "edt") {
            return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("23").toString().slice(-2) + ':' + ("59").toString().slice(-2) + ':' + ("59").toString().slice(-2);
        } else {
            return ("00" + firstdayDay.toString()).slice(-2) + "/" + ("00" + firstdayMonth.toString()).slice(-2) + "/" + ("0000" + firstdayYear.toString()).slice(-4);
        }
    }
    // $rootScope.ResetAll = $scope.gotoList();
    $scope.init();
})