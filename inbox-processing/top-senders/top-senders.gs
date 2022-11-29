/**
 * A trigger function on a spreadsheet to create a report of top senders
 */
function onOpen(e) {
  var menu = SpreadsheetApp.getUi().createAddonMenu(); // Or DocumentApp or SlidesApp or FormApp.
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    // Add a normal menu item (works in all authorization modes).
    menu.addItem('Gmail analysis', 'startWorkflow');
  } else {
    // Add a menu item based on properties (doesn't work in AuthMode.NONE).
    var properties = PropertiesService.getDocumentProperties();
    var workflowStarted = properties.getProperty('workflowStarted');
    if (workflowStarted) {
      menu.addItem('Check workflow status', 'checkWorkflow');
    } else {
      menu.addItem('Start workflow', 'startWorkflow');
    }
    reportThreadsBySender();
  }
  menu.addToUi();
}

/**
 * Create a report in a sheet of the all the senders in an inbox
 * and create a top senders chart out of it.
 */
function reportThreadsBySender() {
  // create or get the report spread sheet
  // const id = "somid";
  // const sheet = SpreadsheetApp.openById(id);
  // SpreadsheetApp.setActiveSpreadsheet(sheet);
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log("-> openned sheet %s", sheet.getName());
  
  var threadsBySender = getInboxThreadsBySender();
  
  threadsBySender.forEach(function(v,k) {sheet.appendRow([k, v])});
  addTopSendersChart(sheet, 7);
  
}

/**
 * take a spreadsheet with column A and B where B is a count, and create
 * a top count table and a chart from it. Pass count as the limit of the that chart.
 */
function addTopSendersChart(spreadsheet, count) {
  const f =`=QUERY({Sheet1!A:B},"select Col1,Col2 order by Col2 desc limit ${count} label Col1 'Sender', Col2 '# of emails'",0)`
  var cell = spreadsheet.getRange("D5");
  cell.setFormula(f);

  var sheet = spreadsheet.getSheets()[0];
  var chart = sheet.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(sheet.getRange("D:E"))
      .setPosition(5, 7, 0, 0)
      .build();

  sheet.insertChart(chart);
}

/**
 * index inbox threads by sender, return a map of sender to an array of threads
 */
function getInboxThreadsBySender() {
  var threadsBySender = new Map();
  var max = 300;
  var start = 0;
  var limit = 100;
  while (max > limit) {
    var threads = GmailApp.search("in:inbox is:unread", start, limit);
    Logger.log("got all inbox threads %s", threads.length);
    var messages = GmailApp.getMessagesForThreads(threads);
    Logger.log("got all inbox threads %s", messages.length);

    //for (var i = 0; i < threads.length; i++) {
      for (var i = 0; i < messages.length; i++) {
      //let t = threads[i];
      // let sender = t.getMessages()[0].getFrom();
      let sender = messages[i][0].getFrom();
      if (!threadsBySender.get(sender)) {
        threadsBySender.set(sender, 0);
      }
      threadsBySender.set(sender, threadsBySender.get(sender) +1);
    }
    start += limit;
    max -= limit;
  }
  Logger.log("return thread by sender map %s", threadsBySender.length);
  return threadsBySender;

}
