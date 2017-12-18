(function(window){
    
//I recommend this
'use strict';
function defineLibrary(){

var aoPlotlyAddOn = {};
	 
// set DEBUG && OTHER_DEBUGS option (for display of console.log messages)
// console.log will also be removed with closure compiler 
var DEBUG = true;
var OTHER_DEBUGS = true;
var DEBUG_TIMES = false;
var DEBUG_CSV = false;
var DEBUG_TRANSFORM_BY_FREQUENCIES = false;
var DEBUG_FB = false; // debug in frequency button
var DEBUG_EIA_FUNCTION = false;
var DEBUG_RECESSIONS = false; 
var DEBUG_createIndexMap = true;
var DEBUG_createTraceWithFunction = true;
    
       
// this functions adds items and functionallity, including, buttons, responsiveness, series resampling     
aoPlotlyAddOn.newTimeseriesPlot = function (
	divInfo,
	data,
	otherDataProperties,
	dataSources,
	settings = {},
	timeInfo = {},
	layout = {},
	options = {}
) {

	DEBUG && DEBUG_TIMES && console.time("TIME: newTimeseriesPlot");
	DEBUG && DEBUG_TIMES && console.time("TIME: initialSettingsBeforeReadData");
	
	// test arguments are passed complete
	if (arguments.length < 3) {
		return "incomplete arguments";
	}
		
 	// SET divInfo
		
	var wholeDivInitialStyling = {
		visibility:"hidden",
		opacity: 1,
		position: "relative"
	};
	
	var loaderInitialStylingUrl = 
	    "url('https://raw.githubusercontent.com/ajoposor/Images/master/files/loader_big_blue.gif')"+
	    "50% 50% no-repeat #FFFFFF";
	
	var loaderInitialStyling = {
		visibility: "visible",
		position: "absolute",
		top: "-1px",
		right: "-1px",
		bottom: "-1px",
		left: "-1px",
		background: loaderInitialStylingUrl,
		opacity: 1
	};
	
	loaderInitialStyling["z-index"] = "9999";
		
			
	//give a name to the loader
		
	divInfo.loaderID = "loader_"+divInfo.wholeDivID;
	
	divInfo.wholeDivElement = document.getElementById(divInfo.wholeDivID);	
	

	setElementStyle(divInfo.wholeDivElement, wholeDivInitialStyling);
	
	divInfo.loaderElement = document.createElement('div');
	divInfo.loaderElement.id = divInfo.loaderID;
	divInfo.wholeDivElement.appendChild(divInfo.loaderElement);
	
	if(typeof divInfo.noLoadedDataMessage === "undefined") {
		
		// this will vertical align the div in the middle of the parent div, and center the text horizontally
		divInfo.noLoadedDataMessage = '<div style="position:relative; top:50%; transform:translateY(-50%);'+
						'text-align:center;"><h3><font color="#1A5488"  >'+
						'<b>Datos no recibidos</b></font></div>';
	}
	
	if(typeof divInfo.onErrorHideWholeDiv === "undefined") {
		divInfo.onErrorHideWholeDiv = false;
	}
	
	setElementStyle(divInfo.loaderElement, loaderInitialStyling);

	
	// frequency dropdown buttons to be added to updatemenus if option applies
	var combinedAggregationButtons = [];
		
		
	var singleAggregationButton = [
			{
			method: "relayout",
			args: ["myAggregation", "base"],
			label: " "
		}	
	];
		
	var baseAggregationButtons = [
		{
			method: "relayout",
			args: ["myAggregation", "close"],
			label: "close"
		},
		{
			method: "relayout",
			args: ["myAggregation", "average"],
			label: "avg."
		},
		{
			method: "relayout",
			args: ["myAggregation", "change"],
			label: "chg."
		},
		{
			method: "relayout",
			args: ["myAggregation", "percChange"],
			label: "% chg."
		},
		{
			method: "relayout",
			args: ["myAggregation", "sqrPercChange"],
			label: "% chg 2."
		},
		{
			method: "relayout",
			args: ["myAggregation", "cumulative"],
			label: "cum."
		}
	];	
		
		

	// SET OPTIONS AND TIMEINFO DEFAULTS

		
	// normal button
	var buttonsDefaultStyle =  {
		color: "#444444",
		background: "#EEEEEE",
		display: "block",
		position: "relative",
		float: "left",
		width: "50px",
		padding: "0",
		margin: "1px 1px 1px 1px",
		transition: "all 0.2s"
	};

	buttonsDefaultStyle["background-color"]= "#EEEEEE";	
	buttonsDefaultStyle["font-weight"] = "100";
	buttonsDefaultStyle["text-align"] ="center";
	buttonsDefaultStyle["line-height"] = "17px";
	buttonsDefaultStyle["border-radius"] = "3px";
	buttonsDefaultStyle["border-style"] = "none";

	var buttonsHoverDefaultStyle ={};

	buttonsHoverDefaultStyle["background-color"]="#D4D4D4";
	buttonsHoverDefaultStyle.color = "#444444";
		
		
	//pressed button
	var pressedButtonDefaultStyle =  {
		color: "#444444",
		background: "#EEEEEE",
		display: "block",
		position: "relative",
		float: "left",
		width: "50px",
		padding: "0",
		margin: "1px 1px 1px 1px",
		transition: "all 0.2s"
	};

	pressedButtonDefaultStyle["background-color"]= "#D4D4D4";	
	pressedButtonDefaultStyle["font-weight"] = "100";
	pressedButtonDefaultStyle["text-align"] ="center";
	pressedButtonDefaultStyle["line-height"] = "17px";
	pressedButtonDefaultStyle["border-radius"] = "3px";
	pressedButtonDefaultStyle["border-style"] = "none";

	var pressedButtonHoverDefaultStyle ={};

	pressedButtonHoverDefaultStyle["background-color"]="#EEEEEE"; //#EEEEEE
	pressedButtonHoverDefaultStyle["touch-background-color"]="#D4D4D4";
	pressedButtonHoverDefaultStyle["mouse-background-color"]="#EEEEEE";
	pressedButtonHoverDefaultStyle.color = "#444444";
		
		
	var fredRecessionsDefaultUrl = 
	    "://kapitalvalue.com/plots_data/testing/fredRecessions-unlocked.php?observation_start=2015-12-01";
	
	if(connectionIsSecure()) {
		DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS && console.log("HTTPS:");
		fredRecessionsDefaultUrl = "https"+fredRecessionsDefaultUrl;
		
	} else {
		DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("HTTP:");
		fredRecessionsDefaultUrl = "http"+fredRecessionsDefaultUrl;
	}

		
	var settingsDefaults = {
		// display shaded area during recession periods
		displayRecessions: true,
		// recession fill color and opacity
		recessionsFillColor: "#000000",
		recessionsOpacity: 0.15,
		// url should return a zip file as provided by fred api for the USRECP serie for dates after 2015, 
		// set to "" in parameters passed
		// to disable trying to get zip file with update values.
		newRecessionsUrl: fredRecessionsDefaultUrl,
		queueConcurrencyLimit: 10,
		queueConcurrencyDelay: 5, //milliseconds
		allowCompare: false,
		transformToBaseIndex: false, //series would be transformed to common value of 1 at beginning
		
		// includes buttons to allow for calculation of aggregation and methods (monthly, quarterly),
		// close, average, etc.
		allowFrequencyResampling: false,
		targetFrequencyDisplay: "daily",
		defaultNames: {
			frequency: "base",
			aggregation: "base"
		},
		defaultLabels:{
			frequency: false,
			aggregation: false,
		},
		allowSelectorOptions: true, // buttons for time range selection, 3m, 6m, 1y, YTD, 5y, etc.
		allowLogLinear: false,
		allowDownload: false,
		allowRealNominal: false,
		downloadedFileName: "CSV Data File",
		xAxisNameOnCSV: "Date",
		widthOfRightItemsFrequencyButtons: 94,//130
		singleButtonStringLengthInPixels: 59,
		textAndSpaceToTextRatio: 1.8,
		maxNumberOfCharactersInFrequencyButton: 11,
		maxNumberOfCharactersInAggregationButton: 6,
		endOfWeek: 5, // 0 Sunday, 1 Monday, etc.
		numberOfIntervalsInYAxis: 9,
		possibleYTickMultiples: [0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0],
		rangeProportion: 0.90,
		
		// periodKeys applies to calculation of data by different frequencies.
		periodKeys: {
			day: true,
			week: true,
			month: true,
			quarter: true,
			semester: true,
			year: true
		},
		period: {
			daily: "day",
			weekly: "week",
			monthly: "month",
			quarterly: "quarter",
			semiannual: "semester",
			annual: "year"
		},	
		
		desiredFrequencies: [
			"daily",
			"weekly",
			"monthly",
			"quarterly",
			"semiannual",
			"annual"
		],
		buttonsDefaultStyle: buttonsDefaultStyle ,
		buttonsHoverDefaultStyle: buttonsHoverDefaultStyle,
		buttonsStyle:buttonsDefaultStyle,
		buttonsHoverStyle:buttonsHoverDefaultStyle,
		pressedButtonDefaultStyle: pressedButtonDefaultStyle,
		pressedButtonHoverDefaultStyle: pressedButtonHoverDefaultStyle,
		removeDoubleClickToZoomBackOut: true
	};

	var possibleFrequencies = {
		daily: true,
		weekly: true,
		monthly: true,
		quarterly: true,
		semiannual: true,
		annual: true
	};
		
	var orderedPossibleFrequencies = [
		"daily",
		"weekly",
		"monthly",
		"quarterly",
		"semiannual",
		"annual"
	];
		

	// set settings defaults
	setJsonDefaults(settingsDefaults, settings);
	
	
	DEBUG && OTHER_DEBUGS && console.log("settings after settings default: ", settings);	
		
	
	// LAYOUT SETTINGS
	// set layout down here
	var layoutDefaults = {
		xaxis: {
			rangeslider: { thickness: 0.06 },
			tickangle: 0,
			tickfont: {
				family: "Open Sans, Arial",
				size: 12,
				color: "#0d0d0d"
			}
		},
		yaxis: {
			type: "linear",
			autorange: true,
			side: "right",
			tickfont: {
				family: "Open Sans, Arial",
				size: 12,
				color: "#0d0d0d"
			},
			hoverformat: ".4r"
		},
		showlegend: false,
		paper_bgcolor: "#E1E9F0",
		margin: {
			t: 50, //30
			l: 15,
			r: 35,//35
			b: 40 //25
		},
		externalMargin:{
			t: 15,
			l: 15,
			r: 15,
			b: 15
		},
		customMarginOfObjects: 5
		//shapes: setRecessions(usRecessions, initialDate, currentDate)
	};

	// set layout defauls
	setJsonDefaults(layoutDefaults, layout);	
		
	
		
		
		
	// WORK DIV ELEMENTS AND BUTTONS DEFINITIONS

	
	// get div elements
	divInfo.plotDivElement = document.getElementById(divInfo.plotDivID);
		

	//DEBUG && OTHER_DEBUGS && console.log(divInfo.plotDivElement);
		
	
	// create children divs in plot

	// create child to home Plotly's plot
	divInfo.plotlyDivID = divInfo.plotDivID+"_plotly";	
	divInfo.plotlyDivElement = 
		createElement("div", divInfo.plotlyDivID);	
			
	divInfo.plotDivElement.appendChild(divInfo.plotlyDivElement);
	divInfo.plotlyDivElement.style["background-color"] = layout.paper_bgcolor;
	//DEBUG && OTHER_DEBUGS && console.log("plotlyDivElement",divInfo.plotlyDivElement);
		
	
	// create footer div in case required to home buttons
	if(settings.allowCompare || settings.allowLogLinear || 
	   settings.allowDownload || settings.allowRealNominal){
		divInfo.footerDivID = divInfo.plotDivID+"_plotlyFooter";
		divInfo.footerDivElement = 
			createElement("div", divInfo.footerDivID);			

		divInfo.plotDivElement.appendChild(divInfo.footerDivElement);
		divInfo.footerDivElement.style["background-color"] = layout.paper_bgcolor;

	}
	
	
	// apply removeDoubleClickToZoomBackOut
	if (settings.removeDoubleClickToZoomBackOut) {
		removeDoubleClickToZoomBackOut();
	}
	
	// SET BUTTONS
	
	// LOG / LINEAR BUTTON
	if(settings.allowLogLinear){
		
		// name buttons
		divInfo.logLinearButtonID = divInfo.footerDivID+"_logLinear";
		
		// create one button
		settings.buttonsStyle.float = "right";
		settings.buttonsStyle.width = "50px";
		settings.buttonsStyle["border-style"] = "inset";
		settings.buttonsStyle["background-color"]= settings.buttonsHoverDefaultStyle["background-color"];
		
		divInfo.logLinearButtonElement = 
			createElement("button", divInfo.logLinearButtonID,
					layout.yaxis.type==="log" ? "log" : "linear",
					settings.buttonsStyle );
		
		divInfo.logLinearButtonElement.style.marginRight = layout.externalMargin.r+"px";

		divInfo.footerDivElement.appendChild(divInfo.logLinearButtonElement);
		
		$("#"+divInfo.logLinearButtonID).hover(
			function(){
				buttonOnHover($(this),
					settings.pressedButtonHoverDefaultStyle["background-color"],
					settings.pressedButtonHoverDefaultStyle.color);
        }, 
			function(){
				buttonOnHover($(this),
					settings.pressedButtonDefaultStyle["background-color"],
					settings.pressedButtonDefaultStyle.color);

			}
		);

		
	}	
		

	// DOWNLOAD BUTTON
		
	if(settings.allowDownload){
		
		// name button
		divInfo.downloadButtonID =divInfo.footerDivID+"_download";
		
		// create one button
		settings.buttonsStyle.float = "left";
		settings.buttonsStyle.width = "30px";
		settings.buttonsStyle["border-style"] = settings.buttonsDefaultStyle["border-style"];
		settings.buttonsStyle["background-color"]= settings.buttonsDefaultStyle["background-color"];
		
		divInfo.downloadButtonElement = 
			createElement("button", divInfo.downloadButtonID,""/*"download"*/, settings.buttonsStyle );
		divInfo.downloadButtonElement.innerHTML = 
			'<img src="'+
			'https://raw.githubusercontent.com/ajoposor/Images/master/files/Download_Arrow_10_Dark.png'+
			'" />';
		divInfo.downloadButtonElement.style.marginLeft = layout.externalMargin.l+"px";

		divInfo.footerDivElement.appendChild(divInfo.downloadButtonElement);
		
		$("#"+divInfo.downloadButtonID).hover(
			function(){
				buttonOnHover($(this),
					settings.buttonsHoverDefaultStyle["background-color"],
					settings.buttonsHoverDefaultStyle.color);
        }, 
			function(){
				buttonOnHover($(this),
					settings.buttonsDefaultStyle["background-color"],
					settings.buttonsDefaultStyle.color);

			}
		);
		
		
		divInfo.downloadButtonElement.addEventListener('click', function() {
			
			Plotly.relayout(divInfo.plotlyDivElement, {download: true});

		}, false);

	}	
		
		
	// REAL / NOMINAL BUTTON	
	if(settings.allowRealNominal){
		// name button
		divInfo.realNominalButtonID = divInfo.footerDivID+"_realNominal";
		// create one button
		settings.buttonsStyle.float = "left";
		settings.buttonsStyle.width = "55px";
		settings.buttonsStyle["border-style"] = "inset";
		settings.buttonsStyle["background-color"]= settings.buttonsHoverDefaultStyle["background-color"];
		
		divInfo.realNominalButtonElement = 
			createElement("button", divInfo.realNominalButtonID,
						settings.initialRealNominal === "real" ? "real":"nominal",
						settings.buttonsStyle);

		if(!settings.allowDownload){
			divInfo.realNominalButtonElement.style.marginLeft = layout.externalMargin.l+"px";
		}
		
		divInfo.footerDivElement.appendChild(divInfo.realNominalButtonElement);
		
				
		$("#"+divInfo.realNominalButtonID).hover(
			function(){
				buttonOnHover($(this),
					settings.pressedButtonHoverDefaultStyle["background-color"],
					settings.pressedButtonHoverDefaultStyle.color);
        }, 
			function(){
				buttonOnHover($(this),
					settings.pressedButtonDefaultStyle["background-color"],
					settings.pressedButtonDefaultStyle.color);

			}
		);
	}
		
		
	// COMPARE/UNCOMPARE BUTTON
	if(settings.allowCompare){
		
		// name button
		divInfo.compareButtonID =divInfo.footerDivID+"_compare";
		
		// create one button
		settings.buttonsStyle.float = "left";
		settings.buttonsStyle.width = "85px";
		settings.buttonsStyle["border-style"] = "inset";
		settings.buttonsStyle["background-color"]= settings.buttonsHoverDefaultStyle["background-color"];
		
		if(settings.series.baseAggregation === "percChange" || settings.series.baseAggregation === "sqrPercChange"){
			settings.transformToBaseIndex = false;
		}
		
		divInfo.compareButtonElement = 
			createElement("button", divInfo.compareButtonID,
						settings.transformToBaseIndex ? "compared":"uncompared",
						settings.buttonsStyle );

		if(!settings.allowDownload && !settings.allowRealNominal){
			divInfo.compareButtonElement.style.marginLeft = layout.externalMargin.l+"px";
		}
		
		divInfo.footerDivElement.appendChild(divInfo.compareButtonElement);
		
				
		$("#"+divInfo.compareButtonID).hover(
		function(){
				buttonOnHover($(this),
						settings.pressedButtonHoverDefaultStyle["background-color"],
						settings.pressedButtonHoverDefaultStyle.color);
        }, 
			function(){
				buttonOnHover($(this),
						settings.pressedButtonDefaultStyle["background-color"],
						settings.pressedButtonDefaultStyle.color);

			}
		);

	}	
			
		
		
	// change hover effect in touch devices
		
	var isTouch = false; //var to indicate current input type (is touch versus no touch) 
    	var isTouchTimer; 
    	var curRootClass = ""; //var indicating current document root class ("can-touch" or "")
     
	function addtouchclass(e){
		clearTimeout(isTouchTimer);
		isTouch = true;
		if (curRootClass !== "can-touch"){ //add "can-touch' class if it's not already present
		    curRootClass = "can-touch";
		    document.documentElement.classList.add(curRootClass);
				settings.pressedButtonHoverDefaultStyle["background-color"]=
				settings.pressedButtonHoverDefaultStyle["touch-background-color"];


		}

		//maintain "istouch" state for 500ms so removetouchclass 
		// doesn't get fired immediately following a touch event
		isTouchTimer = setTimeout(function(){isTouch = false;}, 500);

	}
     
	function removetouchclass(e){
		if (!isTouch && curRootClass === "can-touch"){ 
			//remove 'can-touch' class if not triggered by a touch event and class is present
			isTouch = false;
			curRootClass = "";
			document.documentElement.classList.remove("can-touch");
			settings.pressedButtonHoverDefaultStyle["background-color"]=
				settings.pressedButtonHoverDefaultStyle["mouse-background-color"];
		}
	}
     
	 //this event only gets called when input type is touch
	document.addEventListener("touchstart", addtouchclass, false);
	
	//this event gets called when input type is everything from touch to mouse/ trackpad
	document.addEventListener("mouseover", removetouchclass, false); 

		
		
		
		
		
	//	FREQUENCY RESAMPLING - TRANSFORM IN WEEKLY, MONTHLY, ETC., BY CLOSING, AVERAGE OVER PERIOD, CHANGE, ETC.

	// Set periodKeys based on desiredFrequencies	
	setPeriodKeysBasedOnDesiredFrequencies(settings.periodKeys, settings.desiredFrequencies, settings.period);	
		

	// WORK FREQUENCY CASES.
		
	// 1. deal with names for frequency and aggregation of initial data
		
		
	// 1a. case in which no base frequency name is provided, it assings the default frequency name (base)
	if (typeof settings.series.baseFrequency === "undefined") {
		settings.series.baseFrequency = settings.defaultNames.frequency;
		settings.series.customFrequency = true;
		settings.series.baseFrequencyType = "not available";
	}

	// 1.b frequency name is provided but is not in the list, then assigns custon name.
	if (!propertyInObject(settings.series.baseFrequency, possibleFrequencies)) {
		
		//DEBUG && OTHER_DEBUGS && console.log('max char',settings.maxNumberOfCharactersInFrequencyButton);
		//DEBUG && OTHER_DEBUGS && console.log('settings', settings);
		//DEBUG && OTHER_DEBUGS && console.log('baseFrequency', settings.series.baseFrequency);
		
		if(settings.series.baseFrequency.length>settings.maxNumberOfCharactersInFrequencyButton){
			settings.series.baseFrequency =
					settings.series.baseFrequency.substring(
						0,settings.maxNumberOfCharactersInFrequencyButton-1)+'.';
		}
		else{
			
			// settings.series.baseFrequency = settings.series.baseFrequency; ??
			
		}
		
		// creates custom frequency name in possible frequencies....
		possibleFrequencies[settings.series.baseFrequency] = true;

		// and adds it to the desired frequencies.
		addNameToArray(
			settings.series.baseFrequency,
			settings.desiredFrequencies,
			"unshift"
			);
		
		settings.series.customFrequency = true;
		settings.series.baseFrequencyType = "custom";

	} 
		
	// 1.c frequency name provided is in the list of possible frequencies	
	else {
			
		// base Frequency is possible, now check is added to desiredFrequencies.
		if(nameIsOnArrayOfNames(settings.series.baseFrequency, possibleFrequencies)=== false){
			
			settings.desiredFrequencies = insertDesiredFrequency(
			settings.series.baseFrequency,
			settings.desiredFrequencies,
			orderedPossibleFrequencies
			);		
			
		}
		settings.series.customFrequency = false;
		settings.series.baseFrequencyType = "normal";
	}

		
	
	var frequencyUpdateMenu = [
		{
			name: "frequencies",
			visible: true,
			type: "dropdown",
			active: 0,
			y: 1.14,
			yanchor: "top",
			x: 0.75,
			xanchor: "right",
			pad: { t: 1, r: 1, b: 1, l: 1 },
			direction: "down",
			font: {
				family: "Open Sans, Arial",
				size: 12,
				color: "#0d0d0d"
			},
			bgcolor: "#EEEEEE",
			buttons: setFrequencyButtons(settings.desiredFrequencies, possibleFrequencies)
		},
		{
			name: "aggregation",
			visible: true,
			type: "dropdown",
			active: 0,
			y: 1.14, //0.88
			yanchor: "top",
			x: 1,
			xanchor: "right",
			pad: { t: 1, r: 1, b: 1, l: 1 },
			direction: "down",
			font: {
				family: "Open Sans, Arial",
				size: 12,
				color: "#0d0d0d"
			},
			bgcolor: "#EEEEEE",
			buttons: baseAggregationButtons
		}
	]; // to be added to update menus
		

		
		
	// set active button for the frequencies
	frequencyUpdateMenu[0].active =  getMethodLocationInButtonsFromArg(
		settings.series.baseFrequency,
		frequencyUpdateMenu[0].buttons
	);
	


	// set frequency buttons, based on the options.desiredFrequencies parameter passed
	// returns frequency buttons to be used
	function setFrequencyButtons(desiredFrequencies, possibleFrequencies) {
		var frequencyButtons = [];

		for (var i = 0; i < desiredFrequencies.length; i++) {
			if (typeof possibleFrequencies[desiredFrequencies[i]] !== "undefined") {
				frequencyButtons[i] = {
					label: desiredFrequencies[i],
					method: "relayout",
					args: ["myFrequency", desiredFrequencies[i]]
				};
			}
		}

		return frequencyButtons;
	}
		
		
		
	// WORK WITH AGGREGATIONS
		
	// determine base aggregation type
	if (typeof settings.series.baseAggregation === "undefined") {
		settings.series.baseAggregationType = "not available";
	}
	else if (methodInButtons(settings.series.baseAggregation, baseAggregationButtons)){
		settings.series.baseAggregationType = "normal";
	}
	else {
		settings.series.baseAggregationType ="custom";
	}
		
	//2.a case in which aggregation type is not available and frequency type is not available or custom
	// no aggregation button.
	if (settings.series.baseAggregationType === "not available") {
		
		if(settings.series.baseFrequencyType!== "normal"){
			
			settings.series.baseAggregation = settings.defaultNames.aggregation;
			settings.series.baseAggregationLabel = settings.defaultNames.aggregation;
			settings.series.customAggregation = true;
			singleAggregationButton[0].label = settings.defaultNames.aggregation;
			singleAggregationButton[0].args[1] = settings.defaultNames.aggregation;	
			frequencyUpdateMenu[1].buttons = singleAggregationButton;
			frequencyUpdateMenu[1].visible = false;
			frequencyUpdateMenu[1].type = "buttons";
			frequencyUpdateMenu[1].showactive  = false;
			//DEBUG && OTHER_DEBUGS && console.log("case 2a frequency update menu", frequencyUpdateMenu);
		}

	}
	
	// 2.b frequency normal, aggregation not normal
	if(settings.series.baseFrequencyType === "normal"){
		
		if(settings.series.baseAggregationType !== "normal"){
			if(settings.series.baseAggregationType === "not available"){
				settings.series.baseAggregation = settings.defaultNames.aggregation;
				settings.series.baseAggregationLabel = settings.defaultNames.aggregation;
				settings.series.customAggregation = true;
				singleAggregationButton[0].label = settings.defaultNames.aggregation;
				singleAggregationButton[0].args[1] = settings.defaultNames.aggregation;
			}
			else{
				// settings.series.baseAggregation = settings.series.baseAggregation
				
				if(settings.series.baseAggregation.length > 
				   settings.maxNumberOfCharactersInAggregationButton){
					settings.series.baseAggregationLabel = 
						settings.series.baseAggregation.substring(
							0,
							settings.maxNumberOfCharactersInAggregationButton-1)+'.';
				}
				else{
					settings.series.baseAggregationLabel =settings.series.baseAggregation;
				}
				
				settings.series.customAggregation = true;	
				singleAggregationButton[0].label = settings.series.baseAggregationLabel;
				singleAggregationButton[0].args[1] = settings.series.baseAggregationLabel;
			}
			
			addButtonsToButtons(singleAggregationButton, combinedAggregationButtons);
			addButtonsToButtons(baseAggregationButtons, combinedAggregationButtons);
			frequencyUpdateMenu[1].buttons = combinedAggregationButtons;
			frequencyUpdateMenu[1].active = 0;
			frequencyUpdateMenu[1].type = "dropdown";
			//DEBUG && OTHER_DEBUGS && console.log("case 2b frequency update menu", frequencyUpdateMenu);
			
		}
	
	}
	
	var canvas = document.createElement('canvas');
		
	//2.c frequency not normal, aggregation custom or normal
	if(settings.series.baseFrequencyType !== "normal"){
		if(settings.series.baseAggregationType !== "not available"){

			if(settings.series.baseAggregationType === "custom"){

				settings.series.baseAggregation = settings.series.baseAggregation;

				if(settings.series.baseAggregation.length > 
				   settings.maxNumberOfCharactersInAggregationButton){
					
					settings.series.baseAggregationLabel = 
					settings.series.baseAggregation.substring(
						0,settings.maxNumberOfCharactersInAggregationButton-1)+'.';
					
				}
				else {
					
					settings.series.baseAggregationLabel = settings.series.baseAggregation;
						
				}

				//DEBUG && OTHER_DEBUGS && console.log("trimmed aggregation label", 
				//		settings.series.baseAggregationLabel);
				settings.series.customAggregation = true;
				singleAggregationButton[0].label = 
						fillStringUpTo(
							settings.series.baseAggregationLabel, 
							settings.singleButtonStringLengthInPixels,
							frequencyUpdateMenu[1].font.family,
							frequencyUpdateMenu[1].font.size,
							canvas
						);
				singleAggregationButton[0].args[1] = settings.series.baseAggregation;
				
			}
			
			// aggregation normal.
			else {
				
				settings.series.baseAggregationLabel = 
					getLabelFromButtonsGivenArg(settings.series.baseAggregation,
								    baseAggregationButtons);
				
				settings.series.customAggregation = false;	
				singleAggregationButton[0].label = 
							fillStringUpTo(
							settings.series.baseAggregationLabel, 
							settings.singleButtonStringLengthInPixels,
							frequencyUpdateMenu[1].font.family,
							frequencyUpdateMenu[1].font.size,
							canvas
						);				
				singleAggregationButton[0].args[1] = settings.series.baseAggregation;	
			}
			
			frequencyUpdateMenu[1].buttons = singleAggregationButton;
			frequencyUpdateMenu[1].visible = true;
			frequencyUpdateMenu[1].active = 0;
			frequencyUpdateMenu[1].type = "buttons";
			frequencyUpdateMenu[1].showactive = false;
			
		}
		
	}
		
	//2d frenquency and aggregation normal
	if(settings.series.baseFrequencyType==="normal" && settings.series.baseAggregationType ==="normal"){
			settings.series.baseAggregation = settings.series.baseAggregation;
			settings.series.baseAggregationLabel = 
				getLabelFromButtonsGivenArg(settings.series.baseAggregation, baseAggregationButtons);
			settings.series.customAggregation = false;
			frequencyUpdateMenu[1].buttons = baseAggregationButtons;
			frequencyUpdateMenu[1].visible = true;
			frequencyUpdateMenu[1].type = "dropdown";
			frequencyUpdateMenu[1].active = 
				getMethodLocationInButtonsFromArg(
					settings.series.baseAggregation,
					baseAggregationButtons
				);
			//DEBUG && OTHER_DEBUGS && console.log("case 2d frequency update menu", frequencyUpdateMenu);
		
	}
		
	
	// update aggregation buttons in case custom frequency and save in settings
		
	
	settings.singleAggregationButton = singleAggregationButton;
	settings.baseAggregationButtons = baseAggregationButtons;
	settings.combinedAggregationButtons = combinedAggregationButtons;
		
		
			
		
	// deals with defaults for change of frequency or aggregation
	if (typeof settings.changeFrequencyAggregationTo !== "undefined") {
		if (typeof settings.changeFrequencyAggregationTo.frequency === "undefined") {
			settings.changeFrequencyAggregationTo.frequency = "base";
			settings.changeFrequencyAggregationTo.aggregation =
				settings.series.aggregation;
		} 
		else if ( typeof settings.changeFrequencyAggregationTo.aggregation === "undefined") {
			settings.changeFrequencyAggregationTo.aggregation =
				settings.series.aggregation;
		}
	}
	

		
		
		
	var timeInfoDefaults = {
		// no defaults
	};
	
	setJsonDefaults(timeInfoDefaults, timeInfo);

	//RECESSIONS DEFINED

	//Recessions data. Include all available recession periods here
	
	var knownRecessionsDates =  [
		{
		x0: "1857-06-01",
		x1: "1858-11-30"
		},{
		x0: "1860-10-01",
		x1: "1861-05-31"
		},{
		x0: "1865-04-01",
		x1: "1867-11-30"
		},{
		x0: "1869-06-01",
		x1: "1870-11-30"
		}, {
		x0: "1873-10-01",
		x1: "1879-02-28"
		},{
		x0: "1882-03-01",
		x1: "1885-04-30"
		},{
		x0: "1887-03-01",
		x1: "1888-03-31"
		},{
		x0: "1890-07-01",
		x1: "1891-04-30"
		},{
		x0: "1893-01-01",
		x1: "1894-05-31"
		},{
		x0: "1895-12-01",
		x1: "1897-05-31"
		},{
		x0: "1899-06-01",
		x1: "1900-11-30",
		},{
		x0: "1902-09-01",
		x1: "1904-07-31",
		},{
		x0: "1907-05-01",
		x1: "1908-05-31"
		},{
		x0: "1910-01-01",
		x1: "1911-12-31"
		},{
		x0: "1913-01-01",
		x1: "1914-11-30"
		},{
		x0: "1918-08-01",
		x1: "1919-02-28"
		},{
		x0: "1920-01-01",
		x1: "1921-06-30"
		}, {
		x0: "1923-05-01",
		x1: "1924-06-30"
		},{
		x0: "1926-10-01",
		x1: "1927-10-31"
		},{
		x0: "1929-08-01",
		x1: "1933-02-28"
		},{
		x0: "1937-05-01",
		x1: "1938-05-31"
		},{
		x0: "1945-02-01",
		x1: "1945-09-30"
		},{
		x0: "1948-11-01",
		x1: "1949-09-30"
		},{
		x0: "1953-07-01",
		x1: "1954-04-30"
		},{
		x0: "1957-08-01",
		x1: "1958-03-31"
		},{
		x0: "1960-04-01",
		x1: "1961-01-31"
		},{
		x0: "1969-12-01",
		x1: "1970-10-31"
		},{
		x0: "1973-11-01",
		x1: "1975-02-28"
		},{
		x0: "1980-01-01",
		x1: "1980-06-30"
		},{
		x0: "1981-07-01",
		x1: "1982-10-31"
		}, {
		x0: "1990-07-01",
		x1: "1991-02-28"
		},{
		x0: "2001-03-01",
		x1: "2001-10-31"
		},{
		x0: "2007-12-01",
		x1: "2009-05-31"
		}];
	
	var usRecessions = createRecessionShapes(knownRecessionsDates, 
						 settings.recessionsFillColor, 
						 settings.recessionsOpacity);
	

	// TIME RANGE SELECTORS / a.k.a SELECTOR OPTIONS DEFINED
	// Section deals with buttons for time range selection, these would allow for display of 1m, 3m, 6m, 1y, YTD, etc.
	var selectorOptionsDefaults = {
		buttons: [
			{
				step: "month",
				stepmode: "backward",
				count: 1,
				label: "1m"
			},
			{
				step: "month",
				stepmode: "backward",
				count: 6,
				label: "6m"
			},
			{
				step: "year",
				stepmode: "todate",
				count: 1,
				label: "YTD"
			},
			{
				step: "year",
				stepmode: "backward",
				count: 1,
				label: "1y"
			},
			{
				step: "year",
				stepmode: "backward",
				count: 5,
				label: "5y"
			},
			{
				step: "year",
				stepmode: "backward",
				count: 10,
				label: "10y"
			},
			{
				step: "all",
			}
		],
		font: {
			family: "Open Sans, Arial",
			size: 12,
			color: "#0d0d0d"
		},
		xanchor: "right",
		x: 1,
		yanchor: "bottom",
		y: -0.24
	};


	// set initial x range data units
	//var xRangeUnits= 'daily';	//use daily, weekly, monthly, quarterly or annual
	//var xRangeAggregation= 'close'; //use average or close


	// LOG, LINEAR UPDATEMENUS
	// to be added to update menus
	var logLinearUpdateMenu = [
		{
			name: "logLinear",
			visible: true,
			active: settings.yaxisInitialScale === "linear" ? 
					0 : 
					1, // which button is active, from the array elements
			y: 1.14,
			yanchor: "top",
			x: 0,
			xanchor: "left",
			pad: { t: 1, r: 1, b: 1, l: 1 },
			direction: "down",
			font: {
				family: "Open Sans, Arial",
				size: 12,
				color: "#0d0d0d"
			},
			bgcolor: "#EEEEEE",
			buttons: [
				{
					method: "relayout",
					args: ["changeYaxisType", "linear"],
					label: "lin"
				},
				{
					method: "relayout",
					args: ["changeYaxisType", "log"],
					label: "log"
				}
			]
		}
	];

	// COMPARE UPDATEMENUS
	var compareUpdateMenu = [
		{
			name: "compare",
			visible: true,
			type: "buttons",
			showactive: false,
			y: -0.24,
			yanchor: "bottom",
			x: 0,
			xanchor: "left",
			pad: { t: 1, r: 1, b: 1, l: 1 },
			direction: "right",
			font: {
				family: "Open Sans, Arial",
				size: 12,
				color: "#0d0d0d"
			},
			bgcolor: "#EEEEEE",
			buttons: [
				{
					method: "relayout",
					args: ["compare", settings.transformToBaseIndex ? false : true],
					label: settings.transformToBaseIndex ? "uncompare" : "compare"
				}
			]
		}
	];

	

	// DISPLAY OPTIONS SETTINGS
	// set display options
	var optionsDefaults = {
		showLink: false,
		displayModeBar: false
	};

	setJsonDefaults(optionsDefaults, options);

	// After all settings ready, call function to read data, adjust ranges, set menus and make chart
	// var data = []; //, dataOriginal = [];
	// var dataOriginalModes = [];
	/*var iS = {
		value: 0
	};*/
	
	// handles tracesInitialDate default info
	if (typeof timeInfo.tracesInitialDate === "undefined") {
		timeInfo.tracesInitialDate = "";
	}

	
	
	var passedParameters = {
		otherDataProperties: otherDataProperties,
		dataSources: dataSources,
		divInfo: divInfo,
		settings: settings,
		timeInfo: timeInfo,
		usRecessions: usRecessions,
		selectorOptions: typeof layout.xaxis.rangeselector === "undefined"?
					selectorOptionsDefaults :
					layout.xaxis.rangeselector,
		frequencyUpdateMenu: frequencyUpdateMenu,
		logLinearUpdateMenu: logLinearUpdateMenu,
		compareUpdateMenu: compareUpdateMenu,
		layout: layout,
		options: options
	};


	
	DEBUG && DEBUG_TIMES && console.timeEnd("TIME: initialSettingsBeforeReadData");
	DEBUG && OTHER_DEBUGS && console.log("passedParemeters: ", passedParameters);
	
	parallelReadDataAndMakeChart(data, passedParameters);
	
	
}; // END OF newTimeseriesPlot FUNCTION


	 
	 
// FUNCTION TO READ DATA AND THEN MAKE CHART - LOADS IN PARALLEL
function parallelReadDataAndMakeChart(data, param) {
	
	DEBUG && DEBUG_TIMES && console.time("TIME: parallelReadData");
	
	// set function to local variable
	var localParallelReadData = parallelReadData;
	
	// define queue and set concurrenty
	DEBUG && OTHER_DEBUGS && console.log("queueConcurrencyLimit: ", param.settings.queueConcurrencyLimit);
	var plotQueue = d3.queue(param.settings.queueConcurrencyLimit);
	
	
	// add read data from dataSources to queue 
	var iLimit =param.dataSources.length;
	
	for(var i=0; i < iLimit; i++){
		DEBUG && OTHER_DEBUGS && console.log("add call parallelReadData to defer: ",i);
		plotQueue.defer(localParallelReadData, data, i, param );
	}
	
	
	// add call update recessions from external source to queue
	DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("adding update recessions to queue");
	DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("param.settings.newRecessionsUrl",param.settings.newRecessionsUrl);
	DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("param.usRecessions",param.usRecessions);
	
	plotQueue.defer(parallelUpdateRecessions, param.settings.newRecessionsUrl, param.usRecessions);
	
	plotQueue.awaitAll(function(error){
		if(error){
			DEBUG && OTHER_DEBUGS && console.log("plotQueu await threw error");
			DEBUG && OTHER_DEBUGS && console.log("the error is", error);
			//display blank plot
		} else {
			DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&   console.log("param.usRecessions.length before calling makeChart: ", 
					     param.usRecessions.length);
			// once all files all read, i.e. iS === series.length, this section is executed
			DEBUG && OTHER_DEBUGS && console.log("data: ", data);
			DEBUG && OTHER_DEBUGS && console.log("param: ", param);	
			DEBUG && DEBUG_TIMES && console.timeEnd("TIME: parallelReadData");
			
			// test with void data
			//var data = [{x:[], y:[]}];
			
			addCalculatedTracesWithFunctions(data, param);
			addCalculatedRealTraces(data, param);
			trimNonExistingDataXY(data, param.otherDataProperties);
			// this removes data[i], where data[i].x or y don't exist or have zero elements
			cleanOutData(data);
			if(data.length < 1) {
				showNoLoadedDataItem(param.divInfo);
			} else {
				makeChart(data, param);
				DEBUG && OTHER_DEBUGS && console.log("allread and ploted");
				DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("param.settings.newRecessionsUrl: ",
						    param.settings.newRecessionsUrl);

			}
		}
		
	});
} //  end of parallelReadDataAndMakeChart
	

function cleanOutData(data) {
	var iLimit = data.length;
	
	DEBUG && OTHER_DEBUGS && DEBUG_EIA_FUNCTION && console.log("data entering clean out data");
	
	for(var i=0; i < iLimit; i++){
		if(typeof data[i].x === "undefined" ||
		   typeof data[i].y === "undefined" ||
		   data[i].x.length < 1 ||
		   data[i].y.length < 1 ||
		   data[i].x.length !== data[i].y.length){
			data.splice(i,1);
		}
	}
}

function showNoLoadedDataItem(divInfo) {
	
	// determine element where no data message will be displayed
	var messageContainerElement  = divInfo.onErrorHideWholeDiv ? divInfo.wholeDivElement : divInfo.plotDivElement;
	
	
	// remove all children from messageElement
	while (messageContainerElement.hasChildNodes()) {
	    messageContainerElement.removeChild(messageContainerElement.lastChild);
	}	
	
	// append child
	if(divInfo.onErrorHideWholeDiv){
		messageContainerElement.style.height = ""+(numberExPx(divInfo.plotDivElement.style.height)+40)+"px";
	} 
	
	messageContainerElement.innerHTML = divInfo.noLoadedDataMessage;
	
	wholeDivShow(divInfo.wholeDivElement);
	loaderHide(divInfo.loaderElement);
	
}


	
	
	

function parallelUpdateRecessions(newRecessionsUrl, usRecessions, callback){

	// this function will get a zip file and update the usRecessions
	// in an async manner. This assumes the variable will be updated 
	// before plotly is called
	var fredZipXMLHttpRequestOptions = {
		responseType: "arraybuffer",
		method: "GET",
		async: true,
		url: newRecessionsUrl,
	};
	
	DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("XMLHttpRequestOptions", fredZipXMLHttpRequestOptions);
	
	if(fredZipXMLHttpRequestOptions.url !== ""){
		
		function myCallBackFredZip(usRecessions){
			return function (xhttp, callback) {
				return afterFredZipFileLoaded(xhttp, usRecessions, callback);
				
			};
		}
		
		
		DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("calling wrappedDirectXMLHttpRequest");
		
		wrappedDirectXMLHttpRequest(fredZipXMLHttpRequestOptions,  myCallBackFredZip(usRecessions), callback);
		//}(fredZipXMLHttpRequestOptions, myCallBackFredZip(usRecessions)); 
	}			
			
}
	
		
	 
/**
*
* readData section
*
*
*/
	
// delay the call of data loading by a certain delay	
function parallelReadData(data, i, param, callback) {
	
	setTimeout( delayedParallelReadData(data, i, param, callback), param.settings.queueConcurrencyDelay);
}
	 
function delayedParallelReadData(data, i, param, callback) {
	
	var urlType = param.dataSources[i].urlType;
	var url = param.dataSources[i].url;
	var yqlGoogleCSVUrl = "";
	
	if (urlType === "csv") {
		DEBUG && DEBUG_TIMES && console.time("Time Read File "+i);
		Plotly.d3.csv(url, function(err, readData) {
			DEBUG && OTHER_DEBUGS && console.log("csv", i);
			if(!err){
				if(checkDataIsAnArrayNotVoid(readData)){
					DEBUG && DEBUG_CSV && console.log("readData "+i+" readDate.length: ",
									  readData.length);
					DEBUG && DEBUG_TIMES && console.timeEnd("Time Read File "+i);
					DEBUG && DEBUG_TIMES && console.time("Time ProcessCsvData "+i);
					processCsvData(
						readData, 
						data,
						param.timeInfo.tracesInitialDate,
						param.otherDataProperties,
						param.dataSources[i],
						loadSubTablesIntoData
						);
					DEBUG && DEBUG_TIMES && console.timeEnd("Time ProcessCsvData "+i);
					DEBUG && OTHER_DEBUGS && console.log("processCsvData",i,"finished");
				}
			} else {
				DEBUG && OTHER_DEBUGS && console.log("error reading CsvData",i);
			}		
			readData="";
			callback(null);
			//readDataAndMakeChart(data, iS, param, callback);
		});
	} 
	else if (urlType === "arrayOfJsons") {
		DEBUG && OTHER_DEBUGS && console.log("arrayOfJsons", i);
		processCsvData(
			param.dataSources[i].arrayOfJsons, 
			data,
			param.timeInfo.tracesInitialDate,
			param.otherDataProperties,
			param.dataSources[i],
			loadSubTablesIntoData
			);
		DEBUG && OTHER_DEBUGS && console.log("process ArrayOfJsons",i,"finished");
		param.dataSources[i].arrayOfJsons = [];
		callback(null);
		//readDataAndMakeChart(data, iS, param, callback);
	} 
	else if (urlType === "yqlJson") {
		DEBUG && OTHER_DEBUGS && console.log("yqlJson", i);
		Plotly.d3.json(url, function(err, readData) {
			if(!err){
				if(typeof readData.query !== "undefined" &&
				   typeof readData.query.results !== "undefined" &&
				   typeof readData.query.results.json !== "undefined" &&
				    typeof readData.query.results.json.observations !== "undefined") {
					readData = readData.query.results.json.observations;
					if(checkDataIsAnArrayNotVoid(readData)){
						processCsvData(
							readData,
							data,
							param.timeInfo.tracesInitialDate,
							param.otherDataProperties,
							param.dataSources[i],
							loadSubTablesIntoData
							);
						DEBUG && OTHER_DEBUGS && console.log("process yqlJson",i,"finished");
					}
				}
			} else {
				DEBUG && OTHER_DEBUGS && console.log("error reading yqlJson",i);
			}
			readData="";
			callback(null);
			//readDataAndMakeChart(data, iS, param, callback);
		});
	}   
	else if ( urlType === "yqlGoogleCSV") {
		DEBUG && OTHER_DEBUGS && console.log("yqlGoogleCSV", i);
		yqlGoogleCSVUrl = "https://query.yahooapis.com/v1/public/yql?q="+
			encodeURIComponent("SELECT * from csv where url='"+url+"'")+
			"&format=json";
		Plotly.d3.json(yqlGoogleCSVUrl, function(err, readData) {
			if(!err){
				if(typeof readData.query !== "undefined" &&
				   typeof readData.query.results !== "undefined" &&
				   typeof readData.query.results.row !== "undefined") {
					readData = readData.query.results.row;
					if(checkDataIsAnArrayNotVoid(readData)){
						processCsvData(
							readData,
							data,
							param.timeInfo.tracesInitialDate,
							param.otherDataProperties,
							param.dataSources[i],
							loadSubTablesIntoData
						);
						DEBUG && OTHER_DEBUGS && console.log("process yqlGoogleCSV",i,"finished");
					}
				}			
			} else {
				DEBUG && OTHER_DEBUGS && console.log("error reading yqlJson",i);
			}					
			readData="";
			callback(null);
			//readDataAndMakeChart(data, iS, param, callback);
		});
  	} 
	else if (urlType === "pureJson") {
		DEBUG && OTHER_DEBUGS && console.log("pureJson", i);
		Plotly.d3.json(url, function(err, readData) {
			if(!err){
				if(checkDataIsAnArrayNotVoid(readData)){
					processCsvData(
						readData, 
						data,
						param.timeInfo.tracesInitialDate, 
						param.otherDataProperties,
						param.dataSources[i],
						loadSubTablesIntoData
						);
					DEBUG && OTHER_DEBUGS && console.log("process pureJson",i,"finished");
				}
			} else {
				DEBUG && OTHER_DEBUGS && console.log("error reading yqlJson",i);
			}				
			readData="";
			callback(null);
			//readDataAndMakeChart(data, iS, param, callback);
		});
	} 
	else if ( urlType === "EiaJson") {
		DEBUG && OTHER_DEBUGS && console.log("EiaJson", i);
		Plotly.d3.json(url, function(err, readData) {
			if(!err){
				DEBUG && OTHER_DEBUGS && DEBUG_EIA_FUNCTION && console.log("read EiaJson",readData);
				if(typeof readData.series !== "undefined" ) {
					readData = readData.series;
					if(checkDataIsAnArrayNotVoid(readData)){
						processEiaData(
							readData,
							data,
							param.timeInfo.tracesInitialDate,
							param.otherDataProperties,
							param.dataSources[i],
							loadSubTablesIntoData
						);
						DEBUG && OTHER_DEBUGS && console.log("process EiaData",i,"finished");
					}
				}			
			} else {
				DEBUG && OTHER_DEBUGS && console.log("error reading EiaData",i);
			}					
			readData="";
			callback(null);
			//readDataAndMakeChart(data, iS, param, callback);
		});
	} 
	
	
	
	
}


function checkDataIsAnArrayNotVoid(readData){
	
	if(Array.isArray(readData) &&
	   readData.length > 0) {
		return true;
	} else {
		return false;
	}

}


// 2. Process CSVData or processEiaData- support function, reads data and add it to data object, increases global iS variable
    
	    
	    
// FUNCTIONS TO PARSE CVS, JSON OR DIRECT SERIES
// main code, reads cvs files and creates traces and combine them in data
function processCsvData(allRows, data, tracesInitialDate, otherDataProperties, dataSources, callbackLoadSubTablesIntoData) {
	
	var urlType = dataSources.urlType;
	var yqlGoogleCSV = false;
	var tags= typeof allRows[0] !== "undefined" ? allRows[0] : {};
	var xSeriesName="";
	var initialDateAsDate = new Date("0001-01-01");
	var timeOffsetText = getTimeOffsetText();
	var iLimit;
	
	/**
	*
	* The tableParams array has the following structure:
	*   tableParams[xSeriesNames].allRows[i][xSeriesName] = Dates as Strings
	*   tableParams[xSeriesNames].allRows[i][ySeriesName1] = y values for ySeriesName1,
	*   tableParams[xSeriesNames].allRows[i][ySeriesName2] = y values for ySeriesName2,.. etc.
	*
	*   i is the row (data points) in the allRows array. The are iLimit (data points) in the allRows array.
	*
	*   tableParams[xSeriesNames] has other properties, including sor, xDateSuffix, etc,
	*    all set in the setTablesParametersSortAndPreprocessing function
	*/
	
	var tableParams = {};
	
	
	// save function references
	var localProcessDate = processDate;
	

	
	// set flag for yqlGoogleCSV type and removes first row of array and translate names of columns to values
	if(urlType === "yqlGoogleCSV"){
		yqlGoogleCSV = true;
		if(allRows.lenght > 1) {
			if(!processYqlGoogleCSVTags(dataSources, tags)) return false;
			allRows.shift();
		} else {
			return false;
		}
	}
	
	xSeriesName = "";
	if(typeof dataSources.xSeriesName !== "undefined"){
		xSeriesName =  dataSources.xSeriesName;
	}
	

	// update initialDateAsDate if tracesInitialDate provided
	if (tracesInitialDate !== "") {
		initialDateAsDate = new Date(localProcessDate(tracesInitialDate, timeOffsetText));
	}
	
	DEBUG && OTHER_DEBUGS && console.log("initialDateAsDate", initialDateAsDate);
	
	
	//DEBUG && OTHER_DEBUGS && console.log("allRows: ", allRows);
	
	// total rows of csv file loaded
	// allRows is an array of objects
	iLimit = allRows.length;
	
	
	// Preprocess options for all Rows
	DEBUG && OTHER_DEBUGS && console.log("start preprocess");
	
	//removes data sources for which the corresponding xSeriesName or ySeriesName
	// doesn't exist in allRows
	verifyAndCleanDataSources(allRows, dataSources);
	
	// break if no traces in dataSources were left
	if(dataSources.traces.length < 1) return false;
	
	// get number of tables, sort and preprocessing of dates options
	setTablesParametersSortAndPreprocessing(tableParams, dataSources);
	DEBUG && OTHER_DEBUGS && console.log("table params set: ", tableParams);
	
	
	// apply date preprocessing options
	applyDateProprocessing(allRows, tableParams, urlType);
	
	DEBUG && OTHER_DEBUGS && console.log("data processing options applied");
	DEBUG && OTHER_DEBUGS && console.log("allRows",allRows);

	// split subtables trim by InitialDateAsDate and reorder by firstItemToRead
	// including applying factor and shift
	splitSubtablesAndTrim(allRows, tableParams, dataSources, initialDateAsDate);
	DEBUG && OTHER_DEBUGS && console.log("tables split, and reordered");
	DEBUG && OTHER_DEBUGS && console.log("table Params", tableParams);
	
	allRows = [];
	
	
	// sort subtables
	sortSubTables(tableParams);
	DEBUG && OTHER_DEBUGS && console.log("SubTable sorted");

	
	callbackLoadSubTablesIntoData(dataSources, tableParams, otherDataProperties, data, initialDateAsDate, tracesInitialDate);
	
	
}	
	

	
function processEiaData(eiaArrayData, data, tracesInitialDate, otherDataProperties, dataSources, callbackLoadSubTablesIntoData) {
	
	var kMax = eiaArrayData.length;
	var currentSeries = {};
	var i, seriesLimit;
	
	var timeOffsetText = getTimeOffsetText();
	var tracesInitialDateFullString;
	var initialDateAsDate = new Date("0001-01-01");
	
	/**
	*
	* The tableParams array has the following structure:
	*   tableParams[xSeriesNames].allRows[i][xSeriesName] = Dates as Strings
	*   tableParams[xSeriesNames].allRows[i][ySeriesName1] = y values for ySeriesName1,
	*   tableParams[xSeriesNames].allRows[i][ySeriesName2] = y values for ySeriesName2,.. etc.
	*
	*   i is the row (data points) in the allRows array. The are iLimit (data points) in the allRows array.
	*
	*   tableParams[xSeriesNames] has other properties, including sor, xDateSuffix, etc,
	*    all set in the setEiaTablesParameters function
	*/
	
	var tableParams = {};

	// save function references
	var localProcessDate = processDate;
	
	
	DEBUG && OTHER_DEBUGS && console.log(eiaArrayData);
	
	// update initialDateAsDate if tracesInitialDate provided
	if (tracesInitialDate !== "") {
		initialDateAsDate = new Date(localProcessDate(tracesInitialDate, timeOffsetText));
	}
	
	// break if no traces in dataSources were left
	if(dataSources.traces.length < 1) return false;
	
	/**
	* set number of tables and options, tableParams will have
	* one element for each trace in DataSources
	* Names will be set as follows
	* xSeriesName = "x" + j; /j is the trace index [0, number of traces in dataSources]
	*	ySeriesName = "y" + j;
	*
	*/
	setEiaTablesParameters(tableParams, dataSources);
	
	
	
	/**
	*
	*  Adjust all dates in eia Array Data, in case they are month or year, to end of period and add a timeoffset
	* transform from "yyyy" or "yyyymm" or "yyyymmdd" to whole date
	*/
	
	tracesInitialDateFullString = localProcessDate(tracesInitialDate, timeOffsetText);
	
	for (var k=0; k< kMax; k++ ){
		currentSeries = eiaArrayData[k];
		seriesLimit = currentSeries.data.length;
		if(currentSeries.f === "M"){
			if (currentSeries.hasOwnProperty("lastHistoricalPeriod")) {
				DEBUG && OTHER_DEBUGS && console.log(currentSeries.lastHistoricalPeriod.substr(0,4)+"-"+
					currentSeries.lastHistoricalPeriod.substr(4,2)+			     
					 "-01"+" 00:00:00.000"+timeOffsetText);
				currentSeries.lastHistoricalPeriod = 
					changeDateToEndOfMonth(currentSeries.lastHistoricalPeriod.substr(0,4)+"-"+
					currentSeries.lastHistoricalPeriod.substr(4,2)+			     
					 "-01"+" 00:00:00.000"+timeOffsetText);
			}
			for (i=0; i < seriesLimit; i++) currentSeries.data[i][0] = 
				changeDateToEndOfMonth(currentSeries.data[i][0].substr(0,4)+"-"+
					currentSeries.data[i][0].substr(4,2)+	       
					"-01"+" 00:00:00.000"+timeOffsetText);
		}
		
		if(currentSeries.f === "A"){
			if (currentSeries.hasOwnProperty("lastHistoricalPeriod")) {
				currentSeries.lastHistoricalPeriod += "-12-31 00:00:00.000"+timeOffsetText;
			}
			for (i=0; i < seriesLimit; i++) currentSeries.data[i][0] += "-12-31 00:00:00.000"+timeOffsetText;
		}
		
		if(currentSeries.f === "D"  || currentSeries.f === "W"){
			if (currentSeries.hasOwnProperty("lastHistoricalPeriod")) {
				currentSeries.lastHistoricalPeriod = currentSeries.lastHistoricalPeriod.substr(0,4)+"-"+
					currentSeries.lastHistoricalPeriod.substr(4,2)+"-"+
					currentSeries.lastHistoricalPeriod.substr(6,2)+
					" 00:00:00.000"+timeOffsetText;
			}
			for (i=0; i < seriesLimit; i++) currentSeries.data[i][0] = currentSeries.data[i][0].substr(0,4)+"-"+
						currentSeries.data[i][0].substr(4,2)+"-"+
						currentSeries.data[i][0].substr(6,2)+
						" 00:00:00.000"+timeOffsetText;
		}
		
	}
	
	

	/**
	*
	* loads data in eiaArrayData into tableParams
	* takes care of historical or forecast data
	* applies any option to read from last as set in firstItemToRead
	* trims data by InitialDateAsDate
	*  and 	applies factor and shift
	*/ 

	loadEiaArrayDataIntoTableParamsAndProcess(
		eiaArrayData, tableParams,
		dataSources, initialDateAsDate
	);
	
	
	// void eiaArrayData, no longer required.
	eiaArrayData = [];

	
	callbackLoadSubTablesIntoData(dataSources, tableParams, otherDataProperties, 
			      data, initialDateAsDate, tracesInitialDate);
	
	
}	
	
	
function factorAndShiftDataInTableParams(tableParams) {
	
}
	
	
// FUNCTIONS TO ADD READ and Processed data into the data array
function loadSubTablesIntoData(dataSources, tableParams, 
				otherDataProperties, data, 
				initialDateAsDate, tracesInitialDate) {
	
	var j, jLimit;
	var xSeriesName = "", ySeriesName = "";
	var traceID = "";
	var allRows = [];
	var iData;
	var insertTrace = false;
	var x = [], y = [];
	var readTraceInitialIndex =0;
	var readTraceEndIndex =0;	
	var readTraceLength = 0, readTraceLimit =0;
	var readTraceInitialDateAsDate, readTraceEndDateAsDate;
	var existingInitialDateAsDate, existingEndDateAsDate;
	var existingInitialValue, existingEndValue;
	var adjustFactor = 1.0, adjust="";
	var indexOfYSeriesName;
	var calculateAdjustedClose = false;
	var insertPoint = -1;
	var initialIndex = 0;
	var traceLength;
	var i = 0, iLimit;
	var spliceInfo = {};
	var k=0, kLimit =0;
	var readItems;
	var processedDate ="";
	var processedColumnDates = [];
	
	var localFindTraceIdIndex = findTraceIdIndex;
	var localFindSpliceInfo = findSpliceInfo;
	var localMyConcat = myConcat;
	var localInsertArrayInto = insertArrayInto;


	
	// number of traces to be read on this data source
	jLimit = dataSources.traces.length;
	
	DEBUG && OTHER_DEBUGS && console.log("dataSources: ", dataSources);


	
	// iterate through traces to be loaded
	for(j=0; j < jLimit; j++){
		
		DEBUG && OTHER_DEBUGS && console.log("starting trace: ", j);
		
		// set temporary variable
		xSeriesName = dataSources.traces[j].xSeriesName;
		ySeriesName = dataSources.traces[j].ySeriesName;
		traceID = dataSources.traces[j].traceID;
		DEBUG && OTHER_DEBUGS && console.log("xSeriesName: ", xSeriesName, "   ySeriesName: ", 
						     ySeriesName, "  traceID:", traceID);
		
		// get data
		allRows = tableParams[xSeriesName].allRows;
		iLimit = allRows.length;
		DEBUG && OTHER_DEBUGS && console.log("tableParams", tableParams);
		DEBUG && OTHER_DEBUGS && console.log("allRows from table params", allRows);

		
		// find trace index (position in data array)
		iData = localFindTraceIdIndex(traceID,otherDataProperties);
		DEBUG && OTHER_DEBUGS && console.log("iData", iData);
		
		// find whether trace will be added to existing trace
		insertTrace = false;
		if(typeof data[iData].x !== "undefined"){
			insertTrace = true;
		}
			
		// initialite x, y temporary arrays
		x = [];
		x.length = iLimit; 
		
		y = [];
		y.length = iLimit;
		
		
		readTraceInitialIndex = 0;
		
		readTraceEndIndex = allRows.length === 0 ? 0 : allRows.length-1;
		readTraceLength = allRows.length;
		
		DEBUG && OTHER_DEBUGS && console.log("readTraceInitialIndex ", readTraceInitialIndex);
		DEBUG && OTHER_DEBUGS && console.log("readTraceEndIndex ", readTraceEndIndex);
		DEBUG && OTHER_DEBUGS && console.log("xSeriesName: ", xSeriesName);
		DEBUG && OTHER_DEBUGS && console.log("allRows: ",allRows);
		
		readTraceEndDateAsDate = new Date(allRows[readTraceInitialIndex][xSeriesName]);
		readTraceInitialDateAsDate = new Date(allRows[readTraceEndIndex][xSeriesName]);
		
		adjust = "none";
		adjustFactor = 1.0;
		indexOfYSeriesName =tableParams[xSeriesName].yNames.indexOf(ySeriesName);
		calculateAdjustedClose = 
			tableParams[xSeriesName].yCalculateAdjustedClose[indexOfYSeriesName];
		
		DEBUG && OTHER_DEBUGS && console.log("calculateAdjustedClose", calculateAdjustedClose);
		
		if(insertTrace){
			DEBUG && OTHER_DEBUGS && console.log("insert trace");
			// default insert point
			insertPoint = 0;
			
			readTraceLimit = readTraceLength+readTraceInitialIndex;
			DEBUG && OTHER_DEBUGS && console.log("readTraceLimit",readTraceLimit);

			// get existing data x range
			existingInitialDateAsDate = new Date(data[iData].x[data[iData].x.length - 1]);
			existingEndDateAsDate = new Date(data[iData].x[0]);
			existingInitialValue =data[iData].y[data[iData].x.length - 1];
			existingEndValue =data[iData].y[0];
			
			DEBUG && OTHER_DEBUGS && console.log("existingInitialDateAsDate", existingInitialDateAsDate);
			DEBUG && OTHER_DEBUGS && console.log("existingEndDateAsDate", existingEndDateAsDate);
			DEBUG && OTHER_DEBUGS && console.log("existingInitialValue", existingInitialValue);
			DEBUG && OTHER_DEBUGS && console.log("existingEndValue", existingEndValue);

			// find trace range to be read

			// case no overlap, more recent
			if( readTraceInitialDateAsDate > existingEndDateAsDate){
				initialIndex = readTraceInitialIndex;
				traceLength = readTraceLength;

			}
			
			// case no overlap, older
			else if( readTraceEndDateAsDate < existingInitialDateAsDate){
				insertPoint = data[iData].x.length;
				initialIndex = readTraceInitialIndex;
				traceLength = readTraceLength;

			}

			// overlap, but new data is more recent than existing
			else if (readTraceEndDateAsDate > existingEndDateAsDate ) {
				initialIndex = 0;
				for(i=readTraceInitialIndex; i<readTraceLimit;i++){
					if(new Date(allRows[i][xSeriesName]) <= existingEndDateAsDate){
						traceLength = i-readTraceInitialIndex;
						if(calculateAdjustedClose){
							adjust = "existing"; // "new", "existing" or "none"
							adjustFactor = allRows[i][ySeriesName]/existingEndValue;
						}
						i = readTraceLimit;
					}
				}	
			}

			// overlap, but new data is older than existing
			else if (readTraceInitialDateAsDate < existingInitialDateAsDate ) {
				DEBUG && OTHER_DEBUGS && console.log("overlap, but new data is older than existing");
				for(i=readTraceLimit -1 ; i > readTraceInitialIndex-1; i--){
					if(new Date(allRows[i][xSeriesName]) >= existingInitialDateAsDate){
						initialIndex = i+1;
						traceLength = readTraceLimit - initialIndex;
						insertPoint = data[iData].x.length;
						if(calculateAdjustedClose){
							adjust = "new"; // "new", "existing" or "none"
							adjustFactor = existingInitialValue / allRows[i][ySeriesName];
						}
						i = readTraceInitialIndex-1;
					}
				}	
			}

			// case total overlap, find space available
			else {
				spliceInfo = localFindSpliceInfo(
					allRows,   xSeriesName, readTraceInitialIndex,
					readTraceLength, data[iData].x);
				initialIndex = spliceInfo.initialIndex;
				traceLength = spliceInfo.traceLength;
				insertPoint = spliceInfo.insertPoint;
		
				if(calculateAdjustedClose){
					adjust = "new"; // "new", "existing" or "none"
					adjustFactor = getAdjustFactor(allRows, xSeriesName, ySeriesName,
								    initialIndex, data[iData], insertPoint);
				}

			}
			
			if(calculateAdjustedClose){
				if(adjust !== "none" && adjustFactor !== 1.0){
					if(adjust === "new"){
						iLimit = allRows.length;
						for(i = 0; i < iLimit ; i++){
							allRows[i][ySeriesName] *= adjustFactor;
						}
					}
					else if(adjust === "existing"){
						iLimit = data[iData].y.length;
						for(i = 0; i < iLimit ; i++){
							data[iData].y[i] *= adjustFactor;
						}
					}
				}
			}
			
		} 

		// no trace inserted only charge
		else {
			initialIndex = readTraceInitialIndex;
			traceLength = readTraceLength;
			insertPoint = 0;
		}
		
		// fill temporary x, y arrays with read data
		readItems = 0;
		kLimit = traceLength;

		
		// just fill in processed dates
		DEBUG && OTHER_DEBUGS && console.log("fill processed dates");
		for(k=0, i=initialIndex; k < kLimit ; i++, k++){ 
			processedDate = allRows[i][xSeriesName];
			if (
				tracesInitialDate === "" ||
				new Date(processedDate) >= initialDateAsDate
			) {
				x[k]=processedDate;
				y[k]=allRows[i][ySeriesName];
				readItems++;
			}
			else {
				// stop reading when initialDateAsDate has been reached.
				k= kLimit;
			}
		}	

		// remove excess points
		if (x.length > readItems){
			x.length = readItems;
			y.length = readItems;
		}
		DEBUG && OTHER_DEBUGS && console.log("excess points removed");
		DEBUG && OTHER_DEBUGS && console.log("remaining points:", readItems);
		
		
		// create x and y properties if not yet defined for current trace
		if(typeof data[iData].x === "undefined" ||
		   typeof data[iData].y === "undefined") {
			data[iData].x = [];
			data[iData].y = [];
		}


		// add read data to current data
		if(readItems >0){
			
			// case new data come first
			if(insertPoint === 0){
				if(data[iData].x.length >0){
					data[iData].x = localMyConcat(x,data[iData].x);
					data[iData].y = localMyConcat(y,data[iData].y);	
				}
				else{
					data[iData].x = x;
					data[iData].y = y;
				}
			}
			// new data comes after
			else if (insertPoint === data[iData].x.length){
				data[iData].x = localMyConcat(data[iData].x,x);
				data[iData].y = localMyConcat(data[iData].y,y);	
			}
			// new data comes inside
			else {
				data[iData].x = localInsertArrayInto(x,insertPoint, data[iData].x);
				data[iData].y = localInsertArrayInto(y,insertPoint, data[iData].y);
			}
		}
		
		
		// set column as processed
		if(processedColumnDates.indexOf(xSeriesName) === -1){
			processedColumnDates.push(xSeriesName);
		}
		
		DEBUG && OTHER_DEBUGS && console.log("data after trace loaded: ", data);
	}

}


function verifyAndCleanDataSources(allRows, dataSources) {

	var traces = dataSources.traces;
	var jLimit = traces.length;
	var firstRow = allRows[0];
	
	for( var j = 0; j < jLimit; j++){
		if(typeof firstRow[traces[j].xSeriesName] === "undefined" ||
		   typeof firstRow[traces[j].ySeriesName] === "undefined") {
			traces.splice(j,1);
			jLimit--;
		}
	}
}
	
	




 
/**
*
*  addCalculatedTracesWithFunctions
*
*  This function will add calculated  traces (traces calculated from others loaded) using a generic function
*
*  Parameters are passed through the otherDataProperties array
*  
*  Properties relevant in the OtherDataProperties object are:
*	calculate: {
*		type: "poly",
*		polyFormualtion : {
*			argumentsIDs : [ traceID1, traceID2, ... } tracesIDs as defined in otherDataProperties
*                       traces should be already calculated, you may order traces to make calculations from calculations
*
*			formula: function (a, b, c, d... ) {   return result; }
*			(the formula will be passed values from traces traceID1, ... an so forth )
*                       (there should be at least on argument, so that x values are taken for that trace),
*
*			daysThreshold: number of days that would be valid to considered as a same date in the x axis
*
*
*   }
*
*  There should be also a deflactor trace already loaded
*
*/
	
	
function addCalculatedTracesWithFunctions(data, param) {
	

	var otherDataProperties = param.otherDataProperties;
	var j, iLimit = otherDataProperties.length;
	var originalDataCreated = false;
	var useVoidPeriodKeys = {};
	var argumentsIndexes;
	var polyFormulation;
	var numberOfArguments = 0;
	var error = false;
	var foundIndex = -1;
	var daysThreshold;
	
	// iterate through all traces in otherDataProperties
	for (var i=0; i < iLimit; i++) {
		// test whether a calculate option with poly is added
		if(typeof otherDataProperties[i].calculate !== "undefined" &&
		  typeof otherDataProperties[i].calculate.type !== "undefined" &&
		  otherDataProperties[i].calculate.type === "poly") {
			
			// Following lines will create a calculated trace as a function of other traces
			
			if(typeof otherDataProperties[i].calculate.polyFormulation !== "undefined") {
				
				polyFormulation = otherDataProperties[i].calculate.polyFormulation;
				DEBUG && DEBUG_createTraceWithFunction && console.log("polyFormulation", polyFormulation);
				
				
				/* get the number of arguments to be passed */
				if(typeof polyFormulation.argumentsIDs !== "undefined"){
					numberOfArguments = polyFormulation.argumentsIDs.length;
				} else {
					error = true;
					console.log("should pass at least one trace argument to addCalculatedTracesWithFunctions");
				}
				
				DEBUG && DEBUG_createTraceWithFunction && console.log("numberOfArguments", numberOfArguments);

				
				/* get the daysThreshold - default = 0 */
				if(typeof polyFormulation.daysThreshold !== "undefined"){
					daysThreshold = polyFormulation.daysThreshold;
				} else {
					daysThreshold = 0;
				}

				/**
				* find the indexes of the arguments ID's
				*
				*/
				error = false;
				if(numberOfArguments > 0) {
					argumentsIndexes = [];
					for (j = 0; j < numberOfArguments; j++){
						foundIndex = findTraceIdIndex(polyFormulation.argumentsIDs[j],
										    otherDataProperties);
						if(foundIndex === -1) {
							error = true;
							console.log("traceId not found:", polyFormulation.argumentsIDs[j]);
						}
					  argumentsIndexes.push(foundIndex);
					}
				}
				
				if(!error) {

					// save data into Original if not yet done
					if(originalDataCreated === false){
						saveDataXYIntoPropertyXY(data, "xOriginal", "yOriginal");
						originalDataCreated = true;
					}
			
				
					// create the requested  trace
					createTraceWithFunction(data, argumentsIndexes, polyFormulation.formula, i, daysThreshold);			}
			}
		}
	}
}
	
	
		
function createTraceWithFunction(data, argumentsIndexes, theFormula, indexOfCreatedTrace, daysThreshold){
	
	var indexOfAnchorTrace;
	var limitOfArgument = [];
	var positionInArgument = [];
	var pointFound = [];
	var functionArguments = [];
	var i, iLimit, j, k, kLimit;
	var calculatedX = [];
	var calculatedY = [];
	var numberOfArguments;
	var anchorDateAsDate;
	var millisecondsThreshold = daysThreshold*24*60*60*1000;
	var currentDistance;
	var newDistance;
	var commonPointFound;
	var calculatedValue;
	
	DEBUG && DEBUG_createTraceWithFunction && console.log("in createTraceWithFunction");
	DEBUG && DEBUG_createTraceWithFunction && console.log("argumentsIndexes: ", argumentsIndexes);
	
	/* get number of arguments */
	numberOfArguments = argumentsIndexes.length;
	DEBUG && DEBUG_createTraceWithFunction && console.log("numberOfArguments: ", numberOfArguments);
	
	/* assign limit of elements of argument and current position in Argument */
	limitOfArgument.length = numberOfArguments;
	positionInArgument.length = numberOfArguments;
	pointFound.length = numberOfArguments;
	functionArguments.length = numberOfArguments;
							      
	DEBUG && DEBUG_createTraceWithFunction && console.log("limitOfArgument array: ", limitOfArgument);						      
							      
	
	for(j = 0; j < numberOfArguments; j++) {
		limitOfArgument[j] = data[argumentsIndexes[j]].x.length;
		positionInArgument[j] = 0;
		pointFound[j] = false;
	}
	
	/* get first trace argument as anchor trace */
	indexOfAnchorTrace = argumentsIndexes[0];
	DEBUG && DEBUG_createTraceWithFunction && console.log("indexOfAnchorTrace: ", indexOfAnchorTrace);
	
	/* get limit of anchor trace */
	iLimit = data[indexOfAnchorTrace].x.length;
	DEBUG && DEBUG_createTraceWithFunction && console.log("limit of anchor trace: ", iLimit);						      
	
	/* cycle throght anchor trace points */ 
	for(var i = 0; i < iLimit ; i++) {
		
		/* update position of anchor trace point */
		positionInArgument[0] = i;
		
		/* if there are more than one argument */
		if(numberOfArguments > 1) {
			anchorDateAsDate = new Date(data[indexOfAnchorTrace].x[i]);
			/* set pointFound to false */
			for(j = 1; j < numberOfArguments; j++){
				pointFound[j] = false;
			}
			
			/* find positions to lower or equal to anchorDate and threshold */
			for(j = 1; j < numberOfArguments; j++){
				/* test with current position */
				currentDistance = Math.abs(anchorDateAsDate - 
							   newDate(data[argumentsIndexes[j]].x[positionInArgument[j]]));
				if(currentDistance <= millisecondsThreshold) {
					pointFound[j] = true;
				}
				
				if(currentDistance > 0) {
					/* find closest point */
					kLimit = limitOfArgument[j];
					for( k = positionInArgument[j]; k < kLimit; k++) {
						newDistance = Math.abs(anchorDateAsDate - 
								       newDate(data[argumentsIndexes[j]].x[positionInArgument[j]]));
						if(newDistance < currentDistance) {
							if (newDistance <= millisecondsThreshold){
								pointFound[j] = true;
							}
							currentDistance = newDistance;
							positionInArgument[j] = k;
						}
						
						if(newDistance === 0.0){
							k = kLimit;
						}
					}
				}
			}
			
			/* test whether a common point was found and execute function and add point */
			commonPointFound = true;
			for (j = 1;  j < numberOfArguments; j++){
				if(pointFound[j] === false) commonPointFound = false;
			}
			
			/* make calculation and add point if commonPointFound */
			if(commonPointFound) {
				/* set arguments */
				for (j = 0;  j < numberOfArguments; j++){
					functionArguments[j] = data[argumentsIndexes[j]].y[positionInArgument[j]];
				}
				
				/* calculate function */
				calculatedValue = theFormula.apply(this, functionArguments);
				
				/* add calculated value and date to array */		
				if(!isNaN(calculatedValue)) {
					calculatedX.push(data[argumentsIndexes[0]].y[positionInArgument[0]]);
					calculatedY.push(calculatedValue);
				}
			}

		
		} 
		
				
		/* if there is only one argument */
		else {
			/* set arguments */
			functionArguments[0] = data[argumentsIndexes[0]].y[positionInArgument[0]];
				
			/* calculate function */
			calculatedValue = theFormula.apply(this, functionArguments);
			
			/* add calculated value and date to array */		
			if(!isNaN(calculatedValue)) {
				calculatedX.push(data[argumentsIndexes[0]].y[positionInArgument[0]]);
				calculatedY.push(calculatedValue);
			}
		}

	}
	
	data[indexOfCreatedTrace].x = calculatedX;
	data[indexOfCreatedTrace].y = calculatedY;

	DEBUG && OTHER_DEBUGS && console.log("data after createTraceWithFunction: ", data);

}	
	

	
	
	
 
/**
*
*  addCalculatedRealTraces
*
*  This function will add calculated real traces (traces calculated from others loaded) 
*
*  Parameters for the real transformation are passed through the otherDataProperties array
*  
*  Properties relevant in the OtherDataProperties object are:
*   calculate: {
*   type: "real",
*   sourceTrace: traceID,  (trace that will be transformed into real)
*   factorInformation: {
*        date: "end of trace" or "beginning of trace" or a date "yyyy-mm-dd  hh:mm:ss.sss-HH:MM"
*        referredDateTraceId: trace from which "end of trace" or "beginning of trace" will be taken
*    }
*   }
*
*  There should be also a deflactor trace already loaded
*
*/
	
	
function addCalculatedRealTraces(data, param) {
	

	var otherDataProperties = param.otherDataProperties;
	var iLimit = otherDataProperties.length;
	var targetDateAsString;
	var deflactorDictionary={};
	var deflactorValuesCreated = false;
	var originalDataCreated = false;
	var useVoidPeriodKeys = {};
	var iDeflactor = -1;
	var indexOfSourceTrace;
	var calculateObject;
	
	iDeflactor = getIDeflactor(otherDataProperties);
	
	// iterate through all traces
	for (var i=0; i < iLimit; i++) {
		// test whether a calculate option with real is added
		if(typeof otherDataProperties[i].calculate !== "undefined" &&
		  typeof otherDataProperties[i].calculate.type !== "undefined" &&
		  otherDataProperties[i].calculate.type === "real" &&
		  iDeflactor !== -1) {
			
			// Following lines will create a calculated trace as a real version from another trace
			
			calculateObject = otherDataProperties[i].calculate; 
			
			/**
			* find the index of the sourceTrace
			*
			*/
			indexOfSourceTrace  =  findTraceIdIndex(calculateObject.sourceTrace, otherDataProperties);
			
			// save data into Original if not yet done
			if(originalDataCreated === false){
				saveDataXYIntoPropertyXY(data, "xOriginal", "yOriginal");
				originalDataCreated = true;
			}
			
			// Create a dictionary with the deflactor values
			// in this case the dictionary will not cover period keys because it will be an original trace being created
			if( !deflactorValuesCreated ) {
				deflactorValuesCreated = 
					createDeflatorDictionary(deflactorDictionary, 
								 data, otherDataProperties, 
								 useVoidPeriodKeys,
								 iDeflactor);
			}
			
			// Get the target date (date that will be set to deflator = 1
			targetDateAsString = getTargetDateAsStringForCalculatedTrace(
				calculateObject, 
				otherDataProperties, 
				data);
			
			// Set dictionary at targetDate
			setDeflactorDictionaryAtDate(targetDateAsString, deflactorDictionary, data[iDeflactor], 0);
				
			// create the requested real trace	
			createRealTrace(data, deflactorDictionary, targetDateAsString, otherDataProperties, 
					indexOfSourceTrace, i);

		}
	}
	
}

 
// first get the target date in the referredDateTraceID
function getTargetDateAsStringForCalculatedTrace(calculateObject, otherDataProperties, data) {
	var indexOfreferredDateTraceID;
	var indexOfSourceTrace;
	var referredDate;
	
	
	/**
	*  calculateObject : {
	*		type: "real",
	*		sourceTrace: "Any traceID, this trace will be transformed to real"
	*		factorInformation: {
	*			date: could be "end of trace", "beginning of trace" or a date "yyyy-mm-dd  hh:mm:ss.sss-HH:MM",
	*			referredDateTraceID: (optional), would be the traceID from which a date will be selected
	*			}
	*		}
	*
	*/
	
	
	/**
	* find the index of the sourceTrace
	*
	*/
	indexOfSourceTrace  =  
			findTraceIdIndex(calculateObject.sourceTrace, otherDataProperties);
	
	
	/** find the index of the referredDateTraceID
	*   in case date is "end of trace" or "beginning of trace"
	*/
	if(calculateObject.factorInformation.date === "end of trace" ||
	   calculateObject.factorInformation.date === "beginning of trace"){
		indexOfreferredDateTraceID  =  
			findTraceIdIndex(calculateObject.factorInformation.referredDateTraceID, otherDataProperties);
	}
	
	/** second, get the date from the referredDateTrace or from an specified data 
	*
	*  in case the date provided contains an error, as default, the last date on the sourceTrace will be used
	*
	*/
	referredDate = getReferredDate(calculateObject.factorInformation.date, indexOfreferredDateTraceID , data);
	if(referredDate === "undefined"){
		referredDate = data[indexOfSourceTrace].x[0];
	}

	return referredDate;


}	
	

/**
*  Create CPI dictionary
*
*/
function createDeflatorDictionary(deflactorDictionary, data, otherDataProperties, periodKeys, iDeflactor) {
	var deflactorValuesCreated = false;

	
	// map index to x's

	
	//DEBUG && OTHER_DEBUGS && console.log("iDeflactor",iDeflactor);

	deflactorValuesCreated = createIndexMap(data, deflactorDictionary, periodKeys, iDeflactor);
	
	return deflactorValuesCreated;
	
}



/**
*
* Based on dateCode determines the date in a referredDateTraceID
*
*/
	
function getReferredDate(dateCode, traceIndex , data){

	if(dateCode === "end of trace"){
		return data[traceIndex].x[0];
	}
	else if(dateCode === "beggining of trace"){
		return data[traceIndex].x[data[traceIndex].x.length - 1];
	}
	else if (Object.prototype.toString.call(new Date(dateCode)) === "[object Date]" ) {
		// it is a date ?
		if ( isNaN( (new Date(dateCode)).getTime() ) ) {  // d.valueOf() could also work
			// baseRealDate date is not valid, return default
			return "undefined";
		}
		else {
			// baseReadDate date is valid
			DEBUG && OTHER_DEBUGS && console.log("baseRealDate returned as valied");
			return dateCode;
		}
	}
	else {
		// baseRealDate not a date, return default
		return "undefined";
	}	
	
}	


/* NOT NEEDED */	
/**
*
* finds the index in the source trace which has an x value closest to targetDateAsString
*/
/*	
function jIndexInTargetWithClosestDate(data, indexOfSourceTrace, targetDateAsString){
	var jIndex;
	var jLimit = data[indexOfSourceTrace].length;
	var distance = -1.0;
	var newDistance = -1.0
	
	var targetDateAsDate = new Date(targetDateAsString);
	
	distance = Math.abs(new Date(data[indexOfSourceTrace].x[0]) - targetDateAsDate);
	jIndex = 0;
	
	if(distance <> 0) {
		for (var j = 0; j < jLimit; j++){
			newDistance = Math.abs(new Date(data[indexOfSourceTrace].x[j]) - targetDateAsDate);
			if(newDistance < distance){
				distance = newDistance;
				jIndex = j;
				if(distance == 0) {
					j = jLimit;
				}

			}


		}
	}
	return jIndex;
}
	
*/	

	
function createRealTrace(data, deflactorDictionary, targetDateAsString, otherDataProperties, 
			  indexOfSourceTrace, indexOfCreatedTrace) {
	var j, jLimit;
	var deflactorAtTargetDate;
	

	// get deflactor value at targetDate
	deflactorAtTargetDate = Number(deflactorDictionary[targetDateAsString]);
	
	DEBUG && OTHER_DEBUGS && console.log("in createRealTrace");
	DEBUG && OTHER_DEBUGS && console.log("targetDateAsString: ", targetDateAsString);
	DEBUG && OTHER_DEBUGS && console.log("deflactorAtTargetDate: ", deflactorAtTargetDate);
	DEBUG && OTHER_DEBUGS && console.log("deflactorDictionary: ", deflactorDictionary);
	

	jLimit = data[indexOfSourceTrace].y.length;
	var calculatedX = [];
	var calculatedY = [];
	
	calculatedX.length = jLimit;
	calculatedY.length = jLimit;
	
	for (j = 0; j < jLimit; j++) {
		calculatedX[j] = data[indexOfSourceTrace].x[j];
		calculatedY[j] = data[indexOfSourceTrace].y[j] * deflactorAtTargetDate / 
			Number(deflactorDictionary[data[indexOfSourceTrace].x[j]]);
	}
	
	data[indexOfCreatedTrace].x = calculatedX;
	data[indexOfCreatedTrace].y = calculatedY;

	DEBUG && OTHER_DEBUGS && console.log("data after createRealTrace: ", data);
		
}
	
	
	
/**
* clean data after calculated traces have been calculated and before making a chart
* checks that data[i] has x an y arrays, otherwise, removes the corresponding element from 
* data and otherDataProperties
*/
function trimNonExistingDataXY(data, otherDataProperties){
	
	var iLimit = data.length;
	
	for(var i = 0; i < iLimit; i++) {
		if(typeof data[i].x === "undefined" ||
		   typeof data[i].y === "undefined") {
			// remove element
			data.splice(i,1);
			otherDataProperties.splice(i,1);
		}
	}
	
}


 
/**
*
* makeChart does 
* 1. precalculations and 
* 2. preparation of variables, menus, etc
* 3. makes chart
* 4. handle relayout events and funtionality with included buttons
*
*/
function makeChart(data, param){
	
	DEBUG && DEBUG_TIMES && console.time("TIME: makeChart");
	
	//DEBUG && OTHER_DEBUGS && console.log("issue #1");

	// variable definitions
	var x0 = "2000-01-01",
	x1 = "2001-01-01",
	yMinMax = [],
	yMinValue = 0,
	yMaxValue = 1,
	settings = {},
	options = {},
	layout = {},
	timeInfo = {},
	divInfo = {},
	otherDataProperties = [],
	deflactorDictionary = {},
	flag = false,
	index = 0,
	transformToBaseIndex = false,
	transformToReal = false,
	deflactorValuesCreated = false,
	originalLayout ={
		yaxis:{
			type:"",
			hoverformat:""
		}
	};

	// initial variables
	var isUnderRelayout = false;
	var frequenciesDataCreated = false;
	var uncomparedSaved = false;
	var nominalSaved = false;
	
	var newXRight, indexFrequencies, indexAggregation;


	settings = param.settings;
	options = param.options;
	layout = param.layout;
	timeInfo = param.timeInfo;
	divInfo = param.divInfo;
	otherDataProperties = param.otherDataProperties;

	//DEBUG && OTHER_DEBUGS && console.log("settings", settings);

	originalLayout.yaxis.hoverformat = layout.yaxis.hoverformat;
	originalLayout.yaxis.type = layout.yaxis.type;
	if(typeof layout.yaxis.tickformat !== "undefined"){
		originalLayout.yaxis.tickformat = layout.yaxis.tickformat;
	}
	
	
	// SAVE ORIGINAL DATA IF NOT YET DONE
	// saveDataXYIntoPropertyXY tests that data[i].x and data[i].y exist and that data[i].xOriginal and 
	//  data[i].yOriginal don't exist
	DEBUG && DEBUG_TIMES && console.time("TIME: Save Original Data");
	saveDataXYIntoPropertyXY(data, "xOriginal", "yOriginal");
	DEBUG && DEBUG_TIMES && console.timeEnd("TIME: Save Original Data");
	//DEBUG && OTHER_DEBUGS && console.log("original data saved");

	//DEBUG && OTHER_DEBUGS && console.log("tracesInitialDate", tracesInitialDate);

	// HTML VARIABLES AND SETTINGS
	var defaultDivHeight = "460px";
	if(settings.allowCompare || settings.allowLogLinear || settings.allosFrequencyResampling){
		defaultDivHeight = "480px";
	}

	var defaultDivWidth = "100%";

	var myPlot = document.getElementById(divInfo.plotlyDivID);

	var divHeightInStyle = divInfo.plotDivElement.style.height;
	var divWidthInStyle = divInfo.plotDivElement.style.width;
	//DEBUG && OTHER_DEBUGS && console.log("divHeightInStyle", divHeightInStyle);

	divInfo.plotDivElement.style.width =  
		divWidthInStyle === "" ? defaultDivWidth : divWidthInStyle;
	divInfo.plotDivElement.style.height = 
		divHeightInStyle === "" ? defaultDivHeight : divHeightInStyle;

	myPlot.style.width  = divInfo.plotDivElement.style.width;

	if(settings.allowCompare || settings.allowLogLinear || settings.allowDownload){
		divInfo.footerDivElement.style.width = myPlot.style.width;
		divInfo.footerDivElement.style.height = "23px";
		//DEBUG && OTHER_DEBUGS && console.log("plotDivElement height",divInfo.plotDivElement.style.height);

		myPlot.style.height =  ""+
			(numberExPx(divInfo.plotDivElement.style.height) - 
			numberExPx(divInfo.footerDivElement.style.height))+"px";

		//DEBUG && OTHER_DEBUGS && console.log("myPlot height",myPlot.style.height);
	}
	else{
		myPlot.style.height = 
			divInfo.plotDivElement.style.height;
	}


	//DEBUG && OTHER_DEBUGS && console.log("myPlot", myPlot);

	var currentFrequency = settings.series.baseFrequency;
	var currentAggregation = settings.series.baseAggregation;



	// TEST whether AN INITAL FREQUENCY TRANSFORMATION IS REQUIRED AND MAKE IT DOWN HERE
	if (typeof settings.changeFrequencyAggregationTo !== "undefined"){
		if (typeof settings.changeFrequencyAggregationTo.frequency !== "undefined") {
			if (settings.changeFrequencyAggregationTo.frequency !== currentFrequency) {
				// Original data already saved

				//DEBUG && OTHER_DEBUGS && console.log('settings.changeFrequencyAggregationTo.frequency',
				// settings.changeFrequencyAggregationTo.frequency);
				//DEBUG && OTHER_DEBUGS && console.log('currentFrequency',currentFrequency);
				//PENDING
				//PENDING
				//PENDING
				//currentFrequency = settings.changeFrequencyAggregationTo.frequency;
				//currentAggregation = settings.changeFrequencyAggregationTo.aggregation;

				// PENDING - RESET FREQUENCY AGGREGATION BUTTONS
			}
		}
	}


	// X RANGE DETERMINATIONS
	var minDateAsString = "1000-01-01", maxDateAsString = "1000-01-01";

	// this section finds the x range for the traces (which is already trimmed by tracesInitialDate)
	// range required in order to set the recession shapes.
	DEBUG && DEBUG_TIMES && console.time("getDataXminXmaxAsString");
	var minMaxDatesAsString = getDataXminXmaxAsString(data);
	DEBUG && DEBUG_TIMES && console.timeEnd("getDataXminXmaxAsString");
	DEBUG && OTHER_DEBUGS &&  console.log(minMaxDatesAsString);
	
	minDateAsString = minMaxDatesAsString.min;
	maxDateAsString = minMaxDatesAsString.max;

	//DEBUG && OTHER_DEBUGS && console.log("minMaxDates", minMaxDatesAsString);

	// load recession shapes for the traces' x range
	if (settings.displayRecessions) {
		layout.shapes = setRecessions(
			param.usRecessions,
			minDateAsString,
			maxDateAsString
		);
	}
	DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("recessions loaded");

	// X AXIS RANGE SETTINGS
	var xaxisRangeAsString = setDatesRangeAsString(
		minDateAsString,
		maxDateAsString,
		timeInfo
	);
	
	//DEBUG && OTHER_DEBUGS && console.log("xaxis range settings done");

	DEBUG && OTHER_DEBUGS && console.log("xaxisRange", xaxisRangeAsString);

	var initialDate = xaxisRangeAsString[0];
	var endDate = xaxisRangeAsString[1];

	layout.xaxis.range = [initialDate, endDate];

	// read division width
	var currentWidth = jQuery(myPlot).width();
	var divWidth = currentWidth;

	// set default left/right margins if not set
	setLeftRightMarginDefault(layout, 15, 35);
	
	var canvas = document.createElement('canvas');
	var textAndSpaceToTextRatio = settings.textAndSpaceToTextRatio;
	var xaxisFontFamily=layout.xaxis.tickfont.family;
	var xaxisFontSize=layout.xaxis.tickfont.size;
	var layoutMarginL=layout.margin.l;
	var layoutMarginR=layout.margin.r;
	
	DEBUG && DEBUG_TIMES && console.time("TIME: ticktextAndTickvals");
 
	// get ticktext and tickvals based on width and parameters
	var ticktextAndTickvals = aoPlotlyAddOn.getTicktextAndTickvals(
		initialDate,
		endDate,
		textAndSpaceToTextRatio,
		currentFrequency,
		xaxisFontFamily,
		xaxisFontSize,
		divWidth,
		layoutMarginL,
		layoutMarginR,
		canvas
	);
	DEBUG && DEBUG_TIMES && console.timeEnd("TIME: ticktextAndTickvals");

	// set layout ticktext and tickvals
	layout.xaxis.ticktext = ticktextAndTickvals.ticktext;
	layout.xaxis.tickvals = ticktextAndTickvals.tickvals;

	var baseIndexDate = initialDate; //If traces are to be converted to index=1 at at certain date

	// variable will contain all updatemenus to be used,
	var updateMenus = []; // variable to put all updateMenus.


	// loads updateMenuButtons, frequencies and aggregation methods
	if (settings.allowFrequencyResampling) {

		addToUpdateMenus(param.frequencyUpdateMenu, updateMenus, layout);
		if (!frequenciesDataCreated) {
			DEBUG && OTHER_DEBUGS && console.log("start TransformSeriesByFrequencies");
			DEBUG && DEBUG_TIMES && console.time("TIME: transformSeriesByFrequencies");
			transformSeriesByFrequenciesNew(
				data,
				settings.periodKeys,
				settings.endOfWeek
			);
			//DEBUG && DEBUG_TIMES && console.log("data", data);
			DEBUG && DEBUG_TIMES && console.timeEnd("TIME: transformSeriesByFrequencies");
			frequenciesDataCreated = true;
			DEBUG && DEBUG_TIMES && console.time("TIME: processFrequenciesDates");
			processFrequenciesDates(data, settings.periodKeys);
			DEBUG && DEBUG_TIMES && console.timeEnd("TIME: processFrequenciesDates");
		}
	}

	// loads log, linear updateMenuButtons,
	if (settings.allowLogLinear) {

		// set functionality to log/linear button
		divInfo.logLinearButtonElement.addEventListener('click', function() {

			Plotly.relayout(divInfo.plotlyDivElement, 
						{
						changeYaxisTypeToLog: layout.yaxis.type==="log" ? false: true
						});

		}, false);

	}


	// DEAL WITH REAL NOMINAL
	// add functionality to real nominal button
	if (settings.allowRealNominal) {

		divInfo.realNominalButtonElement.addEventListener('click', function() {
			//DEBUG && OTHER_DEBUGS && console.log("transform To Real",transformToReal);
			Plotly.relayout(
				divInfo.plotlyDivElement,
				{
					transformToReal: transformToReal ? false : true
				}
			);

		}, false);

	}		


	// map index to x's
	var iDeflactor = getIDeflactor(otherDataProperties);
	
	//DEBUG && OTHER_DEBUGS && console.log("iDeflactor",iDeflactor);

	deflactorValuesCreated = createIndexMap(data, deflactorDictionary, settings.periodKeys, iDeflactor);

	//DEBUG && OTHER_DEBUGS && console.log("deflactor map created");
	//DEBUG && OTHER_DEBUGS && console.log("deflactorDictionary",deflactorDictionary);

	if(typeof settings.initialRealNominal !== "undefined"){

		transformToReal = settings.initialRealNominal==="real" ? true : false;

	}
	else{
		transformToReal = false;
	}

	var baseRealNominalDate ="";
	var newBaseRealNominalDate ="";
	// transform yvalues to real for those to which applies
	
	DEBUG && DEBUG_TIMES && console.time("TIME: transformToReal");
	if (transformToReal) {

		//DEBUG && OTHER_DEBUGS && console.log("PENDING - InitialprepareTransformToReal");

		// determine base date
		/* could be "end of range", "end of domain", "beggining of range", beggining of domain",
		or a date "yyyy-mm-dd hh:mm:ss.sss-04:00"*/
		baseRealNominalDate = setBaseRealNominalDateAsString(
							settings.baseRealDate, 
							layout.xaxis.range[0],
							layout.xaxis.range[1],
							minDateAsString,
							maxDateAsString
							);

		DEBUG && OTHER_DEBUGS && console.log("baseRealNominalDate",baseRealNominalDate);

		setDeflactorDictionaryAtDate(baseRealNominalDate, deflactorDictionary, data[iDeflactor], 0);


		// recalculate data to real and save nominal data
		nominalSaved = prepareTransformToReal(
			nominalSaved,
			data,
			deflactorDictionary,
			baseRealNominalDate,
			otherDataProperties
		);


	}
	DEBUG && DEBUG_TIMES && console.timeEnd("TIME: transformToReal");
	
	
	DEBUG && OTHER_DEBUGS && console.log("data as real passed");
	//DEBUG && OTHER_DEBUGS && console.log("data as real",data);




	//TRANSFORM TO BASE INDEX
	//set true or false to scale traces to 1 on the initially displayed x0
	transformToBaseIndex = settings.transformToBaseIndex;

	DEBUG && DEBUG_TIMES && console.time("TIME: transformToBaseIndex");
	// transform yvalues to index at specified date
	if (transformToBaseIndex) {
		// original data already saved

		// recalculate data to base index and save uncompared data
		uncomparedSaved = prepareTransformToBaseIndex(
			uncomparedSaved,
			data,
			baseIndexDate,
			settings.allowCompare,
			layout,
			settings.series.baseAggregation
		);

		//DEBUG && OTHER_DEBUGS && console.log("compared");
	}
	DEBUG && DEBUG_TIMES && console.timeEnd("TIME: transformToBaseIndex");

	// add functionality to  compare button
	if (settings.allowCompare) {

		divInfo.compareButtonElement.addEventListener('click', function() {
			//DEBUG && OTHER_DEBUGS && console.log("transformToBaseIndex",transformToBaseIndex);
			Plotly.relayout(
				divInfo.plotlyDivElement,
				{
					compare: transformToBaseIndex ? false : true
				}
			);

		}, false);
		//addToUpdateMenus(param.compareUpdateMenu, updateMenus, layout);
	}

	DEBUG && OTHER_DEBUGS && console.log("allow compare functionality added");


	// set y axis range
	setYAxisRange(layout,
		      data, 
		      settings.numberOfIntervalsInYAxis, 
		      settings.possibleYTickMultiples, 
		      settings.rangeProportion);
	//DEBUG && OTHER_DEBUGS && console.log("y axis range set");

	//DEBUG && OTHER_DEBUGS && console.log("baseIndexDate", baseIndexDate);
	//DEBUG && OTHER_DEBUGS && console.log("initialDate", initialDate);

	// set initial background to log, linear buttons

	// to adjust frequency updatemenus horizontal settings on div width
	if (settings.allowFrequencyResampling) {
		var newX = xOfFirstFrequencyMenuItem(
			divWidth,
			layout,
			settings.widthOfRightItemsFrequencyButtons
		);


		if(layout.updatemenus[findIndexOfMenu(layout.updatemenus,"aggregation")].visible === true){
			setNewXToFrequencyButton(newX, layout.updatemenus, "frequencies");
			setNewXToFrequencyButton(xOfRightItems(divWidth, layout), layout.updatemenus,"aggregation");
		}
		else{
			setNewXToFrequencyButton(xOfRightItems(divWidth, layout), layout.updatemenus, "frequencies");
		}

	}
	
	

	// load selector options to display 1m, 3m, 6m, 1y, YTD, etc
	if (settings.allowSelectorOptions) {
		layout.xaxis.rangeselector = param.selectorOptions;
		setNewXToRangeSelector(divWidth, layout);
	}
	DEBUG && OTHER_DEBUGS && console.log("selector options loaded");

	//DEBUG && OTHER_DEBUGS && console.log("myPlot", myPlot);
	//DEBUG && OTHER_DEBUGS && console.log("layout", layout);
	//DEBUG && OTHER_DEBUGS && console.log(param.displayOptions);

	// make initial plot
	DEBUG && DEBUG_TIMES && console.time("TIME: Execute Plotly.newPlot");
	Plotly.newPlot(myPlot, data, layout, options).then(function() {
		wholeDivShow(param.divInfo.wholeDivElement);
		loaderHide(param.divInfo.loaderElement);
		DEBUG && DEBUG_TIMES && console.timeEnd("TIME: Execute Plotly.newPlot");
	});


	//instruction resizes plot
	window.addEventListener("resize", function() {
		Plotly.Plots.resize(myPlot);
	});





	DEBUG && OTHER_DEBUGS && console.log("start relayout handler");


	// UPDATE PLOT UNDER RELAYOUT EVENTS


	var relayoutUpdateArgs = [];


	myPlot.on("plotly_relayout", function(relayoutData) {
		DEBUG && DEBUG_TIMES && console.time("TIME: relayout");
		//myPlot.addEventListener('plotly_relayout', function(relayoutData) {
		//DEBUG && OTHER_DEBUGS && console.log("relayout en myPlot.on", isUnderRelayout);
		//DEBUG && OTHER_DEBUGS && console.log("relayoutData",relayoutData);
		//DEBUG && OTHER_DEBUGS && console.log("layout",layout);


		// CASE 1. case relayout is autosize, in which case, the updatemenu buttons for frequencies and
		//the x axis labels have to be redefined
		if (relayoutData.autosize === true) {
			// adjust frequency updatemenu buttons
			divWidth = jQuery(myPlot).width();
			DEBUG && DEBUG_FB && console.log("divWidth: ", divWidth);

			if (divWidth != currentWidth) {
				//update currentWidth
				currentWidth = divWidth;
				
				// voids relayoutUpdateArgs;
				relayoutUpdateArgs = {};

				if (settings.allowFrequencyResampling) {
					newX = xOfFirstFrequencyMenuItem(
						divWidth,
						layout,
						settings.widthOfRightItemsFrequencyButtons
					);
					
					newXRight = xOfRightItems(divWidth, layout);
					
					DEBUG && DEBUG_FB && console.log("divWidth: ", divWidth, "newX: ", newX, 
									 "widthOfRighItemx", 
									 settings.widthOfRightItemsFrequencyButtons,
									 "newXRight",
									newXRight);
					
					indexFrequencies = findIndexOfMenu(layout.updatemenus,"frequencies" );
					indexAggregation = findIndexOfMenu(layout.updatemenus,"aggregation");
					
					DEBUG && DEBUG_FB && console.log("index of frequencyMenu", indexFrequencies);
					DEBUG && DEBUG_FB && console.log("index of aggregationMenus", indexAggregation);
					

					if(layout.updatemenus[indexAggregation].visible){
						relayoutUpdateArgs["updatemenus["+indexFrequencies+"].x"] = newX;
						relayoutUpdateArgs["updatemenus["+indexAggregation+"].x"] = newXRight;

					}
					else{
						relayoutUpdateArgs["updatemenus["+indexFrequencies+"].x"] = newXRight;
					}

				}

				if(settings.allowSelectorOptions){
					newX =xOfRightItems(divWidth, layout);
					relayoutUpdateArgs["xaxis.rangeselector.x"] = newX;
				}

				//DEBUG && OTHER_DEBUGS && console.log('relayoutUpdateArgs after new index', relayoutUpdateArgs);

				// get ticktext and tickvals based on width and parameters
				ticktextAndTickvals = aoPlotlyAddOn.getTicktextAndTickvals(
					initialDate,
					endDate,
					textAndSpaceToTextRatio,
					currentFrequency,
					xaxisFontFamily,
					xaxisFontSize,
					divWidth,
					layoutMarginL,
					layoutMarginR,
					canvas
				);

				// set layout ticktext and tickvals
				relayoutUpdateArgs["xaxis.tickvals"] = ticktextAndTickvals.tickvals;
				relayoutUpdateArgs["xaxis.ticktext"] = ticktextAndTickvals.ticktext;

				//DEBUG && OTHER_DEBUGS && console.log('relayoutUpdateArgs in case 1, autosize', relayoutUpdateArgs);

				Plotly.relayout(myPlot, relayoutUpdateArgs);
				//.then(() => { isUnderRelayout = false })
			}
		} 




		// CASE 2. EN ESTE ELSE SE INCLUYE EL CAMBIO DE FREQUENCY Y AJUSTAR EL DISPLAY DE TAGS DEL EJE X - 
		// FALTARÏA REVISAR Initial date end date	

		else if (typeof relayoutData.myFrequency !== "undefined") {

			flag = false;
			//DEBUG && OTHER_DEBUGS && console.log("current Frequency",currentFrequency);
			//DEBUG && OTHER_DEBUGS && console.log("base Frequency", settings.series.baseFrequency);
			//DEBUG && OTHER_DEBUGS && console.log("current Aggregation", currentAggregation);
			//DEBUG && OTHER_DEBUGS && console.log("base Aggregation", settings.series.baseAggregation);
			//DEBUG && OTHER_DEBUGS && console.log("baseFrequencyType", settings.series.baseFrequencyType);
			//DEBUG && OTHER_DEBUGS && console.log("baseAggregationType",settings.series.baseAggregationType);
			//DEBUG && OTHER_DEBUGS && console.log("myFrequency", relayoutData.myFrequency);	

			if (relayoutData.myFrequency !== currentFrequency) {

				//DEBUG && OTHER_DEBUGS && console.log("change in frequency started");

				// caso 1. cargar data, no cambiar aggregation. 
				if(flag === false &&
					(currentFrequency === settings.series.baseFrequency &&
					settings.series.baseFrequencyType === "normal" &&
					relayoutData.myFrequency !== settings.series.baseFrequency &&
					currentAggregation === settings.series.baseAggregation &&
					settings.series.baseAggregationType === "normal") ||


					(currentFrequency !== settings.series.baseFrequency &&
					relayoutData.myFrequency !== settings.series.baseFrequency) 

					)

						{

					// load data
					//DEBUG && OTHER_DEBUGS && console.log("case 1 to load from calculated freqs");

					flag = true;

					//DEBUG && OTHER_DEBUGS && console.log("frequenciesDataCreated",frequenciesDataCreated);

					loadFrequencyAndAggregationIntoData(
						data,
						settings.period[relayoutData.myFrequency],
						currentAggregation
					);

				}

				// caso 2. set aggregation to close, load normal aggregation menu, make changes
				if(flag === false &&
					currentFrequency === settings.series.baseFrequency &&
					settings.series.baseFrequencyType === "normal" &&
					relayoutData.myFrequency !== settings.series.baseFrequency &&
					currentAggregation === settings.series.baseAggregation &&
					settings.series.baseAggregationType !== "normal"){

					//DEBUG && OTHER_DEBUGS && console.log("set aggregation to close, load normal aggregation menu");

					flag = true;

					//DEBUG && OTHER_DEBUGS && console.log(frequenciesDataCreated);

					currentAggregation = "close";

					loadFrequencyAndAggregationIntoData(
						data,
						settings.period[relayoutData.myFrequency],
						currentAggregation
					);

					// change aggregation menu to normal
					index = findIndexOfMenu(layout.updatemenus,"aggregation");
					layout.updatemenus[index].buttons =settings.baseAggregationButtons;
					layout.updatemenus[index].showactive =true;

					// set base aggregation menu
					layout.updatemenus[index].active = 
							getMethodLocationInButtonsFromArg(
								currentAggregation,
								layout.updatemenus[index].buttons
							);

				}

				// caso 3.  change aggregation button from one to list
				if(flag === false &&
					currentFrequency === settings.series.baseFrequency &&
					settings.series.baseFrequencyType !== "normal" &&
					relayoutData.myFrequency !== settings.series.baseFrequency &&
					settings.series.baseAggregationType === "normal") {

					//DEBUG && OTHER_DEBUGS && console.log("change frequency. case 3");
					flag = true;


					loadFrequencyAndAggregationIntoData(
						data,
						settings.period[relayoutData.myFrequency],
						currentAggregation
					);


					// set original aggregation menu
					index = findIndexOfMenu(layout.updatemenus,"aggregation");
					layout.updatemenus[index].buttons = settings.baseAggregationButtons;

					layout.updatemenus[index].active = 
							getMethodLocationInButtonsFromArg(
								currentAggregation,
								layout.updatemenus[index].buttons
							);

					layout.updatemenus[index].visible = true;
					layout.updatemenus[index].type = "dropdown";
					layout.updatemenus[index].showactive = true;
				}				


				// caso 4. change agg menu to base, change aggregation to close
				if(flag === false &&
					currentFrequency === settings.series.baseFrequency &&
					settings.series.baseFrequencyType !== "normal" &&
					relayoutData.myFrequency !== settings.series.baseFrequency &&
					settings.series.baseAggregationType !== "normal") {

					//DEBUG && OTHER_DEBUGS && console.log("change frequency. case 4");

					flag = true;

					currentAggregation = "close";

					// set original aggregation menu
					index = findIndexOfMenu(layout.updatemenus,"aggregation");

					layout.updatemenus[index].buttons = settings.baseAggregationButtons;
					layout.updatemenus[index].showactive =true;

					layout.updatemenus[index].active = 
							getMethodLocationInButtonsFromArg(
								currentAggregation,
								layout.updatemenus[index].buttons
							);

					layout.updatemenus[index].visible = true;
					layout.updatemenus[index].type = "dropdown";

					//update layout coordinates in case aggregation menu was hidden
					if(settings.series.baseAggregationType === "not available"){

						newX = xOfFirstFrequencyMenuItem(
							divWidth,
							layout,
							settings.widthOfRightItemsFrequencyButtons
							);
						//DEBUG && OTHER_DEBUGS && console.log("new x freq", newX);
						index = findIndexOfMenu(layout.updatemenus,"frequencies");
						//DEBUG && OTHER_DEBUGS && console.log("index of freq menu", index);
						layout.updatemenus[index].x = newX;


						index = findIndexOfMenu(layout.updatemenus,"aggregation" );
						layout.updatemenus[index].x = xOfRightItems(divWidth, layout);

					}


					loadFrequencyAndAggregationIntoData(
						data,
						settings.period[relayoutData.myFrequency],
						currentAggregation
					);

				}


				// case 5. 
				if(flag ===false &&
					currentFrequency !== settings.series.baseFrequency &&
					relayoutData.myFrequency === settings.series.baseFrequency &&
					settings.series.baseFrequencyType !== "normal" &&
					settings.series.baseAggregationType === "not available") {

					//DEBUG && OTHER_DEBUGS && console.log("change frequency. case 5");

					flag = true;

					currentAggregation = settings.series.baseAggregation;

					// hide aggregation menu
					index = findIndexOfMenu(layout.updatemenus,"aggregation");

					layout.updatemenus[index].visible = false;

					// change location of frequency menu
					setNewXToFrequencyButton(
						xOfRightItems(divWidth, layout), layout.updatemenus, "frequencies");

					// load original data
					loadDataIntoXYFromPropertyXY(data, "xOriginal", "yOriginal");

					// change log linear to original
					changeLogLinearToOriginal(layout, originalLayout, divInfo, settings);

					// change compare to original
					if(transformToBaseIndex !== settings.transformToBaseIndex){
						//DEBUG && OTHER_DEBUGS && console.log("restore compare");
						transformToBaseIndex = settings.transformToBaseIndex;
						if(settings.allowCompare){
							toggleCompareButton(transformToBaseIndex, 
									    divInfo.compareButtonElement
							);
						}
					}

					layout.yaxis.hoverformat= originalLayout.yaxis.hoverformat;

					if(typeof layout.yaxis.tickformat !== "undefined" &&
					   typeof originalLayout.yaxis.tickformat === "undefined"){
						delete layout.yaxis.tickformat;
					}
					else if (typeof originalLayout.yaxis.tickformat !== "undefined"){
						layout.yaxis.tickformat = originalLayout.yaxis.tickformat;
					}


				}

				// case 6. 
				if(flag === false &&
					currentFrequency !== settings.series.baseFrequency &&
					relayoutData.myFrequency === settings.series.baseFrequency &&
					settings.series.baseFrequencyType !== "normal" &&
					settings.series.baseAggregationType !== "not available") {

					//DEBUG && OTHER_DEBUGS && console.log("change frequency. case 6");

					flag = true;	

					currentAggregation = settings.series.baseAggregation;
					//DEBUG && OTHER_DEBUGS && console.log("new currentAggregation", currentAggregation);

					// load one button aggregation menu
					index = findIndexOfMenu(layout.updatemenus,"aggregation");

					//DEBUG && OTHER_DEBUGS && console.log("index of agg menu",index);

					layout.updatemenus[index].buttons = settings.singleAggregationButton;
					layout.updatemenus[index].active = 0;
					layout.updatemenus[index].visible = true;	
					layout.updatemenus[index].type = "buttons";
					layout.updatemenus[index].showactive = false;

					//DEBUG && OTHER_DEBUGS && console.log("updatemenus",layout.updatemenus);

					// load original data
					loadDataIntoXYFromPropertyXY(data, "xOriginal", "yOriginal");
					
					// change log linear to original
					changeLogLinearToOriginal(layout, originalLayout, divInfo, settings);
					//DEBUG && OTHER_DEBUGS && console.log("6 after change log lin");

					// change compare to original
					if(transformToBaseIndex !== settings.transformToBaseIndex){
						//DEBUG && OTHER_DEBUGS && console.log("restore compare");
						transformToBaseIndex = settings.transformToBaseIndex;
						if(settings.allowCompare){
							toggleCompareButton(transformToBaseIndex, 
									    divInfo.compareButtonElement
							);
						}
					}

					layout.yaxis.hoverformat= originalLayout.yaxis.hoverformat;

					if(typeof layout.yaxis.tickformat !== "undefined" &&
					   typeof originalLayout.yaxis.tickformat === "undefined"){
						delete layout.yaxis.tickformat;
					}
					else if (typeof originalLayout.yaxis.tickformat !== "undefined"){
						layout.yaxis.tickformat = originalLayout.yaxis.tickformat;
					}

					//DEBUG && OTHER_DEBUGS && console.log("6 after change compare to original");

				}



				// case 7
				//DEBUG && OTHER_DEBUGS && console.log("flag before 7", flag);
				if(
					(	flag === false &&
					currentFrequency !== settings.series.baseFrequency &&
					 relayoutData.myFrequency === settings.series.baseFrequency &&
					 settings.series.baseFrequencyType === "normal" &&
					currentAggregation === settings.series.baseAggregation )

				){

					// load original data
					//DEBUG && OTHER_DEBUGS && console.log("change frequency. case 7");

					flag = true;	

					// load original data
					loadDataIntoXYFromPropertyXY(data, "xOriginal", "yOriginal");		

					// case 7.1 baseAggregationType = "normal"

					// case 7.2 base AggregationType = ! normal
					if(settings.series.baseAggregationType!== "normal"){
						//DEBUG && OTHER_DEBUGS && console.log("case 7.2");

						//make aggregation = base
						currentAggregation = settings.series.baseAggregation;

						// change log linear to original
						changeLogLinearToOriginal(layout, originalLayout, divInfo, settings);

						// change compare to original
						if(transformToBaseIndex !== settings.transformToBaseIndex){
							//DEBUG && OTHER_DEBUGS && console.log("restore compare");
							transformToBaseIndex = settings.transformToBaseIndex;
							if(settings.allowCompare){
								toggleCompareButton(transformToBaseIndex, 
										    divInfo.compareButtonElement);
							}
						}




						// WHAT ELSE ON AGGREGATION???


						if(settings.series.baseAggregationType === "not available"){
							// case 7.2.a
							//DEBUG && OTHER_DEBUGS && console.log("case 7.2.a");

							// remove aggregation button
							index = findIndexOfMenu(layout.updatemenus,"aggregation");

							layout.updatemenus[index].visible = false;

							// change location of frequency menu
							setNewXToFrequencyButton(
								xOfRightItems(divWidth, layout), 
								layout.updatemenus, 
								"frequencies"
							);
						}	

						if(settings.series.baseAggregationType ==="custom"){
							// case 7.2b
							//DEBUG && OTHER_DEBUGS && console.log("case 7.2.b");

							// load one button aggregation menu
							index = findIndexOfMenu(layout.updatemenus,"aggregation");
							layout.updatemenus[index].active =0;
							layout.updatemenus[index].visible = true;
							layout.updatemenus[index].buttons =settings.singleAggregationButton;
							layout.updatemenus[index].type = "buttons";
							layout.updatemenus[index].showactive = false;

						}

					}

				}



				// case 8  
				if( flag === false &&

					(currentFrequency !== settings.series.baseFrequency &&
					 relayoutData.myFrequency === settings.series.baseFrequency &&
					 settings.series.baseFrequencyType === "normal" &&
					currentAggregation !== settings.series.baseAggregation)	

				){

					//DEBUG && OTHER_DEBUGS && console.log("change frequency. case 8");

					flag = true;	

					//DEBUG && OTHER_DEBUGS && console.log("frequenciesDataCreated",frequenciesDataCreated);


					loadFrequencyAndAggregationIntoData(
						data,
						settings.period[relayoutData.myFrequency],
						currentAggregation
					);

					// handle buttons
					if(settings.series.baseAggregationType === "custom"){
						// load full aggregation menu
						//DEBUG && OTHER_DEBUGS && console.log("load full agg menu");

						index = findIndexOfMenu(layout.updatemenus,"aggregation");
						/*DEBUG && OTHER_DEBUGS && console.log("combinedAgg Bttons", 
									settings.combinedAggregationButtons);*/
						layout.updatemenus[index].buttons =settings.combinedAggregationButtons;
						layout.updatemenus[index].showactive =true;

						// set base aggregation menu
						layout.updatemenus[index].active = 
								getMethodLocationInButtonsFromArg(
									currentAggregation,
									layout.updatemenus[index].buttons
								);

					}

					// if base aggregation is not normal, display combined menu
					if( settings.series.baseAggregationType !== "normal"){
						// load base aggregation menu
						//DEBUG && OTHER_DEBUGS && console.log("load combined agg menu");

						index = findIndexOfMenu(layout.updatemenus,"aggregation");
						layout.updatemenus[index].buttons =settings.combinedAggregationButtons;
						layout.updatemenus[index].showactive =true;

						// set combined aggregation menu
						layout.updatemenus[index].active = 
										getMethodLocationInButtonsFromArg(
										currentAggregation,
										layout.updatemenus[index].buttons
									);

					}


				}


				// caso 9. cargar data, change to baseAggregationButtons. 
				if( flag === false &&

					(currentFrequency === settings.series.baseFrequency &&
					settings.series.baseFrequencyType === "normal" &&
					relayoutData.myFrequency !== settings.series.baseFrequency &&
					currentAggregation !== settings.series.baseAggregation)	
					)

						{

					//	load data	
					//DEBUG && OTHER_DEBUGS && console.log("case 9 to load from calculated freqs && baseAGGButtons");

					flag = true;

					//DEBUG && OTHER_DEBUGS && console.log("frequenciesDataCreated",frequenciesDataCreated);

					loadFrequencyAndAggregationIntoData(
						data,
						settings.period[relayoutData.myFrequency],
						currentAggregation
					);


					// load base aggregation menu
					//DEBUG && OTHER_DEBUGS && console.log("load base agg menu");

					index = findIndexOfMenu(layout.updatemenus,"aggregation");
					layout.updatemenus[index].buttons =settings.baseAggregationButtons;
					layout.updatemenus[index].showactive =true;

					// set base aggregation menu
					layout.updatemenus[index].active = 
									getMethodLocationInButtonsFromArg(
									currentAggregation,
									layout.updatemenus[index].buttons
								);


				}



				if(flag){				
					//OJO, CHANGE TICKS AND MINIMUM FREQUENCY DISPLAY
					currentFrequency = relayoutData.myFrequency;

					uncomparedSaved = false;

					// X RANGE DETERMINATIONS

					// this section finds the x domain for the traces
					minMaxDatesAsString = getDataXminXmaxAsString(data);
					minDateAsString = minMaxDatesAsString.min;
					maxDateAsString = minMaxDatesAsString.max;

					//DEBUG && OTHER_DEBUGS && console.log("minDateAsString", minDateAsString);
					//DEBUG && OTHER_DEBUGS && console.log("maxDateAsString", maxDateAsString);
					//DEBUG && OTHER_DEBUGS && console.log("initialDate", initialDate, "endDate", endDate);
					//DEBUG && OTHER_DEBUGS && console.log("layout", layout);

					updateXAxisRange(initialDate, 
							 endDate, 
							 minDateAsString, 
							 maxDateAsString, 
							 layout.xaxis.range);

					/*if(initialDate < minDateAsString){
						initialDate = minDateAsString
						layout.xaxis.range[0]= initialDate;
					}
					if(endDate > maxDateAsString){
						endDate = maxDateAsString;
						layout.xaxis.range[1]=	endDate;
					}*/

					// get ticktext and tickvals based on width and parameters
					ticktextAndTickvals = aoPlotlyAddOn.getTicktextAndTickvals(
						initialDate, endDate, textAndSpaceToTextRatio, currentFrequency, 
						xaxisFontFamily, xaxisFontSize, 
						divWidth, layoutMarginL, layoutMarginR, canvas
					);

					// set layout ticktext and tickvals
					layout.xaxis.tickvals = ticktextAndTickvals.tickvals;
					layout.xaxis.ticktext = ticktextAndTickvals.ticktext;	

					saveDataXYIntoProperty(data, "nominal");
					nominalSaved = true;	

					if(transformToReal){

						newBaseRealNominalDate = setBaseRealNominalDateAsString(
										settings.baseRealDate, 
										layout.xaxis.range[0],
										layout.xaxis.range[1],
										minDateAsString,
										maxDateAsString);
						
						if(newBaseRealNominalDate !== baseRealNominalDate){

							baseRealNominalDate =newBaseRealNominalDate;
							setDeflactorDictionaryAtDate(baseRealNominalDate, 
										     deflactorDictionary, 
										     data[iDeflactor], 0);

						}


						transformDataToReal(data, deflactorDictionary, 	
								    baseRealNominalDate, 
								    otherDataProperties);
					}

					if (transformToBaseIndex) {
					// recalculate data to base index and save uncompared data
						if(baseIndexDate < initialDate){
							baseIndexDate = initialDate;
						}
						uncomparedSaved = prepareTransformToBaseIndex(
							uncomparedSaved,
							data,
							baseIndexDate,
							settings.allowCompare,
							layout,
							currentAggregation
						);
					}



					//DEBUG && OTHER_DEBUGS && console.log("yaxis layout befor set",layout.yaxis);
					setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, 
						      settings.possibleYTickMultiples, 
						      settings.rangeProportion);
					//DEBUG && OTHER_DEBUGS && console.log("yaxis layout after set", layout.yaxis);

					settings.updatemenus = layout.updatemenus;
					Plotly.relayout(myPlot, {"updatemenus": [{}]});
					layout.updatemenus = settings.updatemenus;
					Plotly.redraw(myPlot);
				}
			}
		} 





		else if (typeof relayoutData.myAggregation !== "undefined") {
			// CASE 3. EN ESTE ELSE IF SE INCLUYE EL CAMBIO AGGREGATION - 
			// faltaría revisar fijación del xaxis range

			flag = false;
			//DEBUG && OTHER_DEBUGS && console.log("current Frequency",currentFrequency);
			//DEBUG && OTHER_DEBUGS && console.log("base Frequency", settings.series.baseFrequency);
			//DEBUG && OTHER_DEBUGS && console.log("current Aggregation", currentAggregation);
			//DEBUG && OTHER_DEBUGS && console.log("base Aggregation", settings.series.baseAggregation);
			//DEBUG && OTHER_DEBUGS && console.log("baseFrequencyType", settings.series.baseFrequencyType);
			//DEBUG && OTHER_DEBUGS && console.log("baseAggregationType",settings.series.baseAggregationType);
			//DEBUG && OTHER_DEBUGS && console.log("myAggregation", relayoutData.myAggregation);
			if (relayoutData.myAggregation !== currentAggregation) {
				//DEBUG && OTHER_DEBUGS && console.log("change in aggregation started");

				// Case 1. case to read from original data
				if(
					currentFrequency === settings.series.baseFrequency &&
					settings.series.baseFrequencyType === "normal" &&
					relayoutData.myAggregation === settings.series.baseAggregation ){

					//DEBUG && OTHER_DEBUGS && console.log("case 1. to read from original data");

					flag = true;



					// read from original data
					loadDataIntoXYFromPropertyXY(data, "xOriginal", "yOriginal");

					//DEBUG && OTHER_DEBUGS && console.log("data[0]", data[0]);

					// change log linear to original

					// change compare to original

				}


				// case 2. to load frequency aggregation from calculated values
				if(
					(currentFrequency === settings.series.baseFrequency &&
					settings.series.baseFrequencyType === "normal" &&
					relayoutData.myAggregation !== settings.series.baseAggregation) ||

					(currentFrequency !== settings.series.baseFrequency &&
					relayoutData.myAggregation !== settings.series.baseAggregation)	||

					(currentFrequency !== settings.series.baseFrequency &&
					relayoutData.myAggregation === settings.series.baseAggregation &&
					settings.series.baseAggregationType === "normal")

					){

					//DEBUG && OTHER_DEBUGS && console.log("case 2. to load from calculated freqs");

					flag = true;

					//DEBUG && OTHER_DEBUGS && console.log(frequenciesDataCreated);


					//DEBUG && OTHER_DEBUGS && console.log("data[0]",   data[0]);

					//return;
					// load frequency and aggregation into data
					loadFrequencyAndAggregationIntoData(
						data,
						settings.period[currentFrequency],
						relayoutData.myAggregation
					);

					//DEBUG && OTHER_DEBUGS && console.log("data[0].x",data[0].x);
					//DEBUG && OTHER_DEBUGS && console.log("data[1].y",data[1].y);

				}

				if(flag){


					uncomparedSaved = false;
					layout.yaxis.hoverformat = originalLayout.yaxis.hoverformat;

					if(typeof layout.yaxis.tickformat !== "undefined" &&
					   typeof originalLayout.yaxis.tickformat === "undefined"){
						delete layout.yaxis.tickformat;
					}
					else if (typeof originalLayout.yaxis.tickformat !== "undefined"){
						layout.yaxis.tickformat = originalLayout.yaxis.tickformat;
					}

					saveDataXYIntoProperty(data, "nominal");
					nominalSaved = true;

					if(transformToReal){

						newBaseRealNominalDate = setBaseRealNominalDateAsString(settings.baseRealDate, 
										layout.xaxis.range[0],
										layout.xaxis.range[1],
										minDateAsString,
										maxDateAsString
										);
						if(newBaseRealNominalDate !== baseRealNominalDate){

							baseRealNominalDate =newBaseRealNominalDate;
							setDeflactorDictionaryAtDate(baseRealNominalDate,
										     deflactorDictionary, 
										     data[iDeflactor], 0);

						}

						transformDataToReal(data, deflactorDictionary, 	baseRealNominalDate, 
								    otherDataProperties);
					}



					// uncompare in case aggregatin is percChange or sqrPercChange
					if(relayoutData.myAggregation === "percChange" || 
					   relayoutData.myAggregation === "sqrPercChange"){
						transformToBaseIndex = false;
						if(settings.allowCompare){
							toggleCompareButton(transformToBaseIndex, 
									    divInfo.compareButtonElement);
						}

						layout.yaxis.tickformat = ".2p";
						layout.yaxis.hoverformat = ".3p";
					}


					// restore original compare
					if(
						 (currentAggregation === "percChange" || 
						 currentAggregation === "sqrPercChange") &&

						(relayoutData.myAggregation !== "percChange" &&
						 relayoutData.myAggregation !== "sqrPercChange")

						)

						{


						if(transformToBaseIndex !== settings.transformToBaseIndex){
							//DEBUG && OTHER_DEBUGS && console.log("restore compare");
							transformToBaseIndex = settings.transformToBaseIndex;
							if(settings.allowCompare){
								toggleCompareButton(transformToBaseIndex,
										    divInfo.compareButtonElement);
							}
						}				

					}





					// make yaxis.type linear
					if(relayoutData.myAggregation === "percChange" ||
						 relayoutData.myAggregation === "sqrPercChange" ||
						 relayoutData.myAggregation === "change"){

						if (layout.yaxis.type === "log") {

							layout.yaxis.type = "linear";
							if(settings.allowLogLinear){
								toggleLogLinearButton(false, divInfo.logLinearButtonElement);
							}

						}

					}

					// restore original yaxis.type
					if((currentAggregation === "percChange" ||
						 currentAggregation === "sqrPercChange" ||
						 currentAggregation === "change") &&

						(relayoutData.myAggregation !== "percChange" &&
						 relayoutData.myAggregation !== "sqrPercChange" &&
						 relayoutData.myAggregation !== "change")

						){

						changeLogLinearToOriginal(layout, originalLayout, divInfo, settings);

					}				




					currentAggregation = relayoutData.myAggregation;

					// X RANGE DETERMINATIONS

					// this section finds the x range for the traces
					minMaxDatesAsString = getDataXminXmaxAsString(data);
					minDateAsString = minMaxDatesAsString.min;
					maxDateAsString = minMaxDatesAsString.max;

					//DEBUG && OTHER_DEBUGS && console.log("minDataAsString", minDateAsString);
					//DEBUG && OTHER_DEBUGS && console.log("maxDataAsString", maxDateAsString);
					//DEBUG && OTHER_DEBUGS && console.log("initialDate", initialDate, "endDate", endDate);

					/*if(initialDate < minDateAsString){
						initialDate = minDateAsString
						layout.xaxis.range[0]= initialDate;
					}
					if(endDate > maxDateAsString){
						endDate = maxDateAsString;
						layout.xaxis.range[1]=	endDate;
					}*/

					updateXAxisRange(initialDate, 
							 endDate, 
							 minDateAsString, 
							 maxDateAsString, 
							 layout.xaxis.range);


					// get ticktext and tickvals based on width and parameters
					ticktextAndTickvals = aoPlotlyAddOn.getTicktextAndTickvals(
						initialDate, endDate, textAndSpaceToTextRatio, currentFrequency, 
						xaxisFontFamily, xaxisFontSize, 
						divWidth, layoutMarginL, layoutMarginR, canvas
					);

					// set layout ticktext and tickvals
					layout.xaxis.tickvals = ticktextAndTickvals.tickvals;
					layout.xaxis.ticktext = ticktextAndTickvals.ticktext;


					if (transformToBaseIndex) {
						if(baseIndexDate < initialDate){
							baseIndexDate = initialDate;
						}
					// recalculate data to base index and save uncompared data
						uncomparedSaved = prepareTransformToBaseIndex(
							uncomparedSaved,
							data,
							baseIndexDate,
							settings.allowCompare,
							layout,
							currentAggregation
						);
					}
					//DEBUG && OTHER_DEBUGS && console.log("yaxis layout befor set",layout.yaxis);
					setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, 
						      settings.possibleYTickMultiples, settings.rangeProportion);
					//DEBUG && OTHER_DEBUGS && console.log("yaxis layout after set", layout.yaxis);


					settings.updatemenus = layout.updatemenus;
					Plotly.relayout(myPlot, {"updatemenus": [{}]});
					layout.updatemenus = settings.updatemenus;
					Plotly.redraw(myPlot);

				}	
			}	
		} 

		// CASE 4. EN ESTE ELSE IF HAY QUE INCLUIR EL CAMBIO DE EJES LOG LINEAR - PENDIENTE. DE MOMENTO NO SE USA
		else if (typeof relayoutData.changeYaxisTypeToLog !== "undefined") {

			//DEBUG && OTHER_DEBUGS && console.log("change of y axis type requested");

			if (relayoutData.changeYaxisTypeToLog === false) {
				divInfo.logLinearButtonElement.blur();
				if (layout.yaxis.type === "log") {
					if (!isUnderRelayout) {
						layout.yaxis.type = "linear";
						//DEBUG && OTHER_DEBUGS && console.log("change y axis to linear");
						toggleLogLinearButton(false, divInfo.logLinearButtonElement);

						layout.yaxis.type = "linear";
						setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis,
							      settings.possibleYTickMultiples, settings.rangeProportion);
						Plotly.redraw(myPlot).then(() => {
							isUnderRelayout = false;
						});
					}
					isUnderRelayout = true;
				}
			}

			if (relayoutData.changeYaxisTypeToLog === true) {
				divInfo.logLinearButtonElement.blur();
				//DEBUG && OTHER_DEBUGS && console.log("yaxistype", layout.yaxis.type);
				//DEBUG && OTHER_DEBUGS && console.log("currentAggregation",currentAggregation);
				//DEBUG && OTHER_DEBUGS && console.log("yaxis range",layout.yaxis.range);
				if (layout.yaxis.type === "linear" &&
					 (currentAggregation !== "percChange" &&
						 currentAggregation !== "sqrPercChange" &&
						 currentAggregation !== "change") /*&& 
						layout.yaxis.range[0]>0 &&
						layout.yaxis.range[1]>0*/
					 ) {
					if (!isUnderRelayout) {
						//DEBUG && OTHER_DEBUGS && console.log("change y axis to log");
						layout.yaxis.type = "log";
						toggleLogLinearButton(true, divInfo.logLinearButtonElement);
						setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, 
							      settings.possibleYTickMultiples, settings.rangeProportion);
						Plotly.redraw(myPlot).then(() => {
							isUnderRelayout = false;
						});
					}
					isUnderRelayout = true;
				}
			}
		} 


		// CASE 5. EN ESTE ELSE IF SE INCLUYE EL CAMBIO DE COMPARE UNCOMPARE
		else if (typeof relayoutData.compare !== "undefined") {

			//DEBUG && OTHER_DEBUGS && console.log("compare/uncompare button clicked");
			//DEBUG && OTHER_DEBUGS && console.log("relayoutData.compare = ", relayoutData.compare);
			//DEBUG && OTHER_DEBUGS && console.log("transformToBaseIndex =", transformToBaseIndex);
			divInfo.compareButtonElement.blur();
			if (relayoutData.compare !== transformToBaseIndex &&
					currentAggregation !== "percChange" &&
					currentAggregation !== "sqrPercChange") {
				if (!isUnderRelayout) {
					//DEBUG && OTHER_DEBUGS && console.log("rutina compare/uncompare in");

					//toggle transformToBaseIndes
					transformToBaseIndex = !transformToBaseIndex;

					// update menu settings
					//toggleCompareMenu(!relayoutData.compare, layout.updatemenus);
					toggleCompareButton(relayoutData.compare, divInfo.compareButtonElement);

					// transform data to base index
					if (transformToBaseIndex) {
						//DEBUG && OTHER_DEBUGS && console.log("uncomparedSaved", uncomparedSaved);

						// save nominal data
						if(!nominalSaved && !transformToReal){
							saveDataXYIntoProperty(data, "nominal");
							nominalSaved = true;
						}

						// update baseIndex Date
						//DEBUG && OTHER_DEBUGS && console.log('layout.xaxis.range[0]', layout.xaxis.range[0]);
						baseIndexDate = makeDateComplete(layout.xaxis.range[0]);
						//DEBUG && OTHER_DEBUGS && console.log('transformed to YMD as base Index date', baseIndexDate);

						// transform yvalues to index at specified date
						uncomparedSaved = prepareTransformToBaseIndex(
							uncomparedSaved,
							data,
							baseIndexDate,
							settings.allowCompare,
							layout,
							currentAggregation
						);

						//DEBUG && OTHER_DEBUGS && console.log('data transformed for comparison', data)

						if (!layout.yaxis.autorange) {
							// find y range
							setYAxisRange(layout, 
								      data, 
								      settings.numberOfIntervalsInYAxis, 
								      settings.possibleYTickMultiples, 
								      settings.rangeProportion);
						}
					} 

					// uncompare, transform uncompared data (check frequencies);
					else {

						loadData(data, "uncompared");
						//DEBUG && OTHER_DEBUGS && console.log("new data",data);

						if (!layout.yaxis.autorange) {
							setYAxisRange(layout, 
								      data, 
								      settings.numberOfIntervalsInYAxis,
								      settings.possibleYTickMultiples, 
								      settings.rangeProportion);
						}
					}

					Plotly.redraw(myPlot).then(() => {
						isUnderRelayout = false;
					});
				}
				isUnderRelayout = true;
			}
		} 




		// CASE 6. EN ESTE ELSE IF SE INCLUYE EL CAMBIO DE NOMINAL REAL
		else if (typeof relayoutData.transformToReal!== "undefined") {

			DEBUG && OTHER_DEBUGS && console.log("real/nominal button clicked");
			//DEBUG && OTHER_DEBUGS && console.log("relayoutData.compare = ", relayoutData.compare);
			//DEBUG && OTHER_DEBUGS && console.log("transformToBaseIndex =", transformToBaseIndex);
			divInfo.realNominalButtonElement.blur();

			if (relayoutData.transformToReal !== transformToReal) {
				if (!isUnderRelayout) {
					//DEBUG && OTHER_DEBUGS && console.log("rutina real/nominal in");

					//toggle transformRealNominal
					transformToReal = !transformToReal;

					// update menu settings
					//toggleCompareMenu(!relayoutData.compare, layout.updatemenus);
					toggleRealNominalButton(relayoutData.transformToReal, 
								divInfo.realNominalButtonElement);

					// transform data to real
					if (transformToReal) {

						DEBUG && OTHER_DEBUGS && console.log("transform To Real");


						// determine base date
						/* could be "end of range", "end of domain", "beggining of range", 
						beggining of domain", 
						or a date "yyyy-mm-dd hh:mm:ss.sss-04:00"*/
						DEBUG && OTHER_DEBUGS && console.log("baseRealNominalDate",baseRealNominalDate);

						if(baseRealNominalDate === ""){
							baseRealNominalDate = 
								setBaseRealNominalDateAsString(	
									settings.baseRealDate, 
									layout.xaxis.range[0],
									layout.xaxis.range[1],
									minDateAsString,
									maxDateAsString
								);

							DEBUG && OTHER_DEBUGS && console.log("baseRealNominalDate",baseRealNominalDate);
							setDeflactorDictionaryAtDate(baseRealNominalDate, 
										     deflactorDictionary, 
										     data[iDeflactor], 
										     0);
						}

						// save nominal if not compared
						if(!transformToBaseIndex){

							// save nominal  data
							if(!nominalSaved){
								saveDataXYIntoProperty(data, "nominal");
								nominalSaved = true;
							}

						}

						if(transformToBaseIndex){
							loadData(data, "nominal");
						}

						//recalculate data to real 
						transformDataToReal(data, deflactorDictionary, 	baseRealNominalDate, 
								    otherDataProperties);

						if (transformToBaseIndex) {

							// baseIndexDate = makeDateComplete(layout.xaxis.range[0]);

							// transform yvalues to index at specified date
							uncomparedSaved = false;
							uncomparedSaved = prepareTransformToBaseIndex(
								uncomparedSaved,
								data,
								baseIndexDate,
								settings.allowCompare,
								layout,
								currentAggregation
							);

						} 

						if (!layout.yaxis.autorange) {
							// find y range
							setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, 
								      settings.possibleYTickMultiples, settings.rangeProportion);
						}



					} 

					// transform to nominal				
					else {
						//DEBUG && OTHER_DEBUGS && console.log("transform to nominal");

						loadData(data, "nominal");


						if (transformToBaseIndex) {

							// baseIndexDate = makeDateComplete(layout.xaxis.range[0]);

							// transform yvalues to index at specified date
							uncomparedSaved = false;
							uncomparedSaved = prepareTransformToBaseIndex(
								uncomparedSaved,
								data,
								baseIndexDate,
								settings.allowCompare,
								layout,
								currentAggregation
							);

						}


						if (!layout.yaxis.autorange) {
							setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, 
								      settings.possibleYTickMultiples, settings.rangeProportion);
						}

					}

					Plotly.redraw(myPlot).then(() => {
						isUnderRelayout = false;
					});
				}
				isUnderRelayout = true;
			}
		} 




		// CASE 7. EN ESTE ELSE IF SE INCLUYE EL DATA DOWNLOAD
		else if (typeof relayoutData.download !== "undefined") {

			divInfo.downloadButtonElement.blur();
			downloadCSVData(settings.xAxisNameOnCSV, data, settings.downloadedFileName);

		} 


		// CASE 8. Este caso pide mostrar todo el eje x. EN ESTE CASO EL RELAYOUT HAY QUE AJUSTAR EL EJE X, 
		// INCLUIR TAMBIEM EL CAMBIO DE X AXIS LABELS.
		else if (relayoutData["xaxis.autorange"] === true) {

			//DEBUG && OTHER_DEBUGS && console.log('xaxis.autorange=true');
			//DEBUG && OTHER_DEBUGS && console.log('layout on all clicked',layout);
			layout.xaxis.range[0] = makeDateComplete(layout.xaxis.range[0]);
			layout.xaxis.range[1] = makeDateComplete(layout.xaxis.range[1]);

			if(layout.xaxis.range[0] !== initialDate || 
				 layout.xaxis.range[1] !== endDate){
				if (!isUnderRelayout) {					
					initialDate = makeDateComplete(layout.xaxis.range[0]);
					endDate = makeDateComplete(layout.xaxis.range[1]);
					//layout.xaxis.autorange=false;


					//DEBUG && OTHER_DEBUGS && console.log("initial Date",initialDate);
					//DEBUG && OTHER_DEBUGS && console.log("endDate", endDate);
					// get ticktext and tickvals based on width and parameters
					ticktextAndTickvals = aoPlotlyAddOn.getTicktextAndTickvals(
						initialDate,
						endDate,
						textAndSpaceToTextRatio,
						currentFrequency,
						xaxisFontFamily,
						xaxisFontSize,
						divWidth,
						layoutMarginL,
						layoutMarginR,
						canvas
					);


					flag = false;
					if(transformToReal){

						loadData(data,"nominal");

						newBaseRealNominalDate = setBaseRealNominalDateAsString(
										settings.baseRealDate, 
										layout.xaxis.range[0],
										layout.xaxis.range[1],
										minDateAsString,
										maxDateAsString
										);
						//DEBUG && OTHER_DEBUGS && console.log("newBaseRealNominalDate",newBaseRealNominalDate);
						//DEBUG && OTHER_DEBUGS && console.log("baseRealNominalDate",baseRealNominalDate);
						if(newBaseRealNominalDate !== baseRealNominalDate){
							baseRealNominalDate =newBaseRealNominalDate;
							setDeflactorDictionaryAtDate(baseRealNominalDate, 
										     deflactorDictionary, 
										     data[iDeflactor], 0);

						}
						//DEBUG && OTHER_DEBUGS && console.log("newBaseRealNominalDate",newBaseRealNominalDate);
						transformDataToReal(data, deflactorDictionary, 	baseRealNominalDate, 
								    otherDataProperties);

						if(transformToBaseIndex){
							flag = true;	
							saveDataXYIntoProperty(data,"uncompared");
						}

					}



					// transform to new base

					if (
						(transformToBaseIndex &&
						baseIndexDate !== makeDateComplete(layout.xaxis.range[0])) || flag
						) {


						//DEBUG && OTHER_DEBUGS && console.log("baseIndexDate", baseIndexDate);
						transformDataToBaseIndex(data, 
									 makeDateComplete(layout.xaxis.range[0]),
									 currentAggregation);
					}
					
					baseIndexDate = makeDateComplete(layout.xaxis.range[0]);


					//DEBUG && OTHER_DEBUGS && console.log("layout before read x axis range",layout);

					yMinMax = getYminYmax(makeDateComplete(layout.xaxis.range[0]), 
								makeDateComplete(layout.xaxis.range[1]), 
								data);
					yMinValue = yMinMax[0];
					yMaxValue = yMinMax[1];

					if(!isNaN(yMinValue) && !isNaN(yMaxValue)){
						layout.yaxis.autorange = false;
						layout.yaxis.range = returnYaxisLayoutRange(
							layout.yaxis.type === "log" ? "log" : "linear",
							yMinValue,
							yMaxValue,
							settings.numberOfIntervalsInYAxis,
							settings.possibleYTickMultiples, 
							settings.rangeProportion
						);
					} else{


					}




					// set layout ticktext and tickvals
					layout.xaxis.tickvals = ticktextAndTickvals.tickvals;
					layout.xaxis.ticktext = ticktextAndTickvals.ticktext;

					activeRangeSelector("step","all",layout.xaxis.rangeselector.buttons);
					//DEBUG && OTHER_DEBUGS && console.log("rangeselector", layout.xaxis.rangeselector);

					Plotly.redraw(myPlot).then(() => {
						//DEBUG && OTHER_DEBUGS && console.log("plot schema", Plotly.PlotSchema.get());
						isUnderRelayout = false;
					});
				}
				isUnderRelayout = true;
			}
		} 


		// CASE 9. OTHERS, CHANGES IN X RANGE DUE TO SELECTION
		else {
			flag = false;

			if (
				typeof relayoutData["xaxis.range[0]"] !== "undefined" ||
				typeof relayoutData["xaxis.range[1]"] !== "undefined"
			) {
				//DEBUG && OTHER_DEBUGS && console.log(layout);
				//DEBUG && OTHER_DEBUGS && console.log(layout.xaxis.range[1]);
				//DEBUG && OTHER_DEBUGS && console.log(typeof relayoutData['xaxis.range[0]']);
				//DEBUG && OTHER_DEBUGS && console.log(typeof relayoutData['xaxis.range[1]']);

				if (typeof relayoutData["xaxis.range[0]"] !== "undefined") {
					x0 = relayoutData["xaxis.range[0]"];
				} else {
					x0 = layout.xaxis.range[0];
				}

				if (typeof relayoutData["xaxis.range[1]"] !== "undefined") {
					x1 = relayoutData["xaxis.range[1]"];
				} else {
					x1 = layout.xaxis.range[1];
				}

				//DEBUG && OTHER_DEBUGS && console.log('x0:' + x0 + '-x1:' + x1);
				flag = true;
				//DEBUG && OTHER_DEBUGS && console.log(11);
			} else if (typeof relayoutData["xaxis.range"] !== "undefined") {
				//DEBUG && OTHER_DEBUGS && console.log(12);
				x0 = relayoutData["xaxis.range"][0];
				x1 = relayoutData["xaxis.range"][1];
				flag = true;
			}

			//  Changes to the X axis Range. Change x axis range display.
			if (flag === true) {
				if (!isUnderRelayout) {
					//DEBUG && OTHER_DEBUGS && console.log("x0 before process", x0);
					//DEBUG && OTHER_DEBUGS && console.log("x1 before process", x1);

					//x0 = makeDateComplete(x0);
					//x1 = makeDateComplete(x1);
					layout.xaxis.range[0]=x0;
					layout.xaxis.range[1]=x1;

					//DEBUG && OTHER_DEBUGS && console.log("x0 after complete date",x0);
					//DEBUG && OTHER_DEBUGS && console.log("x1 after",x1);


					flag = false;
					if(transformToReal){

						loadData(data,"nominal");

						newBaseRealNominalDate = setBaseRealNominalDateAsString(
									settings.baseRealDate,
									layout.xaxis.range[0],
									layout.xaxis.range[1],
									minDateAsString,
									maxDateAsString  );
						
						if(newBaseRealNominalDate !== baseRealNominalDate){
							baseRealNominalDate =newBaseRealNominalDate;
							setDeflactorDictionaryAtDate(baseRealNominalDate, 
										     deflactorDictionary, 
										     data[iDeflactor], 0);

						}
						//DEBUG && OTHER_DEBUGS && console.log("newBaseRealNominalDate",newBaseRealNominalDate);
						transformDataToReal(data, 
								    deflactorDictionary,
								    baseRealNominalDate,
								    otherDataProperties);

						if(transformToBaseIndex){
							flag = true;	
							saveDataXYIntoProperty(data,"uncompared");
						}

					}



					// transform to base index for new x0
					if ((transformToBaseIndex && baseIndexDate !== x0) || flag) {
						transformDataToBaseIndex(data, x0, currentAggregation);
					}

					baseIndexDate = x0;

					yMinMax = getYminYmax(x0, x1, data);
					yMinValue = yMinMax[0];
					yMaxValue = yMinMax[1];

					initialDate = x0;
					endDate = x1;

					// get new x axis ticks
					ticktextAndTickvals = aoPlotlyAddOn.getTicktextAndTickvals(
						initialDate,
						endDate,
						textAndSpaceToTextRatio,
						currentFrequency,
						xaxisFontFamily,
						xaxisFontSize,
						divWidth,
						layoutMarginL,
						layoutMarginR,
						canvas
					);

					//DEBUG && OTHER_DEBUGS && console.log('new y range',yMinValue, yMaxValue);
					if(!isNaN(yMinValue) && !isNaN(yMaxValue)){
						layout.yaxis.autorange = false;
						layout.yaxis.range = returnYaxisLayoutRange(
							layout.yaxis.type === "log" ? "log" : "linear",
							yMinValue,
							yMaxValue,
							settings.numberOfIntervalsInYAxis,
							settings.possibleYTickMultiples, 
							settings.rangeProportion
						);	
					} else{


					}


					layout.xaxis.tickvals = ticktextAndTickvals.tickvals;
					layout.xaxis.ticktext = ticktextAndTickvals.ticktext;
					//DEBUG && OTHER_DEBUGS && console.log('updated yaxis range',layout);

					//DEBUG && OTHER_DEBUGS && console.log(layout);
					Plotly.redraw(myPlot).then(() => {
						isUnderRelayout = false;
					});

				}
				isUnderRelayout = true;
			} // end of if flag is true
		} // end of 'else' relayout cases, CASE 9

	DEBUG && DEBUG_TIMES && console.timeEnd("TIME: relayout");
	}); // end of handling of relayout event


	//});
	//});			

	DEBUG && DEBUG_TIMES && console.timeEnd("TIME: makeChart");
	DEBUG && DEBUG_TIMES && console.timeEnd("TIME: newTimeseriesPlot");



}	    

   	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	    
	    
// measure length of displayed string  in pixels
function stringLength(string, fontFamily, size, canvas) {
  //var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  
  ctx.font = ''+size+'px '+fontFamily;
  
  return ctx.measureText(string).width;
}

 

// rounds number to next multiple
function roundUp(numToRound, multiple) {
    if (multiple === 0){
        return numToRound;
    }

    var remainder = numToRound % multiple;
  
    if (remainder === 0){
        return numToRound;
    } 
    else{
      return numToRound + multiple - remainder;
    }
}

// converts integer to string with traling 0 (for months, and days display)
function padTo2(number) {
    return number < 10 ? '0' + number : '' + number;
  }

aoPlotlyAddOn.padTo2 = padTo2;
        
// determine the ticktext and tickvals that best fit, given a target frequency display (annual, monthly, etc),
 //and a space between tick text
// the space between tick text (textAndSpaceToTextRatio) defined as
// the ration of  (tick text length + space to next tick) to (tick text length)
// from: initial date as string 'yyyy-mm-dd'
// targetFrequency, a string, like  'annual', 'monthly', etc. see below in code for options.
aoPlotlyAddOn.getTicktextAndTickvals = function (from, to, textAndSpaceToTextRatio, targetFrequency, fontFamily,
						  fontSize, divWidth, leftMargin, rightMargin, canvas){
  //var initialDate = new Date();  
  //var daysStep = 0, monthsStep =0;

  var strippedFrom = stripDateIntoObject(from);
  var strippedTo = stripDateIntoObject(to);
  
  //DEBUG && OTHER_DEBUGS && console.log('parsed from to', strippedFrom, strippedTo);
  
  //var fromAsDate = new Date(strippedFrom.year, strippedFrom.month-1, strippedFrom.day);
  var toAsDate = new Date(strippedTo.year, strippedTo.month-1, strippedTo.day);
	

  
  
var months = ['Jan', 'Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  var frequencyData = [
    {
      name: 'daily',
      initialDate: new Date(strippedFrom.year,strippedFrom.month-1,strippedFrom.day),
      monthsStep: 0,
      daysStep:1,
      string: '2000-04-30',
      stringName:'date'
    },
    {
      name: 'everyOtherDay',
      initialDate: new Date(strippedFrom.year,strippedFrom.month-1,strippedFrom.day),
      monthsStep: 0,
      daysStep:2,
      string: '2000-04-30',
      stringName:'date'
    },
    {
      name: 'weekly',
      initialDate: new Date(strippedFrom.year,strippedFrom.month-1,strippedFrom.day),
      monthsStep: 0,
      daysStep:7,
      string: '2000-04-30',
      stringName:'date'
    },   
    {
      name:'biweekly',
      initialDate: new Date(strippedFrom.year,strippedFrom.month-1,strippedFrom.day),
      monthsStep: 0,
      daysStep:14,
      string: '2000-04-30',
      stringName: 'date'
    },
    {
      name: 'monthly',
      initialDate: new Date(strippedFrom.year, strippedFrom.month, 0),
      monthsStep: 1,
      daysStep:0,
      string: targetFrequency==='monthly'?'Nov 2000': '2000-04',
      stringName:targetFrequency==='monthly'?'month':'year-month'
    }, 
    {
      name: 'quarterly',
      initialDate: (strippedFrom.month  < 4 || strippedFrom.month > 9) ?
	    		new Date(strippedFrom.year, -1 + 3 * Math.floor((strippedFrom.month)/3),31):
	    		new Date(strippedFrom.year, -1+3*Math.floor((strippedFrom.month)/3),30),
      monthsStep: 3,
      daysStep:0,
      string: (targetFrequency==='monthly')?'Nov 2000':((targetFrequency==='quarterly')?'Q4 2000':'2000-00'),
      stringName: (targetFrequency==='monthly')?'month':((targetFrequency==='quarterly')?'quarter':'year-month')
    },   
    {
      name:'semiannual',
      initialDate: (strippedFrom.month< 7)? new Date(strippedFrom.year,5,30):new Date(strippedFrom.year,11,31),
      monthsStep: 6,
      daysStep:0,
      string: (targetFrequency==='semiannual')?'H2 2000':((targetFrequency==='quarterly')?'Q4 2000':'2000-00'),
      stringName: (targetFrequency==='semiannual')?'semester':((targetFrequency==='quarterly')?'quarter':'year-month')
    },
    {
      name:'annual',
      initialDate: new Date(strippedFrom.year,11,31),
      monthsStep: 1*12,
      daysStep:0,
      string: targetFrequency==='semiannual'?'H2 2000': '2000',
      stringName: targetFrequency==='semiannual'?'semester':'year'
    },
    {
      name:'biennial',
      initialDate: new Date(strippedFrom.year,11,31),
      monthsStep: 2*12,
      daysStep:0,
      string: '2000',
      stringName: 'year'
    },
    {
      name:'quinquennial',
      initialDate: new Date(roundUp(strippedFrom.year,5),11,31),
      monthsStep: 5*12,
      daysStep: 0,
      string: '2000',
      stringName: 'year'
    },
    {
      name:'decennial',
      initialDate: new Date(roundUp(strippedFrom.year,10),11,31),
      monthsStep: 10*12,
      daysStep: 0,
      string: '2000',
      stringName: 'year'
    },
    {
      name:'quadranscentennial',
      initialDate: new Date(roundUp(strippedFrom.year,25),11,31),
      monthsStep: 25*12,
      daysStep: 0,
      string: '2000',
      stringName: 'year'
    },
    {
      name:'semicentennial',
      initialDate: new Date(roundUp(strippedFrom.year,50),11,31),
      monthsStep: 50*12,
      daysStep: 0,
      string: '2000',
      stringName: 'year'
    },  
    {
      name: 'centennial',
      initialDate: new Date(roundUp(strippedFrom.year,100),11,31),
      monthsStep: 100*12,
      daysStep: 0,
      string: '2000',
      stringName: 'year'
    },  
    {
      name: 'bicentennial',
      initialDate: new Date(roundUp(strippedFrom.year,100),11,31),
      monthsStep: 200*12,
      daysStep: 0,
      string: '2000',
      stringName: 'year'
    },
    {
      name: 'sestercentennial',
      initialDate: new Date(roundUp(strippedFrom.year,250),11,31),
      monthsStep: 250*12,
      daysStep: 0,
      string: '2000',
      stringName: 'year'
    },    
    {
      name: 'quincentenary',
      initialDate: new Date(roundUp(strippedFrom.year,500),11,31),
      monthsStep: 500*12,
      daysStep: 0,
      string: '2000',
      stringName: 'year'
    }, 
    {
      name: 'millenial',
      initialDate: new Date(roundUp(strippedFrom.year,1000),11,31),
      monthsStep: 1000*12,
      daysStep: 0,
      string: '2000',
      stringName: 'year'
    }                              
    ];
  
  
  // find position of target frequency
  var k = 'undefined';
  for(var i =0; i< frequencyData.length; i++){
    if(frequencyData[i].name === targetFrequency ){
      k=i;
      i= frequencyData.length;
    }
  }
  
 
  // targetFrequency not valid, assign minimum as default
  if(k==='undefined'){
    k=0;
    targetFrequency = frequencyData[k].name;
  }

  
  // loop through possible frequencies up to a feasible space ratio is finded.
  var date = new Date(), j=0;
  var result = {
    ticktext: [],
    tickvals: []
  };
  
  

  for (i=k; i< frequencyData.length; i++){
    j=0;
    date = new Date(frequencyData[i].initialDate.getTime());
    while(date <= toAsDate){
      j++;
      if (frequencyData[i].daysStep >0){
        date.setDate(date.getDate()+frequencyData[i].daysStep);
      }
      if (frequencyData[i].monthsStep >0){
        date= new Date(date.getFullYear(), date.getMonth()+frequencyData[i].monthsStep+1, 0);
      }
    }
    frequencyData[i].j=j;
    frequencyData[i].xSpace = 
	    j === 0 ?
	    	0 :
    		(divWidth-leftMargin-rightMargin) /(j*stringLength(frequencyData[i].string,
								   fontFamily,
								   fontSize, 
								   canvas));    
    if(frequencyData[i].xSpace >= textAndSpaceToTextRatio){
	    date = new Date(frequencyData[i].initialDate.getTime());
	    //DEBUG && OTHER_DEBUGS && console.log('solution found at', frequencyData[i]);
	    //DEBUG && OTHER_DEBUGS && console.log('initial Date',frequencyData[i].initialDate);
	    
	    while(date <= toAsDate){
		    result.tickvals.push(''+date.getFullYear()+'-'+padTo2(date.getMonth()+1)+'-'+padTo2(date.getDate()));
		    if(frequencyData[i].stringName === "date"){
			    result.ticktext.push(''+date.getFullYear()+
						 '-' + padTo2(date.getMonth()+1) + 
						 '-' + padTo2(date.getDate()));
		    } else if (frequencyData[i].stringName === "month"){
			    result.ticktext.push(months[date.getMonth()]+' '+date.getFullYear());
		    } else if (frequencyData[i].stringName === "quarter"){
			    result.ticktext.push('Q' +Math.ceil((date.getMonth()+1)/3)+' '+date.getFullYear());
		    } else if (frequencyData[i].stringName === "semester"){
			    result.ticktext.push('H'+Math.ceil((date.getMonth()+1)/6)+' '+date.getFullYear());
		    } else if (frequencyData[i].stringName === "year"){
			    result.ticktext.push(''+date.getFullYear());
		    } else if (frequencyData[i].stringName === "year-month"){
			    result.ticktext.push(''+date.getFullYear()+'-'+padTo2(date.getMonth()+1));
		    }
		    
		    if (frequencyData[i].daysStep >0){
			    date.setDate(date.getDate()+frequencyData[i].daysStep);
		    }
		    
		    if (frequencyData[i].monthsStep >0){
			    date= new Date(date.getFullYear(), date.getMonth()+frequencyData[i].monthsStep+1, 0);
		    }
	    }
	    i=frequencyData.length;
    }
  }
  //DEBUG && OTHER_DEBUGS && console.log(frequencyData.length);
  //DEBUG && OTHER_DEBUGS && console.log('target Frequency',targetFrequency);
  //DEBUG && OTHER_DEBUGS && console.log(frequencyData);
  return result;
  
};


function createDataOriginal(data){
  var j;
  for (var i = 0; i < data.length; i++) {
    // duplicates data into original for future use
    if(typeof data[i].xOriginal === 'undefined'){
      data[i].xOriginal = [];
      data[i].yOriginal = [];
      for (j = 0; j < data[i].x.length; j++) {
        data[i].xOriginal.push(data[i].x[j]);
        data[i].yOriginal.push(data[i].y[j]);
      }
    } 
  }
}
        
aoPlotlyAddOn.createDataOriginal = createDataOriginal;
	 
/* 
* Optimized transformSeriesByFrequenciesNew
*
* changes vs prior version:
*  1.- dates at xOriginal already come as 'yyyy-mm-dd 00:00:00-00:00'
*  2.- no prior calculation has been made, no need to test
*
* data object contains arrays x and y. x has dates as 'yyyy-mm-dd 00:00:00-00:00',
* periodKeys is an object with applicable keys as true
* it populates data object with frequencies keys (as per periodKeys) and x, close, change, etc. attributes
* if an attribute is not calculated, it contains 'N/A', so as to be filtered when data.x, .y are updated.
*/

function transformSeriesByFrequenciesNew(data, originalPeriodKeys, endOfWeek) {
	var j=0, jLimit, k=0, iLimit = data.length; 
	var   currentDate = {},
	    currentDateString = "",
	    currentY = 0.0,
	    temp = 0.0,
	    priorBankingDate = {},
	    nextBankingDate = {},
	    priorLimits = {},
	    currentLimits = {},
	    limitsLibrary = {},
	    begin = true;
	var key = "",
	    aggKey = "",
	    priorClose = [],
	    priorCumulative = [],
	    average = [],
	    priorXString, nextXString,
	    periodKeysArray = [],
	    doCalculations = false;
	var dataIXO, dataIYO, dataIK;
	var averageK;
	var currentLimitKeyBegins, currentLimitKeyEnds;
	var itemsLength = [];
	var itemsIndex = [];
	var index = 0;
	// var minMaxDatesAsString = getDataXminXmaxAsString(data);
	//var bankingDaysLibrary = getBankingDaysLibrary(minMaxDatesAsString.min, minMaxDatesAsString.max);
	
	/*
	var startBankingDate = new Date();
	var startDateLimit = new Date();
	var elapsedBankingDate, elapsedDateLimit;
	var startDataI = new Date();*/
	
	var localGetPriorNonUSBankingWorkingDay = getPriorNonUSBankingWorkingDay;
	var localGetNextNonUSBankingWorkingDay =  getNextNonUSBankingWorkingDay;
	var localGetPeriodLimitsAsYYYYMMDD = getPeriodLimitsAsYYYYMMDD;
	
	DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.log("originalPeriodKeys", originalPeriodKeys);
	
	
	// create periodKeysArray to iterate to required keys to be calculated
	//test that series are not yet calculated for requested keys and update
	for (key in originalPeriodKeys) {
		if (originalPeriodKeys.hasOwnProperty(key)) {
			if (originalPeriodKeys[key]) {
				periodKeysArray.push(key);
				doCalculations = true;
			}
		}
	}
	
	var kLimit = periodKeysArray.length;
	priorClose.length = kLimit;
	priorCumulative.length = kLimit;
	average.length = kLimit;
	itemsLength.length = kLimit;
	itemsIndex.length = kLimit;
	
	/*elapsedBankingDate = 0;
	elapsedDateLimit = 0;*/
	
	for (var i = 0; i < iLimit; i++) {
		// flags begin
		begin = true;
		
		dataIXO = data[i].xOriginal;
		dataIYO = data[i].yOriginal;
		
		DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.log("i: ", i, "DataIXO: ", dataIXO);
		DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.log("DataIYO: ", dataIYO);
		
		jLimit = dataIXO.length;
		
		//startDataI = new Date();
		
		if(doCalculations) {
		
			for(k=0; k < kLimit; k++){
				key = periodKeysArray[k];
				priorClose[k] = "undefined";
				priorCumulative[k]=0.0;
				itemsLength[k] = 0;
				itemsIndex[k] = jLimit-1;
			}
			
			// iterates over trace points

			//DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.log("jLimit", jLimit);
			DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.time("Data "+i);
			
			for (j = jLimit - 1; j > -1; j--) {
				// DEBUG && OTHER_DEBUGS && console.log('j',j);
				// get periods ranges and dates
				currentDateString = dataIXO[j];
				currentDate = stripDateIntoObject(currentDateString);
				priorXString = begin ? "undefined" : dataIXO[j + 1];
				nextXString = (j > 0) ? dataIXO[j - 1] : "undefined";
				
				currentY = Number(dataIYO[j]);
				
				//startBankingDate = new Date();
				//DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.time("Time: GetBankingDays");
				if(typeof priorBankingDate[currentDateString] === "undefined") {
					priorBankingDate[currentDateString] = 
						localGetPriorNonUSBankingWorkingDay(currentDate.year,
									    currentDate.month,
									    currentDate.day);
				} 
				
				if(typeof nextBankingDate[currentDateString] === "undefined") {
					nextBankingDate[currentDateString] =
						localGetNextNonUSBankingWorkingDay(currentDate.year,
									   currentDate.month,
									   currentDate.day);
				}
				
				//DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.timeEnd("Time: GetBankingDays");
				//elapsedBankingDate += (new Date() - startBankingDate); 
				
				// checks and procedures for the first point in the trace
				if (begin) {
					
					if(typeof limitsLibrary[currentDateString] === "undefined") {
						limitsLibrary[currentDateString] = localGetPeriodLimitsAsYYYYMMDD(
										currentDate.year,
										currentDate.month,
										currentDate.day,
										endOfWeek);
					}
							
					priorLimits = limitsLibrary[currentDateString];
					
					for(k=0; k < kLimit; k++){
						average[k] = {
							sum: 0.0,
							n: 0,
							calculate: false
							};
					}
					begin = false;
				}
				
				//startDateLimit = new Date();
				//DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.time("Time: GetPeriodLimits");
				if(typeof limitsLibrary[currentDateString] === "undefined") {
					limitsLibrary[currentDateString] = localGetPeriodLimitsAsYYYYMMDD(
										currentDate.year,
										currentDate.month,
										currentDate.day,
										endOfWeek);
				}
				
				
				currentLimits = limitsLibrary[currentDateString];
				
				//elapsedDateLimit += (new Date() - startDateLimit); 
				//DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.timeEnd("Time: GetPeriodLimits");
				
				for(k=0; k < kLimit; k++){
					key = periodKeysArray[k];
					averageK = average[k];
					currentLimitKeyBegins = currentLimits.begins[key];
					currentLimitKeyEnds = currentLimits.ends[key];
					
					
					// case: Period begin found
					if (priorXString < currentLimitKeyBegins ||
					    priorBankingDate[currentDateString] < currentLimitKeyBegins){
						// allow average calculation.
						averageK.calculate= true;
					}
					
					// add value to average
					if(averageK.calculate){
						averageK.sum = Number(averageK.sum)+currentY;
						averageK.n = Number(averageK.n)+1;
					}
					
					// case: period end found
					if ((nextXString != 'undefined' && nextXString >= currentLimitKeyEnds) ||
					    nextBankingDate[currentDateString] >= currentLimitKeyEnds) {
						
						// create data[i][key] object if not already created.
						if (typeof data[i][key] === 'undefined') {
							data[i][key] = {
								x: [],
								close: [],
								average: [],
								change: [],
								percChange: [],
								sqrPercChange: [],
								cumulative: []
							};
							// set initial length to maximum
							for (aggKey in data[i][key]) {
								if (data[i][key].hasOwnProperty(aggKey)) {
									data[i][key][aggKey].length = jLimit;
								}
							}
							// data[i][key].x.length = jLimit;
							
						}
						
						dataIK = data[i][key];
						
						// set index
						index = itemsIndex[k];
						
						// add date to trace for this key
						dataIK.x[index] = currentLimits.label[key];
						
						// add average if applicable
						if (averageK.calculate) {
							dataIK.average[index] = averageK.sum / averageK.n;
							averageK.sum = 0.0;
							averageK.n = 0;
							averageK.calculate = false;
						} else {
							dataIK.average[index] = 'N/A';
						}
						
						// add close
						dataIK.close[index] = currentY;
						
						//add cumulative
						dataIK.cumulative[index] = priorCumulative[k] + currentY;  
						
						// check if priorClose.key exists and update changes
						if (priorClose[k] !== "undefined") {
							temp = currentY - priorClose[k];
							dataIK.change[index] = temp;
							temp = (priorClose[k] !== 0) ?
								temp / priorClose[k] :
								'N/A';
							dataIK.percChange[index] = temp;
							dataIK.sqrPercChange[index] = temp != 'N/A' ? temp * temp : 'N/A';
						} else {
							dataIK.change[index] = 'N/A';
							dataIK.percChange[index] = 'N/A';
							dataIK.sqrPercChange[index] = 'N/A';
						}
						
						// updated index and length
						itemsIndex[k]--;
						itemsLength[k]++;
						
						//update priorClose
						priorClose[k] = currentY;
						priorCumulative[k]=  priorCumulative[k] + currentY;
					} // end of period end found
					
					else {
						// case: within period
						// do something if applicable
					}
				}  // next k, end of periodKeysArray for
				
				priorLimits = currentLimits;
			} // next j
			
			DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.timeEnd("Data "+i);
			
			// after all j's splice the resulting arrays
			
			DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.time("spliceArrays "+i);
			for (k = 0; k < kLimit; k++) {
				key = periodKeysArray[k];
				dataIK = data[i][key];
				//dataIK.x.splice(0, jLimit - itemsLength[k]);
				for (aggKey in dataIK) {
					if (dataIK.hasOwnProperty(aggKey)) {
						dataIK[aggKey].splice(0, jLimit - itemsLength[k]);
						/*DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.log("aggKey: ", 
												       aggKey,
												       " items length: ",
												       itemsLength[k]);*/
					}
				}
			}
			DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.timeEnd("spliceArrays "+i);
			
			DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.log("data[i].2.x", data[i][periodKeysArray[2]].x);

			
		} // end of doCalculations condition
		//DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.info("Time:dataI: %f %dms",i, new Date() - startDataI);
		
	} // next i
	
	//DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.info("Time: elapsedBankingDate time: %dms", elapsedBankingDate);
	//DEBUG && DEBUG_TRANSFORM_BY_FREQUENCIES && console.info("Time: elapsedDateLimit time: %dms", elapsedDateLimit);
	
} // end of function
 	 
	 
	 
	 
	 
	 
	 
// OLD FUNCTION 
// data object contains arrays x and y. x has dates as 'yyyy-mm-dd', and may have a time and timezone suffix.
// periodKeys is an object with applicable keys as true
// it populates data object with frequencies keys (as per periodKeys) and x, close, change, etc. attributes
// if an attribute is not calculated, it contains 'N/A', so as to be filtered when data.x, .y are updated.
aoPlotlyAddOn.transformSeriesByFrequencies = function (data, originalPeriodKeys, endOfWeek) {
  var j = 0,
    currentDate = {},
    currentY = 0.0,
    temp = 0.0,
    priorBankingDate = {},
    nextBankingDate = {},
    priorLimits = {},
    currentLimits = {},
    begin = true;
  var key = '',
    priorClose = {}, priorCumulative = {},
    average = {},
    priorXString, nextXString,
    periodKeys = {},
    doCalculations = false;
  
  for (var i = 0; i < data.length; i++) {
    // flags begin
    begin = true;
    
    doCalculations = false;
    //test that series are not yet calculated for requested keys and update
    for (key in originalPeriodKeys) {
      if (originalPeriodKeys.hasOwnProperty(key)) {
        //DEBUG && OTHER_DEBUGS && console.log(key,periodKeys[key]);
        if (originalPeriodKeys[key]) {
          if(typeof data[i][key] !== 'undefined') {
						// if frequency data already exists, not to be calculated again.
						// local periodKeys object is used, not to change originalPeriodKeys
            periodKeys[key]=false;
          } 
          else {
            periodKeys[key]=true;
            doCalculations = true;
          }
        }
        else {
          periodKeys[key]=false;
        }
      } 
    }   
    
    if(doCalculations) {
      //sets priorClose to undefined, as no prior trace point available
      for (key in periodKeys) {
        if (periodKeys.hasOwnProperty(key)) {
          //DEBUG && OTHER_DEBUGS && console.log(key,periodKeys[key]);
          if (periodKeys[key]) {
            priorClose[key] = 'undefined';
            priorCumulative[key]=0.0;
          }
        }
      }

      // iterates over trace points
      for (j = data[i].xOriginal.length - 1; j > -1; j--) {
        //DEBUG && OTHER_DEBUGS && console.log('j',j);
        // get periods ranges and dates
        currentDate = stripDateIntoObject(data[i].xOriginal[j]);
        priorXString = begin ? "undefined" : data[i].xOriginal[j + 1];
        nextXString = (j > 0) ? data[i].xOriginal[j - 1] : "undefined";

        currentY = Number(data[i].yOriginal[j]);
        priorBankingDate = stripDateIntoObject(
          getPriorNonUSBankingWorkingDay(currentDate.year,
            currentDate.month,
            currentDate.day));
        nextBankingDate = stripDateIntoObject(
          getNextNonUSBankingWorkingDay(currentDate.year,
            currentDate.month,
            currentDate.day));

        // checks and procedures for the first point in the trace
        if (begin) {
          priorLimits = getPeriodLimitsAsYYYYMMDD(currentDate.year,
            currentDate.month,
            currentDate.day,
            endOfWeek);

          for (key in periodKeys) {
            if (periodKeys.hasOwnProperty(key)) {
              average[key] = {
                sum: 0.0,
                n: 0,
                calculate: false
              };
            }
          }
          begin = false;
        }

        currentLimits = getPeriodLimitsAsYYYYMMDD(currentDate.year,
          currentDate.month,
          currentDate.day,
          endOfWeek);

        for (key in periodKeys) {
          if (periodKeys.hasOwnProperty(key)) {
            // case: Period begin found
            if (priorXString < currentLimits.begins[key] || priorBankingDate.string < currentLimits.begins[key]){
              // allow average calculation.
              average[key].calculate= true;
            }

            // add value to average
            if(average[key].calculate=== true){
              average[key].sum = Number(average[key].sum)+currentY;
              average[key].n = Number(average[key].n)+1;
            }

            // case: period end found
            if ((nextXString != 'undefined' && nextXString >= currentLimits.ends[key]) ||
		nextBankingDate.string >= currentLimits.ends[key]) {

              // create data[i][key] object if not already created.
              if (typeof data[i][key] === 'undefined') {
                data[i][key] = {
                  x: [],
                  close: [],
                  average: [],
                  change: [],
                  percChange: [],
                  sqrPercChange: [],
                  cumulative: [],
                };
              }
              // add date to trace for this key
              data[i][key].x.unshift(currentLimits.label[key]);
              // add average if applicable
              if (average[key].calculate === true) {
                data[i][key].average.unshift(average[key].sum / average[key].n);
                average[key].sum=0.0;
                average[key].n=0;
                average[key].calculate= false;
              } else {
                data[i][key].average.unshift('N/A');
              }
              // add close
              data[i][key].close.unshift(currentY);

              //add cumulative
              data[i][key].cumulative.unshift(priorCumulative[key] + currentY);            

              // check if priorClose.key exists and update changes
              if (priorClose[key] !== 'undefined') {
                temp = currentY - priorClose[key];
                data[i][key].change.unshift(temp);
                temp = (priorClose[key] !== 0) ? temp / priorClose[key] : 'N/A';
                data[i][key].percChange.unshift(temp);
                data[i][key].sqrPercChange.unshift(temp != 'N/A' ? temp * temp : 'N/A');
              } 
              else {
                data[i][key].change.unshift('N/A');
                data[i][key].percChange.unshift('N/A');
                data[i][key].sqrPercChange.unshift('N/A');
              }

              //update priorClose
              priorClose[key] = currentY;
              priorCumulative[key]=  priorCumulative[key]+currentY;
            }
            else { // case: within period
              // do something if applicable
            }
          } // periodKey has ownProperty
        }  // periodKey
        priorLimits = currentLimits;
      } // next j
    } // end of doCalculations condition
  } // next i
}; // end of function
 


// returns a dictionary with with the next and prior banking dates for a given date
// the index are the number of milliseconds between 1 January 1970 00:00:00 UTC 
//	 is the miliseconds since dates come and are handled in a complete form, that is "yyyy-mm-dd hh:mm:ss+hh:mm"
//
function getBankingDaysLibrary(minDateAsString, maxDateAsString) {
	var localGetPriorBankingWorkingDayObject = getPriorBankingWorkingDayObject;
	var localGetNextBankingWorkingDayObject = getNextBankingWorkingDayObject;
	var localConvertMillisecondsIntoObject = convertMillisecondsIntoObject;
	var dayInMilliseconds = 86400000;
	
	var bankingDaysLibrary = {};
	
	var currentDateAsString = minDateAsString;
	var currentDateInMilliseconds = (new Date(currentDateAsString)).valueOf();
	var currentDateObject = localConvertMillisecondsIntoObject(currentDateInMilliseconds);

	var maxDateInMilliseconds = (new Date(maxDateAsString)).valueOf();
	
	var priorBankingDayObject =  localGetPriorBankingWorkingDayObject(
							currentDateObject.year,
							currentDateObject.month,
							currentDateObject.day);
	    
	var nextBankingDayObject =  localGetNextBankingWorkingDayObject(
							currentDateObject.year,
							currentDateObject.month,
							currentDateObject.day);
	
	
	while(currentDateInMilliseconds <= maxDateInMilliseconds) {
		
		if(typeof bankingDaysLibrary[currentDateInMilliseconds] === "undefined"){
			
			if(currentDateInMilliseconds < nextBankingDayObject.milliseconds) {
				
				bankingDaysLibrary[currentDateInMilliseconds] = {
					prior: priorBankingDayObject.string,
					next:  nextBankingDayObject.string
				};
			} else {
				
				bankingDaysLibrary[currentDateInMilliseconds] = {
					prior: priorBankingDayObject.string,
				};
				
				priorBankingDayObject = nextBankingDayObject;
				
				nextBankingDayObject =  localGetNextBankingWorkingDayObject(
								currentDateObject.year,
								currentDateObject.month,
								currentDateObject.day);
				
				bankingDaysLibrary[currentDateInMilliseconds].next = nextBankingDayObject.string;
				
			}
		}
		
		// add new day to current
		currentDateInMilliseconds += dayInMilliseconds;
		currentDateObject = localConvertMillisecondsIntoObject(currentDateInMilliseconds);
	} 
	
	return bankingDaysLibrary;

} 	 


// strip date as 'yyyy-mm-dd' into object
function stripDateIntoObject(dateString) {
  var obj = {
    string: dateString,
    year: Number(dateString.substr(0, 4)),
    month: Number(dateString.substr(5, 2)),
    day: Number(dateString.substr(8, 2))
  };
  
  return obj;
  
}
	 
// strip date as miliseconds into object
// milliseconds are the number of milliseconds between 1 January 1970 00:00:00 UTC and the given date.
function convertMillisecondsIntoObject(milliseconds) {

var date = new Date(milliseconds);
	
	
  var obj = {
    year: date.getFullYear(),
    month: 1+date.getMonth(),
    day: date.getDate()
  };
  
  return obj;
  
}	 
	

	 
// get next non holiday day for a given date as year, month, day
// year, month 1-12, day 1-31
function getNextNonUSBankingWorkingDay(year, month, day) {

  var plainDate = new Date(year, month - 1, day);

  do {
    plainDate.setDate(plainDate.getDate() + 1);

  } while (checkIsUSBankingHoliday(plainDate.getFullYear(), plainDate.getMonth() + 1, plainDate.getDate()) != 'undefined');

  return plainDate.getFullYear() + '-' + ((plainDate.getMonth() + 1) < 10 ? '0' : '') +
	  (plainDate.getMonth() + 1) + '-' + (plainDate.getDate() < 10 ? '0' : '') + plainDate.getDate();
}

// get prior non holiday day for a given date as year, month, day
// year, month 1-12, day 1-31
function getPriorNonUSBankingWorkingDay(year, month, day) {

  var plainDate = new Date(year, month - 1, day);

  do {
    plainDate.setDate(plainDate.getDate() - 1);

  } while (checkIsUSBankingHoliday(plainDate.getFullYear(), plainDate.getMonth() + 1, plainDate.getDate()) != 'undefined');

  return plainDate.getFullYear() + '-' + ((plainDate.getMonth() + 1) < 10 ? '0' : '') +
	  (plainDate.getMonth() + 1) + '-' + (plainDate.getDate() < 10 ? '0' : '') + plainDate.getDate();
}

	

function getPriorBankingWorkingDayObject(year, month, day){
	
  var plainDate = new Date(year, month - 1, day);

  do {
    plainDate.setDate(plainDate.getDate() -1);

  } while (checkIsUSBankingHoliday(plainDate.getFullYear(), plainDate.getMonth() + 1, plainDate.getDate()) != 'undefined');

  return {
	  string: plainDate.getFullYear() + '-' + ((plainDate.getMonth() + 1) < 10 ? '0' : '') +
	  (plainDate.getMonth() + 1) + '-' + (plainDate.getDate() < 10 ? '0' : '') + plainDate.getDate(),
	  
	  milliseconds: plainDate.valueOf()
  };
}

	 

function getNextBankingWorkingDayObject(year, month, day){
	
  var plainDate = new Date(year, month - 1, day);

  do {
    plainDate.setDate(plainDate.getDate() + 1);

  } while (checkIsUSBankingHoliday(plainDate.getFullYear(), plainDate.getMonth() + 1, plainDate.getDate()) != 'undefined');

  return {
	  string: plainDate.getFullYear() + '-' + ((plainDate.getMonth() + 1) < 10 ? '0' : '') +
	  (plainDate.getMonth() + 1) + '-' + (plainDate.getDate() < 10 ? '0' : '') + plainDate.getDate(),
	  
	  milliseconds: plainDate.valueOf()
  };
		
}

	
	

// year yyyy, month 1-12, day 1-31
function checkIsUSBankingHoliday(year, month, day) {
  // date set in US Time Zone
  // for banking holidays, observation may take place the presiding Friday
  // or next Monday when it falls on Saturday and Monday respectively
  // Markets may be close on President's Funerals (not foreseeable)
  // and during certain events, like in the case of September 11

  // New Years Day (moved to Monday when Sunday, lost when Saturday), Martin Luther King Day, Washingtons Birthday,
  // Good Friday, Memorial Day, Independence Day, Labor Day
  // Thanksgiving, Christmas

  var _USBankingHolidays = {
    'W': { //Month, Week of Month, Day of Week
      '1/3/1': 'Martin Luther King Jr. Day', //ok
      '2/3/1': "Washington's Birthday", //ok
      '5/5/1': "Memorial Day", //ok
      '9/1/1': "Labor Day", //ok
      '11/4/4': "Thanksgiving Day" //ok
    },
    'Weekends': { // Day of the week, 0 = Sunday
      '6': 'Saturday',
      '0': 'Sunday'
    }
  };

  var holidaysWeekdays = {
    'New Year': new Date(year, 0, 1).getDay(),
    'Independence Day': new Date(year, 6, 4).getDay(),
    'Christmas Day': new Date(year, 11, 25).getDay()
  };

  _USBankingHolidays.M = {};

  if (holidaysWeekdays['New Year'] === 0) {
    _USBankingHolidays.M['1/2'] = "New Year's Day";
  } else if (holidaysWeekdays['New Year'] < 6) {
    _USBankingHolidays.M['1/1'] = "New Year's Day";
  }

  if (holidaysWeekdays['Independence Day'] === 0) {
    _USBankingHolidays.M['7/5'] = "Independence Day";
  } else if (holidaysWeekdays['Independence Day'] == 6) {
    _USBankingHolidays.M['7/3'] = "Independence Day";
  } else {
    _USBankingHolidays.M['7/4'] = "Independence Day";
  }

  if (holidaysWeekdays['Christmas Day'] === 0) {
    _USBankingHolidays.M['12/26'] = "Christmas Day";
  } else if (holidaysWeekdays['Christmas Day'] == 6) {
    _USBankingHolidays.M['12/24'] = "Christmas Day";
  } else {
    _USBankingHolidays.M['12/25'] = "Christmas Day";
  }

  var dayOfWeek = new Date(year, month - 1, day).getDay();

  var diff = 1 + (0 | (day - 1) / 7);
  var memorial = (dayOfWeek === 1 && (day + 7) > 31) ? "5" : null;
  var dateMMDD = (month) + '/' + day;
  var dateMWD = (month) + '/' + (memorial || diff) + '/' + dayOfWeek;
  var dateYYYYMMDD = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;

  return (_USBankingHolidays.Weekends['' + dayOfWeek] ||
    _USBankingHolidays.M[dateMMDD] ||
    _USBankingHolidays.W[dateMWD] ||
    (dateYYYYMMDD == goodFridayAsString(year) ? 'Good Friday' : 'undefined')
  );
}
	


// returns Good Friday date as 'yyyy-mm-dd'
function goodFridayAsString(year) {
  var daysInMiliseconds = 86400000;

  var excelBaseDate = new Date('1899-12-31T00:00:00Z');
  var excelAprilFirst = (new Date(year.toString() + '-04-02T00:00:00Z') - excelBaseDate) / daysInMiliseconds;
  var excelGoodFriday = Math.round((excelAprilFirst) / 7 + myMod(19 * myMod(year, 19) - 7, 30) * 0.14) * 7 - 8;
  var goodFridayDate = new Date((excelGoodFriday - 1) * daysInMiliseconds + excelBaseDate.getTime());

  var gFMonth = goodFridayDate.getUTCMonth() + 1,
    gFDate = goodFridayDate.getUTCDate();

  return goodFridayDate.getFullYear() + '-' + (gFMonth < 10 ? '0' : '') + gFMonth + '-' + (gFDate < 10 ? '0' : '') + gFDate;
}
	 

// calculates mode as excel does
function myMod(n, d) {
  return (n - d * Math.floor(n / d));

}	
	

// given a date as text, returns object with period limits as Date()
// a data would be within the limits if 
// greater or equal to begins and lower than ends

// date would be a date string
// for instance 'yyyy-mm-dd'

// endOfWeek would be and integer between 0 and 6,
// indicating the day in which weeks end.
// 0 for Sunday, and so on
// year yyyy, month 1-12, day 1-31

function getPeriodLimitsAsYYYYMMDD(year, month, day, endOfWeek) {

  var period = {};
  var weekDay = new Date(year, month - 1, day).getDay(); // 0 to 6

  function padTo2(number) {
    return number < 10 ? '0' + number : '' + number;
  }

  var yearToString = '' + year;
  var yearMonth = yearToString + '-' + padTo2(month) + '-';

  var weekBegins = new Date(year, month - 1, -6 + day + (7 + endOfWeek - weekDay) % 7),
    dayEnds = new Date(year, month - 1, day + 1),
    weekEnds = new Date(year, month - 1, 1 + day + (7 + endOfWeek - weekDay) % 7),
    weekLabel = new Date(year, month - 1, day + (7 + endOfWeek - weekDay) % 7),
    quarterEnds = new Date(year, 3 * (Math.trunc((month - 1) / 3) + 1), 1),
    quarterLabel = new Date(year, 3 * (Math.trunc((month - 1) / 3) + 1), 0),
    semesterEnds = new Date(year, 6 * (Math.trunc((month - 1) / 6) + 1), 1),
    semesterLabel = new Date(year, 6 * (Math.trunc((month - 1) / 6) + 1), 0),
    monthEnds = new Date(year, month, 1),
    monthLabel = new Date(year, month, 0);

  period.begins = {
    day: yearMonth + padTo2(day),
    week: weekBegins.getFullYear() + '-' + padTo2(weekBegins.getMonth() + 1) + '-' + padTo2(weekBegins.getDate()),
    month: yearMonth + '01',
    quarter: yearToString + '-' + padTo2(3 * Math.trunc((month - 1) / 3) + 1) + '-01',
    semester: yearToString + '-' + padTo2(6 * Math.trunc((month - 1) / 6) + 1) + '-01',
    year: yearToString + '-' + '01-01'
  };

  period.ends = {
    day: dayEnds.getFullYear() + '-' + padTo2(dayEnds.getMonth() + 1) + '-' + padTo2(dayEnds.getDate()),
    week: weekEnds.getFullYear() + '-' + padTo2(weekEnds.getMonth() + 1) + '-' + padTo2(weekEnds.getDate()),
    month: monthEnds.getFullYear() + '-' + padTo2(monthEnds.getMonth() + 1) + '-' + padTo2(monthEnds.getDate()),
    quarter: quarterEnds.getFullYear() + '-' + padTo2(quarterEnds.getMonth() + 1) + '-' + padTo2(quarterEnds.getDate()),
    semester: semesterEnds.getFullYear() + '-' + padTo2(semesterEnds.getMonth() + 1) + '-' + padTo2(semesterEnds.getDate()),
    year: '' + (year + 1) + '-01-01'
  };

  // last day of period
  period.label = {
    day: year + '-' + padTo2(month) + '-' + padTo2(day),
    week: weekLabel.getFullYear() + '-' + padTo2(weekLabel.getMonth() + 1) + '-' + padTo2(weekLabel.getDate()),
    month: monthLabel.getFullYear() + '-' + padTo2(monthLabel.getMonth() + 1) + '-' + padTo2(monthLabel.getDate()),
    quarter: quarterLabel.getFullYear() + '-' + padTo2(quarterLabel.getMonth() + 1) + '-' + padTo2(quarterLabel.getDate()),
    semester:semesterLabel.getFullYear() + '-' + padTo2(semesterLabel.getMonth() + 1) + '-' + padTo2(semesterLabel.getDate()),
    year: '' + (year) + '-12-31'
  };
  return (period);
}
  
	    
 













// SUPPORT FUNCTIONS


	
	 
	 
 
	 
	 

// 1. READ DATA and ProcessCSV support functions 
 
	 
	    
function findSpliceInfo(newArray, xSeriesName, newArrayInitialIndex, newArrayElements, existingArray/*,
			datesReady, transformToEndOfMonth, yqlGoogleCSV, xDateSuffix, timeOffsetText*/){
	
	var j=0, iLimit, jLimit = existingArray.length;
	var currentDate = new Date();
	var cutDate = new Date();
	var spliceInfo ={
		initialIndex: -1,
		traceLength: -1,
		insertPoint: 0
	};
	/*var localChangeDateToEndOfMonth = changeDateToEndOfMonth;
	var localGoogleMDYToYMD = GoogleMDYToYMD;
	var localProcessDate = processDate;*/
		
	iLimit = newArrayInitialIndex + newArrayElements;
	for (var i=newArrayInitialIndex; i < iLimit; i++){
		
		currentDate = new Date(newArray[i][xSeriesName]);

		// search for an entry point
		if(spliceInfo.initialIndex===-1){
			for(j=-1; j < jLimit; j++){
				if(j===-1){
					cutDate = new Date(existingArray[j+1]);
					if(currentDate > cutDate){
							spliceInfo.initialIndex = i;
							spliceInfo.insertPoint = j+1;
							j=jLimit;
							// search number of items to include
							for (i=spliceInfo.initialIndex; i<iLimit; i++){
								currentDate = new Date(newArray[i][xSeriesName]);

								if(currentDate <= cutDate ){
									spliceInfo.traceLength = i-spliceInfo.initialIndex;
									i=iLimit;
								}
							}
					}

				}
				else if (j === jLimit -1){
					if(currentDate < new Date(existingArray[j])){
							spliceInfo.initialIndex = i;
							spliceInfo.insertPoint = j+1;
							j=jLimit;
							spliceInfo.traceLength = iLimit -spliceInfo.initialIndex;
							i=iLimit;
					}
				
				}
				else {
					cutDate = new Date(existingArray[j+1]);
					if(currentDate < new Date(existingArray[j]) &&
					   currentDate > cutDate) {
						spliceInfo.initialIndex = i;
						spliceInfo.insertPoint = j+1;
						j=jLimit;
						// search number of items to include
						for (i=spliceInfo.initialIndex; i < iLimit; i++){

							currentDate = new Date(newArray[i][xSeriesName]);
							
							if(currentDate <= cutDate ){
								spliceInfo.traceLength = i-spliceInfo.initialIndex;
								i=iLimit;
							}
						}
					}
				}
			}
		}
	}
	
	// return zero elements to include
	if(spliceInfo.initialIndex === -1){
		spliceInfo.initialIndex = 0;
		spliceInfo.insertPoint = 0;
		spliceInfo.traceLength = 0;
	}
	
	return spliceInfo;

}

function findTraceIdIndex(traceID,otherDataProperties){
	var iLimit = otherDataProperties.length;
	for( var i=0; i< iLimit; i++){
		if(otherDataProperties[i].traceID === traceID){
			return i;
		}	
	}
	return -1;
}
	    
	     
// callback creation function to sortByDatesAsStrings
function sortByDatesAsStrings(xSeriesName, delta){
	return function (a, b) {
		delta = new Date(b[xSeriesName])-new Date(a[xSeriesName]);
		if(!isNaN(delta)){
			return delta;			
		}
		else {
				return 	new Date(b[xSeriesName]==="" ||b[xSeriesName]===null ? "0001-01-01": b[xSeriesName])-
					new Date(a[xSeriesName]==="" ||a[xSeriesName]===null ? "0001-01-01": a[xSeriesName]);

		}

	};
}	
	    
	
// callback creation function to sortByDatesAsStrings, all dates exist
function sortByDatesAsStringsAllDatesExist(xSeriesName){
	return function (a, b) {
				return 	new Date(b[xSeriesName])-new Date(a[xSeriesName]);
	};
}	    
	    
	    
// callback creation function to sortByGoogleDatesAsStrings
function sortByGoogleDatesAsStrings(xSeriesName, delta){
	return function (a, b) {
		var localGoogleMDYToYMD = GoogleMDYToYMD;
		delta = new Date(localGoogleMDYToYMD(b[xSeriesName]))-new Date(localGoogleMDYToYMD(a[xSeriesName]));
		if(!isNaN(delta)){
			return delta;			
		}
		else {
				return 	new Date(b[xSeriesName]==="" || b[xSeriesName]===null ? 
						 "0001-01-01": 
						 localGoogleMDYToYMD(b[xSeriesName]))-
					new Date(a[xSeriesName]==="" || a[xSeriesName]===null ?
						 "0001-01-01":
						 localGoogleMDYToYMD(a[xSeriesName]));

		}

	};
}		    
	
	    
// use write loop to concat
function myConcat(array, toAdd){
	//
	var iLimit = toAdd.length;
	var k = array.length;
	array.length = iLimit+k;
	for(var i=0; i < iLimit; i++){
		array[k] = toAdd[i];
		k++;
	}
	return array;

}
	    
	    
// use write for loops to insert array
function insertArrayInto(toAdd, insertPoint, array){
	//
	var kLimit = toAdd.length;
	var iLimit = array.length;

	array.length = iLimit+kLimit;

	var k= insertPoint + kLimit;
	for(var i=insertPoint; i < iLimit; i++){
		array[k] = array[i];
		k++;
	}
	i=insertPoint;
	for(k=0; k < kLimit; k++){
		array[i] = toAdd[k];
		i++;
	}
	return array;

}
	    
//Reverse order of array and return result
function reverseOrderOfArray(allRows){
	var iLimit = allRows.length;
	var newArray = [];
	newArray.length = iLimit;
	var k= iLimit -1;
	for (var i = 0; i<iLimit; i++){
		newArray[i]=allRows[k];
		k--;
	}
	allRows = [];
	return newArray;
		
}

/*	 
function transformAllRowsToEndOfMonth(allRows, xSeriesName, xDateSuffix, urlType){
	var iLimit = allRows.lenght;
	var processedDate = "";
	var yqlGoogleCSV = false;
	var timeOffsetText = getTimeOffsetText();
	
	// save function references
	var localProcessDate = processDate;
	var localChangeDateToEndOfMonth = changeDateToEndOfMonth;
	var localGoogleMDYToYMD = GoogleMDYToYMD;
	
	if(urlType === "yqlGoogleCSV") yqlGoogleCSV = true;
	
	// 
	for (var i=0; i < iLimit; i++){
		processedDate = !yqlGoogleCSV ? allRows[i][xSeriesName] :  localGoogleMDYToYMD(allRows[i][xSeriesName]);
		processedDate = localProcessDate(""+processedDate + xDateSuffix, timeOffsetText);
		processedDate = localChangeDateToEndOfMonth(processedDate);		
		allRows[i][xSeriesName] = processedDate;	
	}
}*/

/*	 
function processDatesToAllRows(allRows, xSeriesName, xDateSuffix, urlType){
	var iLimit = allRows.lenght;
	var processedDate = "";
	var yqlGoogleCSV = false;
	var timeOffsetText = getTimeOffsetText();
	
	// save function references
	var localProcessDate = processDate;
	var localGoogleMDYToYMD = GoogleMDYToYMD;
	
	if(urlType === "yqlGoogleCSV") yqlGoogleCSV = true;
	
	// 
	for (var i=0; i < iLimit; i++){
		processedDate = !yqlGoogleCSV ? allRows[i][xSeriesName] :  localGoogleMDYToYMD(allRows[i][xSeriesName]);
		processedDate = localProcessDate(""+processedDate + xDateSuffix, timeOffsetText);
		allRows[i][xSeriesName] = processedDate;
	}
}
*/
	    
function processYqlGoogleCSVTags(dataSources, tags){
	var j, jLimit = dataSources.traces.length;
	var key, tagsFound = 0;

	if(typeof dataSources.xSeriesName !== "undefined"){
		// set xSeriesName to tags in case yqlGoogleCSV
		for (key in tags){
			if (tags.hasOwnProperty(key)) {
				if(tags[key].toString().trim() === dataSources.xSeriesName.toString()){
					dataSources.xSeriesName = key;
				}
			}
		}
	}

	for (j=0; j< jLimit; j++){
		for (key in tags){
			if (tags.hasOwnProperty(key)) {
				if(tags[key].toString().trim() === dataSources.traces[j].xSeriesName.toString()){
					tagsFound++;
					dataSources.traces[j].xSeriesName = key;
				}
				if(tags[key].toString().trim() === dataSources.traces[j].ySeriesName.toString()){
					tagsFound++;
					dataSources.traces[j].ySeriesName = key;
				}
			}
		}
	}
	
	if(tagsFound === (jLimit + jLimit)){
		return true;
	} else {
		return false;
	}
}	    
	   
// return false on data error, true on success	
function applyDateProprocessing(allRows, tableParams, urlType) {
	var i, iLimit = allRows.length;
	var processedDate = "";
	var timeOffsetText = getTimeOffsetText();
	var xSeriesName, xDateSuffix;
	var transformToEndOfMonth = false;
	var yqlGoogleCSV = false;
	var onlyAddXDateSuffix;

	// save function references
	var localProcessDate = processDate;
	var localChangeDateToEndOfMonth = changeDateToEndOfMonth;
	var localGoogleMDYToYMD = GoogleMDYToYMD;
	
	
	// transform to end of month if required
	if(urlType === "yqlGoogleCSV"){
		yqlGoogleCSV = true;
	}
	
	
	for (var key in tableParams) {
		if (tableParams.hasOwnProperty(key)){
			if(tableParams[key].processDates){
				xSeriesName = key;
				xDateSuffix = tableParams[key].xDateSuffix;
				if(typeof tableParams[key].onlyAddXDateSuffix !== "undefined"){
					onlyAddXDateSuffix = tableParams[key].onlyAddXDateSuffix;
				} else{
					onlyAddXDateSuffix = false;
				}

				transformToEndOfMonth = false;
				if(typeof tableParams[key].postProcessDate !== "undefined" &&
				   tableParams[key].postProcessDate === "end of month"){ 
					transformToEndOfMonth = true;
				}

				if(yqlGoogleCSV){				   
					for(i = 0; i < iLimit ; i++){
						if(allRows[i][xSeriesName]!=="" && allRows[i][xSeriesName]!==null){
							allRows[i][xSeriesName] =
								localProcessDate(""+
										 localGoogleMDYToYMD(allRows[i][xSeriesName])+
										 xDateSuffix, 
										 timeOffsetText);
						}

					}
				} else if(transformToEndOfMonth){
					for(i = 0; i < iLimit ; i++){
						if(allRows[i][xSeriesName]!=="" && allRows[i][xSeriesName]!== null) {
							processedDate = localProcessDate(""+
								allRows[i][xSeriesName] + 
								xDateSuffix, timeOffsetText);
							processedDate = localChangeDateToEndOfMonth(processedDate);
							allRows[i][xSeriesName]=processedDate;
						}
					}
				} else if (onlyAddXDateSuffix) {
					for(i = 0; i < iLimit ; i++){
						if(allRows[i][xSeriesName]!=="" && allRows[i][xSeriesName]!==null) {
							allRows[i][xSeriesName] += onlyAddXDateSuffix;
						}	
					}
				} else {
					for(i = 0; i < iLimit ; i++){
						if(allRows[i][xSeriesName]!=="" && allRows[i][xSeriesName]!==null) {
							allRows[i][xSeriesName] = localProcessDate(""+
								allRows[i][xSeriesName] + 
								xDateSuffix, timeOffsetText);
						}	
					}
				}
			}	
		}
	}
}
	    
	    

function setTablesParametersSortAndPreprocessing(tableParams, dataSources){
	var traces = dataSources.traces;
	var xSeriesName, ySeriesName;

	// number of traces to be read on this data source
	var jLimit = traces.length;

	// for a given data source
	// determine number of xSeriesNames being used and fill y values for each, cycle through traces array
	for (var j=0; j < jLimit; j++){

		// set temporary variable
		xSeriesName = traces[j].xSeriesName;
		ySeriesName = traces[j].ySeriesName;

		// set xSeriesName in table of xSeriesNames
		if(!tableParams.hasOwnProperty(xSeriesName)){
			tableParams[xSeriesName] = {};
			tableParams[xSeriesName].yNames = [];
			tableParams[xSeriesName].yCalculateAdjustedClose = [];
			tableParams[xSeriesName].factorArray = [];
			tableParams[xSeriesName].shiftArray = [];
		}


		// add yName if not yet added
		// including calculating adjusted close
		// factor and shift
		if(tableParams[xSeriesName].yNames.indexOf(ySeriesName) === -1){
			tableParams[xSeriesName].yNames.push(ySeriesName);
			
			// add calculated adjusted close options
			if(typeof dataSources.calculateAdjustedClose !== "undefined"){
				tableParams[xSeriesName].yCalculateAdjustedClose.push(dataSources.calculateAdjustedClose);
			} else if(typeof traces[j].calculateAdjustedClose !== "undefined"){
				tableParams[xSeriesName].yCalculateAdjustedClose.push(traces[j].calculateAdjustedClose);
			} else{
				tableParams[xSeriesName].yCalculateAdjustedClose.push(false);
			}
			
			// add factor option
			if(typeof traces[j].factor !== "undefined"){
				tableParams[xSeriesName].factorArray.push(traces[j].factor);
			} else{
				tableParams[xSeriesName].factorArray.push(1.0);
			}
			
			// add shift option
			if(typeof traces[j].shift !== "undefined"){
				tableParams[xSeriesName].shiftArray.push(traces[j].shift);
			} else{
				tableParams[xSeriesName].shiftArray.push(0.0);
			}
			

			
		}
		

		// set parameters from general options

		// add sort info
		if(typeof dataSources.sort !== "undefined"){
			tableParams[xSeriesName].sort =  dataSources.sort;
		} 

		// add xDateSuffix info
		if(typeof dataSources.xDateSuffix !== "undefined"){
			tableParams[xSeriesName].xDateSuffix =  dataSources.xDateSuffix;	
		} 

		// add firstItemToRead info
		if(typeof dataSources.firstItemToRead !== "undefined"){
			tableParams[xSeriesName].firstItemToRead =  dataSources.firstItemToRead;
		} 

		// add processDate info
		if(typeof dataSources.processDates !== "undefined"){
			tableParams[xSeriesName].processDates =  dataSources.processDates;
		}

		// add postProcessDate info
		if(typeof dataSources.postProcessDate !== "undefined"){
			tableParams[xSeriesName].postProcessDate =  dataSources.postProcessDate;
		} 
		
		// add onlyAddXDateSuffix info
		if(typeof dataSources.onlyAddXDateSuffix !== "undefined"){
			tableParams[xSeriesName].onlyAddXDateSuffix =  dataSources.onlyAddXDateSuffix;
		} 


		// set parameters from trace options

		// add sort info, default false
		if(typeof traces[j].sort !== "undefined"){
			tableParams[xSeriesName].sort =  traces[j].sort;
		} else{
			if(typeof tableParams[xSeriesName].sort === "undefined")
				tableParams[xSeriesName].sort =  false;	
		}

		// add xDateSuffix info, default ""
		if(typeof traces[j].xDateSuffix !== "undefined"){
			tableParams[xSeriesName].xDateSuffix =  traces[j].xDateSuffix;
		} else{
			if(typeof tableParams[xSeriesName].xDateSuffix === "undefined")
				tableParams[xSeriesName].xDateSuffix =  "";	
		}

		// add firstItemToRead info, default first
		if(typeof traces[j].firstItemToRead !== "undefined"){
			tableParams[xSeriesName].firstItemToRead =  traces[j].firstItemToRead;
		} else{
			if(typeof tableParams[xSeriesName].firstItemToRead === "undefined")
				tableParams[xSeriesName].firstItemToRead =  "first";	
		}

		// add processDate info, default true
		if(typeof traces[j].processDates !== "undefined"){
			tableParams[xSeriesName].processDates =  traces[j].processDates;
		} else{
			if(typeof tableParams[xSeriesName].processDates === "undefined")
				tableParams[xSeriesName].processDates =  true;	
		}

		// add postProcessDate info, default undefined
		if(typeof traces[j].postProcessDate !== "undefined"){
			tableParams[xSeriesName].postProcessDate =  traces[j].postProcessDate;
		} 
		
		// add onlyAddXDateSuffix info, default undefined
		if(typeof  traces[j].onlyAddXDateSuffix !== "undefined"){
			tableParams[xSeriesName].onlyAddXDateSuffix =  traces[j].onlyAddXDateSuffix;
		} 
		
		


			
	}	
}

	
	
/**
*
* Set eia table parameters
*/


function setEiaTablesParameters(tableParams, dataSources){
	var traces = dataSources.traces;
	var xSeriesName, ySeriesName;

	// number of traces to be read on this data source
	var jLimit = traces.length;

	// determine number of xSeriesNames being used and fill y values for each, cycle through traces array
	for (var j=0; j < jLimit; j++){

		
		
		// set temporary variable
		xSeriesName = "x"+j;
		ySeriesName = "y"+j;
		
		// name traces xSeries and ySeries
		traces[j].xSeriesName = xSeriesName;
		traces[j].ySeriesName = ySeriesName;

		// set xSeriesName in table of xSeriesNames
		if(!tableParams.hasOwnProperty(xSeriesName)){
			tableParams[xSeriesName] = {};
			tableParams[xSeriesName].yNames = [];
			tableParams[xSeriesName].yCalculateAdjustedClose = [];
			tableParams[xSeriesName].factorArray = [];
			tableParams[xSeriesName].shiftArray = [];
		}


		// add yName if not yet added
		// add calculate adjusted close option and 
		// add factor and shift
		if(tableParams[xSeriesName].yNames.indexOf(ySeriesName) === -1){
			tableParams[xSeriesName].yNames.push(ySeriesName);
			if(typeof dataSources.calculateAdjustedClose !== "undefined"){
				tableParams[xSeriesName].yCalculateAdjustedClose.push(dataSources.calculateAdjustedClose);
			} else if(typeof traces[j].calculateAdjustedClose !== "undefined"){
				tableParams[xSeriesName].yCalculateAdjustedClose.push(traces[j].calculateAdjustedClose);
			} else{
				tableParams[xSeriesName].yCalculateAdjustedClose.push(false);
			}	
			
			
			// add factor option
			if(typeof traces[j].factor !== "undefined"){
				tableParams[xSeriesName].factorArray.push(traces[j].factor);
			} else{
				tableParams[xSeriesName].factorArray.push(1.0);
			}
			
			// add shift option
			if(typeof traces[j].shift !== "undefined"){
				tableParams[xSeriesName].shiftArray.push(traces[j].shift);
			} else{
				tableParams[xSeriesName].shiftArray.push(0.0);
			}

			
		}

	
		// set parameters from trace options

		// add sort info, default false
		if(typeof traces[j].sort !== "undefined"){
			tableParams[xSeriesName].sort =  traces[j].sort;
		} else{
			if(typeof tableParams[xSeriesName].sort === "undefined")
				tableParams[xSeriesName].sort =  false;	
		}

		// xDateSuffix set to "", disregarding any provided parameter
		// because is not needed
		tableParams[xSeriesName].xDateSuffix =  "";	


		// add firstItemToRead info, default first
		if(typeof traces[j].firstItemToRead !== "undefined"){
			tableParams[xSeriesName].firstItemToRead =  traces[j].firstItemToRead;
		} else{
			if(typeof tableParams[xSeriesName].firstItemToRead === "undefined")
				tableParams[xSeriesName].firstItemToRead =  "first";	
		}

		// processDate set to false, disregarding any provided parameter
		// because is not needed		
		tableParams[xSeriesName].processDates =  false;	


		// no postProcessDate info added (not needed), will be maintained undefined

		
		// no onlyAddXDateSuffix info added (not needed), will be maintained undefined
		
		// add factor and shift
		if(typeof  traces[j].factor !== "undefined"){
			tableParams[xSeriesName].factor =  traces[j].factor;
		} 
			
		if(typeof  traces[j].shift !== "undefined"){
			tableParams[xSeriesName].shift =  traces[j].shift;
		}
			
	}	
}


/**
*
*  split csv subtables and trim
*
*  loads csv read data into tableParams[x0...x1...x2].allRows 
*/
	
function splitSubtablesAndTrim(allRows, tableParams, dataSources, initialDateAsDate){
	var newArray=[];
	var i=0, iLimit = allRows.length;
	var j, jLimit,k, l, lStep;
	var xSeriesName, ySeriesName;
	var dateString = "";
	var factor = 1.0;
	var shift = 0.0;
	var indexOfYSeriesName = 0;

	for (var key in tableParams) {
		if (tableParams.hasOwnProperty(key)){
			xSeriesName = key;
			
			newArray =[];
			newArray.length= iLimit;
			var yNamesArray;

			
			// set reading parameter by reading order
			if( tableParams[key].firstItemToRead === "first"){
				l = 0; 
				lStep = 1;
			} else{
				l = iLimit -1;
				lStep = -1;
			} 
			
			// k: number of read items
			k=0;
			
			jLimit = tableParams[key].yNames.length;
			
			yNamesArray = tableParams[key].yNames;
			//DEBUG && OTHER_DEBUGS && console.log("yNamesArray: ", yNamesArray);
			
			//DEBUG && OTHER_DEBUGS && console.log("xSeriesName: ", xSeriesName);
			//DEBUG && OTHER_DEBUGS && console.log("iLimit ", iLimit);
			//DEBUG && OTHER_DEBUGS && console.log("allRows in split subtables", allRows);
			// read data into ordered and subtables
			for(i=0; i<iLimit; i++){
				dateString = allRows[l][xSeriesName];
				if(dateString !== "" && dateString !== null){
					if(new Date(dateString)>= initialDateAsDate){
						newArray[k]={};
						newArray[k][xSeriesName] = dateString;
						for(j=0; j < jLimit; j++){
							ySeriesName = yNamesArray[j];
							indexOfYSeriesName =tableParams[key].yNames.indexOf(ySeriesName);
							if(indexOfYSeriesName != j) {
								console.log("j is not equalt to indexOfYSeriesName");
							}
							factor = tableParams[key].factorArray[j];
							shift =  tableParams[key].shiftArray[j];
							newArray[k][ySeriesName] = allRows[l][ySeriesName] * factor + shift ;
						}
						k++;
						//DEBUG && OTHER_DEBUGS && console.log("l: ", l);
					}	
				}
				l+=lStep;
			}
			//DEBUG && OTHER_DEBUGS && console.log("k elements",k);
			//DEBUG && OTHER_DEBUGS && console.log("new array", newArray);
			// adjust array length to read items.
			newArray.length=k;
			tableParams[key].allRows = newArray;
		}
	}
}	
	
	
	

/**
*
*  loads eiaArrayData into tableParams[x0...x1...x2].allRows 	
*
*/

function loadEiaArrayDataIntoTableParamsAndProcess(
	eiaArrayData, tableParams,
		dataSources, initialDateAsDate) 
{	
	
	var newArray=[];
	var i=0, iLimit;
	var j, jLimit,k, l, lStep;
	var seriesIndex;
	var xSeriesName, ySeriesName;
	var dateString = "";
	var yNamesArray, currentTrace={};
	var traceType = "full";
	var lastHistoricalPeriod ="";
	var traceIndex;
	var factor = 1.0;
	var shift = 0.0;
	var indexOfYSeriesName = 0;
	
	DEBUG && OTHER_DEBUGS && DEBUG_EIA_FUNCTION && console.log("start LoadEiaArrayDataIntoTableParm...");
	DEBUG && OTHER_DEBUGS && DEBUG_EIA_FUNCTION && console.log("tableParams before loaded data",tableParams);
	
	for (var key in tableParams) {
		
		if(tableParams.hasOwnProperty(key)) {
			
			xSeriesName = key;
			traceIndex = parseInt(key.substr(1));
			DEBUG && OTHER_DEBUGS && DEBUG_EIA_FUNCTION && console.log("xSeriesName:",key, "   traceIndex:", traceIndex);
			

			/* get trace object from traces array */
			currentTrace = dataSources.traces[traceIndex];

			/* get index to series in the eiaArrayData */
			seriesIndex = currentTrace.seriesIndex;

			/* the number of elements in eiaArrayData for correponding seriesIndex*/
			iLimit = eiaArrayData[seriesIndex].data.length;
			

			newArray =[];
			newArray.length= iLimit;
			DEBUG && OTHER_DEBUGS && DEBUG_EIA_FUNCTION && console.log("elements in serie:", iLimit);

			/**
			* check for each type of traces (historical, forecast or none) and set marker
			*/

			if(currentTrace.hasOwnProperty("traceType")) {
				if(currentTrace.traceType === "historical"){
					/* read the historical portion */
					traceType = "historical";
					lastHistoricalPeriod = eiaArrayData[seriesIndex].lastHistoricalPeriod;

				}

				if (currentTrace.traceType === "forecast"){
					/* the the forecast portion */
					traceType = "forecast";
					lastHistoricalPeriod = eiaArrayData[seriesIndex].lastHistoricalPeriod;
				}

			}
			else {
				/* read the whole serie */
				traceType = "full";
			}


			// set reading parameter by reading order
			if( tableParams[key].firstItemToRead === "first"){
				l = 0; 
				lStep = 1;
			} else{
				l = iLimit -1;
				lStep = -1;
			} 

			// k: number of read items
			k=0;

			jLimit = tableParams[key].yNames.length;

			yNamesArray = tableParams[key].yNames;

			// read data into ordered and subtables
			for(i=0; i < iLimit; i++){
				dateString = eiaArrayData[seriesIndex].data[l][0];
				if(dateString !== "" && dateString !== null){
					// DEBUG && OTHER_DEBUGS && DEBUG_EIA_FUNCTION && console.log("dateString:", dateString);
					if(new Date(dateString) >= initialDateAsDate){
						if( traceType === "full" ||
							 (traceType === "historical" && dateString <= lastHistoricalPeriod) || 
							 (traceType === "forecast" && dateString >= lastHistoricalPeriod) ) {
							newArray[k]={};
							newArray[k][xSeriesName] = dateString;
							for(j=0; j < jLimit; j++){
								ySeriesName = yNamesArray[j];
								indexOfYSeriesName =tableParams[key].yNames.indexOf(ySeriesName);
								if(indexOfYSeriesName != j) {
									console.log("j is not equalt to indexOfYSeriesName");
								}
								factor = tableParams[key].factorArray[j];
								shift =  tableParams[key].shiftArray[j];
								newArray[k][ySeriesName]=eiaArrayData[seriesIndex].data[l][1] *
									factor + shift;
							}
							k++;
						}
						//DEBUG && OTHER_DEBUGS && console.log("l: ", l);
					}	
				}
				l+=lStep;
			}
			//DEBUG && OTHER_DEBUGS && console.log("k elements",k);
			//DEBUG && OTHER_DEBUGS && console.log("new array", newArray);
			// adjust array length to read items.
			newArray.length=k;
			tableParams[key].allRows = newArray;
		}
	}
	DEBUG && OTHER_DEBUGS && DEBUG_EIA_FUNCTION && console.log("tableParams after loaded data",tableParams);
}		
	
	
	
	    
function sortSubTables(tableParams){
	for (var key in tableParams) {
		if (tableParams.hasOwnProperty(key)){
			if(tableParams[key].sort){
				tableParams[key].allRows.sort(sortByDatesAsStringsAllDatesExist(key));
			}
		}
	}
}
	    
function getAdjustFactor(allRows, xSeriesName, ySeriesName, initialIndex, existingArray, insertPoint){
	var adjustFactor = 1.0;
	var currentDate = new Date();
	var cutDate = new Date();
	var i, iLimit;
	var divisor =1.0;

	// set initial date in allRows (new data)
	if(initialIndex > 0){
		currentDate = new Date(allRows[initialIndex - 1][xSeriesName]);
		divisor = allRows[initialIndex - 1][ySeriesName];
	} else{
		currentDate = new Date(allRows[initialIndex][xSeriesName]);
		divisor = allRows[initialIndex][ySeriesName];
	}

	iLimit = existingArray.x.length;
	i= (insertPoint > 0) ? insertPoint - 1 : insertPoint;
	for(i ; iLimit; i++){
		cutDate = new Date(existingArray.x[i]);
		if(cutDate >= currentDate){
			adjustFactor = existingArray.y[i] / divisor;
			return adjustFactor;	
		}

	}
	adjustFactor = 1.0;
	return adjustFactor;
}	    
	    
	    

	 
	 
	 
// 3. DATES PROCESSING FUNCTIONS	 

// transform yyyy-m-d to yyyy-mm-dd
function parseDateStringToYMD(dateAsString) {
	var allParts = dateAsString.split(" ");
	var parts = allParts[0].split("-");
	
	function padTo2(number) {
		return number < 10 ? "0" + number : "" + number;
	}

	return "" + parts[0] + "-" + padTo2(Number(parts[1]))+ "-" + padTo2(Number(parts[2]));
}

// transform date to string
function dateToStringYMD(date) {
	function padTo2(number) {
		return number < 10 ? "0" + number : "" + number;
	}

	return (
		"" +
		date.getFullYear() +
		"-" +
		padTo2(date.getMonth() + 1) +
		"-" +
		padTo2(date.getDate())
	);
}

// transform date to full string
function dateToString(date) {
	
		var offset  = (new Date()).getTimezoneOffset();
		var offsetText ="";
		
		offsetText = offset > 0 ? ("-"+convertOffsetToHHMM(offset)): ("+"+convertOffsetToHHMM(-offset));
	
	function padTo2(number) {
		return number < 10 ? "0" + number : "" + number;
	}
	
	function padTo3(number) {
		if(number <100){
			return "0"+padTo2(number);
		}
		else{
			return number;
		}
	}

	return (
		"" +
		date.getFullYear() +
		"-" +
		padTo2(date.getMonth() + 1) +
		"-" +
		padTo2(date.getDate())+" "+
		
		padTo2(date.getHours())+":"+
		
		padTo2(date.getMinutes())+":"+
		
		padTo2(date.getSeconds())+
		
		(date.getMilliseconds()!==0? "."+padTo3(date.getMilliseconds()):"")+
		
		offsetText
		
	);
}


// get the day before	 
// dateAsYYYYMMDDString = "YYYY-MM-DD"
function getdayBeforeAsString(dateAsYYYYMMDDString){
	var timeOffsetText = getTimeOffsetText();
	
	dateAsYYYYMMDDString +=" 00:00:00"+timeOffsetText;
	
	DEBUG && OTHER_DEBUGS && console.log(dateAsYYYYMMDDString.substr(0,4));
	
	var dayBefore = new Date(
		Number(dateAsYYYYMMDDString.substr(0,4)),
		Number(dateAsYYYYMMDDString.substr(5,2))-1,
		Number(dateAsYYYYMMDDString.substr(8,2))
	);
	
	DEBUG && OTHER_DEBUGS && console.log(dayBefore);
	
	
	dayBefore = new Date(dayBefore.getTime() -24*60*60*1000);
	
	DEBUG && OTHER_DEBUGS && console.log(dayBefore);

	
	DEBUG && OTHER_DEBUGS && console.log(dayBefore);
	DEBUG && OTHER_DEBUGS && console.log(dayBefore.getFullYear());
	
	return dateAsDateToString(dayBefore);
	
} 
	 
	 
	
// transform a date as Date into a string "yyyy-mm-dd"	 
function dateAsDateToString(dateAsDate){
	
	function padTo2(number) {
    return number < 10 ? '0' + number : '' + number;
  }
	
	return "" + dateAsDate.getFullYear() + "-"+
		padTo2(dateAsDate.getMonth()+1)+"-"+
		padTo2(dateAsDate.getDate());
	
}	 
	 

//transform google date format "day-monthString-year" into "yyyy-mm-dd"

function GoogleMDYToYMD(googleDate){
	
	var year =0;
	var monthString = "";
	var month = "";
	
	googleDate=googleDate.trim();
	var stringParts=googleDate.split("-");

	
	var newString ="";
	
	if((year = Number(stringParts[2])) < 100 ){
		year += year< 50 ? 2000 : 1900;
	}
	
	newString = year.toString();
	
		
	monthString = stringParts[1];
	if(monthString === "Jan") month = "01";
	else if (monthString === "Feb") month = "02";
	else if (monthString === "Mar") month = "03";
	else if (monthString === "Apr") month = "04";
	else if (monthString === "May") month = "05";
	else if (monthString === "Jun") month = "06";
	else if (monthString === "Jul") month = "07";
	else if (monthString === "Aug") month = "08";
	else if (monthString === "Sep") month = "09";
	else if (monthString === "Oct") month = "10";
	else if (monthString === "Nov") month = "11";
	else if (monthString === "Dec") month = "12";
	
	newString +="-"+month+"-";

	newString += Number(stringParts[0]) < 10 ? "0" + stringParts[0] : stringParts[0];
	
	return newString;
	
}
	 
	 

function changeDateToEndOfMonth(dateAsStringAndProcessed){
	
	var currentDate = new Date(dateAsStringAndProcessed);
	var endOfMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0);

	var lastDay = endOfMonthDate.getDate().toString();
	

	dateAsStringAndProcessed = dateAsStringAndProcessed.substring(0, 8) + 
           lastDay + 
          dateAsStringAndProcessed.substring(10, dateAsStringAndProcessed.length);

	
	return dateAsStringAndProcessed;
}
	




/**
*
*   currentDateAsDate should be a Date object.
*
*    requestCode could be any of "end of year" or "end of month" or "end of day"
*
*/


function findDateFromTodayAsString(currentDateAsDate, requestCode, shiftNumber) {
	
	var dateString="";
	
	if(requestCode === "end of year"){
		
		return changeDateAsDateToShortStringEndOfNumberOfYears(currentDateAsDate, shiftNumber);
		
	} else if (requestCode === "end of month"){
		
		return changeDateAsDateToShortStringEndOfNumberOfMonths(currentDateAsDate, shiftNumber);
	
	} else if (requestCode === "end of day"){
		return changeDateAsDateToShortStringEndOfNumberOfDays(currentDateAsDate, shiftNumber);
		
	} else {
		// returns the original date in case no valid option passed
		dateString = dateToStringYMD(currentDateAsDate);
		return dateString;
	}

}



/*
* supporting functions
*
*/ 

function changeDateAsDateToShortStringEndOfNumberOfMonths(dateAsDate, NMonths){
	
	var currentDate = dateAsDate;
	var endOfMonthDate = new Date(currentDate.getFullYear(), 
				      currentDate.getMonth()+1+NMonths,	
				      0);

	return dateToStringYMD(endOfMonthDate);
}

function changeDateAsDateToShortStringEndOfNumberOfDays(dateAsDate, NDays){
	
	var currentDate = dateAsDate;
	var endOfNDays = new Date(currentDate.getFullYear(), 
				currentDate.getMonth(),
				currentDate.getDate()+NDays);

	return dateToStringYMD(endOfNDays);
}

function changeDateAsDateToShortStringEndOfNumberOfYears(dateAsDate, NYears){
	
	var currentDate = dateAsDate;
	var endOfNYears = new Date( currentDate.getFullYear()+NYears, 
					11,
					31);

	return dateToStringYMD(endOfNYears);
}
	
	
	
	
	
	
	
	 
// this function adds a timezone string to dates 
// that already come as "yyyy-mm-dd"
function processFrequenciesDates(data, periodKeys){
	var key = "";
	var j=0, jLimit =0;
	var dataIKX;
	var iLimit = data.length;

	var timeOffset  = (new Date()).getTimezoneOffset();
	var timeOffsetText = (timeOffset > 0 ) ?
	    			("-"+convertOffsetToHHMM(timeOffset)):
				("+"+convertOffsetToHHMM(-timeOffset));

	var timeTimeZoneSuffix = " 00:00:00"+timeOffsetText;


	for (var i=0; i < iLimit ;i++){
		for(key in periodKeys){
			if (periodKeys.hasOwnProperty(key)) {
				if(periodKeys[key]=== true){
					dataIKX = data[i][key].x;
					//DEBUG && console.log("processFrequenciesDates, [key]",key);
					//DEBUG && console.log("processFrequenciesDates, data[i][key]",data[i][key]);
					//DEBUG && OTHER_DEBUGS && console.log("processFrequenciesDates, [key]",key);
					//DEBUG && OTHER_DEBUGS && console.log("processFrequenciesDates, data[i][key]",data[i][key]);
					jLimit = dataIKX.length;
					for(j=0; j < jLimit; j++){
						dataIKX[j]+= timeTimeZoneSuffix;
						//data[i][key].x[j] = processDate(data[i][key].x[j], timeOffsetText);
					}	
				}	
			}
		}
	}
}		




// make data dates into  'yyyy-mm-dd hh:mm:sss.sss+00:00
// dates inputs with optional hour and optional time zone
// which are filled with time 0, and local time zone if not provided.
function preProcessDataDates(data){
	var iLimit=0, j=0, jLimit =0;
	var dateString = "";
	var dateParts=["","",""];
	var split=[];
	var dateTimeTail = "";
	var offset  = (new Date()).getTimezoneOffset();
	var offsetText ="";

	offsetText = offset > 0 ? ("-"+convertOffsetToHHMM(offset)): ("+"+convertOffsetToHHMM(-offset));

	//DEBUG && OTHER_DEBUGS && console.log(offsetText);

	iLimit = data.length;

	for (var i=0; i<iLimit ;i++){
		jLimit = data[i].x.length;
		for(j=0; j<jLimit;j++){


			dateString = data[i].x[j];


			// search for timezone info
			if (dateString.includes("Z")){
				split = dateString.split("Z");

				dateParts[2]="+00:00";
				dateTimeTail=split[0];
			}

			else if(dateString.includes("+") ||dateString.includes("-") ){
				if(dateString.includes("+")) {
					split = dateString.split("+");
					dateParts[2]="+"+split[1];
						dateTimeTail=split[0];
				}
				if(dateString.includes("-")) {
					split = dateString.split("-");
					if(split.length===3){
						dateParts[2]= offsetText;
						dateTimeTail = split[0]+"-"+split[1]+"-"+split[2];
					}
					else if (split.length == 2){
						dateParts[2]=offsetText;
						dateTimeTail = split[0]+"-"+split[1];
					}
					else {
						dateParts[2]="-"+split[3];
						dateTimeTail=split[0]+"-"+split[1]+"-"+split[2];
					}			

				}
			}
			else{
				dateParts[2]=offsetText;
				dateTimeTail = dateString+"-12-31";
			}



			// search for hour info
			if(dateTimeTail.includes(" ") ||dateTimeTail.includes("T") ){

				if(dateString.includes(" ")) split = dateTimeTail.split(" ");
				if(dateString.includes("T")) split = dateTimeTail.split("T");

				data[i].x[j]=split[0]+" "+split[1]+dateParts[2];

			}
			else{
				data[i].x[j]=dateTimeTail+" 00:00:00"+dateParts[2];
			}

		}

	}	

}


function getTimeOffsetText(){
		var offset  = (new Date()).getTimezoneOffset();

		return ((offset > 0) ? ("-"+convertOffsetToHHMM(offset)): ("+"+convertOffsetToHHMM(-offset)));
}


function makeDateComplete(dateString){
	var timeOffsetText = "";		

	var offset  = (new Date()).getTimezoneOffset();

	timeOffsetText = (offset > 0) ? ("-"+convertOffsetToHHMM(offset)): ("+"+convertOffsetToHHMM(-offset));
	
	return processDate(dateString,timeOffsetText);


}


// make  date into  'yyyy-mm-dd hh:mm:sss.sss+00:00
// dates inputs with optional hour and optional time zone
// which are filled with time 0, and local time zone if not provided.
	function processDate(dateString, timeOffsetText){
	var dateTimeZone="";
	var split=[];
	var dateTimeTail = "";


	// search for timezone info
	if (dateString.includes("Z")){
		split = dateString.split("Z");

		dateTimeZone="+00:00";
		dateTimeTail=split[0];
	}

	else if(dateString.includes("+") ||dateString.includes("-") ){
		if(dateString.includes("+")) {
			split = dateString.split("+");
			dateTimeZone="+"+split[1];
				dateTimeTail=split[0];
		}
		if(dateString.includes("-")) {
			split = dateString.split("-");
			if(split.length===3){
				dateTimeZone= timeOffsetText;
				dateTimeTail = split[0]+"-"+split[1]+"-"+split[2];
			}
			else if (split.length == 2){
				dateTimeZone=timeOffsetText;
				dateTimeTail = split[0]+"-"+split[1];
			}
			else {
				dateTimeZone="-"+split[3];
				dateTimeTail=split[0]+"-"+split[1]+"-"+split[2];
			}			

		}
	}
	else{
		dateTimeZone=timeOffsetText;
		dateTimeTail = dateString+"-12-31";
	}



	// search for hour info
	if(dateTimeTail.includes(" ") ||dateTimeTail.includes("T") ){

		if(dateString.includes(" ")) split = dateTimeTail.split(" ");
		if(dateString.includes("T")) split = dateTimeTail.split("T");

		return split[0]+" "+split[1]+dateTimeZone;

	}
	else{
		return dateTimeTail+" 00:00:00"+dateTimeZone;
	}


}


function convertOffsetToHHMM(offset){
		var m = 0, h=0;
				var stringHH = "", stringMM = "";

		m = offset % 60;
		h = (offset - m)/60;

				stringHH = h.toString();
				stringMM = m.toString();

				stringHH = stringHH.length === 1 ? ("0"+stringHH): stringHH;
				stringMM = stringMM.length === 1 ? ("0"+stringMM): stringMM;

				return stringHH+":"+stringMM;

}

	 
	 
	 
	 
	 
		 
	 
	 
	 
	 
// 4. RECESSIONS HANDLING

//set recession shapes for the specified range data to be plotted and returns subset of recessions to the used
function setRecessions(usRecessions, initialDate, endDate) {
	var x0AsDate = new Date(initialDate);
	var x1AsDate = new Date(endDate);
	var currentRecessions = [];
	for (var i = 0; i < usRecessions.length; i++) {
		if (
			new Date(usRecessions[i].x1) >= x0AsDate &&
			new Date(usRecessions[i].x0) <= x1AsDate
		) {
			currentRecessions.push(usRecessions[i]);
		}
	}
	return currentRecessions;
}
	 
	 
// populate recession shapes base on parameters
function createRecessionShapes(knownRecessionsDates, fillcolor, opacity){
	var iLimit = knownRecessionsDates.length;
	var usRecessions=[];

	usRecessions.length = iLimit;

	for(var i=0; i < iLimit; i++){
		usRecessions[i]={
			type: "rect",
			xref: "x",
			yref: "paper",
			x0: knownRecessionsDates[i].x0,
			x1: knownRecessionsDates[i].x1,
			y0: 0,
			y1: 1,
			fillcolor: fillcolor,
			opacity: opacity,
			line: {
				width: 0
			}	
		};
	}
	return usRecessions;
}

	 
function addRecessionsTo(recessionsArray,usRecessions){
	var x0="x0", x1="x1";
	var last = usRecessions.length-1;
	var iLimit = recessionsArray.length;
	var k=iLimit;
	var key, j=0;
	var lastRecessionInBaseEndedAsDate = new Date(usRecessions[last][x0]);
	
	DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("recessionsArray: ", recessionsArray);

	DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("lastRecessionInBaseEndedAsDate",lastRecessionInBaseEndedAsDate);
	
	// get position of new recessions
	for(var i=0; i < iLimit ; i++){
		DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("recessionsArray[i][x0]: ", recessionsArray[i][x0]);
		if(new Date(recessionsArray[i][x0]) >  lastRecessionInBaseEndedAsDate){
			k=i;
			i=iLimit;
		}
	}
	
	// add recessions
	j=last;
	for(i=k ; i<iLimit; i++){
		usRecessions.push({});
		for(key in usRecessions[j]){
			if(usRecessions[j].hasOwnProperty(key)){
				usRecessions[j+1][key]=usRecessions[j][key];
			}
		}
		j++;
		usRecessions[j][x0]= recessionsArray[i][x0];
		usRecessions[j][x1]=	recessionsArray[i][x1];
	}
	
	
}
	 

function  textToArrayOfJsons(readTxt,lineSeparator, fieldSeparator)
{
	var j=0, jLimit =0, iLimit =0;
	var arrayOfJsons = [];
	var line =[];
	var k=0;
	
	// get all lines from readTxt string
	var array = readTxt.split(lineSeparator);
	
	DEBUG && OTHER_DEBUGS && console.log(array);
	
	// fieldNames from first row
	var fieldNames = array[0].split(fieldSeparator);
	

	iLimit=array.length -1;
	jLimit = fieldNames.length;
	arrayOfJsons.length = iLimit;
	
	k=0;
	
	for(var i=0; i < iLimit; i++){
		line = array[i+1].split(fieldSeparator);
		if(line.length === jLimit){
			k++;
			arrayOfJsons[i]={};
			for(j=0; j<jLimit; j++){
				arrayOfJsons[i][fieldNames[j]] = line[j];	
			}
		}
	}
	
	arrayOfJsons.length = k;
	DEBUG && OTHER_DEBUGS && console.log(arrayOfJsons);
	return arrayOfJsons;
	
}

function getRecessionsFromUSRecField(readUSRec){
	
	var iLimit = readUSRec.length;
	var getNewRecession = true;
	var getEndOfRecession = false;
	var USRECFlag = "USRECP";
	var observationDate = "observation_date";
	var x0="x0", x1="x1";
	var dayBeforeAsString = "";
	
	var recessions = [];
	
	var k=0;
	
	for (var i=0; i < iLimit ; i++){
		if(getNewRecession){
			if(readUSRec[i][USRECFlag] === "1"){
				recessions.push({});
				recessions[k][x0]=readUSRec[i][observationDate];	
				getNewRecession = false;
				getEndOfRecession = true;
			}
		} else if (getEndOfRecession){
			if(readUSRec[i][USRECFlag] === "0"){
				dayBeforeAsString = getdayBeforeAsString(readUSRec[i][observationDate]);
				recessions[k][x1]=dayBeforeAsString;	
				getNewRecession = true;
				getEndOfRecession = false;
				k++;
			}		
		}
	}
	
	if(getEndOfRecession){
		recession[k][x1]= dateAsDateToString(new Date());
	}
	
	DEBUG && OTHER_DEBUGS && console.log(recessions);
	return recessions;
}	 
	 
/*function directXMLHttpRequest(options, onreadyFunction) {
	var xhttp = new XMLHttpRequest();
	// use "arraybuffer" for zip files.
	xhttp.responseType = options.responseType;
	
	// once file is read, afterFileLoaded function is triggered
	
	xhttp.onreadystatechange = onreadyFunction(xhttp);
	
	DEBUG && OTHER_DEBUGS && console.log("XMLHttpRequest options: ", options);
	
	xhttp.open(
		options.method,
		options.url,
		options.async
	);

	xhttp.send();
}*/
	 	    			      

function wrappedDirectXMLHttpRequest(options, onreadyFunction, callback) {
	var xhttp = new XMLHttpRequest();
	// use "arraybuffer" for zip files.
	xhttp.responseType = options.responseType;
	
	DEBUG && OTHER_DEBUGS && console.log("XMLHttpRequest options: ", options);
	
	xhttp.open(
		options.method,
		options.url,
		options.async
	);

	xhttp.send();
	
	// once file is read, afterFileLoaded function is triggered
	// this version checks readyState and status at this level
	xhttp.onreadystatechange = function(){
		DEBUG && OTHER_DEBUGS && console.log("readyState= ", xhttp.readyState);
		DEBUG && OTHER_DEBUGS && console.log("status= ", xhttp.status);
		
		// xhttp.readyState == 4, the transfer has completed and the server closed the connection.
		if (xhttp.readyState == 4) {
			
			if(xhttp.status == 200) {
				// no error passed
				DEBUG && OTHER_DEBUGS  && DEBUG_RECESSIONS &&  console.log(
					"calling function(http, callback)"+
					"{ afterFredZipFileLoaded((xhttp, usRecessions, callback))}"
				);
				onreadyFunction(xhttp,callback);
			} else {
				// unsuccessful zip read, call back with no processing
				callback(null);
			}
		}
	};
	
	
}
	
function afterFredZipFileLoaded(xhttp, usRecessions, callback) {
	
	DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("afterFredZipFileLoaded started");
	DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("passed xhttp:", xhttp);
	
	// create an instance of JSZip
	var zip = new JSZip();

	// loads the zip content into the zip instance
	zip.loadAsync(xhttp.response).then(
		function (zip) {
			return zip.file("USRECP_1.txt").async("string");
		}).then(
		function (readTxt) {
			DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("readTxt",readTxt);
			var readJson = textToArrayOfJsons(readTxt,"\r\n","\t");
			var fredRecessionsArray = getRecessionsFromUSRecField(readJson);
			addRecessionsTo(fredRecessionsArray,usRecessions);
			DEBUG && OTHER_DEBUGS && DEBUG_RECESSIONS &&  console.log("usRecessions: ",usRecessions);
			callback(null);
		}
	);

}	 

	 
	 
	 
	 
	 

// 5. HANDLE INITIAL LOADING OF DIVISIONS
function wholeDivShow(wholeDivElement) {
	wholeDivElement.style.visibility = "visible";
}

function loaderHide(loaderElement) {
	loaderElement.style.visibility = "hidden";
}
	 
	 
	 
	 
// 6.-  SET X AXIS RANGE - setsxaxisRange array based of timeInfo parameters and Min Max dates from series.
function setDatesRangeAsString(minDateAsString, maxDateAsString, timeInfo) {
	var initialDate, endDate, xaxisRange = [];

	if (typeof timeInfo.yearsToPlot !== "undefined") {
		if (timeInfo.yearsToPlot > 0) {
			var yearsToPlot = timeInfo.yearsToPlot; // years to be displayed, if provided
			var currentTime = new Date(maxDateAsString);
			endDate = maxDateAsString;
			initialDate = dateToString(
				new Date(
					currentTime.getFullYear() -
						yearsToPlot +
						"-" +
						(currentTime.getMonth() + 1) +
						"-" +
						currentTime.getDate()
				)
			);
		} else {
			initialDate = minDateAsString;
			endDate = maxDateAsString;
		}
	} else {
		if (typeof timeInfo.initialDateForInitialDisplay !== "undefined") {
			initialDate = makeDateComplete(timeInfo.initialDateForInitialDisplay);
		} else {
			initialDate = minDateAsString;
		}

		if (typeof timeInfo.endDateForInitialDisplay !== "undefined") {
			endDate = dateToString(new Date(timeInfo.endDateForInitialDisplay));
		} else {
			endDate = maxDateAsString;
		}
	}

	xaxisRange.push(initialDate);
	xaxisRange.push(endDate);


	return xaxisRange;
}
	 
	 
	 

// 7.- DATA HANDLING

// function to save original data into data.xOriginal data.yOriginal arrays
// Already in library as createDataOriginal(data)

// sets data.x and data.y to the corresponding frequency and aggregation
function loadFrequencyAndAggregationIntoData(data, frequency, aggregation) {
	var iLimit = data.length;
	var jLimit = 0, j = 0, k=0;
	var x, y, dataIX, dataIY;	

	for (var i = 0; i < iLimit; i++) {
		x = [];
		y = [];
		dataIX = data[i][frequency].x;
		dataIY = data[i][frequency][aggregation];
		jLimit = dataIX.length;
		x.length = jLimit;
		y.length = jLimit;

		//jLimit = data[i][frequency].x.length;
		
		for (j = 0, k=0; j < jLimit; j++) {
			//if (!isNaN(data[i][frequency][aggregation][j])) {
			if (!isNaN(dataIY[j])) {				
				x[j] = dataIX[j];
				y[j] = dataIY[j];
				k++;
				//data[i].x.push(data[i][frequency].x[j]);
				//data[i].y.push(data[i][frequency][aggregation][j]);
			}
		}
		x.length = k;
		y.length = k;
		data[i].x = x;
		data[i].y = y;
	}
}

// loads uncompared data (data[i].uncompared.x and data[i].uncompared.y) into data[i].x and data [i].y
function loadData(data, key) {
	var iLimit = data.length;
	var j = 0, jLimit = 0;
	var x, y, dataIX, dataIY;

	for (var i = 0; i < iLimit; i++) {
		x = [];
		y = [];
		dataIX = data[i][key].x;
		dataIY = data[i][key].y;
		jLimit = dataIX.length;
		x.length = jLimit;
		y.length = jLimit;

		for (j = 0; j < jLimit; j++) {
			x[j] = dataIX[j];
			y[j] = dataIY[j];
			//data[i].x.push(data[i][key].x[j]);
			//data[i].y.push(data[i][key].y[j]);
		}
		
		data[i].x = x;
		data[i].y = y;
	}
}




// save data[i].x and data[i].y into data[i].property.x and data[i].property.y
function saveDataXYIntoPropertyXY(data, xProperty, yProperty) {
	var iLimit = data.length;
	var jLimit = 0, j = 0;
	var x, y, dataIX, dataIY;

	// duplicates data into base for future use
	for (var i = 0; i < iLimit; i++) {
		
		// text whether data[i].x and data[i].y exist, and that xProperty and y Property not yet exist otherwise skip
		if(typeof data[i].x !== "undefined" &&
		   typeof data[i].y !== "undefined" &&
		   typeof data[i][xProperty] === "undefined" &&
		   typeof data[i][yProperty] === "undefined") {
			x = [];
			y = [];
			dataIX = data[i].x;
			dataIY = data[i].y;
			jLimit = dataIX.length;
			x.length = jLimit;
			y.length = jLimit;

			for (j = 0; j < jLimit; j++) {
				x[j] = dataIX[j];
				y[j] = dataIY[j];
				//data[i][xProperty].push(data[i].x[j]);
				//data[i][yProperty].push(data[i].y[j]);
			}
			data[i][xProperty] = x;
			data[i][yProperty] = y;	
		}
	}
}

function saveDataXYIntoProperty(data, property) {
	var iLimit = data.length;
	var jLimit = 0, j = 0;
	var x, y, dataIX, dataIY;
	
	for (var i = 0; i < iLimit; i++) {
		// duplicates data into base for future use
		x = [];
		y = [];
		dataIX = data[i].x;
		dataIY = data[i].y;
		jLimit = dataIX.length;
		x.length = jLimit;
		y.length = jLimit;
		for (j = 0; j < jLimit; j++) {
			x[j] = dataIX[j];
			y[j] = dataIY[j];		
			//data[i][property].x.push(data[i].x[j]);
			//data[i][property].y.push(data[i].y[j]);
		}
		data[i][property] = {};
		data[i][property].x = x;
		data[i][property].y = y;
	}
}

function loadDataIntoXYFromPropertyXY(data, propertyForX, propertyForY) {
	var iLimit = data.length;
	var j = 0;
	var jLimit = 0;
	var x, y, dataIX, dataIY;
	
	for (var i = 0; i < iLimit; i++) {
		x = [];
		y = [];
		dataIX = data[i][propertyForX];
		dataIY = data[i][propertyForY];
		jLimit = dataIX.length;
		x.length = jLimit;
		y.length = jLimit;
		//jLimit = data[i][propertyForX].length;
		for (j = 0; j < jLimit; j++) {
			x[j] = dataIX[j];
			y[j] = dataIY[j];
			
			//data[i].x.push(data[i][propertyForX][j]);
			//data[i].y.push(data[i][propertyForY][j]);
		}
		
		data[i].x = x;
		data[i].y = y;
	}
}




// deep copy of objects
function deepCopy(obj) {
	var i = 0;
	var out = Object.prototype.toString.call(obj) === "[object Array]" ? [] : {};

	if (Object.prototype.toString.call(obj) === "[object Array]") {
		var len = obj.length;
		for (  ; i < len; i++) {
			//out[i] = arguments.callee(obj[i]);
			out[i] = deepCopy(obj[i]);
		}
		return out;
	}

	if (typeof obj === "object") {
		out = {};
		for (i in obj) {
			if (obj.hasOwnProperty(i)) {
				out[i] = deepCopy(obj[i]);
			}
		}
		return out;
	}
	return obj;
}

// add default properties to Json Object
function setJsonDefaults(jsonDefaults, json) {
	var i;
	var jsonDefaultsType = Object.prototype.toString.call(jsonDefaults);

	if (jsonDefaultsType === "[object Array]") {
		if (typeof json === "undefined") {
			json = jsonDefaults;
		}
		return json;
	}

	if (typeof jsonDefaults === "object") {
		if (typeof json === "undefined") {
			json = {};
		}
		for (i in jsonDefaults) {
			if (jsonDefaults.hasOwnProperty(i)) {
				json[i] = setJsonDefaults(jsonDefaults[i], json[i]);
		
			}
		}
		return json;
	}
	return json || jsonDefaults;
}

// function to find y range in specified x range for all data
// x0 and x1 as , data object contains x and y arrays.
// returns array with [minValue, maxValue]
// reviewed to disregard traces with visible: false
function getYminYmax(x0, x1, data) {
	var minValue, maxValue;
	var x0AsDate = new Date(x0);
	var x1AsDate = new Date(x1);
	//DEBUG && OTHER_DEBUGS && console.log(x0AsDate);
	for (var i = 0; i < data.length; i++) {
		if(typeof data[i].visible === "undefined" ||
		   data[i].visible === true) {
			var aTrace = data[i];
			//DEBUG && OTHER_DEBUGS && console.log(aTrace.x.length);
			for (var j = 0; j < aTrace.x.length; j++) {
				var x = new Date(aTrace.x[j]);
				//DEBUG && OTHER_DEBUGS && console.log(x);
				if (x >= x0AsDate && x <= x1AsDate) {
					var aValue = Number(aTrace.y[j]);
					//DEBUG && OTHER_DEBUGS && console.log('aValue'+aValue+',min:'+minValue+',max:'+maxValue);
					if (maxValue === undefined || aValue > maxValue) {
						maxValue = aValue;
					}
					if (minValue === undefined || aValue < minValue) {
						minValue = aValue;
					}
				}
			}
		}
		
	}
	var minMax = [minValue, maxValue];
	return minMax;
}
									



// function to find x range of dates
// returns array with [minValue, maxValue]
function getXminXmax(xArray) {
	var minValue, maxValue, x = new Date();

	for (var j = 0; j < xArray.length; j++) {
		x = new Date(xArray[j]);
		if (maxValue === undefined || x > maxValue) {
			maxValue = x;
		}
		if (minValue === undefined || x < minValue) {
			minValue = x;
		}
	}
	var minMax = [minValue, maxValue];
	return minMax;
}

// function to find x range over all data traces.
// data array contains data[i].x
// the data is ordered from oldest to newest, and the dates
// are already complete
// returns array with [minValue, maxValue]
function getDataXminXmaxAsString(data) {
	var minValue, maxValue, x = new Date();
	var iLimit = data.length;
	var jLimit = 0;
	var minMax ={};
	var dataIX;
	
	for (var i = 0; i < iLimit; i++) {
		dataIX = data[i].x;
		jLimit = dataIX.length;
		
		x = new Date(dataIX[0]);
		if (typeof maxValue === "undefined" || x > maxValue) {
			maxValue = x;
			minMax.max = dataIX[0];
		}
		
		x = new Date(dataIX[jLimit - 1]);
		if (typeof minValue === "undefined" || x < minValue) {
			minValue = x;
			minMax.min= dataIX[jLimit - 1];
		}

	}
	
	return minMax;
}

	 
	 
	 
// 8. UPDATE MENUS

// add menus to updatemenus if specified
function addToUpdateMenus(newUpdateMenu, updateMenus, layout) {
	//DEBUG && OTHER_DEBUGS && console.log("newUpdateMenu", newUpdateMenu);
	//DEBUG && OTHER_DEBUGS && console.log("updateMenus", updateMenus);

	for (var i = 0; i < newUpdateMenu.length; i++) {
		updateMenus.push(newUpdateMenu[i]);
	}

	layout.updatemenus = updateMenus;
}

function updateMenuTo(label, updateMenus, nameOfMenu) {
	var i = findIndexOfMenu(updateMenus, nameOfMenu);

	if (i) {
		
		updateMenus[i].active = getLabelLocationInButtons(label, updateMenus[i].buttons);
		
	}
	
}

function findIndexOfMenu(updateMenus, nameOfMenu) {
	var iLimit = updateMenus.length;

	for (var i = 0; i < iLimit; i++) {
		
		if(typeof updateMenus[i].name !== 'undefined'){
			
			if (updateMenus[i].name === nameOfMenu) return i;		
			
		}
		
	}

	return false;
}

// buttons array, elements are objects with property label.
function getLabelLocationInButtons(label, buttons) {
	
	for (var i = 0; i < buttons.length; i++) {
		if (buttons.label === label) {
			return i;
		}
	}

	return 0;
	
}



function xOfFirstFrequencyMenuItem(divWidth, layout, widthOfRightItems) {
	var newX =
		(divWidth - layout.margin.l - layout.externalMargin.r+layout.customMarginOfObjects - widthOfRightItems) /
		(divWidth - layout.margin.l - layout.margin.r);
	return newX;
}

function setNewXToFrequencyButton(newX, updatemenus, nameOfUpdateMenu) {
	for (var i = 0; i < updatemenus.length; i++) {
		if(typeof updatemenus[i].name !== "undefined"){
			if (updatemenus[i].name === nameOfUpdateMenu) {
					updatemenus[i].x = newX;
					return true;
			}
		}
	}
	return false;
}


function setNewXToRangeSelector(divWidth, layout) {
	var newX = xOfRightItems(divWidth, layout);


	
	layout.xaxis.rangeselector.x = newX;
}


function xOfRightItems(divWidth, layout) {
	var newX =
		(divWidth - layout.margin.l - layout.externalMargin.r+layout.customMarginOfObjects) /
		(divWidth - layout.margin.l - layout.margin.r);
	return newX;
}



function toggleCompareButton(newArg, buttonElement) {
	
		buttonElement.textContent = newArg ? "compared" : "uncompared";

}

function toggleRealNominalButton(newArg, buttonElement) {
	
		buttonElement.textContent = newArg ? "real" : "nominal";

}

function toggleLogLinearButton(newArg, buttonElement) {
	
		buttonElement.textContent = newArg ? "log" : "linear";

}


// check a label exist in buttons
// buttons structured as and array of objects
/* buttons=  [{
				method: 'relayout',
				args: ['myAggregation', 'close'],
				label: 'close'
			}, {
				method: 'relayout',
				args: ['myAggregation', 'average'],
				label: 'average'
			}, {...
	*/

function labelInButtons(name, buttons) {
	// check label exist in aggregation buttons
	
	var iLimit = buttons.length;
	var found = false;

	for (var i = 0; i < iLimit; i++) {
		if (buttons[i].label === name) found = true;
	}

	return found;
}

function methodInButtons(name, buttons){
// checks method name exist in aggregation buttons
// buttons are structured as array of objects with method, args, and name properties.
// arg is and array of two elements. This function cheks that name exists in the second element of args
	var iLimit = buttons.length;
	var found = false;

	for (var i = 0; i < iLimit; i++) {
		if (buttons[i].args[1] === name) found = true;
	}

	return found;	

	
}

// get position of method name in aggregation buttons
// buttons are structured as array of objects with method, args, and name properties.
// arg is and array of two elements. This function cheks that name exists in the second element of args
function getMethodLocationInButtonsFromArg(argValue,buttons){
	var iLimit = buttons.length;

	for (var i = 0; i < iLimit; i++) {
		if (buttons[i].args[1] === argValue) return i;
	}

	return false;	
	
}


// add item to button at the specified location (method either push, unshift or splice at index)
function addLabelToAggregationButtons( 	label, 	buttons, 	buttonMethod, 	buttonArgs, 	addMethod, 	addIndex ) {
	
	var newItem = {
		method: buttonMethod,
		args: buttonArgs,
		label: label
	};

	if (addMethod === "splice") {
		buttons.splice(addIndex, 0, newItem);
	} else {
		buttons[addMethod](newItem);
	}
}

//add buttons to buttons
function addButtonsToButtons(buttonsToBeAdded,baseButtons){
	var iLimit = buttonsToBeAdded.length;
	
	for(var i=0; i<iLimit; i++){
		baseButtons.push(buttonsToBeAdded[i]);
	}
	
}

function getLabelFromButtonsGivenArg(argValue, buttons){
	var iLimit = buttons.length;
	
	for(var i=0; i<iLimit; i++){
		if(typeof buttons[i].args !== "undefined"){
			if(typeof buttons[i].args[1]!=="undefined"){
				if(buttons[i].args[1]===argValue) {
					if(typeof buttons[i].label !== "undefined") return buttons[i].label;
				}
			}
		}
	}
	return "";
}





// 9. LAYOUT UPDATES

// move x axis range to accommodate new x axis domain

function updateXAxisRange(initialDate, endDate, minDateAsString, maxDateAsString, axisRange){
	
	if(minDateAsString === maxDateAsString){
		translateRange(initialDate,endDate, minDateAsString, maxDateAsString, "left", axisRange);
	}
	
	else if (initialDate >= minDateAsString && endDate <= maxDateAsString){
    axisRange[0]= initialDate;
    axisRange[1]= endDate;
  }
  else if (initialDate < minDateAsString && endDate > maxDateAsString){
    axisRange[0]=minDateAsString;
    axisRange[1]=maxDateAsString;
  }
  else if(initialDate < minDateAsString){
    translateRange(initialDate,endDate, minDateAsString, maxDateAsString, "right", axisRange);
  }
  else if(endDate > maxDateAsString){
    translateRange(initialDate,endDate, minDateAsString, maxDateAsString, "left", axisRange);
  }
  else{
    axisRange[0]=minDateAsString;
    axisRange[1]=maxDateAsString;
  }

	
}

function translateRange(initialDateAsString,endDateAsString, minDateAsString, maxDateAsString, translateTo, axisRange){
  var delta;
	var endPointDateAsString;
  
	// translate to the right
	if(translateTo === "right"){
    delta = new Date(minDateAsString).getTime() - new Date (initialDateAsString).getTime();
    endPointDateAsString = dateToString(new Date(new Date(endDateAsString).getTime()+delta));
    if(endPointDateAsString > maxDateAsString && minDateAsString !== maxDateAsString){
      axisRange[1]=maxDateAsString;
    } else{
      axisRange[1]=endPointDateAsString;
    }
      
		axisRange[0]=minDateAsString;
	} 
  
  // translate to the left
  else{
    
    delta = new Date(endDateAsString).getTime() - new Date (maxDateAsString).getTime();
    endPointDateAsString = dateToString(new Date(new Date(initialDateAsString).getTime()-delta));
    if(endPointDateAsString < minDateAsString && minDateAsString !== maxDateAsString){
      axisRange[0]=minDateAsString;
    } else{
      axisRange[0]=endPointDateAsString;
    }
      
		axisRange[1]=maxDateAsString;
	} 
  
}

					






// after determining y axis range, sets range in layout
function setYaxisLayoutRange(yAxisType, minMaxInitialY, layout, numberOfIntervalsInYAxis, 
			      possibleYTickMultiples, rangeProportion) {
	var yMinMax =[];
	
	yMinMax = getRoundedYAxisRange( minMaxInitialY[0], minMaxInitialY[1], 
				       yAxisType, numberOfIntervalsInYAxis, possibleYTickMultiples, rangeProportion);
	
	minMaxInitialY[1] = yMinMax[1];
	minMaxInitialY[0] = yMinMax[0];	
	//DEBUG && OTHER_DEBUGS && console.log("endY0", minMaxInitialY[0]);
	//DEBUG && OTHER_DEBUGS && console.log("endY1", minMaxInitialY[1]);
	
	if (yAxisType === "log") {
		minMaxInitialY[0] =
			Math.log(minMaxInitialY[0] <= 0 ? 0.0000001 : minMaxInitialY[0]) /
			Math.log(10);
		minMaxInitialY[1] =
			Math.log(minMaxInitialY[1] <= 0 ? 0.0000001 : minMaxInitialY[1]) /
			Math.log(10);
	}
	
	//DEBUG && OTHER_DEBUGS && console.log("resulting y range - y0",minMaxInitialY[0],"y1", minMaxInitialY[0]);
	//DEBUG && OTHER_DEBUGS && console.log("isNaN y0 y1",isNaN(minMaxInitialY[0]), isNaN(minMaxInitialY[0]));
	

	if(!isNaN(minMaxInitialY[0]) && !isNaN(minMaxInitialY[1] )){
		layout.yaxis.range = [minMaxInitialY[0], minMaxInitialY[1]];
		layout.yaxis.autorange = false; 
	} else{
		//layout.yaxis.autorange = true; 
	}


}

// sets the y axis range in the layout based on the y range for the available data array, 
//y values ovr the xaxis range.
function setYAxisRange(layout, data, numberOfIntervalsInYAxis,possibleYTickMultiples, rangeProportion) {

	// obtain y axis range for the displayed x range
	var minMaxInitialY = getYminYmax(
		layout.xaxis.range[0],
		layout.xaxis.range[1],
		data
	);

	// set y axis layout range
	setYaxisLayoutRange(layout.yaxis.type, minMaxInitialY, layout, 
			    numberOfIntervalsInYAxis,possibleYTickMultiples, rangeProportion);
}

// returns y axois layout range as a two element array
function returnYaxisLayoutRange(yAxisType, yMinValue, yMaxValue,numberOfIntervalsInYAxis, 
				 possibleYTickMultiples, rangeProportion) {
	var yaxisRange = [];
	var yMinMax =[];
	
	yMinMax = getRoundedYAxisRange(yMinValue, yMaxValue, yAxisType, numberOfIntervalsInYAxis, 
				       possibleYTickMultiples, rangeProportion);
	

	yMaxValue = yMinMax[1];
	yMinValue = yMinMax[0];
	//DEBUG && OTHER_DEBUGS && console.log("endY0", yMinValue);
	//DEBUG && OTHER_DEBUGS && console.log("endY1", yMaxValue);
	
	if (yAxisType === "log") {
		yaxisRange.push(
			Math.log(yMinValue <= 0 ? 0.0000001 : yMinValue) / Math.log(10)
		);
		yaxisRange.push(Math.log(yMaxValue) / Math.log(10));
	} else {
		yaxisRange.push(yMinValue);
		yaxisRange.push(yMaxValue);
	}

	return yaxisRange;
}

// set right and left margin defaults
function setLeftRightMarginDefault(
	layout,
	defaultLeftMargin,
	defaultRightMargin
) {
	if (typeof layout.margin === "undefined") {
		layout.margin = {};
	}

	if (typeof layout.margin.l === "undefined") {
		layout.margin.l = defaultLeftMargin;
	}

	if (typeof layout.margin.r === "undefined") {
		layout.margin.r = defaultRightMargin;
	}
}
	 
	 
	 

// 10. TRANSFORM TO UNIQUE BASE

// function to transforM data for comparison option, sets all traces values
// to 1 at baseIndexDate. Data contains, x and y arrays.
function transformDataToBaseIndex(data, baseIndexDate, currentAggregation) {
	var jBase, j, iLimit, jLimit, DateTemp = new Date();
	var baseIndexDateAsDate = new Date(baseIndexDate);
	var divider = 0.0;
	

	iLimit = data.length;
	for (var i = 0; i < iLimit; i++) {
		jBase = 0;
		jLimit = data[i].x.length;
		for (j = 0; j < jLimit; j++) {
			DateTemp = new Date(data[i].x[j]);
			if (DateTemp >= baseIndexDateAsDate) {
				jBase = j;
			}
			else{
				j=jLimit;
			}
		}
		

		if(currentAggregation === "change"){
			divider = data[i].yOriginal[jBase];			
		}
		else{
			divider = data[i].y[jBase];			
		}

		//DEBUG && OTHER_DEBUGS && console.log('baseIndexDate',baseIndexDate, 'found x date:',data[i].x[jBase]);
		//DEBUG && OTHER_DEBUGS && console.log(divider);
		jLimit = data[i].y.length;
		for (j = 0; j < jLimit; j++) {
			data[i].y[j] = data[i].y[j] / divider;
		}
	}
}





function prepareTransformToBaseIndex(
	uncomparedSaved,
	data,
	baseIndexDate,
	allowCompare,
	layout,
	currentAggregation
) {
	// save uncompared data
	if (uncomparedSaved === false) {
		saveDataXYIntoProperty(data, "uncompared");
		uncomparedSaved = true;
	}

	transformDataToBaseIndex(data, baseIndexDate, currentAggregation);


	return uncomparedSaved;
}

	 
	 
// 11 Utility Functions

// rounds number to next multiple
function getNextMultiple(number, multiple){
  if(number % multiple){
    if (number < 0){
     //DEBUG && OTHER_DEBUGS && console.log(number % multiple);
     number = number - number % multiple;       
    }
    else{
     number = number + (multiple - number % multiple);       
    }
    return number;
  }
  else
    return number;
}

// rounds number to prior multiple
function getPriorMultiple(number, multiple){
  if(number % multiple){
    if (number < 0){
     //DEBUG && OTHER_DEBUGS && console.log(number % multiple);
     number = number - (multiple + number % multiple);       
    }
    else{
     number = number  -  number % multiple;       
    }
    return number;
  }
  else
    return number;
}

function getTickStep(number, possibleYTickMultiples){
	var scientificString = 	number.toExponential();
	var splitScientificString = scientificString.split("e");
	var iLimit = possibleYTickMultiples.length;

	var minSpread = 1000.0;
	var tickStep = 0.0;
	for (var i=0; i<iLimit; i++){
		if(Math.abs(Number(splitScientificString[0])-possibleYTickMultiples[i]) < minSpread){
			minSpread = Math.abs(Number(splitScientificString[0])-possibleYTickMultiples[i]);
			tickStep = possibleYTickMultiples[i];
		}
	}	
	return tickStep*Math.pow(10, Number(splitScientificString[1]));
}


function getRoundedYAxisRange(yMin, yMax, yAxisType, numberOfIntervalsInYAxis, 
			       possibleYTickMultiples, rangeProportion){
  var yMinMax = [];
  var yMaxLin = 0.0, yMinLin=0.0;
  var yMinLog = 0.0, yMaxLog =0.0;
  var yInterval=0.0, yLogInterval = 0.0;

	
  if(yAxisType === "linear"){
    yInterval = Number(yMax)-Number(yMin);
    yInterval = yInterval * (1-Number(rangeProportion))/Number(rangeProportion)/2;
    if(yMin > 0){
      yMinLin = yInterval > yMin ? 0.0 : yMin-yInterval;
    } else{
      yMinLin = yMin-yInterval;
    }
    yMaxLin = yMax + yInterval;
    yMinMax.push(yMinLin);
    yMinMax.push(yMaxLin);
  }
  
  if(yAxisType ==="log"){
		
    yLogInterval = Math.log10(Number(yMax))-Math.log10(Number(yMin));
    yLogInterval = yLogInterval * (1-Number(rangeProportion))/Number(rangeProportion)/2;
    yMinLog = Math.log10(Number(yMin))-yLogInterval;
    yMaxLog = Math.log10(Number(yMax))+yLogInterval;
    yMinLog = Math.pow(10,yMinLog);
    yMaxLog = Math.pow(10,yMaxLog);
    
    yMinMax.push(yMinLog);
    yMinMax.push(yMaxLog);
  }
  
  return yMinMax;
}



 
  function  splitIntoScientificComponentsAsNumber(yMin){
    var splitScientificComponent =[];
    
    splitScientificComponent = yMin.toExponential().split("e");
    splitScientificComponent[0] = Number(splitScientificComponent[0]);
    splitScientificComponent[1] = Number(splitScientificComponent[1]);     
    
    return splitScientificComponent;
    
  }




function propertyInObject(property, object) {
	var found = false;

	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			if (key === property) found = true;
		}
	}

	return found;
}
	 
	 

// return a string with at least lenght characters
function fillStringUpTo(baseString, stringLengthInPixels, fontFamily, fontSize, canvas){
	var newString= baseString;
	
		// measure length of displayed string  in pixels
		function stringLength(string, fontFamily, fontSize, canvas) {
			//var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');

			ctx.font = ''+fontSize+'px '+fontFamily;

			return ctx.measureText(string).width;
			
		}
	
		for (var i=0; ; i++){
			
			if (stringLength(newString+" ", fontFamily, fontSize, canvas) > stringLengthInPixels){
				return newString;
			}
			newString += " ";
			
		}
	
}



function addNameToArray(name, array, method) {
	var iLimit = array.length;
	var found = false;

	method = typeof method === "undefined" ? "push" : method;

	for (var i = 0; i < iLimit; i++) {
		if (array[i] === name) found = true;
	}

	if (!found) {
		array[method](name);
	}
}

function nameIsOnArrayOfNames(name, array){
	var iLimit = array.length;

	for (var i = 0; i < iLimit; i++) {
		if (array[i] === name) return true;
	}

	return false;
	
}


// set rangeselector button active

function activeRangeSelector(property,propertyValue,rangeselectorButtons){
	var iLimit = rangeselectorButtons.length;
	
	for (var i=0; i<iLimit; i++){
		if(typeof rangeselectorButtons[i][property]!== "undefined"){
			if(rangeselectorButtons[i][property]=== propertyValue){
				rangeselectorButtons[i].active = true;
				i = iLimit;
			}
		}
	}
}




//set style properties to element
function setElementStyle(element,styling){
	
	//DEBUG && OTHER_DEBUGS && console.log(element);
	//DEBUG && OTHER_DEBUGS && console.log(styling);
	
	for(var key in styling){
		if(styling.hasOwnProperty(key)) {
			element.style[key]=styling[key];
		}
	}
	
}
	 
	 
// Remove Double-click to zoom back out message
// this removes the message displayed after an area in the chart is selected.
function removeDoubleClickToZoomBackOut() {
	
	var newStyle = document.createElement("style");
	newStyle.type = "text/css";
	newStyle.innerHTML = "div.plotly-notifier { visibility: hidden; }";
	document.getElementsByTagName('head')[0].appendChild(newStyle);
	
}


// function for creating elements
	function createElement(elementType, elementID, elementText, elementStyle){
		var element;
		
		element = document.createElement(elementType);
		if(typeof elementText !== "undefined"){
			element.appendChild(document.createTextNode(elementText));			
		}	
		if(typeof elementID !== "undefined"){
			element.id = elementID;			
		}
		if(typeof elementStyle !== "undefined"){
			setElementStyle(element,elementStyle);			
		}
		
		return element;
		
	}	


function createButtonHTML(buttonID, buttonLabel){
	
	var HTMLString = 
			'<button id="'+buttonID+'" >'+buttonLabel+'</button>';
	
	return HTMLString;

}


function changeLogLinearToOriginal(layout, originalLayout, divInfo, settings){
	
	if(layout.yaxis.type !== originalLayout.yaxis.type){
		//DEBUG && OTHER_DEBUGS && console.log("change y axis type to original");
		//DEBUG && OTHER_DEBUGS && console.log("current yaxis type", layout.yaxis.type);
		//DEBUG && OTHER_DEBUGS && console.log("original yaxis type", originalLayout.yaxis.type);
		//DEBUG && OTHER_DEBUGS && console.log("settings.allowLogLinear", settings.allowLogLinear);
		layout.yaxis.type = originalLayout.yaxis.type;
		
		toggleLogLinearButton(layout.yaxis.type === "log" ? true : false, 
					divInfo.logLinearButtonElement);


	}
}




function numberExPx(numberPlusPx){
	var myNumber = numberPlusPx.replace("px","");
	
	return Number(myNumber);
	
}	
		
function buttonOnHover(x, backgroundColor, color) {
	
		$(x).css("background-color", backgroundColor);
		$(x).css("color",color);
		
}		
		




// inserts a frequency in the possition as per ordered list, both are arrays of strings
function insertDesiredFrequency(frequency, desiredFrequencies, orderedPossibleFrequencies){
	var newDesiredFrequencies =[];
	var iLimit = orderedPossibleFrequencies.length;
	var jLimit = desiredFrequencies.length;
	var j=0;
	var currentFrequency = "";
	
	
	for (var i=0; i<iLimit; i++){
		currentFrequency = orderedPossibleFrequencies[i];
		if(currentFrequency=== frequency){
			newDesiredFrequencies.push(currentFrequency);
			
		}
		else {
			
			for(j=0; j<jLimit; j++){
				if(desiredFrequencies[j]===currentFrequency){
					newDesiredFrequencies.push(currentFrequency);
					
				}
				
			}		
					
		}
		
	}
	
	return newDesiredFrequencies;
	
	
}


// Set periodKeys based on desiredFrequencies	
function setPeriodKeysBasedOnDesiredFrequencies(periodKeys, desiredFrequencies, periodDictionary){
	var iLimit =0;
	var key = "";

	for(key in periodKeys){
		if (periodKeys.hasOwnProperty(key)) {
			periodKeys[key]=false;
		}
	}


	iLimit = desiredFrequencies.length;
	for(var i =0; i<iLimit; i++){
		key = desiredFrequencies[i];
		if(typeof periodDictionary[key] !== "undefined"){
			periodKeys[periodDictionary[key]]=true;
		}
	}

}	



//12 CSV FILE AND CONVERSION
function convertDataToCSV(xName, data) {
  var str = "", 
      line = "",
      cr ="\r\n";
  var endOfAllSeries = true;
  
  var iLimit = data.length;
  var j=0;
  
  for (var i = 0; i < iLimit; i++){
    if(line!==""){
      line+=",";
    }
    line+= ""+xName+","+data[i].name;
  }
  line+=cr;
  
  str+=line;
  
 
  j=0;
  
  do {
    
    endOfAllSeries = true;
    
    for (i = 0; i < iLimit; i++) {
      if(typeof data[i].x[j]!=="undefined"){
        endOfAllSeries = false;
      }
    }
    
    line = "";
    
    if(!endOfAllSeries){
      for (i = 0; i < iLimit; i++){
        if(typeof data[i].x[j]!=="undefined"){
          if(line!==""){
            line+=",";
          }
          line+= data[i].x[j]+","+data[i].y[j];
        }
        else{
          if(line!==""){
            line+=",";
          }
          line+= ""+","+"";          
        }
      }
      str += line + cr;
    }
    
    j+=1;
      
  }while(!endOfAllSeries);
  

  
  return str;
}






function downloadCSVData(xName, data, fileTitle) {
  
  var csv = convertDataToCSV(xName, data);

  var exportedFileName = (fileTitle || "export") + ".csv";

  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, exportedFileName);
  } else {
    var link = document.createElement("a");
    if (link.download !== "undefined") {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", exportedFileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

}





//13  REAL / NOMINAL CONVERSION FUNCTIONS

function getIDeflactor(otherDataProperties){
	var iLimit = otherDataProperties.length;
	var iDeflactor = -1;
	// get index of deflactor serie
	for(var i=0; i<iLimit; i++){
		if(typeof otherDataProperties[i].deflactor !== "undefined"){
			if(otherDataProperties[i].deflactor){
				iDeflactor = i;
				i= iLimit;
			}
		}
	}
	
	return iDeflactor;
}



function createIndexMap(data, deflactorDictionary, periodKeys, iDeflactor){
	var j=0, jLimit = 0, k=0;
	var iLimit = data.length;
	var date ="", key="";
	
	
	// deflactor not found, return false
	if(iDeflactor === -1){
			return false;
	}

	k=0;
	// loop over data[i]
	for(var i=0; i<iLimit; i++){
		
		// check that xOriginal exists
		if(typeof data[i].xOriginal !== "undefined"){
			jLimit = data[i].xOriginal.length;

			// cycle through each trace point
			for(j=0; j < jLimit; j++){

				date=data[i].xOriginal[j];
				if(typeof deflactorDictionary[date] ==="undefined"){
					k=setDeflactorDictionaryAtDate(date, deflactorDictionary, data[iDeflactor], k);
				}
			}
		}
		
		// cycle through frequencies
		for(key in periodKeys){
			if (periodKeys.hasOwnProperty(key)) {
				if(periodKeys[key]=== true &&
				  typeof data[i][key] !== "undefined"){
					jLimit = data[i][key].x.length;
					for(j=0; j < jLimit;j++){	
						date=data[i][key].x[j];
						if(typeof deflactorDictionary[date] ==="undefined"){
							k=setDeflactorDictionaryAtDate(date, deflactorDictionary,
										       data[iDeflactor], k);
						}					
					}	
				}	
			}
		}
	}
	
	return true;
}

function setDeflactorDictionaryAtDate(date, deflactorDictionary, deflactorData, k){
	var dateAsDate = new Date(date);
	var dateX0AsDate = new Date();
	var dateX1AsDate = new Date();
	var iLimit = deflactorData.x.length;
	var cycle = 1;
	var i=0;
	var y0 = 0.0, y1 = 0.0;
	
	if(k > iLimit){
		k=0;
	}

	
	// case 0, date earlier than first index date
	if(dateAsDate <= (dateX0AsDate = new Date(deflactorData.xOriginal[iLimit-1]))){

		dateX1AsDate = new Date(deflactorData.xOriginal[iLimit-2]);
		y0 = deflactorData.yOriginal[iLimit-1];
		y1 = deflactorData.yOriginal[iLimit-2];		
		deflactorDictionary[date]=calculateIndexAtDate(dateAsDate, dateX0AsDate, dateX1AsDate, y0, y1); 
		
	}
	
	// case n, date later than last index date
	else if (dateAsDate >= (dateX1AsDate = new Date(deflactorData.xOriginal[0]))){

			dateX0AsDate = new Date(deflactorData.xOriginal[1]);
			y0 = deflactorData.yOriginal[1];
			y1 = deflactorData.yOriginal[0];	
			deflactorDictionary[date]=calculateIndexAtDate(dateAsDate, dateX0AsDate, dateX1AsDate, y0, y1); 
		}

	// case cycle
	else {
		if (dateAsDate >= new Date(deflactorData.x[k])){
			cycle= -1;
		} else{
			cycle = 1;
		}

		i=k;
		while ( i < iLimit && i > -1){

			// case is in between
			if((dateAsDate >= new Date(deflactorData.xOriginal[k+1])) &&
				 (	dateAsDate <= new Date(deflactorData.xOriginal[k]))){
				dateX0AsDate = new Date(deflactorData.xOriginal[k+1]);
				dateX1AsDate = new Date(deflactorData.xOriginal[k]);	
				y0 = deflactorData.yOriginal[k+1];
				y1 = deflactorData.yOriginal[k];	
				deflactorDictionary[date]=
					calculateIndexAtDate(dateAsDate, dateX0AsDate, dateX1AsDate, y0, y1); 

				i=iLimit;
			} else{
				i+= cycle;
				k=i;
			}
		}

	}	

	return k;
}

//var newFlaw =0;

function calculateIndexAtDate(dateAsDate, dateX0AsDate, dateX1AsDate,  y0, y1){
	

	return Number(y0)*Math.pow((y1/y0), 
				(dateAsDate.getTime()-dateX0AsDate.getTime())/
				(dateX1AsDate.getTime() - dateX0AsDate.getTime())
				);
}


// determine base date
/* base real date could be "end of range", "end of domain", "beggining of range", beggining of domain",
or a date "yyyy-mm-dd hh:mm:ss.sss-04:00"*/
function setBaseRealNominalDateAsString(baseRealDate,
		rangeX0AsString,
		rangeX1AsString,
		domainX0AsString,
		domainX1AsString) {
	
	DEBUG && OTHER_DEBUGS && console.log("in set base real/nominal date");
	DEBUG && OTHER_DEBUGS && console.log("baseRealDate:" , baseRealDate);
	DEBUG && OTHER_DEBUGS && console.log("rangeX0:" , rangeX0AsString, "rangeX1" , rangeX1AsString);
	DEBUG && OTHER_DEBUGS && console.log("domainX0:" , domainX0AsString, "domainX1" , domainX1AsString);
	
	if(baseRealDate === "end of range"){
		 return rangeX1AsString;
	}
	else if(baseRealDate === "beggining of range"){
		return rangeX0AsString;
	}
	else if(baseRealDate === "end of domain"){
		return domainX1AsString;
	}
	else if(baseRealDate === "beggining of domain"){
		return domainX0AsString;
	}
	else if (Object.prototype.toString.call(new Date(baseRealDate)) === "[object Date]" ) {
		// it is a date ?
		if ( isNaN( (new Date(baseRealDate)).getTime() ) ) {  // d.valueOf() could also work
			// baseRealDate date is not valid, return default
			return domainX1AsString;
		}
		else {
			// baseReadDate date is valid
			DEBUG && OTHER_DEBUGS && console.log("baseRealDate returned as valied");
			return baseRealDate;
		}
	}
	else {
		// baseRealDate not a date, return default
		return domainX1AsString;
	}

	
}



function prepareTransformToReal(
	nominalSaved,
	data,
	deflactorDictionary,
	baseRealNominalDate,
	otherDataProperties
) {
	// save uncompared data
	if (!nominalSaved) {
		saveDataXYIntoProperty(data, "nominal");
		nominalSaved = true;
	}

	transformDataToReal(data, deflactorDictionary, 	baseRealNominalDate, otherDataProperties);

	return nominalSaved;
}



function transformDataToReal(data, deflactorDictionary, baseRealNominalDate, otherDataProperties) {
	var j, iLimit, jLimit;
	
	DEBUG && OTHER_DEBUGS && console.log("baseRealNominalDate: ", baseRealNominalDate);
	
	var base = Number(deflactorDictionary[baseRealNominalDate]);
	
	DEBUG && OTHER_DEBUGS && console.log("in transformDataToReal");
	DEBUG && OTHER_DEBUGS && console.log("base: ", base);
	DEBUG && OTHER_DEBUGS && console.log("deflactorDictionary: ", deflactorDictionary);
	
	iLimit = data.length;
	for (var i = 0; i < iLimit; i++) {
		if(otherDataProperties[i].toggleRealNominal){
			jLimit = data[i].y.length;
			for (j = 0; j < jLimit; j++) {
				data[i].y[j] = base*data[i].y[j]/Number(deflactorDictionary[data[i].x[j]]);
			}
		}
	}
	DEBUG && OTHER_DEBUGS && console.log("data after transform to real: ", data);
	
}




//14 Test http or https
function connectionIsSecure(){

	function testWith(someObject) {	
		if(typeof someObject !== "undefined"){
			if(someObject !== location){
				if(typeof someObject.location !== "undefined"){
					if(typeof someObject.location.protocol !== "undefined"){
						return someObject.location.protocol;
					}
				}			
			} else{
				if(typeof someObject !== "undefined"){
					if(typeof someObject.protocol !== "undefined"){
						return someObject.protocol;
					}
				}
			}
		}
		return false;
	}
	
	var testObjects = [document, window, location];
	
	var protocol;
	for (var i=0; i < testObjects.length; i++){
 		protocol = testWith(testObjects[i]);
		//console.log("object=", testObjects[i]);
		//console.log("protocol=", protocol);
		if(protocol) return "https:" === protocol;	
	}

  return false; 
			 
}





	aoPlotlyAddOn.findDateFromTodayAsString = findDateFromTodayAsString;
	//aoPlotlyAddOn.findSpliceInfo = findSpliceInfo;       
	//aoPlotlyAddOn.processCsvData = processCsvData; 

  
      
    // end section of library declaration  
      
     return aoPlotlyAddOn;
    }
  
    //define globally if it doesn't already exist
    if(typeof(aoPlotlyAddOn) === 'undefined'){
        window.aoPlotlyAddOn = defineLibrary();
    }
    else{
        DEBUG && OTHER_DEBUGS && console.log("aoPlotlyAddOn Library already defined.");
    }  
  
})(window);
