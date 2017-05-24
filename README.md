# aoPlotlyAddOn
a Library of functions to be used to add functionality to Plotly.

requires 
   <script src="https://cdn.plot.ly/plotly-latest.min.js"></script><br>
   
   <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
   
   
   
# Functions

 

## aoPlotlyAddOn.newTimeseriesPlot

### Description


This functions adds functionality, and applies to time series plots. It adds:

* **Frequency resampling** (daily, weekly, monthly, etc.) and various **aggregations** (close, average, change, %change, etc.). 
* **Log/linear** yaxis button
* **Real/Nominal** button
* **Compare/Uncompare** button, a button to compare series to a base value at the beggining of the range
* **Trim** the series to be read from an initial date.
* It includes the display of **xaxis ticks** for a specific time range, naming quarters of half-years as the case may be.

### Arguments (divInfo, series, settings, timeInfo, layout, options)

    **divInfo** {

      **wholeDivID:** "your whole div id"  /*whole div name, where you will have your plot, including other html items, like your titles and footnotes. required to hide div while plot loads.*/

      **plotDivID:** "your plotly Div id" /* div in which plot will be included should be a div within 'wholeDiv'*/

      }


    **series:** array of objects, with information about traces. Each array object structured as follows:

   {
   **urlType:** "csv", /* could be 'direct', 'csv' or 'yqlJson', 'yqlGoogleCSV', 'pureJson'. In case 'direct, provide trace x and y arrays directly under traceAttriblutes*/


   **url:** "full url",

##### *xSeriesName:* "Date",  /* xSeriesName and ySeriesName are the labels for each variable as they appear in the CSV or Json files.*/

##### *ySeriesName:* "header name",

##### *xDateSuffix:* "",   /* optional, could have content like :"T00:00:00-04:00" */

##### *toggleRealNominal:* true /* true: trace could be converted to real / nominal. false: convertion to real nominal doesn't affect this series*/

##### *deflactor:* false, /* optional, set to true for one trace that would be the base for convertion to real values, in this case, set toogleRealNominal to false */

##### *postProcessData:* "end of month", /* optional, for series where dates at beginning of month, this property would allow the dates for the trace to be set at the end of month*/


##### *traceAttributes:* object as per scatter attributes in Plotly, for example:

###### {
###### type: "scatter",
###### name: "S&P 500",
###### mode: "lines",
###### opacity: 1,
###### fill: "tozeroy",
###### fillcolor: "rgba(205, 245,255, 0.20)", //#FAFCFD + 50% transparency
###### line: {
####### color: "#1A5488",
####### width: 3,
####### dash: "solid"
####### }
###### }


#### settings: object with the following structure:

#####{

##### *series:* {

// frequency and aggregation info of base traces.

###### *baseFrequency:* "base", /*could be 'daily', 'weekly', 'monthly', 'quarterly', 'annual' or your custom name. */

baseAggregation: "close", /* could be 'close', 'average', 'change', 'percChange', 'sqrPercChange', 'cumulative', or your custom name*/

targetFrequencyDisplay: "daily", /*maximum frequency for display of x axis., could be monthly, quarterly, etc.

}, */

// in case an initial change of frequency and aggregation is desired

changeFrequencyAggregationTo: {

frequency:'daily',

aggregation: 'close'

} ,

displayRecessions: true, /* displays area for recession periods*/

allowRealNominal: true, /* optional, displays button for convertion between real an nominal*/

initialRealNominal: "real", /*(could be set to "nominal" or "real", sets the initial display of traces to which real transformation is possible)*/

baseRealDate: "end of range", /* could be "end of range", "end of domain", "beggining of range", beggining of domain", or a date "yyyy-mm-dd hh:mm:ss.sss-04:00"*/

allowDownload: true, /* true or false, displays button to download displayed traces (full domain)*/

 

downloadedFileName: "S&P Sectors Data",

xAxisNameOnCSV: "Date",

allowCompare: true, /* displays button to allow comparison of traces to a base unit value*/

 

transformToBaseIndex: true, /*optional , series would be transformed to common value of 1 at beginning*/

allowFrequencyResampling: true, /* optional, includes buttons to allow for calculation of aggregation and methods (monthly, quarterly), close, average, etc.*/

desiredFrequencies: [ "daily", "weekly", "monthly", "quarterly", "semiannual", "annual" ],

allowSelectorOptions: true, // buttons for time range selection, 3m, 6m, 1y, YTD, 5y, etc.

allowLogLinear: true,

textAndSpaceToTextRatio: 1.8,

endOfWeek: 5 // 0 Sunday, 1 Monday, etc.

}


#### timeInfo:

{


yearsToPlot: number of years to plot from current date backwards, if stated (optional)


tracesInitialDate: 'yyyy-mm-dd' traces are trimmed for dates lower than (optional)


initialDateForInitialDisplay: 'yyyy-mm-dd' (optional)


endDateForInitialDisplay: 'yyyy-mm-dd' (optional)


}



#### layout: pass layout information to be dealt with as per Plotly's layout definitions


#### options:  pass options information to be dealt with as per Plotly's options definitions


## aoPlotlyAddOn.getTicktextAndTickvals


This functions returns and object with the the tickvals and ticktext arrays for a specific time range, division width and margins, font type and size and a ratio for the space between ticks (specifically the ratio between (tick text + space between text) lenght to tick text length.


### Arguments:

 

#### from: date strings as 'yyyy-mm-dd'

#### to: date strings as 'yyyy-mm-dd'

#### textAndSpaceToTextRatio: ratio between (tick text + space between text) lenght to tick text length

#### targetFrequency: any of 'daily', 'everyOtherDay', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'biennial', 'quinquennial', 'decennial', 'quadranscentennial', 'semicentennial', 'centennial', 'bicentennial', 'sestercentennial', 'quincentenary', 'milennial'

The returned ticktext and tickvals would be the best minimum fit, upwards from the targetFrequency, e.g., if 'monthly' is passed, it would return whichever fit best from monthly, quarterly, semiannual, annual and onwards

#### fontFamily: a font family name.

#### fontSize: 

#### divWidth: width in pixels of the current division, can be read as jQuery('name of division').width()

#### leftMargin

#### rightMargin: margins from plot to division in pixels. If layout.margin.l/r are defined, read from there, otherwise use 80 (plotly's default)



## aoPlotlyAddOn.transformSeriesByFrequencies


This function will populate the data object with an originalData.x, y and objects for different frequencies and methods of aggregation. This data can be used to change the frequency of displayed data.


### Arguments:


#### data: and array of data objects [{x[], y[]}, ....], with x as date strings 'yyyy-mm-dd' and y as values.

#### periodKeys: and object with the frequencies to be calculated, set to true or false. { day: true/false, week: true/false, month: true/false, quarter: true/false, semester: true/false, year: true }

#### endOfWeek: day of week to be end of week period. 0 for Sunday, 1 for Monday, ....

 

 

 
