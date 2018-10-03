var utils = require('../utils')
var Issue = utils.issues.Issue

/**
 * session
 *
 * Takes a list of files and creates a set of file names that occur in subject
 * directories. Then generates a warning if a given subject is missing any
 * files from the set.
 */
const session = function missingSessionFiles(fileList) {
  const subjects = {}
  const sessions = {}
  const issues = []
  for (let key in fileList) {
    if (fileList.hasOwnProperty(key)) {
      const file = fileList[key]
      let filename

      if (!file || (typeof window != 'undefined' && !file.webkitRelativePath)) {
        continue
      }

      const path = file.relativePath
      if (!utils.type.isBIDS(path) || utils.type.file.isStimuliData(path)) {
        continue
      }
      let subject
      //match the subject identifier up to the '/' in the full path to a file.
      const match = path.match(/sub-(.*?)(?=\/)/)
      if (match === null) {
        continue
      } else {
        subject = match[0]
      }

      // suppress inconsistent subject warnings for sub-emptyroom scans
      // in MEG data
      if (subject == 'sub-emptyroom') {
        continue
      }

    var session
    //match the session identifier
    match = path.match(/ses-(.*?)(?=\/)/)
    if (match === null) {
      // global file of the subject or single session dataset
      // initialize an empty array if we haven't seen this subject before
      if (typeof subjects[subject] === 'undefined') {
        subjects[subject] = []
      }
      // files are prepended with subject name, the following two commands
      // remove the subject from the file name to allow filenames to be more
      // easily compared
      filename = path.substring(path.match(subject).index + subject.length)
      filename = filename.replace(subject, '<sub>')
      subjects[subject].push(filename)
    } else {
      session = match[0]
      // initialize an empty array if we haven't seen this subject and session before
      if (typeof sessions[subject] === 'undefined') {
        sessions[subject] = {}
      }
      if (typeof sessions[subject][session] === 'undefined') {
        sessions[subject][session] = []
      }
      // files are prepended with subject name and session,
      // the following commands remove the subject/session
      // from the file name to allow filenames to be more
      // easily compared
      filename = path.substring(path.match(session).index + session.length)
      filename = filename.replace(subject, '<sub>')
      filename = filename.replace(session, '<ses>')
      sessions[subject][session].push(filename)
    }
    }
  }

  var expected_subject_files = []
  var expected_subjects = []
    if (expected_subjects.indexOf(subjKey) < 0) {
      expected_subjects.push(subjKey)
    }
    for (var i = 0; i < subject.length; i++) {
      file = subject[i]
      if (expected_subject_files.indexOf(file) < 0) {
        expected_subject_files.push(file)
      }
    }
  }

  var expected_session_files = []
  var expected_sessions = []
  for (var subjKey in sessions) {
    subject = sessions[subjKey]
    if (expected_subjects.indexOf(subjKey) < 0) {
      expected_subjects.push(subjKey)
    }
      if (expected_sessions.indexOf(sesKey) < 0) {
        expected_sessions.push(sesKey)
      }
      session = subject[sesKey]
      for (var i = 0; i < session.length; i++) {
        file = session[i]
        if (expected_session_files.indexOf(file) < 0) {
          expected_session_files.push(file)
        }
        }
      }
    }
  }

  var fileThatsMissing

  // Missing subject files
  for (var j = 0; j < expected_subjects.length; j++) {
    subject = expected_subjects[j]
    for (
      var set_file = 0;
      set_file < expected_subject_files.length;
      set_file++
    ) {
      if (typeof subjects[subject] !== 'undefined') {
        if (subjects[subject].indexOf(expected_subject_files[set_file]) >= 0) {
          continue
        }
      }
      fileThatsMissing =
        '/' +
        subject +
        expected_subject_files[set_file].replace('<sub>', subject)
      issues.push(
        new Issue({
          file: {
            relativePath: fileThatsMissing,
            webkitRelativePath: fileThatsMissing,
            name: fileThatsMissing.substr(
              fileThatsMissing.lastIndexOf('/') + 1,
            ),
            path: fileThatsMissing,
          },
          reason:
            'This file is missing for subject ' +
            subject +
            ', but is present for at least one other subject.',
          code: 38,
        }),
      )
    }
  }

  // Missing session files
  for (var j = 0; j < expected_subjects.length; j++) {
    subject = expected_subjects[j]
    for (var k = 0; k < expected_sessions.length; k++) {
      session = expected_sessions[k]
      // missing full session directory
      if (typeof sessions[subject][session] === 'undefined') {
        issues.push(
          new Issue({
            file: {
              relativePath: '/' + subject + '/' + session,
            },
            evidence: 'Subject: ' + subject + '; Missing session: ' + session,
            code: 97,
          }),
        )
        continue
      }
      for (
        var set_file = 0;
        set_file < expected_session_files.length;
        set_file++
      ) {
        if (
          sessions[subject][session].indexOf(
            expected_session_files[set_file],
          ) === -1
        ) {
          fileThatsMissing =
            '/' +
            subject +
            '/' +
            session +
            expected_session_files[set_file]
              .replace('<sub>', subject)
              .replace('<ses>', session)

          issues.push(
            new Issue({
              file: {
                relativePath: fileThatsMissing,
                webkitRelativePath: fileThatsMissing,
                name: fileThatsMissing.substr(
                  fileThatsMissing.lastIndexOf('/') + 1,
                ),
                path: fileThatsMissing,
              },
              reason:
                'This file is missing for subject ' +
                subject +
                ', but is present for at least one other subject.',
              code: 38,
            }),
          )
        }
      }
    }
  }
  return issues
}

module.exports = session
