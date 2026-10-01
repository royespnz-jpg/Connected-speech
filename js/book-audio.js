// The book recordings for Session VI and where each line is in them.
//
// The recordings are the publishers' and stay in Google Drive: they are not
// copied into this repository. Each track needs its Drive file ID (from
// listarArchivosDelLibro in google-apps-script/Transcribir.gs, or the file's
// share link); a track without one is not played, and its lines fall back to
// the app's voice.
//
// BOOK_CLIPS maps the spoken text of a line (as the app plays it) to
// [track, start, end] in seconds. The times come from aligning the lines with
// speech recognition of each track, with a little margin at both ends.

export const BOOK_TRACKS = {
  'pp-04': { label: "Pronunciation Plus · Track 04 (Unit 36, Ex. 4)", file: "Track No04.mp3", drive: '' },
  'pp-05': { label: "Pronunciation Plus · Track 05 (Unit 36, Ex. 5)", file: "Track No05.mp3", drive: '' },
  'pp-06': { label: "Pronunciation Plus · Track 06 (Unit 36, Ex. 7)", file: "Track No06.mp3", drive: '' },
  'pp-07': { label: "Pronunciation Plus · Track 07 (Unit 37, Ex. 1)", file: "Track No07.mp3", drive: '' },
  'pp-08': { label: "Pronunciation Plus · Track 08 (Unit 37, Ex. 2)", file: "Track No08.mp3", drive: '' },
  'pp-10': { label: "Pronunciation Plus · Track 10 (Unit 37, Ex. 4)", file: "Track No10.mp3", drive: '' },
  'pairs-10': { label: "Pronunciation Pairs · 10 Useta (used to), Unit 36 E", file: "10_Useta_used_to_Unit_36_E.mp3", drive: '' },
  'pairs-12': { label: "Pronunciation Pairs · 12 Weak the and than, Unit 42 F", file: "12_Weak_Pronunciations_for_the_and_than_Unit_42_F.mp3", drive: '' },
};

export const BOOK_CLIPS = {
  "You know it's Brian's birthday.": ['pp-04', 14.58, 16.71],
  "Oh, I forgot all about it.": ['pp-04', 22.38, 24.42],
  "What about a new umbrella?": ['pp-04', 30.69, 32.49],
  "He should just throw it away.": ['pp-04', 38.97, 40.95],
  "It won't be too expensive.": ['pp-04', 47.07, 49.05],
  "How about Thursday?": ['pp-04', 54.9, 56.52],
  "He has an interview on Friday.": ['pp-04', 62.94, 65.13],
  "Yeah, let's do it Saturday.": ['pp-04', 70.95, 73.2],
  "You arrange the party.": ['pp-04', 79.32, 81.0],
  "It's Brian's birthday on Thursday.": ['pp-05', 13.92, 16.23],
  "We should buy him a present.": ['pp-05', 22.08, 23.94],
  "We really ought to have a party or something for him.": ['pp-05', 29.67, 32.67],
  "Do you have any ideas?": ['pp-05', 39.03, 40.8],
  "If we pay about twenty dollars, we could get him something nice.": ['pp-05', 47.22, 51.18],
  "Why don't we invite a few friends?": ['pp-05', 57.15, 59.37],
  "What about Thursday evening?": ['pp-05', 65.25, 67.2],
  "More people will be free on Saturday.": ['pp-05', 72.96, 75.45],
  "No, I didn't.": ['pp-06', 7.95, 9.21],
  "Hi, Ann!": ['pp-06', 12.78, 13.83],
  "There's no answer.": ['pp-06', 17.43, 18.84],
  "Sunday afternoon.": ['pp-06', 22.38, 24.06],
  "Can I try it?": ['pp-06', 27.69, 28.98],
  "He must be at the office.": ['pp-06', 32.52, 34.41],
  "Go ahead.": ['pp-06', 38.01, 39.06],
  "Did you see it?": ['pp-06', 42.78, 44.01],
  "When can you do it?": ['pp-06', 47.49, 48.9],
  "Hi, how are you?": ['pp-06', 52.44, 53.97],
  "long": ['pp-07', 22.08, 23.19],
  "It's long.": ['pp-07', 23.55, 24.84],
  "along": ['pp-07', 25.47, 26.61],
  "It's along here.": ['pp-07', 26.67, 28.11],
  "way": ['pp-07', 28.8, 29.79],
  "I'm going this way.": ['pp-07', 30.09, 31.47],
  "away": ['pp-07', 32.37, 33.42],
  "I'm going away.": ['pp-07', 33.96, 35.31],
  "Where does she live?": ['pp-08', 13.41, 14.47],
  "Just across the street.": ['pp-08', 14.47, 15.99],
  "Do you think I'm right?": ['pp-08', 22.89, 24.36],
  "Yes, I agree completely.": ['pp-08', 24.6, 26.73],
  "Can't you sleep?": ['pp-08', 33.45, 34.62],
  "No, I've been awake for hours.": ['pp-08', 34.68, 36.96],
  "When did you move here?": ['pp-08', 43.05, 44.7],
  "Two years ago.": ['pp-08', 44.7, 45.96],
  "Don't you get lonely in that big house?": ['pp-08', 52.08, 54.1],
  "No, I like living alone.": ['pp-08', 54.1, 55.89],
  "Is the bank near here?": ['pp-08', 62.1, 63.69],
  "Yes. It's about five minutes away.": ['pp-08', 63.81, 66.36],
  "Can I speak to David?": ['pp-08', 72.6, 74.04],
  "Sorry, he's asleep right now.": ['pp-08', 74.04, 76.08],
  "Have you seen my keys?": ['pp-08', 81.66, 83.37],
  "Yes, they're around here somewhere.": ['pp-08', 83.43, 85.68],
  "Have they found him?": ['pp-10', 16.29, 17.61],
  "Who?": ['pp-10', 20.25, 21.15],
  "The man who robbed your house.": ['pp-10', 23.88, 25.68],
  "Did he tell her what happened?": ['pp-10', 32.01, 33.75],
  "He did, but she didn't believe him.": ['pp-10', 36.39, 38.73],
  "How's Henry these days?": ['pp-10', 45.18, 47.07],
  "Didn't you hear about his heart attack?": ['pp-10', 49.71, 51.9],
  "Did you call him?": ['pp-10', 57.81, 59.1],
  "He wasn't home. He must have left already.": ['pp-10', 61.56, 65.13],
  "It says here that the President's coming.": ['pp-10', 70.68, 73.38],
  "Where's he going to be?": ['pp-10', 75.87, 77.46],
  "Here.": ['pp-10', 79.98, 80.85],
  "Oh, I hope we'll be able to see him.": ['pp-10', 83.43, 86.13],
  "What are you children fighting about?": ['pp-10', 92.25, 94.71],
  "It's MY book.": ['pp-10', 97.5, 99.45],
  "HIS book's over THERE.": ['pp-10', 102.15, 104.64],
  "HER book's over there. This one's mine!": ['pp-10', 107.28, 110.82],
  "used to": ['pairs-10', 8.85, 9.87],
  "He used to play the piano.": ['pairs-10', 11.61, 13.56],
  "Did you use to live in New York?": ['pairs-10', 16.23, 18.36],
  "the one with the zipper": ['pairs-12', 9.15, 10.92],
  "the others": ['pairs-12', 14.67, 16.08],
  "better than the others": ['pairs-12', 17.85, 19.74],
  "Which jacket do you think is better than the others?": ['pairs-12', 22.5, 26.1],
  "I think the one with the belt is better than the others.": ['pairs-12', 30.81, 34.53],
};

export function driveAudioUrl(id) {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
}

// The book clip for a line, or null when there is none or its track has no Drive file yet.
export function bookClip(text) {
  const clip = BOOK_CLIPS[text];
  const track = clip && BOOK_TRACKS[clip[0]];
  if (!track?.drive) return null;
  return { track: clip[0], url: driveAudioUrl(track.drive), start: clip[1], end: clip[2], label: track.label };
}
