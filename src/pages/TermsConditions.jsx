import React from 'react';

export default function TermsConditions() {
  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy">Terms & Conditions</h1>
      <div className="prose prose-slate text-sm sm:text-base leading-relaxed space-y-6 text-slate-700">
        <p>
          Welcome to the official website of <strong>Smile & Dental Clinic</strong>. By accessing this website or scheduling an appointment, you agree to comply with and be bound by the following terms.
        </p>
        <h3 className="font-heading font-bold text-lg text-navy">1. Medical Information Disclaimer</h3>
        <p>
          Information provided on this website regarding dental procedures (such as root canal treatments, laser surgery, and crowns) is intended for educational purposes and does not constitute a guaranteed clinical diagnosis. A personal physical consultation with Dr. Ananyo Mandal is necessary before treatment plans are finalized.
        </p>
        <h3 className="font-heading font-bold text-lg text-navy">2. Appointments & Scheduling</h3>
        <p>
          Patients may request their preferred exact appointment time within clinic operating hours (10:30 AM – 2:00 PM and 5:00 PM – 9:00 PM). Appointments remain provisional until formally accepted by Dr. Ananyo Mandal or clinic staff. Emergency dental procedures may occasionally cause slight schedule delays.
        </p>
        <h3 className="font-heading font-bold text-lg text-navy">3. Cancellation & Rescheduling</h3>
        <p>
          If you are unable to attend your scheduled appointment, please notify the clinic at least 2 hours in advance via telephone at <strong>9903424407</strong>.
        </p>
      </div>
    </div>
  );
}
