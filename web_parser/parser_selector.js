

var concatChar = ';';
var statData;
var coordArray;

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
			
			coordArray=getcoordinateArraysStats(statData);
			//var obj = JSON.parse(response);

			//draw dashboard
			drawAgeDivision(statData);

			//get postal area names from main data
			getPostalAreas(statData);

			//calculate if point belongs to disrtict
			pointInDistrict();		

			//init map functions for testing purposes
			initializeMap();


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

	var coordArray=[];
	

	for (index = 0; index < data.length; ++index) 
	{


		var subArray=data[index];

			var subCoordArray=[];

			for (i = 0; i < subArray.length; ++i) 
			{
				//coord

				if(i>=113)
				{
					//split easting and northing...
					var converted=subArray[i].replace(/[|&;$%@"<>()+]/g, "").split(' ')
						
						//send to transform function and add to coordArray
						subCoordArray.push(transformETRStoWGS84(converted) );
	
				}

				
			}



			
			coordArray[index]=subCoordArray;
     
	}
	

	console.log('coordArrays done');
	//console.log(coordArray);

	return coordArray;

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
                var source_kohteet = new Proj4js.Proj('EPSG:3133');
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
		    	values.push([data[key][10], data[key][11]]);

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
                    ymax: 70000,
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

	RGraph.Clear(document.getElementById("canvas_educ"));
	RGraph.Clear(document.getElementById("canvas_work"));

	//update board
	drawDashBoard($('#postalSelect option:selected').text());



}

function drawDashBoard(name)
{

		var data=statData;
		var xy=[];

		//"canvas_sex" ="canvas_educ" "canvas_work"

		var labelsEduc=['Elementary','High school','Upper secondary','BS','Ms',];
		var valuesEduc=[];

		var labelsWork=['Population','Work force','Employed','Unemployed','Outside work market',];
		var valuesWork=[];

		for (var key in data)
		{

			if(data[key][2]==name){
		    	//name, 
		    	valuesEduc.push([data[key][34], data[key][36], data[key][37], data[key][38], data[key][39]]);

		    	valuesWork.push([data[key][103], data[key][104], data[key][105], data[key][106], data[key][107]]);

		    }

		}
		


	           var bar4 = new RGraph.Bar({
                id: 'canvas_educ',
                data: valuesEduc,
                options: {
                    colors: ['#2A17B1', '#98ED00'],
                    labels: labelsEduc,
                    text: {
                        angle: 90
                    },
                    title: 'Education situation',
                    variant: '3d',
                    strokestyle: 'transparent',
                    ymax: 25000,
                    gutter: {
                    left: 60,
                    bottom: 150,
                    top: 60
                }

                }
            }).draw()


	  	           var bar5 = new RGraph.Bar({
                id: 'canvas_work',
                data: valuesWork,
                options: {
                    colors: ['#2A17B1', '#98ED00'],
                    labels: labelsWork,
                    text: {
                        angle: 90
                    },
                    title: 'Employment situation',
                    variant: '3d',
                    strokestyle: 'transparent',
                    ymax: 25000,
                    gutter: {
                    left: 60,
                    bottom: 150,
                    top: 60
                }

                }
            }).draw()   

                  

}

//calculates if the point is within the polygon
function isPointInPoly(poly, pt){

		/*
	 polygone=   [
                        [-73.89632720118, 40.8515320489962],
                        [-73.8964878416508, 40.8512476593594],
                        [-73.8968799791431, 40.851375925454],
                        [-73.8967188588015, 40.851660158514],
                        [-73.89632720118, 40.8515320489962]
                    ]
		*/
        for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i].y))
            && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
            && (c = !c);

            
        return c;
}

//calculates the district point resides in
function pointInDistrict(){

	var districtName='';


		var point=[64.911998, 25.507342];

		//loop trough
		for (var key in coordArray)
		{

		    	//check if point is in the polygon 
		    	if(isPointInPoly( coordArray[key],point))
		    	{
		    		console.log("Match "+statData[key][2]);
		    		districtName=statData[key][2];
		    	}
		    	//helpoer
		    	if(key==1){
		    		
		    	console.log(coordArray[key]);
		    	
		    	}


		}

		
	return districtName
}

function testBoundaries()
{


}

function initializeMap() {
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

debugger;

  bermudaTriangle.setMap(map);
}
