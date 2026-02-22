/**
 * AuthScreen Component
 * Simple OTP-based phone authentication
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Shield, ArrowRight, CheckCircle, Loader2, Sparkles, User, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

interface AuthScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

type AuthStep = 'phone' | 'otp' | 'name';

export default function AuthScreen({ onNavigate, onBack }: AuthScreenProps) {
  const { loginWithOtp, isLoading } = useApp();
  
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      return digits.replace(/(\d{5})(\d{0,5})/, '$1 $2').trim();
    }
    return digits.slice(0, 10).replace(/(\d{5})(\d{5})/, '$1 $2');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    // For demo: simulate OTP sending
    setCountdown(30);
    setStep('otp');
    setError('');
    
    // Focus first OTP input
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when complete
    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }
    
    // For demo: any 6-digit OTP works, check if 123456 means new user
    if (code === '123456') {
      setIsNewUser(true);
      setStep('name');
    } else {
      // Existing user - login directly
      const result = await loginWithOtp(phone.replace(/\D/g, ''), code, '');
      if (result.success) {
        onNavigate('HOME');
      } else {
        setError(result.message);
      }
    }
  };

  const handleCompleteName = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    const result = await loginWithOtp(phone.replace(/\D/g, ''), otp.join(''), name.trim());
    if (result.success) {
      onNavigate('HOME');
    } else {
      setError(result.message);
    }
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    setCountdown(30);
    setOtp(['', '', '', '', '', '']);
    otpRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950">
      <Header showBack onBack={onBack} showLang={false} />

      <main className="flex-1 px-4 pt-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30"
            >
              {step === 'phone' && <Phone className="w-10 h-10 text-white" />}
              {step === 'otp' && <Shield className="w-10 h-10 text-white" />}
              {step === 'name' && <User className="w-10 h-10 text-white" />}
            </motion.div>
            
            <motion.h2 
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {step === 'phone' && 'Welcome to JAAGRUK'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'name' && 'Almost There!'}
            </motion.h2>
            
            <motion.p 
              key={`desc-${step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-400 mt-2"
            >
              {step === 'phone' && 'Enter your phone number to continue'}
              {step === 'otp' && `Enter the 6-digit code sent to +91 ${phone}`}
              {step === 'name' && 'Tell us your name to complete registration'}
            </motion.p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phone Step */}
          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500">
                      <span className="text-lg">🇮🇳</span>
                      <span className="font-medium">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="98765 43210"
                      className="w-full pl-24 pr-4 py-4 text-lg font-medium rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all placeholder:text-gray-400"
                      maxLength={11}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendOtp}
                  disabled={isLoading || phone.replace(/\D/g, '').length !== 10}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-purple-500/40"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Get OTP
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </motion.div>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                      maxLength={1}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVerifyOtp()}
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-purple-500/40"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Verify OTP
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={countdown > 0}
                    className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                  >
                    <RefreshCw className={`w-4 h-4 ${countdown > 0 ? '' : 'animate-spin-slow'}`} />
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>

                <button
                  onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); }}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Change phone number
                </button>
              </motion.div>
            )}

            {/* Name Step (for new users) */}
            {step === 'name' && (
              <motion.div
                key="name-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 dark:text-green-300 font-medium">Phone verified successfully!</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCompleteName}
                  disabled={isLoading || !name.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-purple-500/40"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Complete Registration
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Demo Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
          >
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              <strong>Demo Mode:</strong> Use OTP <span className="font-mono bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">123456</span> for new user, or any 6 digits for existing user
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
