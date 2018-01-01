function mailFilter(query, onThread, onMessage, onEnd) {
  GmailApp.search(query).forEach(function(t) {
    if (onThread) {onThread(t);}
     GmailApp.getMessagesForThread(t).forEach(function(m) {
       if (onMessage) {onMessage(m);}
     });
   });
  if (onEnd) {onEnd();}
}

function markDone(thread) {
  thread.moveToArchive();
  thread.markRead();
}

function logMessage(message) {
  Logger.log("%s - %s", message.getFrom(), message.getSubject())
}

// USAGE
function test() {
  mailFilter("is:unread newer_than:1d", null, logMessage, null)
}
