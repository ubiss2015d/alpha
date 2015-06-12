

var concatChar = ';';


/*********************************************
Holds actions taken when the page is loaded
*********************************************/
$(document).ready(function(){



	// Query stats of postal areas
	var statData=readStats();


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
			var mainArray=generateArraysStats(response);

			//get coordinates and transform them to WGS84
			var coordArray=getcoordinateArraysStats(mainArray);
			//var obj = JSON.parse(response);

			drawAgeDivision(mainArray);
			/*
				$.each(response, function(key,val){
					// do something with key and val
					document.getElementById('test_output').innerHTML = val;
					
					});
			*/


			console.log('ajax vreadStats call out');
			return [mainArray, coordArray];
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
						subCoordArray.push(transform(converted));

						
						
				}

				
			}

			coordArray[index]=subCoordArray;
     
	}
	

	console.log('coordArrays done');
	//console.log(coordArray);

	return coordArray;

}

            
 function transform(point) {

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


                return pointObj;
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
