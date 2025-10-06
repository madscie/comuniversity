import React, { useState } from 'react';
import { FiBookOpen } from "react-icons/fi";

const SignUp = () => {
    const [formData, setFormData] = useState({
        firstName: '',      // Changed from 'name'
        lastName: '',       // Added lastName field
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
        
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
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

    // REAL API call to your backend
    const callSignupApi = async (userData) => {
        try {
            console.log('📤 Sending registration data:', userData);
            
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    password: userData.password,
                    affiliateCode: userData.affiliateCode || null
                }),
            });
            
            const result = await response.json();
            
            console.log('🔍 API Response:', {
                status: response.status,
                data: result
            });
            
            if (!response.ok) {
                if (response.status === 500) {
                    throw new Error(result.message || 'Server error during registration. Check backend console.');
                }
                throw new Error(result.message || `Registration failed with status: ${response.status}`);
            }
            
            return result;
        } catch (error) {
            console.error('💥 Signup error:', error);
            throw error;
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
            
            // Call the REAL API
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
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    affiliateCode: ''
                });
                setPasswordStrength({ class: '', text: 'Password strength' });
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }
        } catch (error) {
            // Show error message
            setApiResponse({ 
                message: error.message || 'An error occurred. Please try again later.', 
                isSuccess: false, 
                show: true 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 to-purple-400 py-8 px-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-blue-800 text-white py-8 px-6 text-center">
                    <h1 className="text-2xl font-semibold flex items-center justify-center mb-2">
                        <FiBookOpen className="mr-2" /> Communiversity Library
                    </h1>
                    <p className="opacity-90">Create your account to access our resources</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition ${
                                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="First name"
                            />
                            {errors.firstName && <span className="text-red-600 text-sm mt-1 block">{errors.firstName}</span>}
                        </div>
                        
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition ${
                                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Last name"
                            />
                            {errors.lastName && <span className="text-red-600 text-sm mt-1 block">{errors.lastName}</span>}
                        </div>
                    </div>
                    
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your email"
                        />
                        {errors.email && <span className="text-red-600 text-sm mt-1 block">{errors.email}</span>}
                    </div>
                    
                    <div className="mb-5">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition ${
                                errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Create a password (min. 8 characters)"
                        />
                        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${passwordStrength.class}`} style={{ width: passwordStrength.class.includes('red') ? '33%' : passwordStrength.class.includes('yellow') ? '66%' : passwordStrength.class.includes('green') ? '100%' : '0%' }}></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{passwordStrength.text}</div>
                        {errors.password && <span className="text-red-600 text-sm mt-1 block">{errors.password}</span>}
                    </div>
                    
                    <div className="mb-5">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition ${
                                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && <span className="text-red-600 text-sm mt-1 block">{errors.confirmPassword}</span>}
                    </div>
                    
                    <div className="mb-5">
                        <label htmlFor="affiliateCode" className="block text-sm font-medium text-gray-700 mb-1">
                            Affiliate Code <span className="text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            id="affiliateCode"
                            name="affiliateCode"
                            value={formData.affiliateCode}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                            placeholder="Enter affiliate code if you have one"
                        />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg my-6 text-sm">
                        <p className="text-gray-700">
                            By creating an account, you agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
                        </p>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                    
                    {apiResponse.show && (
                        <div className={`mt-5 p-3 rounded-lg text-center text-sm ${
                            apiResponse.isSuccess ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                            {apiResponse.message}
                        </div>
                    )}
                </form>
                
                <div className="text-center py-5 border-t border-gray-200 text-gray-700">
                    <p>Already have an account? <a href="/login" className="text-blue-600 font-medium hover:underline">Log in here</a></p>
                </div>
                
            </div>
        </div>
    );
};

export default SignUp;