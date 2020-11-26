let resourcesEn = {
  exp: 'How was your experience?',
  snf: 'Suggestions & Feedback',
  submit: 'Submit',
  submitFeedback: 'Submit Feedback',
  audPlaying: 'Audio is playing!!',
  feedSubmitted: 'Your Feedback Submitted Successfully!!',
  unsatisfied: 'Un Satisfied with our services?',
  satisfied: 'Satisfied with our services?',
  ok: "I'm Ok",
  sad: 'Un Satisfied',
  providefeed: 'Provide Your Feedback',
  happy: 'Satisfied',
  StopRecording: 'Stop Recording',
  ReRecord: 'Re-Record',
  startRecord: 'Start Recording',
  Play: '  Play  ',
  Fback: 'Please enter your feedback',
  EnterFBack: 'Enter your feedback...',
}

let resourcesAr = {
    exp: 'كيف كانت تجربتك؟',
    snf: 'الاقتراحات والتعليقات',
    submit: 'إرسال',
    submitFeedback: 'إرسال ملاحظات',
    audPlaying: 'يتم تشغيل الصوت !!',
    feedSubmitted: 'تم إرسال ملاحظاتك بنجاح !!',
    unsatisfied: 'غير راضٍ عن خدماتنا؟',
    satisfied: 'راضي عن خدماتنا؟',
    ok: "أنا بخير",
    sad: 'غير راضي',
    providefeed: 'قدم ملاحظاتك',
    happy: 'راض',
    StopRecording: 'إيقاف التسجيل',
    ReRecord: 'إعادة التسجيل',
    startRecord: 'ابدأ التسجيل',
    Play: '  لعب  ',
    Fback: 'الرجاء إدخال ملاحظاتك',
    EnterFBack: 'أدخل ملاحظاتك ...',
}

function resolve (labelId, lang = 'en-US') {
  switch (lang) {
    case 'en-US':
      return resourcesEn[labelId]
    case 'ar-EG':
      return resourcesAr[labelId]
    default:
      return resourcesEn[labelId]
  }
}
exports.resolve = resolve
