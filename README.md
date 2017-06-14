# aoPlotlyAddOn
a function to add features to Plotly's time series plots with parameters.

![screenshot](https://github.com/ajoposor/aoPlotlyAddOn/blob/master/img/aoplotly.gif)


requires 
   <script src="https://cdn.plot.ly/plotly-latest.min.js"></script><br>
   
   <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
   
   
   
# Main Function

 

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

**divInfo** (object) Contains the following properties:
>
> **wholeDivID** (string) "your whole div id".  Whole div name, where you will have your plot, including other html items, like your titles and footnotes. required to hide div while plot loads.
>
> **plotDivID** "(string) "your plotly Div id". Div in which plot will be included should be a div within 'wholeDiv'.


**series** (array of objects) One object for each trace or trace section. Each object contains information about traces, where data is located and to be read from. Each object is structured as follows:
>
> **urlType** (string) Any of "direct", "csv", "yqlJson", "yqlGoogleCSV", "pureJson". In case "direct", provide trace x and y arrays directly under traceAttriblutes.
>
> **url** (string) "full url where data is to be read from. Required except for "direct" urlType.
>
> **xSeriesName:** (string)  Label for variable as they appear in the CSV or Json files.
>
> **ySeriesName:** (string) Label for variable as they appear in the CSV or Json files.
>
> **xDateSuffix:** (string) Optional. To add information to read Dates. Could have content like "T00:00:00-04:00", to provide time and time zone offset.
>
> **toggleRealNominal:** (boolean) Optional. In case true: trace could be converted to real/nominal. false: convertion to real nominal doesn't affect this trace.
>
> **deflactor:** (boolean) Optional. Set to true for the trace that would be the base for convertion to real values, in this case, set toogleRealNominal to false for this trace.
>
> **postProcessData:** "end of month" Optional. Could be used for series where dates are provided at beginning of month, and need to be converted to end of month.
>
> **traceAttributes:** (object) Object as per scatter attributes in Plotly, for example:
>>
>> type: "scatter",
>> name: "S&P 500",
>>  mode: "lines",
>> opacity: 1,
>> fill: "tozeroy",
>> fillcolor: "rgba(205, 245,255, 0.20)", //#FAFCFD + 50% transparency
>> line: {
>>> color: "#1A5488",
>>> width: 3,
>>> dash: "solid"
>>> }


**settings:** (object) Provide following structure:
>
> **allowFrequencyResampling:** (boolean) Optional. This will add buttons and calculate traces for different frequencies (weekly, monthly, ..., yearly) and aggregations (close, average, change, percentage change, etc.)
>
> **desiredFrequencies:** (array of strings) Include frequencies to be calculated (in case allowFrequencyResampling set to true) Available: "daily", "weekly", "monthly", "quarterly", "semiannual", "annual".
>
> **series:** (object) To include frequency and aggregation for calculated traces:
>> 
>> **baseFrequency:** (string) To provide a name for the base frequencies as per initial data provided. Could be 'base', 'daily', 'weekly', 'monthly', 'quarterly', 'annual' or your custom name or none.
>>
>> **baseAggregation:** (string) To provide a name of the base aggregation as per initial data provided. Could be 'base', 'close', 'average', 'change', 'percChange', 'sqrPercChange', 'cumulative', your custom name or none.
>>
>> **targetFrequencyDisplay:** (string) Maximum frequency for display of x axis, could be 'daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'yearly'.
>
> **endOfWeek:** (integer between 0 and 6) Sets the end of week. Applies to calculation of weekly values and display of weeks. 0 Sunday, 1 Monday, etc.
>
> **changeFrequencyAggregationTo:** (object) Optional. In case an initial change of frequency and aggregation is desired.
>>
>> **frequency:** (string) Optional. Any of 'daily', 'weekly'....
>>
>> **aggregation:** (string) Optional. Any of 'close', 'average', 'change', 'percChange', 'sqrPercChange', cumulative'
>
> **displayRecessions:** (boolean) Optional. Set to true to displays background area for recession periods.
>
> **allowRealNominal:** (boolean) Optional. Set to true to displays button for convertion between real an nominal.
>
> **initialRealNominal:** (string) Optional. Set to "real" or "nominal". Sets the initial display of traces to which real transformation is applicable)
>
> **baseRealDate:** (string) Any of  "end of range", "end of domain", "beggining of range", beggining of domain", or a date "yyyy-mm-dd hh:mm:ss.sss-04:00". It would set the base at which real values are to be calculated. Range refers to the displayed range and domain to the available date range for the index trace.
>
> **allowDownload:** (boolean) Optional. Would display button to download displayed traces over its full domain.
>
> **downloadedFileName:** (string) Optional. Name to be set to downloaded file.
>
> **xAxisNameOnCSV:** (string) String to head dates on the downloaded csv file.
>
> **allowCompare:** true, /* displays button to allow comparison of traces to a base unit value*/
>
> **transformToBaseIndex:** true, /*optional , series would be transformed to common value of 1 at beginning*/
>
> **allowSelectorOptions:** (boolean) If set to true would display buttons for time range selection, 3m, 6m, 1y, YTD, 5y, etc.
>
> **allowLogLinear:** (boolean) If set to true, display button to toogle yaxis to log/linear.
>
> **textAndSpaceToTextRatio:** (number) Default 1.8. Sets spacing of text to void space in xaxis ticks.
<br><br>
**timeInfo:** (object) Include the following properties:
>
> **yearsToPlot:** (number) Optional. number of years to plot from current date backwards.
>
> **tracesInitialDate:** (date string formatted as 'yyyy-mm-dd') Optional. Traces will be trimmed for dates earlier than provided value.
>
> **InitialDateForInitialDisplay:** (date string formatted as 'yyyy-mm-dd') Optional. Date at which initial display will begin.
>
> **endDateForInitialDisplay:** '(date string formatted as 'yyyy-mm-dd') Optional. Date at which initial display of traces will end.


**layout:** (object) Pass layout information to be dealt with as per Plotly's layout definitions.


**options:** (object) Pass options information to be dealt with as per Plotly's options definitions.


# Miscelaneous Functions

## aoPlotlyAddOn.getTicktextAndTickvals


This functions returns and object with the the tickvals and ticktext arrays for a specific time range, division width and margins, font type and size and a ratio for the space between ticks (specifically the ratio between (tick text + space between text) lenght to tick text length.


### Arguments:

 
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



## aoPlotlyAddOn.transformSeriesByFrequencies


This function will populate the data object with an originalData.x, y and objects for different frequencies and methods of aggregation. This data can be used to change the frequency of displayed data.


### Arguments:


**data:** (array of data objects [{x[], y[]}, ....]) With x as date strings 'yyyy-mm-dd' and y as values.

**periodKeys:** (object) An object with the frequencies to be calculated, set to true or false. { day: true/false, week: true/false, month: true/false, quarter: true/false, semester: true/false, year: true }

**endOfWeek:** (number between 0 and 6) Day of week to be end of week period. 0 for Sunday, 1 for Monday, ....
