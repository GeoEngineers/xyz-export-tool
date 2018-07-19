import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Basemap = require("esri/Basemap");
import Point = require("esri/geometry/Point");
import FeatureLayer = require("esri/layers/FeatureLayer");
import ScaleBar = require("esri/widgets/ScaleBar");
import XYZ = require("app/xyzWidget.js");
import Collection = require("esri/core/Collection"):

const map = new EsriMap({
  basemap: "streets" as any as Basemap,
  ground: "world-elevation" as any as Basemap
});

const view = new MapView({
  map: map,
  container: "viewDiv",
  center: [-100, 40],
  zoom: 4,
});

let getNorthingAndEasting = function(feature){
	console.log('feature', feature)
	return { e: 'undefined', n: 'undefined' }
}

view.when(() => {
	let graphics = [];
	// let graphics = new Collection();

	const layer = new FeatureLayer({
	  fields: [
		  {
			  name: "ObjectID",
			  alias: "ObjectID",
			  type: "oid"
		  },
		  // {
			//   name: "type",
			//   alias: "Type",
			//   type: "string"
		  // },
		  {
			  name: "Name",
			  alias: "Name",
			  type: "string"
		  },
	  ],
	  objectIdField: "ObjectID",
	  geometryType: "point",
	  source: graphics,
	  spatialReference: {
		  wkid: 4326
	  },
	  // url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/WorldCities/FeatureServer/0",
	  renderer: {
		  type: 'simple',
		  symbol: {
			  type: 'simple-marker',
			  size: 10,
			  color: '#ff4000',
			  outline: {
				  color: [255,64,0,0.4],
				  width: 7
			  }
		  }
	  }
	});

	map.add(layer);

	const statePlaneLayer = new FeatureLayer({
		url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_State_Plane_Zones_NAD83/FeatureServer/0'
	})

	map.add(statePlaneLayer);

	view.on('click', function(event){
		// console.log('map.ground', map.ground.queryElevation(event.mapPoint))
		map.ground.queryElevation(event.mapPoint, {
			returnSampleInfo: true,
			demResolution: 'finest-contiguous'
			})
			.then(function(result){
				statePlaneLayer.queryFeatures({
			    	geometry: result.geometry,
			    	returnGeometry: true
			    }).then(function(results) {
					console.log('results', results.get('features')[0].get('attributes'))
			      // do something with the resulting graphics
			    	// graphics = results.features;
					// console.log('result.geometry', result.geometry)
					// console.log('result.sampleInfo', result.sampleInfo)
					// let s = { e: undefined, n: undefined };
					let s = getNorthingAndEasting(result.geometry)
					// console.log('stuff', getNorthingAndEasting(result.sampleInfo))
					let point = {
						geometry: new Point({
							x: event.mapPoint.longitude,
							y: event.mapPoint.latitude,
							z: result.geometry.z
						}),
						attributes: {
							ObjectID: layer.source.length + 1,
							type: "thing " + (layer.source.length + 1),
							name: "test " + (layer.source.length + 1),
							statePlaneCoordSystem: 'test',
							easting: s.e,
							northing: s.n
						}
					};
					layer.source.add(point)
					// console.log('point', point);
			    });

			});

	})

	const scaleBar = new ScaleBar({
		view: view,
		unit: 'dual'
	});

	view.ui.add(scaleBar, {
		position: "bottom-left"
	})

	var widget = new XYZ({
		view: view,
		layer: layer
	});


	view.ui.add(widget, "bottom-right")
});
