function mailFilter(query, onThread, onMessage, onEnd) {
  GmailApp.search(query).forEach(function(t) {
    if (onThread) {onThread(t);}
     GmailApp.getMessagesForThread(t).forEach(function(m) {
       if (onMessage) {onMessage(m);}
     });
   });
  if (onEnd) {onEnd();}
}

function test() {
  mailFilter("is:unread in:SomeLabel", null, function(m){Logger.log(m.getSubject())}) ;
}

