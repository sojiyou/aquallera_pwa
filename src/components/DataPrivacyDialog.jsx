export default function DataPrivacyDialog({ onContinue }) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo-no-name.png" alt="Aquallera" className="w-16 h-16 object-contain mb-2" />
          <h1 className="text-midnight-blue font-bold text-xl">Data Privacy Notice</h1>
        </div>

        <section className="mb-5">
          <h2 className="font-bold text-midnight-blue text-base mb-1">1. Information We Collect</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            When you create an account and use Aquallera, we collect the following personal information:
            your full name, email address, phone number, delivery address and location data (when you
            place a delivery order), and your order history including water type preferences, quantities,
            and payment method. This information is necessary to provide and fulfill our services to you.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="font-bold text-midnight-blue text-base mb-1">2. How We Use Your Information</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We use your information solely to process and fulfill your water orders, send you order
            confirmations and status updates, communicate with you about account-related matters,
            provide customer support, and improve our services. We do not sell, rent, or share your
            personal information with third parties for marketing purposes. Your data is used only
            within the Aquallera platform to deliver the services you request.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="font-bold text-midnight-blue text-base mb-1">3. Data Storage and Security</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your data is stored securely in Firebase Realtime Database, which employs encryption
            in transit (HTTPS) and at rest. Access to your data is restricted to authenticated users
            and authorized administrators. We implement reasonable security measures to protect your
            personal information from unauthorized access, alteration, or disclosure.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="font-bold text-midnight-blue text-base mb-1">4. Account Deletion</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            When you delete your account through the app, all your personal data including your
            name, email address, phone number, and delivery addresses are permanently removed from
            our database. To delete your account, all your orders must first be completed or
            cancelled. Your Firebase Authentication account is also deleted. This action
            is irreversible and cannot be undone. You will need to create a new account if you wish
            to use Aquallera again.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="font-bold text-midnight-blue text-base mb-1">5. Your Rights</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            You have the right to access your personal data at any time through your profile page.
            You may update or correct your information using the edit profile feature. You may
            delete your account and all associated data at any time. If you have any questions or
            concerns about your data, you may contact us using the information below.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="font-bold text-midnight-blue text-base mb-1">6. Contact Us</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you have any questions about this privacy notice or how we handle your data, please
            contact us at <span className="font-medium text-midnight-blue">sojodecaran200@gmail.com</span>.
          </p>
        </section>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onContinue}
          className="btn-primary w-full py-3 text-base"
        >
          Continue
        </button>
      </div>
    </div>
  )
}