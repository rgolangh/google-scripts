const PARENT_LABEL = "Github Projects";

// Extract all projects you inolved in from emails,
// and create a filter and a label for it.
function createGmailFiltersByGithubProjects() {
  const labels = GmailApp.getUserLabels();
  const onMessageAction = null;
  const onEndAction = null;
  // filter threads with notifications from github. to include mentions on ly add 'cc:mention@noreply.github.com'
  const query = "from:(notifications@github.com)";
  // cache for already handled listIds
  const listIdSet = new Set();

  const onThreadAction = (t) => {
    // get the repository from the subject.
    const subject = t.getFirstMessageSubject();
    // repo is in list-id header
    const listId = t.getMessages()[0].getHeader("List-Id").split(" ")[0];
    console.log(`list id is ${listId}`);
    // create a label for the repo if not exist
    if (null == labels.find((l) => l.getName() == listId)) {
      // check if this is already handled
      if (!listIdSet.has(listId)) {
        listIdSet.add(listId);
        createFilterForListId(listId,`${PARENT_LABEL}/${listId}`)
      } else {
        console.log(`alraeady handled listId ${listId}`);
      }
    } else {
      console.log(`label for ${listId} already exists`);
    }
  };
  
  mailFilter(query, onThreadAction, onMessageAction, onEndAction);
}

function parentProjectsLabel() {
  return GmailApp.createLabel(PARENT_LABEL);
}


function createFilterForListId(listId, labelName) {
  // go to editor services menu on the right and add GMail API service first

  // see filters ref https://developers.google.com/gmail/api/reference/rest/v1/users.settings.filters#Filter
  f = Gmail.newFilter();
  f.criteria = Gmail.newFilterCriteria();
  f.criteria.query = `list: ${listId}`;
  f.action = Gmail.newFilterAction();
  
  // gmailapp label doesn't have the id field. but has get by name query
  // gmail.users.labels has ids
  let label = Gmail.Users.Labels.list("me").labels.find(l => l.getName() == labelName)
  if (label == null) {
    const l = Gmail.newLabel();
    l.name = labelName;
    label = Gmail.Users.Labels.create(l, "me");
  }
  f.action.addLabelIds = [label.id];
  
  try {
    Gmail.Users.Settings.Filters.create(f, "me");
  } catch (e) {
    // probably already exists
    console.log(e);
  }
}

function testAddFilter() {
  GmailApp.getUserLabels().forEach((l) => console.log(l.getName()));
  // let fs = Gmail.Users.Settings.Filters.list("me");
  // fs.filter.forEach((f) => console.log(` filter ${f.id} with actions ${f.action.addLabelIds}`));
  // let target = `${PARENT_LABEL}/subns/test`;
  // let label = Gmail.Users.Labels.list("me").labels.find(l => l.getName() == target)
  // if (label != null) {
  //   console.log(`label name ${label.name} with id ${label.id}`);
  // } 
  // createFilterForListId("testAddFilter", "subns/test");
}
