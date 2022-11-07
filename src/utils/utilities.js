// utilities functions for various purposes
import moment from "moment";

const timezones = {
  'PST': 480,
  'PDT': 420,
}

export const requirementRejectMap = {
  "Other": "Not published",
  "No image": "No image",
  "Less than 250 words": "Less than 250 words",
  "Headline error": "Headline error",
  "Image source (other)": "Image source error",
  "Severe spelling or grammatical errors": "Spelling and grammatical errors",
  "Summary error (video)": "Summary error",
  "Spam and scams": "Spam and scams",
  "Unsupported languages": "Unsupported languages",
  "Original content": "Original content violation",
  "Sponsored and promotional content": "Sponsored content",
  "Missing attributions": "Missing attributions",
  "Biased content": "Biased content",
  "Vulgar language and profanity": "Vulgar language and profanity",
  "Minor endangerment": "Minor endangerment",
  }

export const policyRejectMap = {
  "Violence and gory content": "Violence and gory content",
  "Dangerous and illegal content": "Dangerous and illegal content",
  "Hateful speech": "Hateful speech",
  "Nudity or sexual content": "Nudity or sexual content",
  "Intellectual property and privacy": "Intellectual property and privacy",
  "Misinformation": "Misinformation",
  "False or misleading content": "False or misleading content"
  }

export const newContenPolicyAndRequirementMap = {
  "Violence and gory content": "Violence and gory content",
  "Dangerous and illegal content": "Dangerous and illegal content",
  "Harassment and hateful content": "Harassment and hateful content",
  "Nudity or sexual content": "Nudity or sexual content",
  "Minor endangerment": "Minor endangerment",
  "Vulgar language and profanity": "Vulgar language and profanity",
  "False or misleading content": "False or misleading content",
  "Biased content": "Biased content",
  "Sponsored and affiliate content": "Sponsored and affiliate content",
  "Spam": "Spam",
  "Intellectual property and privacy": "Intellectual property and privacy",
  "Language and grammatical issues": "Language and grammatical issues",
  "Less than 250 words": "Less than 250 words",
  "Image error": "Image error",
  "Headline error": "Headline error",
  "Incorrect formatting": "Incorrect formatting",
  "Too long or too short (video)": "Video length error",
  "Description error (video)": "Description error",
  "No sound (video)": "Sound issue",
  "Other": "Other",
}

export const editorialStandardsMap = {
  "Accuracy and fact-checking": "Accuracy and facts violation",
  "Fairness": "Fairness violation",
  "Attributions": "Missing attributions",
  "Sources": "Improper sources",
  "Expertise": "Expertise",
  "Labeling": "Labeling",
  "Impartiality": "Impartiality issue",
  "Clickbait": "Clickbait",
  "Fictitious content": "Fiction/satire error",
  "Video production/usage": "Video and/or photo issue",
  "Conflicts of interest": "Conflict of interest",
  "Conflict of interest": "Conflict of interest",
  "Other ES": "Other",
}

export const nativeVideoPolicyMap = {
  'harassment & bullying': 'harassment & bullying',
  'misinformation': 'misinformation',
  'violent or gory content': 'violent or gory content',
  'right to privacy': 'right to privacy',
  'inciting violence': 'inciting violence',
  'promoting activity against fair elections': 'promoting activity against fair elections',
  'hateful behavior': 'hateful behavior',
  'promoting illegal activity or regulated goods': 'promoting illegal activity or regulated goods',
  'potentially infringing another person’s intellectual property': 'potentially infringing another person’s intellectual property',
  'nudity or sexual content': 'nudity or sexual content',
  'promoting suicide, self-harm, eating disorders or drug abuse': 'promoting suicide, self-harm, eating disorders or drug abuse',
  'fraudulent behavior': 'fraudulent behavior',
  'endangering minors': 'endangering minors',
  'violent extremism': 'violent extremism',
}

export const monetizationApplicationMap = {
  '': 0,
  'Not_Applied': 0,
  'Applied': 1,
  'Approved': 2,
  'Not_Applicable': 3,
  'Rejected_Snoozed': 4,
  'Rejected_Indefinitely': -1
}

export const topicAttrs = {
  PUBLIC_SAFETY: { color: 'red', title: 'Safety' },
  CrimePublicsafety: { color: 'red', title: 'Public Safety' },
  HEALTH: { color: 'red', title: 'Health' },
  Health: { color: 'red', title: 'Health' },
  EDUCATION: { color: 'orange', title: 'Education' },
  POLITICS: { color: 'orange', title: 'Politics' },
  PoliticsGovernment: { color: 'orange', title: 'Politics' },
  SOCIETY: { color: 'orange', title: 'Society' },
  Society: { color: 'orange', title: 'Society' },
  JOB: { color: 'orange', title: 'Job' },
  WEATHER: { color: 'green', title: 'Weather' },
  TRANSPORTATION: { color: 'green', title: 'Traffic' },
  TransportationTraffic: { color: 'green', title: 'Traffic' },
  FoodDrink: { color: 'green', title: 'Food & Drink' },
  OTHER: { color: 'green', title: 'Other' },
  SPORTS: { color: 'blue', title: 'Sports' },
  Sports: { color: 'blue', title: 'Sports' },
  BUSINESS: { color: 'blue', title: 'Business' },
  BusinessEconomy: { color: 'blue', title: 'Business' },
  Science: { color: 'blue', title: 'Science' },
  LIFESTYLE: { color: 'purple', title: 'Home & Living' },
  Lifestyle: { color: 'purple', title: 'Home & Living' },
  EVENTS: { color: 'purple', title: 'Events' },
  ArtsEntertainment: { color: 'purple', title: 'Arts & Culture' },
  HomeGarden: { color: 'purple', title: 'Arts & Culture' },
}

export const time2durationSimple = (datetime) => {
  if (!datetime) {
    return 'now'
  }
  const now = moment.utc();
  const time = moment.utc(datetime);
  const d = moment.duration(now.diff(time));
  let timeStr = '';
  if (d.years() > 0) {
    timeStr = time.format('YYYY-MM-DD');
  } else if (d.months() > 0) {
    timeStr = time.format('MM-DD');
  } else if (d.days() > 0) {
    timeStr = `${d.days()}d`;
  } else if (d.hours() > 0) {
    timeStr = `${d.hours()}h`;
  } else if (d.minutes() > 0) {
    timeStr = `${d.minutes()}m`;
  } else {
    timeStr = `now`;
  }
  return timeStr;
}

// return a Date object for a specific timezone that may be different from that of current browser
// if ts is not specified, use current browser local time
export const getDateForTimezone = (tz, ts) => {
  const tzOffset = new Date().getTimezoneOffset() // user local tz offset
  const timestamp = (ts || Date.now()) - (timezones[tz] - tzOffset) * 60000 // modify timestamp with tz offset
  return new Date(timestamp)
}

export const formatNumber = num => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

export const formatStats = n => {
  const num = parseInt(n)
  const numStr = formatNumber(num)
  let ret = { original: numStr }
  if (num >= 1e9) {
    ret.short = parseInt(num / 1e9) + 'B+'
  } else if (num >= 1e6) {
    ret.short = parseInt(num / 1e6) + 'M+'
  } else if (num >= 1e4) {
    ret.short = parseInt(num / 1e3) + 'K+'
  } else {
    ret = { original: '', short: numStr }
  }
  return ret
}

export const handleCopy = (str) => {
  const el = document.createElement('textarea')
  el.value = str
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

export const getDateOffsetDesc = (date, now = Date.now()) => {
  const delta = (now - date.getTime()) / 1000;

  if (delta < 0) {
    return '';
  }

  if (delta < 60) {
    return 'Just Now';
  } else if (delta < 60 * 2) {
    return '1 MINUTE AGO';
  } else if (delta < 3600) {
    const n = Math.floor(delta / 60);

    return `${n} MINUTES AGO`;
  } else if (delta < 3600 * 2) {
    return '1 HOUR AGO';
  } else if (delta < 3600 * 24) {
    const n = Math.floor(delta / 3600);

    return `${n} HOURS AGO`;
  } else if (delta < 3600 * 24 * 2) {
    return '1 DAY AGO';
  } else {
    const n = Math.floor(delta / (3600 * 24));

    return `${n} DAYS AGO`;
  }
};
