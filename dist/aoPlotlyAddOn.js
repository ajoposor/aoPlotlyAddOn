(function(window){
    
//I recommend this
 'use strict';
 function defineLibrary(){
  
 var aoPlotlyAddOn = {};    

// set DEBUG option (for display of console.log messages)
// console.log will also be removed with closure compiler	 
var DEBUG = true;
	 

    
       
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
	

		
	// test arguments are passed complete	
	if (arguments.length < 3) {
		return "incomplete arguments";
	}	
		
		
		
 	// SET divInfo
		
	var wholeDivInitialStyling = {
		visibility:"hidden",
		opacity: 1
	};
	
	var loaderInitialStyling = {
		visibility: "visible",
		position: "fixed",
		left: "0px",
		top: "0px",
		width: "100%",
		height: "100%",
		background: "url('https://raw.githubusercontent.com/ajoposor/Images/master/files/loader_big_blue.gif') 50% 50% no-repeat #FFFFFF",
		opacity: 1	
	};
	
	loaderInitialStyling["z-index"] = "9999";
		
			
	//give a name to the loader
		
	divInfo.loaderID = "loader_"+divInfo.wholeDivID;
	
	divInfo.wholeDivElement = document.getElementById(divInfo.wholeDivID);	
	divInfo.loaderElement = document.createElement('div');
	divInfo.loaderElement.id = divInfo.loaderID;
	divInfo.wholeDivElement.insertBefore(
	divInfo.loaderElement, 
	divInfo.wholeDivElement.firstChild);	

		
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
		
		
		
		
	var settingsDefaults = {
		// display shaded area during recession periods
		displayRecessions: true,
		// recession fill color and opacity
		recessionsFillColor: "#000000",
		recessionsOpacity: 0.15,
		// url should return a zip file as provided by fred api for the USRECP serie for dates after 2015, set to "" in parameters passed
		// to disable trying to get zip file with update values.
		newRecessionsUrl: "http://www.kapitalvalue.com/plots_data/testing/fredRecessions-unlocked.php?observation_start=2015-12-01",
		queueConcurrencyLimit: 10,
		allowCompare: false,
		transformToBaseIndex: false, //series would be transformed to common value of 1 at beginning
		allowFrequencyResampling: false, // includes buttons to allow for calculation of aggregation and methods (monthly, quarterly), close, average, etc.
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
		pressedButtonHoverDefaultStyle: pressedButtonHoverDefaultStyle
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
		
	setElementStyle(divInfo.wholeDivElement, wholeDivInitialStyling);
	//DEBUG && console.log(divInfo.plotDivElement);
		
	
	// create children divs in plot

	// create child to home the plot
	divInfo.plotlyDivID = divInfo.plotDivID+"_plotly";	
	divInfo.plotlyDivElement = 
		createElement("div", divInfo.plotlyDivID);	
			
	divInfo.plotDivElement.appendChild(divInfo.plotlyDivElement);
	//DEBUG && console.log("plotlyDivElement",divInfo.plotlyDivElement);
		
	
	// create footer div in case required to home buttons
	if(settings.allowCompare || settings.allowLogLinear || settings.allowDownload || settings.allowRealNominal){
		divInfo.footerDivID = divInfo.plotDivID+"_plotlyFooter";
		divInfo.footerDivElement = 
			createElement("div", divInfo.footerDivID);			
		//element = document.createElement("div");
		//element.id = divInfo.footerDivID;
		divInfo.plotDivElement.appendChild(divInfo.footerDivElement);
		divInfo.footerDivElement.style["background-color"] = layout.paper_bgcolor;	
		
		//divInfo.footerDivElement = document.getElementById(divInfo.footerDivID);
		//DEBUG && console.log("footerDivElement",divInfo.footerDivElement);	
		
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
					'<img src="https://raw.githubusercontent.com/ajoposor/Images/master/files/Download_Arrow_10_Dark.png" />';
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
		isTouchTimer = setTimeout(function(){isTouch = false;}, 500);
				//maintain "istouch" state for 500ms so removetouchclass doesn't get fired immediately following a touch event
	}
     
	function removetouchclass(e){
		if (!isTouch && curRootClass === "can-touch"){ //remove 'can-touch' class if not triggered by a touch event and class is present
		    isTouch = false;
		    curRootClass = "";
		    document.documentElement.classList.remove("can-touch");
							settings.pressedButtonHoverDefaultStyle["background-color"]=
								settings.pressedButtonHoverDefaultStyle["mouse-background-color"];
		}
	}
     
	document.addEventListener("touchstart", addtouchclass, false); //this event only gets called when input type is touch
	document.addEventListener("mouseover", removetouchclass, false); //this event gets called when input type is everything from touch to mouse/ trackpad

		
		
		
		
		
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
		
		//DEBUG && console.log('max char',settings.maxNumberOfCharactersInFrequencyButton);
		//DEBUG && console.log('settings', settings);
		//DEBUG && console.log('baseFrequency', settings.series.baseFrequency);
		
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
			//DEBUG && console.log("case 2a frequency update menu", frequencyUpdateMenu);
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
				
				if(settings.series.baseAggregation.length > settings.maxNumberOfCharactersInAggregationButton){
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
			//DEBUG && console.log("case 2b frequency update menu", frequencyUpdateMenu);
			
		}
	
	}
		
	//2.c frequency not normal, aggregation custom or normal
	if(settings.series.baseFrequencyType !== "normal"){
		if(settings.series.baseAggregationType !== "not available"){

			if(settings.series.baseAggregationType === "custom"){

				settings.series.baseAggregation = settings.series.baseAggregation;

				if(settings.series.baseAggregation.length > settings.maxNumberOfCharactersInAggregationButton){
					
					settings.series.baseAggregationLabel = 
					settings.series.baseAggregation.substring(
						0,settings.maxNumberOfCharactersInAggregationButton-1)+'.';
					
				}
				else {
					
					settings.series.baseAggregationLabel = settings.series.baseAggregation;
						
				}

				//DEBUG && console.log("trimmed aggregation label", settings.series.baseAggregationLabel);
				settings.series.customAggregation = true;
				singleAggregationButton[0].label = 
						fillStringUpTo(
							settings.series.baseAggregationLabel, 
							settings.singleButtonStringLengthInPixels,
							frequencyUpdateMenu[1].font.family,
							frequencyUpdateMenu[1].font.size
						);
				singleAggregationButton[0].args[1] = settings.series.baseAggregation;				
				
			}
			
			// aggregation normal.
			else {
				
				settings.series.baseAggregationLabel = 
					getLabelFromButtonsGivenArg(settings.series.baseAggregation, baseAggregationButtons);
				
				settings.series.customAggregation = false;	
				singleAggregationButton[0].label = 
							fillStringUpTo(
							settings.series.baseAggregationLabel, 
							settings.singleButtonStringLengthInPixels,
							frequencyUpdateMenu[1].font.family,
							frequencyUpdateMenu[1].font.size
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
			settings.series.baseAggregationLabel = getLabelFromButtonsGivenArg(settings.series.baseAggregation, baseAggregationButtons);
			settings.series.customAggregation = false;
			frequencyUpdateMenu[1].buttons = baseAggregationButtons;
			frequencyUpdateMenu[1].visible = true;
			frequencyUpdateMenu[1].type = "dropdown";
			frequencyUpdateMenu[1].active = 
				getMethodLocationInButtonsFromArg(
					settings.series.baseAggregation,
					baseAggregationButtons
				);
			//DEBUG && console.log("case 2d frequency update menu", frequencyUpdateMenu);
		
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
	
	/*
	var usRecessions = [
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1857-06-01",
			y0: 0,
			x1: "1858-12-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1860-10-01",
			y0: 0,
			x1: "1861-06-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1865-04-01",
			y0: 0,
			x1: "1867-12-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1869-06-01",
			y0: 0,
			x1: "1870-12-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1873-10-01",
			y0: 0,
			x1: "1879-03-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1882-03-01",
			y0: 0,
			x1: "1885-05-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1887-03-01",
			y0: 0,
			x1: "1888-04-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1890-07-01",
			y0: 0,
			x1: "1891-05-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1893-01-01",
			y0: 0,
			x1: "1894-06-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1895-12-01",
			y0: 0,
			x1: "1897-06-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1899-06-01",
			y0: 0,
			x1: "1900-12-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1902-09-01",
			y0: 0,
			x1: "1904-08-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1907-05-01",
			y0: 0,
			x1: "1908-06-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		// 2nd highlight during Feb 20 - Feb 23
		{
			type: "rect",
			xref: "x",
			yref: "paper",
			x0: "1910-01-01",
			y0: 0,
			x1: "1912-01-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1913-01-01",
			y0: 0,
			x1: "1914-12-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1918-08-01",
			y0: 0,
			x1: "1919-03-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1920-01-01",
			y0: 0,
			x1: "1921-07-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1923-05-01",
			y0: 0,
			x1: "1924-07-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1926-10-01",
			y0: 0,
			x1: "1927-11-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1929-08-01",
			y0: 0,
			x1: "1933-03-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1937-05-01",
			y0: 0,
			x1: "1938-06-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1945-02-01",
			y0: 0,
			x1: "1945-10-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1948-11-01",
			y0: 0,
			x1: "1949-10-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1953-07-01",
			y0: 0,
			x1: "1954-05-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1957-08-01",
			y0: 0,
			x1: "1958-04-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1960-04-01",
			y0: 0,
			x1: "1961-02-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1969-12-01",
			y0: 0,
			x1: "1970-11-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1973-11-01",
			y0: 0,
			x1: "1975-03-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1980-01-01",
			y0: 0,
			x1: "1980-07-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1981-07-01",
			y0: 0,
			x1: "1982-11-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "1990-07-01",
			y0: 0,
			x1: "1991-03-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "2001-03-01",
			y0: 0,
			x1: "2001-11-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		},
		{
			type: "rect",
			// x-reference is assigned to the x-values
			xref: "x",
			// y-reference is assigned to the plot paper [0,1]
			yref: "paper",
			x0: "2007-12-01",
			y0: 0,
			x1: "2009-06-01",
			y1: 1,
			fillcolor: "#000000",
			opacity: 0.15,
			line: {
				width: 0
			}
		}
	];*/
	

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
			active: settings.yaxisInitialScale === "linear" ? 0 : 1, // which button is active, from the array elements
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
		selectorOptions: typeof layout.xaxis.rangeselector === "undefined"? selectorOptionsDefaults : layout.xaxis.rangeselector,
		frequencyUpdateMenu: frequencyUpdateMenu,
		logLinearUpdateMenu: logLinearUpdateMenu,
		compareUpdateMenu: compareUpdateMenu,
		layout: layout,
		options: options
	};

	/*
	//Call Read and Make Chart Function
	readDataAndMakeChart(data, iS, passedParameters, function(message) {
		DEBUG && console.log(message);
	});*/
	
	parallelReadDataAndMakeChart(data, passedParameters);
	
	
}; // END OF newTimeseriesPlot FUNCTION

	 
	 
	 


// FUNCTION TO READ DATA AND THEN MAKE CHART - LOADS IN SERIES
function readDataAndMakeChart(data, iS, param, callback) {
	
	
	// first all files are to be read, in a recursive way, with iS < series.length

	if (iS.value < param.dataSources.length) {
		readData(data, iS, param, callback);
	} 
	
	else {
		// once all files all read, i.e. iS === series.length, this section is executed
		DEBUG && console.log("data: ", data);
		DEBUG && console.log("param: ", param);
		
		makeChart(data, param);
		callback("all read and plotted");
	
	} // end of else after all read section
} //  end of readDataAndMakeChart    
	    

	 
	 
// FUNCTION TO READ DATA AND THEN MAKE CHART - LOADS IN PARALLEL
function parallelReadDataAndMakeChart(data, param) {
	
	// set function to local variable
	var localParallelReadData = parallelReadData;
	
	// define queue and set concurrenty
	DEBUG && console.log("queueConcurrencyLimit: ", param.settings.queueConcurrencyLimit);
	var plotQueue = d3.queue(param.settings.queueConcurrencyLimit);
	
	
	// add read data from dataSources to queue 
	var iLimit =param.dataSources.length;
	
	for(var i=0; i < iLimit; i++){
		DEBUG && console.log("add call parallelReadData to defer: ",i);
		plotQueue.defer(localParallelReadData, data, i, param );
	}
	
	
	// add call update recessions from external source to queue
	DEBUG && console.log("adding update recessions to queue");
	DEBUG && console.log("param.settings.newRecessionsUrl",param.settings.newRecessionsUrl);
	DEBUG && console.log("param.usRecessions",param.usRecessions);
	
	plotQueue.defer(parallelUpdateRecessions, param.settings.newRecessionsUrl, param.usRecessions);
	
	plotQueue.awaitAll(function(error){
		
		if(error){
			DEBUG && console.log("plotQueu await threw error", error);	
			//display blank plot
		} else {
			// once all files all read, i.e. iS === series.length, this section is executed
			DEBUG && console.log("data: ", data);
			DEBUG && console.log("param: ", param);	
			makeChart(data, param);
			DEBUG && console.log("allread and ploted");
			
		}
		
	});
	/*
	// first all files are to be read, in a recursive way, with iS < series.length

	if (iS.value < param.dataSources.length) {
		readData(data, iS, param, callback);
	} 
	
	else {
		// once all files all read, i.e. iS === series.length, this section is executed
		DEBUG && console.log("data: ", data);
		DEBUG && console.log("param: ", param);
		
		makeChart(data, param);
		callback("all read and plotted");
	
	} // end of else after all read section*/
} //  end of readDataAndMakeChart    	 
	 
	
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
	
	DEBUG && console.log("XMLHttpRequestOptions", fredZipXMLHttpRequestOptions);
	
	if(fredZipXMLHttpRequestOptions.url !== ""){
		
		function myCallBackFredZip(usRecessions){
			return function (error, xhttp) {
				afterFredZipFileLoaded(error, xhttp, usRecessions).then(function(){return callback(null);});
				
			};
		}
		
		
		var fredZipQueue = d3.queue();
		DEBUG && console.log("calling directXMLHttpRequest");
		fredZipQueue.defer( directXMLHttpRequest, fredZipXMLHttpRequestOptions,  myCallBackFredZip(usRecessions));
		//}(fredZipXMLHttpRequestOptions, myCallBackFredZip(usRecessions)); 
		fredZipQueue.await(function(error){
			callback(error);
		});
	}			
			
}
	
/*	 
function updateRecessions(newRecessionsUrl, usRecessions){

	// this function will get a zip file and update the usRecessions
	// in an async manner. This assumes the variable will be updated 
	// before plotly is called
	var fredZipXMLHttpRequestOptions = {
		responseType: "arraybuffer",
		method: "GET",
		async: true,
		url: settings.newRecessionsUrl,
	};
	
	DEBUG && console.log("XMLHttpRequestOptions", fredZipXMLHttpRequestOptions);
	
	if(fredZipXMLHttpRequestOptions.url !== ""){
		
		function myCallBackFredZip(usRecessions){
			return function (error, xhttp) {
				afterFredZipFileLoaded(error, xhttp, usRecessions);
			};
		}

		directXMLHttpRequest(fredZipXMLHttpRequestOptions, myCallBackFredZip(usRecessions)); 
	}			
			
}			
*/			
	 
/**
*
* readData section
*
*
*/
	 
	 
function readData(data, iS, param, callback) {
	
	var urlType = param.dataSources[iS.value].urlType;
	var url = param.dataSources[iS.value].url;
	
	if (urlType === "csv") {
		Plotly.d3.csv(url, function(readData) {
			DEBUG && console.log("csv", iS.value);
			DEBUG && console.log("readData", readData);
			/*if(iS.value ===0){
				for(var y=0; y<readData.length; y++){
					DEBUG && console.log(readData[y]);
				}
			}*/
			processCsvData(
				readData, 
				data,
				param.timeInfo.tracesInitialDate,
				param.otherDataProperties,
				param.dataSources[iS.value]
				);
			DEBUG && console.log("processCsvData finished");
			iS.value++;
			readData="";
			readDataAndMakeChart(data, iS, param, callback);
		});
	} 
	else if (urlType === "arrayOfJsons") {
		DEBUG && console.log("arrayOfJsons", iS.value);
		processCsvData(
			param.dataSources[iS.value].arrayOfJsons, 
			data,
			param.timeInfo.tracesInitialDate,
			param.otherDataProperties,
			param.dataSources[iS.value]
			);
		param.dataSources[iS.value].arrayOfJsons = [];
		iS.value++;
		readDataAndMakeChart(data, iS, param, callback);
	} 
	else if (urlType === "yqlJson") {
		$.getJSON(url, function(readData) {
			/* Not required, it can be handled with the CSV function, 
			set xSeriesName to date and ySeriesName to value*/	    
			processCsvData(
				readData.query.results.json.observations,
				data,
				param.timeInfo.tracesInitialDate,
				param.otherDataProperties,
				param.dataSources[iS.value]
				);
			iS.value++;
			readData="";
			readDataAndMakeChart(data, iS, param, callback);
		});
	}   
	else if ( urlType === "yqlGoogleCSV") {
		DEBUG && console.log("Googlecsv", iS.value);
		Plotly.d3.json("https://query.yahooapis.com/v1/public/yql?q="+
			encodeURIComponent("SELECT * from csv where url='"+url+"'")+
			"&format=json", 				
			function(readData) {
				processCsvData(
					readData.query.results.row,
					data,
					param.timeInfo.tracesInitialDate,
					param.otherDataProperties,
					param.dataSources[iS.value]
				);
			iS.value++;
			readData="";
			readDataAndMakeChart(data, iS, param, callback);
		});
  	} 
	else if (urlType === "pureJson") {
		$.getJSON(url, function(readData) {
			processCsvData(
				readData, 
				data,
				param.timeInfo.tracesInitialDate, 
				param.otherDataProperties,
				param.dataSources[iS.value]
				);
			iS.value++;
			readData="";
			readDataAndMakeChart(data, iS, param, callback);
		});
	} 
	/*
	else if (urlType === "direct") {
		processDirectData(
			data,
			param.timeInfo.tracesInitialDate, 
			param.otherDataProperties,
			param.dataSources[iS.value]
			);
		iS.value++;
		readDataAndMakeChart(data, iS, param, callback);
	}
	*/
}


	 
	 
function parallelReadData(data, i, param, callback) {
	
	var urlType = param.dataSources[i].urlType;
	var url = param.dataSources[i].url;
	
	if (urlType === "csv") {
		Plotly.d3.csv(url, function(readData) {
			DEBUG && console.log("csv", i);
			DEBUG && console.log("readData", readData);
			/*if(iS.value ===0){
				for(var y=0; y<readData.length; y++){
					DEBUG && console.log(readData[y]);
				}
			}*/
			processCsvData(
				readData, 
				data,
				param.timeInfo.tracesInitialDate,
				param.otherDataProperties,
				param.dataSources[i]
				);
			DEBUG && console.log("processCsvData",i,"finished");
			readData="";
			callback(null);
			//readDataAndMakeChart(data, iS, param, callback);
		});
	} 
	else if (urlType === "arrayOfJsons") {
		DEBUG && console.log("arrayOfJsons", i);
		processCsvData(
			param.dataSources[i].arrayOfJsons, 
			data,
			param.timeInfo.tracesInitialDate,
			param.otherDataProperties,
			param.dataSources[i]
			);
		DEBUG && console.log("process ArrayOfJsons",i,"finished");
		param.dataSources[i].arrayOfJsons = [];
		callback(null);
		//readDataAndMakeChart(data, iS, param, callback);
	} 
	else if (urlType === "yqlJson") {
		DEBUG && console.log("yqlJson", i);
		$.getJSON(url, function(readData) {
			/* Not required, it can be handled with the CSV function, 
			set xSeriesName to date and ySeriesName to value*/	    
			processCsvData(
				readData.query.results.json.observations,
				data,
				param.timeInfo.tracesInitialDate,
				param.otherDataProperties,
				param.dataSources[i]
				);
			DEBUG && console.log("process yqlJson",i,"finished");
			readData="";
			callback(null);
			//readDataAndMakeChart(data, iS, param, callback);
		});
	}   
	else if ( urlType === "yqlGoogleCSV") {
		DEBUG && console.log("yqlGoogleCSV", i);
		Plotly.d3.json("https://query.yahooapis.com/v1/public/yql?q="+
			encodeURIComponent("SELECT * from csv where url='"+url+"'")+
			"&format=json", 				
			function(readData) {
				processCsvData(
					readData.query.results.row,
					data,
					param.timeInfo.tracesInitialDate,
					param.otherDataProperties,
					param.dataSources[i]
				);
			DEBUG && console.log("process yqlGoogleCSV",i,"finished");
			readData="";
			callback(null);
			//readDataAndMakeChart(data, iS, param, callback);
		});
  	} 
	else if (urlType === "pureJson") {
		DEBUG && console.log("pureJson", i);
		$.getJSON(url, function(readData) {
			processCsvData(
				readData, 
				data,
				param.timeInfo.tracesInitialDate, 
				param.otherDataProperties,
				param.dataSources[i]
				);
			DEBUG && console.log("process pureJson",i,"finished");
			readData="";
			callback(null);
			//readDataAndMakeChart(data, iS, param, callback);
		});
	} 
}
	 
	 
	 
	 
	 
// 2. Process CSVData - support function, reads data and add it to data object, increases global iS variable	     
    
	    
	    
// FUNCTIONS TO PARSE CVS, JSON OR DIRECT SERIES
// main code, reads cvs files and creates traces and combine them in data
function processCsvData(allRows, data, tracesInitialDate, otherDataProperties, dataSources) {
	var x = [], y = []; //[];
	var initialDateAsDate = new Date("0001-01-01");
	var processedDate ="";
	var timeOffsetText = getTimeOffsetText();
	var i = 0, j, ia, ib, iLimit, jLimit, iData;
	var xSeriesName="", xDateSuffix ="", ySeriesName="", traceID = "";
	var processedColumnDates = [];
	var insertTrace = false;
	var readTraceInitialDateAsDate, readTraceEndDateAsDate;
	var existingInitialDateAsDate, existingEndDateAsDate;
	var existingInitialValue, existingEndValue;
	var insertPoint = -1;
	var initialIndex=0;
	var readTraceLength = 0, readTraceInitialIndex =0, traceLength, readTraceLimit =0;
	var readTraceEndIndex =0;
	var spliceInfo = {};
	var k=0, kLimit =0, readItems;
	var latestSorted = "";
	var delta =0.0;
	var datesReady = false, transformToEndOfMonth = false;
	var urlType = dataSources.urlType;
	var tags=allRows[0];
	var yqlGoogleCSV = false;
	var tableParams = {};
	var adjustFactor = 1.0, adjust="";
	var calculateAdjustedClose = false;
	
	// save function references
	var localProcessDate = processDate;
	var localChangeDateToEndOfMonth = changeDateToEndOfMonth;
	var localNameIsOnArrayOfNames = nameIsOnArrayOfNames;
	var localFindTraceIdIndex = findTraceIdIndex;
	var localSortByDatesAsStrings = sortByDatesAsStrings;
	var localSortByGoogleDatesAsStrings = sortByGoogleDatesAsStrings;
	var localInsertArrayInto = insertArrayInto;
	var localMyConcat = myConcat;
	var localFindSpliceInfo = findSpliceInfo;
	var localGoogleMDYToYMD = GoogleMDYToYMD;
	
	// number of traces to be read on this data source
	jLimit = dataSources.traces.length;
	
	// set flag for yqlGoogleCSV type and removes first row of array and translate names of columns to values
	if(urlType === "yqlGoogleCSV"){
		yqlGoogleCSV = true;
		processYqlGoogleCSVTags(dataSources);
		allRows.shift();
	}
	
	xSeriesName = "";
	if(typeof dataSources["xSeriesName"] !== "undefined"){
		xSeriesName =  dataSources["xSeriesName"];
	}
	

	// update initialDateAsDate if tracesInitialDate provided
	if (tracesInitialDate !== "") {
		initialDateAsDate = new Date(localProcessDate(tracesInitialDate, timeOffsetText));
	}
	
	DEBUG && console.log("initialDateAsDate", initialDateAsDate);
	
		
	
	
	//DEBUG && console.log("allRows: ", allRows);
	
	// total rows of csv file loaded
	// allRows is an array of objects
	iLimit = allRows.length;
	
	
	// Preprocess options for all Rows
	DEBUG && console.log("start preprocess");
	
	// get number of tables, sort and preprocessing of dates options
	setTablesParametersSortPreprocessing(tableParams, dataSources);
	DEBUG && console.log("table params set: ", tableParams);

	// apply date preprocessing options
	applyDateProprocessing(allRows, tableParams, urlType);
	DEBUG && console.log("data processing options applied");
	DEBUG && console.log("allRows",allRows);

	// split subtables trim by InitialDateAsDate and reorder by firstItemToRead
	splitSubtablesAndTrim(allRows, tableParams, dataSources, initialDateAsDate);
	DEBUG && console.log("tables split, and reordered");
	DEBUG && console.log("table Params", tableParams);
	allRows = [];
	
	
	// sort subtables
	sortSubTables(tableParams);
	DEBUG && console.log("SubTable sorted");
	
	
	// iterate through traces to be loaded
	for(j=0; j < jLimit; j++){
		
		DEBUG && console.log("starting trace: ", j);
		
		// set temporary variable
		xSeriesName = dataSources.traces[j].xSeriesName;
		ySeriesName = dataSources.traces[j].ySeriesName;
		xDateSuffix = dataSources.traces[j].xDateSuffix;
		traceID = dataSources.traces[j].traceID;
		
		// get data
		allRows = tableParams[xSeriesName]["allRows"];
		DEBUG && console.log("tableParams", tableParams);
		DEBUG && console.log("allRows from table params", allRows);

		
		// find trace index (position in data array)
		iData = localFindTraceIdIndex(traceID,otherDataProperties);
		DEBUG && console.log("iData", iData);
		
		// find weather trace will be added to existing trace
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
		
		DEBUG && console.log("readTraceInitialIndex ", readTraceInitialIndex);
		DEBUG && console.log("readTraceEndIndex ", readTraceEndIndex);
		DEBUG && console.log("xSeriesName: ", xSeriesName);
		DEBUG && console.log("allRows: ",allRows);
		
		readTraceEndDateAsDate = new Date(allRows[readTraceInitialIndex][xSeriesName]);
		readTraceInitialDateAsDate = new Date(allRows[readTraceEndIndex][xSeriesName]);
		
		adjust = "none";
		adjustFactor = 1.0;
		calculateAdjustedClose = 
			tableParams[xSeriesName]["yCalculateAdjustedClose"][tableParams[xSeriesName]["yNames"].indexOf(ySeriesName)];
		
		DEBUG && console.log("calculateAdjustedClose", calculateAdjustedClose);
		
		if(insertTrace){
			DEBUG && console.log("insert trace");
			// default insert point
			insertPoint = 0;
			
			readTraceLimit = readTraceLength+readTraceInitialIndex;
			DEBUG && console.log("readTraceLimit",readTraceLimit);

			// get existing data x range
			existingInitialDateAsDate = new Date(data[iData].x[data[iData].x.length - 1]);
			existingEndDateAsDate = new Date(data[iData].x[0]);
			existingInitialValue =data[iData].y[data[iData].x.length - 1];
			existingEndValue =data[iData].y[0];
			
			DEBUG && console.log("existingInitialDateAsDate", existingInitialDateAsDate);
			DEBUG && console.log("existingEndDateAsDate", existingEndDateAsDate);
			DEBUG && console.log("existingInitialValue", existingInitialValue);
			DEBUG && console.log("existingEndValue", existingEndValue);

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
				DEBUG && console.log("overlap, but new data is older than existing");
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
					readTraceLength, data[iData].x/*,  datesReady,
					transformToEndOfMonth, yqlGoogleCSV,xDateSuffix, timeOffsetText*/);
				initialIndex = spliceInfo.initialIndex;
				traceLength = spliceInfo.traceLength;
				insertPoint = spliceInfo.insertPoint;
		
				if(calculateAdjustedClose){
					adjust = "new"; // "new", "existing" or "none"
					adjustFactor = getAdjustFactor(allRows, xSeriesName, ySeriesName, initialIndex, data[iData], insertPoint);
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
		DEBUG && console.log("fill processed dates");
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
		DEBUG && console.log("excess points removed");
		
		
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
	}
}

	    
  
	    
	    
/* Not required, it can be handled with the CSV function, set xSeriesName to date and ySeriesName to value	    
function processJsonData(jsonData, tracesInitialDate, serie) {
	var x = [], y = [], trace = {}; //[];
	var initialDateAsDate = new Date("0001-01-01");
	var processedDate ="";
	var timeOffsetText = getTimeOffsetText();
	var readFlag = false;
	var i = 0;

	if (tracesInitialDate !== "") {
		initialDateAsDate = new Date(processDate(tracesInitialDate,timeOffsetText));
	}
	
	if(typeof serie.postProcessData !== "undefined"){
		if(serie.postProcessData === "end of month"){
			readFlag = true;

			for (i = 0; i < jsonData.count; i++) {
				processedDate = processDate(jsonData.observations[i].date+ serie.xDateSuffix,timeOffsetText);	
				processedDate = changeDateToEndOfMonth(processedDate);

				if (
					tracesInitialDate === "" ||
					new Date(processedDate) >= initialDateAsDate
				) {
					x.push(processedDate);
					y.push(jsonData.observations[i].value);
				}
			}
		}	
	}	
	
	if(!readFlag){
		readFlag = true;
		for (i = 0; i < jsonData.count; i++) {
			processedDate = processDate(jsonData.observations[i].date+ serie.xDateSuffix,timeOffsetText);	

			if (
				tracesInitialDate === "" ||
				new Date(processedDate) >= initialDateAsDate
			) {
				x.push(processedDate);
				y.push(jsonData.observations[i].value);
			}
		}	
		
	}
			
	trace = deepCopy(serie.traceAttributes);
	trace.x = x;
	trace.y = y;
	return trace;
}
*/
	
/* merge into processCSVData 
// // read data from google finance history csv files	    
function processYqlGoogleCsvData(allRows, tracesInitialDate, serie) {
	var x = [], y = [], trace = {}; //[];
	var initialDateAsDate = new Date("0001-01-01");
	var processedDate ="";
	var timeOffsetText = getTimeOffsetText();
	var readFlag = false;
	var i = 0;
	var row;
	var xTag ="", yTag="";

	var tags=allRows[0];
	
	
	for (var key in tags){
		if (tags.hasOwnProperty(key)) {
			
			if(tags[key].toString().trim() === serie.xSeriesName.toString()){
				xTag = key;
			}
			
			
			if(tags[key].toString().trim() === serie.ySeriesName.toString()){
				yTag = key;
			}
		}
	}
	
	
	if (tracesInitialDate !== "") {
		initialDateAsDate = new Date(processDate(tracesInitialDate, timeOffsetText));
	}

	if(typeof serie.postProcessData !== "undefined"){
		if(serie.postProcessData === "end of month"){
			readFlag = true;
			//DEBUG && console.log(allRows.length);
			//DEBUG && console.log("allRows",allRows);
			//DEBUG && console.log("initialDateAsDate",initialDateAsDate);
			//DEBUG && console.log("tracesInitialDate",tracesInitialDate);
			//DEBUG && console.log(serie);
			
			for (i = 1; i < allRows.length; i++) {
				row = allRows[i];
				processedDate = processDate(GoogleMDYToYMD(row[xTag]) + serie.xDateSuffix, timeOffsetText);
				//DEBUG && console.log("processedDate",processedDate);
				processedDate = changeDateToEndOfMonth(processedDate);
				//DEBUG && console.log("processedDate",processedDate);
				if (
					tracesInitialDate === "" ||
					new Date(processedDate) >= initialDateAsDate
				) {
					x.push(processedDate);
					y.push(row[yTag]);
				}
			}
		}
	}
	
	
	if(!readFlag) {
		readFlag = true;
		for (i = 1; i < allRows.length; i++) {
			row = allRows[i];
			//DEBUG && console.log("row",row);
			processedDate = processDate(GoogleMDYToYMD(row[xTag]) + serie.xDateSuffix, timeOffsetText);
			//DEBUG && console.log("processedDate",processedDate);

			if (
				tracesInitialDate === "" ||
				new Date(processedDate) >= initialDateAsDate
			) {
				x.push(processedDate);
				y.push(row[yTag]);
			}
		}
	}	

	trace = deepCopy(serie.traceAttributes);
	trace.x = x;
	trace.y = y;
	return trace;
}

*/

 
	    
/*
// In case trace x and y are provided direct, and not to be read from a file.
function processDirectData(tracesInitialDate, serie) {
	var x = [], y = [], trace = {}; //[];
	var initialDateAsDate = new Date("0001-01-01");
	var processedDate ="";
	var timeOffsetText = getTimeOffsetText();
	var readFlag = false;
	var i=0;
	
	if (tracesInitialDate !== "") {
		initialDateAsDate = new Date(processDate(tracesInitialDate, timeOffsetText));
	}
	
	if(typeof serie.postProcessData !== "undefined"){
		if(serie.postProcessData === "end of month"){
			readFlag = true;

			for (i = 0; i < serie.traceAttributes.x.length; i++) {
				processedDate = processDate("" + serie.traceAttributes.x[i] + serie.xDateSuffix, timeOffsetText);			
				processedDate = changeDateToEndOfMonth(processedDate);

				if (
					tracesInitialDate === "" ||
					new Date(processedDate) >= 	initialDateAsDate
				) {
					x.push(processedDate);
					y.push(serie.traceAttributes.y[i]);
				}
			}
		}		
	}		
	
	if(!readFlag){
			readFlag = true;

			for (i = 0; i < serie.traceAttributes.x.length; i++) {
				processedDate = processDate("" + serie.traceAttributes.x[i] + serie.xDateSuffix, timeOffsetText);			

				if (
					tracesInitialDate === "" ||
					new Date(processedDate) >= 	initialDateAsDate
				) {
					x.push(processedDate);
					y.push(serie.traceAttributes.y[i]);
				}
			}		
	}

	
	trace = deepCopy(serie.traceAttributes);
	trace.x = x;
	trace.y = y;
	return trace;
}*/

	 
	 

	 
	 
	 
	 
	 
	 
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
	
	//DEBUG && console.log("issue #1");

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


	settings = param.settings;
	options = param.options;
	layout = param.layout;
	timeInfo = param.timeInfo;
	divInfo = param.divInfo;
	otherDataProperties = param.otherDataProperties;

	//DEBUG && console.log("settings", settings);

	originalLayout.yaxis.hoverformat = layout.yaxis.hoverformat;
	originalLayout.yaxis.type = layout.yaxis.type;
	if(typeof layout.yaxis.tickformat !== "undefined"){
		originalLayout.yaxis.tickformat = layout.yaxis.tickformat;
	}

	// SAVE ORIGINAL DATA
	saveDataXYIntoPropertyXY(data, "xOriginal", "yOriginal");
	//DEBUG && console.log("original data saved");

	//DEBUG && console.log("tracesInitialDate", tracesInitialDate);

	// HTML VARIABLES AND SETTINGS
	var defaultDivHeight = "460px";
	if(settings.allowCompare || settings.allowLogLinear || settings.allosFrequencyResampling){
		defaultDivHeight = "480px";
	}

	var defaultDivWidth = "100%";

	var myPlot = document.getElementById(divInfo.plotlyDivID);


	var divHeightInStyle = divInfo.plotDivElement.style.height;
	var divWidthInStyle = divInfo.plotDivElement.style.width;
	//DEBUG && console.log("divHeightInStyle", divHeightInStyle);

	divInfo.plotDivElement.style.width =  
		divWidthInStyle === "" ? defaultDivWidth : divWidthInStyle;
	divInfo.plotDivElement.style.height = 
		divHeightInStyle === "" ? defaultDivHeight : divHeightInStyle;

	myPlot.style.width  = divInfo.plotDivElement.style.width;

	if(settings.allowCompare || settings.allowLogLinear || settings.allowDownload){
		divInfo.footerDivElement.style.width = myPlot.style.width;
		divInfo.footerDivElement.style.height = "23px";
		//DEBUG && console.log("plotDivElement height",divInfo.plotDivElement.style.height);

		myPlot.style.height =  ""+
			(numberExPx(divInfo.plotDivElement.style.height) - 
			numberExPx(divInfo.footerDivElement.style.height))+"px";

		//DEBUG && console.log("myPlot height",myPlot.style.height);
	}
	else{
		myPlot.style.height = 
			divInfo.plotDivElement.style.height;
	}


	//DEBUG && console.log("myPlot", myPlot);

	var currentFrequency = settings.series.baseFrequency;
	var currentAggregation = settings.series.baseAggregation;



	// TEST WEATHER AN INITAL FREQUENCY TRANSFORMATION IS REQUIRED AND MAKE IT DOWN HERE
	if (typeof settings.changeFrequencyAggregationTo !== "undefined"){
		if (typeof settings.changeFrequencyAggregationTo.frequency !== "undefined") {
			if (settings.changeFrequencyAggregationTo.frequency !== currentFrequency) {
				// Original data already saved

				//DEBUG && console.log('settings.changeFrequencyAggregationTo.frequency',
				//						settings.changeFrequencyAggregationTo.frequency);
				//DEBUG && console.log('currentFrequency',currentFrequency);
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
	//var xDateValue = new Date();

	// this section finds the x range for the traces (which is already trimmed by tracesInitialDate)
	// range required in order to set the recession shapes.
	var minMaxDatesAsString = getDataXminXmaxAsString(data);
	//DEBUG && console.log(minMaxDatesAsString);
	minDateAsString = makeDateComplete(minMaxDatesAsString[0]);
	maxDateAsString = makeDateComplete(minMaxDatesAsString[1]);

	//DEBUG && console.log("minMaxDates", minMaxDatesAsString);

	// load recession shapes for the traces' x range
	if (settings.displayRecessions) {
		layout.shapes = setRecessions(
			param.usRecessions,
			minDateAsString,
			maxDateAsString
		);
	}
	//DEBUG && console.log("recessions loaded");

	// X AXIS RANGE SETTINGS
	var xaxisRangeAsString = setDatesRangeAsString(
		minDateAsString,
		maxDateAsString,
		timeInfo
	);
	//DEBUG && console.log("xaxis range settings done");

	//DEBUG && console.log("xaxisRange", xaxisRangeAsString);

	var initialDate = xaxisRangeAsString[0];
	var endDate = xaxisRangeAsString[1];

	layout.xaxis.range = [initialDate, endDate];

	// read division width
	var currentWidth = jQuery(myPlot).width();
	var divWidth = currentWidth;

	// set default left/right margins if not set
	setLeftRightMarginDefault(layout, 15, 35);

	// get ticktext and tickvals based on width and parameters
	var ticktextAndTickvals = aoPlotlyAddOn.getTicktextAndTickvals(
		initialDate,
		endDate,
		settings.textAndSpaceToTextRatio,
		currentFrequency,
		layout.xaxis.tickfont.family,
		layout.xaxis.tickfont.size,
		divWidth,
		layout.margin.l,
		layout.margin.r
	);
	DEBUG && console.log("tick vals and text done");

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
			aoPlotlyAddOn.transformSeriesByFrequencies(
				data,
				settings.periodKeys,
				settings.endOfWeek
			);
			//DEBUG && console.log("transformed by frequencies");
			frequenciesDataCreated = true;
			processFrequenciesDates(data, settings.periodKeys);	
			//DEBUG && console.log("dates processed");
			//DEBUG && console.log("data", data.day);
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
			//DEBUG && console.log("transform To Real",transformToReal);
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
	
	//DEBUG && console.log("iDeflactor",iDeflactor);

	deflactorValuesCreated = createIndexMap(data, deflactorDictionary, settings.periodKeys, iDeflactor);

	//DEBUG && console.log("deflactor map created");
	//DEBUG && console.log("deflactorDictionary",deflactorDictionary);

	if(typeof settings.initialRealNominal !== "undefined"){

		transformToReal = settings.initialRealNominal==="real" ? true : false;

	}
	else{
		transformToReal = false;
	}

	var baseRealNominalDate ="";
	var newBaseRealNominalDate ="";
	// transform yvalues to real for those to which applies
	if (transformToReal) {

		//DEBUG && console.log("PENDING - InitialprepareTransformToReal");

		// determine base date
		/* could be "end of range", "end of domain", "beggining of range", beggining of domain", or a date "yyyy-mm-dd hh:mm:ss.sss-04:00"*/
		baseRealNominalDate = setBaseRealNominalDateAsString(settings.baseRealDate, 
								 layout.xaxis.range[0],
								 layout.xaxis.range[1],
								 minDateAsString,
								 maxDateAsString
								);

		//DEBUG && console.log("baseRealNominalDate",baseRealNominalDate);

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
	DEBUG && console.log("data as real passed");
	//DEBUG && console.log("data as real",data);




	//TRANSFORM TO BASE INDEX
	//set true or false to scale traces to 1 on the initially displayed x0
	transformToBaseIndex = settings.transformToBaseIndex;


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

		//DEBUG && console.log("compared");
	}

	// add functionality to  compare button
	if (settings.allowCompare) {

		divInfo.compareButtonElement.addEventListener('click', function() {
			//DEBUG && console.log("transformToBaseIndex",transformToBaseIndex);
			Plotly.relayout(
				divInfo.plotlyDivElement,
				{
					compare: transformToBaseIndex ? false : true
				}
			);

		}, false);
		//addToUpdateMenus(param.compareUpdateMenu, updateMenus, layout);
	}

	DEBUG && console.log("allow compare functionality added");


	// set y axis range
	setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, settings.possibleYTickMultiples, settings.rangeProportion);
	//DEBUG && console.log("y axis range set");

	//DEBUG && console.log("baseIndexDate", baseIndexDate);
	//DEBUG && console.log("initialDate", initialDate);

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
	DEBUG && console.log("selector options loaded");

	//DEBUG && console.log("myPlot", myPlot);
	//DEBUG && console.log("layout", layout);
	//DEBUG && console.log(param.displayOptions);

	// make initial plot
	Plotly.newPlot(myPlot, data, layout, options).then(function() {
		wholeDivShow(param.divInfo.wholeDivElement);
		loaderHide(param.divInfo.loaderElement);
	});




	//instruction resizes plot
	window.addEventListener("resize", function() {
		Plotly.Plots.resize(document.getElementById(divInfo.plotlyDivID));
	});





	DEBUG && console.log("start relayout handler");


	// UPDATE PLOT UNDER RELAYOUT EVENTS


	var relayoutUpdateArgs = [];


	myPlot.on("plotly_relayout", function(relayoutData) {
		//myPlot.addEventListener('plotly_relayout', function(relayoutData) {
		//DEBUG && console.log("relayout en myPlot.on", isUnderRelayout);
		//DEBUG && console.log("relayoutData",relayoutData);
		//DEBUG && console.log("layout",layout);


		// CASE 1. case relayout is autosize, in which case, the updatemenu buttons for frequencies and the x axis labels have to be redefined
		if (relayoutData.autosize === true) {
			// adjust frequency updatemenu buttons
			divWidth = jQuery(myPlot).width();

			if (divWidth != currentWidth) {
				// voids relayoutUpdateArgs;
				relayoutUpdateArgs = {};

				if (settings.allowFrequencyResampling) {
					newX = xOfFirstFrequencyMenuItem(
						divWidth,
						layout,
						settings.widthOfRightItemsFrequencyButtons
					);
					index = findIndexOfMenu(layout.updatemenus,"frequencies" );
					relayoutUpdateArgs["updatemenus["+index+"].x"] = newX;


					if(layout.updatemenus[findIndexOfMenu(layout.updatemenus,"aggregation")].visible === true){
						index = findIndexOfMenu(layout.updatemenus,"frequencies" );
						relayoutUpdateArgs["updatemenus["+index+"].x"] = newX;

						index = findIndexOfMenu(layout.updatemenus,"aggregation" );
						relayoutUpdateArgs["updatemenus["+index+"].x"] = xOfRightItems(divWidth, layout);

					}
					else{
						index = findIndexOfMenu(layout.updatemenus,"frequencies" );
						relayoutUpdateArgs["updatemenus["+index+"].x"] = xOfRightItems(divWidth, layout);	

					}

				}

				if(settings.allowSelectorOptions){
					newX =xOfRightItems(divWidth, layout);
					relayoutUpdateArgs["xaxis.rangeselector.x"] = newX;
				}

				//DEBUG && console.log('relayoutUpdateArgs after new index', relayoutUpdateArgs);

				// get ticktext and tickvals based on width and parameters
				ticktextAndTickvals = aoPlotlyAddOn.getTicktextAndTickvals(
					initialDate,
					endDate,
					settings.textAndSpaceToTextRatio,
					currentFrequency,
					layout.xaxis.tickfont.family,
					layout.xaxis.tickfont.size,
					divWidth,
					layout.margin.l,
					layout.margin.r
				);

				// set layout ticktext and tickvals
				relayoutUpdateArgs["xaxis.tickvals"] = ticktextAndTickvals.tickvals;
				relayoutUpdateArgs["xaxis.ticktext"] = ticktextAndTickvals.ticktext;

				//DEBUG && console.log('relayoutUpdateArgs in case 1, autosize', relayoutUpdateArgs);

				Plotly.relayout(myPlot, relayoutUpdateArgs);
				//.then(() => { isUnderRelayout = false })
			}
		} 




		// CASE 2. EN ESTE ELSE SE INCLUYE EL CAMBIO DE FREQUENCY Y AJUSTAR EL DISPLAY DE TAGS DEL EJE X - FALTARÏA REVISAR Initial date end date	

		else if (typeof relayoutData.myFrequency !== "undefined") {

			flag = false;
			//DEBUG && console.log("current Frequency",currentFrequency);
			//DEBUG && console.log("base Frequency", settings.series.baseFrequency);
			//DEBUG && console.log("current Aggregation", currentAggregation);
			//DEBUG && console.log("base Aggregation", settings.series.baseAggregation);
			//DEBUG && console.log("baseFrequencyType", settings.series.baseFrequencyType);
			//DEBUG && console.log("baseAggregationType",settings.series.baseAggregationType);
			//DEBUG && console.log("myFrequency", relayoutData.myFrequency);	

			if (relayoutData.myFrequency !== currentFrequency) {

				//DEBUG && console.log("change in frequency started");

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

					//	load data	
					//DEBUG && console.log("case 1 to load from calculated freqs");

					flag = true;

					//DEBUG && console.log("frequenciesDataCreated",frequenciesDataCreated);

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

					//DEBUG && console.log("set aggregation to close, load normal aggregation menu");

					flag = true;

					//DEBUG && console.log(frequenciesDataCreated);

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
					settings.series.baseAggregationType === "normal")	{

					//DEBUG && console.log("change frequency. case 3");
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
					settings.series.baseAggregationType !== "normal")	{

					//DEBUG && console.log("change frequency. case 4");

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
						//DEBUG && console.log("new x freq", newX);
						index = findIndexOfMenu(layout.updatemenus,"frequencies");
						//DEBUG && console.log("index of freq menu", index);
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
					settings.series.baseAggregationType === "not available")	{

					//DEBUG && console.log("change frequency. case 5");

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
						//DEBUG && console.log("restore compare");
						transformToBaseIndex = settings.transformToBaseIndex;
						if(settings.allowCompare){
							toggleCompareButton(transformToBaseIndex, divInfo.compareButtonElement);
						}
					}

					layout.yaxis.hoverformat= originalLayout.yaxis.hoverformat;

					if(typeof layout.yaxis.tickformat !== "undefined" && typeof originalLayout.yaxis.tickformat === "undefined"){
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
					settings.series.baseAggregationType !== "not available")	{

					//DEBUG && console.log("change frequency. case 6");

					flag = true;	

					currentAggregation = settings.series.baseAggregation;
					//DEBUG && console.log("new currentAggregation", currentAggregation);

					// load one button aggregation menu
					index = findIndexOfMenu(layout.updatemenus,"aggregation");

					//DEBUG && console.log("index of agg menu",index);

					layout.updatemenus[index].buttons = settings.singleAggregationButton;		
					layout.updatemenus[index].active = 0;
					layout.updatemenus[index].visible = true;	
					layout.updatemenus[index].type = "buttons";
					layout.updatemenus[index].showactive = false;

					//DEBUG && console.log("updatemenus",layout.updatemenus);

					// load original data
					loadDataIntoXYFromPropertyXY(data, "xOriginal", "yOriginal");							

					// change log linear to original
					changeLogLinearToOriginal(layout, originalLayout, divInfo, settings);
					//DEBUG && console.log("6 after change log lin");

					// change compare to original
					if(transformToBaseIndex !== settings.transformToBaseIndex){
						//DEBUG && console.log("restore compare");
						transformToBaseIndex = settings.transformToBaseIndex;
						if(settings.allowCompare){
							toggleCompareButton(transformToBaseIndex, divInfo.compareButtonElement);
						}
					}		

					layout.yaxis.hoverformat= originalLayout.yaxis.hoverformat;

					if(typeof layout.yaxis.tickformat !== "undefined" && typeof originalLayout.yaxis.tickformat === "undefined"){
						delete layout.yaxis.tickformat;
					}
					else if (typeof originalLayout.yaxis.tickformat !== "undefined"){
						layout.yaxis.tickformat = originalLayout.yaxis.tickformat;
					}

					//DEBUG && console.log("6 after change compare to original");

				}	



				// case 7
				//DEBUG && console.log("flag before 7", flag);
				if(
					(	flag === false &&
					currentFrequency !== settings.series.baseFrequency &&
					 relayoutData.myFrequency === settings.series.baseFrequency &&
					 settings.series.baseFrequencyType === "normal" &&
					currentAggregation === settings.series.baseAggregation )

				){

					// load original data
					//DEBUG && console.log("change frequency. case 7");

					flag = true;	

					// load original data
					loadDataIntoXYFromPropertyXY(data, "xOriginal", "yOriginal");		

					// case 7.1 baseAggregationType = "normal"

					// case 7.2 base AggregationType = ! normal
					if(settings.series.baseAggregationType!== "normal"){
						//DEBUG && console.log("case 7.2");

						//make aggregation = base
						currentAggregation = settings.series.baseAggregation;

						// change log linear to original
						changeLogLinearToOriginal(layout, originalLayout, divInfo, settings);

						// change compare to original
						if(transformToBaseIndex !== settings.transformToBaseIndex){
							//DEBUG && console.log("restore compare");
							transformToBaseIndex = settings.transformToBaseIndex;
							if(settings.allowCompare){
								toggleCompareButton(transformToBaseIndex, divInfo.compareButtonElement);
							}
						}




						// WHAT ELSE ON AGGREGATION???


						if(settings.series.baseAggregationType === "not available"){
							// case 7.2.a
							//DEBUG && console.log("case 7.2.a");

							// remove aggregation button
							index = findIndexOfMenu(layout.updatemenus,"aggregation");

							layout.updatemenus[index].visible = false;

							// change location of frequency menu
							setNewXToFrequencyButton(
								xOfRightItems(divWidth, layout), layout.updatemenus, "frequencies");																
						}	

						if(settings.series.baseAggregationType ==="custom"){
							// case 7.2b
							//DEBUG && console.log("case 7.2.b");

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

					//DEBUG && console.log("change frequency. case 8");

					flag = true;	

					//DEBUG && console.log("frequenciesDataCreated",frequenciesDataCreated);


					loadFrequencyAndAggregationIntoData(
						data,
						settings.period[relayoutData.myFrequency],
						currentAggregation
					);

					// handle buttons
					if(settings.series.baseAggregationType === "custom"){
						// load full aggregation menu
						//DEBUG && console.log("load full agg menu");

						index = findIndexOfMenu(layout.updatemenus,"aggregation");
						//DEBUG && console.log("combinedAgg Bttons", settings.combinedAggregationButtons);
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
						//DEBUG && console.log("load combined agg menu");

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
					//DEBUG && console.log("case 9 to load from calculated freqs & baseAGGButtons");

					flag = true;

					//DEBUG && console.log("frequenciesDataCreated",frequenciesDataCreated);

					loadFrequencyAndAggregationIntoData(
						data,
						settings.period[relayoutData.myFrequency],
						currentAggregation
					);


					// load base aggregation menu
					//DEBUG && console.log("load base agg menu");

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
					minDateAsString = makeDateComplete(minMaxDatesAsString[0]);
					maxDateAsString = makeDateComplete(minMaxDatesAsString[1]);

					//DEBUG && console.log("minDateAsString", minDateAsString);
					//DEBUG && console.log("maxDateAsString", maxDateAsString);
					//DEBUG && console.log("initialDate", initialDate, "endDate", endDate);
					//DEBUG && console.log("layout", layout);

					updateXAxisRange(initialDate, endDate, minDateAsString, maxDateAsString, layout.xaxis.range);

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
						initialDate, endDate, settings.textAndSpaceToTextRatio, currentFrequency, 
						layout.xaxis.tickfont.family, layout.xaxis.tickfont.size, 
						divWidth, layout.margin.l, layout.margin.r
					);

					// set layout ticktext and tickvals
					layout.xaxis.tickvals = ticktextAndTickvals.tickvals;
					layout.xaxis.ticktext = ticktextAndTickvals.ticktext;	

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
							setDeflactorDictionaryAtDate(baseRealNominalDate, deflactorDictionary, data[iDeflactor], 0);					

						}


						transformDataToReal(data, deflactorDictionary, 	baseRealNominalDate, otherDataProperties);
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



					//DEBUG && console.log("yaxis layout befor set",layout.yaxis);
					setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, settings.possibleYTickMultiples, settings.rangeProportion);
					//DEBUG && console.log("yaxis layout after set", layout.yaxis);

					settings.updatemenus = layout.updatemenus;
					Plotly.relayout(myPlot, {"updatemenus": [{}]});
					layout.updatemenus = settings.updatemenus;
					Plotly.redraw(myPlot);
				}
			}
		} 





		else if (typeof relayoutData.myAggregation !== "undefined") {
			// CASE 3. EN ESTE ELSE IF SE INCLUYE EL CAMBIO AGGREGATION - faltaría revisar fijación del xaxis range

			flag = false;
			//DEBUG && console.log("current Frequency",currentFrequency);
			//DEBUG && console.log("base Frequency", settings.series.baseFrequency);
			//DEBUG && console.log("current Aggregation", currentAggregation);
			//DEBUG && console.log("base Aggregation", settings.series.baseAggregation);
			//DEBUG && console.log("baseFrequencyType", settings.series.baseFrequencyType);
			//DEBUG && console.log("baseAggregationType",settings.series.baseAggregationType);
			//DEBUG && console.log("myAggregation", relayoutData.myAggregation);
			if (relayoutData.myAggregation !== currentAggregation) {
				//DEBUG && console.log("change in aggregation started");

				// Case 1. case to read from original data
				if(
					currentFrequency === settings.series.baseFrequency &&
					settings.series.baseFrequencyType === "normal" &&
					relayoutData.myAggregation === settings.series.baseAggregation ){

					//DEBUG && console.log("case 1. to read from original data");

					flag = true;



					// read from original data
					loadDataIntoXYFromPropertyXY(data, "xOriginal", "yOriginal");

					//DEBUG && console.log("data[0]", data[0]);

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

					//DEBUG && console.log("case 2. to load from calculated freqs");

					flag = true;

					//DEBUG && console.log(frequenciesDataCreated);


					//DEBUG && console.log("data[0]",   data[0]);

					//return;
					// load frequency and aggregation into data
					loadFrequencyAndAggregationIntoData(
						data,
						settings.period[currentFrequency],
						relayoutData.myAggregation
					);

					//DEBUG && console.log("data[0].x",data[0].x);
					//DEBUG && console.log("data[1].y",data[1].y);

				}

				if(flag){


					uncomparedSaved = false;
					layout.yaxis.hoverformat = originalLayout.yaxis.hoverformat;

					if(typeof layout.yaxis.tickformat !== "undefined" && typeof originalLayout.yaxis.tickformat === "undefined"){
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
							setDeflactorDictionaryAtDate(baseRealNominalDate, deflactorDictionary, data[iDeflactor], 0);					

						}

						transformDataToReal(data, deflactorDictionary, 	baseRealNominalDate, otherDataProperties);
					}



					// uncompare in case aggregatin is percChange or sqrPercChange
					if(relayoutData.myAggregation === "percChange" || relayoutData.myAggregation === "sqrPercChange"){
						transformToBaseIndex = false;
						if(settings.allowCompare){
							toggleCompareButton(transformToBaseIndex, divInfo.compareButtonElement);
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
							//DEBUG && console.log("restore compare");
							transformToBaseIndex = settings.transformToBaseIndex;
							if(settings.allowCompare){
								toggleCompareButton(transformToBaseIndex, divInfo.compareButtonElement);
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
					minDateAsString = makeDateComplete(minMaxDatesAsString[0]);
					maxDateAsString = makeDateComplete(minMaxDatesAsString[1]);

					//DEBUG && console.log("minDataAsString", minDateAsString);
					//DEBUG && console.log("maxDataAsString", maxDateAsString);
					//DEBUG && console.log("initialDate", initialDate, "endDate", endDate);

					/*if(initialDate < minDateAsString){
						initialDate = minDateAsString
						layout.xaxis.range[0]= initialDate;
					}
					if(endDate > maxDateAsString){
						endDate = maxDateAsString;
						layout.xaxis.range[1]=	endDate;
					}*/

					updateXAxisRange(initialDate, endDate, minDateAsString, maxDateAsString, layout.xaxis.range);


					// get ticktext and tickvals based on width and parameters
					ticktextAndTickvals = aoPlotlyAddOn.getTicktextAndTickvals(
						initialDate, endDate, settings.textAndSpaceToTextRatio, currentFrequency, 
						layout.xaxis.tickfont.family, layout.xaxis.tickfont.size, 
						divWidth, layout.margin.l, layout.margin.r
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
					//DEBUG && console.log("yaxis layout befor set",layout.yaxis);
					setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, settings.possibleYTickMultiples, settings.rangeProportion);
					//DEBUG && console.log("yaxis layout after set", layout.yaxis);


					settings.updatemenus = layout.updatemenus;
					Plotly.relayout(myPlot, {"updatemenus": [{}]});
					layout.updatemenus = settings.updatemenus;
					Plotly.redraw(myPlot);

				}	
			}	
		} 

		// CASE 4. EN ESTE ELSE IF HAY QUE INCLUIR EL CAMBIO DE EJES LOG LINEAR - PENDIENTE. DE MOMENTO NO SE USA
		else if (typeof relayoutData.changeYaxisTypeToLog !== "undefined") {

			//DEBUG && console.log("change of y axis type requested");

			if (relayoutData.changeYaxisTypeToLog === false) {
				divInfo.logLinearButtonElement.blur();
				if (layout.yaxis.type === "log") {
					if (!isUnderRelayout) {
						layout.yaxis.type = "linear";
						//DEBUG && console.log("change y axis to linear");
						toggleLogLinearButton(false, divInfo.logLinearButtonElement);

						layout.yaxis.type = "linear";
						setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, settings.possibleYTickMultiples, settings.rangeProportion);
						Plotly.redraw(myPlot).then(() => {
							isUnderRelayout = false;
						});
					}
					isUnderRelayout = true;
				}
			}

			if (relayoutData.changeYaxisTypeToLog === true) {
				divInfo.logLinearButtonElement.blur();
				//DEBUG && console.log("yaxistype", layout.yaxis.type);
				//DEBUG && console.log("currentAggregation",currentAggregation);
				//DEBUG && console.log("yaxis range",layout.yaxis.range);
				if (layout.yaxis.type === "linear" &&
					 (currentAggregation !== "percChange" &&
						 currentAggregation !== "sqrPercChange" &&
						 currentAggregation !== "change") /*&& 
						layout.yaxis.range[0]>0 &&
						layout.yaxis.range[1]>0*/
					 ) {
					if (!isUnderRelayout) {
						//DEBUG && console.log("change y axis to log");
						layout.yaxis.type = "log";
						toggleLogLinearButton(true, divInfo.logLinearButtonElement);
						setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, settings.possibleYTickMultiples, settings.rangeProportion);
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

			//DEBUG && console.log("compare/uncompare button clicked");
			//DEBUG && console.log("relayoutData.compare = ", relayoutData.compare);
			//DEBUG && console.log("transformToBaseIndex =", transformToBaseIndex);
			divInfo.compareButtonElement.blur();
			if (relayoutData.compare !== transformToBaseIndex &&
					currentAggregation !== "percChange" &&
					currentAggregation !== "sqrPercChange") {
				if (!isUnderRelayout) {
					//DEBUG && console.log("rutina compare/uncompare in");

					//toggle transformToBaseIndes
					transformToBaseIndex = !transformToBaseIndex;

					// update menu settings
					//toggleCompareMenu(!relayoutData.compare, layout.updatemenus);
					toggleCompareButton(relayoutData.compare, divInfo.compareButtonElement);

					// transform data to base index
					if (transformToBaseIndex) {
						//DEBUG && console.log("uncomparedSaved", uncomparedSaved);

						// save nominal data
						if(!nominalSaved && !transformToReal){
							saveDataXYIntoProperty(data, "nominal");
							nominalSaved = true;									
						}

						// update baseIndex Date
						//DEBUG && console.log('layout.xaxis.range[0]', layout.xaxis.range[0]);
						baseIndexDate = makeDateComplete(layout.xaxis.range[0]);
						//DEBUG && console.log('transformed to YMD as base Index date', baseIndexDate);

						// transform yvalues to index at specified date
						uncomparedSaved = prepareTransformToBaseIndex(
							uncomparedSaved,
							data,
							baseIndexDate,
							settings.allowCompare,
							layout,
							currentAggregation
						);

						//DEBUG && console.log('data transformed for comparison', data)

						if (!layout.yaxis.autorange) {
							// find y range
							setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, settings.possibleYTickMultiples, settings.rangeProportion);
						}
					} 

					// uncompare, transform uncompared data (check frequencies);				
					else {

						loadData(data, "uncompared");
						//DEBUG && console.log("new data",data);

						if (!layout.yaxis.autorange) {
							setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, settings.possibleYTickMultiples, settings.rangeProportion);
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

			//DEBUG && console.log("real/nominal button clicked");
			//DEBUG && console.log("relayoutData.compare = ", relayoutData.compare);
			//DEBUG && console.log("transformToBaseIndex =", transformToBaseIndex);
			divInfo.realNominalButtonElement.blur();

			if (relayoutData.transformToReal !== transformToReal) {
				if (!isUnderRelayout) {
					//DEBUG && console.log("rutina real/nominal in");

					//toggle transformRealNominal
					transformToReal = !transformToReal;

					// update menu settings
					//toggleCompareMenu(!relayoutData.compare, layout.updatemenus);
					toggleRealNominalButton(relayoutData.transformToReal, divInfo.realNominalButtonElement);

					// transform data to real
					if (transformToReal) {

						//DEBUG && console.log("transform To Real");


						// determine base date
						/* could be "end of range", "end of domain", "beggining of range", beggining of domain", or a date "yyyy-mm-dd hh:mm:ss.sss-04:00"*/

						if(baseRealNominalDate!==""){

							baseRealNominalDate = setBaseRealNominalDateAsString(settings.baseRealDate, 
																																 layout.xaxis.range[0],
																																 layout.xaxis.range[1],
																																 minDateAsString,
																																 maxDateAsString
																																);

							//DEBUG && console.log("baseRealNominalDate",baseRealNominalDate);
							setDeflactorDictionaryAtDate(baseRealNominalDate, deflactorDictionary, data[iDeflactor], 0);
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
						transformDataToReal(data, deflactorDictionary, 	baseRealNominalDate, otherDataProperties);

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
							setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, settings.possibleYTickMultiples, settings.rangeProportion);
						}



					} 

					// transform to nominal				
					else {
						//DEBUG && console.log("transform to nominal");

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
							setYAxisRange(layout, data, settings.numberOfIntervalsInYAxis, settings.possibleYTickMultiples, settings.rangeProportion);
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


		// CASE 8. Este caso pide mostrar todo el eje x. EN ESTE CASO EL RELAYOUT HAY QUE AJUSTAR EL EJE X, INCLUIR TAMBIEM EL CAMBIO DE X AXIS LABELS.
		else if (relayoutData["xaxis.autorange"] === true) {

			//DEBUG && console.log('xaxis.autorange=true');
			//DEBUG && console.log('layout on all clicked',layout);
			layout.xaxis.range[0] = makeDateComplete(layout.xaxis.range[0]);
			layout.xaxis.range[1] = makeDateComplete(layout.xaxis.range[1]);

			if(layout.xaxis.range[0] !== initialDate || 
				 layout.xaxis.range[1] !== endDate){
				if (!isUnderRelayout) {					
					initialDate = makeDateComplete(layout.xaxis.range[0]);
					endDate = makeDateComplete(layout.xaxis.range[1]);
					//layout.xaxis.autorange=false;


					//DEBUG && console.log("initial Date",initialDate);
					//DEBUG && console.log("endDate", endDate);
					// get ticktext and tickvals based on width and parameters
					ticktextAndTickvals = aoPlotlyAddOn.getTicktextAndTickvals(
						initialDate,
						endDate,
						settings.textAndSpaceToTextRatio,
						currentFrequency,
						layout.xaxis.tickfont.family,
						layout.xaxis.tickfont.size,
						divWidth,
						layout.margin.l,
						layout.margin.r
					);


					flag = false;
					if(transformToReal){

						loadData(data,"nominal");

						newBaseRealNominalDate = setBaseRealNominalDateAsString(settings.baseRealDate, 
																																		layout.xaxis.range[0],
																																		layout.xaxis.range[1],
																																		minDateAsString,
																																		maxDateAsString
																																	 );
						//DEBUG && console.log("newBaseRealNominalDate",newBaseRealNominalDate);
						//DEBUG && console.log("baseRealNominalDate",baseRealNominalDate);
						if(newBaseRealNominalDate !== baseRealNominalDate){
							baseRealNominalDate =newBaseRealNominalDate;
							setDeflactorDictionaryAtDate(baseRealNominalDate, deflactorDictionary, data[iDeflactor], 0);					

						}
						//DEBUG && console.log("newBaseRealNominalDate",newBaseRealNominalDate);
						transformDataToReal(data, deflactorDictionary, 	baseRealNominalDate, otherDataProperties);

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


						//DEBUG && console.log("baseIndexDate", baseIndexDate);
						transformDataToBaseIndex(data, 
																		 makeDateComplete(layout.xaxis.range[0]), 
																		 currentAggregation);					

					} 					

					baseIndexDate = makeDateComplete(layout.xaxis.range[0]);	


					//DEBUG && console.log("layout before read x axis range",layout);

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
					//DEBUG && console.log("rangeselector", layout.xaxis.rangeselector);

					Plotly.redraw(myPlot).then(() => {
						//DEBUG && console.log("plot schema", Plotly.PlotSchema.get());
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
				//DEBUG && console.log(layout);
				//DEBUG && console.log(layout.xaxis.range[1]);
				//DEBUG && console.log(typeof relayoutData['xaxis.range[0]']);
				//DEBUG && console.log(typeof relayoutData['xaxis.range[1]']);

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

				//DEBUG && console.log('x0:' + x0 + '-x1:' + x1);
				flag = true;
				//DEBUG && console.log(11);
			} else if (typeof relayoutData["xaxis.range"] !== "undefined") {
				//DEBUG && console.log(12);
				x0 = relayoutData["xaxis.range"][0];
				x1 = relayoutData["xaxis.range"][1];
				flag = true;
			}

			//  Changes to the X axis Range. Change x axis range display.
			if (flag === true) {
				if (!isUnderRelayout) {
					//DEBUG && console.log("x0 before process", x0);
					//DEBUG && console.log("x1 before process", x1);

					//x0 = makeDateComplete(x0);
					//x1 = makeDateComplete(x1);
					layout.xaxis.range[0]=x0;
					layout.xaxis.range[1]=x1;

					//DEBUG && console.log("x0 after complete date",x0);
					//DEBUG && console.log("x1 after",x1);


					flag = false;
					if(transformToReal){

						loadData(data,"nominal");

						newBaseRealNominalDate = setBaseRealNominalDateAsString(settings.baseRealDate, 
																																		layout.xaxis.range[0],
																																		layout.xaxis.range[1],
																																		minDateAsString,
																																		maxDateAsString
																																	 );
						if(newBaseRealNominalDate !== baseRealNominalDate){
							baseRealNominalDate =newBaseRealNominalDate;
							setDeflactorDictionaryAtDate(baseRealNominalDate, deflactorDictionary, data[iDeflactor], 0);					

						}
						//DEBUG && console.log("newBaseRealNominalDate",newBaseRealNominalDate);
						transformDataToReal(data, deflactorDictionary, 	baseRealNominalDate, otherDataProperties);

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
						settings.textAndSpaceToTextRatio,
						currentFrequency,
						layout.xaxis.tickfont.family,
						layout.xaxis.tickfont.size,
						divWidth,
						layout.margin.l,
						layout.margin.r
					);

					//DEBUG && console.log('new y range',yMinValue, yMaxValue);
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
					//DEBUG && console.log('updated yaxis range',layout);

					//DEBUG && console.log(layout);
					Plotly.redraw(myPlot).then(() => {
						isUnderRelayout = false;
					});

				}
				isUnderRelayout = true;
			} // end of if flag is true
		} // end of 'else' relayout cases, CASE 9

	}); // end of handling of relayout event


	//});
	//});			






}	    

   	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	    
	    
// measure length of displayed string  in pixels
function stringLength(string, fontFamily, size) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  
  ctx.font = ''+size+'px '+fontFamily;
  
  return ctx.measureText(string).width;
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
        
// determine the ticktext and tickvals that best fit, given a target frequency display (annual, monthly, etc), and a space between tick text
// the space between tick text (textAndSpaceToTextRatio) defined as
// the ration of  (tick text length + space to next tick) to (tick text length)
// from: initial date as string 'yyyy-mm-dd'
// targetFrequency, a string, like  'annual', 'monthly', etc. see below in code for options.
aoPlotlyAddOn.getTicktextAndTickvals = function (from, to, textAndSpaceToTextRatio, targetFrequency, fontFamily, fontSize, divWidth, leftMargin, rightMargin){
  //var initialDate = new Date();  
  //var daysStep = 0, monthsStep =0;

  var strippedFrom = stripDateIntoObject(from);
  var strippedTo = stripDateIntoObject(to);
  
  //DEBUG && console.log('parsed from to', strippedFrom, strippedTo);
  
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
      initialDate: (strippedFrom.month  <4 || strippedFrom.month >9)? new Date(strippedFrom.year, -1+3*Math.floor((strippedFrom.month)/3),31): new Date(strippedFrom.year, -1+3*Math.floor((strippedFrom.month)/3),30),
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
      j===0?0:(divWidth-leftMargin-rightMargin) /(j*stringLength(frequencyData[i].string,fontFamily,fontSize));    
    if(frequencyData[i].xSpace >= textAndSpaceToTextRatio){
      date = new Date(frequencyData[i].initialDate.getTime());
      //DEBUG && console.log('solution found at', frequencyData[i]);
      //DEBUG && console.log('initial Date',frequencyData[i].initialDate);
      while(date <= toAsDate){
        result.tickvals.push(''+date.getFullYear()+'-'+padTo2(date.getMonth()+1)+'-'+padTo2(date.getDate()));
				
				if(frequencyData[i].stringName === "date"){
					result.ticktext.push(''+date.getFullYear()+'-'+padTo2(date.getMonth()+1)+'-'+padTo2(date.getDate()));
				}
				else if (frequencyData[i].stringName === "month"){
					result.ticktext.push(months[date.getMonth()]+' '+date.getFullYear());
				}
				else if (frequencyData[i].stringName === "quarter"){
					result.ticktext.push('Q' +Math.ceil((date.getMonth()+1)/3)+' '+date.getFullYear());
				}
				else if (frequencyData[i].stringName === "semester"){
					result.ticktext.push('H'+Math.ceil((date.getMonth()+1)/6)+' '+date.getFullYear());
				}
				else if (frequencyData[i].stringName === "year"){
					result.ticktext.push(''+date.getFullYear());
				}
				else if (frequencyData[i].stringName === "year-month"){
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
  //DEBUG && console.log(frequencyData.length);
  //DEBUG && console.log('target Frequency',targetFrequency);
  //DEBUG && console.log(frequencyData);
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
        //DEBUG && console.log(key,periodKeys[key]);
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
          //DEBUG && console.log(key,periodKeys[key]);
          if (periodKeys[key]) {
            priorClose[key] = 'undefined';
            priorCumulative[key]=0.0;
          }
        }
      }

      // iterates over trace points
      for (j = data[i].xOriginal.length - 1; j > -1; j--) {
        //DEBUG && console.log('j',j);
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
            if ((nextXString != 'undefined' && nextXString >= currentLimits.ends[key]) || nextBankingDate.string >= currentLimits.ends[key]) {

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
 


// calculates mode as excel does
function myMod(n, d) {
  return (n - d * Math.floor(n / d));

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

// get next non holiday day for a given date as year, month, day
// year, month 1-12, day 1-31
function getNextNonUSBankingWorkingDay(year, month, day) {

  var plainDate = new Date(year, month - 1, day);

  do {
    plainDate.setDate(plainDate.getDate() + 1);

  } while (checkIsUSBankingHoliday(plainDate.getFullYear(), plainDate.getMonth() + 1, plainDate.getDate()) != 'undefined');

  return plainDate.getFullYear() + '-' + ((plainDate.getMonth() + 1) < 10 ? '0' : '') + (plainDate.getMonth() + 1) + '-' + (plainDate.getDate() < 10 ? '0' : '') + plainDate.getDate();
}

// get prior non holiday day for a given date as year, month, day
// year, month 1-12, day 1-31
function getPriorNonUSBankingWorkingDay(year, month, day) {

  var plainDate = new Date(year, month - 1, day);

  do {
    plainDate.setDate(plainDate.getDate() - 1);

  } while (checkIsUSBankingHoliday(plainDate.getFullYear(), plainDate.getMonth() + 1, plainDate.getDate()) != 'undefined');

  return plainDate.getFullYear() + '-' + ((plainDate.getMonth() + 1) < 10 ? '0' : '') + (plainDate.getMonth() + 1) + '-' + (plainDate.getDate() < 10 ? '0' : '') + plainDate.getDate();
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
		
		/*if(datesReady){*/
		currentDate = new Date(newArray[i][xSeriesName]);
		/*}*/
		/*
		else {
			currentDate= localProcessDate("" +
						 !yqlGoogleCSV ? newArray[i][xSeriesName] :  localGoogleMDYToYMD(newArray[i][xSeriesName])+
						 xDateSuffix, timeOffsetText);
			currentDate = new Date(transformToEndOfMonth ? localChangeDateToEndOfMonth(currentDate) : currentDate);				 
		}
		*/
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
								/*if(datesReady){*/
								currentDate = new Date(newArray[i][xSeriesName]);
								/*}*/
								/*
								else {
									currentDate= localProcessDate(
										"" +
										!yqlGoogleCSV ? newArray[i][xSeriesName] :  localGoogleMDYToYMD(newArray[i][xSeriesName])+
										xDateSuffix, timeOffsetText);
									currentDate = new Date(transformToEndOfMonth ? localChangeDateToEndOfMonth(currentDate) : currentDate);				 
								}*/
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
							/*if(datesReady){*/
							currentDate = new Date(newArray[i][xSeriesName]);
							/*}*/
							/*else {
								currentDate= localProcessDate(
									"" +
									!yqlGoogleCSV ? newArray[i][xSeriesName] :  localGoogleMDYToYMD(newArray[i][xSeriesName])+
									xDateSuffix, timeOffsetText);
								currentDate = new Date(transformToEndOfMonth ? localChangeDateToEndOfMonth(currentDate) : currentDate);				 
							}*/							
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
				return 	new Date(b[xSeriesName]==="" || b[xSeriesName]===null ? "0001-01-01": localGoogleMDYToYMD(b[xSeriesName]))-
					new Date(a[xSeriesName]==="" || a[xSeriesName]===null ? "0001-01-01": localGoogleMDYToYMD(a[xSeriesName]));

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
	    
function processYqlGoogleCSVTags(dataSources){
	var j, jLimit = dataSources.traces.length;
	var key;

	if(typeof dataSources["xSeriesName"] !== "undefined"){
		// set xSeriesName to tags in case yqlGoogleCSV
		for (key in tags){
			if (tags.hasOwnProperty(key)) {
				if(tags[key].toString().trim() === dataSources["xSeriesName"].toString()){
					dataSources["xSeriesName"] = key;
				}
			}
		}
	}

	for (j=0; j< jLimit; j++){			
		for (key in tags){
			if (tags.hasOwnProperty(key)) {
				if(tags[key].toString().trim() === dataSources.traces[j].xSeriesName.toString()){
					dataSources.traces[j].xSeriesName = key;
				}
				if(tags[key].toString().trim() === dataSources.traces[j].ySeriesName.toString()){
					dataSources.traces[j].ySeriesName = key;
				}
			}
		}
	}
}	    
	   
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
			if(tableParams[key]["processDates"]){
				xSeriesName = key;
				xDateSuffix = tableParams[key]["xDateSuffix"];
				if(typeof tableParams[key]["onlyAddXDateSuffix"] !== "undefined"){
					onlyAddXDateSuffix = tableParams[key]["onlyAddXDateSuffix"];
				} else{
					onlyAddXDateSuffix = false;
				}
				
				transformToEndOfMonth = false;
				if(typeof tableParams[key]["postProcessDate"] !== "undefined" && tableParams[key]["postProcessDate"] === "end of month"){ 
					transformToEndOfMonth = true;
				}
				
				if(yqlGoogleCSV){				   
					for(i = 0; i < iLimit ; i++){
						if(allRows[i][xSeriesName]!=="" && allRows[i][xSeriesName]!==null){
							allRows[i][xSeriesName] = localProcessDate(""+
											 localGoogleMDYToYMD(allRows[i][xSeriesName])+ 
											xDateSuffix, timeOffsetText);
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
	    
	    

function setTablesParametersSortPreprocessing(tableParams, dataSources){
	var traces = dataSources.traces;
	var xSeriesName, ySeriesName;

	// number of traces to be read on this data source
	var jLimit = traces.length;

	// determine number of xSeriesNames being used and fill y values for each, cycle through traces array
	for (var j=0; j < jLimit; j++){

		// set temporary variable
		xSeriesName = traces[j].xSeriesName;
		ySeriesName = traces[j].ySeriesName;

		// set xSeriesName in table of xSeriesNames
		if(!tableParams.hasOwnProperty(xSeriesName)){
			tableParams[xSeriesName] = {};
			tableParams[xSeriesName]["yNames"] = [];
			tableParams[xSeriesName]["yCalculateAdjustedClose"] = [];
		}


		// add yName if not yet added
		if(tableParams[xSeriesName]["yNames"].indexOf(ySeriesName) === -1){
			tableParams[xSeriesName]["yNames"].push(ySeriesName);
			if(typeof dataSources["calculateAdjustedClose"] !== "undefined"){
				tableParams[xSeriesName]["yCalculateAdjustedClose"].push(dataSources["calculateAdjustedClose"]);
			} else if(typeof traces[j]["calculateAdjustedClose"] !== "undefined"){
				tableParams[xSeriesName]["yCalculateAdjustedClose"].push(traces[j]["calculateAdjustedClose"]);
			} else{
				tableParams[xSeriesName]["yCalculateAdjustedClose"].push(false);
			}	
		}

		// set parameters from general options

		// add sort info
		if(typeof dataSources["sort"] !== "undefined"){
			tableParams[xSeriesName]["sort"] =  dataSources["sort"];				
		} 

		// add xDateSuffix info
		if(typeof dataSources["xDateSuffix"] !== "undefined"){
			tableParams[xSeriesName]["xDateSuffix"] =  dataSources["xDateSuffix"];				
		} 

		// add firstItemToRead info
		if(typeof dataSources["firstItemToRead"] !== "undefined"){
			tableParams[xSeriesName]["firstItemToRead"] =  dataSources["firstItemToRead"];				
		} 

		// add processDate info
		if(typeof dataSources["processDates"] !== "undefined"){
			tableParams[xSeriesName]["processDates"] =  dataSources["processDates"];				
		}

		// add postProcessDate info
		if(typeof dataSources["postProcessDate"] !== "undefined"){
			tableParams[xSeriesName]["postProcessDate"] =  dataSources["postProcessDate"];				
		} 
		
		// add onlyAddXDateSuffix info
		if(typeof dataSources["onlyAddXDateSuffix"] !== "undefined"){
			tableParams[xSeriesName]["onlyAddXDateSuffix"] =  dataSources["onlyAddXDateSuffix"];				
		} 


		// set parameters from trace options

		// add sort info, default false
		if(typeof traces[j]["sort"] !== "undefined"){
			tableParams[xSeriesName]["sort"] =  traces[j]["sort"];				
		} else{
			if(typeof tableParams[xSeriesName]["sort"] === "undefined")
				tableParams[xSeriesName]["sort"] =  false;	
		}

		// add xDateSuffix info, default ""
		if(typeof traces[j]["xDateSuffix"] !== "undefined"){
			tableParams[xSeriesName]["xDateSuffix"] =  traces[j]["xDateSuffix"];				
		} else{
			if(typeof tableParams[xSeriesName]["xDateSuffix"] === "undefined")
				tableParams[xSeriesName]["xDateSuffix"] =  "";	
		}

		// add firstItemToRead info, default first
		if(typeof traces[j]["firstItemToRead"] !== "undefined"){
			tableParams[xSeriesName]["firstItemToRead"] =  traces[j]["firstItemToRead"];				
		} else{
			if(typeof tableParams[xSeriesName]["firstItemToRead"] === "undefined")
				tableParams[xSeriesName]["firstItemToRead"] =  "first";	
		}

		// add processDate info, default true
		if(typeof traces[j]["processDates"] !== "undefined"){
			tableParams[xSeriesName]["processDates"] =  traces[j]["processDates"];				
		} else{
			if(typeof tableParams[xSeriesName]["processDates"] === "undefined")
				tableParams[xSeriesName]["processDates"] =  true;	
		}

		// add postProcessDate info, default undefined
		if(typeof traces[j]["postProcessDate"] !== "undefined"){
			tableParams[xSeriesName]["postProcessDate"] =  traces[j]["postProcessDate"];				
		} 
		
		// add onlyAddXDateSuffix info, default undefined
		if(typeof  traces[j]["onlyAddXDateSuffix"] !== "undefined"){
			tableParams[xSeriesName]["onlyAddXDateSuffix"] =  traces[j]["onlyAddXDateSuffix"];				
		} 

			
	}	
}


	
function splitSubtablesAndTrim(allRows, tableParams, dataSources, initialDateAsDate){
	var newArray=[];
	var i=0, iLimit = allRows.length;
	var j, jLimit,k, l, lStep;
	var xSeriesName, ySeriesName;
	var dateString = "";

	for (var key in tableParams) {
		if (tableParams.hasOwnProperty(key)){
			xSeriesName = key;
			newArray =[];
			newArray.length= iLimit;
			var yNamesArray;

			
			// set reading parameter by reading order
			if( tableParams[key]["firstItemToRead"] === "first"){
				l = 0; 
				lStep = 1;
			} else{
				l = iLimit -1;
				lStep = -1;
			} 
			
			// k: number of read items
			k=0;
			
			jLimit = tableParams[key]["yNames"].length;
			
			yNamesArray = tableParams[key]["yNames"];
			//DEBUG && console.log("yNamesArray: ", yNamesArray);
			
			//DEBUG && console.log("xSeriesName: ", xSeriesName);
			//DEBUG && console.log("iLimit ", iLimit);
			//DEBUG && console.log("allRows in split subtables", allRows);
			// read data into ordered and subtables
			for(i=0; i<iLimit; i++){
				dateString = allRows[l][xSeriesName];
				if(dateString !== "" && dateString !== null){
					if(new Date(dateString)>= initialDateAsDate){
						newArray[k]={};
						newArray[k][xSeriesName] = dateString;
						for(j=0; j < jLimit; j++){
							ySeriesName = yNamesArray[j];
							newArray[k][ySeriesName]=allRows[l][ySeriesName];
						}
						k++;
						//DEBUG && console.log("l: ", l);
					}	
				}
				l+=lStep;
			}
			//DEBUG && console.log("k elements",k);
			//DEBUG && console.log("new array", newArray);
			// adjust array length to read items.
			newArray.length=k;
			tableParams[key]["allRows"] = newArray;
		}
	}
}	
	    
function sortSubTables(tableParams){
	var delta = 0.0;

	for (var key in tableParams) {
		if (tableParams.hasOwnProperty(key)){
			if(tableParams[key]["sort"]){
				tableParams[key]["allRows"].sort(sortByDatesAsStringsAllDatesExist(key));
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
	
	console.log(dateAsYYYYMMDDString.substr(0,4));
	
	var dayBefore = new Date(
		Number(dateAsYYYYMMDDString.substr(0,4)),
		Number(dateAsYYYYMMDDString.substr(5,2))-1,
		Number(dateAsYYYYMMDDString.substr(8,2))
	);
	
	console.log(dayBefore);
	
	
	dayBefore = new Date(dayBefore.getTime() -24*60*60*1000);
	
	console.log(dayBefore);

	
	console.log(dayBefore);
	console.log(dayBefore.getFullYear());
	
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
	 
	 

function processFrequenciesDates(data, periodKeys){
	var iLimit=0, j=0, jLimit =0;

	var timeOffset  = (new Date()).getTimezoneOffset();
	var timeOffsetText ="";
	var key = "";

	timeOffsetText = (timeOffset > 0 ) ? 	("-"+convertOffsetToHHMM(timeOffset)): ("+"+convertOffsetToHHMM(-timeOffset));

	iLimit = data.length;

	for (var i=0; i < iLimit ;i++){
		for(key in periodKeys){
			if (periodKeys.hasOwnProperty(key)) {
				if(periodKeys[key]=== true){
					//DEBUG && console.log("[key]",key);
					//DEBUG && console.log("data[i][key]",data[i][key]);
					jLimit = data[i][key].x.length;
					for(j=0; j<jLimit;j++){	
							data[i][key].x[j] = processDate(data[i][key].x[j], timeOffsetText);
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

	//DEBUG && console.log(offsetText);

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
	
	DEBUG && console.log("recessionsArray: ", recessionsArray);

	DEBUG && console.log("lastRecessionInBaseEndedAsDate",lastRecessionInBaseEndedAsDate);
	
	// get position of new recessions
	for(var i=0; i < iLimit ; i++){
		DEBUG && console.log("recessionsArray[i][x0]: ", recessionsArray[i][x0]);
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
	
	DEBUG && console.log(array);
	
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
	DEBUG && console.log(arrayOfJsons);
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
	
	DEBUG && console.log(recessions);
	return recessions;
}	 
	 
/*function directXMLHttpRequest(options, onreadyFunction) {
	var xhttp = new XMLHttpRequest();
	// use "arraybuffer" for zip files.
	xhttp.responseType = options.responseType;
	
	// once file is read, afterFileLoaded function is triggered
	
	xhttp.onreadystatechange = onreadyFunction(xhttp);
	
	DEBUG && console.log("XMLHttpRequest options: ", options);
	
	xhttp.open(
		options.method,
		options.url,
		options.async
	);

	xhttp.send();
}*/
	 	    			      

function directXMLHttpRequest(options, onreadyFunction, callback) {
	var xhttp = new XMLHttpRequest();
	// use "arraybuffer" for zip files.
	xhttp.responseType = options.responseType;
	
	DEBUG && console.log("XMLHttpRequest options: ", options);
	
	xhttp.open(
		options.method,
		options.url,
		options.async
	);

	xhttp.send();
	
	// once file is read, afterFileLoaded function is triggered
	// this version checks readyState and status at this level
	xhttp.onreadystatechange = function(){
		DEBUG && console.log("readyState= ", xhttp.readyState);
		DEBUG && console.log("status= ", xhttp.status);
		
		// xhttp.readyState == 4, the transfer has completed and the server closed the connection.
		if (xhttp.readyState == 4) {
			
			if(xhttp.status == 200) {
				// no error passed
				DEBUG && console.log("calling function(error, http){ afterFredZipFileLoaded()}");
				onreadyFunction(null,xhttp).then(function(){ return callback(null)});
			} else {
				// unsuccessful zip read, call back with no processing
				callback(null);
			}
		}
	}
	
	
}
	
function afterFredZipFileLoaded(error, xhttp, usRecessions, callback) {
	
	DEBUG && console.log("afterFredZipFileLoaded started");
	DEBUG && console.log("passed error:", error);
	DEBUG && console.log("passed xhttp:", xhttp);
	
	if (!error) {
			// create an instance of JSZip
			var zip = new JSZip();

			// loads the zip content into the zip instance
			zip.loadAsync(xhttp.response).then(
				function (zip) {
					return zip.file("USRECP_1.txt").async("string");
				}).then(
				function (readTxt) {
					DEBUG && console.log("readTxt",readTxt);
					var readJson = textToArrayOfJsons(readTxt,"\r\n","\t");
					var fredRecessionsArray = getRecessionsFromUSRecField(readJson);
					addRecessionsTo(fredRecessionsArray,usRecessions);
					DEBUG && console.log("usRecessions: ",usRecessions);
				}
			).then(callback(null););
	} else {
		DEBUG && console.log("fredZip error:", error);
		callback(null);
	}
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
	var jLimit = 0, j = 0;

	for (var i = 0; i < iLimit; i++) {
		data[i].x = [];
		data[i].y = [];
		jLimit = data[i][frequency].x.length;

		for (j = 0; j < jLimit; j++) {
			if (!isNaN(data[i][frequency][aggregation][j])) {
				data[i].x.push(data[i][frequency].x[j]);
				data[i].y.push(data[i][frequency][aggregation][j]);
			}
		}
	}
}

// loads uncompared data (data[i].uncompared.x and data[i].uncompared.y) into data[i].x and data [i].y
function loadData(data, key) {
	var iLimit = data.length;
	var j = 0, jLimit = 0;

	for (var i = 0; i < iLimit; i++) {
		jLimit = data[i][key].x.length;
		data[i].x = [];
		data[i].y = [];

		for (j = 0; j < jLimit; j++) {
			data[i].x.push(data[i][key].x[j]);
			data[i].y.push(data[i][key].y[j]);
		}
	}
}




// save data[i].x and data[i].y into data[i].property.x and data[i].property.y
function saveDataXYIntoPropertyXY(data, xProperty, yProperty) {
	var iLimit = data.length;
	var jLimit = 0, j = 0;

	for (var i = 0; i < iLimit; i++) {
		// duplicates data into base for future use
		data[i][xProperty] = [];
		data[i][yProperty] = [];
		jLimit = data[i].x.length;

		for (j = 0; j < jLimit; j++) {
			data[i][xProperty].push(data[i].x[j]);
			data[i][yProperty].push(data[i].y[j]);
		}
	}
}

function saveDataXYIntoProperty(data, property) {
	var iLimit = data.length;
	var jLimit = 0, j = 0;
	
	for (var i = 0; i < iLimit; i++) {
		// duplicates data into base for future use
		data[i][property] = {};
		data[i][property].x =[];
		data[i][property].y =[];
		jLimit = data[i].x.length;
		for (j = 0; j < jLimit; j++) {
			data[i][property].x.push(data[i].x[j]);
			data[i][property].y.push(data[i].y[j]);
		}			
	}
}

function loadDataIntoXYFromPropertyXY(data, propertyForX, propertyForY) {
	var iLimit = data.length;
	var j = 0;
	var jLimit = 0;
	
	for (var i = 0; i < iLimit; i++) {
		data[i].x = [];
		data[i].y = [];
		jLimit = data[i][propertyForX].length;
	
		for (j = 0; j < jLimit; j++) {
			data[i].x.push(data[i][propertyForX][j]);
			data[i].y.push(data[i][propertyForY][j]);
		}
	}
}




// deep copy of objects
function deepCopy(obj) {
	var i = 0;
	var out = Object.prototype.toString.call(obj) === "[object Array]" ? [] : {};

	if (Object.prototype.toString.call(obj) === "[object Array]") {
		var len = obj.length;
		for (; i < len; i++) {
			//out[i] = arguments.callee(obj[i]);
			out[i] = deepCopy(obj[i]);
		}
		return out;
	}

	if (typeof obj === "object") {
		out = {};
		for (i in obj) {
			//out[i] = arguments.callee(obj[i]);
			out[i] = deepCopy(obj[i]);
		}
		return out;
	}
	return obj;
}

// add default properties to Json Object
function setJsonDefaults(jsonDefaults, json) {
	var i = 0;
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
			//json[i] = arguments.callee(jsonDefaults[i], json[i]);
			json[i] = setJsonDefaults(jsonDefaults[i], json[i]);
		}
		return json;
	}
	return json || jsonDefaults;
}

// function to find y range in specified x range for all data
// x0 and x1 as , data object contains x and y arrays.
// returns array with [minValue, maxValue]
function getYminYmax(x0, x1, data) {
	var minValue, maxValue;
	var x0AsDate = new Date(x0);
	var x1AsDate = new Date(x1);
	//DEBUG && console.log(x0AsDate);
	for (var i = 0; i < data.length; i++) {
		var aTrace = data[i];
		//DEBUG && console.log(aTrace.x.length);
		for (var j = 0; j < aTrace.x.length; j++) {
			var x = new Date(aTrace.x[j]);
			//DEBUG && console.log(x);
			if (x >= x0AsDate && x <= x1AsDate) {
				var aValue = Number(aTrace.y[j]);
				//DEBUG && console.log('aValue'+aValue+',min:'+minValue+',max:'+maxValue);
				if (maxValue === undefined || aValue > maxValue) {
					maxValue = aValue;
				}
				if (minValue === undefined || aValue < minValue) {
					minValue = aValue;
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
// returns array with [minValue, maxValue]
function getDataXminXmaxAsString(data) {
	var minValue, maxValue, x = new Date();
	var iLimit = data.length;
	var jLimit = 0;
	var minMax =["",""];
	

	for (var i = 0; i < iLimit; i++) {
		jLimit = data[i].x.length;
		for (var j = 0; j < jLimit; j++) {
			x = new Date(data[i].x[j]);
			if (typeof maxValue === "undefined" || x > maxValue) {
				maxValue = x;
				minMax[1]= data[i].x[j];
			}
			if (typeof minValue === "undefined" || x < minValue) {
				minValue = x;
				minMax[0]= data[i].x[j];
			}
		}
	}

	return minMax;
}

	 
	 
	 
// 8. UPDATE MENUS

// add menus to updatemenus if specified
function addToUpdateMenus(newUpdateMenu, updateMenus, layout) {
	//DEBUG && console.log("newUpdateMenu", newUpdateMenu);
	//DEBUG && console.log("updateMenus", updateMenus);

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
function setYaxisLayoutRange(yAxisType, minMaxInitialY, layout, numberOfIntervalsInYAxis, possibleYTickMultiples, rangeProportion) {
	var yMinMax =[];
	
	yMinMax = getRoundedYAxisRange( minMaxInitialY[0], minMaxInitialY[1], yAxisType, numberOfIntervalsInYAxis, possibleYTickMultiples, rangeProportion);
	
	minMaxInitialY[1] = yMinMax[1];
	minMaxInitialY[0] = yMinMax[0];	
	//DEBUG && console.log("endY0", minMaxInitialY[0]);
	//DEBUG && console.log("endY1", minMaxInitialY[1]);
	
	if (yAxisType === "log") {
		minMaxInitialY[0] =
			Math.log(minMaxInitialY[0] <= 0 ? 0.0000001 : minMaxInitialY[0]) /
			Math.log(10);
		minMaxInitialY[1] =
			Math.log(minMaxInitialY[1] <= 0 ? 0.0000001 : minMaxInitialY[1]) /
			Math.log(10);
	}
	
	//DEBUG && console.log("resulting y range - y0",minMaxInitialY[0],"y1", minMaxInitialY[0]);
	//DEBUG && console.log("isNaN y0 y1",isNaN(minMaxInitialY[0]), isNaN(minMaxInitialY[0]));
	

	if(!isNaN(minMaxInitialY[0]) && !isNaN(minMaxInitialY[1] )){
		layout.yaxis.range = [minMaxInitialY[0], minMaxInitialY[1]];
		layout.yaxis.autorange = false; 
	} else{
		//layout.yaxis.autorange = true; 
	}


}

// sets the y axis range in the layout based on the y range for the available data array, y values ovr the xaxis range.
function setYAxisRange(layout, data, numberOfIntervalsInYAxis,possibleYTickMultiples, rangeProportion) {

	// obtain y axis range for the displayed x range
	var minMaxInitialY = getYminYmax(
		layout.xaxis.range[0],
		layout.xaxis.range[1],
		data
	);

	// set y axis layout range
	setYaxisLayoutRange(layout.yaxis.type, minMaxInitialY, layout, numberOfIntervalsInYAxis,possibleYTickMultiples, rangeProportion);
}

// returns y axois layout range as a two element array
function returnYaxisLayoutRange(yAxisType, yMinValue, yMaxValue,numberOfIntervalsInYAxis, possibleYTickMultiples, rangeProportion) {
	var yaxisRange = [];
	var yMinMax =[];
	
	yMinMax = getRoundedYAxisRange(yMinValue, yMaxValue, yAxisType, numberOfIntervalsInYAxis, possibleYTickMultiples, rangeProportion);
	

	yMaxValue = yMinMax[1];
	yMinValue = yMinMax[0];
	//DEBUG && console.log("endY0", yMinValue);
	//DEBUG && console.log("endY1", yMaxValue);
	
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

		//DEBUG && console.log('baseIndexDate',baseIndexDate, 'found x date:',data[i].x[jBase]);
		//DEBUG && console.log(divider);
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
     //DEBUG && console.log(number % multiple);
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
     //DEBUG && console.log(number % multiple);
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


function getRoundedYAxisRange(yMin, yMax, yAxisType, numberOfIntervalsInYAxis, possibleYTickMultiples, rangeProportion){
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
function fillStringUpTo(baseString, stringLengthInPixels, fontFamily, fontSize){
	var newString= baseString;
	
			// measure length of displayed string  in pixels
		function stringLength(string, fontFamily, fontSize) {
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');

			ctx.font = ''+fontSize+'px '+fontFamily;

			return ctx.measureText(string).width;
			
		}
	
		for (var i=0; ; i++){
			
			if (stringLength(newString+" ", fontFamily, fontSize) > stringLengthInPixels){
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
	
	//DEBUG && console.log(element);
	//DEBUG && console.log(styling);
	
	for(var key in styling){
		
		element.style[key]=styling[key];
		
	}
	
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
		//DEBUG && console.log("change y axis type to original");
		//DEBUG && console.log("current yaxis type", layout.yaxis.type);
		//DEBUG && console.log("original yaxis type", originalLayout.yaxis.type);
		//DEBUG && console.log("settings.allowLogLinear", settings.allowLogLinear);
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
	for(var i=0; i<iLimit; i++){
		jLimit = data[i].xOriginal.length;
		
		// cycle through original traces
		for(j=0; j < jLimit; j++){
			date=data[i].xOriginal[j];
			if(typeof deflactorDictionary[date] ==="undefined"){
				k=setDeflactorDictionaryAtDate(date, deflactorDictionary, data[iDeflactor], k);
			}
		}
		
		// cycle through frequencies
		for(key in periodKeys){
			if (periodKeys.hasOwnProperty(key)) {
				if(periodKeys[key]=== true){
					jLimit = data[i][key].x.length;
					for(j=0; j < jLimit;j++){	
						date=data[i][key].x[j];
						if(typeof deflactorDictionary[date] ==="undefined"){
							k=setDeflactorDictionaryAtDate(date, deflactorDictionary, data[iDeflactor], k);
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
/* base real date could be "end of range", "end of domain", "beggining of range", beggining of domain", or a date "yyyy-mm-dd hh:mm:ss.sss-04:00"*/
function setBaseRealNominalDateAsString(baseRealDate,
																				rangeX0AsString,
																				rangeX1AsString,
																				domainX0AsString,
																				 domainX1AsString) {
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
		// it is a date
		if ( isNaN( baseRealDate.getTime() ) ) {  // d.valueOf() could also work
			// baseRealDate date is not valid, return default
			return domainX1AsString;
		}
		else {
			// baseReadDate date is valid
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
	var base = Number(deflactorDictionary[baseRealNominalDate]);
	
	//DEBUG && console.log("base", base);
	
	iLimit = data.length;
	for (var i = 0; i < iLimit; i++) {
		if(otherDataProperties[i].toggleRealNominal){
			jLimit = data[i].y.length;
			for (j = 0; j < jLimit; j++) {

				data[i].y[j] = base*data[i].y[j]/Number(deflactorDictionary[data[i].x[j]]);
			}
		}
	}
}


























aoPlotlyAddOn.findSpliceInfo = findSpliceInfo;	        
aoPlotlyAddOn.processCsvData = processCsvData;	  
	    
  
      
    // end section of library declaration  
      
     return aoPlotlyAddOn;
    }
  
    //define globally if it doesn't already exist
    if(typeof(aoPlotlyAddOn) === 'undefined'){
        window.aoPlotlyAddOn = defineLibrary();
    }
    else{
        DEBUG && console.log("aoPlotlyAddOn Library already defined.");
    }  
  
})(window);
