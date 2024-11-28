app.controller('AppointmentController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

    console.log('AppointmentController initialized');

    // Initialize form data object
    $scope.o = {
        RCHQDate: '',
        RCHQTime: '',
        name: '',
        appointmentType: 'consultation',
        description: '',
    };

    // Initialization function
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.GetAllAppointment();
        $scope.modelAdvanceSearch = null;
        $scope.ResetModel();
        // setTimeout(function () {
        //     InitDataTable();
        // })
    };

    $scope.GetAllAppointment = function () {
        // $http.get('localhost:20031/appointment/GetAllApplication').then(function (res) {

        $http.get($rootScope.RoutePath + 'appointment/GetAllApplication').then(function (res) {
            $scope.lstAppointment = res.data.data;
            if ($scope.IsCustomer == true) {
                $scope.lstAppointment = _.where($scope.lstAppointment, { id: parseInt($scope.idLocations) });
            }
            $scope.lstAppointmentsDefualt = res.data.data;
            $scope.TotalRecord = $scope.lstAppointment.length;
            $(document).ready(function () {
                $('#ApplicationTable').dataTable().fnClearTable();
                $('#ApplicationTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#ApplicationTable').DataTable({
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
    }

    // Function to handle form submission
    $scope.SaveAppointment = function (event) {
        event.preventDefault()
        if ($scope.o.RCHQDate == null || $scope.o.RCHQDate == '') {
            return $ionicPopup.alert({
                title: 'Error',
                template: 'Please select an Appointment date!'
            });
        } else if ($scope.o.RCHQTime == null || $scope.o.RCHQTime == "") {
            return $ionicPopup.alert({
                title: 'Error',
                template: 'Please select an Appointment time!'
            });
        } else if ($scope.o.name == null || $scope.o.name == "") {
            return $ionicPopup.alert({
                title: 'Error',
                template: 'Please enter your name!'
            });

        } else if ($scope.o.description == null || $scope.o.description == "") {
            return $ionicPopup.alert({
                title: 'Error',
                template: 'Please enter description!'
            });
        } else if ($scope.o.description != null && $scope.o.description.length < 50) {
            return $ionicPopup.alert({
                title: 'Error',
                template: 'Make sure your description must be have at least 50 characters!'
            });
        } else if ($scope.o.description != null && $scope.o.description.length > 1000) {
            return $ionicPopup.alert({
                title: 'Error',
                template: `Make sure your description don't have more than 1000 characters!`
            });
        }

        const time = new Date($scope.o.RCHQTime);
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        const seconds = time.getSeconds().toString().padStart(2, '0');

        // Format the time as HH:mm:ss
        const formattedTime = `${hours}:${minutes}:${seconds}`;
        // Gather form data
        const formData = {
            date: $scope.o.RCHQDate,
            time: formattedTime,
            name: $scope.o.name,
            appointmentType: $scope.o.appointmentType,
            description: $scope.o.description
        };

        // Log the collected data to verify
        console.log("Form Data:", formData);

        // You can now send this data to an API or further processing
        // For example, sending data via HTTP POST:
        $http.post($rootScope.RoutePath + 'appointment/SaveAppointment', formData).then(function (response) {
            // Handle the response here (success)
            console.log('Appointment saved successfully:', response);
            $scope.GetAllAppointment()
            $scope.ResetModel();
            // You can show a success message or redirect to another page
            $ionicPopup.alert({
                title: 'Success',
                template: 'Appointment saved successfully!'
            });
        }).catch(function (error) {
            // Handle error
            console.error('Error saving appointment:', error);
            $ionicPopup.alert({
                title: 'Error',
                template: 'Failed to save appointment. Please try again.'
            });
        });
    };

    $scope.ResetModel = function () {
        $scope.o = {
            RCHQDate: '',
            RCHQTime: '',
            name: '',
            appointmentType: 'consultation',
            description: '',
        };
    }
    // Call the init function
    $scope.init();

});
