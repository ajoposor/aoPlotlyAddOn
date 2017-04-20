 <h1>Functions help working with Plotly. In particular with time series</h1><br>
 
     <h2>Functions</h2><br>
     
     <h3><b>aoPlotlyAddOn.getTicktextAndTickvals</b></h3><br>
     This functions returns and object with the the tickvals and ticktext arrays for a specific time range, division width and margins, font type and size and a ratio for the space between ticks (specifically the ratio between (tick text + space between text) lenght to tick text length.<br><br>
     <h4>Arguments:</h4><br><b>from, to</b>: date strings as 'yyyy-mm-dd'<br><br><b>textAndSpaceToTextRatio</b>: ratio between (tick text + space between text) lenght to tick text length<br><br><b>targetFrequency</b>: any of 'daily', 'everyOtherDay', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'biennial', 'quinquennial', 'decennial', 'quadranscentennial', 'semicentennial', 'centennial', 'bicentennial', 'sestercentennial', 'quincentenary', 'milennial'<br><br> The returned ticktext and tickvals would be the best minimum fit, upwards from the targetFrequency, e.g., if 'monthly' is passed, it would return whichever fit best from monthly, quarterly, semiannual, annual and onwards<br><br><b>fontFamily</b>: a font family name.<br><br><b>fontSize</b><br><br><b>divWidth</b>: width in pixels of the current division, can be read as jQuery('name of division').width()<br><br><b>leftMargin, rightMargin</b>: margins from plot to division. If layout.margin.l/r are defined, read from there, otherwise use 80 (plotly's default)<br><br><br>
     
     <h3><b>aoPlotlyAddOn.transformSeriesByFrequencies</b></h3><br>
       This function will populate the data object with an originalData.x, y and objects for different frequencies and methods of aggregation. This data can be used to change the frequency of displayed data.<br><br>
     <h4>Arguments:</h4><br><b>data</b>: and array of data objects [{x[], y[]}, ....], with x as date strings 'yyyy-mm-dd' and y as values.<br><br><b>periodKeys</b>: and object with the frequencies to be calculated, set to true or false. {
  day: true/false,
  week: true/false,
  month: true/false,
  quarter: true/false,
  semester: true/false,
  year: true
     }<br><br><b>endOfWeek</b>: day of week to be end of week period. 0 for Sunday, 1 for Monday, ....<br>
