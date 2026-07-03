const authErrors = {
  'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'Email/password sign-in is not enabled. Contact support.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
  'auth/internal-error': 'An internal error occurred. Please try again.',
  'permission-denied': 'Access denied. Please check your account permissions.',
}

export function getFirebaseErrorMessage(error) {
  const code = error?.code || error?.message || ''
  return authErrors[code] || code
}
