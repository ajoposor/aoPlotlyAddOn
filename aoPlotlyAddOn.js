(function(window){
    //I recommend this
    'use strict';
    function defineLibrary(){
        var aoPlotlyAddOn = {};    
   
// measure length of displayed string  in pixels
function stringLength(string, fontFamily, size) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  
  ctx.font = ''+size+'px '+fontFamily;
  
  return ctx.measureText(string).width;
}


// strip date as 'yyyy-mm-dd' into object
function stripDateIntoObject(dateString) {
  var obj = {};
  
  return obj = {
    string: dateString,
    year: Number(dateString.substr(0, 4)),
    month: Number(dateString.substr(5, 2)),
    day: Number(dateString.substr(8, 2))
  };
  
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

// determine the ticktext and tickvals that best fit, given a target frequency display (annual, monthly, etc), and a space between tick text
// the space between tick text (textAndSpaceToTextRatio) defined as
// the ration of  (tick text length + space to next tick) to (tick text length)
// from: initial date as string 'yyyy-mm-dd'
// targetFrequency, a string, like  'annual', 'monthly', etc. see below in code for options.
aoPlotlyAddOn.getTicktextAndTickvals = function (from, to, textAndSpaceToTextRatio, targetFrequency, fontFamily, fontSize, divWidth, leftMargin, rightMargin){
  var initialDate = new Date();  
  var daysStep = 0, monthsStep =0;

  var strippedFrom = stripDateIntoObject(from);
  var strippedTo = stripDateIntoObject(to);
  
  //console.log('parsed from to', strippedFrom, strippedTo);
  
  var fromAsDate = new Date(strippedFrom.year, strippedFrom.month-1, strippedFrom.day),
      toAsDate = new Date(strippedTo.year, strippedTo.month-1, strippedTo.day);
  
  
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
      console.log('solution found at', frequencyData[i]);
      console.log('initial Date',frequencyData[i].initialDate);
      while(date <= toAsDate){
        result.tickvals.push(''+date.getFullYear()+'-'+padTo2(date.getMonth()+1)+'-'+padTo2(date.getDate()));
        switch (frequencyData[i].stringName) {
            case 'date':
              result.ticktext.push(''+date.getFullYear()+'-'+padTo2(date.getMonth()+1)+'-'+padTo2(date.getDate()));
              break;
            case 'month':
              result.ticktext.push(months[date.getMonth()]+' '+date.getFullYear());
              break;
          case 'quarter':
              result.ticktext.push('Q' +Math.ceil((date.getMonth()+1)/3)+' '+date.getFullYear());
              break;           
          case 'semester':
              result.ticktext.push('H'+Math.ceil((date.getMonth()+1)/6)+' '+date.getFullYear());
              break;            
          case 'year':
              result.ticktext.push(''+date.getFullYear());
              break;
          case 'year-month':
              result.ticktext.push(''+date.getFullYear()+'-'+padTo2(date.getMonth()+1));
              break;
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
  console.log(frequencyData.length);
  console.log('target Frequency',targetFrequency);
  console.log(frequencyData);
  return result;
  
}

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

// data object contains arrays x and y. x has dates as 'yyyy-mm-dd', and may have a time and timezone suffix.
// periodKeys is an object with applicable keys as true
// if populates data object with frequencies keys (as per periodKeys) and x, close, change, etc. attributes
// if an attribute is not calculated, it contains 'N/A', so as to be filtered when data.x, .y are updated.
aoPlotlyAddOn.transformSeriesByFrequencies = function (data, periodKeys, endOfWeek) {
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
    priorXString, nextXString;
  
  for (var i = 0; i < data.length; i++) {
    // flags begin
    begin = true;
    
    //sets priorClose to undefined, as no prior trace point available
    for (key in periodKeys) {
      if (periodKeys.hasOwnProperty(key)) {
        //console.log(key,periodKeys[key]);
        if (periodKeys[key]) {
          priorClose[key] = 'undefined';
          priorCumulative[key]=0.0;
        }
      }
    }
    //console.log(priorClose);
    
    // iterates over trace points
    for (j = data[i].xOriginal.length - 1; j > -1; j--) {
      //console.log('j',j);
      // get periods ranges and dates
      currentDate = stripDateIntoObject(data[i].xOriginal[j]);
      priorXString = begin ? 'undefined' : data[i].xOriginal[j + 1];
      nextXString = (j > 0) ? data[i].xOriginal[j - 1] : 'undefined';
      
      currentY = data[i].yOriginal[j];
      priorBankingDate = stripDateIntoObject(
        getPriorNonUSBankingWorkingDay(currentDate.year,
          currentDate.month,
          currentDate.day));
      nextBankingDate = stripDateIntoObject(
        getNextNonUSBankingWorkingDay(currentDate.year,
          currentDate.month,
          currentDate.day));
      
      //console.log(currentY, priorBankingDate, nextBankingDate);
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
      //console.log('nextXString',nextXString);
      //console.log('currentLimits',currentLimits);
      
      for (key in periodKeys) {
        if (periodKeys.hasOwnProperty(key)) {
          // case: Period begin found
          if (priorXString < currentLimits.begins[key] || priorBankingDate.string < currentLimits.begins[key]){
            // allow average calculation.
            average[key].calculate= true;
          }
          
          // add value to average
          if(average[key].calculate=== true){
            average[key].sum += currentY;
            average[key].n += 1;
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
              average[key].sum=0;
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
            if (priorClose[key] != 'undefined') {
              temp = currentY - priorClose[key];
              data[i][key].change.unshift(temp);
              temp = (priorClose[key] != 0) ? temp / priorClose[key] : 'N/A';
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
            priorCumulative[key]+= currentY;
          }
          else { // case: within period
            // do something if applicable
          }
        } // periodKey has ownProperty
      }  // periodKey
      priorLimits = currentLimits;
    } // next j
  } // next i
} // end of function
 


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

  if (holidaysWeekdays['New Year'] == 0) {
    _USBankingHolidays.M['1/2'] = "New Year's Day";
  } else if (holidaysWeekdays['New Year'] < 6) {
    _USBankingHolidays.M['1/1'] = "New Year's Day";
  }

  if (holidaysWeekdays['Independence Day'] == 0) {
    _USBankingHolidays.M['7/5'] = "Independence Day";
  } else if (holidaysWeekdays['Independence Day'] == 6) {
    _USBankingHolidays.M['7/3'] = "Independence Day";
  } else {
    _USBankingHolidays.M['7/4'] = "Independence Day";
  }

  if (holidaysWeekdays['Christmas Day'] == 0) {
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
  
  
      
    // end section of library declaration  
      
     return aoPlotlyAddOn;
    }
  
    //define globally if it doesn't already exist
    if(typeof(aoPlotlyAddOn) === 'undefined'){
        window.aoPlotlyAddOn = defineLibrary();
    }
    else{
        console.log("aoPlotlyAddOn Library already defined.");
    }  
  
})(window);
