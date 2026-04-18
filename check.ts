// check.ts
fetch('https://firestore.googleapis.com/v1/projects/kazira-io/databases/(default)/documents')
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
