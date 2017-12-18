# aoPlotlyAddOn.newTimeseriesPlot()

## A one stop javascript function to read data and add features to <a href="https://plot.ly/javascript/">Plotly's</a> time series plots using only parameters.

<kbd>
<img src="https://github.com/ajoposor/aoPlotlyAddOn/blob/master/img/aoplotly.gif">
</kbd>



## Table of contents

* [Description](#description)
* [Features](#features)
* [Arguments in detail](#arguments-in-detail)
   * [divInfo](#divinfo)
   * [data](#data)
   * [otherDataProperties](#otherdataproperties)
   * [dataSources](#datasources)
   * [settings](#settings)
   * [timeInfo](#timeinfo)
   * [layout](#layout)
   * [options](#options)
* [Remarks](#remarks)
* [Install](#install)
* [Use and examples](#use-and-examples)
* [Working example](#working-example)
* [Miscelaneous functions](#miscelaneous-functions)
* [Creators](#creators)
* [License](#license)


## Description

**aoPlotlyAddOn.newTimeseriesPlot**( divInfo, data, otherDataProperties, dataSources, settings, timeInfo, layout, options );

This functions allows reading of data from various sources, processing of the data, calculation of traces and adds functionality to time series plots in <a href="https://plot.ly/javascript/">Plotly</a>. 

It helps you in two stages: **data sourcing** and **plot funtionality**.

## Features

* **Data sources**: handle various data sources with preprocessing options. For example, include url to a csv file, provide options to sort, or change dates formats
   * **Automatic data sourcing**: just provide the links to sources of data, like quandl's csvs, fred's jsons, eia's jsons, yql queries, or just assing data directly in the data array
   * **Processing options**:
      * **preprocess dates**:
         * **end of month**: certain dates come as first of month, but actually refer to end of month. You would add a parameter so that the function makes the changes.
         * add **time and timezone stamp**: yyyy-mm-dd dates may be better described by adding the time and timezone to which it refers. There are options for this to be made.
         * **standarize dates**: some dates may come with a non-standard format (for instance: "yy-m-d", the function will analize the strings and convert them into a standard format ("yyyy-mm-dd")
      * **sorting**: in case your data comes with unsorted dates, this option will sort them.
      * **order of reading**: in case where files are to be read from bottom up (dates are to be loaded from latest to oldest).
      * **adjust values**: when combining mutilple sources into one trace, you may need to adjust the values to a common base. Share prices for instance are to be adjusted when the price changes due to splits or share dividends. The function will use a common date to calculate the adjusting factor and apply it to the older data, maintining the values for the most recent dates.
      * **Trim** You may provide a starting date, so that all data is trimmed for previous dates. It is useful when you have varoius date ranges for your read data and you want a clean plot, with all traces having a common dates range.
      * **scale** You may apply a factor and/or a shift to the read trace. Useful to make changes in the units.     
   * **Flexible sourcing**  
      * **many to one**: get data for one trace from many sources or,
      * **one to many** use one source to feed multiple traces
      * **non-standard csv**: allows a file with many date fields, with different frequencies (for instance: one daily, another monthly) to be split and handled independently.
   * **Calculate traces**  
      * **use custom functions**: specify a formula to calculate a trace from already loaded traces, or,
      * **calculate deflacted traces** using a deflactor and a source trace, create a new trace with deflated values.

* **Plot functionality**
   * **Responsive** your plot will be responsive by default.
   * **Loader**: automatic display of a loader while the data is sourced and the plot is rendered.
   * **Frequency resampling** (daily, weekly, monthly, etc.) and various **aggregations** (close, average, change, %change, etc.). The function will make the calculations and display whatever frequency and aggregation you select from dropdown menus in the plot.
   * **Log/linear** The plot will display a button to toggle the type of y axis from linear to log.
   * **Real/Nominal** Plot button to calculate real / nominal values
   * **Compare/Uncompare** Plot button to compare series to a base value at the beggining of the displayed range.
   * **Responsive dates ticks** The x axis will display **xaxis ticks** better suited for dates. As you change the range displayed, dates will change from days, to weeks, to months , year-month ("yyyy-mm"), quarters (Q1-yyyy), half-years (H1-yyyy), years (yyyy) and so forth, as the case may be. You may set an option for your desired maximum granularity, for instance, if you have year series, you would use years and nothing but years or a higher aggregation will be displayed.
   * **Download** Plot button will allow to download the data in the format displayed for the whole dates range.
   
## Arguments in detail

### divInfo

The divInfo object contains the following properties:

   * **wholeDivID** (string) "your whole div id".  Whole div name, where you will have your plot, including other html items, like your titles and footnotes. Required to hide the div while the plot loads.

   * **plotDivID** "(string) "your plotly Div id". Div where the plot will be included. It should be a div within wholeDiv. Before plotDiv you would place the plot title and other header information, and after plotDiv you would add footnotes.

   * **noLoadedDataMessage** "(string)  A message to be displayed in case there was no data to be plotted. .

   * **onErrorHideWholeDiv** "(boolean) Default: false. Set to true if you want wholeDiv hidden in case there was no data to be plotted. The noLoadedDataMessage will be displayed. If set to false, the noLoadedDataMessage will be displayed in the plotDiv.
         	
	
   

#### Example

In your html you would structure the wholeDiv and plotDiv and include your plot titles and footnotes in between:
```html
<body>
   <div id="myWholeDiv_01" style="visibility:hidden">
   
     <!--  Include any header html items to your plot -->
     <h3>My Plot TiTle</h3>
     
     <div id="myPlotDiv_01" class="plotly" align="left" style="width:100%; height:480px;"></div>
     
      <!--  Include any footer html items to your plot -->
      (*) Shaded areas indicate recessions.<br>
      Data source: <a href="https://www.quandl.com">Quandl.</a>
      
  </div>
   <script>
    <!-- JAVASCRIPT CODE GOES HERE -->
   </script>
</body>
```

In your javascript, declare and defined the divInfo object:
```javascript
var divInfo = {
	//whole div, including your titles and footnotes. 
	// required to hide div while plot loads.
	wholeDivID: "myWholeDiv_01",

	// div in which plot will be included
	// should be a div within wholeDiv
	plotDivID: "myPlotDiv_01"
};
```


### data

 Data follows Plotly's structure and properties. Data is an array of objects, each one with the information for each trace in the plot. The properties x and y, with the dates and value arrays may be supplied directly or be added by the function based on the data sources parameters.
 
 
 #### Example
 
Data example with three traces displayed and one used to make calculations as deflactor. One of the traces has values defined, the others will be fed using the function and the dataSources parameters.
 
 in your javascript:
 ```javascript
 var data = [
 	{
		type: "scatter",
		name: "S&P 500",
		mode: "lines",
		opacity: 1,
		// the area below this trace will be filled
		// include a transparency percentage so as not to hide the traces there
		fill: "tozeroy",
		fillcolor: "rgba(205, 245,255, 0.20)", //#FAFCFD + 50% transparency
		line: {
			color: "#1A5488",
			width: 3,
			dash: "solid"
		}
	},{
		x: ["2001-01-31", "2017-05-12"];
		y: [ 150, 200];
		type: "scatter",
		name: "my trace",
		mode: "lines",
		opacity: 1,
		line: {
			color: "#1A5488",
			width: 3,
			dash: "solid"
		}
	}, {
		type: "scatter",
		name: "US CPI",
		mode: "lines",
		opacity: 0.8,
		line: {
			color: "#000000",
			width: 1,
			dash: "dash"
		}
	},{
		// this trace will not be displayed but be used as deflactor, 
		// assuming real/nominal options in place
		type: "scatter",
		visible: false,
		name: "US CPI",
		mode: "lines",
		line: {
			color: "#000000",
			width: 1,
			dash: "dash"
		}
	}
];
```

### otherDataProperties

This array of objects links the data array with the dataSources array using a common traceID. The traceID is independent from the trace name property, which is used by Plotly to name the trace. 

The otherDataProperties array has the same number of elements as the data array. 

It also includes other options for the traces, not part of plotly's traces properties.

#### Object definition
Each object within the otherDataProperties array has the the following properties:

   * **traceID**: (string, required) A unique id for the trace.
   * **toggleRealNominal**: (boolean, optional) Determines weather a trace shall be recalculated if a real / nominal change of basis is required.
   * **deflactor**: (boolean, optional) Set to true in the trace which shall be considered a deflactor for calculation of real values. The trace in which the deflactor is set to true must have the toggleRealNominal property set to false.
   * **calculate**: (object, optional) include this object to set calculaiton options for this trace. Instead of loading data, the trace dates and value will be calculated base on other traces and parameters. There are two options for the calculate object:
   
      * **Calculating a real trace (deflated values)**
         * **type**: "real",
         * **sourceTrace**: traceID (enter the traceID of a trace that will be converted into real values (deflated)
         * **factorInformation:** (object): 
            * **date**: "end of trace" or "beginning of trace" or a full date string as "yyyy-mm-dd hh:mm:ss.sss+00:00"
            * **referredDateTraceID**: (only required if date set to "end of trace" or "beginning of trace") This will search for the  date in the referredTraceID and set it as base value for the deflactor
	    
      * **Calculating a trace using a custom function**
         * **type**: "poly",
         * **daysThreshold**: (optional, default = 0) use this parameter to set a threshold that will consider dates being equal and therefore will apply the formula to such set of points. For instance, one trace argument could have a date december 31, while another trace argument could be december 30 and your traces are yearly. You may use the threshold to consider these two dates as equal. The first trace in the arguments will provided the selected date, in this case december 31.
         * **polyFormulation**: (object): 
            * **argumentsIDs**: (array) with the tracesIDs that will be used as arguments. At least one traceID is required (in order to get the dates): ["tradeID1", traceID2, ...]
            * **formula**: a function with the arguments in the order provided in argumentsIDs.
	       for instance:
	          *   formula: function(x) {return 2*x;}
	          *   formula: function(x, y, z) { return x+y+z;}
	          *   formula: function(x) { return 1; }
		  


#### Example
in your javascript:
```javascript
 var otherDataProperties = [
	{
		traceID: "S&P 500",
		// this trace will be recalculated if a nominal to real change of base is applied
		toggleRealNominal: true,
	},
	{
		traceID: "US CPI"
		toggleRealNominal: true,
	},{
		// this trace is defined as the deflactor, 
		// it is not changed when a nominal / real change of base is applied to the traces
		traceID: "US CPI deflactor"
		deflactor: true,
		toggleRealNominal: false,			
	}
];
```

### dataSources

This is and array of objects. It has as many elements as sources of data you may have.

Each object in the dataSouces will get a chunk of data, process it and feed as many traces as instructed.

#### object definition (one object for each element in the dataSources array)

   * **url** (string) Full url where data is to be read from. Required except for "arrayOfJsons" urlType.

   * **urlType** (string) Any of "csv", "EiaJson", "yqlJson", "yqlGoogleCSV", "pureJson" or "arrayOfJsons".
      * **csv**: A csv file will be read from the url using Plotly.d3.csv.
      * **yqlJson**: use this option if data is sourced using yql and is returned as json. From readJson returned by $.getJSON, json object would be readJson.query.results.json.observation. 
      
         **An example**: 
         
         get json data from FRED through yql:
         ```javascript
         var fredKey = "your FRED key";
         var seriesId = "UNRATE";
         var seriesUnits ="lin";
         var urlFred = "https://api.stlouisfed.org/fred/series/observations?"+ 
            		"series_id="+seriesId+"&api_key="+fredKey+"&units="+seriesUnits+"&file_type=json";
         var baseUri = "https://query.yahooapis.com/v1/public/yql?q=";
         var uriQuery = encodeURIComponent("SELECT * from json where url='"+urlFred+"'");
         var url =  baseUri + uriQuery+"&format=json";
         ```
     
      * **EiaJson**: data will be read from the Energy Information Admisnitration api. In this case, you will need to provide a seriesIndex for each of the traces read from this source (see traces array below)
      
         **An example**: 
               
         url to get data from  EIA's api (will retrieve 4 series):
         ```javascript
         var eiaKey = "your EIA key";
         var rootEIA = "https://api.eia.gov/series/?series_id=";
         var eiaSuffix = "&out=js=json";
         var url = rootEIA + 
	 		"TOTAL.PAPSPOC.M;TOTAL.PAPSPUS.M;TOTAL.PAPSPEU.M;TOTAL.PAPSPJA.M" + 
			"&api_key="+eiaKey+eiaSuffix;
         
         /*
         * In this examples, the series should be referred to as seriesIndex: 0, seriesIndex: 1,... etc.
         * in the traces array in the same order in which the traces are set in the url
         *
         */
         
         ```      
     
      * **yqlGoogleCSV**: In this case, the url to be provided is a google url that returns a csv file. The yql portion will be added by the function as `"https://query.yahooapis.com/v1/public/yql?q="+encodeURIComponent("SELECT * from csv where url='"+url+"'")+"&format=json"`. From readJson returned by `$.getJSON` (or `Plotly.d3.json`), json object would be `readJson.query.results.row`.
      * **pureJson**: Use this case when you provide and url that returns an array of jsons. The url will be processed with `$.getJSON` (or `Plotly.d3.json`). An array of jons will have one object for each data point. Each object should contain at least a property for the dates vales and a property for the y value. This arrayOfJsons has the same structure as that returned by Plotly.d3.csv. 
      * **arrayOfJsons**: Use this case to provide data you sourced from elsewhere, that you would like to be processed (change of date format, or calculate adjusted values). An array of jons will have one object for each data point. Each object should contain at least a property for the dates vales and a property for the y value. This arrayOfJsons has the same structure as that returned by Plotly.d3.csv. In this case, the function will not get data from an url.

   * **xSeriesName:** (string)  Label that identifies dates as they appear in the CSV or Json files. You may place it here, if all traces from this source have the same xSeriesName, or in the traces array.
   * **ySeriesName:** (string) Label  that identifies y values as they appear in the CSV or Json files. You may place it here, if all traces from this source have the same ySeriesName, or in the traces array.
      
      **Example**:
      ```
      your csv file:
      date,open,high,low,close
      2000-12-31,14,16,13,15
      1999-12-31,15,17,13,16
       
      or your array of jsons
      [{date: "2000-12-31", open: 14, high: 16, low: 13, close: 15},
       {date: "1999-12-31", open: 15, high: 17, low: 13, close: 16}]
      ```  
      you want:
      ```javascript 
      data = [
      {x: ["2000-12-31", "1999-12-31"],
       y: [ 15, 16]},
       
       {x: ["2000-12-31", "1999-12-31"],
       y: [ 16, 17]}
       ];
       ```
       so you would set in dataSources:
       ```javascript 
       dataSources[0].xSeriesName = "date";
       dataSources[0].trace[0].ySeriesName = "close";
       dataSources[0].trace[1].ySeriesName = "high";
       ```
   
   * **xDateSuffix:** (string) Optional. To add information to read Dates. Could have content like " 00:00:00-04:00", to provide time and time zone offset. You may place it here, if all traces from this source have the same XDateSuffix, or in the traces array.
   * **onlyAddDateSuffix**: (string) Optional. If provided, dates will be processed by only adding this suffix. You may place it here, if all traces from this source have the same option, or in the traces array.
   * **processDates**: (boolean) Optional. If set to false, no processing of dates will be made (no adding of suffixes or change to end of month or any other). Set to false only if dates are consistent all over the data arrays and have "yyyy-dd-mm 00:00:00-04:00" format which includes time and timezone offset. Otherwise, dates may produce undesired results as browsers translate then to local timezones and may assume dates "yyyy-mm-dd" where GMT. You may place it here, if all traces from this source have the same option, or in the traces array.
   * **postProcessData:** "end of month" Optional. Could be used for series where dates are provided at beginning of month, and need to be converted to end of month. You may place it here, if all traces from this source have the same postProcessDate, or in the traces array.
   * **calculateAdjustedClose**: (boolean) Optional. If set to true, traces that come from more than one source will be normalized using the overlapping date. Older values will be changed. You need to provide at least one overlapping date in order for this option to be applied. You may place it here, if all traces from this source have the same option, or in the traces array.
   * **sort**: (boolean) Optional. If set to true, all values as ySeriesNames in use with this xSeriesName and this xSeriesName will be sorted. This function works with dates ordered from latest to oldest.  You may place it here, if all traces from this source have the same option, or in the traces array.
   
   * **traces** (array of objects) one object for each trace to be fed with a source
      * **traceID**: (string) Required. Unique string that will be used together with the otherDataParameters array to identify the data array element to which the data will be fed.
         ```dataSources[i].traces[j].tracesID  ===  otherDataParameters[k].tracesID -> data goes into data[k].x and data[k].y```
      * **xSeriesName**: (string) Tag that identifies the column or property which contains the date in the data file (csv, or json) and will feed the data x array.
      * **ySeriesName**: (string) Tag that identifies the column or property which contains the value in the data file (csv, or json) that will feed the data y array.
      * **xDateSuffix**: (string) Optional. This string will be added to the date string read.
      * **onlyAddDateSuffix**: (string) Optional. If provided, dates will be processed by only adding this suffix.
      * **processDates**: (boolean) Optional. If set to false, no processing of dates will be made (no adding of suffixes or change to end of month or any other). Set to false only if dates are consistent all over the data arrays and have "yyyy-dd-mm 00:00:00-04:00" format which includes time and timezone offset. Otherwise, dates may produce undesired results as browsers translate then to local timezones and may assume dates "yyyy-mm-dd" where GMT.
      * **postProcessDate**: (string) Optional. If set to "end of month", dates will be converted to end of month.
      * **calculateAdjustedClose**: (boolean) Optional. If set to true, traces that come from more than one source will be normalized using the overlapping date. Older values will be changed. You need to provide at least one overlapping date in order for this option to be applied.
      * **sort**: (boolean) Optional. If set to true, all values as ySeriesNames in use with this xSeriesName and this xSeriesName will be sorted. This function works with dates ordered from latest to oldest.
      * **seriesIndex**: (integer, index from 0 onwards, required only if urlType: "EiaJson") links a trace with the read serie from the EIA api, in the order in which the series were placed in the url for the api call. 
      * **factor**: (optional, default = 1.0) Use to scale the read data before being added to a data trace.
      * **shift**: (optional, default = 0.0) Use to shift (add a constant) to the read data before being added to a data trace.      

#### Examples:

***Example** 1:*
   * One source feed three traces.
   * The csv file has two date columns: "Date", and "Date_CPI"
   * One column feeds two traces, traces[1] and traces[2] are fed with the "CPI_EOM" column
```javascript

var dataSources = [
	{
	// urlType could be "csv", 
	urlType: "csv",

	url: "https://rawgit.com/ajoposor/test-csv-files/files/SP500%20sectors-1998-12-2017-04.csv",

	// preprocessing options could be added here or in one or more objects of the traces array below
	onlyAddXDateSuffix: " 00:00:00-04:00",


	traces: [
		{
		xSeriesName: "Date",
		ySeriesName: "SP500 Adjusted Close",
		traceID: "S&P 500"				
		},{
		xSeriesName: "Date_CPI",
		ySeriesName: "CPI_EOM",
		traceID: "US CPI"				
		},				{
		xSeriesName: "Date_CPI",
		ySeriesName: "CPI_EOM",
		traceID: "US CPI deflactor"				
		}
	]
		
	}
];
```


***Example 2**: Test sorting and dates processing options.*
```javascript
var dataSources = [
	{	
	urlType: "arrayOfJsons",

	// all options could be set at dataSources level or at traces level
	// if set at dataSources lelvel they will override traces options.
	// firstItemToRead: "last",
	// processDates: true,
	// optional sort: true / false,
	// optional postProcessDate: "end of month",
	// optional xSeriesName: in case used from postProcessDate or sort
	// xDateSuffix: "",//"T00:00:00-04:00",

	arrayOfJsons: [
	{"Date":"2010-05-24","Date2":"1998-12-31","Open":"135.82","Close":"116.152","Adj Close":"115.173210"},
	{"Date":"2011-03-04","Date2":"2010-05-24","Open":"110.87","Close":"116.017","Adj Close":"130.044304"},
	{"Date":"2011-05-05","Date2":"2012-08-06","Open":"165.94","Close":"116.611","Adj Close":"145.629341"},
	{"Date":"2012-08-06","Date2":"2011-05-05","Open":"155.79","Close":"117.914","Adj Close":"155.918411"},
	{"Date":"2012-10-09","Date2":"2013-03-10","Open":"190.95","Close":"118.988","Adj Close":"175.989319"},
	{"Date":"2013-03-10","Date2":"2012-10-09","Open":"185.77","Close":"119.111","Adj Close":"180.108315"},
	{"Date":"2013-10-11","Date2":"2014-06-12","Open":"300.74","Close":"119.750","Adj Close":"200.742935"},
	{"Date":"2014-06-12","Date2":"2013-10-11","Open":"250.90","Close":"119.250","Adj Close":"250.247139"},
	{"Date":"2015-02-13","Date2":"2015-12-17","Open":"270.10","Close":"119.041","Adj Close":"240.038902"},
	{"Date":"2015-12-17","Date2":"2015-02-13","Open":"290.38","Close":"120.000","Adj Close":"220.990829"},
	{"Date":"2016-01-18","Date2":"2016-04-19","Open":"320.99","Close":"119.988","Adj Close":"240.980911"},
	{"Date":"2016-04-19","Date2":"2016-01-18","Open":"280.39","Close":"119.779","Adj Close":"280.772675"},
	{"Date":"2016-06-20","Date2":"2017-06-11","Open":"340.43","Close":"120.000","Adj Close":"300.990829"},
	{"Date":"2017-01-23","Date2": "","Open": "","Close":"120.08","Adj Close":"280.070"},
	{"Date":"2017-05-24","Date2": "","Open": "","Close":"119.97","Adj Close":"320.960"}
	],

	traces:[
		{
		// dates follow chronological order, they will be reordered with the firstItemToRead option
		xSeriesName: "Date",
		ySeriesName: "Adj Close",
		traceID: "S&P 500",

		// in case another source of data is used to feed this trace (traceID: "S&P 500")
		// values will be adjusted using a common date
		calculateAdjustedClose: true,

		// dates must follow most recent to oldest order
		firstItemToRead: "last",
		},

		{
		xSeriesName: "Date",
		ySeriesName: "Close",
		traceID: "Some ID",
		calculateAdjustedClose: true,
		firstItemToRead: "last",
		},

		{
		// this dates have no order, they will be sorted from recent to older with the sort option
		// missing dates will not be passed to the data
		xSeriesName: "Date2",
		ySeriesName: "Open",
		traceID: "Second Dates",
		calculateAdjustedClose: true,
		sort: true
		}
	]
}};
```



***Example 3**: Dates are to be changed to end of month.*

   * CPI data is dates as "yyyy-mm-01". In order for better display, they will be changed to end of month dates using the postProcessDate property set to "end of month".
   * Besides, one file will be used in this case to feed two traces. One of them used as a dummy trace to serve as a deflactor.

```javascript

var dataSources = [
	{
	urlType: "csv",
	url: "https://www.quandl.com/api/v3/datasets/FRED/CPIAUCSL.csv?api_key=yourQuandlApiKey",
	traces:[
		{
		xSeriesName: "Date",
		ySeriesName: "Value",
		postProcessDate: "end of month",
		traceID: "US CPI"
		},
		
		{
		xSeriesName: "Date",
		ySeriesName: "Value",
		postProcessDate: "end of month",
		traceID: "US CPI deflactor"
		}
		]
	}
];	
```

### settings

This is an object that controls the features added to your plot.

#### object structure

   * **allowFrequencyResampling:** (boolean) Optional. This will add buttons and calculate traces for different frequencies (weekly, monthly, ..., yearly) and aggregations (close, average, change, percentage change, etc.)

   * **desiredFrequencies:** (array of strings) Include frequencies to be calculated (in case allowFrequencyResampling set to true) Available: "daily", "weekly", "monthly", "quarterly", "semiannual", "annual".

   * **series:** (object) To provide a name for the frequency and aggregation of the supplied data (initial):

      * **baseFrequency:** (string) To provide a name for the base frequencies as per initial data provided. Could be "base", "daily", "weekly", "monthly", "quarterly", "annual" or your custom name or none.

      * **baseAggregation:** (string) To provide a name of the base aggregation as per initial data provided. Could be "base", "close", "average", "change", "percChange", "sqrPercChange", "cumulative", your custom name or none.

   * **targetFrequencyDisplay:** (string) Minimum display granularity of x axis, could be "daily", "weekly", "monthly", "quarterly", "semiannual", "yearly".

   * **endOfWeek:** (integer between 0 and 6) Sets the end of week. Applies to calculation of weekly values and display of weeks. 0 Sunday, 1 Monday, etc.

   * **displayRecessions:** (boolean) Optional. Set to true to displays background area for recession periods.
   
   * **recessionsFillColor:** (string for color code) Optional. Default is "#000000". Set to your desired value. This will control the fillcolor of the shapes used to mark recession periods.
   
   * **recessionsOpacity:** (number) Optional. Default is 0.15. Set to your desired value. This will control the shapes used to mark recession periods.
   
   * **queueConcurrencyLimit:** (positive integer) Optional. Default is 10. Sets the value for maximum concurrent async tasks for reading external data from urls.
   
   * **newRecessionsUrl:** (string) Optional. Set to "" to avoid looking for new recessions dates. Recessions in library are current up to 2015-12-31. If you need to include new recessions enter an address that returns a zip file as provided by the FRED api for the serie_id USRECP.
   
      The url for the zip file is: `https://api.stlouisfed.org/fred/series/observations?series_id=USRECP&api_key=YourFredApiKey&file_type=txt&observation_start=2015-12-31`
   
      You may need to use a proxy to handle cross-origin HTTP requests. You may prefix the url with `https://cors-anywhere.herokuapp.com/` which provides a proxy server.

   * **allowRealNominal:** (boolean) Optional. Set to true to displays button for convertion between real an nominal.

   * **initialRealNominal:** (string) Optional. Set to "real" or "nominal". Sets the initial display of traces to which real transformation is applicable)

   * **baseRealDate:** (string) Any of  "end of range", "end of domain", "beggining of range", beggining of domain", or a date "yyyy-mm-dd hh:mm:ss.sss-04:00". It would set the base at which real values are to be calculated. Range refers to the displayed range and domain to the available date range for the deflactor trace.

   * **allowDownload:** (boolean) Optional. Would display button to download current displayed traces over its full dates domain.

   * **downloadedFileName:** (string) Optional. Name to be set to downloaded file.

   * **xAxisNameOnCSV:** (string) String to head dates on the downloaded csv file.

   * **allowCompare:** (boolean) displays button to allow comparison of traces to a base unit value.

   * **transformToBaseIndex:** (boolean) Optional, series would be transformed to common value of 1 at beginning of displayed dates range at the initial displayed plot.

   * **allowSelectorOptions:** (boolean) If set to true would display buttons for time range selection, 3m, 6m, 1y, YTD, 5y, etc.

   * **allowLogLinear:** (boolean) If set to true, display button to toogle yaxis to log/linear type.

   * **textAndSpaceToTextRatio:** (number) Default 1.8. Sets spacing of text to void space in xaxis ticks.
   
   * **removeDoubleClickToZoomBackOut** (boolean) Default: true. Use to allow or remove message displayed when range in plot area is selected. This message says Double-click to zoom back out.


### timeInfo

Use this object to instruct handling of dates range


#### object properties

   * **yearsToPlot:** (number) Optional. number of years to plot from current date backwards in the initial plot.

   * **tracesInitialDate:** (date string formatted as "yyyy-mm-dd") Optional. Traces will be trimmed for dates earlier than provided value. Data before tracesInitialDate will not be included in the data.

   * **initialDateForInitialDisplay:** (date string formatted as "yyyy-mm-dd") Optional. Date at which initial display will begin.

   * **endDateForInitialDisplay:** (date string formatted as "yyyy-mm-dd") Optional. Date at which initial display of traces will end.

#### Examples
in your javascript:
```javascript	
var timeInfo = {

	// affects only the initial display
	yearsToPlot: 1,

	// include and initial date if applicable (data will be trimmed to before this date)
	tracesInitialDate: "1998-12-31"
};
```


### layout

The layout object follows Plotly's definition. 

Example:
in your javascript:
```javascript
// include layout as per Plotly's layout

var layout = {

	yaxis: {
		// the the type of yaxis
		// in case log/linear button option set, 
		// this will be the initial yaxis type display
		type: "log",
		hoverformat: ".4r"
	},

	margin:{
		r: 43
	}
};
```

### options

The options object follows Plotly's definition. 

It's and optional parameter.

Example:
 in your javascript:
```javascript
// include options as per Plotly's options

var **options** = {

	// this will hide the link to plotly
	showLink: false,

	// this will hid the mode bar
	displayModeBar: false

};
```

## Remarks

   * This function works with time series. The values in the x axis are supposed to be dates.
   * Dates should be ordered from latest to oldest. You may use options to sort data sourced.
   * Dates should be provided as "yyyy-mm-dd". Use process dates options to make adjustements.
   * If no time and time zone is provided dates will be assumed to have occured at 00:00:00 (hh:mm:ss) on the date indicated at the time zone used by the browser wherever it may be. It will work fine as no change of time is made. So December 31, 2000 (2000-12-31) will be displayed as such regardless of where the user is located.
   * You may provide complete dates with time and timezone, i.e, "yyyy-mm-dd hh-mm-ss.ssss+hh:mm" or "yyyy-mm-dd hh-mm-ss.ssss-hh:mm". There results would be the same.

## Install

Include libraries for plotly, d3.queue, jquery (will make adjustments to remove use of jquery), jszip (only if zip files from fred are to be sourced to update recessions, it may be omitted if url set to "") and aoPlotlyAddOn:

```html
<head>
<!-- Plotly.js -->
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

<!-- d3.queue -->
<script src="https://d3js.org/d3-queue.v3.min.js"></script>

<!-- jQuery -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>

<!-- jszip.js -->
<script src="https://rawgit.com/Stuk/jszip/master/dist/jszip.min.js"></script>
   
<!-- aoPlotlyAddOn.js -->   
<script src="https://raw.githubusercontent.com/ajoposor/aoPlotlyAddOn/master/dist/aoPlotlyAddOn.min.js"></script>
</head>
```

## Use and examples

### add library

```html
<head>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="https://d3js.org/d3-queue.v3.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script src="https://rawgit.com/Stuk/jszip/master/dist/jszip.min.js"></script>
<script src="https://rawgit.com/ajoposor/aoPlotlyAddOn/master/dist/aoPlotlyAddOn.min.js"></script>
</head>
```

### Encapsulate your code

```javascript
(function() {

    // all the code for one plot here

})();
```

### Putting all together

#### HTML
```html
<head>
<!-- Plotly.js -->
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script src="https://rawgit.com/ajoposor/aoPlotlyAddOn/master/dist/aoPlotlyAddOn.min.js"></script>
</head>
<body>

<div id="myWholeDiv_01" style="visibility:hidden">

<h3>My Plot Title and header</h3>

<div id="myPlotlyDiv_01" class="plotly" align="left" style="width:100%; height:480px;"></div>

Plot footnotes<br>
Data source: <a href="https://www.quandl.com">Quandl.</a>
</div>
<script>
<!-- JAVASCRIPT CODE GOES HERE -->
</script>
</body>
```

#### Javascript Code
```javascript

(function() {

	/* declare and populate variables with parameters

	var divInfo = {
		wholeDivID: "myWholeDiv_01",
		plotDivID: "myPlotlyDiv_01"
	};

	var timeInfo = {
		yearsToPlot: 1,
		tracesInitialDate: "1998-12-31"
	};

	

	var data = [
		{
			type: "scatter",
			name: "S&P 500",
			mode: "lines",
			opacity: 1,
			fill: "tozeroy",
			fillcolor: "rgba(205, 245,255, 0.20)", //#FAFCFD + 50% transparency
			line: {
				color: "#1A5488",
				width: 3,
				dash: "solid"
			}
		}, ... 
	];
	
	var otherDataProperties = [
		{
			traceID: "S&P 500",
			toggleRealNominal: true,
		},...

	];
	
		
	var dataSources = [
	{
	urlType: "csv",
	url: "https://rawgit.com/ajoposor/test-csv-files/master/files/SP500%20sectors-1998-12-2017-04.csv",
	onlyAddXDateSuffix: " 00:00:00-04:00",
	traces: [
		{
		xSeriesName: "Date",
		ySeriesName: "SP500 Adjusted Close",
		traceID: "S&P 500"
		},...
	]
	}
	];

	var settings = {
		series: {
			baseFrequency: "daily", 
			baseAggregation: "close", 
			targetFrequencyDisplay: "daily",
		},
		
		displayRecessions: true,
		allowCompare: true,
		allowDownload: true,
		allowRealNominal: true,
		initialRealNominal: "real",
		baseRealDate: "end of range",
		downloadedFileName: "S&P Sectors Data",
		xAxisNameOnCSV: "Date",
		transformToBaseIndex: true,
		allowFrequencyResampling: true, 
		desiredFrequencies: [
			"daily",
			"weekly",
			"monthly",
			"quarterly",
			"semiannual",
			"annual"
		],
		allowSelectorOptions: true, // buttons for time range selection, 3m, 6m, 1y, YTD, 5y, etc.
		allowLogLinear: true,
		textAndSpaceToTextRatio: 1.8,
		endOfWeek: 5 // 0 Sunday, 1 Monday, etc.
	};

	var layout = {
	
		// your layout options

	};

	var options = {
		 
		// your options
	};

	// call function
	aoPlotlyAddOn.newTimeseriesPlot(
					divInfo, 
					data, 
					otherDataProperties, 
					dataSources,
					settings, 
					timeInfo, 
					layout, 
					options);

	
})();
```


## Working Example

[![test it in codepen](https://github.com/ajoposor/aoPlotlyAddOn/blob/master/img/codepen%20aoPlotlyAddOn%20example.png)](https://codepen.io/ajoposor/pen/owzmeZ?editors=0010)




## Miscelaneous Functions

### aoPlotlyAddOn.getTicktextAndTickvals


This functions returns and object with the the tickvals and ticktext arrays for a specific time range, division width and margins, font type and size and a ratio for the space between ticks (specifically the ratio between (tick text + space between text) lenght to tick text length.


#### Arguments:

 
**from:** (date strings as "yyyy-mm-dd")

**to:** (date strings as "yyyy-mm-dd")

**textAndSpaceToTextRatio:** (number) Ratio between (tick text + space between text) lenght to tick text length.

**targetFrequency:** (string) Any of "daily", "everyOtherDay", "weekly", "biweekly", "monthly", "quarterly", "semiannual", "annual", "biennial", "quinquennial", "decennial", "quadranscentennial", "semicentennial", "centennial", "bicentennial", "sestercentennial", "quincentenary", "milennial"

The returned ticktext and tickvals would be the best minimum fit, upwards from the targetFrequency, e.g., if "monthly" is passed, it would return whichever fit best from monthly, quarterly, semiannual, annual and onwards

**fontFamily:** (string) Font family name.

**fontSize:** (number) Font size. 

**divWidth:** (number) Width in pixels of the current division, can be read as jQuery("name of division").width()

**leftMargin:** (number) Margins from plot to division in pixels. If layout.margin.l/r are defined, read from there, otherwise use 80 (plotly's default)

**rightMargin:** (number) Margins from plot to division in pixels. If layout.margin.l/r are defined, read from there, otherwise use 80 (plotly's default)



### aoPlotlyAddOn.transformSeriesByFrequencies


This function will populate the data object with an originalData.x, y and objects for different frequencies and methods of aggregation. This data can be used to change the frequency of displayed data.


#### Arguments:


**data:** (array of data objects [{x[], y[]}, ....]) With x as date strings "yyyy-mm-dd" and y as values.

**periodKeys:** (object) An object with the frequencies to be calculated, set to true or false. { day: true/false, week: true/false, month: true/false, quarter: true/false, semester: true/false, year: true }

**endOfWeek:** (number between 0 and 6) Day of week to be end of week period. 0 for Sunday, 1 for Monday, ....



## Creators

|   | Github | 
|---|--------|
|**A. Osorio**| [@ajoposor](https://github.com/ajoposor) | |


## Versions
1.0.0
Function launched

1.1.0
Added:
   * **reading of data from Energy Information Agency api**
   * **calculate traces** with generic formula applied to loaded traces
   * **calculate real/deflated traces** from loaded traces
   * **add factor and/or shift to read data** applicable to specific source/trace combination.   


## License

Code released under the [MIT license](https://github.com/ajoposor/aoPlotlyAddOn/blob/master/LICENSE).

Docs released under the [Creative Commons license](https://github.com/ajoposor/aoPlotlyAddOn/blob/master/documentation/CC%20LICENSE).
