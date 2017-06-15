# aoPlotlyAddOn.newTimeseriesPlot()

## A javascript function to add features to <a href="https://plot.ly/javascript/">Plotly's</a> time series plots using only parameters.

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
* [Miscelaneous functions](#miscelaneous-functions)
* [Creators](#creators)
* [License](#license)


## Description

**aoPlotlyAddOn.newTimeseriesPlot**( divInfo, data, otherDataProperties, dataSources, settings, timeInfo, layout, options );

This functions adds functionality to time series plots in <a href="https://plot.ly/javascript/">Plotly</a>. 

It helps you in two stages: **data sourcing** and **plot funtionality**.

## Features

* **Data sources**: handle various data sources with preprocessing options. For example, include url to a csv file, provide options to sort, of change dates formats
   * **Automatic data sourcing**: just provide the links to sources of data, like quandl's csvs, fred's jsons, yql queries, or just assing data directly in the data array
   * **Processing options**:
      * **preprocess dates**:
         * **end of month**: certain dates come as first on month, but actually refer to end of month. You would add a parameter so that the function makes the changes.
         * add **time and timezone stamp**: yyyy-mm-dd dates may be better described by adding the date and timezone to which it refers. There are options for this to be made.
         * **standarize dates**: some dates may come with a non-standard format, the function will analize the strings and convert it to a standard format
      * **sorting**: in case your data comes with unsorted dates, this option will sort them.
      * **order or reading**: in case where files are to be read from bottom up.
      * **adjust values**: when combining mutilple sources into one trace, you may need to adjust the values to a common base. Share prices for instance are to be adjusted when the price changes due to splits or share dividends. The function will use a common date to calculate the adjusting factor and apply it to the older data, maintining the values for the most recent dates.
      * **Trim** the series to be read from an initial date.
   * **Flexible sourcing**  
      * **many to one**: get data for one trace from many sources or,
      * **one to many** use one source to feed multiple traces
      * **non-standard csv'**: allows a file with many date fields, with different frequencies (for instance: one daily, another monthly) to be split and handled independently.

* **Plot functionality**
   * **Responsive** your plot will be responsive
   * **Loader**: automatic display of a loader while the data is sourced and the plot is rendered.
   * **Frequency resampling** (daily, weekly, monthly, etc.) and various **aggregations** (close, average, change, %change, etc.). 
   * **Log/linear** yaxis button
   * **Real/Nominal** button
   * **Compare/Uncompare** button, a button to compare series to a base value at the beggining of the range
   * It includes the display of **xaxis ticks** for a specific time range, naming quarters, years or half-years as the case may be.

## Arguments in detail

### divInfo

The divInfo object contains the following properties:

   * **wholeDivID** (string) "your whole div id".  Whole div name, where you will have your plot, including other html items, like your titles and footnotes. required to hide div while plot loads.

   * **plotDivID** "(string) "your plotly Div id". Div in which plot will be included should be a div within 'wholeDiv'.
   

#### Example

In your javascript:
```javascript
var divInfo = {
	//whole div, including your titles and footnotes. 
	// required to hide div while plot loads.
	wholeDivID: "myWholeDiv_01",

	// div in which plot will be included
	// should be a div within 'wholeDiv'
	plotDivID: "myPlotDiv_01"
};
```

and your html would have:
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

### data

 Data follows Plotly's structure and properties. Data is an array of objects, each one with the information for each trace in the plot. The properties x and y, with the dates and value arrays may be supplied directly or be added by the function based on the data sources parameters.
 
 
 #### Example
 
Data example with three traces displayed and one used to make calculations as deflactor. One of the traces has values defines, the others will be feed using the function and the dataSources parameters.
 
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

This array of objects links the data array with the dataSources array with a commont traceID. The traceID is independent from the trace name property, which is used by Plotly to name the trace. 

The otherDataProperties array has the same number of elements as the data array. 

It also includes other options for the traces, not part of the standard plotly traces properties.

#### Object definition
Each object has the the following properties:

   * **traceID**: (string, required) A unique id for the trace.
   * **toggleRealNominal**: (boolean, optional) Determines weather a trace shall be recalculated if a real / nominal change of basis is required.
   * **deflactor**: (boolean, optional) Set to true in the trace which shall be considered a deflactor for calculation of real values. The trace in which the deflactor is set to true must have the toggleRealNominal property set to false.



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

#### object definition (one for each element in the dataSources array

   * **urlType** (string) Any of "csv", "yqlJson", "yqlGoogleCSV", "pureJson".
      * csv:
      * yqlJson
      * yqlGoogleCSV
      * pureJson


   * **url** (string) "full url where data is to be read from. Required except for XXX urlType.

 **xSeriesName:** (string)  Label for variable as they appear in the CSV or Json files.

 **ySeriesName:** (string) Label for variable as they appear in the CSV or Json files.

 **xDateSuffix:** (string) Optional. To add information to read Dates. Could have content like "T00:00:00-04:00", to provide time and time zone offset.

 **postProcessData:** "end of month" Optional. Could be used for series where dates are provided at beginning of month, and need to be converted to end of month.

   * ** traces** (array of objects) one object for each trace to be fed with a source
      * **traceID**: (string) Required. Unique string that will be used together with the otherDataParameters array to identify the data array element to which the data will be fed.
      * **xSeriesName**: (string) Tag that identifies the column or property which contains the date in the data file (csv, or json) and will feed the data x array.
      * **ySeriesName**: (string) Tag that identifies the column or property which contains the value in the data file (csv, or json) that will feed the data y array.
      * **xDateSuffix**: (string) Optional. This string will be added to the date string read.
      * **onlyAddDateSuffix**: (string) Optional. If provided, dates will be processed by only adding this suffix.
      * **processDates**: (boolean) Optional. If set to false, no processing of dates will be made (no adding of suffixes or change to end of month or any other). Set to false only if dates are consistent all over the data arrays and have "yyyy-dd-mm 00:00:00-04:00" format which includes time and timezone offset. Otherwise, dates may produce undesired results as browsers translate then to local timezones and may assume dates "yyyy-mm-dd" where GMT.
      * **postProcessDate**: (string) Optional. If set to "end of month", dates will be converted to end of month.
      * **calculateAdjustedClose**: (boolean) Optional. If set to true, traces that come from more than one source will be normalized using the overlapping date. Older values will be changed. You need to provide at least one overlapping date in order for this option to be applied.
      * **sort**: (boolean) Optional. If set to true, all values as ySeriesNames in use with this xSeriesName and this xSeriesName will be sorted. This function works with dates ordered from latest to oldest.


   * **transform
#### Examples:

*Example 1: One source feed three traces.*
in your javascript:
```javascript

var dataSources = [
	{
	// urlType could be "csv", 
	urlType: "csv",

	url: "https://rawgit.com/ajoposor/test-csv-files/files/SP500%20sectors-1998-12-2017-04.csv",

	// preprocessing options could be added here or in one or more objects of the traces array below
	onlyAddXDateSuffix: "00:00:00-04:00",


	traces: [
		{
		xSeriesName: "Date",
		ySeriesName: "SP500 Adjusted Close",
		traceID: "S&P 500"				
		},{
		xSeriesName: "Date_CPI",
		ySeriesName: "CPI_EOM",
		xDateSuffix: "",//"T00:00:00-04:00",
		traceID: "US CPI"				
		},				{
		xSeriesName: "Date_CPI",
		ySeriesName: "CPI_EOM",
		xDateSuffix: "",//"T00:00:00-04:00",
		traceID: "US CPI deflactor"				
		}
	]
		
	}
];
```


*Example 2: Test sorting and dates processing options.*
in your javascript:
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



*Example 3: Dates are to be changed to end of month.*

CPI data is dates as "yyyy-mm-01". In order for better display, they will be changed to end of month dates using the postProcessDate property set to "end of month".

Besides, one file will be used in this case to feed two traces. One of them used as a dummy trace to serve as a deflactor.

in your javascript:
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

This is an object that controls the features added to your plot

#### object structure

   * **allowFrequencyResampling:** (boolean) Optional. This will add buttons and calculate traces for different frequencies (weekly, monthly, ..., yearly) and aggregations (close, average, change, percentage change, etc.)

   * **desiredFrequencies:** (array of strings) Include frequencies to be calculated (in case allowFrequencyResampling set to true) Available: "daily", "weekly", "monthly", "quarterly", "semiannual", "annual".

   * **series:** (object) To include frequency and aggregation for calculated traces:

      * **baseFrequency:** (string) To provide a name for the base frequencies as per initial data provided. Could be 'base', 'daily', 'weekly', 'monthly', 'quarterly', 'annual' or your custom name or none.

      * **baseAggregation:** (string) To provide a name of the base aggregation as per initial data provided. Could be 'base', 'close', 'average', 'change', 'percChange', 'sqrPercChange', 'cumulative', your custom name or none.

   * **targetFrequencyDisplay:** (string) Maximum frequency for display of x axis, could be 'daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'yearly'.

   * **endOfWeek:** (integer between 0 and 6) Sets the end of week. Applies to calculation of weekly values and display of weeks. 0 Sunday, 1 Monday, etc.

   * **displayRecessions:** (boolean) Optional. Set to true to displays background area for recession periods.

   * **allowRealNominal:** (boolean) Optional. Set to true to displays button for convertion between real an nominal.

   * **initialRealNominal:** (string) Optional. Set to "real" or "nominal". Sets the initial display of traces to which real transformation is applicable)

   * **baseRealDate:** (string) Any of  "end of range", "end of domain", "beggining of range", beggining of domain", or a date "yyyy-mm-dd hh:mm:ss.sss-04:00". It would set the base at which real values are to be calculated. Range refers to the displayed range and domain to the available date range for the index trace.

   * **allowDownload:** (boolean) Optional. Would display button to download displayed traces over its full domain.

   * **downloadedFileName:** (string) Optional. Name to be set to downloaded file.

   * **xAxisNameOnCSV:** (string) String to head dates on the downloaded csv file.

   * **allowCompare:** (boolean) displays button to allow comparison of traces to a base unit value.

   * **transformToBaseIndex:** (boolean) Optional, series would be transformed to common value of 1 at beginning

   * **allowSelectorOptions:** (boolean) If set to true would display buttons for time range selection, 3m, 6m, 1y, YTD, 5y, etc.

   * **allowLogLinear:** (boolean) If set to true, display button to toogle yaxis to log/linear.

   * **textAndSpaceToTextRatio:** (number) Default 1.8. Sets spacing of text to void space in xaxis ticks.


### timeInfo

Use this object to instruct handling of dates range


#### object properties

   * **yearsToPlot:** (number) Optional. number of years to plot from current date backwards.

   * **tracesInitialDate:** (date string formatted as 'yyyy-mm-dd') Optional. Traces will be trimmed for dates earlier than provided value.

   * **InitialDateForInitialDisplay:** (date string formatted as 'yyyy-mm-dd') Optional. Date at which initial display will begin.

   * **endDateForInitialDisplay:** '(date string formatted as 'yyyy-mm-dd') Optional. Date at which initial display of traces will end.

#### Examples
in your javascript:
```javascript	

//X AXIS DATE RANGE PARAMETERS

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

   * This function works with time series. X values are supposed to be dates.
   * Dates should be ordered from latest to oldest. You may use options to sort data sourced.
   * Dates should be provided as "yyyy-mm-dd".
   * If no time and time zone is provided they will be assumed to have occured at 00:00:00 (hh:mm:ss) on the date indicated at the time zone used by the browser wherever it may be. It will work fine as no change of time is made. So December 31, 2000 (2000-12-31) will be displayed so regardless of where the user is located.
   * On the contrary, you may provide complete dates, i.e, "yyyy-mm-dd hh-mm-ss.ssss+hh:mm" or "yyyy-mm-dd hh-mm-ss.ssss-hh:mm"

## Install

Include libraries for plotly and aoPlotlyAddOn:

```html
<head>
<!-- Plotly.js -->
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
   
<!-- aoPlotlyAddOn.js -->   
<script src="https://raw.githubusercontent.com/ajoposor/aoPlotlyAddOn/master/dist/aoPlotlyAddOn.min.js"></script>
</head>
```

## Use and examples

### add library

```html
<head>
<!-- Plotly.js -->
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="https://raw.githubusercontent.com/ajoposor/aoPlotlyAddOn/master/dist/aoPlotlyAddOn.min.js"></script>
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
	 <script src="https://rawgit.com/ajoposor/aoPlotlyAddOn/568cffa81478b6fd46400b291b53ce0fdbfebe59/dist/aoPlotlyAddOn.js"></script>
   <!-- jquery -->
 <!-- <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>-->
</head>
<body>
	<div id="myWholeDiv_01" style="visibility:hidden">
	<h3><font color="#1A5488"><b>S&P 500</b></font> sectors:<font color="#5AC148"><b>&#x25A0; C. Discretionary</b></font> - <font color="#CC0000"><b>&#x25A0; Energy</b></font> - <font color="#9845CE"><b>&#x25A0; Financials</b></font> - <font color="#FF9900"><b>&#x25A0; Industrials</b></font> - <font color="#FFCC00"><b>&#x25A0; Materials</b></font> - <font color="#FF3399"><b>&#x25A0; Real Estate</b></font> - <font color="#33FFFF"><b>&#x25A0; Technology</b></font> - <font color="#699966"><b>&#x25A0; Utilities</b></font></h3>
  <div id="myPlotlyDiv_01" class="plotly" align="left" style="width:100%; height:480px;"></div>
(*) Shaded areas indicate recessions.<br>For Real Estate: FRESX, Fidelity Real Estate<br>Data source: <a href="https://www.quandl.com">Quandl.</a>
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
			onlyAddXDateSuffix: "00:00:00-04:00",
			traces: [
				{
				xSeriesName: "Date",
				ySeriesName: "SP500 Adjusted Close",
				xDateSuffix: "",//"T00:00:00-04:00",
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

	aoPlotlyAddOn.newTimeseriesPlot(divInfo, data, otherDataProperties, dataSources, settings, timeInfo, layout, options);

	
})();

```
### Go to a Working Example

[![test it in codepen](https://github.com/ajoposor/aoPlotlyAddOn/blob/master/img/codepen%20aoPlotlyAddOn%20example.png)](https://codepen.io/ajoposor/pen/owzmeZ?editors=0010)




## Miscelaneous Functions

### aoPlotlyAddOn.getTicktextAndTickvals


This functions returns and object with the the tickvals and ticktext arrays for a specific time range, division width and margins, font type and size and a ratio for the space between ticks (specifically the ratio between (tick text + space between text) lenght to tick text length.


#### Arguments:

 
**from:** (date strings as 'yyyy-mm-dd')

**to:** (date strings as 'yyyy-mm-dd')

**textAndSpaceToTextRatio:** (number) Ratio between (tick text + space between text) lenght to tick text length.

**targetFrequency:** (string) Any of 'daily', 'everyOtherDay', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'biennial', 'quinquennial', 'decennial', 'quadranscentennial', 'semicentennial', 'centennial', 'bicentennial', 'sestercentennial', 'quincentenary', 'milennial'

The returned ticktext and tickvals would be the best minimum fit, upwards from the targetFrequency, e.g., if 'monthly' is passed, it would return whichever fit best from monthly, quarterly, semiannual, annual and onwards

**fontFamily:** (string) Font family name.

**fontSize:** (number) Font size. 

**divWidth:** (number) Width in pixels of the current division, can be read as jQuery('name of division').width()

**leftMargin:** (number) Margins from plot to division in pixels. If layout.margin.l/r are defined, read from there, otherwise use 80 (plotly's default)

**rightMargin:** (number) Margins from plot to division in pixels. If layout.margin.l/r are defined, read from there, otherwise use 80 (plotly's default)



### aoPlotlyAddOn.transformSeriesByFrequencies


This function will populate the data object with an originalData.x, y and objects for different frequencies and methods of aggregation. This data can be used to change the frequency of displayed data.


#### Arguments:


**data:** (array of data objects [{x[], y[]}, ....]) With x as date strings 'yyyy-mm-dd' and y as values.

**periodKeys:** (object) An object with the frequencies to be calculated, set to true or false. { day: true/false, week: true/false, month: true/false, quarter: true/false, semester: true/false, year: true }

**endOfWeek:** (number between 0 and 6) Day of week to be end of week period. 0 for Sunday, 1 for Monday, ....



## Creators

|   | Github | 
|---|--------|
|**A. Osorio**| [@ajoposor](https://github.com/ajoposor) | |




## License

Code released under the [MIT license](https://github.com/ajoposor/aoPlotlyAddOn/blob/master/LICENSE).

Docs released under the [Creative Commons license](https://github.com/ajoposor/aoPlotlyAddOn/blob/master/documentation/CC%20LICENSE).
