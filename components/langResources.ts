let resourcesEn = {
  exp: 'How was your experience?',
  snf: 'Suggestions & Feedback',
  submit: 'Submit',
  submitFeedback: 'Submit Feedback',
  audPlaying: 'Audio is playing',
  feedSubmitted: 'Your feedback is submitted successfully. Thank you.',
  unsatisfied: 'Unsatisfied with our services?',
  satisfied: 'Satisfied with our services?',
  ok: "I'm Ok",
  sad: 'Unsatisfied',
  providefeed: 'Provide Your Feedback',
  happy: 'Satisfied',
  StopRecording: 'Stop Recording',
  ReRecord: 'Re-Record',
  startRecord: 'Start Recording',
  Play: '  Play  ',
  Fback: 'Please enter your feedback',
  EnterFBack: 'Enter your feedback...',
  yes: 'Yes',
  no: 'No',
  SecVide: 'Video must be at least 5 seconds long',
  SecAud: 'Audio clip must be more than 5 seconds',
  PRA: 'Please record your audio',
  PRV: 'Please record your video first',
  EUV: 'Error in uploading video',
  HNR: 'Press and hold the below button to record your feedback in',
  HNRV: 'Press below button to record your feedback in',
  HNP: 'Tap the below button to play the audio',
  secRem: 'seconds remaining',
  AR: 'Arabic',
  ERECA: 'Error in uploading audio, please try again',
  CRemain: 'characters remaining',
  feedSubmittedErr: 'Error in Submitting Feedback',
  alert: '',
  PWT: 'Please wait...',
  English: 'English',
  Urdu: 'Urdu',
  Lang: 'Langauge',
};

let resourcesAr = {
  exp: 'كيف كانت تجربتك',
  snf: 'الإقتراحات و الملاحظات',
  submit: 'إرسال',
  submitFeedback: 'إرسال الملاحظات',
  audPlaying: 'جاري تشغيل التسجيل الصوتي',
  feedSubmitted: 'تم إرسال ملاحظاتك بنجاح، شكراً لكم.',
  unsatisfied: 'غير راضي عن خدماتنا؟',
  satisfied: 'هل أنت راضي عن خدماتنا ؟',
  ok: 'عادي',
  sad: 'غير راضي',
  providefeed: 'يرجى تزويدنا بملاحظاتك',
  happy: 'راضي',
  StopRecording: 'إيقاف التسجيل',
  ReRecord: 'تسجيل مرة أخرى',
  startRecord: 'إبدأ التسجيل',
  Play: 'تشغيل',
  Fback: 'الرجاء إدخال ملاحظاتك',
  EnterFBack: 'إدخال ملاحظاتك',
  EUV: 'خطأ في التحميل، يرجى المحاولة مرة أخرى',
  yes: 'نعم',
  no: ' لا ',
  SecVide: 'يجب أن لا تقل مدة التسجيل عن 5 ثواني',
  SecAud: 'يجب أن لا تقل مدة التسجيل عن 5 ثواني',
  PRA: 'يرجى تزودينا بملاحظاتك عن طريق التسجيل الصوتي',
  PRV: 'يرجى تزويدنا بملاحظاتك أولاً عن طريق تسجيل الفيديو ',
  HNR: 'قم بالضغط باستمرار على الزر أدناه لتسجيل صوتك باللغة',
  secRem: 'ثانية متبقية ',
  AR: 'العربية',
  ERECA: 'خطأ في التحميل، يرجى المحاولة مرة أخرى',
  CRemain: 'حرف متبقي',
  feedSubmittedErr: 'خطأ في التحميل، يرجى المحاولة مرة أخرى',
  PWT: 'يرجى الإنتظار',
  English: 'الإنجليزية',
  Urdu: 'أردو',
  HNRV: 'إضغط على الزر أدناه لتسجيل ملاحظاتك باللغة',
  Lang:'لغة'
};

function resolve(labelId, lang = 'en-US') {
  switch (lang) {
    case 'en-US':
      return resourcesEn[labelId];
    case 'ar-EG':
      return resourcesAr[labelId];
    default:
      return resourcesEn[labelId];
  }
}
exports.resolve = resolve;
