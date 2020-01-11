// dataset object which is available from klipfolio
var data = this.dataModel;
//create the geojson source format supported by the mapbox-gl
var geojsonDataSource = [];

/*for(var i =0; i < data.length; i++) {
    if (data.long[i].toString().trim().length > 0 && 
        data.lat[i].toString().trim().length > 0 && 
        data.long[i].toString().trim() !== "&nbsp;" && 
        data.lat[i].toString().trim() !== "&nbsp;") 
        {
            geojsonDataSource.push({"type": "Feature",
            "properties": {"description": "<p>" + data.id[i] + "</p>"},
            "geometry": {"type": "Point","coordinates": [parseFloat(data.long[i]),parseFloat(data.lat[i])]}});
        } 
}*/

_.each(data.data, function(element){
    geojsonDataSource.push({"type": "Feature",
            "properties": {
                            "description": "<p>" + element.id + "</p>",
                            "shop_status": element.shop_status
                          },
            "geometry": {"type": "Point","coordinates": [Number(element.long),Number(element.lat)]}})
});


//finalizing out datasource object
var dataSource = {
  "type": "FeatureCollection",
  "features": geojsonDataSource
};


//basemap
require(["https://api.mapbox.com/mapbox-gl-js/v1.6.1/mapbox-gl.js"], function(mapboxgl){
    console.log(geojsonDataSource);
    mapboxgl.accessToken =
    "pk.eyJ1IjoiZGFubnlwaHlvIiwiYSI6ImNrMzQzYWZtOTBoeWMzbW55NGFsYWZzYXUifQ.Q-6Gk9Uy3mOul5pcprE8cg";
    var map = new mapboxgl.Map({
        container: "map", // container id
        style: "mapbox://styles/mapbox/streets-v11", // stylesheet location
        center: [96.16, 16.90], // starting position [lng, lat]
        zoom: 10 // starting zoom
    });
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.scrollZoom.disable()
    map.addControl(new mapboxgl.NavigationControl());
    map.on('load', function() {
        map.addLayer({
            'id': 'points',
            'type': 'circle',
            'source': {
                'type': 'geojson',
                'data': dataSource
            },
            'paint': {
                'circle-radius': 10,
                //'circle-color': '#007cbf',
                'circle-opacity': 0.5,
                'circle-color': [
                    'match',
                    ['get', 'shop_status'],
                    'Family',
                    '#2ecc71',
                    'Inlaw',
                    '#f7dc6f',
                    'Prospect',
                    '#ec7063',
                    '#ccc'
                ]
            }
        });
    });

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('click', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['points'] // Layer Id
        });
        if (!features.length) {
            return;
        }
        var feature = features[0];
        var popup = new mapboxgl.Popup({ offset: [0, -15] })
            .setLngLat(feature.geometry.coordinates)
            .setHTML('<h3>' + feature.properties.description + '</h3><p>' + 
                feature.properties.shop_status + '</p>')
            .setLngLat(feature.geometry.coordinates)
            .addTo(map);
    });

    var fly = document.getElementById('fly');
    var city = document.getElementById('city');
    var viewport = {"Yangon": [96.16, 16.90], "Mandalay": [96.12, 21.94]}

    fly.addEventListener('click', function() {
        // Fly to a random location by offsetting the point -74.50, 40
        // by up to 5 degrees.
        map.flyTo({
            center: viewport[city.value],
            essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
    });
});

