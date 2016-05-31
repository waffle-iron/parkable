// TODO: I could see this broken up into separate components
// * The mainMap component that contains everything
// * A component just for the searching and places api
// * A component that just adds the markers to the map
// * A component that adds the location information to the map

var mainMap = angular.module('mainMap', ['ngMaterial','ngMap', 'firebase']);

mainMap.controller('mainMapController', ['$scope', 'NgMap', '$firebaseArray', '$mdBottomSheet' , function($scope, NgMap, $firebaseArray, $mdBottomSheet){
  console.log("CONTROLLER!!!")
  var ref = new Firebase("https://parkable.firebaseio.com/markers");

  this.markers = $firebaseArray(ref);
  this.test = this.markers.length;


  // TODO: How do deal with this? https://johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;

  // Markers
  // TODO: dynamicMarkers and MarkerClusterer don't sync with firebase
   vm.dynMarkers = [];
   NgMap.getMap().then(function(map) {
     vm.map = map;
     for (var i=0; i<vm.markers.length; i++) {
      //  console.log(vm.markers[i])
       var latLng = new google.maps.LatLng(vm.markers[i].lat, vm.markers[i].lng);
       var marker = new google.maps.Marker({position:latLng});
       vm.dynMarkers.push(marker);
          google.maps.event.addListener(marker, 'click', function() {
            vm.onMarkerClicked({latLng: marker.position})
          });
     }
     vm.markerClusterer = new MarkerClusterer(map, vm.dynMarkers, {});

    // places
    // TODO: maybe write our own directive for this: http://stackoverflow.com/questions/30274617/google-maps-autocomplete-with-material-design
    vm.placeChanged = function() {
      console.log("PLACE CHANGED")
      vm.place = this.getPlace();
      console.log(vm.place)
      console.log('location', vm.place.geometry.location);
      vm.map.setCenter(vm.place.geometry.location);
    }
    if(navigator.geolocation) {
      console.log("GOOD")
    }else {
      console.log("BAD")
    }

    // Center to current position on load
    navigator.geolocation.getCurrentPosition(function(r){
        var latLng = new google.maps.LatLng(r.coords.latitude, r.coords.longitude);
        vm.map.setCenter(latLng);
    }, function(){
      console.log("error")
    });

   });

   // TODO Move this logic...
   // Show the navigation/report onMarkerClicked
   this.onMarkerClicked = function(marker){
     lat = marker.latLng.lat();
     lng = marker.latLng.lng()
     console.log(lat)
     console.log(lng)

     $mdBottomSheet.show({
       templateUrl: 'components/mainMap/navigateViewSheet.html',
       controller: 'NavigateViewSheetController'
     });
   }

   // Listen to changes in map center
  $scope.$on('changeCenter', function(event, newCenter) {
    console.log(newCenter)
    vm.map.setCenter(newCenter)
    console.log(vm.markers)
    vm.markers = $firebaseArray(ref);
  });
}]);

mainMap.controller('NavigateViewSheetController', function($mdBottomSheet){
  console.log("DEFINED")
  this.cancel = function(){
    console.log(this);
    $mdBottomSheet.cancel();
  }
  this.navigate = function(){
    $mdBottomSheet.cancel();
    window.location = "maps:daddr=" + lat + "," + lng;
  }
})

mainMap.directive('mainMapView', function(){
  return {
    restrict: 'E',
    templateUrl: 'components/mainMap/mainMapView.html',
    controller: 'mainMapController',
    controllerAs: 'vm'
  };
});

var app = angular.module("sampleApp", ["firebase"]);