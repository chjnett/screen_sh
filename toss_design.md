import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, XCircle } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Toss Dark Mode Colors
  const colors = {
    primary: '#3182F6', // Toss Blue
    primaryDark: '#1B64DA', // Darker Blue for hover
    textMain: '#FFFFFF', // White
    textSub: '#B0B8C1', // Light Grey
    border: '#333D4B', // Dark Border for card
    inputBorder: 'transparent', // Default input border
    inputBg: '#2B303B', // Input Box Background (Dark Grey)
    inputBgFocus: '#252A33', // Slightly darker when focused
    background: '#101217', // Very Dark BG
    cardBg: '#202632', // Dark Card BG
    disabled: '#333D4B', // Disabled Button
    disabledText: '#6B7684' // Disabled Text
  };

  useEffect(() => {
    setIsFormValid(formData.id.length > 0 && formData.password.length > 0);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearField = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      alert('로그인을 시도합니다.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center font-sans transition-colors duration-300" 
      style={{ backgroundColor: colors.background }}
    >
      {/* Card Container */}
      <div 
        className="w-full max-w-[480px] min-h-screen sm:min-h-[calc(100vh-40px)] sm:rounded-[24px] shadow-2xl flex flex-col relative overflow-hidden transition-all duration-300"
        style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
      >
        
        {/* Header Area */}
        <header className="px-6 pt-12 pb-8">
          <div className="w-24 mb-6">
            <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M33.4 30C33.4 43.2 26.8 52.6 16.7 52.6C6.6 52.6 0 43.2 0 30C0 16.8 6.6 7.4 16.7 7.4C26.8 7.4 33.4 16.8 33.4 30Z" fill={colors.textSub} opacity="0.3"/>
               <path d="M52.4 30C52.4 43.2 45.8 52.6 35.7 52.6C25.6 52.6 19 43.2 19 30C19 16.8 25.6 7.4 35.7 7.4C45.8 7.4 52.4 16.8 52.4 30Z" fill={colors.primary}/>
               <text x="65" y="42" fill={colors.textMain} fontSize="38" fontWeight="bold" fontFamily="sans-serif">toss</text>
            </svg>
          </div>
          <h1 className="text-[26px] font-bold leading-tight" style={{ color: colors.textMain }}>
            안녕하세요<br />
            토스입니다.
          </h1>
        </header>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="flex-1 px-6 flex flex-col">
          
          <div className="space-y-5">
            {/* ID Input Box */}
            <div className="flex flex-col gap-2">
              <label 
                className="text-[13px] font-medium transition-colors duration-200 ml-1"
                style={{ color: focusedField === 'id' ? colors.primary : colors.textSub }}
              >
                아이디 (전화번호)
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('id')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="아이디를 입력해주세요"
                  className="w-full h-[56px] px-4 rounded-[16px] text-[16px] font-medium outline-none transition-all duration-200 placeholder-gray-500 border-2"
                  style={{ 
                    backgroundColor: focusedField === 'id' ? colors.inputBgFocus : colors.inputBg,
                    borderColor: focusedField === 'id' ? colors.primary : 'transparent',
                    color: colors.textMain,
                    caretColor: colors.primary
                  }}
                />
                {formData.id && (
                  <button
                    type="button"
                    onClick={() => clearField('id')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <XCircle size={20} fill={colors.border} color={colors.textSub} />
                  </button>
                )}
              </div>
            </div>

            {/* Password Input Box */}
            <div className="flex flex-col gap-2">
              <label 
                className="text-[13px] font-medium transition-colors duration-200 ml-1"
                style={{ color: focusedField === 'password' ? colors.primary : colors.textSub }}
              >
                비밀번호
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="비밀번호를 입력해주세요"
                  className="w-full h-[56px] px-4 rounded-[16px] text-[16px] font-medium outline-none transition-all duration-200 placeholder-gray-500 border-2"
                  style={{ 
                    backgroundColor: focusedField === 'password' ? colors.inputBgFocus : colors.inputBg,
                    borderColor: focusedField === 'password' ? colors.primary : 'transparent',
                    color: colors.textMain,
                    caretColor: colors.primary,
                    paddingRight: '5rem' // Extra padding for icons
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  {formData.password && (
                    <button
                      type="button"
                      onClick={() => clearField('password')}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <XCircle size={20} fill={colors.border} color={colors.textSub} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center justify-center p-1 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={22} color={colors.textSub} /> : <Eye size={22} color={colors.textSub} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Links */}
          <div className="flex justify-center items-center gap-4 py-6 text-[14px]" style={{ color: colors.textSub }}>
            <button type="button" className="hover:text-white transition-colors">아이디 찾기</button>
            <div className="w-[1px] h-3 bg-gray-700"></div>
            <button type="button" className="hover:text-white transition-colors">비밀번호 찾기</button>
            <div className="w-[1px] h-3 bg-gray-700"></div>
            <button type="button" className="hover:text-white transition-colors">회원가입</button>
          </div>

          {/* Submit Button */}
          <div className="relative w-full mb-6">
            <div 
              className={`absolute inset-0 rounded-[16px] transition-opacity duration-300 blur-md ${isButtonHovered && isFormValid ? 'opacity-60' : 'opacity-0'}`}
              style={{ backgroundColor: colors.primary }}
            ></div>
            
            <button
              type="submit"
              disabled={!isFormValid}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              className="relative w-full h-[56px] rounded-[16px] text-[16px] font-bold text-white transition-all duration-300 flex items-center justify-center active:scale-[0.98]"
              style={{ 
                backgroundColor: isFormValid ? colors.primary : colors.disabled,
                color: isFormValid ? '#FFFFFF' : colors.disabledText,
                cursor: isFormValid ? 'pointer' : 'default',
                transform: isButtonHovered && isFormValid ? 'translateY(-1px)' : 'none',
                boxShadow: isButtonHovered && isFormValid ? `0 4px 20px ${colors.primary}40` : 'none'
              }}
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}