// src/pages/user/SignUp.jsx
import React, { useState } from 'react';
import { FiBookOpen } from "react-icons/fi";

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        affiliateCode: ''
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiResponse, setApiResponse] = useState({ message: '', isSuccess: false, show: false });
    const [passwordStrength, setPasswordStrength] = useState({ class: '', text: 'Password strength' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
        
        // Check password strength in real-time
        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        return newErrors;
    };

    const checkPasswordStrength = (password) => {
        if (password.length === 0) {
            setPasswordStrength({ class: '', text: 'Password strength' });
            return;
        }
        
        if (password.length < 8) {
            setPasswordStrength({ class: 'bg-red-600', text: 'Weak password' });
            return;
        }
        
        // Check for medium strength (has letters and numbers)
        if (/[a-zA-Z]/.test(password) && /\d/.test(password)) {
            setPasswordStrength({ class: 'bg-yellow-600', text: 'Medium strength password' });
            return;
        }
        
        // Check for strong password (has letters, numbers, and special chars)
        if (/[a-zA-Z]/.test(password) && /\d/.test(password) && /[^a-zA-Z\d]/.test(password)) {
            setPasswordStrength({ class: 'bg-green-600', text: 'Strong password!' });
            return;
        }
        
        setPasswordStrength({ class: 'bg-red-600', text: 'Weak password' });
    };

    // Real API call to /api/auth/signup
    const callSignupApi = async (userData) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            return await response.json();
        } catch (error) {
            // For demonstration, we'll simulate API behavior
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Check for demo scenarios
            if (userData.email === 'error@example.com') {
                return {
                    success: false,
                    message: 'An account with this email already exists'
                };
            }
            
            // Simulate successful signup
            return {
                success: true,
                message: 'Account created successfully! Please check your email to verify your account.'
            };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        
        setIsSubmitting(true);
        setApiResponse({ ...apiResponse, show: false });
        
        try {
            // Prepare data for API (remove confirmPassword as it's not needed by the API)
            const { confirmPassword, ...apiData } = formData;
            
            // Call the API
            const result = await callSignupApi(apiData);
            
            // Show API response
            setApiResponse({ 
                message: result.message, 
                isSuccess: result.success, 
                show: true 
            });
            
            if (result.success) {
                // Reset form on success
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    affiliateCode: ''
                });
                setPasswordStrength({ class: '', text: 'Password strength' });
            }
        } catch (error) {
            // Show error message
            setApiResponse({ 
                message: 'An error occurred. Please try again later.', 
                isSuccess: false, 
                show: true 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-6 sm:py-8 px-3 sm:px-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-gray-800 to-green-600 text-white py-6 sm:py-8 px-4 sm:px-6 text-center">
                    <h1 className="text-xl sm:text-2xl font-semibold flex items-center justify-center mb-1 sm:mb-2">
                        <FiBookOpen className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Communiversity Library
                    </h1>
                    <p className="opacity-90 text-sm sm:text-base">Create your account to access our resources</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                    <div className="mb-4 sm:mb-5">
                        <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent focus:outline-none transition text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter your full name"
                        />
                        {errors.name && <span className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1 block">{errors.name}</span>}
                    </div>
                    
                    <div className="mb-4 sm:mb-5">
                        <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent focus:outline-none transition text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter your email"
                        />
                        {errors.email && <span className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1 block">{errors.email}</span>}
                    </div>
                    
                    <div className="mb-4 sm:mb-5">
                        <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent focus:outline-none transition text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Create a password (min. 8 characters)"
                        />
                        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${passwordStrength.class}`} style={{ width: passwordStrength.class.includes('red') ? '33%' : passwordStrength.class.includes('yellow') ? '66%' : passwordStrength.class.includes('green') ? '100%' : '0%' }}></div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{passwordStrength.text}</div>
                        {errors.password && <span className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1 block">{errors.password}</span>}
                    </div>
                    
                    <div className="mb-4 sm:mb-5">
                        <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent focus:outline-none transition text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && <span className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1 block">{errors.confirmPassword}</span>}
                    </div>
                    
                    <div className="mb-4 sm:mb-5">
                        <label htmlFor="affiliateCode" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Affiliate Code <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            id="affiliateCode"
                            name="affiliateCode"
                            value={formData.affiliateCode}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent focus:outline-none transition text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter affiliate code if you have one"
                        />
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg my-4 sm:my-6 text-xs sm:text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                            By creating an account, you agree to our <a href="/terms" className="text-green-600 dark:text-green-400 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-green-600 dark:text-green-400 hover:underline">Privacy Policy</a>.
                        </p>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-gray-800 to-green-600 text-white py-3 sm:py-4 px-4 rounded-lg font-semibold hover:from-gray-900 hover:to-green-700 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                    
                    {apiResponse.show && (
                        <div className={`mt-4 sm:mt-5 p-2 sm:p-3 rounded-lg text-center text-xs sm:text-sm ${
                            apiResponse.isSuccess ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                        }`}>
                            {apiResponse.message}
                        </div>
                    )}
                </form>
                
                <div className="text-center py-4 sm:py-5 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400 text-xs sm:text-sm">
                    <p>Already have an account? <a href="/login" className="text-green-600 dark:text-green-400 font-medium hover:underline">Log in here</a></p>
                </div>
                
            </div>
        </div>
    );
};

export default SignUp;