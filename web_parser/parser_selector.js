

var concatChar = ';';
var statData;
var coordArrayAng=[];
var coordArrayRect=[];

/*********************************************
Holds actions taken when the page is loaded
*********************************************/



$(document).ready(function(){





	// Query stats of postal areas
	readStats();







	//Query venues
	//var venueData=readVenues();

	


});

//reading postal area stats from pno_tilasto_2015_evesav.csv
function readVenues()
{

	$.ajax({
		url: 'getVenueData.php',
		type: 'GET',
		cache: false,
		success: function(response) {

			console.log('parsing readVenues ajax reply');
			
			//console.log(response);

			var venuesArray=handleXML(response);
		

			//translate csv to js array object
			//var mainArray=generateArrays(response);

			//get coordinates and transform them to WGS84
			//var coordArray=getcoordinateArrays(mainArray);
			//var obj = JSON.parse(response);

			
			/*
				$.each(response, function(key,val){
					// do something with key and val
					document.getElementById('test_output').innerHTML = val;
					
					});
			*/

			console.log(' readVenues ajax call out');
			return venuesArray;
		}
		,
		error: function(jqXHR, exception) {
			if (jqXHR.status === 0) {
				alert('handleData: Not connect.\n Verify Network.');
			} else if (jqXHR.status == 404) {
				alert('handleData:Requested page not found. [404]');
			} else if (jqXHR.status == 500) {
				alert('handleData:Internal Server Error [500].');
			} else if (exception === 'parsererror') {
				alert('handleData:Requested JSON parse failed.');
			} else if (exception === 'timeout') {
				alert('handleData:Time out error.');
			} else if (exception === 'abort') {
				alert('handleData:Ajax request aborted.');
			} else {
				alert('handleData:Uncaught Error.\n' + jqXHR.responseText);
			}

			return 'none';
		
		}

});
}

//reading postal area stats from pno_tilasto_2015_evesav.csv
function readStats()
{

	$.ajax({
		url: 'getStatData.php',
		type: 'GET',
		cache: false,
		success: function(response) {

			console.log('parsing readStats ajax reply');
			
			//translate csv to js array object
			statData=generateArraysStats(response);

			//get coordinates and transform them to WGS84
			
			getcoordinateArraysStats(statData);
			//var obj = JSON.parse(response);

			//draw dashboard
			//drawAgeDivision(statData);

			//get postal area names from main data
			getPostalAreas(statData);

			//calculate if point belongs to district
			pointInDistrict();		

			//init map functions for testing purposes
			//initializeMap();


			/*
				$.each(response, function(key,val){
					// do something with key and val
					document.getElementById('test_output').innerHTML = val;
					
					});
			*/


			console.log('ajax vreadStats call out');
			return statData;
		}
		,
		error: function(jqXHR, exception) {
			if (jqXHR.status === 0) {
				alert('handleData: Not connect.\n Verify Network.');
			} else if (jqXHR.status == 404) {
				alert('handleData:Requested page not found. [404]');
			} else if (jqXHR.status == 500) {
				alert('handleData:Internal Server Error [500].');
			} else if (exception === 'parsererror') {
				alert('handleData:Requested JSON parse failed.');
			} else if (exception === 'timeout') {
				alert('handleData:Time out error.');
			} else if (exception === 'abort') {
				alert('handleData:Ajax request aborted.');
			} else {
				alert('handleData:Uncaught Error.\n' + jqXHR.responseText);
			}

			return 'none';
		
		}

});
}


//for pno_tilasto_2015_evesav.csv
function generateArraysStats(data)
{

console.log('generating arrays');
var finalArray=[];
var tempArray=[];
var lines = data.split('\n');

	for(var i = 0;i < lines.length;i++)
	{

		var firstPartofLine=[];
		var coordinates=[];

	    //code here using lines[i] which will give you each line
		var line=lines[i].split('MULTIPOLYGON ');

		for(var j = 0; j < line.length;j++)
		{
			//code here using lines[i] which will give you each line
			//if basic data
			if(j==0)
			{
				//console.log('data');
				//console.log(line[i]);
				firstPartofLine=line[j].split(',');
				//console.log(firstPartofLine);
			}
			//else if polygon aka 
			else
			{
				//console.log('coords');
				//console.log(line[i]);
				
				coordinates=line[j].replace(/[|&;$%@"<>()+]/g, "").split(', ');

				//console.log(coordinates);
			}

			

		}

		tempArray=firstPartofLine.concat(coordinates);
		//console.log(tempArray);
		if(tempArray.length > 1){
			finalArray.push(tempArray);
		}

		
	}

	console.log('finalArray done');
	//console.log(finalArray);

	return finalArray;

}
//for pno_tilasto_2015_evesav.csv
function getcoordinateArraysStats(data)
{

	

	for (index = 0; index < data.length; ++index) 
	{


		var subArray=data[index];

			var subCoordArrayAng=[];
			var subCoordArrayRect=[];

			for (i = 0; i < subArray.length; ++i) 
			{
				//coord

				if(i>=113)
				{
					//split easting and northing...
					var converted=subArray[i].replace(/[|&;$%@"<>()+]/g, "").split(' ')
						
						//send to transform function and add to coordArray
						subCoordArrayAng.push(transformETRStoWGS84(converted) );
						subCoordArrayRect.push([parseInt(converted[0],10),parseInt(converted[1],10) ]);
	
				}

				
			}

	
			coordArrayAng[index]=subCoordArrayAng;
			coordArrayRect[index]=subCoordArrayRect;


			
     
	}
	

	console.log('coordArrays done');
	//console.log(coordArray);


}

            
 function transformETRStoWGS84(point) {

 			/*
 	        var point = {
                easting: 474854.8, // Note: coming from Y value in kohteet dataset
                northing: 7218559.1 // Note: coming from X value in kohteet dataset
            };
            */
            

                //var pointObj = new Proj4js.Point(point[1]], point.northing); //Note the order
                var pointObj = new Proj4js.Point(point[0], point[1]); //Note the order
                var source_kohteet = new Proj4js.Proj('EPSG:3067');
                var dest_google = new Proj4js.Proj('EPSG:4326'); //dest_WGS84
                //After execution, the pointObj should have x (lon) and y (lat) keys for new coordinates values
                Proj4js.transform(source_kohteet, dest_google, pointObj);


                //OBS! the x/y order may cause some mess
                return [pointObj['y'],pointObj['x']];
} 
//handling venuedata
function handleXML(data)
{
	var parser=new DOMParser();
	//read in the data
	var xml = parser.parseFromString(data,'text/xml');
	var objects = xml.getElementsByTagName("Object");
	var arr = [];

	
	for (var key in objects){
	    arr.push([]);

	    var nodes = objects[key].childNodes;

	    for (var ele in nodes){  

	    	var values= nodes[ele].childNodes;

	    	for (var nodVal in values){  


		          arr[key].push(values[nodVal]);
		       
	    	}

	    }

	}

	console.log(arr);

	return arr;

}

function drawAgeDivision(data)
{

		var labels=[];
		var values=[];

		for (var key in data)
		{

			if(key>0){
		    	//name, 
		    	values.push([parseInt(data[key][10],10), parseInt(data[key][11])]);

		    	labels.push(data[key][2]);

		    }

		}


	           var bar4 = new RGraph.Bar({
                id: 'cvs',
                data: values,
                options: {
                    colors: ['#2A17B1', '#98ED00'],
                    labels: labels,
                    text: {
                        angle: 90
                    },
                    title: 'Ration of male and female in certain areas',
                    variant: '3d',
                    strokestyle: 'transparent',
                    ymax: Math.max(values),
                    gutter: {
                    left: 60,
                    bottom: 150,
                    top: 60
                }

                }
            }).draw()

}

function getPostalAreas(data)
{

		var select = document.getElementById('postalSelect');

		var postalAreas=[];

		for (var key in data)
		{

			if(key>0){
		    	//name, 	;
		    	postalAreas.push(data[key][2]);

		    	var opt = document.createElement('option');
			    opt.value = key;
			    opt.innerHTML = data[key][2];
			    select.appendChild(opt);
     			
		    }

		}

		


}
//event handler for postal changed function
function postalChanged() {

	console.log('changed');
	alert('changed');

	console.log($('#postalSelect option:selected').text());



	//empty canvases
	RGraph.ObjectRegistry.Clear(document.getElementById("canvas_educ"));
	RGraph.ObjectRegistry.Clear(document.getElementById("canvas_work"));
	RGraph.ObjectRegistry.Clear(document.getElementById("cvs"));
	



	//update board
	drawDashBoard($('#postalSelect option:selected').text());



}

function drawDashBoard(name)
{

		var data=statData;
		var xy=[];


				var labels=['Men','Women'];
		var values=[];




		//"canvas_sex" ="canvas_educ" "canvas_work"

		var labelsEduc=['Elementary','High school','Upper secondary','BS','Ms'];
		var valuesEduc=[];

		var labelsWork=['Population','Work force','Employed','Unemployed','Outside work market'];
		var valuesWork=[];



		for (var key in data)
		{

			if(data[key][2]==name){
		    	//name, 
		    	valuesEduc.push([parseInt(data[key][34], 10), parseInt(data[key][36], 10), parseInt(data[key][37], 10), parseInt(data[key][38], 10), parseInt(data[key][39], 10)]);

		    	valuesWork.push([parseInt(data[key][103], 10), parseInt(data[key][104], 10), parseInt(data[key][105], 10), parseInt(data[key][106], 10), parseInt(data[key][107], 10)]);
		    	
		    	values.push([parseInt(data[key][10],10), parseInt(data[key][11])]);

		    }

		}
	

	           var bar1 = new RGraph.Bar({
                id: 'cvs',
                data: values,
                options: {
                    colors: ['#2A17B1', '#98ED00'],
                    labels: labels,
                    text: {
                        angle: 90
                    },
                    title: 'Ration of male and female',
                    variant: '3d',
                    strokestyle: 'transparent',
                    ymax: Math.max(values),
                    gutter: {
                    left: 60,
                    bottom: 150,
                    top: 30
                }

                }
            }).draw()



	           var bar4 = new RGraph.Bar({
                id: 'canvas_educ',
                data: valuesEduc,
                options: {
                    colors: ['#2A17B1', '#98ED00'],
                    labels: labelsEduc,
                    text: {
                        angle: 90
                    },
                    title: 'Education',
                    
                    variant: '3d',
                    strokestyle: 'transparent',
                    ymax: Math.max(valuesEduc),
                    gutter: {
                    left: 60,
                    bottom: 150,
                    top: 30
                }

                }
            }).draw();


 

  	           var bar5 = new RGraph.Bar({
                id: 'canvas_work',
                data: valuesWork,
                options: {
                    colors: ['#2A17B1', '#98ED00'],
                    labels: labelsWork,
                    text: {
                        angle: 90
                    },
                    title: 'Employment',
                    
                    variant: '3d',
                    strokestyle: 'transparent',
                    ymax: Math.max(valuesWork),
                    gutter: {
                    left: 60,
                    bottom: 150,
                    top: 30
                }

                }
            }).draw();



           debugger;       

}

//calculates if the point is within the polygon
function isPointInPoly(poly, point){

		/*
	 polygone=   [
                        [-73.89632720118, 40.8515320489962],
                        [-73.8964878416508, 40.8512476593594],
                        [-73.8968799791431, 40.851375925454],
                        [-73.8967188588015, 40.851660158514],
                        [-73.89632720118, 40.8515320489962]
                    ]
		*/
		//axis swap
		//var pt = [point[1],point[0]];
		var pt = point;

        for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i].y))
            && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
            && (c = !c);

            
        return c;
}

//calculates the district point resides in
function pointInDistrict(){

	var districtName='';


		var point=[429468.9141	,7213420.4591


];

		var minDist=0;
		//loop trough
		for (var key in coordArrayRect)
		{

		    	//check if point is in the polygon 
		    	if(isPointInPoly(coordArrayRect[key],point)==true)
		    	{
		    		console.log("Match "+statData[key][2]);
		    		districtName=statData[key][2];

		    	}

		    	console.log('Mindist from'+statData[key][2]+' is '+calcMinDist(point,coordArrayRect[key]));
		    	//helpoer
		    	if(key==5){
		    		
		    	//console.log(statData[key][2]);
		    	
		    	}

		    	
		}

		
	return districtName
}

function testBoundaries()
{


}

function calcMinDist(point, coordArr)
{
		var min=1000000000;
		for (var key in coordArr)
		{
			//dist 
			var dist=Math.sqrt(Math.pow((coordArr[key][0]-point[0]),2)+Math.pow((coordArr[key][1]-point[1]),2));
			if(dist<min)
			{
				min=dist;
			}

		}

		return min;

}

//google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
  var mapOptions = {
    zoom: 5,
    center: new google.maps.LatLng(24.886436490787712, -70.2685546875),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };

    var bermudaTriangle;

  var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Define the LatLng coordinates for the polygon's path.
  var triangleCoords = [
    new google.maps.LatLng(25.774252, -80.190262),
    new google.maps.LatLng(18.466465, -66.118292),
    new google.maps.LatLng(32.321384, -64.75737),
    new google.maps.LatLng(25.774252, -80.190262)
  ];

  // Construct the polygon.
  bermudaTriangle = new google.maps.Polygon({
    paths: triangleCoords,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35
  });



  bermudaTriangle.setMap(map);
}